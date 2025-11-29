# Pulse Agent - System Integration Guide

## 🔗 Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PULSE SYSTEM OVERVIEW                           │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────┐
│   Frontend (Web) │◄────────│  Backend (API)   │◄────────│  Database    │
│   React + Vite   │  HTTP   │  FastAPI         │  SQL    │  PostgreSQL  │
└──────────────────┘         └──────────────────┘         └──────────────┘
                                      ▲                            ▲
                                      │                            │
                                      │ Read/Write                 │
                                      │ Alerts &                   │
                                      │ Predictions                │
                                      │                            │
                             ┌────────┴────────┐                   │
                             │                 │                   │
                             │  PULSE AGENT    │───────────────────┘
                             │  (Worker)       │    Saves Results
                             │                 │
                             └────────┬────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
            ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
            │ External APIs│  │  Qwen3-32B   │  │  LangGraph   │
            │ (Future)     │  │     LLM      │  │  Workflow    │
            └──────────────┘  └──────────────┘  └──────────────┘
            • AQI/Weather         • Thinking        • State Mgmt
            • Disease Data        • Reasoning       • Node Routing
            • Festival Cal        • JSON Output     • Error Handle
```

## 📊 Data Flow

```
1. DATA COLLECTION
   ┌─────────────────────────────────────────────────────┐
   │ Database                    External APIs (Future)  │
   │ • Historical patient data   • Real-time AQI         │
   │ • Current resources         • Weather data          │
   │ • Context signals           • Disease outbreaks     │
   └────────────────┬────────────────────────────────────┘
                    │
                    ▼
2. ANALYSIS PIPELINE
   ┌─────────────────────────────────────────────────────┐
   │              LangGraph Workflow                      │
   │                                                      │
   │  Load Data → Festival → Pollution → Epidemic        │
   │                    ↓         ↓          ↓           │
   │              Surge Prediction (LLM)                 │
   │                         ↓                           │
   │         Alerts ← → Recommendations                  │
   └────────────────┬────────────────────────────────────┘
                    │
                    ▼
3. OUTPUT GENERATION
   ┌─────────────────────────────────────────────────────┐
   │ • JSON files (timestamped + latest)                 │
   │ • Database alerts (for API consumption)             │
   │ • Email notifications (critical alerts)             │
   └─────────────────────────────────────────────────────┘
```

## 🔄 Agent Workflow Detail

```
START
  │
  ├─► Load Context Data
  │   ├─ Try database connection
  │   ├─ Fetch historical patient data (60 days)
  │   ├─ Get current resources (beds, staff, supplies)
  │   ├─ Get context signals (AQI, festivals, epidemics)
  │   └─ Fallback to mock data if DB unavailable
  │
  ├─► Festival Analysis (LLM)
  │   ├─ Check festival calendar
  │   ├─ Analyze festival impact patterns
  │   ├─ Calculate surge multiplier (1.0 - 1.6x)
  │   └─ Identify affected departments
  │
  ├─► Pollution Analysis (LLM)
  │   ├─ Evaluate current AQI level
  │   ├─ Consider seasonal patterns
  │   ├─ Calculate respiratory case surge (1.0 - 1.5x)
  │   └─ Identify affected conditions
  │
  ├─► Epidemic Analysis (LLM)
  │   ├─ Check active disease outbreaks
  │   ├─ Analyze seasonal disease patterns
  │   ├─ Calculate epidemic surge (1.0 - 1.5x)
  │   └─ Identify affected departments
  │
  ├─► Surge Prediction (LLM)
  │   ├─ Combine all multipliers intelligently
  │   ├─ Calculate predicted patient inflow
  │   ├─ Generate 7-day forecast
  │   ├─ Determine risk level (low/medium/high)
  │   └─ Assess confidence score
  │
  ├─► Generate Alerts
  │   ├─ Create severity-based alerts
  │   │   ├─ Critical (>50% surge)
  │   │   ├─ High (35-50% surge)
  │   │   └─ Medium (20-35% surge)
  │   ├─ Add actionable metrics
  │   └─ Set expiry dates
  │
  ├─► Generate Recommendations
  │   ├─ Staffing recommendations
  │   ├─ Resource stocking
  │   ├─ Capacity management
  │   ├─ Protocol updates
  │   └─ Prioritize by urgency
  │
  └─► Save Results
      ├─ Write JSON files
      ├─ Save to database (if available)
      ├─ Send email notifications
      └─ Log summary
END
```

## 🗂️ File Structure

```
worker/
├── agent/
│   ├── __init__.py              # Package init, exports create_agent_graph
│   ├── state.py                 # AgentState TypedDict schema
│   ├── prompts.py               # LLM prompt templates
│   ├── utils.py                 # Utility functions
│   ├── llm.py                   # Qwen3-32B LLM integration
│   ├── graph.py                 # LangGraph workflow definition
│   │
│   └── nodes/
│       ├── __init__.py          # Node exports
│       ├── data_loader.py       # Load context data
│       ├── festival_analysis.py # Festival impact analysis
│       ├── pollution_analysis.py# Pollution impact analysis
│       ├── epidemic_analysis.py # Epidemic impact analysis
│       ├── surge_prediction.py  # Combine factors, predict surge
│       ├── alert_generation.py  # Generate alerts
│       ├── recommendations.py   # Generate recommendations
│       └── save_results.py      # Save outputs
│
├── output/                      # Generated output files
│   ├── analysis_YYYYMMDD_HHMMSS.json
│   ├── alerts_YYYYMMDD_HHMMSS.json
│   ├── recommendations_YYYYMMDD_HHMMSS.json
│   └── latest_results.json      # Latest run (for API)
│
├── main.py                      # Main entry point
├── test_agent.py                # Test suite
├── requirements.txt             # Python dependencies
├── README.md                    # Documentation
├── LLM_README.md               # LLM-specific docs
└── start.bat                    # Quick start script (Windows)
```

## 🔌 Integration Points

### 1. Database Integration (Current)

```python
# In data_loader.py
from app.app import models
from app.app.config import settings

# Reads from:
- models.Hospital
- models.Department
- models.PatientInflow
- models.ResourceSnapshot
- models.ContextSignals

# Writes to (in main.py):
- models.Alert
```

### 2. API Integration (Future)

Add these API calls to `data_loader.py`:

```python
# AQI/Weather API
GET https://api.weatherapi.com/v1/current.json?q={city}&aqi=yes

# Disease Surveillance API
GET https://api.diseaseoutbreak.gov.in/v1/active?location={city}

# Festival Calendar API
GET https://api.indianfestivals.com/v1/upcoming?date={date}
```

### 3. Frontend Integration

The frontend can consume results via:

```javascript
// Fetch latest predictions
fetch('/api/predictions/latest')
  .then(res => res.json())
  .then(data => {
    // data.predictions.surge_percentage
    // data.alerts
    // data.recommendations
  });

// Or read from file
fetch('/output/latest_results.json')
  .then(res => res.json())
  .then(data => displayPredictions(data));
```

## 🎯 Key Integration Steps

### Step 1: Database Setup (Done)
- ✅ Agent reads from existing database models
- ✅ Saves alerts to database
- ✅ Fallback to mock data if DB unavailable

### Step 2: API Integration (When Available)
1. Add API endpoint configurations to `.env`
2. Update `data_loader.py` to fetch from APIs
3. Add error handling and fallbacks
4. Test with real data

### Step 3: Frontend Display (When Ready)
1. Create API endpoint in backend to serve predictions
2. Update frontend to fetch and display:
   - Surge predictions
   - Active alerts
   - Recommendations
3. Add real-time updates (WebSocket or polling)

## 🚀 Deployment

### Development
```bash
# Run in test mode
python -m worker.main test
```

### Production
```bash
# Run as service (systemd example)
[Unit]
Description=Pulse Predictive Agent
After=network.target postgresql.service

[Service]
Type=simple
User=pulse
WorkingDirectory=/opt/pulse/worker
ExecStart=/opt/pulse/venv/bin/python -m worker.main
Restart=always

[Install]
WantedBy=multi-user.target
```

### Docker
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["python", "-m", "worker.main"]
```

## 📈 Monitoring

### Logs
```bash
# View logs
tail -f /var/log/pulse-agent.log

# Check last run
cat worker/output/latest_results.json | jq '.metadata'
```

### Metrics to Monitor
- Prediction accuracy (compare with actual patient counts)
- Alert response time
- LLM inference time
- Database query performance
- API call success rates (when integrated)

## 🔧 Configuration

### Environment Variables

```bash
# Required
DATABASE_URL=postgresql://...
LLM_MODEL_NAME=Qwen/Qwen3-32B

# Optional
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=alerts@pulse.com
SMTP_PASS=***

# API Keys (when available)
WEATHER_API_KEY=***
DISEASE_API_KEY=***
FESTIVAL_API_KEY=***
```

## 🎓 Training & Fine-tuning

To improve predictions:

1. **Collect feedback**: Track actual vs predicted surges
2. **Fine-tune prompts**: Adjust prompts in `prompts.py`
3. **Adjust multipliers**: Update fallback logic in nodes
4. **Fine-tune LLM**: Use hospital-specific data (advanced)

## 📞 Support & Troubleshooting

See `README.md` for detailed troubleshooting guide.

Common issues:
- Database connection → Falls back to mock data
- LLM OOM → Enable quantization
- Slow inference → Use GPU, reduce max_tokens
- No alerts → Check surge threshold (20%)

---

**Ready to integrate!** The agent is fully functional and can work standalone or with your existing database. When you provide the APIs, we'll integrate them into the data loader.
