"""
Pulse Worker - LangGraph Agent for Predictive Hospital Management
"""

import os
import time
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import agent
from agent.graph import run_agent, create_agent_graph

# Try to import database models (optional)
try:
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from app.app.config import settings
    from app.app import models
    from app.app.notifications import send_email
    
    engine = create_engine(settings.DATABASE_URL, future=True)
    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, future=True)
    DB_AVAILABLE = True
except Exception as e:
    print(f"⚠️ Database not available: {e}")
    print("Running in standalone mode with mock data")
    DB_AVAILABLE = False
    SessionLocal = None


def save_results_to_db(results: dict, hospital_id: int):
    """
    Save agent results to database
    
    Args:
        results: Agent output with predictions and alerts
        hospital_id: Hospital ID
    """
    if not DB_AVAILABLE or not SessionLocal:
        print("⚠️ Database not available, skipping save to DB")
        return
    
    db = SessionLocal()
    try:
        # Get alerts from results
        alerts = results.get("alerts", [])
        
        # Save each alert to database
        for alert_data in alerts:
            alert = models.Alert(
                hospital_id=hospital_id,
                severity=alert_data.get("severity", "medium").upper(),
                title=alert_data.get("title", "Alert"),
                message=alert_data.get("message", ""),
                action_json={
                    "recommendations": results.get("recommendations", []),
                    "metrics": alert_data.get("metrics", {})
                },
                status="open",
                ts=datetime.utcnow()
            )
            db.add(alert)
        
        db.commit()
        print(f"✅ Saved {len(alerts)} alerts to database")
        
        # Send email notifications for critical alerts
        critical_alerts = [a for a in alerts if a.get("severity") == "critical"]
        if critical_alerts:
            try:
                send_email(
                    subject=f"[PULSE][CRITICAL] {len(critical_alerts)} Critical Alerts",
                    body=f"Critical alerts generated for Hospital {hospital_id}",
                    to_addrs=["ops@pulsecare.local"]
                )
                print(f"✅ Sent email notification for {len(critical_alerts)} critical alerts")
            except Exception as e:
                print(f"⚠️ Email notification failed: {e}")
                
    except Exception as e:
        print(f"⚠️ Failed to save to database: {e}")
        db.rollback()
    finally:
        db.close()


def run_agent_for_all_hospitals():
    """
    Run the agent for all hospitals in the database
    """
    if not DB_AVAILABLE or not SessionLocal:
        print("⚠️ Database not available, running for mock hospital")
        # Run for mock hospital
        results = run_agent(hospital_id=1)
        print_summary(results)
        return
    
    db = SessionLocal()
    try:
        hospitals = db.query(models.Hospital).all()
        print(f"\n🏥 Found {len(hospitals)} hospitals")
        
        for hospital in hospitals:
            print(f"\n{'='*60}")
            print(f"Processing: {hospital.name} (ID: {hospital.id})")
            print(f"{'='*60}")
            
            # Run agent for this hospital
            results = run_agent(hospital_id=hospital.id)
            
            # Save results to database
            save_results_to_db(results, hospital.id)
            
            # Print summary
            print_summary(results)
            
    except Exception as e:
        print(f"⚠️ Error processing hospitals: {e}")
    finally:
        db.close()


def run_agent_once():
    """
    Run the agent once for testing or single execution
    """
    print("\n" + "="*60)
    print("🚀 PULSE PREDICTIVE AGENT - Single Run")
    print("="*60)
    
    # Run for hospital ID 1 (or mock data if DB not available)
    results = run_agent(hospital_id=1)
    
    # Save to database if available
    if DB_AVAILABLE:
        save_results_to_db(results, hospital_id=1)
    
    # Print summary
    print_summary(results)
    
    return results


def print_summary(results: dict):
    """
    Print a summary of the agent results
    
    Args:
        results: Agent output dictionary
    """
    print("\n" + "="*60)
    print("📋 EXECUTION SUMMARY")
    print("="*60)
    
    surge = results.get("surge_prediction", {})
    alerts = results.get("alerts", [])
    recommendations = results.get("recommendations", [])
    
    print(f"\n🎯 Prediction:")
    print(f"  - Baseline: {surge.get('baseline_inflow', 0):.1f} patients/day")
    print(f"  - Predicted: {surge.get('predicted_inflow', 0):.1f} patients/day")
    print(f"  - Surge: {surge.get('predicted_surge_percentage', 0):.1f}%")
    print(f"  - Risk Level: {surge.get('risk_level', 'unknown').upper()}")
    
    print(f"\n🚨 Alerts: {len(alerts)}")
    for alert in alerts[:3]:  # Show top 3
        print(f"  - [{alert.get('severity', 'N/A').upper()}] {alert.get('title', 'N/A')}")
    
    print(f"\n💡 Recommendations: {len(recommendations)}")
    for rec in recommendations[:3]:  # Show top 3
        print(f"  - [{rec.get('priority', 'N/A').upper()}] {rec.get('title', 'N/A')}")
    
    # Show output files
    output_files = results.get("output_files", {})
    if output_files:
        print(f"\n📁 Output Files:")
        for key, path in output_files.items():
            if path:
                print(f"  - {key}: {path}")
    
    print("\n" + "="*60)


def main_loop():
    """
    Main loop - runs agent periodically
    """
    print("\n" + "="*60)
    print("🏥 PULSE PREDICTIVE AGENT - Continuous Mode")
    print("="*60)
    print(f"Running every 1 hour...")
    print(f"Press Ctrl+C to stop")
    print("="*60)
    
    while True:
        try:
            run_agent_for_all_hospitals()
            
            # Wait 1 hour before next run
            print(f"\n⏰ Waiting 1 hour until next run...")
            time.sleep(3600)
            
        except KeyboardInterrupt:
            print("\n\n👋 Stopping agent...")
            break
        except Exception as e:
            print(f"\n⚠️ Error in main loop: {e}")
            print("Waiting 5 minutes before retry...")
            time.sleep(300)


def main():
    """
    Main entry point
    """
    import sys
    
    # Check command line arguments
    if len(sys.argv) > 1:
        if sys.argv[1] == "once":
            # Run once and exit
            run_agent_once()
        elif sys.argv[1] == "test":
            # Test mode - run with mock data
            print("\n🧪 TEST MODE - Using mock data")
            results = run_agent(hospital_id=1)
            print_summary(results)
        else:
            print("Usage:")
            print("  python -m worker.main          # Continuous mode (runs every hour)")
            print("  python -m worker.main once     # Run once and exit")
            print("  python -m worker.main test     # Test mode with mock data")
    else:
        # Default: continuous mode
        main_loop()


if __name__ == "__main__":
    main()
