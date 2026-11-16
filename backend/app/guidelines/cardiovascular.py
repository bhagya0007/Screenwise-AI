from datetime import date
from typing import Dict, Any, List

def evaluate_cardiovascular_screening(patient) -> Dict[str, Any]:
    """
    Evaluates cardiovascular preventive screening based on:
    - USPSTF Hypertension Screening Guidelines (Adults 18+)
    - USPSTF / ACC / AHA Cholesterol Screening & Statin Prevention Guidelines (Adults 40-75)
    """
    age = patient.age
    today = date.today()
    reasons: List[str] = []
    next_steps: List[str] = []

    last_bp = patient.last_bp_check_date
    last_lipid = patient.last_lipid_panel_date
    
    # Blood pressure evaluation
    sbp = patient.systolic_bp
    dbp = patient.diastolic_bp
    is_hypertensive = patient.has_hypertension or (sbp and sbp >= 130) or (dbp and dbp >= 80)
    is_elevated_bp = (sbp and 120 <= sbp <= 129 and (dbp is None or dbp < 80))
    
    bp_interval_years = 1.0 if (age >= 40 or is_elevated_bp or is_hypertensive or (patient.bmi and patient.bmi >= 25)) else 3.0
    bp_years_since = (today - last_bp).days / 365.25 if last_bp else None

    # Lipid panel evaluation
    # Universal screening starts at 40; earlier (from 20) if risk factors (smoking, HTN, diabetes, family history)
    has_cv_risk_factors = (
        patient.is_smoker or
        patient.has_hypertension or
        patient.has_diabetes_history or
        patient.family_history_cad or
        (patient.bmi and patient.bmi >= 30)
    )
    lipid_indicated = (age >= 40) or (age >= 20 and has_cv_risk_factors)
    lipid_interval_years = 5.0
    lipid_years_since = (today - last_lipid).days / 365.25 if last_lipid else None

    status = "up_to_date"
    risk_level = "low"

    # Identify clinical risk flags
    if is_hypertensive:
        risk_level = "high"
        reasons.append(f"Recorded Blood Pressure ({sbp or 'N/A'}/{dbp or 'N/A'} mmHg) meets criteria for Stage 1/2 Hypertension or diagnosed HTN.")
    elif is_elevated_bp:
        risk_level = "moderate"
        reasons.append(f"Blood pressure is elevated ({sbp}/{dbp or 'N/A'} mmHg, threshold ≥120/80 mmHg).")

    if patient.total_cholesterol and patient.total_cholesterol >= 240:
        risk_level = "high"
        reasons.append(f"Total cholesterol is {patient.total_cholesterol} mg/dL (high risk ≥ 240 mg/dL).")
    elif patient.ldl_cholesterol and patient.ldl_cholesterol >= 160:
        risk_level = "high"
        reasons.append(f"LDL cholesterol is {patient.ldl_cholesterol} mg/dL (elevated ≥ 160 mg/dL).")

    if patient.is_smoker:
        if risk_level == "low": risk_level = "moderate"
        reasons.append("Active tobacco use significantly elevates 10-year Atherosclerotic Cardiovascular Disease (ASCVD) risk.")

    if patient.family_history_cad:
        if risk_level == "low": risk_level = "moderate"
        reasons.append("Premature coronary artery disease reported in first-degree relative.")

    # Check BP screening status
    bp_overdue = False
    if last_bp is None:
        bp_overdue = True
        reasons.append("No record of recent clinical blood pressure measurement.")
        next_steps.append("Perform in-office manual or automated resting blood pressure check.")
    elif bp_years_since is not None and bp_years_since > bp_interval_years:
        bp_overdue = True
        reasons.append(f"Blood pressure measurement overdue (last recorded {last_bp.isoformat()}, recommended every {int(bp_interval_years)} yr).")
        next_steps.append("Schedule annual preventive blood pressure check.")

    # Check Lipid panel status
    lipid_overdue = False
    if lipid_indicated:
        if last_lipid is None:
            lipid_overdue = True
            reasons.append("No record of baseline fasting/non-fasting lipid profile.")
            next_steps.append("Order standard Lipid Panel (Total Cholesterol, HDL, LDL, Triglycerides).")
        elif lipid_years_since is not None and lipid_years_since > lipid_interval_years:
            lipid_overdue = True
            reasons.append(f"Lipid panel screening overdue (last performed {last_lipid.isoformat()}, {lipid_years_since:.1f} years ago).")
            next_steps.append("Order repeat lipid panel to calculate updated 10-year ASCVD risk score.")

    if is_hypertensive or (patient.ldl_cholesterol and patient.ldl_cholesterol >= 190):
        status = "flagged_risk"
        next_steps.append("Conduct comprehensive ASCVD risk calculation and discuss cardiovascular prevention plan.")
        next_steps.append("Recommend sodium reduction (<2,300 mg/day) and DASH dietary pattern.")
    elif bp_overdue or lipid_overdue:
        status = "overdue"
    elif (bp_years_since and bp_years_since >= (bp_interval_years - 0.25)) or (lipid_years_since and lipid_years_since >= (lipid_interval_years - 0.5)):
        status = "due_soon"
        next_steps.append("Upcoming routine cardiovascular screening due within next 3 to 6 months.")
    else:
        status = "up_to_date"
        next_steps.append("Continue regular aerobic physical activity (≥150 min moderate intensity/week).")
        next_steps.append("Maintain heart-healthy diet rich in fruits, vegetables, and whole grains.")

    next_due = None
    if status == "overdue":
        next_due = today
    elif last_bp and last_lipid:
        # Soonest next due date
        next_bp_due = date(last_bp.year + int(bp_interval_years), last_bp.month, min(last_bp.day, 28))
        next_lipid_due = date(last_lipid.year + int(lipid_interval_years), last_lipid.month, min(last_lipid.day, 28))
        next_due = min(next_bp_due, next_lipid_due)

    summary = f"Cardiovascular screening is {status.replace('_', ' ').upper()} (Risk: {risk_level.upper()})."
    ai_explainer = (
        f"ScreenWise AI Assessment: ACC/AHA and USPSTF guidelines emphasize periodic blood pressure monitoring "
        f"and 5-year lipid panels for adults to detect asymptomatic hypertension and dyslipidemia early. "
        f"For this patient (Age {age}), risk stratification indicates {risk_level.upper()} cardiovascular risk profile. "
        f"{' '.join(reasons)}"
    )

    return {
        "category": "cardiovascular",
        "status": status,
        "risk_level": risk_level,
        "last_screened_date": last_lipid or last_bp,
        "next_due_date": next_due,
        "flagged_reasons": reasons,
        "suggested_next_steps": next_steps,
        "guideline_source": "USPSTF & ACC/AHA 2019/2023 Primary Prevention Guidelines",
        "assessment_summary": summary,
        "ai_explanation": ai_explainer
    }
