from datetime import date
from typing import Dict, Any, List

def evaluate_diabetes_screening(patient) -> Dict[str, Any]:
    """
    Evaluates diabetes screening need based on USPSTF (2021) and ADA (2024) guidelines.
    USPSTF recommends screening for prediabetes and type 2 diabetes in adults aged 35 to 70
    who are overweight or obese (BMI >= 25, or >= 23 for Asian populations).
    ADA recommends screening adults with risk factors earlier or annually if prediabetic.
    """
    age = patient.age
    bmi = patient.bmi or 0.0
    today = date.today()
    last_screen = patient.last_diabetes_screen_date
    reasons = []
    next_steps = []
    
    # Assess baseline eligibility & risk
    is_overweight_or_obese = bmi >= 25.0
    has_risk_factors = (
        patient.family_history_diabetes or 
        patient.has_hypertension or 
        (patient.systolic_bp and patient.systolic_bp >= 130) or
        patient.is_smoker
    )
    
    age_eligible = 35 <= age <= 70
    early_eligible = age >= 25 and (is_overweight_or_obese and has_risk_factors)

    # Years since last test
    years_since = (today - last_screen).days / 365.25 if last_screen else None
    
    # Check if pre-existing lab indicates urgent follow-up
    has_elevated_glucose = patient.fasting_glucose and patient.fasting_glucose >= 100
    has_elevated_a1c = patient.hba1c and patient.hba1c >= 5.7
    is_prediabetic = (patient.hba1c and 5.7 <= patient.hba1c <= 6.4) or (patient.fasting_glucose and 100 <= patient.fasting_glucose <= 125)

    if not age_eligible and not early_eligible and not is_prediabetic and not has_risk_factors:
        return {
            "category": "diabetes",
            "status": "not_indicated",
            "risk_level": "low",
            "last_screened_date": last_screen,
            "next_due_date": None,
            "flagged_reasons": ["Patient is under 35 without overweight/obesity or key metabolic risk factors."],
            "suggested_next_steps": ["Maintain routine healthy diet and exercise.", "Re-evaluate screening when turning 35 or if risk factors change."],
            "guideline_source": "USPSTF 2021 / ADA 2024 Guidelines",
            "assessment_summary": "Routine diabetes screening not currently indicated based on age and metabolic profile.",
            "ai_explanation": f"Patient is {age} years old with BMI of {bmi or 'unrecorded'} and no primary risk indicators. Routine screening begins at age 35."
        }

    # Determine status & intervals
    status = "up_to_date"
    risk_level = "low"
    
    if is_prediabetic:
        risk_level = "high"
        interval_years = 1.0
        reasons.append(f"Recorded HbA1c ({patient.hba1c}%) or Fasting Glucose ({patient.fasting_glucose} mg/dL) indicates prediabetes range.")
    elif is_overweight_or_obese and (age_eligible or has_risk_factors):
        risk_level = "moderate"
        interval_years = 3.0
        if is_overweight_or_obese:
            reasons.append(f"BMI is {bmi:.1f} kg/m² (overweight/obese threshold ≥ 25.0).")
        if age_eligible:
            reasons.append(f"Patient is {age} years old (USPSTF screening window: 35-70 years).")
        if patient.family_history_diabetes:
            reasons.append("Positive family history of type 2 diabetes.")
    else:
        interval_years = 3.0

    if patient.fasting_glucose and patient.fasting_glucose >= 126:
        status = "flagged_risk"
        risk_level = "high"
        reasons.append(f"Prior fasting glucose was {patient.fasting_glucose} mg/dL (≥126 mg/dL diagnostic threshold). Needs confirmatory repeat testing.")
        next_steps.append("Order repeat fasting plasma glucose or HbA1c to confirm diagnosis.")
        next_steps.append("Refer to primary care provider for comprehensive glycemic evaluation.")
    elif patient.hba1c and patient.hba1c >= 6.5:
        status = "flagged_risk"
        risk_level = "high"
        reasons.append(f"Prior HbA1c was {patient.hba1c}% (≥6.5% threshold). Requires confirmatory repeat testing.")
        next_steps.append("Schedule repeat confirmatory HbA1c test or clinical workup.")
        next_steps.append("Schedule consultation for diabetes self-management education and nutritional support.")
    elif last_screen is None:
        status = "overdue"
        risk_level = "moderate" if risk_level == "low" else risk_level
        reasons.append("No record of prior diabetes screening (HbA1c or Fasting Plasma Glucose).")
        next_steps.append("Order baseline HbA1c test or Fasting Plasma Glucose (FPG).")
        next_steps.append("Discuss lifestyle optimization (dietary patterns, 150 min/wk moderate physical activity).")
    elif years_since is not None and years_since > interval_years:
        status = "overdue"
        reasons.append(f"Last screened on {last_screen.isoformat()} ({years_since:.1f} years ago, recommended interval is {int(interval_years)} year{'s' if interval_years > 1 else ''}).")
        next_steps.append("Schedule routine screening HbA1c test or fasting plasma glucose.")
        next_steps.append("Review fasting status and review recent dietary and weight trends.")
    elif years_since is not None and years_since >= (interval_years - 0.25):
        status = "due_soon"
        reasons.append(f"Screening will become due within 3 months (last screened {last_screen.isoformat()}).")
        next_steps.append("Issue preventive lab order for upcoming routine screening visit.")
    else:
        status = "up_to_date"
        next_steps.append(f"Continue current preventive health habits. Next screen due around {last_screen.year + int(interval_years)}-{last_screen.month:02d}-{last_screen.day:02d}.")

    # Calculate estimated next due date
    next_due = None
    if last_screen:
        try:
            next_due = date(last_screen.year + int(interval_years), last_screen.month, min(last_screen.day, 28))
        except Exception:
            pass
    elif status == "overdue":
        next_due = today

    summary = f"Diabetes screening is {status.replace('_', ' ').upper()} (Risk: {risk_level.upper()})."
    ai_explainer = (
        f"ScreenWise AI Assessment: According to USPSTF and ADA clinical guidelines, asymptomatic adults aged 35-70 "
        f"with BMI ≥ 25 should be screened every 3 years. For this patient (Age {age}, BMI {bmi or 'N/A'}), "
        f"{'they meet risk-based screening criteria' if (age_eligible or early_eligible) else 'evaluation was completed'}. "
        f"{' '.join(reasons)}"
    )

    return {
        "category": "diabetes",
        "status": status,
        "risk_level": risk_level,
        "last_screened_date": last_screen,
        "next_due_date": next_due,
        "flagged_reasons": reasons,
        "suggested_next_steps": next_steps,
        "guideline_source": "USPSTF 2021 & ADA Standards of Care 2024",
        "assessment_summary": summary,
        "ai_explanation": ai_explainer
    }
