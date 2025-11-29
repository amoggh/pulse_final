"""
Agent State Schema
"""

from typing import TypedDict, List, Dict, Optional, Any
from datetime import datetime


class AgentState(TypedDict):
    """State schema for the hospital prediction agent"""
    
    # Input
    hospital_id: int
    hospital_name: str
    current_date: datetime
    
    # Context Data (from database)
    historical_inflow: List[Dict[str, Any]]  # Patient counts over time
    current_resources: Dict[str, Any]  # Beds, staff, supplies
    context_signals: Dict[str, Any]  # AQI, festival_flag, epidemic_tag
    departments: List[Dict[str, Any]]  # Department info
    
    # Analysis Results
    festival_analysis: Optional[Dict[str, Any]]
    pollution_analysis: Optional[Dict[str, Any]]
    epidemic_analysis: Optional[Dict[str, Any]]
    
    # Predictions
    surge_prediction: Optional[Dict[str, Any]]
    
    # Outputs
    alerts: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]
    
    # Control
    next_action: Optional[str]
