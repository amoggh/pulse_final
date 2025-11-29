"""
Alert Generation Node
Generates alerts based on surge predictions and risk assessments
"""

from typing import Dict, Any, List
from datetime import datetime, timedelta
from ..state import AgentState


def generate_alerts(state: AgentState) -> Dict[str, Any]:
    """
    Generate alerts based on predictions and risk factors
    
    Args:
        state: Current agent state with predictions and analysis
        
    Returns:
        Updated state with generated alerts
    """
    print("\n🚨 Generating Alerts...")
    
    alerts = []
    
    # Get predictions and risk factors
    surge_prediction = state.get("surge_prediction", {})
    festival_analysis = state.get("festival_analysis", {})
    pollution_analysis = state.get("pollution_analysis", {})
    epidemic_analysis = state.get("epidemic_analysis", {})
    
    predicted_surge = surge_prediction.get("predicted_surge_percentage", 0)
    risk_level = surge_prediction.get("risk_level", "low")
    
    # Generate surge alert if significant
    if predicted_surge > 20:
        severity = "critical" if predicted_surge > 50 else "high" if predicted_surge > 35 else "medium"
        alerts.append({
            "id": f"SURGE_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "type": "patient_surge",
            "severity": severity,
            "title": f"Patient Surge Alert: {predicted_surge:.1f}% Increase Expected",
            "message": f"Predicted patient surge of {predicted_surge:.1f}% in the next 7 days. Risk level: {risk_level.upper()}",
            "timestamp": datetime.now().isoformat(),
            "expiry": (datetime.now() + timedelta(days=7)).isoformat(),
            "actionable": True,
            "metrics": {
                "surge_percentage": predicted_surge,
                "risk_level": risk_level,
                "confidence": surge_prediction.get("confidence", 0.75)
            }
        })
    
    # Generate festival-related alerts
    upcoming_festivals = festival_analysis.get("upcoming_festivals", [])
    if upcoming_festivals:
        for festival in upcoming_festivals[:3]:  # Top 3 festivals
            if festival.get("expected_impact", 0) > 15:
                alerts.append({
                    "id": f"FESTIVAL_{festival['name'].replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}",
                    "type": "festival_impact",
                    "severity": "medium",
                    "title": f"Festival Alert: {festival['name']}",
                    "message": f"{festival['name']} on {festival['date']} may cause {festival['expected_impact']:.1f}% increase in patient load",
                    "timestamp": datetime.now().isoformat(),
                    "expiry": festival.get("date", (datetime.now() + timedelta(days=30)).isoformat()),
                    "actionable": True,
                    "metrics": {
                        "festival_name": festival['name'],
                        "expected_impact": festival['expected_impact'],
                        "days_until": festival.get('days_until', 0)
                    }
                })
    
    # Generate pollution alerts
    pollution_risk = pollution_analysis.get("pollution_risk_score", 0)
    if pollution_risk > 60:
        severity = "critical" if pollution_risk > 80 else "high"
        alerts.append({
            "id": f"POLLUTION_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "type": "pollution_risk",
            "severity": severity,
            "title": f"High Pollution Risk Alert",
            "message": f"Pollution risk score: {pollution_risk:.1f}/100. Expect increase in respiratory cases",
            "timestamp": datetime.now().isoformat(),
            "expiry": (datetime.now() + timedelta(days=3)).isoformat(),
            "actionable": True,
            "metrics": {
                "risk_score": pollution_risk,
                "aqi_trend": pollution_analysis.get("aqi_trend", "stable"),
                "expected_impact": pollution_analysis.get("expected_patient_increase", 0)
            }
        })
    
    # Generate epidemic alerts
    active_epidemics = epidemic_analysis.get("active_epidemics", [])
    if active_epidemics:
        for epidemic in active_epidemics:
            if epidemic.get("severity", "low") in ["high", "critical"]:
                alerts.append({
                    "id": f"EPIDEMIC_{epidemic['disease'].replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}",
                    "type": "epidemic",
                    "severity": epidemic.get("severity", "medium"),
                    "title": f"Epidemic Alert: {epidemic['disease']}",
                    "message": f"{epidemic['disease']} outbreak detected. {epidemic.get('cases', 0)} cases reported. Trend: {epidemic.get('trend', 'unknown')}",
                    "timestamp": datetime.now().isoformat(),
                    "expiry": (datetime.now() + timedelta(days=14)).isoformat(),
                    "actionable": True,
                    "metrics": {
                        "disease": epidemic['disease'],
                        "cases": epidemic.get('cases', 0),
                        "trend": epidemic.get('trend', 'unknown'),
                        "severity": epidemic.get('severity', 'medium')
                    }
                })
    
    # Sort alerts by severity
    severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    alerts.sort(key=lambda x: severity_order.get(x["severity"], 4))
    
    print(f"✅ Generated {len(alerts)} alerts")
    for alert in alerts:
        print(f"  - [{alert['severity'].upper()}] {alert['title']}")
    
    return {
        "alerts": alerts,
        "alert_count": len(alerts),
        "critical_alerts": len([a for a in alerts if a["severity"] == "critical"]),
        "high_alerts": len([a for a in alerts if a["severity"] == "high"])
    }
