from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="SET NULL"), nullable=True, index=True)
    
    screening_category = Column(String(50), nullable=False, index=True)
    # Categories: "diabetes", "cardiovascular", "cancer_breast", "cancer_cervical", "cancer_colorectal"
    
    recommendation = Column(String(200), nullable=False)
    rationale = Column(Text, nullable=False)
    suggested_timing = Column(String(100), nullable=False, default="Within 30 days")
    priority = Column(String(20), nullable=False, default="routine") # "urgent", "moderate", "routine"
    professional_review_status = Column(String(50), nullable=False, default="pending_review") # "pending_review", "acknowledged", "ordered"

    # Relationships
    patient = relationship("Patient", back_populates="recommendations")
    assessment = relationship("Assessment", back_populates="recommendations")
    followups = relationship("FollowUp", back_populates="recommendation", cascade="all, delete-orphan")
