from typing import List, Dict, Any
from app.guidelines.diabetes import evaluate_diabetes_screening
from app.guidelines.cardiovascular import evaluate_cardiovascular_screening
from app.guidelines.cancer import (
    evaluate_breast_cancer_screening,
    evaluate_cervical_cancer_screening,
    evaluate_colorectal_cancer_screening
)

def evaluate_all_screenings(patient) -> List[Dict[str, Any]]:
    """
    Evaluates all adult preventive screening pathways for a given patient.
    Pathways:
    1. Diabetes
    2. Cardiovascular health
    3. Cancer screening (Breast, Cervical, Colorectal)
    """
    return [
        evaluate_diabetes_screening(patient),
        evaluate_cardiovascular_screening(patient),
        evaluate_breast_cancer_screening(patient),
        evaluate_cervical_cancer_screening(patient),
        evaluate_colorectal_cancer_screening(patient)
    ]
