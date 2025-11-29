"""
Surge Prediction Node - Combines all analyses to predict patient surge using LLM
"""

from typing import Dict, Any
from datetime import datetime, timedelta

from ..state import AgentState
from ..prompts import SURGE_PREDICTION_PROMPT
from ..utils import calculate_baseline, format_date
from ..llm import query_llm


def predict_surge(state: AgentState) -> AgentState:
    """
    Predict patient surge by combining all analysis factors using Qwen LLM
    """
    print("\n📈 Predicting Patient Surge...")
    
    current_date = state.get("current_date", datetime.now())
    historical_inflow = state.get("historical_inflow", [])
    
    # Get analysis results
    festival = state.get("festival_analysis", {})
    pollution = state.get("pollution_analysis", {})
    epidemic = state.get("epidemic_analysis", {})
    
    # Calculate baseline
    baseline = calculate_baseline(historical_inflow)
    historical_avg = baseline
    
    # Get multipliers
    festival_mult = festival.get("surge_multiplier", 1.0)
    pollution_mult = pollution.get("surge_multiplier", 1.0)
    epidemic_mult = epidemic.get("surge_multiplier", 1.0)
    
    # Format prompt
    prompt = SURGE_PREDICTION_PROMPT.format(
        baseline=baseline,
        historical_avg=historical_avg,
        festival_multiplier=festival_mult,
        festival_reasoning=festival.get("reasoning", "No festival impact"),
        pollution_multiplier=pollution_mult,
        pollution_reasoning=pollution.get("reasoning", "Normal pollution"),
        epidemic_multiplier=epidemic_mult,
        epidemic_reasoning=epidemic.get("reasoning", "No epidemic")
    )
    
    # Call Qwen LLM with thinking mode
    try:
        response = query_llm(
            prompt=prompt,
            return_json=True,
            enable_thinking=True,
            max_new_tokens=2048
        )
        
        prediction = response.get("data", {})
        
        combined_mult = prediction.get("combined_multiplier", festival_mult * pollution_mult * epidemic_mult)
        surge_pct = prediction.get("surge_percentage", (combined_mult - 1.0) * 100)
        confidence = prediction.get("confidence", "medium")
        peak_offset = prediction.get("peak_date_offset_days", 3)
        
    except Exception as e:
        print(f"⚠️ Surge prediction LLM failed: {e}")
        # Fallback: simple multiplication with dampening
        combined_mult = 1.0 + ((festival_mult - 1.0) + (pollution_mult - 1.0) + (epidemic_mult - 1.0)) * 0.8
        surge_pct = (combined_mult - 1.0) * 100
        confidence = "low"
        peak_offset = 3
        prediction = {"reasoning": "Fallback calculation: additive model with dampening"}
    
    # Calculate predicted inflow
    predicted_inflow = baseline * combined_mult
    peak_date = current_date + timedelta(days=peak_offset)
    
    # Determine risk level
    if surge_pct < 20:
        risk_level = "low"
    elif surge_pct < 50:
        risk_level = "medium"
    else:
        risk_level = "high"
    
    # Generate 7-day forecast
    forecast_7days = []
    for i in range(1, 8):
        forecast_date = current_date + timedelta(days=i)
        # Surge peaks around peak_date, then decays
        days_from_peak = abs((forecast_date - peak_date).days)
        decay_factor = max(0.5, 1.0 - (days_from_peak * 0.1))
        day_multiplier = 1.0 + ((combined_mult - 1.0) * decay_factor)
        day_prediction = baseline * day_multiplier
        
        forecast_7days.append({
            "date": forecast_date.isoformat(),
            "predicted_inflow": round(day_prediction, 1),
            "multiplier": round(day_multiplier, 2)
        })
    
    state["surge_prediction"] = {
        "baseline_inflow": round(baseline, 1),
        "predicted_inflow": round(predicted_inflow, 1),
        "predicted_surge_percentage": round(surge_pct, 1),
        "surge_percentage": round(surge_pct, 1),  # Alias for compatibility
        "combined_multiplier": round(combined_mult, 2),
        "confidence": confidence if isinstance(confidence, float) else 0.75,
        "risk_level": risk_level,
        "peak_date": peak_date.isoformat(),
        "forecast_7days": forecast_7days,
        "reasoning": prediction.get("reasoning", "Combined analysis of festival, pollution, and epidemic factors")
    }
    
    print(f"✅ Surge Prediction Complete")
    print(f"  - Baseline: {baseline:.1f} patients/day")
    print(f"  - Predicted: {predicted_inflow:.1f} patients/day")
    print(f"  - Surge: {surge_pct:.1f}% ({combined_mult:.2f}x)")
    print(f"  - Risk Level: {risk_level.upper()}")
    print(f"  - Peak: {format_date(peak_date)}")
    print(f"  - Confidence: {confidence}")
    
    return state
