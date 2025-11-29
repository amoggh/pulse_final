from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class ForecastRequest(BaseModel):
    horizon_days: int = 7
    aqi_override: Optional[int] = None
    is_festival: bool = False
    department: str = "All"
    city: str = "Mumbai"

class ForecastPoint(BaseModel):
    ds: str # Date string
    yhat: float # Predicted value
    yhat_lower: float
    yhat_upper: float
    scenario: str # 'baseline', 'high_aqi', 'festival', 'combined'

class ForecastResponse(BaseModel):
    forecasts: List[ForecastPoint]
    summary: str

class Recommendation(BaseModel):
    id: str
    category: str # 'Staffing', 'Supplies', 'Advisory'
    action: str
    reasoning: List[str]
    risk_score: float
    status: str = "pending"

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    actions: Optional[List[Recommendation]] = None
    chart_data: Optional[Dict[str, Any]] = None

# --- Decision Engine Models ---

class ActionItem(BaseModel):
    action: str
    priority: str # 'High', 'Medium', 'Low'
    details: Optional[str] = None

class DecisionActions(BaseModel):
    staffing: List[ActionItem] = []
    supplies: List[ActionItem] = []
    bed_management: List[ActionItem] = []
    advisory: List[ActionItem] = []

class DecisionOutput(BaseModel):
    risk_level: str # 'Low', 'Moderate', 'High', 'Critical'
    actions: DecisionActions
    reasoning_trace: List[str]
    timestamp: datetime = datetime.now()

class DecisionInput(BaseModel):
    # Core Metrics
    occupancy_rate: int
    aqi: int
    admissions_24h: int
    
    # Forecast Signals
    forecast_admissions_avg: float
    forecast_peak: float
    forecast_trend: str # 'increasing', 'stable', 'decreasing'
    
    # Context
    is_festival: bool
    is_weekend: bool
    department_load: Dict[str, str] # e.g., {'respiratory': 'high'}
    inventory_status: Dict[str, str] # e.g., {'oxygen': 'low'}

# --- Landing Page Schemas ---

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    hospital_id: int
    role: str
    email: str

    class Config:
        from_attributes = True

class ForecastOut(BaseModel):
    hospital_id: int
    department_id: int
    horizon_date: datetime
    inflow_pred: float
    inflow_ci_low: float
    inflow_ci_high: float
    model_version: str

class AlertIn(BaseModel):
    hospital_id: int
    severity: str
    title: str
    message: str
    action_json: Dict[str, Any] | None = None

class AlertOut(BaseModel):
    id: int
    ts: datetime
    hospital_id: int
    severity: str
    title: str
    message: str
    action_json: Dict[str, Any] | None
    status: str

    class Config:
        from_attributes = True

class AlertAck(BaseModel):
    status: str

class DashboardOut(BaseModel):
    forecasts: List[ForecastOut]
    alerts: List[AlertOut]
    load: Dict[str, Any]

class DocumentIn(BaseModel):
    hospital_id: int
    title: str
    content: str

class DocumentOut(BaseModel):
    id: int
    hospital_id: int
    title: str
    content: str

    class Config:
        from_attributes = True
