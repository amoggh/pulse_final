from typing import List, Optional, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel

# Auth
class UserRegister(BaseModel):
    username: str
    password: str
    role: str = "ops"

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# AQI
class AQICreate(BaseModel):
    date: date
    city: str
    aqi: int

class AQIResponse(AQICreate):
    id: int
    class Config:
        from_attributes = True

# Forecast
class ForecastRunRequest(BaseModel):
    city: str = "Mumbai"
    horizon_days: int = 7
    scenario: str = "baseline" # baseline, high_aqi, festival, combined

class ForecastSummaryResponse(BaseModel):
    id: int
    run_timestamp: datetime
    horizon_days: int
    scenario: str
    avg_predicted_admissions: float
    avg_baseline_admissions: float
    peak_day: date
    metadata: Dict[str, Any]
    class Config:
        from_attributes = True

# Alerts
class AlertResponse(BaseModel):
    id: int
    created_at: datetime
    level: str
    category: str
    message: str
    details: Dict[str, Any]
    resolved: bool
    resolved_at: Optional[datetime]
    class Config:
        from_attributes = True

class AlertResolveRequest(BaseModel):
    resolved: bool = True

# System Status
class SystemStatusResponse(BaseModel):
    last_forecast_run: Optional[datetime]
    last_decision_run: Optional[datetime]
    global_risk_level: str
    active_alerts_count: Dict[str, int]
    class Config:
        from_attributes = True
