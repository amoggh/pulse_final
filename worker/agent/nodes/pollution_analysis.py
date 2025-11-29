"""
Pollution Analysis Node - Analyzes air quality impact using LLM
"""

from typing import Dict, Any
from datetime import datetime

from ..state import AgentState
from ..prompts import POLLUTION_ANALYSIS_PROMPT
from ..utils import get_season, format_date
from ..llm import query_llm


def analyze_pollution(state: AgentState) -> AgentState:
    """
    Analyze pollution impact on patient surge using Qwen LLM
    """
    print("\n🌫️ Analyzing Pollution Impact...")
    
    current_date = state.get("current_date", datetime.now())
    context_signals = state.get("context_signals", {})
    hospital_name = state.get("hospital_name", "Unknown Hospital")
    
    # Extract city from hospital name
    city = hospital_name.split()[-1] if hospital_name else "Mumbai"
    
    # Get season
    season = get_season(current_date)
    
    # Get AQI from context signals
    aqi = context_signals.get("aqi", 100)
    
    # Format prompt
    prompt = POLLUTION_ANALYSIS_PROMPT.format(
        aqi=aqi,
        current_date=format_date(current_date),
        season=season,
        city=city
    )
    
    # Call Qwen LLM with thinking mode
    try:
        response = query_llm(
            prompt=prompt,
            return_json=True,
            enable_thinking=True,
            max_new_tokens=2048
        )
        
        analysis = response.get("data", {})
        
        state["pollution_analysis"] = {
            "aqi_level": analysis.get("aqi_level", aqi),
            "pollution_category": analysis.get("pollution_category", "Moderate"),
            "is_pollution_season": analysis.get("is_pollution_season", False),
            "surge_multiplier": analysis.get("surge_multiplier", 1.0),
            "affected_conditions": analysis.get("affected_conditions", []),
            "reasoning": analysis.get("reasoning", "Normal pollution levels")
        }
        
        print(f"✅ Pollution Analysis Complete")
        print(f"  - AQI: {aqi} ({state['pollution_analysis']['pollution_category']})")
        print(f"  - Multiplier: {state['pollution_analysis']['surge_multiplier']}x")
        
    except Exception as e:
        print(f"⚠️ Pollution analysis failed: {e}")
        # Fallback logic
        if aqi > 250:
            multiplier = 1.4
            category = "Very Poor"
        elif aqi > 150:
            multiplier = 1.2
            category = "Poor"
        else:
            multiplier = 1.0
            category = "Moderate"
        
        state["pollution_analysis"] = {
            "aqi_level": aqi,
            "pollution_category": category,
            "is_pollution_season": current_date.month in [10, 11, 12, 1],
            "surge_multiplier": multiplier,
            "affected_conditions": ["asthma", "COPD", "bronchitis"],
            "reasoning": f"Fallback analysis: AQI {aqi} indicates {category} air quality"
        }
    
    return state
