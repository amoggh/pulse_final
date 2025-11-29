from sqlalchemy.orm import Session
from app.models.system_status import SystemStatus
from app.models.alerts import Alert
from datetime import datetime

def get_system_status(db: Session):
    status = db.query(SystemStatus).filter(SystemStatus.id == 1).first()
    if not status:
        status = SystemStatus(id=1, global_risk_level="Low")
        db.add(status)
        db.commit()
        db.refresh(status)
    return status

def update_system_status(db: Session, risk_level: str = None, last_forecast: datetime = None, last_decision: datetime = None):
    status = get_system_status(db)
    if risk_level:
        status.global_risk_level = risk_level
    if last_forecast:
        status.last_forecast_run = last_forecast
    if last_decision:
        status.last_decision_run = last_decision
    db.commit()
    db.refresh(status)
    return status

def get_active_alerts_count(db: Session):
    alerts = db.query(Alert).filter(Alert.resolved == False).all()
    counts = {"Low": 0, "Moderate": 0, "High": 0, "Critical": 0}
    for alert in alerts:
        if alert.level in counts:
            counts[alert.level] += 1
    return counts
