"""
LLM Prompt Templates for Agent Nodes
"""

FESTIVAL_ANALYSIS_PROMPT = """You are a healthcare analytics expert analyzing festival impact in India.

Current Information:
- Date: {current_date}
- Festival Flag: {festival_flag}
- Season: {season}
- Location: {city}

Context:
Major Indian festivals cause predictable patient surges:
- Diwali (Oct): 40-60% surge in respiratory cases (firecracker smoke, burns)
- Holi (Mar): 30-40% surge in trauma/accidents (injuries, eye problems)
- Ganesh Chaturthi (Aug-Sep): 20-30% general surge (crowd-related incidents)

Pre-festival (3 days before) and post-festival (2 days after) also see increased admissions.

Task:
Analyze if we are in or near a festival period and provide:
1. Is this a festival period? (yes/no)
2. Festival name (if applicable)
3. Days until peak impact
4. Surge multiplier (1.0 = no impact, 1.6 = maximum impact)
5. Most affected departments (ER, ICU, OPD)
6. Brief reasoning (2-3 sentences)

Respond in JSON format:
{{
  "is_festival_period": boolean,
  "festival_name": string or null,
  "days_until_peak": integer,
  "surge_multiplier": float,
  "affected_departments": [list of strings],
  "reasoning": string
}}
"""

POLLUTION_ANALYSIS_PROMPT = """You are an air quality and public health expert analyzing pollution impact on healthcare in India.

Current Information:
- AQI Level: {aqi}
- Date: {current_date}
- Season: {season}
- Location: {city}

Context:
AQI Categories and Health Impact:
- 0-50 (Good): Minimal impact
- 51-100 (Moderate): Sensitive groups affected
- 101-200 (Poor): 20% increase in respiratory admissions
- 201-300 (Very Poor): 30-40% increase
- 301+ (Severe): 50%+ increase

Pollution Seasons in India:
- Oct-Nov: Crop burning season (AQI often >250)
- Dec-Jan: Winter smog (temperature inversion traps pollutants)
- Jul-Sep: Monsoon (lower pollution, better air quality)

Task:
Analyze the current pollution level and provide:
1. Pollution category (Good/Moderate/Poor/Very Poor/Severe)
2. Is this a high pollution season? (yes/no)
3. Surge multiplier for respiratory cases (1.0 = no impact, 1.5 = severe)
4. Affected conditions (asthma, COPD, bronchitis, etc.)
5. Brief reasoning (2-3 sentences)

Respond in JSON format:
{{
  "aqi_level": float,
  "pollution_category": string,
  "is_pollution_season": boolean,
  "surge_multiplier": float,
  "affected_conditions": [list of strings],
  "reasoning": string
}}
"""

EPIDEMIC_ANALYSIS_PROMPT = """You are an epidemiologist analyzing seasonal disease patterns in India.

Current Information:
- Date: {current_date}
- Season: {season}
- Epidemic Tag: {epidemic_tag}
- Location: {city}

Context:
Seasonal Disease Patterns in India:
- Monsoon (Jul-Sep): Dengue, malaria, cholera, gastroenteritis (40-50% surge in ER)
- Winter (Dec-Feb): Flu, pneumonia, bronchitis (30-40% surge in respiratory)
- Summer (Mar-May): Heat stroke, dehydration (moderate surge)

Vector-borne diseases peak during and after monsoon.
Respiratory illnesses peak in winter due to cold + pollution.

Task:
Analyze the current epidemic risk and provide:
1. Current season (monsoon/winter/summer)
2. Active epidemics (list of diseases)
3. Surge multiplier (1.0 = no epidemic, 1.5 = severe outbreak)
4. Most affected departments
5. Brief reasoning (2-3 sentences)

Respond in JSON format:
{{
  "season": string,
  "active_epidemics": [list of strings],
  "surge_multiplier": float,
  "affected_departments": [list of strings],
  "reasoning": string
}}
"""

SURGE_PREDICTION_PROMPT = """You are a hospital capacity planning expert synthesizing multiple factors to predict patient surges.

Current Information:
- Baseline daily admissions: {baseline}
- Historical average: {historical_avg}

Analysis Results:
- Festival Impact: {festival_multiplier}x ({festival_reasoning})
- Pollution Impact: {pollution_multiplier}x ({pollution_reasoning})
- Epidemic Impact: {epidemic_multiplier}x ({epidemic_reasoning})

Task:
Combine these factors to predict the final surge:
1. Calculate combined multiplier (consider interactions, not just multiplication)
2. Predict final surge percentage above baseline
3. Assess confidence level (high/medium/low based on data quality)
4. Estimate peak date (when will surge be highest?)
5. Provide comprehensive reasoning (3-4 sentences explaining the synthesis)

Important: Factors may interact (e.g., pollution + festival = compounding effect)

Respond in JSON format:
{{
  "combined_multiplier": float,
  "surge_percentage": float,
  "confidence": string,
  "peak_date_offset_days": integer,
  "reasoning": string
}}
"""

ALERT_GENERATION_PROMPT = """You are a hospital operations manager crafting urgent alerts for healthcare staff.

Prediction:
- Predicted surge: {surge_percentage}%
- Peak date: {peak_date}
- Confidence: {confidence}

Context:
- Festival: {festival_context}
- Pollution: {pollution_context}
- Epidemic: {epidemic_context}

Task:
Create a clear, actionable alert:
1. Determine severity (LOW <20%, MEDIUM 20-50%, HIGH >50%)
2. Write a concise title (max 80 chars)
3. Write a clear message explaining the situation (2-3 sentences)
4. Identify context type (festival/pollution/epidemic/combined)

The alert should be professional, urgent but not alarmist, and actionable.

Respond in JSON format:
{{
  "severity": string,
  "title": string,
  "message": string,
  "context_type": string
}}
"""

RECOMMENDATION_PROMPT = """You are a healthcare resource planning expert providing specific, actionable recommendations.

Situation:
- Predicted surge: {surge_percentage}%
- Peak date: {peak_date}
- Current resources: {current_resources}

Context:
- Festival: {festival_context}
- Pollution: {pollution_context}
- Epidemic: {epidemic_context}

Task:
Generate 3-5 specific recommendations covering:
1. Staffing (roster changes, on-call doctors)
2. Supplies (medicines, equipment to stock up)
3. Beds/Capacity (prepare additional beds, ICU capacity)
4. Protocols (special procedures, triage updates)

Each recommendation should include:
- Type (staffing/supplies/beds/protocol)
- Specific action (what exactly to do)
- Priority (urgent/high/medium)
- Timeline (when to implement)
- Brief reasoning

Respond in JSON format as a list:
[
  {{
    "type": string,
    "action": string,
    "priority": string,
    "timeline": string,
    "reasoning": string
  }}
]
"""
