from datetime import date
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.follow_up import FollowUpTask
from app.models.patient import Patient
from app.schemas.follow_up import FollowUpTaskCreate, FollowUpTaskUpdate

def get_follow_up_tasks(
    db: Session,
    patient_id: Optional[int] = None,
    status: Optional[str] = None,
    limit: int = 100
) -> List[FollowUpTask]:
    query = db.query(FollowUpTask)
    if patient_id:
        query = query.filter(FollowUpTask.patient_id == patient_id)
    if status:
        query = query.filter(FollowUpTask.status == status)
    return query.order_by(FollowUpTask.due_date.asc()).limit(limit).all()

def create_follow_up_task(db: Session, task_in: FollowUpTaskCreate) -> FollowUpTask:
    task = FollowUpTask(**task_in.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

def update_follow_up_task(db: Session, task_id: int, task_update: FollowUpTaskUpdate) -> Optional[FollowUpTask]:
    task = db.query(FollowUpTask).filter(FollowUpTask.id == task_id).first()
    if not task:
        return None
    data = task_update.model_dump(exclude_unset=True)
    if data.get("status") == "completed" and not data.get("completed_date"):
        data["completed_date"] = date.today()
    for key, value in data.items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task

def delete_follow_up_task(db: Session, task_id: int) -> bool:
    task = db.query(FollowUpTask).filter(FollowUpTask.id == task_id).first()
    if not task:
        return False
    db.delete(task)
    db.commit()
    return True
