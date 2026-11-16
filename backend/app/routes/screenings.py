from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.patient import Patient
from app.schemas.screening import ScreeningAssessmentResponse, ReviewStatusUpdate
from app.schemas.patient import PatientCreate
from app.services import patient_service, assessment_service, recommendation_service
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
    Retrieve clinical recommendations across all patients for overdue or flagged risk screenings.
    """
    recs = recommendation_service.get_recommendations(
        db,
        category=category,
        review_status=review_status
    )
    result = []
    for r in recs:
        result.append(ScreeningAssessmentResponse(
            id=r.id,
            patient_id=r.patient_id,
            patient_name=r.patient_name,
            category=r.screening_category,
            status="overdue" if r.priority in ["urgent", "moderate"] else "due_soon",
            risk_level="high" if r.priority == "urgent" else "moderate" if r.priority == "moderate" else "low",
            review_status=r.professional_review_status,
            flagged_reasons=r.flagged_reasons,
            suggested_next_steps=r.suggested_next_steps,
            guideline_source="USPSTF / ADA / ACC-AHA",
            assessment_summary=r.recommendation,
            ai_explanation=r.rationale
        ))
    return result

@router.put("/{assessment_id}/review", response_model=ScreeningAssessmentResponse)
def update_review_status(
    assessment_id: int,
    update: ReviewStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Update clinical review status.
    """
    rec = recommendation_service.update_recommendation_status(db, assessment_id, update.review_status)
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    patient = db.query(Patient).filter(Patient.id == rec.patient_id).first()
    return ScreeningAssessmentResponse(
        id=rec.id,
        patient_id=rec.patient_id,
        patient_name=patient.full_name if patient else "Patient",
        category=rec.screening_category,
        status="overdue" if rec.priority in ["urgent", "moderate"] else "due_soon",
        risk_level="high" if rec.priority == "urgent" else "moderate" if rec.priority == "moderate" else "low",
        review_status=rec.professional_review_status,
        flagged_reasons=[rec.rationale],
        suggested_next_steps=[rec.recommendation],
        guideline_source="USPSTF / ADA / ACC-AHA",
        assessment_summary=rec.recommendation,
        ai_explanation=rec.rationale
    )

@router.get("/patient/{patient_id}", response_model=List[ScreeningAssessmentResponse])
def get_patient_screenings(
    patient_id: int,
    db: Session = Depends(get_db)
):
    """
    Get all 5 screening pathway evaluations for a patient.
    """
    patient = patient_service.get_patient_by_id(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    evals = evaluate_all_screenings(patient)
    result = []
    for ev in evals:
        cat = ev["category"]
        # Lookup existing recommendation if any
        recs = recommendation_service.get_recommendations(db, patient_id=patient_id, category=cat)
        review_st = recs[0].professional_review_status if recs else "pending_review"
        rec_id = recs[0].id if recs else None

        result.append(ScreeningAssessmentResponse(
            id=rec_id,
            patient_id=patient.id,
            patient_name=patient.full_name,
            category=cat,
            status=ev["status"],
            risk_level=ev["risk_level"],
            review_status=review_st,
            last_screened_date=ev["last_screened_date"],
            next_due_date=ev["next_due_date"],
            flagged_reasons=ev["flagged_reasons"],
            suggested_next_steps=ev["suggested_next_steps"],
            guideline_source=ev["guideline_source"],
            assessment_summary=ev["assessment_summary"],
            ai_explanation=ev.get("ai_explanation")
        ))
    return result

@router.post("/evaluate/{patient_id}", response_model=List[ScreeningAssessmentResponse])
def re_evaluate_patient_screenings(
    patient_id: int,
    db: Session = Depends(get_db)
):
    """
    Re-evaluate all screening guidelines for a patient and update recommendations.
    """
    patient = patient_service.get_patient_by_id(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    assessment_service.run_patient_assessment(db, patient)
    return get_patient_screenings(patient_id, db)

@router.post("/simulate", response_model=List[ScreeningAssessmentResponse])
def simulate_screening(patient_in: PatientCreate):
    """
    Simulate guideline evaluation for transient patient parameters.
    """
    patient = Patient(
        patient_reference="SW-SIM",
        full_name=patient_in.full_name or f"{patient_in.first_name} {patient_in.last_name}",
        date_of_birth=patient_in.date_of_birth,
        sex=patient_in.sex.lower()
    )
    from app.models.medical_history import MedicalHistory
    med = MedicalHistory(
        smoking_status="active_smoker" if patient_in.is_smoker else "never_smoker",
        cervix_present=patient_in.cervix_present
    )
    med.measurements = {
        "bmi": patient_in.bmi,
        "systolic_bp": patient_in.systolic_bp,
        "diastolic_bp": patient_in.diastolic_bp,
        "fasting_glucose": patient_in.fasting_glucose,
        "hba1c": patient_in.hba1c,
        "total_cholesterol": patient_in.total_cholesterol,
        "ldl_cholesterol": patient_in.ldl_cholesterol
    }
    fam = []
    if patient_in.family_history_diabetes: fam.append("diabetes")
    if patient_in.family_history_cad: fam.append("early_cad")
    if patient_in.family_history_breast_cancer: fam.append("breast_cancer")
    if patient_in.family_history_colorectal_cancer: fam.append("colorectal_cancer")
    med.family_history_list = fam
    patient.medical_history = med

    evals = evaluate_all_screenings(patient)
    result = []
    for ev in evals:
        result.append(ScreeningAssessmentResponse(
            patient_id=0,
            patient_name=patient.full_name,
            category=ev["category"],
            status=ev["status"],
            risk_level=ev["risk_level"],
            review_status="pending_review",
            last_screened_date=ev["last_screened_date"],
            next_due_date=ev["next_due_date"],
            flagged_reasons=ev["flagged_reasons"],
            suggested_next_steps=ev["suggested_next_steps"],
            guideline_source=ev["guideline_source"],
            assessment_summary=ev["assessment_summary"],
            ai_explanation=ev.get("ai_explanation")
        ))
    return result
