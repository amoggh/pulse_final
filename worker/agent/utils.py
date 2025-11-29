"""
Utility functions for the agent
"""

import json
from datetime import datetime
from typing import Dict, Any


def get_season(date: datetime) -> str:
    """Determine the season based on date"""
    month = date.month
    
    if month in [7, 8, 9]:
        return "monsoon"
    elif month in [12, 1, 2]:
        return "winter"
    elif month in [3, 4, 5]:
        return "summer"
    else:
        return "pre-monsoon"


def parse_llm_json_response(response: str) -> Dict[str, Any]:
    """Parse LLM response as JSON, handling markdown code blocks"""
    # Remove markdown code blocks if present
    response = response.strip()
    if response.startswith("```json"):
        response = response[7:]
    if response.startswith("```"):
        response = response[3:]
    if response.endswith("```"):
        response = response[:-3]
    
    response = response.strip()
    
    try:
        return json.loads(response)
    except json.JSONDecodeError as e:
        print(f"Failed to parse LLM response: {e}")
        print(f"Response was: {response}")
        return {}


def calculate_baseline(historical_inflow: list, department_id: int = None) -> float:
    """Calculate baseline patient inflow from historical data"""
    if not historical_inflow:
        return 50.0  # Default baseline
    
    # Filter by department if specified
    if department_id:
        filtered = [h for h in historical_inflow if h.get("department_id") == department_id]
    else:
        filtered = historical_inflow
    
    if not filtered:
        return 50.0
    
    # Calculate average of recent counts
    counts = [h.get("count", 0) for h in filtered[-30:]]  # Last 30 records
    return sum(counts) / len(counts) if counts else 50.0


def determine_severity(surge_percentage: float) -> str:
    """Determine alert severity based on surge percentage"""
    if surge_percentage < 20:
        return "LOW"
    elif surge_percentage < 50:
        return "MEDIUM"
    else:
        return "HIGH"


def format_date(date: datetime) -> str:
    """Format datetime for display"""
    return date.strftime("%Y-%m-%d")
