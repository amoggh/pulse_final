from sqlalchemy import Column, Integer, DateTime, ForeignKey, Float, String
from app.core.database import Base

class DailyForecast(Base):
    __tablename__ = "daily_forecasts"

    id = Column(Integer, primary_key=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), index=True)
    horizon_date = Column(DateTime, index=True)
    inflow_pred = Column(Float)
    inflow_ci_low = Column(Float)
    inflow_ci_high = Column(Float)
    model_version = Column(String, default="mvp-0")
