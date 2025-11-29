from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services import alerts_service
from app.api.schemas import AlertResponse, AlertResolveRequest

router = APIRouter()

@router.get("/active", response_model=List[AlertResponse])
def get_active_alerts(db: Session = Depends(get_db)):
    return alerts_service.get_active_alerts(db)

@router.post("/resolve/{alert_id}", response_model=AlertResponse)
def resolve_alert(alert_id: int, request: AlertResolveRequest, db: Session = Depends(get_db)):
    alert = alerts_service.resolve_alert(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert
