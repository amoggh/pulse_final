from sqlalchemy.orm import Session
from app.models.alerts import Alert
from datetime import datetime
from typing import List, Dict, Any

def create_alert(db: Session, level: str, category: str, message: str, details: Dict[str, Any]):
    # Check if similar active alert exists to avoid spam? For now just create.
    db_alert = Alert(
        created_at=datetime.utcnow(),
        level=level,
        category=category,
        message=message,
        details=details,
        resolved=False
    )
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

def get_active_alerts(db: Session):
    return db.query(Alert).filter(Alert.resolved == False).order_by(Alert.level.desc(), Alert.created_at.desc()).all()

def resolve_alert(db: Session, alert_id: int):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if alert:
        alert.resolved = True
        alert.resolved_at = datetime.utcnow()
        db.commit()
        db.refresh(alert)
    return alert
