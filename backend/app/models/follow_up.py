import json
from datetime import datetime, date, timezone
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.session import Base

def utcnow():
    return datetime.now(timezone.utc)

class FollowUp(Base):
    __tablename__ = "follow_ups"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    recommendation_id = Column(Integer, ForeignKey("recommendations.id", ondelete="SET NULL"), nullable=True, index=True)

    title = Column(String(150), nullable=False)
    action_type = Column(String(50), nullable=False, default="consultation") # "lab_test", "imaging", "consultation", "lifestyle", "vaccine"
    
    # Status: "pending", "scheduled", "completed", "overdue", "deferred"
    status = Column(String(30), nullable=False, default="pending", index=True)
    priority = Column(String(20), nullable=False, default="routine") # "urgent", "moderate", "routine"

    due_date = Column(Date, nullable=False)
    scheduled_date = Column(Date, nullable=True)
    completion_date = Column(Date, nullable=True)
    
    assigned_provider = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    result_summary = Column(Text, nullable=True)

    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="followups")
    recommendation = relationship("Recommendation", back_populates="followups")
