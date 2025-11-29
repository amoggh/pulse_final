from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services import aqi_service
from app.api.schemas import AQICreate, AQIResponse

router = APIRouter()

@router.post("/", response_model=AQIResponse)
def create_aqi(aqi: AQICreate, db: Session = Depends(get_db)):
    return aqi_service.create_aqi_record(db, aqi)

@router.get("/{city}", response_model=List[AQIResponse])
def get_aqi_history(city: str, db: Session = Depends(get_db)):
    return aqi_service.get_aqi_history(db, city)
