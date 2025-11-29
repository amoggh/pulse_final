#!/usr/bin/env python
"""Test script to check for import errors"""

try:
    print("Testing imports...")
    from app.core.config import settings
    print("✓ Config loaded")
    
    from app.core.database import Base, engine
    print("✓ Database loaded")
    
    from app.agents import data_agent
    print("✓ Data agent loaded")
    
    from app.agents import forecast_agent
    print("✓ Forecast agent loaded")
    
    from app.agents import decision_agent
    print("✓ Decision agent loaded")
    
    from app.api import kpi, decision, scenarios
    print("✓ New API modules loaded")
    
    print("\n✅ All imports successful!")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
