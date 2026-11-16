from typing import Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.patient import Patient
from app.models.screening import ScreeningAssessment
from app.models.follow_up import FollowUpTask
from app.schemas.dashboard import DashboardStatsResponse, CategoryStat

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Get high-level preventive screening statistics for the clinical dashboard.
    """
    total_patients = db.query(Patient).count()
    all_screenings = db.query(ScreeningAssessment).all()
    
    total_evals = len(all_screenings)
    total_overdue = sum(1 for s in all_screenings if s.status == "overdue")
    total_flagged_risk = sum(1 for s in all_screenings if s.status == "flagged_risk")

    pending_follow_ups = db.query(FollowUpTask).filter(
        FollowUpTask.status.in_(["pending", "scheduled", "overdue"])
    ).count()
    completed_follow_ups = db.query(FollowUpTask).filter(
        FollowUpTask.status == "completed"
    ).count()

    # Category breakdown
    categories_meta = [
        ("diabetes", "Type 2 Diabetes"),
        ("cardiovascular", "Cardiovascular Health"),
        ("cancer_breast", "Breast Cancer"),
        ("cancer_cervical", "Cervical Cancer"),
        ("cancer_colorectal", "Colorectal Cancer")
    ]

    breakdown = []
    for cat_key, cat_label in categories_meta:
        cat_items = [s for s in all_screenings if s.category == cat_key]
        breakdown.append(CategoryStat(
            category=cat_key,
            label=cat_label,
            up_to_date=sum(1 for s in cat_items if s.status == "up_to_date"),
            due_soon=sum(1 for s in cat_items if s.status == "due_soon"),
            overdue=sum(1 for s in cat_items if s.status == "overdue"),
            flagged_risk=sum(1 for s in cat_items if s.status == "flagged_risk"),
            not_indicated=sum(1 for s in cat_items if s.status == "not_indicated")
        ))

    # Risk distribution
    risk_distribution: Dict[str, int] = {
        "low": sum(1 for s in all_screenings if s.risk_level == "low"),
        "moderate": sum(1 for s in all_screenings if s.risk_level == "moderate"),
        "high": sum(1 for s in all_screenings if s.risk_level == "high"),
        "not_applicable": sum(1 for s in all_screenings if s.risk_level in ["not_applicable", "none"])
    }

    return DashboardStatsResponse(
        total_patients=total_patients,
        total_screenings_evaluated=total_evals,
        total_overdue=total_overdue,
        total_flagged_risk=total_flagged_risk,
        pending_follow_ups=pending_follow_ups,
        completed_follow_ups=completed_follow_ups,
        category_breakdown=breakdown,
        risk_distribution=risk_distribution
    )
