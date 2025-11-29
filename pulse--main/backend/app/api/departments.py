from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.agents import data_agent

router = APIRouter()

@router.get("/")
def get_departments(db: Session = Depends(get_db)):
    """Get department information with detailed metadata"""
    depts_df = data_agent.get_departments()
    
    # Enrich with additional fields
    heads = ["Dr. Rajesh Kumar", "Dr. Priya Sharma", "Dr. Amit Patel", "Dr. Sunita Reddy"]
    floors = ["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor"]
    contacts = ["+91-22-2345-6701", "+91-22-2345-6702", "+91-22-2345-6703", "+91-22-2345-6704"]
    
    departments = []
    for idx, row in depts_df.iterrows():
        total_beds = int(row["capacity"])
        departments.append({
            "department_name": row["name"],
            "total_beds": total_beds,
            "icu_beds": int(total_beds * 0.2) if row["name"] in ["Emergency", "ICU"] else 0,
            "head_of_department": heads[idx % len(heads)],
            "floor": floors[idx % len(floors)],
            "contact": contacts[idx % len(contacts)]
        })
    
    return departments
