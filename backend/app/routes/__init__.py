from app.routes.health import router as health_router
from app.routes.patients import router as patients_router
from app.routes.screenings import router as screenings_router
from app.routes.follow_ups import router as follow_ups_router
from app.routes.dashboard import router as dashboard_router

__all__ = [
    "health_router",
    "patients_router",
    "screenings_router",
    "follow_ups_router",
    "dashboard_router"
]
