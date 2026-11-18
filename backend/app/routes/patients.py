from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.routes.auth import get_current_user
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse
from app.services import patient_service, assessment_service

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("", response_model=List[PatientResponse])
def list_patients(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all patients with optional search by name, reference ID, or email, with pagination.
    Requires authenticated clinician/nurse session.
    """
    patients = patient_service.get_patients(db, skip=skip, limit=limit, search=search)
    return [PatientResponse.model_validate(p) for p in patients]

@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient_record(
    patient_in: PatientCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Register a new patient and automatically compute initial clinical guideline assessment.
    """
    try:
        patient = patient_service.create_patient(db, patient_in)
        # Automatically run assessment upon patient registration
        assessment_service.run_patient_assessment(db, patient)
        return PatientResponse.model_validate(patient)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create patient: {str(e)}")

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve single patient details by ID.
    """
    patient = patient_service.get_patient_by_id(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return PatientResponse.model_validate(patient)

@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient_record(
    patient_id: int,
    patient_update: PatientUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update patient clinical markers, histories, or screening dates, and recalculate guidelines.
    """
    patient = patient_service.get_patient_by_id(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    try:
        updated = patient_service.update_patient(db, patient, patient_update)
        # Recalculate guidelines
        assessment_service.run_patient_assessment(db, updated)
        return PatientResponse.model_validate(updated)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update patient: {str(e)}")

@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient_record(
    patient_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a patient record and cascade associated records.
    """
    success = patient_service.delete_patient(db, patient_id)
    if not success:
        raise HTTPException(status_code=404, detail="Patient not found")
    return None
