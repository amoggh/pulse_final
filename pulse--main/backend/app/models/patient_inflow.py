from sqlalchemy import Column, Integer, DateTime, ForeignKey
from app.core.database import Base
from datetime import datetime

class PatientInflow(Base):
    __tablename__ = "patient_inflow"

    id = Column(Integer, primary_key=True)
    ts = Column(DateTime, index=True, default=datetime.utcnow)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), index=True)
    count = Column(Integer, nullable=False)
