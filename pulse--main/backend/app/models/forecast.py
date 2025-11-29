from sqlalchemy import Column, Integer, String, DateTime, Float, Date, Text
from app.core.database import Base
import json

class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(Integer, primary_key=True, index=True)
    run_timestamp = Column(DateTime)
    horizon_days = Column(Integer)
    scenario = Column(String)
    avg_predicted_admissions = Column(Float)
    avg_baseline_admissions = Column(Float)
    peak_day = Column(Date)
    metadata_blob = Column(Text) # 'metadata' is reserved in sqlalchemy sometimes

    @property
    def meta(self):
        return json.loads(self.metadata_blob) if self.metadata_blob else {}

    @meta.setter
    def meta(self, value):
        self.metadata_blob = json.dumps(value)
