import os
import time
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from tenacity import retry, wait_fixed
from dotenv import load_dotenv

# Use API models directly (shared volume)
from app.app.config import settings  # type: ignore
from app.app import models  # type: ignore
from app.app.shortage import compute_shortage  # type: ignore
from app.app.forecast import predict_next_7_days  # type: ignore
from app.app.notifications import send_email  # type: ignore


engine = create_engine(settings.DATABASE_URL, future=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, future=True)


def run_agent_once():
    db = SessionLocal()
    try:
        hospitals = db.query(models.Hospital).all()
        for h in hospitals:
            departments = db.query(models.Department).filter(models.Department.hospital_id == h.id).all()
            latest_load = (
                db.query(models.ResourceSnapshot)
                .filter(models.ResourceSnapshot.hospital_id == h.id)
                .order_by(models.ResourceSnapshot.ts.desc())
                .first()
            )
            for d in departments:
                preds = predict_next_7_days(db, h.id, d.id)
                for horizon_date, pred, lo, hi in preds[:1]:
                    beds_avail = (latest_load.beds_total - latest_load.beds_occupied) if latest_load else 100
                    staff_on_shift = latest_load.staff_on_shift if latest_load else 50
                    beds_gap, staff_gap, supply_gaps, severity = compute_shortage(pred, beds_avail, staff_on_shift)
                    if severity in ["MEDIUM", "HIGH"]:
                        title = f"{severity} {d.name} Surge Expected – {horizon_date.date().isoformat()}"
                        message = f"Pred inflow {pred:.0f} (CI {lo:.0f}-{hi:.0f}). Beds gap {beds_gap:.1f}, Staff gap {staff_gap:.1f}."
                        action = {
                            "recommendations": [
                                {"type": "roster", "dept": d.name, "delta_doctors": 2 if severity == "HIGH" else 1, "window": "peak 18:00-22:00"},
                                {"type": "purchase_draft", "items": [{"name": "nebulizer", "qty": 30}]},
                            ]
                        }
                        alert = models.Alert(
                            hospital_id=h.id,
                            severity=severity,
                            title=title,
                            message=message,
                            action_json=action,
                            status="open",
                            ts=datetime.utcnow(),
                        )
                        db.add(alert)
            db.commit()
            # simple email fanout to ops manager example inbox
            try:
                send_email(
                    subject=f"[PULSE][{severity}] {d.name} Surge Expected – {horizon_date.date().isoformat()}",
                    body=message,
                    to_addrs=["ops@pulsecare.local"],
                )
            except Exception as e:
                print("Email send failed:", e)
    finally:
        db.close()


def main():
    while True:
        run_agent_once()
        time.sleep(3600)


if __name__ == "__main__":
    main()


