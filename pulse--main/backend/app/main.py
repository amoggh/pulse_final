from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, aqi, forecast, alerts, status, kpi, decision, scenarios, inventory, staffing, departments, actions, landing
from app.scheduler.jobs import start_scheduler

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal Server Error",
            "detail": str(exc),
            "traceback": traceback.format_exc()
        },
    )

# Include Routers with /api prefix for frontend compatibility
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(kpi.router, prefix="/api/kpi", tags=["kpi"])
app.include_router(decision.router, prefix="/api/decision", tags=["decision"])
app.include_router(actions.router, prefix="/api/actions", tags=["actions"])
app.include_router(forecast.router, prefix="/api/forecast", tags=["forecast"])
app.include_router(scenarios.router, prefix="/api/scenarios", tags=["scenarios"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["inventory"])
app.include_router(staffing.router, prefix="/api/staffing", tags=["staffing"])
app.include_router(departments.router, prefix="/api/departments", tags=["departments"])
app.include_router(aqi.router, prefix="/aqi", tags=["aqi"])
app.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
app.include_router(status.router, prefix="/status", tags=["status"])
app.include_router(landing.router, prefix="/landing", tags=["landing"])

@app.on_event("startup")
def startup_event():
    start_scheduler()

@app.get("/")
def root():
    return {"message": "Pulse AI Cockpit Backend is running"}
