from datetime import datetime, timedelta
from typing import List, Tuple
from sqlalchemy.orm import Session
from . import models
import math


def predict_next_7_days(db: Session, hospital_id: int, department_id: int) -> List[Tuple[datetime, float, float, float]]:
    # MVP heuristic: moving average + simple seasonality placeholder
    history = (
        db.query(models.PatientInflow)
        .filter(models.PatientInflow.hospital_id == hospital_id, models.PatientInflow.department_id == department_id)
        .order_by(models.PatientInflow.ts.desc())
        .limit(60)
        .all()
    )
    counts = [h.count for h in history] or [10]
    baseline = sum(counts) / len(counts)
    out = []
    today = datetime.utcnow().date()
    for i in range(1, 8):
        d = datetime.combine(today + timedelta(days=i), datetime.min.time())
        # weekend boost heuristic
        dow = d.weekday()
        seasonal = 1.2 if dow >= 5 else 1.0
        pred = baseline * seasonal
        ci_low = max(0.0, pred * 0.8)
        ci_high = pred * 1.2
        out.append((d, pred, ci_low, ci_high))
    return out


