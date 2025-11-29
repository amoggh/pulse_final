from typing import Dict, Any

def format_response(decision: Dict[str, Any], forecast: Dict[str, Any]) -> Dict[str, Any]:
    """
    Formats the final response for the API.
    """
    return {
        "status": "success",
        "risk_level": decision["risk_level"],
        "recommendations": decision["actions"],
        "reasoning": decision["reasoning_trace"],
        "forecast_summary": forecast["summary"],
        "forecast_details": forecast["predictions"],
        "metrics": decision["metrics"]
    }
