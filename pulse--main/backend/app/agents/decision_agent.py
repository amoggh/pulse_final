from typing import Dict, Any, List
import pandas as pd

def calculate_operational_risk_score(
    aqi_level: int,
    current_occupancy_pct: float,
    forecast_summary: Dict[str, Any],
    inventory_df: pd.DataFrame = None
) -> Dict[str, Any]:
    """
    Calculate operational risk score (0-100) based on weighted factors.
    Returns score and breakdown details.
    """
    # 1. AQI Risk
    aqi_risk_score = 0
    if aqi_level < 100:
        aqi_risk_score = 10
    elif 100 <= aqi_level < 200:
        aqi_risk_score = 30
    elif 200 <= aqi_level < 300:
        aqi_risk_score = 60
    else:
        aqi_risk_score = 90

    # 2. Occupancy Risk
    occ_risk_score = 0
    if current_occupancy_pct < 70:
        occ_risk_score = 10
    elif 70 <= current_occupancy_pct < 85:
        occ_risk_score = 40
    elif 85 <= current_occupancy_pct < 95:
        occ_risk_score = 70
    else:
        occ_risk_score = 95

    # 3. Forecast Surge Risk
    avg_baseline = forecast_summary.get("avg_baseline_admissions", 1)
    peak_pred = forecast_summary.get("peak_value", 1)
    
    if avg_baseline > 0:
        surge_pct = ((peak_pred - avg_baseline) / avg_baseline) * 100
    else:
        surge_pct = 0
        
    surge_risk_score = 0
    if surge_pct < 5:
        surge_risk_score = 5
    elif 5 <= surge_pct < 15:
        surge_risk_score = 25
    elif 15 <= surge_pct < 30:
        surge_risk_score = 55
    else:
        surge_risk_score = 85

    # 4. Inventory Checks
    inventory_risk_score = 0
    low_stock_items = []
    if inventory_df is not None and not inventory_df.empty:
        for _, row in inventory_df.iterrows():
            if row['current_stock'] < row['min_threshold']:
                low_stock_items.append(row['item_name'])
        inventory_risk_score = len(low_stock_items) * 15

    # Calculate Operational Risk Score (0-100)
    # Weighted factors
    w_aqi = 0.3
    w_occ = 0.4
    w_surge = 0.2
    w_inv = 0.1
    
    operational_risk_score = min(100, int(
        (aqi_risk_score * w_aqi) + 
        (occ_risk_score * w_occ) + 
        (surge_risk_score * w_surge) + 
        (inventory_risk_score * w_inv)
    ))
    
    # Operational Score Explanation
    score_breakdown = []
    if aqi_risk_score > 30:
        score_breakdown.append(f"High AQI contribution ({aqi_risk_score} pts)")
    if occ_risk_score > 40:
        score_breakdown.append(f"High Occupancy load ({occ_risk_score} pts)")
    if surge_risk_score > 25:
        score_breakdown.append(f"Projected Surge ({surge_risk_score} pts)")
    if inventory_risk_score > 0:
        score_breakdown.append(f"Inventory Shortages ({inventory_risk_score} pts)")
        
    score_explanation = f"Score {operational_risk_score}/100 driven by: {', '.join(score_breakdown) if score_breakdown else 'Normal operations'}"

    return {
        "score": operational_risk_score,
        "explanation": score_explanation,
        "breakdown": score_breakdown,
        "metrics": {
            "aqi_risk_score": aqi_risk_score,
            "occ_risk_score": occ_risk_score,
            "surge_risk_score": surge_risk_score,
            "inventory_risk_score": inventory_risk_score,
            "surge_pct": surge_pct,
            "low_stock_items": low_stock_items
        }
    }

def evaluate_risk(
    current_occupancy_pct: float,
    aqi_level: int,
    forecast_summary: Dict[str, Any],
    inventory_df: pd.DataFrame,
    staffing_df: pd.DataFrame
) -> Dict[str, Any]:
    
    reasoning_trace = []
    
    # Calculate Risk Score using shared logic
    risk_calc = calculate_operational_risk_score(
        aqi_level, current_occupancy_pct, forecast_summary, inventory_df
    )
    operational_risk_score = risk_calc["score"]
    score_explanation = risk_calc["explanation"]
    metrics = risk_calc["metrics"]
    
    # Reconstruct reasoning trace for detailed agent output
    # 1. AQI Risk
    aqi_risk = "Low"
    if metrics["aqi_risk_score"] >= 90: aqi_risk = "Severe"
    elif metrics["aqi_risk_score"] >= 60: aqi_risk = "High"
    elif metrics["aqi_risk_score"] >= 30: aqi_risk = "Moderate"
    reasoning_trace.append(f"AQI is {aqi_level} ({aqi_risk} Risk).")

    # 2. Occupancy Risk
    occ_risk = "Low"
    if metrics["occ_risk_score"] >= 95: occ_risk = "Critical"
    elif metrics["occ_risk_score"] >= 70: occ_risk = "High"
    elif metrics["occ_risk_score"] >= 40: occ_risk = "Moderate"
    reasoning_trace.append(f"Occupancy is {current_occupancy_pct:.1f}% ({occ_risk} Load).")

    # 3. Forecast Surge Risk
    surge_risk = "Low"
    if metrics["surge_risk_score"] >= 85: surge_risk = "Critical"
    elif metrics["surge_risk_score"] >= 55: surge_risk = "High"
    elif metrics["surge_risk_score"] >= 25: surge_risk = "Moderate"
    reasoning_trace.append(f"Forecasted surge is {metrics['surge_pct']:.1f}% ({surge_risk} Surge).")

    # 4. Inventory Checks
    if metrics["low_stock_items"]:
        reasoning_trace.append(f"Low stock alert for: {', '.join(metrics['low_stock_items'])}.")
    else:
        reasoning_trace.append("Inventory levels are adequate.")

    reasoning_trace.append(f"Operational Risk Score: {operational_risk_score}/100")
    reasoning_trace.append(f"Score Analysis: {score_explanation}")

    # Calculate Projected Occupancy
    # Simple model: Projected = Current + (Predicted Admissions - Predicted Discharges)
    # Assume daily discharge rate is approx 15% of total beds (avg 6-7 day stay)
    # We look at the peak day in the forecast
    total_beds = 500 # Should ideally come from input, but using standard for now
    avg_daily_discharge = total_beds * 0.15
    
    peak_admission = forecast_summary.get("peak_value", 50)
    net_daily_change = peak_admission - avg_daily_discharge
    
    # Project out 7 days (cumulative effect if surge persists, but for simplicity just take peak day impact)
    # A better simple metric: Projected Peak Occupancy
    # If admissions stay at peak for 3 days...
    projected_occupancy_beds = (current_occupancy_pct / 100 * total_beds) + (net_daily_change * 3) # 3 day buffer
    projected_occupancy_beds = min(total_beds, max(0, projected_occupancy_beds))
    projected_occupancy_pct = round((projected_occupancy_beds / total_beds) * 100, 1)
    
    reasoning_trace.append(f"Projected Occupancy (3-day horizon): {projected_occupancy_pct}%")

    # Final Risk Calculation
    risk_levels = [aqi_risk, occ_risk, surge_risk]
    final_risk = "Low"
    
    if "Severe" in risk_levels or "Critical" in risk_levels:
        final_risk = "Critical"
    elif "High" in risk_levels:
        final_risk = "High"
    elif "Moderate" in risk_levels:
        final_risk = "Moderate"
        
    reasoning_trace.append(f"Final Calculated Risk Level: {final_risk}")

    # Actions - Structured format for frontend
    actions = {
        "staffing": [],
        "supplies": [],
        "bed_management": [],
        "advisory": []
    }

    # Staffing Actions
    if final_risk in ["High", "Critical"]:
        actions["staffing"].append({
            "action": "Activate on-call doctors immediately",
            "details": f"Current risk level is {final_risk}. Additional medical staff required.",
            "priority": "High"
        })
        actions["staffing"].append({
            "action": "Double nursing shift strength",
            "details": f"Occupancy at {current_occupancy_pct:.1f}% requires enhanced nursing coverage.",
            "priority": "High"
        })
    elif final_risk == "Moderate":
        actions["staffing"].append({
            "action": "Place on-call doctors on standby",
            "details": "Moderate risk detected. Ensure backup staff availability.",
            "priority": "Medium"
        })

    # Bed Management Actions
    if projected_occupancy_pct > 85:
        actions["bed_management"].append({
            "action": "Open overflow ward B",
            "details": f"Projected occupancy to reach {projected_occupancy_pct:.1f}%. Overflow capacity needed.",
            "priority": "High" if projected_occupancy_pct > 90 else "Medium"
        })
    
    if metrics['surge_pct'] > 15:
        actions["bed_management"].append({
            "action": "Defer non-urgent elective procedures",
            "details": f"Predicted surge of {metrics['surge_pct']:.1f}% requires bed capacity preservation.",
            "priority": "High"
        })

    # Supply Actions
    if metrics["low_stock_items"]:
        for item in metrics["low_stock_items"]:
            actions["supplies"].append({
                "action": f"Urgent reorder: {item}",
                "details": f"Stock below minimum threshold. Immediate procurement required.",
                "priority": "High"
            })
    
    if aqi_level > 200:
        actions["supplies"].append({
            "action": "Stock additional oxygen cylinders and nebulizers",
            "details": f"AQI at {aqi_level}. Expect increased respiratory cases.",
            "priority": "High"
        })

    # Advisory Actions
    if final_risk in ["High", "Critical"]:
        actions["advisory"].append({
            "action": "Issue public health advisory",
            "details": "Alert public about respiratory precautions and hospital capacity.",
            "priority": "High"
        })
    elif aqi_level > 150:
        actions["advisory"].append({
            "action": "Internal staff advisory",
            "details": f"AQI at {aqi_level}. Prepare for increased respiratory admissions.",
            "priority": "Medium"
        })

    return {
        "risk_level": final_risk,
        "operational_risk_score": operational_risk_score,
        "score_explanation": score_explanation,
        "actions": actions,
        "reasoning_trace": reasoning_trace,
        "metrics": {
            "aqi": aqi_level,
            "occupancy_pct": current_occupancy_pct,
            "projected_occupancy_pct": projected_occupancy_pct,
            "surge_pct": metrics['surge_pct'],
            "low_stock_items": metrics['low_stock_items']
        }
    }
