# Pulse - Enterprise Agentic AI Hospital Operations Cockpit

## 🏥 Why Pulse?
Pulse transforms hospital operations from reactive to predictive. Unlike traditional dashboards that just show what happened, Pulse uses **Agentic AI** to forecast patient surges, simulate operational scenarios (like high AQI or festivals), and autonomously recommend staffing and supply adjustments. It is designed for hospital administrators, ER leads, and inventory managers who need a "Command Center" view of their facility.

## 🏗️ System Architecture
Pulse is a full-stack application built with:
- **Frontend**: React (Vite) + TypeScript + TailwindCSS + ShadCN UI + Recharts.
- **Backend**: FastAPI (Python) + Prophet (Forecasting) + Pandas.
- **Agent Layer**: A multi-agent pipeline for data generation, forecasting, decision-making, and communication.

### Multi-Agent Pipeline
1.  **Data Agent**: Generates synthetic historical and live operational data (Occupancy, AQI).
2.  **Forecast Agent**: Uses Prophet-based logic to predict admissions 7-30 days out, accounting for seasonality and external factors (AQI, Festivals).
3.  **Decision Agent**: Evaluates forecasts against safety thresholds to trigger "Staffing" or "Supply" recommendations.
4.  **Communication Agent**: Powers the "Ask Pulse" natural language interface.

## 🚀 Demo Setup Instructions

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local dev)
- Python 3.10+ (for local dev)

### Quick Start (Docker)
```bash
docker-compose up --build
```
Access the app at `http://localhost:5173`.
API docs at `http://localhost:8000/docs`.

### Local Development
**Backend:**
```bash
cd backend
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 📸 Features
- **Global Command Center**: Real-time KPIs (Occupancy, Risk Score, AQI).
- **Forecast Lab**: Advanced analytics with multi-line charts, uncertainty bands, model metrics (MAPE, R²), and feature importance.
- **Scenario Sandbox**: Compare "High AQI" vs "Festival" impact on beds and staff.
- **Agent Actions**: Explainable AI recommendations with an **Approval Workflow** (Human-in-the-loop).
- **Ask Pulse**: Chat with your data using natural language.

## 🗺️ Future Roadmap
- [ ] Integration with real EMR/EHR systems (HL7/FHIR).
- [ ] Advanced resource optimization using Linear Programming.
- [ ] Multi-hospital fleet management.
- [ ] SMS/WhatsApp integration for staff alerts.
