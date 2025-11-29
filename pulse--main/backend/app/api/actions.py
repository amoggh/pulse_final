from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db

router = APIRouter()

class ApproveActionRequest(BaseModel):
    action_id: str
    category: str
    action: str

@router.post("/approve")
def approve_action(request: ApproveActionRequest, db: Session = Depends(get_db)):
    """Approve an agent action"""
    # In a real app, this would update a database status or trigger a workflow
    # For now, we just log it and return success
    print(f"✅ ACTION APPROVED: [{request.category}] {request.action} (ID: {request.action_id})")
    
    return {
        "status": "success",
        "message": "Action approved successfully",
        "action_id": request.action_id
    }
