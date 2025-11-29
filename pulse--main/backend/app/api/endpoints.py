from fastapi import APIRouter, HTTPException
from app.models.schemas import ForecastRequest, ForecastResponse, Recommendation, ChatRequest, ChatResponse
from app.agents.forecast_agent import ForecastAgent
from app.agents.decision_agent import DecisionAgent
from app.agents.communication_agent import CommunicationAgent
from app.agents.data_agent import DataAgent
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize agents
forecast_agent = ForecastAgent()
decision_agent = DecisionAgent()
communication_agent = CommunicationAgent()
data_agent = DataAgent()

@router.post("/forecast", response_model=ForecastResponse)
def get_forecast(request: ForecastRequest):
    """
    Generate admission forecast based on parameters.
    Supports AQI override and festival scenarios.
    """
    try:
        logger.info(f"Forecast request: horizon={request.horizon_days}, aqi={request.aqi_override}, festival={request.is_festival}")
        
        forecast_data = forecast_agent.generate_forecast(
            horizon_days=request.horizon_days,
            aqi_override=request.aqi_override,
            is_festival=request.is_festival
        )
        
        # Generate summary
        avg = sum(d['yhat'] for d in forecast_data) / len(forecast_data)
        peak = max(d['yhat'] for d in forecast_data)
        
        summary = f"Forecast generated for {request.horizon_days} days. "
        summary += f"Average: {avg:.0f} admissions/day, Peak: {peak:.0f} admissions."
        
        if request.aqi_override and request.aqi_override > 200:
            summary += f" High AQI ({request.aqi_override}) scenario applied."
        if request.is_festival:
            summary += " Festival impact included."
        
        return ForecastResponse(
            forecasts=forecast_data,
            summary=summary
        )
    except Exception as e:
        logger.error(f"Forecast error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Forecast generation failed: {str(e)}")

@router.get("/recommendations", response_model=list[Recommendation])
def get_recommendations(aqi: int = None):
    """
    Get operational recommendations based on forecast and current conditions.
    """
    try:
        # Use live AQI if not provided
        if aqi is None:
            aqi = data_agent.get_live_aqi()
        
        logger.info(f"Recommendations request: aqi={aqi}")
        
        # Get forecast to base decisions on
        forecast_data = forecast_agent.generate_forecast(horizon_days=7, aqi_override=aqi)
        recs = decision_agent.evaluate_risks(forecast_data, current_aqi=aqi)
        
        logger.info(f"Generated {len(recs)} recommendations")
        return recs
    except Exception as e:
        logger.error(f"Recommendations error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Recommendations generation failed: {str(e)}")

@router.post("/agent-chat", response_model=ChatResponse)
def chat_with_pulse(request: ChatRequest):
    """
    Natural language interface for querying the system.
    Supports questions about forecasts, staffing, AQI, and recommendations.
    """
    try:
        logger.info(f"Chat request: '{request.message}'")
        response = communication_agent.process_query(request.message, request.context)
        return response
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

@router.get("/kpi")
def get_kpis():
    """
    Get current hospital KPIs (occupancy, admissions, AQI, risk score).
    """
    try:
        kpis = data_agent.get_current_kpi()
        logger.info(f"KPI request: {kpis}")
        return kpis
    except Exception as e:
        logger.error(f"KPI error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"KPI retrieval failed: {str(e)}")

@router.get("/scenarios")
def compare_scenarios(horizon_days: int = 7):
    """
    Compare multiple forecast scenarios (baseline, high AQI, festival).
    Useful for scenario planning and visualization.
    """
    try:
        logger.info(f"Scenario comparison request: horizon={horizon_days}")
        scenarios = forecast_agent.compare_scenarios(horizon_days=horizon_days)
        
        # Add summary statistics for each scenario
        # Create a list of items to iterate over to avoid "dictionary changed size" error
        for scenario_name, forecast_data in list(scenarios.items()):
            avg = sum(d['yhat'] for d in forecast_data) / len(forecast_data)
            peak = max(d['yhat'] for d in forecast_data)
            scenarios[f"{scenario_name}_stats"] = {
                "average": round(avg, 1),
                "peak": round(peak, 1)
            }
        
        return scenarios
    except Exception as e:
        logger.error(f"Scenario comparison error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Scenario comparison failed: {str(e)}")

@router.get("/inventory")
def get_inventory():
    """
    Get current inventory data with INR pricing.
    """
    try:
        inventory = data_agent.get_inventory_data()
        logger.info(f"Inventory request: {len(inventory)} items")
        return inventory
    except Exception as e:
        logger.error(f"Inventory error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Inventory retrieval failed: {str(e)}")

@router.get("/staffing")
def get_staffing():
    """
    Get staffing data with schedules and INR hourly rates.
    """
    try:
        staffing = data_agent.get_staffing_data()
        logger.info(f"Staffing request: {len(staffing)} staff members")
        return staffing
    except Exception as e:
        logger.error(f"Staffing error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Staffing retrieval failed: {str(e)}")

@router.get("/departments")
def get_departments():
    """
    Get department information including bed capacity.
    """
    try:
        departments = data_agent.get_departments_data()
        logger.info(f"Departments request: {len(departments)} departments")
        return departments
    except Exception as e:
        logger.error(f"Departments error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Departments retrieval failed: {str(e)}")

# --- Decision Engine Endpoints ---

from app.agents.reasoning_agent import ReasoningAgent
from app.models.schemas import DecisionOutput

reasoning_agent = ReasoningAgent()

@router.get("/decision/evaluate", response_model=DecisionOutput)
def evaluate_decision():
    """
    Triggers the Agentic Decision Engine.
    Combines live data, forecasts, and LLM reasoning to generate operational actions.
    """
    try:
        logger.info("Decision evaluation requested")
        decision = reasoning_agent.analyze_situation()
        return decision
    except Exception as e:
        logger.error(f"Decision engine error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Decision engine failed: {str(e)}")
