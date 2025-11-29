from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services import status_service
from app.api.schemas import SystemStatusResponse

router = APIRouter()

@router.get("/", response_model=SystemStatusResponse)
def get_status(db: Session = Depends(get_db)):
    status = status_service.get_system_status(db)
    counts = status_service.get_active_alerts_count(db)
    
    return {
        "last_forecast_run": status.last_forecast_run,
        "last_decision_run": status.last_decision_run,
        "global_risk_level": status.global_risk_level,
        "active_alerts_count": counts
    }
