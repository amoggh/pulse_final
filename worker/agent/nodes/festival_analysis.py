"""
Festival Analysis Node - Analyzes festival impact using LLM
"""

from typing import Dict, Any
from datetime import datetime

from ..state import AgentState
from ..prompts import FESTIVAL_ANALYSIS_PROMPT
from ..utils import get_season, format_date
from ..llm import query_llm


def analyze_festivals(state: AgentState) -> AgentState:
    """
    Analyze festival impact on patient surge using Qwen LLM
    """
    print("\n🎉 Analyzing Festival Impact...")
    
    current_date = state.get("current_date", datetime.now())
    context_signals = state.get("context_signals", {})
    hospital_name = state.get("hospital_name", "Unknown Hospital")
    
    # Extract city from hospital name (simple heuristic)
    city = hospital_name.split()[-1] if hospital_name else "Mumbai"
    
    # Get season
    season = get_season(current_date)
    
    # Format prompt
    prompt = FESTIVAL_ANALYSIS_PROMPT.format(
        current_date=format_date(current_date),
        festival_flag=context_signals.get("festival_flag", 0),
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
        
        # Validate and set defaults
        state["festival_analysis"] = {
            "is_festival_period": analysis.get("is_festival_period", False),
            "festival_name": analysis.get("festival_name"),
            "days_until_peak": analysis.get("days_until_peak", 0),
            "surge_multiplier": analysis.get("surge_multiplier", 1.0),
            "affected_departments": analysis.get("affected_departments", []),
            "reasoning": analysis.get("reasoning", "No festival impact detected")
        }
        
        print(f"✅ Festival Analysis Complete")
        print(f"  - Festival: {state['festival_analysis']['festival_name'] or 'None'}")
        print(f"  - Multiplier: {state['festival_analysis']['surge_multiplier']}x")
        
    except Exception as e:
        print(f"✗ Festival analysis failed: {e}")
        # Fallback to simple logic
        state["festival_analysis"] = {
            "is_festival_period": context_signals.get("festival_flag", 0) == 1,
            "festival_name": None,
            "days_until_peak": 0,
            "surge_multiplier": 1.2 if context_signals.get("festival_flag", 0) == 1 else 1.0,
            "affected_departments": ["ER", "ICU"],
            "reasoning": "Fallback analysis based on festival flag"
        }
    
    return state
