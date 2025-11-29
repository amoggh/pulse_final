# Pulse Backend Walkthrough

I have regenerated the Pulse backend with a production-ready structure using FastAPI.

## Changes Implemented

### 1. Data Layer (`app/data/`)
- Generated synthetic CSV files for `admissions`, `aqi_history`, `bed_occupancy`, `departments`, `events_calendar`, `inventory`, `staffing`, and `weather_history`.
- **Note**: The `app/data` directory was missing, so I created it and populated it.

### 2. Core Infrastructure (`app/core/`)
- **`config.py`**: Centralized configuration using `pydantic-settings`.
- **`database.py`**: SQLAlchemy setup with SQLite (`pulse.db`).
- **`security.py`**: JWT authentication and password hashing.

### 3. Database Models (`app/models/`)
- Implemented `User`, `AQI`, `Forecast`, `Alert`, and `SystemStatus` models.

### 4. Agents (`app/agents/`)
- **`data_agent.py`**: Loads and merges CSVs into a feature-rich DataFrame.
- **`forecast_agent.py`**: Runs forecasts using Prophet (if available) or a rolling average fallback. Handles scenarios (High AQI, Festival).
- **`decision_agent.py`**: Evaluates risk based on AQI, occupancy, forecast surge, and inventory. Generates actionable recommendations.
- **`communication_agent.py`**: Formats the final JSON response.
- **`pipeline.py`**: Orchestrates the data flow between agents.

### 5. Services (`app/services/`)
- Encapsulated DB logic for Auth, AQI, Forecast, Alerts, and Status.

### 6. API (`app/api/`)
- **`auth.py`**: `/register` and `/login`.
- **`forecast.py`**: `/run` (triggers pipeline) and `/latest`.
- **`alerts.py`**: `/active` and `/resolve`.
- **`status.py`**: System status dashboard data.
- **`aqi.py`**: Historical AQI data.

### 7. Scheduler (`app/scheduler/`)
- Integrated `APScheduler` to run forecasts every 6 hours and status checks every hour.

## How to Run

1.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
2.  **Start the Server**:
    ```bash
    cd backend
    uvicorn app.main:app --reload
    ```
3.  **Access API**:
    - Swagger UI: `http://localhost:8000/docs`
    - Health Check: `http://localhost:8000/`

## Verification
- The system will automatically create `pulse.db` on the first run.
- The scheduler starts automatically with the app.
- You can test the forecast pipeline via `POST /forecast/run`.
