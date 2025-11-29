from sqlalchemy import Column, Integer, DateTime, ForeignKey, Float, String, JSON
from app.core.database import Base
from datetime import datetime

class ContextSignals(Base):
    __tablename__ = "context_signals"

    id = Column(Integer, primary_key=True)
    ts = Column(DateTime, index=True, default=datetime.utcnow)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), index=True)
    aqi = Column(Float, default=0)
    festival_flag = Column(Integer, default=0)
    epidemic_tag = Column(String, default="")
    weather_json = Column(JSON, default=dict)
