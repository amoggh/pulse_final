from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db, Base, engine
from app.core.security import get_current_user, require_role, verify_password, create_access_token
from app import models
from app.models import schemas
from app.api import auth
from app.services import forecast_service as fc
from datetime import datetime

router = APIRouter()

# Initialize tables (for MVP; replace with migrations later)
Base.metadata.create_all(bind=engine)


@router.post("/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    token = create_access_token(user.email)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/forecast/{hospital_id}", response_model=List[schemas.ForecastOut])
def get_forecast(hospital_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    departments = db.query(models.Department).filter(models.Department.hospital_id == hospital_id).all()
    out: list[schemas.ForecastOut] = []
    for d in departments:
        preds = fc.predict_next_7_days(db, hospital_id, d.id)
        for horizon_date, pred, lo, hi in preds:
            out.append(
                schemas.ForecastOut(
                    hospital_id=hospital_id,
                    department_id=d.id,
                    horizon_date=horizon_date,
                    inflow_pred=pred,
                    inflow_ci_low=lo,
                    inflow_ci_high=hi,
                    model_version="mvp-heuristic",
                )
            )
    return out


@router.get("/dashboard/{hospital_id}", response_model=schemas.DashboardOut)
def get_dashboard(hospital_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    forecasts = get_forecast(hospital_id, db, user)
    alerts = db.query(models.Alert).filter(models.Alert.hospital_id == hospital_id).order_by(models.Alert.ts.desc()).limit(20).all()
    latest_load = (
        db.query(models.ResourceSnapshot)
        .filter(models.ResourceSnapshot.hospital_id == hospital_id)
        .order_by(models.ResourceSnapshot.ts.desc())
        .first()
    )
    load = {
        "beds_total": latest_load.beds_total if latest_load else 0,
        "beds_occupied": latest_load.beds_occupied if latest_load else 0,
        "icu_total": latest_load.icu_total if latest_load else 0,
        "icu_occupied": latest_load.icu_occupied if latest_load else 0,
        "staff_on_shift": latest_load.staff_on_shift if latest_load else 0,
    }
    return {
        "forecasts": forecasts,
        "alerts": [schemas.AlertOut.model_validate(a) for a in alerts],
        "load": load,
    }


@router.get("/alerts", response_model=List[schemas.AlertOut])
def list_alerts(db: Session = Depends(get_db), user=Depends(get_current_user)):
    alerts = db.query(models.Alert).order_by(models.Alert.ts.desc()).limit(100).all()
    return [schemas.AlertOut.model_validate(a) for a in alerts]


@router.post("/alerts", response_model=schemas.AlertOut)
def create_alert(payload: schemas.AlertIn, db: Session = Depends(get_db), user=Depends(require_role("admin", "ops-manager"))):
    alert = models.Alert(
        hospital_id=payload.hospital_id,
        severity=payload.severity,
        title=payload.title,
        message=payload.message,
        action_json=payload.action_json or {},
        status="open",
        ts=datetime.utcnow(),
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return schemas.AlertOut.model_validate(alert)


@router.patch("/alerts/{alert_id}", response_model=schemas.AlertOut)
def ack_alert(alert_id: int, payload: schemas.AlertAck, db: Session = Depends(get_db), user=Depends(require_role("ops-manager", "admin"))):
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(404, "Alert not found")
    alert.status = payload.status
    if payload.status == "ack":
        alert.ack_by = user.email
        alert.ack_ts = datetime.utcnow()
    db.commit()
    db.refresh(alert)
    return schemas.AlertOut.model_validate(alert)


@router.post("/documents", response_model=schemas.DocumentOut)
def upload_document(doc: schemas.DocumentIn, db: Session = Depends(get_db), user=Depends(require_role("admin", "ops-manager"))):
    # MVP: store empty embedding; worker can backfill
    m = models.Document(hospital_id=doc.hospital_id, title=doc.title, content=doc.content, embedding="[]")
    db.add(m)
    db.commit()
    db.refresh(m)
    return schemas.DocumentOut.model_validate(m)


@router.get("/documents/search")
def search_documents(hospital_id: int, query: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    # MVP: naive search
    docs = (
        db.query(models.Document)
        .filter(models.Document.hospital_id == hospital_id)
        .order_by(models.Document.id.desc())
        .limit(50)
        .all()
    )
    results = [d for d in docs if query.lower() in (d.title.lower() + " " + d.content.lower())]
    return [{"id": d.id, "title": d.title, "snippet": d.content[:200]} for d in results[:10]]


@router.get("/context/signals/latest")
def latest_signals(hospital_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    sig = (
        db.query(models.ContextSignals)
        .filter(models.ContextSignals.hospital_id == hospital_id)
        .order_by(models.ContextSignals.ts.desc())
        .first()
    )
    return {
        "ts": sig.ts if sig else None,
        "aqi": sig.aqi if sig else None,
        "festival_flag": sig.festival_flag if sig else None,
        "epidemic_tag": sig.epidemic_tag if sig else None,
    }



