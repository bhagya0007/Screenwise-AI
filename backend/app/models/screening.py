from datetime import datetime, date
import json
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.session import Base

class ScreeningAssessment(Base):
    __tablename__ = "screening_assessments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    
    # Category: "diabetes", "cardiovascular", "cancer_breast", "cancer_cervical", "cancer_colorectal"
    category = Column(String(50), nullable=False, index=True)
    
    # Status: "up_to_date", "due_soon", "overdue", "flagged_risk", "not_indicated"
    status = Column(String(30), nullable=False, default="due_soon")
    
    # Risk Level: "low", "moderate", "high", "not_applicable"
    risk_level = Column(String(20), nullable=False, default="low")

    # Professional Review Status: "pending_review", "acknowledged", "ordered"
    review_status = Column(String(30), nullable=False, default="pending_review")

    last_screened_date = Column(Date, nullable=True)
    next_due_date = Column(Date, nullable=True)
    
    # JSON encoded strings
    flagged_reasons_json = Column(Text, nullable=False, default="[]")
    suggested_next_steps_json = Column(Text, nullable=False, default="[]")
    
    guideline_source = Column(String(100), nullable=False, default="USPSTF / ADA / AHA Guidelines")
    assessment_summary = Column(Text, nullable=True)
    ai_explanation = Column(Text, nullable=True)
    
    evaluated_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    patient = relationship("Patient", back_populates="screenings")
    follow_ups = relationship("FollowUpTask", back_populates="screening", cascade="all, delete-orphan")

    @property
    def flagged_reasons(self):
        try:
            return json.loads(self.flagged_reasons_json or "[]")
        except Exception:
            return []

    @flagged_reasons.setter
    def flagged_reasons(self, val):
        self.flagged_reasons_json = json.dumps(val if isinstance(val, list) else [val])

    @property
    def suggested_next_steps(self):
        try:
            return json.loads(self.suggested_next_steps_json or "[]")
        except Exception:
            return []

    @suggested_next_steps.setter
    def suggested_next_steps(self, val):
        self.suggested_next_steps_json = json.dumps(val if isinstance(val, list) else [val])
