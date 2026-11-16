"""
ScreenWise AI - Cancer Screening Aggregator Module
Provides separate, configurable pathways for:
1. Breast cancer screening (ADPHC 2024 Standard)
2. Cervical cancer screening (ADPHC 2024 Standard)
3. Colorectal cancer screening (ADPHC 2024 Standard, Age 40+ threshold)
"""

from typing import List, Dict, Any, Optional
from app.guidelines.base import AssessmentResult
from app.guidelines.cancer_breast import evaluate_breast_cancer_screening
from app.guidelines.cancer_cervical import evaluate_cervical_cancer_screening
from app.guidelines.cancer_colorectal import evaluate_colorectal_cancer_screening

def evaluate_all_cancer_screenings(patient) -> List[AssessmentResult]:
    """
    Evaluates all three configurable cancer screening pathways for a patient:
    - Breast Cancer
    - Cervical Cancer
    - Colorectal Cancer
    """
    return [
        evaluate_breast_cancer_screening(patient),
        evaluate_cervical_cancer_screening(patient),
        evaluate_colorectal_cancer_screening(patient),
    ]

__all__ = [
    "evaluate_breast_cancer_screening",
    "evaluate_cervical_cancer_screening",
    "evaluate_colorectal_cancer_screening",
    "evaluate_all_cancer_screenings",
]
