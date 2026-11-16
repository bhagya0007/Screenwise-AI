from typing import Dict, Any, List

def generate_screening_explanation(
    category: str,
    patient_name: str,
    age: int,
    status: str,
    risk_level: str,
    flagged_reasons: List[str],
    suggested_next_steps: List[str],
    guideline_source: str
) -> str:
    """
    Generates a clear, clinically grounded AI explanation for why a screening was flagged
    and what preventive next steps are recommended.
    Emphasizes that this is a screening-support tool, not a diagnostic system.
    """
    category_names = {
        "diabetes": "Type 2 Diabetes & Prediabetes",
        "cardiovascular": "Cardiovascular Health (BP & Lipid Profile)",
        "cancer_breast": "Breast Cancer (Mammography)",
        "cancer_cervical": "Cervical Cancer (Cytology / HPV)",
        "cancer_colorectal": "Colorectal Cancer"
    }
    cat_label = category_names.get(category, category.replace("_", " ").title())

    if status == "not_indicated":
        return (
            f"ScreenWise AI Clinical Rationale for {patient_name} (Age {age}):\n"
            f"Routine {cat_label} screening is currently not indicated under {guideline_source}. "
            f"Primary reason: {flagged_reasons[0] if flagged_reasons else 'Patient does not meet age/demographic eligibility criteria.'}"
        )

    reasons_text = " ".join([f"• {r}" for r in flagged_reasons]) if flagged_reasons else "• Routine age-based interval reached."
    steps_text = " ".join([f"{idx+1}. {s}" for idx, s in enumerate(suggested_next_steps)]) if suggested_next_steps else "1. Continue routine preventive health care."

    status_descriptor = {
        "overdue": "is potentially overdue for recommended preventive screening",
        "due_soon": "will be due for screening within the next clinical window",
        "flagged_risk": "has elevated clinical risk markers requiring prompt preventive attention",
        "up_to_date": "is up to date with routine screening guidelines"
    }.get(status, "has been evaluated")

    explanation = (
        f"ScreenWise AI Clinical Evaluation ({cat_label}):\n\n"
        f"Based on evidence-based recommendations from {guideline_source}, {patient_name} (Age {age}) "
        f"{status_descriptor} (Assessed Risk Tier: {risk_level.upper()}).\n\n"
        f"Key Clinical Indicators Identified:\n{reasons_text}\n\n"
        f"Recommended Preventive Care Action Plan:\n{steps_text}\n\n"
        f"Clinical Decision Support Notice: ScreenWise AI is an assistive preventive screening surveillance tool "
        f"designed to support primary care decision-making. It does not establish clinical diagnoses. "
        f"All orders and care plans must be tailored to the individual patient by a licensed healthcare provider."
    )
    return explanation
