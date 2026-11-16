"""
ScreenWise AI - Base Screening Assessment Contracts & Result Schema
Enforces strict transparency, safety principles, and standardized result structures.
"""

from enum import Enum
from dataclasses import dataclass, field, asdict
from typing import Dict, Any, List, Optional
from datetime import date

class FlagStatus(str, Enum):
    POTENTIALLY_DUE = "Potentially due"
    POTENTIALLY_OVERDUE = "Potentially overdue"
    NO_CURRENT_GAP_IDENTIFIED = "No current gap identified"
    INSUFFICIENT_INFORMATION = "Insufficient information"
    REQUIRES_PROFESSIONAL_REVIEW = "Requires professional review"

class ScreeningCategory(str, Enum):
    DIABETES = "diabetes"
    CARDIOVASCULAR = "cardiovascular"
    CANCER_BREAST = "cancer_breast"
    CANCER_CERVICAL = "cancer_cervical"
    CANCER_COLORECTAL = "cancer_colorectal"

MANDATORY_SAFETY_DISCLAIMER = (
    "Clinical Decision Support Only: ScreenWise AI is an assistive screening support tool and does not provide "
    "a medical diagnosis, disease probability calculation, or automatic prescription. All findings and suggested next "
    "steps require professional review and clinical validation by a licensed healthcare practitioner before any "
    "investigative order, diagnostic decision, or treatment plan is initiated."
)

@dataclass
class AssessmentResult:
    """
    Standardized, transparent evaluation output for every preventive screening pathway.
    """
    screening_category: str
    flag_status: str  # Must match FlagStatus enum values
    reason_for_flag: str
    relevant_patient_factors: Dict[str, Any]
    missing_information: List[str]
    applicable_guideline_reference: str
    guideline_version: str
    suggested_next_step: str
    professional_review_requirement: str = MANDATORY_SAFETY_DISCLAIMER
    
    # Transparency and uncertainty attributes
    uncertainty_note: Optional[str] = None
    programme_eligibility: Optional[Dict[str, Any]] = None
    is_verified_rule: bool = True
    rule_verification_status: str = "verified_authoritative_guideline"

    # Dates and priority metadata
    last_screened_date: Optional[date] = None
    next_due_date: Optional[date] = None
    suggested_timing: str = "Within 30 days"
    priority: str = "routine"  # "urgent", "moderate", "routine"
    clinical_risk_tier: str = "standard"  # "standard", "moderate", "high", "not_applicable"

    def to_dict(self) -> Dict[str, Any]:
        """Returns standard serialized dictionary."""
        d = asdict(self)
        if isinstance(d.get("last_screened_date"), (date,)):
            d["last_screened_date"] = d["last_screened_date"].isoformat()
        if isinstance(d.get("next_due_date"), (date,)):
            d["next_due_date"] = d["next_due_date"].isoformat()
        return d

    def to_legacy_dict(self) -> Dict[str, Any]:
        """
        Compatibility mapper for existing UI components and API consumers
        while preserving all transparent assessment fields.
        """
        # Map FlagStatus to legacy status string
        status_map = {
            FlagStatus.POTENTIALLY_DUE.value: "due_soon",
            FlagStatus.POTENTIALLY_OVERDUE.value: "overdue",
            FlagStatus.NO_CURRENT_GAP_IDENTIFIED.value: "up_to_date",
            FlagStatus.INSUFFICIENT_INFORMATION.value: "flagged_risk",
            FlagStatus.REQUIRES_PROFESSIONAL_REVIEW.value: "flagged_risk",
        }
        legacy_status = status_map.get(self.flag_status, "up_to_date")
        if self.clinical_risk_tier == "not_applicable":
            legacy_status = "not_indicated"

        return {
            # Standard requested assessment fields
            "screening_category": self.screening_category,
            "flag_status": self.flag_status,
            "reason_for_flag": self.reason_for_flag,
            "relevant_patient_factors": self.relevant_patient_factors,
            "missing_information": self.missing_information,
            "applicable_guideline_reference": self.applicable_guideline_reference,
            "guideline_version": self.guideline_version,
            "suggested_next_step": self.suggested_next_step,
            "professional_review_requirement": self.professional_review_requirement,
            "uncertainty_note": self.uncertainty_note,
            "programme_eligibility": self.programme_eligibility,
            "is_verified_rule": self.is_verified_rule,
            "rule_verification_status": self.rule_verification_status,

            # Legacy compatibility fields
            "category": self.screening_category,
            "status": legacy_status,
            "risk_level": "high" if self.priority == "urgent" or self.flag_status == FlagStatus.REQUIRES_PROFESSIONAL_REVIEW.value else ("moderate" if self.priority == "moderate" else ("not_applicable" if self.clinical_risk_tier == "not_applicable" else "low")),
            "review_status": "pending_review",
            "last_screened_date": self.last_screened_date,
            "next_due_date": self.next_due_date,
            "flagged_reasons": [self.reason_for_flag] if self.reason_for_flag else [],
            "suggested_next_steps": [self.suggested_next_step] if self.suggested_next_step else [],
            "guideline_source": f"{self.applicable_guideline_reference} ({self.guideline_version})",
            "assessment_summary": f"{self.flag_status}: {self.reason_for_flag[:120]}...",
            "ai_explanation": (
                f"ScreenWise AI Clinical Evaluation ({self.screening_category.replace('_', ' ').title()} Pathway):\n"
                f"Guideline: {self.applicable_guideline_reference} ({self.guideline_version}).\n"
                f"Status: {self.flag_status}.\n"
                f"Clinical Rationale: {self.reason_for_flag}\n"
                f"Patient Factors Evaluated: {self.relevant_patient_factors}\n"
                f"Data Gaps Noted: {', '.join(self.missing_information) if self.missing_information else 'None recorded'}\n"
                f"Suggested Action: {self.suggested_next_step}\n"
                f"Safety Note: {self.professional_review_requirement}"
            )
        }
