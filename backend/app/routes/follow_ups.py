from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.follow_up import FollowUpTaskCreate, FollowUpTaskUpdate, FollowUpTaskResponse
from app.services import follow_up_service
from app.models.patient import Patient

router = APIRouter(prefix="/follow-ups", tags=["Follow-ups"])

@router.get("", response_model=List[FollowUpTaskResponse])
def list_follow_up_tasks(
    patient_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """
    List follow-up tasks with optional filters for patient_id and status.
    """
    tasks = follow_up_service.get_follow_up_tasks(db, patient_id=patient_id, status=status, limit=limit)
    response_list = []
    for task in tasks:
        resp = FollowUpTaskResponse.model_validate(task)
        if task.patient:
            resp.patient_name = task.patient.full_name
        response_list.append(resp)
    return response_list

@router.post("", response_model=FollowUpTaskResponse, status_code=status.HTTP_201_CREATED)
def create_follow_up_task(
    task_in: FollowUpTaskCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new follow-up care task for a patient.
    """
    patient = db.query(Patient).filter(Patient.id == task_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    task = follow_up_service.create_follow_up_task(db, task_in)
    resp = FollowUpTaskResponse.model_validate(task)
    resp.patient_name = patient.full_name
    return resp

@router.put("/{task_id}", response_model=FollowUpTaskResponse)
def update_follow_up_task(
    task_id: int,
    task_update: FollowUpTaskUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a follow-up task status (e.g. marked as scheduled, completed), dates, notes.
    """
    task = follow_up_service.update_follow_up_task(db, task_id, task_update)
    if not task:
        raise HTTPException(status_code=404, detail="Follow-up task not found")
    resp = FollowUpTaskResponse.model_validate(task)
    if task.patient:
        resp.patient_name = task.patient.full_name
    return resp

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_follow_up_task(
    task_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a follow-up task.
    """
    success = follow_up_service.delete_follow_up_task(db, task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Follow-up task not found")
    return None
