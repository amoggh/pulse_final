# Pulse - Run Instructions & Error Analysis

## 📋 Current Directory Analysis

### Project Structure
This is a **full-stack hospital operations AI cockpit** with:
- **Backend**: FastAPI (Python) - Port 8000
- **Frontend**: React + TypeScript + Vite - Port 5173
- **Database**: SQLite (`pulse.db`)

### ✅ Error Analysis

**No errors found!**
- ✅ No linter errors detected
- ✅ Python syntax is valid (main.py compiles successfully)
- ✅ All imports appear to be correct
- ✅ Configuration files are properly structured

### ⚠️ Notes
1. **No .env file** - Not required, but optional environment variables:
   - `SECRET_KEY` (defaults to "supersecretkey123")
   - `DATABASE_URL` (defaults to SQLite)
   - `GEMINI_API_KEY`, `OPENAI_API_KEY`, `GROQ_API_KEY` (optional, for LLM features)

2. **Frontend API endpoints** are hardcoded to `http://localhost:8000` - works for local development

---

## 🚀 How to Run

### Option 1: Docker (Recommended - Easiest)

**Prerequisites:** Docker Desktop must be running

```powershell
# From the project root (d:\mumbai)
docker-compose up --build
```

This will:
- Build and start both backend and frontend containers
- Backend available at: http://localhost:8000
- Frontend available at: http://localhost:5173
- API docs at: http://localhost:8000/docs

To stop:
```powershell
docker-compose down
```

---

### Option 2: Local Development (Backend + Frontend separately)

#### Step 1: Start Backend

```powershell
# Navigate to backend directory
cd backend

# Activate virtual environment (already exists)
.\venv\Scripts\activate

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Start the FastAPI server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will start on **http://localhost:8000**

#### Step 2: Start Frontend (in a new terminal)

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

The frontend will start on **http://localhost:5173**

---

## 🔍 Verification

### Backend Health Check
- Visit: http://localhost:8000/
- Should return: `{"message": "Pulse AI Cockpit Backend is running"}`

### API Documentation
- Visit: http://localhost:8000/docs
- Interactive Swagger UI for testing all endpoints

### Frontend
- Visit: http://localhost:5173
- Should load the Pulse dashboard

---

## 🐛 Troubleshooting

### If backend fails to start:
1. Check if port 8000 is already in use
2. Ensure Python 3.10+ is installed
3. Verify all dependencies: `pip install -r backend/requirements.txt`

### If frontend fails to start:
1. Check if port 5173 is already in use
2. Ensure Node.js 18+ is installed
3. Clear node_modules and reinstall: `rm -r node_modules; npm install`

### If Docker fails:
1. Ensure Docker Desktop is running
2. Check Docker daemon is active
3. Try rebuilding: `docker-compose build --no-cache`

---

## 📝 Quick Start Commands (PowerShell)

```powershell
# Option 1: Docker
docker-compose up --build

# Option 2: Local - Backend
cd backend
.\venv\Scripts\activate
python -m uvicorn app.main:app --reload

# Option 2: Local - Frontend (new terminal)
cd frontend
npm install
npm run dev
```
