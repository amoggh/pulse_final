from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from . import models
from .auth import get_password_hash


def seed_all(db: Session):
    # upsert hospital
    hospital = db.query(models.Hospital).filter(models.Hospital.name == "PulseCare Mumbai").first()
    if not hospital:
        hospital = models.Hospital(name="PulseCare Mumbai", city="Mumbai", state="MH")
        db.add(hospital)
        db.commit()
        db.refresh(hospital)

    # departments
    dept_names = ["ER", "ICU", "OPD"]
    departments = {}
    for name in dept_names:
        d = db.query(models.Department).filter(models.Department.hospital_id == hospital.id, models.Department.name == name).first()
        if not d:
            d = models.Department(hospital_id=hospital.id, name=name)
            db.add(d)
            db.commit()
            db.refresh(d)
        departments[name] = d

    # user
    user = db.query(models.User).filter(models.User.email == "ops@pulsecare.local").first()
    if not user:
        user = models.User(
            hospital_id=hospital.id,
            role="ops-manager",
            email="ops@pulsecare.local",
            password_hash=get_password_hash("password"),
        )
        db.add(user)
        db.commit()

    # synthetic inflow 18 months daily
    end = datetime.utcnow().date()
    start = end - timedelta(days=18 * 30)
    ts = start
    random.seed(42)
    while ts <= end + timedelta(days=14):
        for name, dept in departments.items():
            base = 50 if name == "ER" else 30 if name == "OPD" else 20
            dow = ts.weekday()
            weekend = 1.2 if dow >= 5 else 1.0
            season = 1.0
            # festival spikes: simple dates around Diwali (approx Nov 7), Holi (Mar 8)
            day_of_year = ts.timetuple().tm_yday
            if abs(day_of_year - 311) <= 3 or abs(day_of_year - 68) <= 3:
                season = 1.4
            aqi = random.randint(80, 350)
            pollution_boost = 1.0 + (0.2 if (aqi > 250 and name in ["ER", "ICU"]) else 0.0)
            noise = random.uniform(0.8, 1.2)
            count = int(base * weekend * season * pollution_boost * noise)
            db.add(models.PatientInflow(ts=datetime.combine(ts, datetime.min.time()), hospital_id=hospital.id, department_id=dept.id, count=count))
            if name == "ER":
                db.add(
                    models.ContextSignals(
                        ts=datetime.combine(ts, datetime.min.time()),
                        hospital_id=hospital.id,
                        aqi=aqi,
                        festival_flag=1 if season > 1.0 else 0,
                        epidemic_tag="flu" if random.random() < 0.05 else "",
                        weather_json={},
                    )
                )
        # resources snapshot daily
        beds_total = 200
        icu_total = 40
        beds_occupied = random.randint(100, 180)
        icu_occupied = random.randint(20, 35)
        staff_on_shift = random.randint(40, 70)
        db.add(
            models.ResourceSnapshot(
                ts=datetime.combine(ts, datetime.min.time()),
                hospital_id=hospital.id,
                beds_total=beds_total,
                beds_occupied=beds_occupied,
                icu_total=icu_total,
                icu_occupied=icu_occupied,
                staff_on_shift=staff_on_shift,
                supplies_json={"nebulizer": 50, "saline": 200, "ppe": 150},
            )
        )
        ts += timedelta(days=1)
    db.commit()

    # documents
    if db.query(models.Document).count() == 0:
        docs = [
            ("Nebulizer SOP", "Step 1: Prepare nebulizer...\nStep 2: Dosage..."),
            ("ER Roster Policy", "Shift schedule guidelines for ER staff..."),
            ("Vendor SLAs", "Nebulizer cartridges lead time: 3 days..."),
        ]
        for title, content in docs:
            db.add(models.Document(hospital_id=hospital.id, title=title, content=content, embedding="[]"))
        db.commit()


