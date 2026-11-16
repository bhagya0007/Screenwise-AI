from datetime import date
from typing import Dict, Any, List

def evaluate_breast_cancer_screening(patient) -> Dict[str, Any]:
    """
    Evaluates breast cancer screening based on USPSTF (2024 recommendation):
    - Recommends biennial (every 2 years) screening mammography for women aged 40 to 74.
    - Adults with 1st degree relative with breast cancer are at elevated risk and may start earlier.
    """
    age = patient.age
    sex = (patient.sex or "").lower()
    today = date.today()
    reasons: List[str] = []
    next_steps: List[str] = []

    # Male patients generally do not receive routine population mammography screening
    if sex == "male":
        return {
            "category": "cancer_breast",
            "status": "not_indicated",
            "risk_level": "low",
            "last_screened_date": None,
            "next_due_date": None,
            "flagged_reasons": ["Routine population-based breast cancer screening is not indicated for average-risk biological males."],
            "suggested_next_steps": ["Consult clinician if any palpable breast mass, skin changes, or nipple discharge develop."],
            "guideline_source": "USPSTF 2024 Breast Cancer Screening Guidelines",
            "assessment_summary": "Routine screening mammogram not indicated for males without exceptional genetic risk.",
            "ai_explanation": "Population screening guidelines for breast cancer apply specifically to adult females aged 40 to 74."
        }

    is_eligible_age = 40 <= age <= 74
    has_high_risk = patient.family_history_breast_cancer
    interval_years = 1.0 if has_high_risk else 2.0
    last_mammogram = patient.last_mammogram_date
    years_since = (today - last_mammogram).days / 365.25 if last_mammogram else None

    status = "up_to_date"
    risk_level = "high" if has_high_risk else ("moderate" if age >= 50 else "low")

    if has_high_risk:
        reasons.append("First-degree family history of breast cancer indicates elevated hereditary susceptibility.")

    if age < 40 and not has_high_risk:
        return {
            "category": "cancer_breast",
            "status": "not_indicated",
            "risk_level": "low",
            "last_screened_date": last_mammogram,
            "next_due_date": date(today.year + (40 - age), today.month, today.day),
            "flagged_reasons": [f"Patient is {age} years old. USPSTF guideline routine screening starts at age 40 for average-risk women."],
            "suggested_next_steps": ["Be aware of personal breast health and report any clinical changes.", f"Plan baseline mammography screening at age 40."],
            "guideline_source": "USPSTF 2024 Breast Cancer Screening Guidelines",
            "assessment_summary": f"Routine mammography not yet due until age 40 (currently {age}).",
            "ai_explanation": f"USPSTF recommends biennial screening starting at age 40 for average risk. Patient is currently {age}."
        }

    if is_eligible_age or has_high_risk:
        if last_mammogram is None:
            status = "overdue"
            reasons.append(f"Patient is {age} years old and has no record of prior screening mammogram.")
            next_steps.append("Order baseline 2D/3D digital screening mammogram (tomosynthesis).")
            next_steps.append("Perform clinical breast examination and review family history.")
        elif years_since is not None and years_since > interval_years:
            status = "overdue"
            reasons.append(f"Screening mammogram is overdue (last completed {last_mammogram.isoformat()}, {years_since:.1f} years ago; recommended interval is {int(interval_years)} yr).")
            next_steps.append("Schedule bilateral screening digital mammography.")
        elif years_since is not None and years_since >= (interval_years - 0.25):
            status = "due_soon"
            reasons.append(f"Next screening mammogram will become due within 3 months.")
            next_steps.append("Schedule upcoming biennial mammography screening.")
        else:
            status = "up_to_date"
            next_steps.append("Maintain breast awareness and adhere to biennial screening schedule.")

    if has_high_risk and age >= 30:
        next_steps.append("Consider referral to high-risk breast clinic / genetic counseling for BRCA/Lynch risk evaluation.")

    next_due = None
    if status == "overdue":
        next_due = today
    elif last_mammogram:
        next_due = date(last_mammogram.year + int(interval_years), last_mammogram.month, min(last_mammogram.day, 28))

    summary = f"Breast cancer screening is {status.replace('_', ' ').upper()} (Risk: {risk_level.upper()})."
    ai_explainer = (
        f"ScreenWise AI Assessment: The USPSTF updated recommendations (2024) state that all women aged 40 to 74 "
        f"benefit from biennial screening mammography. Patient is {age} years old with "
        f"{'elevated familial risk' if has_high_risk else 'average population risk'}. {' '.join(reasons)}"
    )

    return {
        "category": "cancer_breast",
        "status": status,
        "risk_level": risk_level,
        "last_screened_date": last_mammogram,
        "next_due_date": next_due,
        "flagged_reasons": reasons,
        "suggested_next_steps": next_steps,
        "guideline_source": "USPSTF 2024 Screening for Breast Cancer",
        "assessment_summary": summary,
        "ai_explanation": ai_explainer
    }


def evaluate_cervical_cancer_screening(patient) -> Dict[str, Any]:
    """
    Evaluates cervical cancer screening based on USPSTF (2018) / ASCCP guidelines:
    - Women aged 21 to 29: Cervical cytology (Pap smear) alone every 3 years.
    - Women aged 30 to 65: Pap smear every 3 years OR hrHPV alone every 5 years OR hrHPV co-testing every 5 years.
    - Over 65: Not indicated if adequate prior negative screening and not at high risk.
    - Not indicated if patient had complete hysterectomy with cervix removal for benign disease.
    """
    age = patient.age
    sex = (patient.sex or "").lower()
    today = date.today()
    reasons: List[str] = []
    next_steps: List[str] = []

    if sex == "male" or not patient.cervix_present:
        return {
            "category": "cancer_cervical",
            "status": "not_indicated",
            "risk_level": "not_applicable",
            "last_screened_date": None,
            "next_due_date": None,
            "flagged_reasons": ["Screening not indicated (biological male or cervix removed during total hysterectomy for benign disease)."],
            "suggested_next_steps": ["No routine cervical cytology or HPV testing needed."],
            "guideline_source": "USPSTF 2018 / ASCCP Guidelines",
            "assessment_summary": "Cervical cancer screening is not clinically indicated.",
            "ai_explanation": "USPSTF guidelines specify cervical screening only for individuals with a cervix aged 21 to 65."
        }

    if age < 21:
        return {
            "category": "cancer_cervical",
            "status": "not_indicated",
            "risk_level": "low",
            "last_screened_date": None,
            "next_due_date": None,
            "flagged_reasons": [f"Patient is {age} years old. Screening before age 21 is not recommended regardless of sexual history."],
            "suggested_next_steps": ["Encourage completion of HPV vaccination series if not already received.", "Initiate routine Pap smear at age 21."],
            "guideline_source": "USPSTF 2018 Cervical Cancer Screening",
            "assessment_summary": "Screening not indicated under age 21.",
            "ai_explanation": "Cervical cancer screening before age 21 does not reduce incidence or mortality and increases harm from unnecessary procedures."
        }

    if age > 65:
        return {
            "category": "cancer_cervical",
            "status": "not_indicated",
            "risk_level": "low",
            "last_screened_date": patient.last_cervical_screen_date,
            "next_due_date": None,
            "flagged_reasons": [f"Patient is {age} years old (>65). Screening may be discontinued if prior screenings were consistently negative."],
            "suggested_next_steps": ["Verify history of adequate prior negative screenings (3 consecutive negative Pap tests or 2 negative HPV tests).", "No further routine screening needed if criteria met."],
            "guideline_source": "USPSTF 2018 Cervical Cancer Screening",
            "assessment_summary": "Routine screening discontinued after age 65 with documented negative history.",
            "ai_explanation": "For women over 65 who have had adequate prior screening and are not at high risk, routine screening is not recommended."
        }

    # Age 21-65: Active screening cohort
    interval_years = 3.0 if age < 30 else 5.0 # Cytology every 3 yr, or HPV/co-test every 5 yr
    last_screen = patient.last_cervical_screen_date
    years_since = (today - last_screen).days / 365.25 if last_screen else None
    
    status = "up_to_date"
    risk_level = "low"

    if last_screen is None:
        status = "overdue"
        risk_level = "moderate"
        reasons.append(f"Patient is {age} years old and has no record of prior cervical cytology (Pap) or hrHPV test.")
        if age < 30:
            next_steps.append("Schedule cervical cytology (Pap smear) alone.")
        else:
            next_steps.append("Schedule hrHPV screening alone or hrHPV co-testing with cytology.")
    elif years_since is not None and years_since > interval_years:
        status = "overdue"
        risk_level = "moderate"
        reasons.append(f"Cervical cancer screening overdue (last done {last_screen.isoformat()}, {years_since:.1f} years ago; recommended interval is {int(interval_years)} yr).")
        next_steps.append("Schedule cervical screening examination (Pap test / HPV co-testing).")
    elif years_since is not None and years_since >= (interval_years - 0.25):
        status = "due_soon"
        reasons.append("Cervical cancer screening will be due within 3 months.")
        next_steps.append("Arrange upcoming cervical screening visit.")
    else:
        status = "up_to_date"
        next_steps.append("Continue routine preventive surveillance.")

    next_due = None
    if status == "overdue":
        next_due = today
    elif last_screen:
        next_due = date(last_screen.year + int(interval_years), last_screen.month, min(last_screen.day, 28))

    summary = f"Cervical cancer screening is {status.replace('_', ' ').upper()} (Risk: {risk_level.upper()})."
    ai_explainer = (
        f"ScreenWise AI Assessment: USPSTF recommends cervical cytology every 3 years for ages 21-29, "
        f"and either cytology every 3 years, hrHPV every 5 years, or co-testing every 5 years for ages 30-65. "
        f"Patient is {age} years old. {' '.join(reasons)}"
    )

    return {
        "category": "cancer_cervical",
        "status": status,
        "risk_level": risk_level,
        "last_screened_date": last_screen,
        "next_due_date": next_due,
        "flagged_reasons": reasons,
        "suggested_next_steps": next_steps,
        "guideline_source": "USPSTF 2018 & ASCCP Consensus Guidelines",
        "assessment_summary": summary,
        "ai_explanation": ai_explainer
    }


def evaluate_colorectal_cancer_screening(patient) -> Dict[str, Any]:
    """
    Evaluates colorectal cancer screening based on USPSTF (2021) guidelines:
    - Recommends screening for colorectal cancer in all adults aged 45 to 75 (Grade A/B).
    - Modalities:
      * Annual FIT (Fecal Immunochemical Test) or high-sensitivity gFOBT
      * Stool DNA-FIT (Cologuard) every 3 years
      * Colonoscopy every 10 years (or every 5 years if family history of 1st-degree relative <60)
      * Flexible Sigmoidoscopy or CT colonography every 5 years
    """
    age = patient.age
    today = date.today()
    reasons: List[str] = []
    next_steps: List[str] = []

    last_screen = patient.last_colorectal_screen_date
    screen_type = (patient.colorectal_screen_type or "colonoscopy").lower()
    has_family_history = patient.family_history_colorectal_cancer

    # High-risk screening starts at 40 or 10 years before earliest diagnosed relative
    starts_at_age = 40 if has_family_history else 45
    
    if age < starts_at_age:
        next_screening_age = starts_at_age
        return {
            "category": "cancer_colorectal",
            "status": "not_indicated",
            "risk_level": "moderate" if has_family_history else "low",
            "last_screened_date": last_screen,
            "next_due_date": date(today.year + (next_screening_age - age), today.month, today.day),
            "flagged_reasons": [
                f"Patient is {age} years old. Screening starts at age {starts_at_age} "
                f"({'elevated risk due to family history' if has_family_history else 'USPSTF population age 45-75'})."
            ],
            "suggested_next_steps": [
                f"Plan for baseline colorectal screening at age {starts_at_age}.",
                "Maintain high-fiber diet, limit processed meats, and stay physically active."
            ],
            "guideline_source": "USPSTF 2021 Colorectal Cancer Screening",
            "assessment_summary": f"Colorectal screening not yet due (begins at age {starts_at_age}).",
            "ai_explanation": f"USPSTF lowered the baseline screening age to 45 for average-risk adults (or 40 if family history). Patient is {age}."
        }

    # Interval based on modality
    if has_family_history:
        interval_years = 5.0 # Colonoscopy every 5 years for high risk
    elif "fit" in screen_type or "fobt" in screen_type:
        interval_years = 1.0
    elif "stool_dna" in screen_type or "cologuard" in screen_type:
        interval_years = 3.0
    else:
        interval_years = 10.0 # Standard colonoscopy

    years_since = (today - last_screen).days / 365.25 if last_screen else None
    
    status = "up_to_date"
    risk_level = "high" if has_family_history else "moderate" if age >= 60 else "low"

    if has_family_history:
        reasons.append("First-degree family history of colorectal cancer increases lifetime risk significantly.")

    if 45 <= age <= 75 or (has_family_history and age >= 40):
        if last_screen is None:
            status = "overdue"
            reasons.append(f"Patient is {age} years old with no recorded history of colorectal screening.")
            next_steps.append("Discuss screening options with patient: Colonoscopy (gold standard, 10-year interval) or at-home FIT / sDNA-FIT stool testing.")
            next_steps.append("Issue order for selected screening modality based on patient preference and risk tier.")
        elif years_since is not None and years_since > interval_years:
            status = "overdue"
            reasons.append(f"Colorectal cancer screening overdue (last {screen_type} completed {last_screen.isoformat()}, {years_since:.1f} years ago; recommended interval is {int(interval_years)} yr).")
            next_steps.append(f"Schedule follow-up {screen_type} or discuss updated screening options.")
        elif years_since is not None and years_since >= (interval_years - 0.25):
            status = "due_soon"
            reasons.append(f"Colorectal cancer screening will become due within 3 months.")
            next_steps.append(f"Prepare routine orders for upcoming screening ({screen_type}).")
        else:
            status = "up_to_date"
            next_steps.append(f"Adhere to routine surveillance schedule. Next test due in approx {int(interval_years - (years_since or 0))} year(s).")
    elif age > 75:
        # Selectively screen 76-85
        reasons.append(f"Patient is {age} years old. Screening between 76-85 is selective based on overall health and prior screening history.")
        next_steps.append("Clinician-patient shared decision making based on life expectancy and comorbidity burden.")

    next_due = None
    if status == "overdue":
        next_due = today
    elif last_screen:
        next_due = date(last_screen.year + int(interval_years), last_screen.month, min(last_screen.day, 28))

    summary = f"Colorectal cancer screening is {status.replace('_', ' ').upper()} (Risk: {risk_level.upper()})."
    ai_explainer = (
        f"ScreenWise AI Assessment: USPSTF Grade A/B guidelines recommend colorectal screening for all adults aged 45-75. "
        f"Patient is {age} years old with {risk_level.upper()} risk stratification. {' '.join(reasons)}"
    )

    return {
        "category": "cancer_colorectal",
        "status": status,
        "risk_level": risk_level,
        "last_screened_date": last_screen,
        "next_due_date": next_due,
        "flagged_reasons": reasons,
        "suggested_next_steps": next_steps,
        "guideline_source": "USPSTF 2021 Screening for Colorectal Cancer",
        "assessment_summary": summary,
        "ai_explanation": ai_explainer
    }
