from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.patient import Patient
from app.schemas.assessment import AssessmentResponse
from app.schemas.patient import PatientCreate
from app.services import patient_service, assessment_service
from app.guidelines.engine import evaluate_all_screenings
from app.schemas.recommendation import RecommendationResponse

router = APIRouter(prefix="/assessment", tags=["Assessment"])

@router.post("/{patient_id}", response_model=AssessmentResponse)
def trigger_patient_assessment(
    patient_id: int,
    db: Session = Depends(get_db)
):
    """
    Run clinical guidelines evaluation engine for a patient, generate AI rationales,
    flags, and update recommendations.
    """
    patient = patient_service.get_patient_by_id(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    assessment = assessment_service.run_patient_assessment(db, patient)
    return assessment_service.build_assessment_response(assessment, patient)

@router.get("/{patient_id}", response_model=List[AssessmentResponse])
def get_patient_assessment_history(
    patient_id: int,
    db: Session = Depends(get_db)
):
    """
    Get full assessment history for a specific patient.
    """
    patient = patient_service.get_patient_by_id(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    assessments = assessment_service.get_patient_assessments(db, patient_id)
    if not assessments:
        # Run initial assessment if none exist yet
        assessment = assessment_service.run_patient_assessment(db, patient)
        assessments = [assessment]
    
    return [assessment_service.build_assessment_response(a, patient) for a in assessments]

@router.get("/{patient_id}/latest", response_model=AssessmentResponse)
def get_latest_assessment(
    patient_id: int,
    db: Session = Depends(get_db)
):
    """
    Get the most recent assessment for a patient.
    """
    patient = patient_service.get_patient_by_id(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    assessment = assessment_service.get_latest_patient_assessment(db, patient_id)
    if not assessment:
        assessment = assessment_service.run_patient_assessment(db, patient)
        
    return assessment_service.build_assessment_response(assessment, patient)

@router.post("/simulate/transient", response_model=List[RecommendationResponse])
def simulate_transient_assessment(
    patient_in: PatientCreate
):
    """
    Simulate guideline evaluation for any transient or walk-in patient parameters.
    """
    patient = Patient(
        patient_reference=patient_in.patient_reference or "SW-SIM",
        full_name=patient_in.full_name or f"{patient_in.first_name} {patient_in.last_name}",
        date_of_birth=patient_in.date_of_birth,
        sex=patient_in.sex.lower()
    )
    # Temporary mock of medical history measurements
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

    results = evaluate_all_screenings(patient)
    recommendations = []
    for idx, ev in enumerate(results):
        category = ev["category"]
        status = ev["status"]
        risk = ev["risk_level"]
        steps = ev["suggested_next_steps"]
        reasons = ev["flagged_reasons"]
        priority = "urgent" if status == "flagged_risk" or risk == "high" else "moderate" if status == "overdue" or risk == "moderate" else "routine"
        
        recommendations.append(RecommendationResponse(
            id=idx + 1,
            patient_id=0,
            patient_name=patient.full_name,
            patient_reference="SW-SIM",
            screening_category=category,
            recommendation=steps[0] if steps else f"Routine surveillance for {category}.",
            rationale=" ".join(reasons) if reasons else f"Guideline criteria under {ev['guideline_source']}.",
            suggested_timing="Within 14 days" if priority == "urgent" else "Within 30-60 days",
            priority=priority,
            professional_review_status="pending_review",
            category=category,
            status=status,
            risk_level=risk,
            review_status="pending_review",
            flagged_reasons=reasons,
            suggested_next_steps=steps,
            guideline_source=ev["guideline_source"],
            ai_explanation=ev.get("ai_explanation")
        ))
    return recommendations
