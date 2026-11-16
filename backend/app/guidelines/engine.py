"""
ScreenWise AI - Master Clinical Assessment Engine Orchestrator
Executes transparent, guideline-grounded preventive screening evaluations
across all clinical pathways:
1. Diabetes & Prediabetes (ADPHC IFHAS 2024)
2. Cardiovascular Health (ADPHC Weqaya 2024, No pseudo-scores safety rule)
3. Breast Cancer (ADPHC 2024)
4. Cervical Cancer (ADPHC 2024)
5. Colorectal Cancer (ADPHC 2024, Starting at Age 40)
"""

from typing import List, Dict, Any, Optional
from app.guidelines.base import AssessmentResult, ScreeningCategory, FlagStatus
from app.guidelines.diabetes import evaluate_diabetes_screening
from app.guidelines.cardiovascular import evaluate_cardiovascular_screening
from app.guidelines.cancer_breast import evaluate_breast_cancer_screening
from app.guidelines.cancer_cervical import evaluate_cervical_cancer_screening
from app.guidelines.cancer_colorectal import evaluate_colorectal_cancer_screening
from app.guidelines.config import GUIDELINES_REGISTRY, MasterGuidelineRegistry

def evaluate_all_screenings_typed(
    patient,
    registry: Optional[MasterGuidelineRegistry] = None
) -> List[AssessmentResult]:
    """
    Evaluates all adult preventive screening pathways for a given patient,
    returning structured, transparent AssessmentResult objects.
    """
    reg = registry or GUIDELINES_REGISTRY
    return [
        evaluate_diabetes_screening(patient, reg.diabetes),
        evaluate_cardiovascular_screening(patient, reg.cardiovascular),
        evaluate_breast_cancer_screening(patient, reg.cancer_breast),
        evaluate_cervical_cancer_screening(patient, reg.cancer_cervical),
        evaluate_colorectal_cancer_screening(patient, reg.cancer_colorectal),
    ]

def evaluate_all_screenings(
    patient,
    registry: Optional[MasterGuidelineRegistry] = None
) -> List[Dict[str, Any]]:
    """
    Evaluates all adult preventive screening pathways for a given patient.
    Returns dictionaries containing both the transparent assessment fields
    (flag_status, reason_for_flag, relevant_patient_factors, missing_information,
     applicable_guideline_reference, guideline_version, suggested_next_step,
     professional_review_requirement) and legacy compatibility fields.
    """
    results = evaluate_all_screenings_typed(patient, registry)
    return [r.to_legacy_dict() for r in results]

def evaluate_screening_pathway(
    patient,
    category: str,
    registry: Optional[MasterGuidelineRegistry] = None
) -> AssessmentResult:
    """
    Evaluates a single specified screening pathway.
    """
    reg = registry or GUIDELINES_REGISTRY
    cat = category.lower().strip()
    if cat in ["diabetes", "t2d", "dm"]:
        return evaluate_diabetes_screening(patient, reg.diabetes)
    elif cat in ["cardiovascular", "cvd", "cardio", "heart", "bp"]:
        return evaluate_cardiovascular_screening(patient, reg.cardiovascular)
    elif cat in ["cancer_breast", "breast", "breast_cancer"]:
        return evaluate_breast_cancer_screening(patient, reg.cancer_breast)
    elif cat in ["cancer_cervical", "cervical", "cervical_cancer"]:
        return evaluate_cervical_cancer_screening(patient, reg.cancer_cervical)
    elif cat in ["cancer_colorectal", "colorectal", "colon", "crc"]:
        return evaluate_colorectal_cancer_screening(patient, reg.cancer_colorectal)
    else:
        raise ValueError(f"Unknown screening category: {category}")
