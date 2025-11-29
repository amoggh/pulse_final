from apscheduler.schedulers.background import BackgroundScheduler
from app.agents.pipeline import run_pipeline
from app.core.database import SessionLocal
from app.services import forecast_service, alerts_service, status_service
from datetime import datetime

scheduler = BackgroundScheduler()

def run_scheduled_forecast():
    print(f"Running scheduled forecast at {datetime.utcnow()}")
    db = SessionLocal()
    try:
        # Run pipeline with defaults
        result = run_pipeline(city="Mumbai", horizon_days=7, scenario="baseline")
        
        # Save results
        forecast_service.save_forecast(
            db, 
            result["forecast_summary"], 
            7, 
            "baseline"
        )
        
        risk = result["risk_level"]
        if risk in ["High", "Critical"]:
            alerts_service.create_alert(
                db,
                level=risk,
                category="System",
                message=f"Scheduled Run: High risk detected: {risk} level.",
                details=result
            )
            
        status_service.update_system_status(
            db,
            risk_level=risk,
            last_forecast=datetime.utcnow(),
            last_decision=datetime.utcnow()
        )
    except Exception as e:
        print(f"Error in scheduled forecast: {e}")
    finally:
        db.close()

def run_scheduled_decision():
    # Similar to forecast but maybe lighter weight or checking different signals
    # For now, we just alias it or run a lighter version
    print(f"Running scheduled decision check at {datetime.utcnow()}")
    # Implementation can be added here
    pass

def start_scheduler():
    scheduler.add_job(run_scheduled_forecast, 'interval', hours=6)
    scheduler.add_job(run_scheduled_decision, 'interval', hours=1)
    scheduler.start()
