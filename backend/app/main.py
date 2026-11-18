from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import engine, Base, SessionLocal
from app.services.seed_data import seed_database_if_empty
from app.routes import (
    health_router,
    patients_router,
    assessment_router,
    recommendations_router,
    followups_router,
    analytics_router,
    dashboard_router,
    screenings_router,
    auth_router
)

# Ensure all database tables exist immediately upon import
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize all database tables
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed initial synthetic demo patient data if database is empty
    db = SessionLocal()
    try:
        seed_database_if_empty(db)
    finally:
        db.close()
    
    yield

app = FastAPI(
    title="ScreenWise AI API",
    description="ScreenWise AI - Adult Preventive Healthcare Screening Support Platform",
    version="1.0.0",
    lifespan=lifespan
)

# Secure CORS Middleware configuration restricted to authorized origins and cloud deploy preview domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|.*\.vercel\.app|.*\.netlify\.app|.*\.onrender\.com|.*\.railway\.app)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allow_headers=["*"],
)

# Primary API routes mounted under /api as specified
app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(patients_router, prefix="/api")
app.include_router(assessment_router, prefix="/api")
app.include_router(recommendations_router, prefix="/api")
app.include_router(followups_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(screenings_router, prefix="/api")

# Also mount under /api/v1 for seamless frontend compatibility
app.include_router(health_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(patients_router, prefix="/api/v1")
app.include_router(assessment_router, prefix="/api/v1")
app.include_router(recommendations_router, prefix="/api/v1")
app.include_router(followups_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")
app.include_router(screenings_router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "name": "ScreenWise AI API",
        "description": "Adult Preventive Healthcare Screening Decision Support Platform",
        "notice": "Screening-support tool, NOT a diagnostic system.",
        "documentation": "/docs",
        "health": "/api/health"
    }
