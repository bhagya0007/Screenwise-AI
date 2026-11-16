import pytest
from datetime import date
from fastapi.testclient import TestClient
from app.database.session import Base, engine, SessionLocal
from app.services.seed_data import seed_database_if_empty
from app.main import app

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database_if_empty(db)
    finally:
        db.close()

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"

def test_list_patients():
    response = client.get("/api/patients")
    assert response.status_code == 200
    patients = response.json()
    assert isinstance(patients, list)
    assert len(patients) >= 6
    # Verify patient reference format
    first_patient = patients[0]
    assert "patient_reference" in first_patient
    assert first_patient["patient_reference"].startswith("SW-")
    assert "full_name" in first_patient
    assert "date_of_birth" in first_patient
    assert "sex" in first_patient

def test_create_and_retrieve_patient():
    new_patient_payload = {
        "full_name": "Test Synthetic Patient",
        "date_of_birth": "1975-08-20",
        "sex": "male",
        "email": "test.patient@example.org",
        "phone": "(555) 019-2834",
        "bmi": 28.5,
        "systolic_bp": 135,
        "diastolic_bp": 85,
        "is_smoker": True,
        "has_hypertension": True,
        "family_history_colorectal_cancer": True
    }
    # Create patient
    create_res = client.post("/api/patients", json=new_patient_payload)
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["full_name"] == "Test Synthetic Patient"
    assert created["patient_reference"].startswith("SW-")
    assert created["is_smoker"] is True
    pid = created["id"]

    # Retrieve patient by ID
    get_res = client.get(f"/api/patients/{pid}")
    assert get_res.status_code == 200
    retrieved = get_res.json()
    assert retrieved["id"] == pid
    assert retrieved["full_name"] == "Test Synthetic Patient"
    assert retrieved["systolic_bp"] == 135

    # Update patient
    update_res = client.put(f"/api/patients/{pid}", json={"full_name": "Updated Synthetic Patient", "systolic_bp": 125})
    assert update_res.status_code == 200
    assert update_res.json()["full_name"] == "Updated Synthetic Patient"
    assert update_res.json()["systolic_bp"] == 125

    # Delete patient
    del_res = client.delete(f"/api/patients/{pid}")
    assert del_res.status_code == 204

    # Verify deleted
    get_del = client.get(f"/api/patients/{pid}")
    assert get_del.status_code == 404

def test_patient_assessment_endpoints():
    # 1. Trigger fresh assessment for patient 1 (Robert Chen)
    assess_res = client.post("/api/assessment/1")
    assert assess_res.status_code == 200
    assessment = assess_res.json()
    assert assessment["patient_id"] == 1
    assert "identified_flags" in assessment
    assert len(assessment["identified_flags"]) > 0
    assert "explanation" in assessment
    assert "guideline_version" in assessment
    assert len(assessment["recommendations"]) > 0

    # 2. Get latest assessment
    latest_res = client.get("/api/assessment/1/latest")
    assert latest_res.status_code == 200
    latest = latest_res.json()
    assert latest["patient_id"] == 1
    assert len(latest["recommendations"]) == 5 # 5 clinical pathways

    # 3. Get assessment history for patient
    hist_res = client.get("/api/assessment/1")
    assert hist_res.status_code == 200
    history = hist_res.json()
    assert isinstance(history, list)
    assert len(history) >= 1
    assert history[0]["patient_id"] == 1

def test_recommendations_endpoints():
    # 1. List all recommendations across cohort
    recs_res = client.get("/api/recommendations")
    assert recs_res.status_code == 200
    recs = recs_res.json()
    assert isinstance(recs, list)
    assert len(recs) > 0

    # 2. Filter by category
    dia_recs_res = client.get("/api/recommendations?category=diabetes")
    assert dia_recs_res.status_code == 200
    for r in dia_recs_res.json():
        assert r["screening_category"] == "diabetes"

    # 3. Update professional review status
    first_rec = recs[0]
    rec_id = first_rec["id"]
    put_res = client.put(f"/api/recommendations/{rec_id}/status", json={"professional_review_status": "acknowledged"})
    assert put_res.status_code == 200
    assert put_res.json()["professional_review_status"] == "acknowledged"

    # 4. Get recommendations for specific patient
    patient_recs = client.get("/api/recommendations/1")
    assert patient_recs.status_code == 200
    p_recs = patient_recs.json()
    assert isinstance(p_recs, list)
    assert len(p_recs) == 5
    for r in p_recs:
        assert r["patient_id"] == 1

def test_followups_lifecycle():
    # 1. List followups
    list_res = client.get("/api/followups")
    assert list_res.status_code == 200
    tasks = list_res.json()
    assert isinstance(tasks, list)
    assert len(tasks) > 0

    # 2. Create follow-up action
    new_task = {
        "patient_id": 1,
        "title": "Confirmatory Fasting Plasma Glucose Lab",
        "action_type": "lab_test",
        "priority": "urgent",
        "due_date": str(date.today()),
        "assigned_provider": "Central Clinical Laboratory",
        "notes": "12-hour fasting required before repeat draw."
    }
    post_res = client.post("/api/followups", json=new_task)
    assert post_res.status_code == 201
    created_task = post_res.json()
    assert created_task["title"] == "Confirmatory Fasting Plasma Glucose Lab"
    task_id = created_task["id"]

    # 3. Update follow-up status to completed
    put_res = client.put(f"/api/followups/{task_id}", json={"status": "completed"})
    assert put_res.status_code == 200
    updated_task = put_res.json()
    assert updated_task["status"] == "completed"
    assert updated_task["completion_date"] == str(date.today())

    # 4. Delete follow-up
    del_res = client.delete(f"/api/followups/{task_id}")
    assert del_res.status_code == 204

def test_analytics_endpoints():
    # 1. Overview analytics
    overview_res = client.get("/api/analytics/overview")
    assert overview_res.status_code == 200
    overview = overview_res.json()
    assert "total_patients" in overview
    assert "overall_coverage_rate" in overview
    assert "care_gaps_count" in overview
    assert "pathway_breakdown" in overview

    # 2. Screening coverage by pathway and age cohort
    coverage_res = client.get("/api/analytics/screening-coverage")
    assert coverage_res.status_code == 200
    coverage = coverage_res.json()
    assert "pathway_metrics" in coverage
    assert len(coverage["pathway_metrics"]) == 5
    assert "age_cohort_metrics" in coverage
    assert len(coverage["age_cohort_metrics"]) >= 4

    # 3. Follow-up completion analytics
    followup_res = client.get("/api/analytics/followups")
    assert followup_res.status_code == 200
    fu = followup_res.json()
    assert "total_followups" in fu
    assert "completion_rate" in fu
    assert "by_action_type" in fu
