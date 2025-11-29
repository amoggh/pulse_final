"""
Data Loader Node - Loads context data from database or mock data
"""

from datetime import datetime, timedelta
from typing import Dict, Any
import os

from ..state import AgentState


def load_context_data(state: AgentState) -> AgentState:
    """
    Load historical data and context signals from database or use mock data
    """
    print("\n📊 Loading Context Data...")
    
    hospital_id = state.get("hospital_id", 1)
    department_id = state.get("department_id")
    current_date = state.get("current_date", datetime.now())
    
    # Try to load from database
    try:
        from sqlalchemy.orm import Session
        from sqlalchemy import create_engine
        from sqlalchemy.orm import sessionmaker
        import sys
        sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))
        from app.app import models
        from app.app.config import settings
        
        engine = create_engine(settings.DATABASE_URL, future=True)
        SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, future=True)
        
        db = SessionLocal()
        
        # Get hospital info
        hospital = db.query(models.Hospital).filter(models.Hospital.id == hospital_id).first()
        if hospital:
            state["hospital_name"] = hospital.name
        else:
            state["hospital_name"] = f"Hospital {hospital_id}"
        
        # Get departments
        departments = db.query(models.Department).filter(
            models.Department.hospital_id == hospital_id
        ).all()
        state["departments"] = [
            {"id": d.id, "name": d.name} for d in departments
        ]
        
        # Get historical patient inflow (last 60 days)
        start_date = current_date - timedelta(days=60)
        inflow_records = db.query(models.PatientInflow).filter(
            models.PatientInflow.hospital_id == hospital_id,
            models.PatientInflow.ts >= start_date
        ).order_by(models.PatientInflow.ts.desc()).all()
        
        state["historical_inflow"] = [
            {
                "ts": record.ts,
                "department_id": record.department_id,
                "count": record.count
            }
            for record in inflow_records
        ]
        
        # Get latest resource snapshot
        latest_resource = db.query(models.ResourceSnapshot).filter(
            models.ResourceSnapshot.hospital_id == hospital_id
        ).order_by(models.ResourceSnapshot.ts.desc()).first()
        
        if latest_resource:
            state["current_resources"] = {
                "beds_total": latest_resource.beds_total,
                "beds_occupied": latest_resource.beds_occupied,
                "beds_available": latest_resource.beds_total - latest_resource.beds_occupied,
                "icu_total": latest_resource.icu_total,
                "icu_occupied": latest_resource.icu_occupied,
                "icu_available": latest_resource.icu_total - latest_resource.icu_occupied,
                "staff_on_shift": latest_resource.staff_on_shift,
                "supplies": latest_resource.supplies_json
            }
        else:
            state["current_resources"] = _get_mock_resources()
        
        # Get latest context signals
        latest_signal = db.query(models.ContextSignals).filter(
            models.ContextSignals.hospital_id == hospital_id
        ).order_by(models.ContextSignals.ts.desc()).first()
        
        if latest_signal:
            state["context_signals"] = {
                "aqi": latest_signal.aqi,
                "festival_flag": latest_signal.festival_flag,
                "epidemic_tag": latest_signal.epidemic_tag,
                "weather": latest_signal.weather_json
            }
        else:
            state["context_signals"] = _get_mock_context_signals(current_date)
        
        db.close()
        
        print(f"✅ Loaded data from database for {state['hospital_name']}")
        print(f"  - Historical records: {len(state['historical_inflow'])}")
        print(f"  - Departments: {len(state['departments'])}")
        
    except Exception as e:
        print(f"⚠️ Database not available ({e}), using mock data")
        
        # Use mock data
        state["hospital_name"] = f"Mock Hospital {hospital_id}"
        state["departments"] = _get_mock_departments()
        state["historical_inflow"] = _get_mock_historical_data(current_date)
        state["current_resources"] = _get_mock_resources()
        state["context_signals"] = _get_mock_context_signals(current_date)
        
        print(f"✅ Loaded mock data for {state['hospital_name']}")
        print(f"  - Historical records: {len(state['historical_inflow'])}")
        print(f"  - Departments: {len(state['departments'])}")
    
    print(f"  - Current AQI: {state['context_signals']['aqi']}")
    print(f"  - Festival Flag: {state['context_signals']['festival_flag']}")
    print(f"  - Epidemic Tag: {state['context_signals'].get('epidemic_tag', 'None')}")
    
    return state


def _get_mock_departments() -> list:
    """Generate mock department data"""
    return [
        {"id": 1, "name": "Emergency"},
        {"id": 2, "name": "ICU"},
        {"id": 3, "name": "General Ward"},
        {"id": 4, "name": "Pediatrics"},
        {"id": 5, "name": "Cardiology"}
    ]


def _get_mock_historical_data(current_date: datetime) -> list:
    """Generate mock historical patient inflow data"""
    import random
    
    historical = []
    for i in range(60):
        date = current_date - timedelta(days=i)
        for dept_id in range(1, 6):
            # Base count varies by department
            base_count = {1: 80, 2: 30, 3: 120, 4: 40, 5: 25}.get(dept_id, 50)
            # Add some randomness
            count = base_count + random.randint(-15, 15)
            
            historical.append({
                "ts": date,
                "department_id": dept_id,
                "count": max(10, count)
            })
    
    return historical


def _get_mock_resources() -> dict:
    """Generate mock resource data"""
    return {
        "beds_total": 200,
        "beds_occupied": 150,
        "beds_available": 50,
        "icu_total": 40,
        "icu_occupied": 30,
        "icu_available": 10,
        "staff_on_shift": 50,
        "supplies": {
            "masks": 5000,
            "gloves": 10000,
            "sanitizer": 200,
            "ventilators": 15,
            "oxygen_cylinders": 50
        }
    }


def _get_mock_context_signals(current_date: datetime) -> dict:
    """Generate mock context signals based on current date"""
    import random
    
    # Determine festival flag based on month
    month = current_date.month
    festival_flag = 1 if month in [10, 11, 3, 8] else 0  # Diwali, Holi, Ganesh Chaturthi months
    
    # Determine AQI based on season
    if month in [10, 11, 12, 1]:  # Winter/pollution season
        aqi = random.randint(150, 300)
    elif month in [7, 8, 9]:  # Monsoon
        aqi = random.randint(50, 120)
    else:
        aqi = random.randint(80, 150)
    
    # Determine epidemic tag based on season
    epidemic_tag = ""
    if month in [7, 8, 9]:  # Monsoon
        epidemic_tag = "dengue" if random.random() > 0.5 else "malaria"
    elif month in [12, 1, 2]:  # Winter
        epidemic_tag = "flu" if random.random() > 0.5 else "pneumonia"
    
    return {
        "aqi": aqi,
        "festival_flag": festival_flag,
        "epidemic_tag": epidemic_tag,
        "weather": {
            "temperature": random.randint(15, 35),
            "humidity": random.randint(40, 90),
            "rainfall": random.randint(0, 100) if month in [6, 7, 8, 9] else 0
        }
    }
