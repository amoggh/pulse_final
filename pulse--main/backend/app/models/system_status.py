from sqlalchemy import Column, Integer, String, DateTime, Text
from app.core.database import Base

class SystemStatus(Base):
    __tablename__ = "system_status"

    id = Column(Integer, primary_key=True, default=1)
    last_forecast_run = Column(DateTime, nullable=True)
    last_decision_run = Column(DateTime, nullable=True)
    global_risk_level = Column(String, default="Low")
    notes = Column(Text, nullable=True)
