from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.agents import data_agent, forecast_agent

router = APIRouter()

@router.get("/")
def get_scenarios(horizon_days: int = Query(default=7), db: Session = Depends(get_db)):
    """Run multiple scenario forecasts in format expected by frontend"""
    
    feature_df = data_agent.build_feature_frame()
    current_aqi = data_agent.get_current_aqi()
    
    # Run all scenarios
    baseline_result = forecast_agent.run_forecast(
        feature_df, horizon_days, scenario="baseline"
    )
    
    high_aqi_result = forecast_agent.run_forecast(
        feature_df, horizon_days, scenario="baseline", aqi_override=250
    )
    
    festival_result = forecast_agent.run_forecast(
        feature_df, horizon_days, scenario="baseline", is_festival=True
    )
    
    combined_result = forecast_agent.run_forecast(
        feature_df, horizon_days, scenario="baseline", aqi_override=250, is_festival=True
    )
    
    # Transform to frontend format (ds/yhat instead of date/predicted)
    def transform_predictions(predictions):
        return [
            {
                "ds": p["date"],
                "yhat": p["predicted"]
            }
            for p in predictions
        ]
    
    # Transform summaries to stats format
    def transform_summary(summary):
        return {
            "average": round(summary["avg_predicted_admissions"], 1),
            "peak": round(summary["peak_value"], 1)
        }
    
    return {
        "baseline": transform_predictions(baseline_result["predictions"]),
        "high_aqi": transform_predictions(high_aqi_result["predictions"]),
        "festival": transform_predictions(festival_result["predictions"]),
        "combined": transform_predictions(combined_result["predictions"]),
        "baseline_stats": transform_summary(baseline_result["summary"]),
        "high_aqi_stats": transform_summary(high_aqi_result["summary"]),
        "festival_stats": transform_summary(festival_result["summary"]),
        "combined_stats": transform_summary(combined_result["summary"]),
        "current_aqi": current_aqi,
        "horizon_days": horizon_days
    }
