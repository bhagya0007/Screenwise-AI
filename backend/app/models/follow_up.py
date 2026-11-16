from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.session import Base

class FollowUpTask(Base):
    __tablename__ = "follow_up_tasks"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    screening_id = Column(Integer, ForeignKey("screening_assessments.id", ondelete="SET NULL"), nullable=True)

    title = Column(String(150), nullable=False)
    action_type = Column(String(50), nullable=False) # "lab_test", "imaging", "consultation", "lifestyle", "vaccine"
    
    # Status: "pending", "scheduled", "completed", "overdue", "deferred"
    status = Column(String(20), nullable=False, default="pending", index=True)
    
    # Priority: "routine", "moderate", "urgent"
    priority = Column(String(20), nullable=False, default="routine")

    due_date = Column(Date, nullable=False)
    scheduled_date = Column(Date, nullable=True)
    completed_date = Column(Date, nullable=True)

    assigned_provider = Column(String(100), nullable=True)
    clinical_notes = Column(Text, nullable=True)
    result_summary = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    patient = relationship("Patient", back_populates="follow_ups")
    screening = relationship("ScreeningAssessment", back_populates="follow_ups")
