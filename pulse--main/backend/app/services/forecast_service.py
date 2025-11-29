from sqlalchemy.orm import Session
from app.models.forecast import Forecast
from typing import Dict, Any
from datetime import datetime, timedelta
from app import models

def save_forecast(db: Session, summary: Dict[str, Any], horizon: int, scenario: str):
    db_forecast = Forecast(
        run_timestamp=datetime.utcnow(),
        horizon_days=horizon,
        scenario=scenario,
        avg_predicted_admissions=summary.get("avg_predicted_admissions"),
        avg_baseline_admissions=summary.get("avg_baseline_admissions"),
        peak_day=datetime.strptime(summary.get("peak_day"), "%Y-%m-%d").date(),
        meta=summary
    )
    db.add(db_forecast)
    db.commit()
    db.refresh(db_forecast)
    return db_forecast

def get_latest_forecast(db: Session, scenario: str = "baseline"):
    return db.query(Forecast).filter(Forecast.scenario == scenario).order_by(Forecast.run_timestamp.desc()).first()

def predict_next_7_days(db: Session, hospital_id: int, department_id: int):
    # This is a placeholder for the actual forecasting logic.
    # In a real application, this would use a proper forecasting model.
    today = datetime.utcnow().date()
    predictions = []
    for i in range(7):
        future_date = today + timedelta(days=i)
        # Simulate some prediction with confidence intervals
        pred = 100 + i * 5
        lo = pred - 10
        hi = pred + 10
        predictions.append((future_date, pred, lo, hi))
    return predictions
