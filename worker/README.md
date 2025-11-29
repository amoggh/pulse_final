# Pulse Predictive Agent

A LangGraph-based intelligent agent for hospital patient surge prediction using Qwen3-32B LLM with thinking mode.

## 🎯 Overview

The Pulse Agent analyzes multiple context signals to predict patient surges and generate actionable alerts and recommendations for hospital management.

### Key Features

- **Multi-Factor Analysis**: Festivals, pollution (AQI), and epidemics
- **LLM-Powered Reasoning**: Uses Qwen3-32B with thinking mode for advanced analysis
- **Automated Alerts**: Generates severity-based alerts with actionable metrics
- **Smart Recommendations**: Provides specific recommendations for staffing, resources, and capacity
- **Database Integration**: Saves results to PostgreSQL database
- **Mock Data Fallback**: Works standalone without database for testing

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     PULSE AGENT WORKFLOW                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Load Context    │
                    │      Data        │
                    └──────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ Festival │  │Pollution │  │ Epidemic │
        │ Analysis │  │ Analysis │  │ Analysis │
        └──────────┘  └──────────┘  └──────────┘
                │             │             │
                └─────────────┼─────────────┘
                              ▼
                    ┌──────────────────┐
                    │ Surge Prediction │
                    └──────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │  Alert   │  │Recommend-│  │   Save   │
        │Generation│  │  ations  │  │ Results  │
        └──────────┘  └──────────┘  └──────────┘
```

## 📦 Components

### Nodes

1. **Data Loader** (`data_loader.py`)
   - Loads historical patient data
   - Fetches current context signals (AQI, festivals, epidemics)
   - Falls back to mock data if database unavailable

2. **Festival Analysis** (`festival_analysis.py`)
   - Analyzes festival impact on patient load
   - Predicts surge multipliers for major festivals
   - Uses LLM for intelligent reasoning

3. **Pollution Analysis** (`pollution_analysis.py`)
   - Evaluates AQI impact on respiratory cases
   - Considers seasonal pollution patterns
   - Predicts pollution-related patient increases

4. **Epidemic Analysis** (`epidemic_analysis.py`)
   - Identifies active disease outbreaks
   - Analyzes seasonal disease patterns
   - Predicts epidemic-related surges

5. **Surge Prediction** (`surge_prediction.py`)
   - Combines all analysis factors
   - Generates 7-day patient inflow forecast
   - Calculates risk levels and confidence scores

6. **Alert Generation** (`alert_generation.py`)
   - Creates severity-based alerts
   - Includes actionable metrics
   - Prioritizes by criticality

7. **Recommendations** (`recommendations.py`)
   - Generates specific action items
   - Covers staffing, resources, capacity, protocols
   - Prioritizes by urgency and impact

8. **Save Results** (`save_results.py`)
   - Persists all results to JSON files
   - Creates timestamped archives
   - Maintains latest results for API access

## 🚀 Quick Start

### Installation

```bash
# Navigate to worker directory
cd worker

# Install dependencies
pip install -r requirements.txt
```

### Configuration

Create a `.env` file:

```bash
# Database (optional)
DATABASE_URL=postgresql+psycopg2://user:pass@localhost:5432/pulse

# LLM Configuration
LLM_MODEL_NAME=Qwen/Qwen3-32B

# Email notifications (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password
```

### Running the Agent

#### Test Mode (Recommended for first run)
```bash
python -m worker.main test
```

#### Run Once
```bash
python -m worker.main once
```

#### Continuous Mode (Production)
```bash
python -m worker.main
```

Runs every hour automatically.

### Running Tests

```bash
python -m worker.test_agent
```

## 📊 Output

### Console Output

```
🏥 PULSE PREDICTIVE AGENT
============================================================
📊 Loading Context Data...
✅ Loaded mock data for Mock Hospital 1
  - Historical records: 300
  - Departments: 5
  - Current AQI: 245
  - Festival Flag: 1

🎉 Analyzing Festival Impact...
✅ Festival Analysis Complete
  - Festival: Diwali
  - Multiplier: 1.5x

🌫️ Analyzing Pollution Impact...
✅ Pollution Analysis Complete
  - AQI: 245 (Very Poor)
  - Multiplier: 1.3x

🦠 Analyzing Epidemic Impact...
✅ Epidemic Analysis Complete
  - Season: winter
  - Active Epidemics: flu, pneumonia
  - Multiplier: 1.2x

📈 Predicting Patient Surge...
✅ Surge Prediction Complete
  - Baseline: 80.0 patients/day
  - Predicted: 187.2 patients/day
  - Surge: 134.0% (2.34x)
  - Risk Level: HIGH
  - Peak: 2024-11-02

🚨 Generating Alerts...
✅ Generated 4 alerts
  - [HIGH] Patient Surge Alert: 134.0% Increase Expected
  - [MEDIUM] Festival Alert: Diwali
  - [HIGH] High Pollution Risk Alert
  - [HIGH] Epidemic Alert: flu

💡 Generating Recommendations...
✅ Generated 6 recommendations
  - [HIGH] Increase Staff Allocation
  - [HIGH] Stock Essential Medical Supplies
  - [MEDIUM] Prepare for Diwali
  - [HIGH] Prepare for Pollution-Related Cases
  - [HIGH] Epidemic Response: flu
  - [HIGH] Optimize Bed Capacity

💾 Saving Results...
✅ Saved full results to: output/analysis_20241129_073000.json
✅ Saved alerts to: output/alerts_20241129_073000.json
✅ Saved recommendations to: output/recommendations_20241129_073000.json
✅ Saved latest results to: output/latest_results.json
```

### JSON Output Files

#### `output/latest_results.json`
```json
{
  "metadata": {
    "timestamp": "2024-11-29T07:30:00",
    "analysis_id": "PULSE_20241129_073000",
    "version": "1.0.0"
  },
  "predictions": {
    "surge_prediction": {
      "baseline_inflow": 80.0,
      "predicted_inflow": 187.2,
      "predicted_surge_percentage": 134.0,
      "risk_level": "high",
      "confidence": 0.85
    }
  },
  "alerts": [...],
  "recommendations": [...]
}
```

## 🔧 API Integration (Future)

When you provide the APIs, update `data_loader.py`:

```python
# Add API calls for real-time data
import requests

def fetch_aqi_data(location):
    """Fetch real-time AQI from API"""
    response = requests.get(f"https://api.example.com/aqi?location={location}")
    return response.json()

def fetch_weather_data(location):
    """Fetch weather data from API"""
    response = requests.get(f"https://api.example.com/weather?location={location}")
    return response.json()

def fetch_disease_data(location):
    """Fetch disease outbreak data from API"""
    response = requests.get(f"https://api.example.com/diseases?location={location}")
    return response.json()
```

Then update the context signals loading:

```python
# In load_context_data function
state["context_signals"] = {
    "aqi": fetch_aqi_data(city).get("aqi"),
    "festival_flag": check_festival_calendar(current_date),
    "epidemic_tag": fetch_disease_data(city).get("active_diseases"),
    "weather": fetch_weather_data(city)
}
```

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
python -m worker.test_agent

# Test specific scenario
python -c "from worker.test_agent import test_agent_with_high_pollution; test_agent_with_high_pollution()"
```

### Manual Testing

```python
from agent.graph import run_agent

# Test with custom parameters
results = run_agent(hospital_id=1)

# Inspect results
print(results["surge_prediction"])
print(results["alerts"])
print(results["recommendations"])
```

## 📈 Performance

### LLM Performance

- **First run**: 30-60 seconds (model loading)
- **Subsequent runs**: 5-15 seconds per analysis
- **Memory**: ~24GB VRAM (GPU) or ~32GB RAM (CPU)

### Optimization Tips

1. **Use GPU**: Ensure CUDA is available
2. **Quantization**: Enable 8-bit for lower memory
3. **Batch Processing**: Process multiple hospitals together
4. **Caching**: Results cached in `output/latest_results.json`

## 🐛 Troubleshooting

### Common Issues

**1. Out of Memory**
```python
# In agent/llm.py, enable quantization
load_in_8bit=True
```

**2. Database Connection Failed**
- Agent automatically falls back to mock data
- Check `DATABASE_URL` in `.env`

**3. LLM Loading Slow**
- First run downloads model (~60GB)
- Subsequent runs use cached model
- Set `HF_HOME` to control cache location

**4. No Alerts Generated**
- Check if surge percentage > 20%
- Verify context signals are loaded
- Review analysis outputs in console

## 📝 Logging

Logs are printed to console. To save logs:

```bash
python -m worker.main once 2>&1 | tee agent_run.log
```

## 🔐 Security

- API keys stored in `.env` (not committed)
- Database credentials in environment variables
- No sensitive data in output files

## 📄 License

Part of the Pulse Hospital Management System.

## 🤝 Contributing

When adding new analysis nodes:

1. Create node in `agent/nodes/`
2. Add to `agent/nodes/__init__.py`
3. Update `agent/graph.py` workflow
4. Add tests in `test_agent.py`
5. Update this README

## 📞 Support

For issues or questions, contact the development team.
