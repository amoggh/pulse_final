from sqlalchemy.orm import Session
from app.models.aqi import AQI
from app.api.schemas import AQICreate

def create_aqi_record(db: Session, aqi: AQICreate):
    db_aqi = AQI(**aqi.dict())
    db.add(db_aqi)
    db.commit()
    db.refresh(db_aqi)
    return db_aqi

def get_aqi_history(db: Session, city: str, limit: int = 30):
    return db.query(AQI).filter(AQI.city == city).order_by(AQI.date.desc()).limit(limit).all()
