from sqlalchemy import Column, Integer, String, Date
from app.core.database import Base

class AQI(Base):
    __tablename__ = "aqi_records"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    city = Column(String, index=True)
    aqi = Column(Integer)
