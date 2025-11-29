from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.agents import data_agent, forecast_agent, decision_agent

router = APIRouter()

@router.get("/")
def get_kpis(db: Session = Depends(get_db)):
    """Get current KPIs for dashboard"""
    
    # Get current occupancy
    occupancy_data = data_agent.get_current_occupancy()
    
    # Get current AQI
    current_aqi = data_agent.get_current_aqi()
    
    # Get quick forecast for next 24h
    feature_df = data_agent.build_feature_frame()
    forecast_result = forecast_agent.run_forecast(feature_df, horizon_days=1, scenario="baseline")
    admissions_24h = int(forecast_result["predictions"][0]["predicted"]) if forecast_result["predictions"] else 0
    
    # Get inventory for risk calculation
    inventory_df = data_agent.get_current_inventory()

    # Calculate risk score using shared logic
    risk_calc = decision_agent.calculate_operational_risk_score(
        aqi_level=current_aqi,
        current_occupancy_pct=occupancy_data["occupancy_percentage"],
        forecast_summary=forecast_result["summary"],
        inventory_df=inventory_df
    )
    
    return {
        "occupancy": occupancy_data["occupancy_percentage"],
        "admissions_24h": admissions_24h,
        "aqi": current_aqi,
        "risk_score": risk_calc["score"]
    }
