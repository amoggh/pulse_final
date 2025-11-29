"""
Epidemic Analysis Node - Analyzes seasonal disease patterns using LLM
"""

from typing import Dict, Any
from datetime import datetime

from ..state import AgentState
from ..prompts import EPIDEMIC_ANALYSIS_PROMPT
from ..utils import get_season, format_date
from ..llm import query_llm


def analyze_epidemics(state: AgentState) -> AgentState:
    """
    Analyze epidemic/seasonal disease impact using Qwen LLM
    """
    print("\n🦠 Analyzing Epidemic Impact...")
    
    current_date = state.get("current_date", datetime.now())
    context_signals = state.get("context_signals", {})
    hospital_name = state.get("hospital_name", "Unknown Hospital")
    
    # Extract city from hospital name
    city = hospital_name.split()[-1] if hospital_name else "Mumbai"
    
    # Get season
    season = get_season(current_date)
    
    # Get epidemic tag from context signals
    epidemic_tag = context_signals.get("epidemic_tag", 0)
    
    # Format prompt
    prompt = EPIDEMIC_ANALYSIS_PROMPT.format(
        current_date=format_date(current_date),
        season=season,
        epidemic_tag=epidemic_tag,
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
        
        state["epidemic_analysis"] = {
            "season": analysis.get("season", season),
            "active_epidemics": analysis.get("active_epidemics", []),
            "surge_multiplier": analysis.get("surge_multiplier", 1.0),
            "affected_departments": analysis.get("affected_departments", []),
            "reasoning": analysis.get("reasoning", "No significant epidemic activity")
        }
        
        print(f"✅ Epidemic Analysis Complete")
        print(f"  - Season: {state['epidemic_analysis']['season']}")
        print(f"  - Active Epidemics: {', '.join(state['epidemic_analysis']['active_epidemics']) or 'None'}")
        print(f"  - Multiplier: {state['epidemic_analysis']['surge_multiplier']}x")
        
    except Exception as e:
        print(f"⚠️ Epidemic analysis failed: {e}")
        # Fallback logic based on season
        if season == "monsoon":
            active = ["dengue", "malaria"]
            multiplier = 1.3
        elif season == "winter":
            active = ["flu", "pneumonia"]
            multiplier = 1.2
        else:
            active = []
            multiplier = 1.0
        
        state["epidemic_analysis"] = {
            "season": season,
            "active_epidemics": active,
            "surge_multiplier": multiplier,
            "affected_departments": ["ER", "ICU"],
            "reasoning": f"Fallback analysis: {season} season typical patterns"
        }
    
    return state
