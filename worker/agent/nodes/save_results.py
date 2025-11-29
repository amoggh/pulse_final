"""
Save Results Node
Saves analysis results, predictions, alerts, and recommendations
"""

from typing import Dict, Any
from datetime import datetime
import json
import os
from ..state import AgentState


def save_results(state: AgentState) -> Dict[str, Any]:
    """
    Save all results to output files and prepare for API response
    
    Args:
        state: Current agent state with all analysis results
        
    Returns:
        Updated state with save status and output paths
    """
    print("\n💾 Saving Results...")
    
    # Create output directory if it doesn't exist
    output_dir = os.path.join(os.path.dirname(__file__), "..", "..", "output")
    os.makedirs(output_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Prepare comprehensive results
    results = {
        "metadata": {
            "timestamp": datetime.now().isoformat(),
            "analysis_id": f"PULSE_{timestamp}",
            "version": "1.0.0"
        },
        "context_data": {
            "festivals": state.get("festivals", []),
            "pollution": state.get("pollution", {}),
            "epidemics": state.get("epidemics", []),
            "historical_data": state.get("historical_data", {})
        },
        "analysis": {
            "festival_analysis": state.get("festival_analysis", {}),
            "pollution_analysis": state.get("pollution_analysis", {}),
            "epidemic_analysis": state.get("epidemic_analysis", {})
        },
        "predictions": {
            "surge_prediction": state.get("surge_prediction", {}),
            "risk_level": state.get("surge_prediction", {}).get("risk_level", "low"),
            "predicted_surge_percentage": state.get("surge_prediction", {}).get("predicted_surge_percentage", 0),
            "confidence": state.get("surge_prediction", {}).get("confidence", 0.75)
        },
        "alerts": state.get("alerts", []),
        "recommendations": state.get("recommendations", []),
        "summary": {
            "total_alerts": state.get("alert_count", 0),
            "critical_alerts": state.get("critical_alerts", 0),
            "high_alerts": state.get("high_alerts", 0),
            "total_recommendations": state.get("recommendation_count", 0),
            "critical_recommendations": state.get("critical_recommendations", 0),
            "high_priority_recommendations": state.get("high_priority_recommendations", 0),
            "overall_risk_level": state.get("surge_prediction", {}).get("risk_level", "low")
        }
    }
    
    # Save full results to JSON
    full_results_path = os.path.join(output_dir, f"analysis_{timestamp}.json")
    try:
        with open(full_results_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        print(f"✅ Saved full results to: {full_results_path}")
    except Exception as e:
        print(f"⚠️ Error saving full results: {e}")
        full_results_path = None
    
    # Save alerts separately for quick access
    alerts_path = os.path.join(output_dir, f"alerts_{timestamp}.json")
    try:
        with open(alerts_path, 'w', encoding='utf-8') as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "alerts": state.get("alerts", []),
                "count": state.get("alert_count", 0)
            }, f, indent=2, ensure_ascii=False)
        print(f"✅ Saved alerts to: {alerts_path}")
    except Exception as e:
        print(f"⚠️ Error saving alerts: {e}")
        alerts_path = None
    
    # Save recommendations separately
    recommendations_path = os.path.join(output_dir, f"recommendations_{timestamp}.json")
    try:
        with open(recommendations_path, 'w', encoding='utf-8') as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "recommendations": state.get("recommendations", []),
                "count": state.get("recommendation_count", 0)
            }, f, indent=2, ensure_ascii=False)
        print(f"✅ Saved recommendations to: {recommendations_path}")
    except Exception as e:
        print(f"⚠️ Error saving recommendations: {e}")
        recommendations_path = None
    
    # Save latest results (overwrite) for API to read
    latest_results_path = os.path.join(output_dir, "latest_results.json")
    try:
        with open(latest_results_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        print(f"✅ Saved latest results to: {latest_results_path}")
    except Exception as e:
        print(f"⚠️ Error saving latest results: {e}")
        latest_results_path = None
    
    # Prepare summary for console output
    print("\n" + "="*60)
    print("📊 ANALYSIS SUMMARY")
    print("="*60)
    print(f"Risk Level: {results['summary']['overall_risk_level'].upper()}")
    print(f"Predicted Surge: {results['predictions']['predicted_surge_percentage']:.1f}%")
    print(f"Confidence: {results['predictions']['confidence']:.1%}")
    print(f"\nAlerts: {results['summary']['total_alerts']} total")
    print(f"  - Critical: {results['summary']['critical_alerts']}")
    print(f"  - High: {results['summary']['high_alerts']}")
    print(f"\nRecommendations: {results['summary']['total_recommendations']} total")
    print(f"  - Critical: {results['summary']['critical_recommendations']}")
    print(f"  - High Priority: {results['summary']['high_priority_recommendations']}")
    print("="*60)
    
    return {
        "save_status": "success",
        "output_files": {
            "full_results": full_results_path,
            "alerts": alerts_path,
            "recommendations": recommendations_path,
            "latest": latest_results_path
        },
        "results": results,
        "analysis_complete": True
    }
