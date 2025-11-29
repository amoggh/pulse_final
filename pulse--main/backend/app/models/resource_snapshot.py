from sqlalchemy import Column, Integer, DateTime, ForeignKey, JSON
from app.core.database import Base
from datetime import datetime

class ResourceSnapshot(Base):
    __tablename__ = "resource_snapshot"

    id = Column(Integer, primary_key=True)
    ts = Column(DateTime, index=True, default=datetime.utcnow)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), index=True)
    beds_total = Column(Integer, default=0)
    beds_occupied = Column(Integer, default=0)
    icu_total = Column(Integer, default=0)
    icu_occupied = Column(Integer, default=0)
    staff_on_shift = Column(Integer, default=0)
    supplies_json = Column(JSON, default=dict)
