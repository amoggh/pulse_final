from app.agents import data_agent, forecast_agent, decision_agent, communication_agent
from datetime import datetime

def run_pipeline(city: str, horizon_days: int, scenario: str):
    # 1. Data Loading
    feature_df = data_agent.build_feature_frame(city)
    
    # Get latest data points for decision making
    latest_row = feature_df.iloc[-1]
    current_aqi = int(latest_row['aqi']) if 'aqi' in latest_row else 100
    current_occ = int(latest_row['occupied_beds']) if 'occupied_beds' in latest_row else 300
    total_beds = int(latest_row['total_beds']) if 'total_beds' in latest_row else 500
    
    occ_pct = (current_occ / total_beds) * 100 if total_beds > 0 else 0
    
    inventory_df = data_agent.load_inventory()
    staffing_df = data_agent.load_staffing()

    # 2. Forecasting
    forecast_output = forecast_agent.run_forecast(feature_df, horizon_days, scenario)

    # 3. Decision Making
    decision_output = decision_agent.evaluate_risk(
        current_occupancy_pct=occ_pct,
        aqi_level=current_aqi,
        forecast_summary=forecast_output["summary"],
        inventory_df=inventory_df,
        staffing_df=staffing_df
    )

    # 4. Communication
    final_response = communication_agent.format_response(decision_output, forecast_output)
    
    return final_response
