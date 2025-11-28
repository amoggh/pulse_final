from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    hospital_id: int
    role: str
    email: EmailStr

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


