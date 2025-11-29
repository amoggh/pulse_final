from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.api.schemas import ForecastRunRequest, ForecastSummaryResponse
from app.agents.pipeline import run_pipeline
from app.agents import data_agent, forecast_agent
from app.services import forecast_service, alerts_service, status_service
from datetime import datetime

router = APIRouter()

from typing import Optional

class ForecastRequest(BaseModel):
    horizon_days: int = 7
    aqi_override: Optional[int] = None
    is_festival: bool = False

@router.post("/")
def run_forecast_api(request: ForecastRequest, db: Session = Depends(get_db)):
    """Run forecast with frontend parameters"""
    try:
        feature_df = data_agent.build_feature_frame()
        
        forecast_result = forecast_agent.run_forecast(
            feature_df,
            horizon_days=request.horizon_days,
            scenario="baseline",
            aqi_override=request.aqi_override,
            is_festival=request.is_festival
        )
        
        return {
            "forecasts": forecast_result.get("predictions", []),
            "summary": forecast_result.get("summary", {}),
            "metrics": forecast_result.get("metrics", {}),
            "feature_importance": forecast_result.get("feature_importance", [])
        }
    except Exception as e:
        # Return empty but valid structure on error
        from datetime import datetime, timedelta
        
        # Generate minimal fallback forecast
        fallback_dates = [datetime.now() + timedelta(days=i+1) for i in range(request.horizon_days)]
        fallback_forecasts = [{
            "date": d.strftime("%Y-%m-%d"),
            "predicted": 50.0,
            "baseline": 50.0,
            "confidence_low": 40.0,
            "confidence_high": 60.0
        } for d in fallback_dates]
        
        return {
            "forecasts": fallback_forecasts,
            "summary": {
                "avg_predicted_admissions": 50.0,
                "avg_baseline_admissions": 50.0,
                "peak_day": fallback_dates[-1].strftime("%Y-%m-%d"),
                "peak_value": 50.0,
                "explanation": f"Forecast service error: {str(e)}",
                "methodology": ["Fallback model: Baseline estimates", f"Error: {str(e)}"]
            },
            "metrics": {},
            "feature_importance": []
        }


@router.post("/run")
def run_forecast(request: ForecastRunRequest, db: Session = Depends(get_db)):
    # Run the pipeline
    result = run_pipeline(request.city, request.horizon_days, request.scenario)
    
    # Persist Forecast
    forecast_service.save_forecast(
        db, 
        result["forecast_summary"], 
        request.horizon_days, 
        request.scenario
    )
    
    # Persist Alerts
    # If risk is High or Critical, create an alert
    risk = result["risk_level"]
    if risk in ["High", "Critical"]:
        alerts_service.create_alert(
            db,
            level=risk,
            category="System",
            message=f"High risk detected: {risk} level.",
            details=result
        )
        
    # Update Status
    status_service.update_system_status(
        db,
        risk_level=risk,
        last_forecast=datetime.utcnow(),
        last_decision=datetime.utcnow()
    )
    
    return result

@router.get("/latest", response_model=ForecastSummaryResponse)
def get_latest_forecast(db: Session = Depends(get_db)):
    forecast = forecast_service.get_latest_forecast(db)
    if not forecast:
        return {} # Or 404
    return forecast
