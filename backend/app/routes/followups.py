from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.follow_up import FollowUpCreate, FollowUpUpdate, FollowUpResponse
from app.services import follow_up_service, patient_service

router = APIRouter(tags=["Follow-ups"])

@router.get("/followups", response_model=List[FollowUpResponse])
@router.get("/follow-ups", response_model=List[FollowUpResponse])
def list_followup_tasks(
    patient_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """
    List follow-up actions with optional filters for patient_id, status, and priority.
    """
    return follow_up_service.get_follow_up_tasks(
        db,
        patient_id=patient_id,
        status=status,
        priority=priority,
        limit=limit
    )

@router.post("/followups", response_model=FollowUpResponse, status_code=status.HTTP_201_CREATED)
@router.post("/follow-ups", response_model=FollowUpResponse, status_code=status.HTTP_201_CREATED)
def create_followup_action(
    task_in: FollowUpCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new preventive care follow-up action or order.
    """
    patient = patient_service.get_patient_by_id(db, task_in.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    try:
        return follow_up_service.create_follow_up_task(db, task_in)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create follow-up: {str(e)}")

@router.put("/followups/{followup_id}", response_model=FollowUpResponse)
@router.put("/follow-ups/{followup_id}", response_model=FollowUpResponse)
def update_followup_action(
    followup_id: int,
    task_update: FollowUpUpdate,
    db: Session = Depends(get_db)
):
    """
    Update follow-up status (e.g. marked as scheduled, completed), dates, and notes.
    """
    task = follow_up_service.update_follow_up_task(db, followup_id, task_update)
    if not task:
        raise HTTPException(status_code=404, detail="Follow-up action not found")
    return task

@router.delete("/followups/{followup_id}", status_code=status.HTTP_204_NO_CONTENT)
@router.delete("/follow-ups/{followup_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_followup_action(
    followup_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a follow-up action.
    """
    success = follow_up_service.delete_follow_up_task(db, followup_id)
    if not success:
        raise HTTPException(status_code=404, detail="Follow-up action not found")
    return None
