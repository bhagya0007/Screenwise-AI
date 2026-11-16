from app.routes.health import router as health_router
from app.routes.patients import router as patients_router
from app.routes.assessment import router as assessment_router
from app.routes.recommendations import router as recommendations_router
from app.routes.followups import router as followups_router
from app.routes.analytics import router as analytics_router
from app.routes.dashboard import router as dashboard_router
from app.routes.screenings import router as screenings_router

__all__ = [
    "health_router",
    "patients_router",
    "assessment_router",
    "recommendations_router",
    "followups_router",
    "analytics_router",
    "dashboard_router",
    "screenings_router"
]
