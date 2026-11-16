from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.recommendation import Recommendation
from app.models.patient import Patient
from app.schemas.recommendation import RecommendationResponse

def get_recommendations(
    db: Session,
    patient_id: Optional[int] = None,
    category: Optional[str] = None,
    priority: Optional[str] = None,
    review_status: Optional[str] = None,
    limit: int = 100,
    skip: int = 0
) -> List[RecommendationResponse]:
    query = db.query(Recommendation).join(Patient)

    if patient_id:
        query = query.filter(Recommendation.patient_id == patient_id)
    if category and category != "all":
        query = query.filter(Recommendation.screening_category == category)
    if priority and priority != "all":
        query = query.filter(Recommendation.priority == priority)
    if review_status and review_status != "all":
        query = query.filter(Recommendation.professional_review_status == review_status)

    recs = query.order_by(
        Recommendation.priority.desc(),
        Recommendation.id.desc()
    ).offset(skip).limit(limit).all()

    result = []
    for r in recs:
        resp = RecommendationResponse(
            id=r.id,
            patient_id=r.patient_id,
            patient_name=r.patient.full_name if r.patient else "Patient",
            patient_reference=r.patient.patient_reference if r.patient else f"SW-{r.patient_id}",
            assessment_id=r.assessment_id,
            screening_category=r.screening_category,
            recommendation=r.recommendation,
            rationale=r.rationale,
            suggested_timing=r.suggested_timing,
            priority=r.priority,
            professional_review_status=r.professional_review_status,
            category=r.screening_category,
            review_status=r.professional_review_status,
            flagged_reasons=[r.rationale] if r.rationale else [],
            suggested_next_steps=[r.recommendation] if r.recommendation else []
        )
        result.append(resp)
    return result

def get_patient_recommendations(db: Session, patient_id: int) -> List[RecommendationResponse]:
    return get_recommendations(db, patient_id=patient_id)

def update_recommendation_status(
    db: Session,
    recommendation_id: int,
    status: str
) -> Optional[Recommendation]:
    rec = db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()
    if not rec:
        return None
    try:
        rec.professional_review_status = status
        db.commit()
        db.refresh(rec)
        return rec
    except Exception as e:
        db.rollback()
        raise e
