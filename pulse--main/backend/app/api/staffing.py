from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.agents import data_agent

router = APIRouter()

@router.get("/")
def get_staffing(db: Session = Depends(get_db)):
    """Get current staffing roster with detailed information"""
    staffing_data = data_agent.get_current_staffing()
    
    # Generate detailed staff roster based on current staffing levels
    staff_roster = []
    
    # Doctors
    for i in range(staffing_data["doctors_on_call"]):
        staff_roster.append({
            "name": f"Dr. {['Sharma', 'Patel', 'Kumar', 'Singh', 'Reddy', 'Gupta', 'Mehta', 'Joshi', 'Desai', 'Rao'][i % 10]}",
            "role": "Doctor",
            "department": ["Emergency", "ICU", "General Ward", "Pediatrics"][i % 4],
            "shift": ["Morning", "Evening", "Night"][i % 3],
            "days_of_week": "Mon-Fri" if i % 2 == 0 else "Sat-Sun",
            "hourly_rate_inr": 1500 + (i % 3) * 500,
            "status": "Active"
        })
    
    # Nurses
    for i in range(min(staffing_data["nurses_on_shift"], 30)):  # Cap at 30 for display
        staff_roster.append({
            "name": f"Nurse {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'][i % 10]}{i+1}",
            "role": "Nurse",
            "department": ["Emergency", "ICU", "General Ward", "Pediatrics"][i % 4],
            "shift": ["Morning", "Evening", "Night"][i % 3],
            "days_of_week": "Mon-Fri" if i % 2 == 0 else "All Days",
            "hourly_rate_inr": 450 + (i % 3) * 100,
            "status": "Active"
        })
    
    return staff_roster
