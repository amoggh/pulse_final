from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, JSON
from app.core.database import Base
import json
from datetime import datetime

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime)
    level = Column(String) # Low, Moderate, High, Critical
    category = Column(String) # Staffing, Supplies, Advisory, System
    message = Column(String)
    details_blob = Column(Text)
    resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)

    @property
    def details(self):
        return json.loads(self.details_blob) if self.details_blob else {}

    @details.setter
    def details(self, value):
        self.details_blob = json.dumps(value)

class OperationalAlert(Base):
    __tablename__ = "operational_alerts"

    id = Column(Integer, primary_key=True)
    ts = Column(DateTime, index=True, default=datetime.utcnow)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), index=True)
    severity = Column(String)
    title = Column(String)
    message = Column(Text)
    action_json = Column(JSON, default=dict)
    status = Column(String, default="open")
    ack_by = Column(String, nullable=True)
    ack_ts = Column(DateTime, nullable=True)
