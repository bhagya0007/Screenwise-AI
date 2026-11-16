from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.screening import ScreeningAssessment
from app.models.patient import Patient
from app.schemas.screening import (
    ScreeningAssessmentResponse,
    ReviewStatusUpdate
)
from app.schemas.patient import PatientCreate
from app.services import screening_service, patient_service
from app.guidelines.engine import evaluate_all_screenings
from app.services.ai_explainer import generate_screening_explanation

router = APIRouter(prefix="/screenings", tags=["Screenings"])

@router.get("/recommendations", response_model=List[ScreeningAssessmentResponse])
def get_recommendations(
    category: Optional[str] = Query(None),
    review_status: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Retrieve clinical recommendations across all patients for overdue, flagged risk, or due soon screenings.
    """
    query = db.query(ScreeningAssessment).join(Patient).filter(
        ScreeningAssessment.status.in_(["overdue", "flagged_risk", "due_soon"])
    )
    if category:
        query = query.filter(ScreeningAssessment.category == category)
    if review_status:
        query = query.filter(ScreeningAssessment.review_status == review_status)
    if status:
        query = query.filter(ScreeningAssessment.status == status)

    assessments = query.order_by(
        ScreeningAssessment.status.desc(),
        ScreeningAssessment.risk_level.desc()
    ).all()

    result = []
    for a in assessments:
        item = ScreeningAssessmentResponse.model_validate(a)
        if a.patient:
            item.patient_name = a.patient.full_name
        result.append(item)
    return result

@router.put("/{assessment_id}/review", response_model=ScreeningAssessmentResponse)
def update_review_status(
    assessment_id: int,
    update: ReviewStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Update clinical review status (pending_review, acknowledged, ordered).
    """
    assessment = db.query(ScreeningAssessment).filter(ScreeningAssessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Screening assessment not found")
    assessment.review_status = update.review_status
    db.commit()
    db.refresh(assessment)
    item = ScreeningAssessmentResponse.model_validate(assessment)
    if assessment.patient:
        item.patient_name = assessment.patient.full_name
    return item

@router.get("/patient/{patient_id}", response_model=List[ScreeningAssessmentResponse])
def get_patient_screenings(
    patient_id: int,
    db: Session = Depends(get_db)
):
    """
    Get all screening assessments for a patient across all 5 pathways.
    """
    patient = patient_service.get_patient_by_id(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    screenings = screening_service.get_patient_screenings(db, patient_id)
    result = []
    for a in screenings:
        item = ScreeningAssessmentResponse.model_validate(a)
        item.patient_name = patient.full_name
        result.append(item)
    return result

@router.post("/evaluate/{patient_id}", response_model=List[ScreeningAssessmentResponse])
def re_evaluate_patient_screenings(
    patient_id: int,
    db: Session = Depends(get_db)
):
    """
    Re-evaluate all screening guidelines for a patient and update AI explanations.
    """
    patient = patient_service.get_patient_by_id(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    screenings = screening_service.evaluate_and_save_patient_screenings(db, patient)
    result = []
    for a in screenings:
        item = ScreeningAssessmentResponse.model_validate(a)
        item.patient_name = patient.full_name
        result.append(item)
    return result

@router.post("/simulate", response_model=List[ScreeningAssessmentResponse])
def simulate_screening_assessment(
    patient_in: PatientCreate
):
    """
    Simulate screening guideline evaluation for any transient or walk-in patient profile.
    """
    # Create transient patient object for evaluation
    patient = Patient(**patient_in.model_dump())
    results = evaluate_all_screenings(patient)
    assessments = []
    for res in results:
        ai_exp = generate_screening_explanation(
            category=res["category"],
            patient_name=patient.full_name,
            age=patient.age,
            status=res["status"],
            risk_level=res["risk_level"],
            flagged_reasons=res["flagged_reasons"],
            suggested_next_steps=res["suggested_next_steps"],
            guideline_source=res["guideline_source"]
        )
        assessments.append(ScreeningAssessmentResponse(
            patient_id=0,
            patient_name=patient.full_name,
            category=res["category"],
            status=res["status"],
            risk_level=res["risk_level"],
            review_status="pending_review",
            last_screened_date=res["last_screened_date"],
            next_due_date=res["next_due_date"],
            flagged_reasons=res["flagged_reasons"],
            suggested_next_steps=res["suggested_next_steps"],
            guideline_source=res["guideline_source"],
            assessment_summary=res["assessment_summary"],
            ai_explanation=ai_exp
        ))
    return assessments
