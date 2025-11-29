from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.agents import data_agent

router = APIRouter()

@router.get("/")
def get_inventory(db: Session = Depends(get_db)):
    """Get current inventory levels with detailed information"""
    inventory_df = data_agent.get_current_inventory()
    
    # Enrich with additional fields expected by frontend
    category_map = {
        "O2_CYL": "Respiratory",
        "NEB": "Respiratory",
        "PPE_KIT": "Safety",
        "TRAUMA_KIT": "Emergency"
    }
    
    unit_map = {
        "O2_CYL": "units",
        "NEB": "units",
        "PPE_KIT": "kits",
        "TRAUMA_KIT": "kits"
    }
    
    price_map = {
        "O2_CYL": 1500,
        "NEB": 12500,
        "PPE_KIT": 450,
        "TRAUMA_KIT": 8500
    }
    
    items = []
    for _, row in inventory_df.iterrows():
        item_id = row["item_id"]
        items.append({
            "item_name": row["item_name"],
            "category": category_map.get(item_id, "General"),
            "current_stock": int(row["current_stock"]),
            "minimum_stock": int(row["min_threshold"]),
            "unit": unit_map.get(item_id, "units"),
            "unit_price_inr": price_map.get(item_id, 1000),
            "status": "low" if row["current_stock"] < row["min_threshold"] else "adequate"
        })
    
    return items
