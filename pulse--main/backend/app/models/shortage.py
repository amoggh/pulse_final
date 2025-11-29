from sqlalchemy import Column, Integer, DateTime, ForeignKey, Float, String, JSON
from app.core.database import Base

class Shortage(Base):
    __tablename__ = "shortages"

    id = Column(Integer, primary_key=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), index=True)
    horizon_date = Column(DateTime, index=True)
    beds_gap = Column(Float, default=0)
    staff_gap = Column(Float, default=0)
    supply_gaps_json = Column(JSON, default=dict)
    severity = Column(String, default="LOW")
