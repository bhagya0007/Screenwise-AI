from datetime import date
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.follow_up import FollowUp
from app.models.patient import Patient
from app.schemas.follow_up import FollowUpCreate, FollowUpUpdate, FollowUpResponse

def get_follow_up_tasks(
    db: Session,
    patient_id: Optional[int] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    limit: int = 100
) -> List[FollowUpResponse]:
    query = db.query(FollowUp).join(Patient)

    if patient_id:
        query = query.filter(FollowUp.patient_id == patient_id)
    if status and status != "all":
        if status == "overdue":
            today = date.today()
            query = query.filter(FollowUp.status != "completed", FollowUp.due_date < today)
        else:
            query = query.filter(FollowUp.status == status)
    if priority and priority != "all":
        query = query.filter(FollowUp.priority == priority)

    tasks = query.order_by(FollowUp.due_date.asc()).limit(limit).all()

    result = []
    for t in tasks:
        resp = FollowUpResponse(
            id=t.id,
            patient_id=t.patient_id,
            recommendation_id=t.recommendation_id,
            patient_name=t.patient.full_name if t.patient else "Patient",
            patient_reference=t.patient.patient_reference if t.patient else f"SW-{t.patient_id}",
            title=t.title,
            action_type=t.action_type,
            status=t.status,
            priority=t.priority,
            due_date=t.due_date,
            scheduled_date=t.scheduled_date,
            completion_date=t.completion_date,
            assigned_provider=t.assigned_provider,
            notes=t.notes,
            clinical_notes=t.notes,
            created_at=t.created_at,
            updated_at=t.updated_at
        )
        result.append(resp)
    return result

def create_follow_up_task(db: Session, task_in: FollowUpCreate) -> FollowUpResponse:
    try:
        data = task_in.model_dump()
        notes_val = data.get("notes") or data.get("clinical_notes")
        task = FollowUp(
            patient_id=data["patient_id"],
            recommendation_id=data.get("recommendation_id"),
            title=data["title"],
            action_type=data.get("action_type", "consultation"),
            status=data.get("status", "pending"),
            priority=data.get("priority", "routine"),
            due_date=data["due_date"],
            scheduled_date=data.get("scheduled_date"),
            completion_date=data.get("completion_date"),
            assigned_provider=data.get("assigned_provider"),
            notes=notes_val
        )
        db.add(task)
        db.commit()
        db.refresh(task)

        patient = db.query(Patient).filter(Patient.id == task.patient_id).first()
        return FollowUpResponse(
            id=task.id,
            patient_id=task.patient_id,
            recommendation_id=task.recommendation_id,
            patient_name=patient.full_name if patient else "Patient",
            patient_reference=patient.patient_reference if patient else f"SW-{task.patient_id}",
            title=task.title,
            action_type=task.action_type,
            status=task.status,
            priority=task.priority,
            due_date=task.due_date,
            scheduled_date=task.scheduled_date,
            completion_date=task.completion_date,
            assigned_provider=task.assigned_provider,
            notes=task.notes,
            clinical_notes=task.notes,
            created_at=task.created_at,
            updated_at=task.updated_at
        )
    except Exception as e:
        db.rollback()
        raise e

def update_follow_up_task(db: Session, task_id: int, task_update: FollowUpUpdate) -> Optional[FollowUpResponse]:
    task = db.query(FollowUp).filter(FollowUp.id == task_id).first()
    if not task:
        return None
    try:
        data = task_update.model_dump(exclude_unset=True)
        if data.get("status") == "completed" and not data.get("completion_date"):
            data["completion_date"] = date.today()
        if "clinical_notes" in data and "notes" not in data:
            data["notes"] = data["clinical_notes"]
        
        for k, v in data.items():
            if hasattr(task, k):
                setattr(task, k, v)
        db.commit()
        db.refresh(task)

        patient = db.query(Patient).filter(Patient.id == task.patient_id).first()
        return FollowUpResponse(
            id=task.id,
            patient_id=task.patient_id,
            recommendation_id=task.recommendation_id,
            patient_name=patient.full_name if patient else "Patient",
            patient_reference=patient.patient_reference if patient else f"SW-{task.patient_id}",
            title=task.title,
            action_type=task.action_type,
            status=task.status,
            priority=task.priority,
            due_date=task.due_date,
            scheduled_date=task.scheduled_date,
            completion_date=task.completion_date,
            assigned_provider=task.assigned_provider,
            notes=task.notes,
            clinical_notes=task.notes,
            created_at=task.created_at,
            updated_at=task.updated_at
        )
    except Exception as e:
        db.rollback()
        raise e

def delete_follow_up_task(db: Session, task_id: int) -> bool:
    task = db.query(FollowUp).filter(FollowUp.id == task_id).first()
    if not task:
        return False
    try:
        db.delete(task)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        raise e
