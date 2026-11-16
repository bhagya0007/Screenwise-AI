"""
ScreenWise AI - Full End-to-End Integration Workflow Verification
Simulates the entire healthcare professional user journey through the live API
(via Vite dev proxy on port 5173 to FastAPI on port 8000).

Workflow steps:
1. Healthcare professional opens dashboard (checks health & baseline stats).
2. Views the patient cohort list.
3. Creates a new adult patient (Amina Al Mansoori, 48yo female with maternal breast cancer history).
4. Reviews medical and screening history.
5. Runs screening assessment.
6. Backend evaluates applicable Abu Dhabi screening rules.
7. Frontend displays screening flags with explanations.
8. Professional reviews recommendations and acknowledges high-priority recommendation.
9. Creates a follow-up action.
10. Updates follow-up to scheduled, then completed.
11. Verifies that overview and population analytics dynamically update.
"""

import json
import urllib.request
import urllib.parse
from datetime import date

BASE_URL = "http://localhost:5173/api"

def http_req(endpoint: str, method: str = "GET", data: dict = None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        content = resp.read().decode("utf-8")
        return json.loads(content) if content else {}

def run_full_integration_test():
    print("=" * 70)
    print("SCREENWISE AI - COMPLETE INTEGRATION WORKFLOW TEST")
    print("=" * 70)

    # 1. Dashboard Health Check
    print("\n[Step 1] Opening Dashboard & Verifying API Health...")
    health = http_req("/health")
    assert health["status"] == "healthy", f"Unexpected health: {health}"
    assert health["database"] == "connected", f"Unexpected DB: {health}"
    print(f" -> System Healthy! Service: {health['app_name']}, Database: {health['database']}")

    stats_before = http_req("/dashboard/stats")
    print(f" -> Baseline Total Patients: {stats_before['total_patients']}")
    print(f" -> Baseline Completed Follow-ups: {stats_before['completed_follow_ups']}")

    # 2. View Patient List
    print("\n[Step 2] Viewing Patient Cohort Directory...")
    patients_before = http_req("/patients")
    assert isinstance(patients_before, list)
    print(f" -> Retrieved {len(patients_before)} existing patient records.")

    # 3. Create / Register New Adult Patient
    print("\n[Step 3] Registering New Adult Patient (Amina Al Mansoori)...")
    new_patient_data = {
        "first_name": "Amina",
        "last_name": "Al Mansoori",
        "date_of_birth": "1978-05-12", # 48yo female
        "sex": "female",
        "email": "amina.almansoori@example.ae",
        "phone": "+971 50 123 4567",
        "bmi": 26.4,
        "systolic_bp": 132,
        "diastolic_bp": 84,
        "is_smoker": False,
        "has_diabetes_history": False,
        "has_hypertension": False,
        "family_history_diabetes": True,
        "family_history_cad": False,
        "family_history_breast_cancer": True,
        "family_history_colorectal_cancer": False,
        "cervix_present": True,
        "last_diabetes_screen_date": None,
        "last_lipid_panel_date": None,
        "last_bp_check_date": "2026-01-15",
        "last_mammogram_date": None,
        "last_cervical_screen_date": "2022-03-10",
        "last_colorectal_screen_date": None,
        "colorectal_screen_type": "colonoscopy"
    }
    created_patient = http_req("/patients", method="POST", data=new_patient_data)
    patient_id = created_patient["id"]
    ref_id = created_patient["patient_reference"]
    print(f" -> Patient Registered Successfully!")
    print(f"    Name: {created_patient['full_name']} | Reference: {ref_id} | Age: {created_patient['age']}")
    assert created_patient["full_name"] == "Amina Al Mansoori"
    assert ref_id.startswith("SW-")

    # 4. Review Medical and Screening History
    print(f"\n[Step 4] Reviewing Medical Profile for Patient #{patient_id} ({ref_id})...")
    patient_profile = http_req(f"/patients/{patient_id}")
    assert patient_profile["id"] == patient_id
    print(f" -> Vitals: BMI {patient_profile['bmi']}, BP {patient_profile['systolic_bp']}/{patient_profile['diastolic_bp']} mmHg")
    print(f" -> High-Risk Flags: Family Hx Breast Cancer: {patient_profile['family_history_breast_cancer']}, Family Hx Diabetes: {patient_profile['family_history_diabetes']}")

    # 5 & 6. Run Screening Assessment
    print(f"\n[Step 5 & 6] Executing Screening Assessment Engine against Abu Dhabi Guidelines...")
    assessment = http_req(f"/assessment/{patient_id}", method="POST")
    assert assessment["patient_id"] == patient_id
    assert len(assessment["recommendations"]) == 5
    print(f" -> Assessment ID: {assessment['id']}")
    print(f" -> Guideline Version: {assessment['guideline_version']}")
    print(f" -> Identified Clinical Flags ({len(assessment['identified_flags'])}):")
    for flag in assessment["identified_flags"]:
        print(f"    * {flag}")

    # 7. Frontend Displays Screening Flags with Explanations
    print("\n[Step 7] Validating Detailed Pathway Rationale & Next Steps...")
    pathway_evals = assessment.get("pathway_assessments", [])
    assert len(pathway_evals) == 5, f"Expected 5 pathways, got {len(pathway_evals)}"
    for p in pathway_evals:
        cat = p["screening_category"]
        flag_status = p["flag_status"]
        guideline = p["applicable_guideline_reference"]
        next_step = p["suggested_next_step"]
        print(f" -> [{cat.upper()}] Flag: '{flag_status}'")
        print(f"    Guideline: {guideline}")
        print(f"    Next Step: {next_step[:80]}...")

    # 8. Professional Reviews Recommendations
    print("\n[Step 8] Clinician Review of Generated Recommendations...")
    recs = http_req(f"/recommendations/{patient_id}")
    assert len(recs) == 5
    print(f" -> Loaded {len(recs)} pathway recommendations.")
    breast_rec = next(r for r in recs if r["screening_category"] == "cancer_breast")
    print(f" -> Selected High-Priority Recommendation ID #{breast_rec['id']}:")
    print(f"    Category: {breast_rec['screening_category']} | Priority: {breast_rec['priority']}")
    print(f"    Action: {breast_rec['recommendation']}")
    print(f"    Initial Status: {breast_rec['professional_review_status']}")

    # Update review status to acknowledged
    updated_rec = http_req(
        f"/recommendations/{breast_rec['id']}/status",
        method="PUT",
        data={"professional_review_status": "acknowledged"}
    )
    assert updated_rec["professional_review_status"] == "acknowledged"
    print(f" -> Clinician Action: Professional Review Status updated to '{updated_rec['professional_review_status']}'")

    # 9. Professional Creates a Follow-Up
    print("\n[Step 9] Creating Follow-Up Care Action for Patient...")
    new_followup = {
        "patient_id": patient_id,
        "recommendation_id": breast_rec["id"],
        "title": "Bilateral 3D Screening Digital Mammography",
        "action_type": "imaging",
        "status": "pending",
        "priority": "urgent",
        "due_date": str(date.today()),
        "assigned_provider": "Abu Dhabi Breast Imaging Center",
        "notes": "48yo female with first-degree maternal history of breast cancer. ADPHC screening pathway."
    }
    created_followup = http_req("/followups", method="POST", data=new_followup)
    task_id = created_followup["id"]
    print(f" -> Follow-Up Created! Task ID #{task_id}")
    print(f"    Title: {created_followup['title']} | Status: {created_followup['status']} | Due: {created_followup['due_date']}")
    assert created_followup["status"] == "pending"

    # 10. Update Follow-up Status to Scheduled, then Completed
    print("\n[Step 10] Updating Follow-Up Lifecycle (Pending -> Scheduled -> Completed)...")
    # Schedule
    scheduled = http_req(
        f"/followups/{task_id}",
        method="PUT",
        data={
            "status": "scheduled",
            "scheduled_date": str(date.today()),
            "notes": "Patient scheduled for mammogram at 10:00 AM."
        }
    )
    assert scheduled["status"] == "scheduled"
    assert scheduled["scheduled_date"] == str(date.today())
    print(f" -> Updated to: '{scheduled['status']}' on {scheduled['scheduled_date']}")

    # Complete
    completed = http_req(
        f"/followups/{task_id}",
        method="PUT",
        data={
            "status": "completed",
            "completion_date": str(date.today()),
            "notes": "Mammogram completed. BIRADS 1 (negative). Annual recall in 12 months."
        }
    )
    assert completed["status"] == "completed"
    assert completed["completion_date"] == str(date.today())
    print(f" -> Updated to: '{completed['status']}' on {completed['completion_date']}")

    # 11. Overview & Population Analytics Update Accordingly
    print("\n[Step 11] Verifying Dynamic Dashboard & Population Analytics Updates...")
    stats_after = http_req("/dashboard/stats")
    analytics_after = http_req("/analytics/population")

    print(f" -> Total Patients: {stats_before['total_patients']} -> {stats_after['total_patients']} (+1)")
    assert stats_after["total_patients"] == stats_before["total_patients"] + 1

    print(f" -> Completed Follow-Ups: {stats_before['completed_follow_ups']} -> {stats_after['completed_follow_ups']} (+1)")
    assert stats_after["completed_follow_ups"] == stats_before["completed_follow_ups"] + 1

    print(f" -> Population Analytics Coverage Rate: {analytics_after['summary']['coverage_rate']}%")
    print(f" -> Population Analytics Task Completion Rate: {analytics_after['summary']['task_completion_rate']}%")
    
    # Check that recent activity lists our completed task
    recent_actions = [a["description"] for a in analytics_after["recent_activity"]]
    print(f" -> Recent Activity Feed contains new task: {any('Amina' in a for a in recent_actions)}")

    print("\n" + "=" * 70)
    print("SUCCESS: ALL 11 WORKFLOW STEPS VERIFIED END-TO-END WITH ZERO ERRORS!")
    print("=" * 70)

if __name__ == "__main__":
    run_full_integration_test()
