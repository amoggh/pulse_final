"""
Recommendations Node
Generates actionable recommendations based on predictions and alerts
"""

from typing import Dict, Any, List
from datetime import datetime
from ..state import AgentState


def generate_recommendations(state: AgentState) -> Dict[str, Any]:
    """
    Generate actionable recommendations based on analysis and predictions
    
    Args:
        state: Current agent state with predictions and alerts
        
    Returns:
        Updated state with generated recommendations
    """
    print("\n💡 Generating Recommendations...")
    
    recommendations = []
    
    # Get context
    surge_prediction = state.get("surge_prediction", {})
    festival_analysis = state.get("festival_analysis", {})
    pollution_analysis = state.get("pollution_analysis", {})
    epidemic_analysis = state.get("epidemic_analysis", {})
    alerts = state.get("alerts", [])
    
    predicted_surge = surge_prediction.get("predicted_surge_percentage", 0)
    risk_level = surge_prediction.get("risk_level", "low")
    
    # Staffing recommendations based on surge
    if predicted_surge > 20:
        staff_increase = min(int(predicted_surge * 0.8), 50)  # Cap at 50%
        recommendations.append({
            "id": f"STAFF_{datetime.now().strftime('%Y%m%d')}",
            "category": "staffing",
            "priority": "high" if predicted_surge > 35 else "medium",
            "title": "Increase Staff Allocation",
            "description": f"Increase staff by approximately {staff_increase}% to handle predicted surge",
            "actions": [
                f"Schedule additional {staff_increase}% nursing staff for next 7 days",
                "Arrange on-call doctors for emergency coverage",
                "Brief staff on expected surge and protocols"
            ],
            "impact": "high",
            "effort": "medium",
            "timeline": "immediate",
            "metrics": {
                "staff_increase_percentage": staff_increase,
                "predicted_surge": predicted_surge
            }
        })
    
    # Resource recommendations
    if predicted_surge > 15:
        recommendations.append({
            "id": f"RESOURCE_{datetime.now().strftime('%Y%m%d')}",
            "category": "resources",
            "priority": "high" if predicted_surge > 30 else "medium",
            "title": "Stock Essential Medical Supplies",
            "description": "Increase inventory of essential medical supplies and equipment",
            "actions": [
                "Order additional PPE, masks, and sanitizers",
                "Stock up on common medications and IV fluids",
                "Ensure backup oxygen supply is available",
                "Check and maintain emergency equipment"
            ],
            "impact": "high",
            "effort": "low",
            "timeline": "within 48 hours",
            "metrics": {
                "predicted_surge": predicted_surge
            }
        })
    
    # Festival-specific recommendations
    upcoming_festivals = festival_analysis.get("upcoming_festivals", [])
    if upcoming_festivals:
        high_impact_festivals = [f for f in upcoming_festivals if f.get("expected_impact", 0) > 15]
        if high_impact_festivals:
            festival = high_impact_festivals[0]
            recommendations.append({
                "id": f"FESTIVAL_PREP_{datetime.now().strftime('%Y%m%d')}",
                "category": "event_preparation",
                "priority": "medium",
                "title": f"Prepare for {festival['name']}",
                "description": f"Special preparations for {festival['name']} on {festival['date']}",
                "actions": [
                    "Set up temporary triage areas if needed",
                    "Coordinate with local authorities for emergency response",
                    "Prepare for common festival-related injuries and ailments",
                    "Ensure ambulance services are on standby"
                ],
                "impact": "medium",
                "effort": "medium",
                "timeline": f"{festival.get('days_until', 7)} days",
                "metrics": {
                    "festival_name": festival['name'],
                    "expected_impact": festival['expected_impact']
                }
            })
    
    # Pollution-related recommendations
    pollution_risk = pollution_analysis.get("pollution_risk_score", 0)
    if pollution_risk > 60:
        recommendations.append({
            "id": f"POLLUTION_PREP_{datetime.now().strftime('%Y%m%d')}",
            "category": "environmental_health",
            "priority": "high" if pollution_risk > 80 else "medium",
            "title": "Prepare for Pollution-Related Cases",
            "description": "Increase readiness for respiratory and cardiovascular cases",
            "actions": [
                "Stock inhalers, nebulizers, and respiratory medications",
                "Set up dedicated respiratory care unit",
                "Brief staff on pollution-related health issues",
                "Coordinate with pulmonology specialists",
                "Prepare air quality advisories for patients"
            ],
            "impact": "high",
            "effort": "medium",
            "timeline": "immediate",
            "metrics": {
                "pollution_risk_score": pollution_risk,
                "expected_increase": pollution_analysis.get("expected_patient_increase", 0)
            }
        })
    
    # Epidemic-specific recommendations
    active_epidemics = epidemic_analysis.get("active_epidemics", [])
    if active_epidemics:
        for epidemic in active_epidemics:
            if epidemic.get("severity", "low") in ["high", "critical"]:
                recommendations.append({
                    "id": f"EPIDEMIC_RESPONSE_{epidemic['disease'].replace(' ', '_')}",
                    "category": "infection_control",
                    "priority": "critical" if epidemic.get("severity") == "critical" else "high",
                    "title": f"Epidemic Response: {epidemic['disease']}",
                    "description": f"Implement infection control measures for {epidemic['disease']} outbreak",
                    "actions": [
                        "Activate isolation protocols and quarantine areas",
                        "Ensure adequate PPE for all staff",
                        "Coordinate with public health authorities",
                        "Set up screening and testing facilities",
                        "Brief staff on disease-specific protocols",
                        "Prepare contact tracing procedures"
                    ],
                    "impact": "critical",
                    "effort": "high",
                    "timeline": "immediate",
                    "metrics": {
                        "disease": epidemic['disease'],
                        "cases": epidemic.get('cases', 0),
                        "severity": epidemic.get('severity', 'medium')
                    }
                })
    
    # Capacity management recommendations
    if predicted_surge > 25:
        recommendations.append({
            "id": f"CAPACITY_{datetime.now().strftime('%Y%m%d')}",
            "category": "capacity_management",
            "priority": "high",
            "title": "Optimize Bed Capacity",
            "description": "Maximize available bed capacity and patient flow",
            "actions": [
                "Expedite discharge of stable patients",
                "Convert semi-private rooms if needed",
                "Coordinate with nearby hospitals for overflow",
                "Set up temporary observation areas",
                "Implement fast-track protocols for minor cases"
            ],
            "impact": "high",
            "effort": "medium",
            "timeline": "within 24 hours",
            "metrics": {
                "predicted_surge": predicted_surge
            }
        })
    
    # Sort recommendations by priority
    priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    recommendations.sort(key=lambda x: priority_order.get(x["priority"], 4))
    
    print(f"✅ Generated {len(recommendations)} recommendations")
    for rec in recommendations:
        print(f"  - [{rec['priority'].upper()}] {rec['title']}")
    
    return {
        "recommendations": recommendations,
        "recommendation_count": len(recommendations),
        "critical_recommendations": len([r for r in recommendations if r["priority"] == "critical"]),
        "high_priority_recommendations": len([r for r in recommendations if r["priority"] == "high"])
    }
