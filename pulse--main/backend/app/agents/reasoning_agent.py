import json
from datetime import datetime
from typing import Dict, Any, List
from app.services.llm_service import LLMService
from app.models.schemas import DecisionInput, DecisionOutput, DecisionActions, ActionItem
from app.agents.data_agent import DataAgent
from app.agents.forecast_agent import ForecastAgent

class ReasoningAgent:
    def __init__(self):
        self.llm_service = LLMService()
        self.data_agent = DataAgent()
        self.forecast_agent = ForecastAgent()

    def analyze_situation(self) -> DecisionOutput:
        """
        Orchestrates the decision-making process:
        1. Gathers real-time data
        2. Generates forecasts
        3. Constructs a reasoning prompt
        4. Gets LLM decision
        """
        # 1. Gather Data
        kpis = self.data_agent.get_current_kpi()
        context = {
            "is_festival": self.data_agent.get_festival_status(),
            "inventory_status": self.data_agent.get_inventory_status(),
            "department_load": self.data_agent.get_department_load()
        }
        
        # 2. Generate Forecast
        forecast_data = self.forecast_agent.generate_forecast(horizon_days=7, aqi_override=kpis['aqi'])
        forecast_summary = self.forecast_agent.get_forecast_summary(forecast_data)
        
        # 3. Construct Input Model
        decision_input = DecisionInput(
            occupancy_rate=kpis['occupancy'],
            aqi=kpis['aqi'],
            admissions_24h=kpis['admissions_24h'],
            forecast_admissions_avg=forecast_summary.get('forecast_admissions_avg', 0),
            forecast_peak=forecast_summary.get('forecast_peak', 0),
            forecast_trend=forecast_summary.get('forecast_trend', 'stable'),
            is_festival=context['is_festival'],
            is_weekend=datetime.now().weekday() >= 5,
            department_load=context['department_load'],
            inventory_status=context['inventory_status']
        )
        
        # 4. Generate Prompt
        prompt = self._construct_prompt(decision_input)
        
        # 5. Get Decision
        decision_dict = self.llm_service.generate_decision(prompt)
        
        # 6. Validate and Return
        return DecisionOutput(**decision_dict)

    def _construct_prompt(self, input_data: DecisionInput) -> str:
        return f"""
You are an expert Hospital Operations Manager AI. Your goal is to analyze the current hospital state and forecast to make critical operational decisions.

**Current State:**
- Occupancy: {input_data.occupancy_rate}%
- AQI: {input_data.aqi} (Air Quality Index)
- Admissions (Last 24h): {input_data.admissions_24h}
- Festival Mode: {"YES" if input_data.is_festival else "NO"}
- Weekend: {"YES" if input_data.is_weekend else "NO"}

**Forecast (Next 7 Days):**
- Average Admissions: {input_data.forecast_admissions_avg}/day
- Peak Admissions: {input_data.forecast_peak}
- Trend: {input_data.forecast_trend.upper()}

**Department Status:**
{json.dumps(input_data.department_load, indent=2)}

**Inventory Status:**
{json.dumps(input_data.inventory_status, indent=2)}

**Domain Rules (Guidelines):**
- AQI > 200 implies high respiratory risk.
- Occupancy > 85% is High Load; > 95% is Critical.
- Festival mode increases trauma/emergency risk.
- Admissions delta > 15% indicates a surge.

**Task:**
Analyze these signals and provide a structured decision.
1. Determine the overall **Risk Level** (Low, Moderate, High, Critical).
2. Recommend specific **Actions** for Staffing, Supplies, Bed Management, and Advisories.
3. Provide a **Reasoning Trace** explaining *why* based on the data.

**Output Format (JSON ONLY):**
{{
  "risk_level": "High",
  "actions": {{
     "staffing": [{{"action": "...", "priority": "High/Medium/Low"}}],
     "supplies": [{{"action": "...", "priority": "..."}}],
     "bed_management": [{{"action": "...", "priority": "..."}}],
     "advisory": [{{"action": "...", "priority": "..."}}]
  }},
  "reasoning_trace": [
     "AQI is 260 which falls in high respiratory risk category",
     "Forecasted admissions are 22% above baseline",
     ...
  ]
}}
"""
