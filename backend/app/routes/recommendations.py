from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.recommendation import RecommendationResponse, RecommendationStatusUpdate
from app.services import recommendation_service, patient_service

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("", response_model=List[RecommendationResponse])
def list_recommendations(
    category: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    review_status: Optional[str] = Query(None),
    patient_id: Optional[int] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    List clinical recommendations across the cohort with filtering by category, priority, and review status.
    """
    return recommendation_service.get_recommendations(
        db,
        patient_id=patient_id,
        category=category,
        priority=priority,
        review_status=review_status,
        limit=limit,
        skip=skip
    )

@router.get("/{patient_id}", response_model=List[RecommendationResponse])
def get_patient_recommendations(
    patient_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve all preventive recommendations for a specific patient.
    """
    patient = patient_service.get_patient_by_id(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return recommendation_service.get_patient_recommendations(db, patient_id)

@router.put("/{recommendation_id}/status", response_model=RecommendationResponse)
def update_recommendation_review_status(
    recommendation_id: int,
    update: RecommendationStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Update professional review status (pending_review, acknowledged, ordered).
    """
    rec = recommendation_service.update_recommendation_status(
        db,
        recommendation_id,
        update.professional_review_status
    )
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    recs = recommendation_service.get_recommendations(db, patient_id=rec.patient_id)
    for r in recs:
        if r.id == recommendation_id:
            return r
    return rec
