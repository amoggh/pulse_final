from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.agents import data_agent, forecast_agent, decision_agent

router = APIRouter()

@router.get("/evaluate")
def evaluate_decision(
    aqi_override: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Run decision agent and return structured recommendations"""
    
    # Get current state
    occupancy_data = data_agent.get_current_occupancy()
    current_aqi = aqi_override if aqi_override is not None else data_agent.get_current_aqi()
    inventory_df = data_agent.get_current_inventory()
    staffing_df = data_agent.load_staffing()
    
    # Run forecast
    feature_df = data_agent.build_feature_frame()
    forecast_result = forecast_agent.run_forecast(feature_df, horizon_days=7, scenario="baseline")
    
    # Evaluate risk
    decision_result = decision_agent.evaluate_risk(
        current_occupancy_pct=occupancy_data["occupancy_percentage"],
        aqi_level=current_aqi,
        forecast_summary=forecast_result["summary"],
        inventory_df=inventory_df,
        staffing_df=staffing_df
    )
    
    return decision_result
