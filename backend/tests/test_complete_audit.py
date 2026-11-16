import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.database.session import SessionLocal, Base, engine
from app.models.user import User
from app.core.security import hash_password, verify_password, verify_access_token

@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

# ==============================================================================
# 1. FUNCTIONAL TESTS
# ==============================================================================

def test_01_patient_creation(client: TestClient):
    """Test adult patient creation with full clinical markers."""
    payload = {
        "first_name": "Tariq",
        "last_name": "Al Hashimi",
        "date_of_birth": "1978-05-12", # 48yo male
        "sex": "male",
        "email": "tariq.hashimi@example.com",
        "phone": "+971 50 888 1234",
        "bmi": 28.2,
        "systolic_bp": 134,
        "diastolic_bp": 84,
        "is_smoker": True,
        "has_hypertension": True,
        "has_diabetes_history": False,
        "fasting_glucose": 110.0,
        "hba1c": 5.9,
        "total_cholesterol": 215.0,
        "hdl_cholesterol": 41.0,
        "ldl_cholesterol": 142.0,
        "family_history_diabetes": True,
        "family_history_cad": True,
        "family_history_colorectal_cancer": True,
        "cervix_present": False,
        "colorectal_screen_type": "colonoscopy"
    }
    res = client.post("/api/patients", json=payload)
    assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.text}"
    data = res.json()
    assert data["full_name"] == "Tariq Al Hashimi"
    assert data["age"] in [47, 48, 49]
    assert data["systolic_bp"] == 134
    assert data["is_smoker"] is True
    assert "id" in data
    # Save patient ID for subsequent tests
    test_01_patient_creation.patient_id = data["id"]

def test_02_patient_editing(client: TestClient):
    """Test editing patient vitals, clinical parameters, and recalculating guidelines."""
    pid = getattr(test_01_patient_creation, "patient_id", None)
    assert pid is not None, "Prior patient creation test must pass"

    update_payload = {
        "systolic_bp": 142,
        "diastolic_bp": 92,
        "hba1c": 6.3,
        "phone": "+971 50 999 5678"
    }
    res = client.put(f"/api/patients/{pid}", json=update_payload)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    assert data["systolic_bp"] == 142
    assert data["diastolic_bp"] == 92
    assert data["hba1c"] == 6.3
    assert data["phone"] == "+971 50 999 5678"

def test_03_patient_listing_and_filtering(client: TestClient):
    """Test listing patients with pagination, search, and retrieval."""
    # List all
    res = client.get("/api/patients?skip=0&limit=10")
    assert res.status_code == 200
    patients = res.json()
    assert isinstance(patients, list)
    assert len(patients) >= 1

    # Search by name
    res_search = client.get("/api/patients?search=Tariq")
    assert res_search.status_code == 200
    matched = res_search.json()
    assert any("Tariq" in p["full_name"] for p in matched)

    # Search nonexistent
    res_none = client.get("/api/patients?search=NonexistentZzz999")
    assert res_none.status_code == 200
    assert len(res_none.json()) == 0

def test_04_assessment_submission_and_rules(client: TestClient):
    """Test automated clinical guideline assessment execution."""
    pid = getattr(test_01_patient_creation, "patient_id", None)
    assert pid is not None

    res = client.post(f"/api/assessment/{pid}")
    assert res.status_code in [200, 201]
    assessment = res.json()
    assert "pathway_assessments" in assessment
    pathways = assessment["pathway_assessments"]
    assert len(pathways) >= 3, "Must assess diabetes, cardiovascular, and cancer pathways"

def test_05_all_three_screening_categories(client: TestClient):
    """Verify separate pathways evaluated for Diabetes, Cardiovascular, and Cancer."""
    pid = getattr(test_01_patient_creation, "patient_id", None)
    assert pid is not None

    res = client.get(f"/api/assessment/{pid}")
    assert res.status_code == 200
    assessments = res.json()
    assert len(assessments) >= 1
    pathways = assessments[0]["pathway_assessments"]
    categories = {p["category"] for p in pathways}

    # Verify all 3 major categories exist
    assert "diabetes" in categories, "Diabetes pathway missing"
    assert "cardiovascular" in categories, "Cardiovascular pathway missing"
    assert any(c.startswith("cancer_") for c in categories), "Cancer pathway missing"

    # Verify pathway properties
    for p in pathways:
        assert "status" in p
        assert "applicable_guideline_reference" in p
        assert "guideline_version" in p
        assert "professional_review_requirement" in p
        assert p["suggested_next_step"] is not None

def test_06_recommendation_generation_and_review(client: TestClient):
    """Verify recommendation generation, priority rating, and provider review lifecycle."""
    pid = getattr(test_01_patient_creation, "patient_id", None)
    assert pid is not None

    res = client.get(f"/api/recommendations/{pid}")
    assert res.status_code == 200
    recs = res.json()
    assert len(recs) >= 1

    rec = recs[0]
    assert "screening_category" in rec
    assert "recommendation" in rec
    assert "rationale" in rec
    assert rec["professional_review_status"] in ["pending_review", "acknowledged", "ordered", "dismissed"]

    # Test updating review status to 'acknowledged' via PUT
    rec_id = rec["id"]
    res_put = client.put(f"/api/recommendations/{rec_id}/status", json={"professional_review_status": "acknowledged"})
    assert res_put.status_code == 200
    assert res_put.json()["professional_review_status"] == "acknowledged"

def test_07_followup_creation_and_lifecycle(client: TestClient):
    """Test follow-up care creation and status transition (pending -> scheduled -> completed)."""
    pid = getattr(test_01_patient_creation, "patient_id", None)
    assert pid is not None

    # 1. Create Follow-Up
    payload = {
        "patient_id": pid,
        "title": "Preventive Screening Colonoscopy",
        "action_type": "consultation",
        "priority": "urgent",
        "status": "pending",
        "due_date": str(date.today() + timedelta(days=30)),
        "assigned_provider": "Sheikh Shakhbout Medical City (SSMC)",
        "notes": "Patient is 48 with positive family history of CRC."
    }
    res = client.post("/api/followups", json=payload)
    assert res.status_code == 201, f"Failed creating followup: {res.text}"
    fu = res.json()
    assert fu["status"] == "pending"
    fu_id = fu["id"]

    # 2. Update to 'scheduled'
    res_sched = client.put(f"/api/followups/{fu_id}", json={
        "status": "scheduled",
        "scheduled_date": str(date.today() + timedelta(days=14))
    })
    assert res_sched.status_code == 200
    assert res_sched.json()["status"] == "scheduled"

    # 3. Update to 'completed'
    res_comp = client.put(f"/api/followups/{fu_id}", json={
        "status": "completed",
        "completion_date": str(date.today()),
        "notes": "Colonoscopy completed; benign findings."
    })
    assert res_comp.status_code == 200
    assert res_comp.json()["status"] == "completed"
    assert res_comp.json()["completion_date"] == str(date.today())

def test_08_analytics_dynamic_updates(client: TestClient):
    """Verify population analytics recalculate dynamically."""
    res = client.get("/api/analytics/population")
    assert res.status_code == 200
    data = res.json()

    assert "summary" in data
    summary = data["summary"]
    assert summary["total_patients"] >= 1
    assert summary["completed_screening_actions"] >= 1
    assert summary["coverage_rate"] >= 0.0

    assert "diabetes_breakdown" in data
    assert "cardiovascular_breakdown" in data
    assert "cancer_breakdown" in data
    assert "monthly_screening_completion" in data
    assert "safeguards" in data
    assert data["safeguards"]["small_cell_suppression_active"] is True

# ==============================================================================
# 2. BACKEND VALIDATION & ERROR HANDLING TESTS
# ==============================================================================

def test_09_invalid_patient_id(client: TestClient):
    """Test requesting a nonexistent patient ID returns 404."""
    res = client.get("/api/patients/9999999")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()

def test_10_missing_required_fields(client: TestClient):
    """Test validation rejection when required fields are missing."""
    invalid_payload = {
        "first_name": "Incomplete"
        # Missing date_of_birth, sex
    }
    res = client.post("/api/patients", json=invalid_payload)
    assert res.status_code == 422, "Pydantic must reject missing required fields with 422"

def test_11_incorrect_data_types(client: TestClient):
    """Test validation rejection when invalid data types are supplied."""
    invalid_type_payload = {
        "first_name": "Test",
        "last_name": "Patient",
        "date_of_birth": "not-a-valid-date",
        "sex": "female",
        "systolic_bp": "high-blood-pressure" # String instead of integer
    }
    res = client.post("/api/patients", json=invalid_type_payload)
    assert res.status_code == 422, "Pydantic must reject invalid data types with 422"

# ==============================================================================
# 3. SECURITY & PRIVACY TESTS
# ==============================================================================

def test_12_password_hashing_security(db: Session):
    """Verify passwords are never stored in plaintext and use cryptographic salts."""
    users = db.query(User).all()
    assert len(users) >= 1
    for u in users:
        # Assert not plaintext
        assert not u.hashed_password.startswith("Fatima")
        assert not u.hashed_password.startswith("Maryam")
        assert not u.hashed_password.startswith("Admin")
        # Assert PBKDF2 structure: iterations$salt$hash
        parts = u.hashed_password.split("$")
        assert len(parts) == 3
        assert parts[0] == "100000"
        assert len(parts[1]) == 32 # 16 bytes salt in hex
        assert len(parts[2]) == 64 # 32 bytes SHA256 in hex

def test_13_auth_login_and_token_verification(client: TestClient):
    """Test authentication endpoint, token creation, and invalid credential handling."""
    # Valid login
    res = client.post("/api/auth/login", json={
        "username_or_email": "dr.fatima@screenwise.ae",
        "password": "Fatima2026!"
    })
    assert res.status_code == 200
    token_data = res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # Verify token payload
    payload = verify_access_token(token)
    assert payload is not None
    assert payload["sub"] == "dr.fatima"
    assert payload["role"] == "clinician"

    # Test invalid login
    res_bad = client.post("/api/auth/login", json={
        "username_or_email": "dr.fatima@screenwise.ae",
        "password": "IncorrectPassword!"
    })
    assert res_bad.status_code == 401

def test_14_privacy_cell_suppression(client: TestClient):
    """Verify small population groups (n < 5) are suppressed in analytics output."""
    res = client.get("/api/analytics/population")
    assert res.status_code == 200
    data = res.json()

    age_cohorts = data.get("age_cohorts", [])
    for cohort in age_cohorts:
        if 0 < cohort["patient_count"] < 5:
            assert cohort["is_suppressed"] is True
            assert cohort["display_patient_count"] == "< 5"
            assert cohort["is_sample_too_small"] is True

# ==============================================================================
# 4. CLINICAL SAFETY TESTS
# ==============================================================================

def test_15_guideline_references_and_versions(client: TestClient):
    """Ensure all assessments quote official Abu Dhabi ADPHC / DoH guideline versions."""
    pid = getattr(test_01_patient_creation, "patient_id", 1)
    res = client.get(f"/api/assessment/{pid}")
    assert res.status_code == 200
    assessments = res.json()
    assert len(assessments) >= 1
    for a in assessments:
        assert "ADPHC" in a["guideline_version"] or "DoH" in a["guideline_version"]
        for p in a.get("pathway_assessments", []):
            assert "ADPHC" in p["applicable_guideline_reference"] or "DoH" in p["applicable_guideline_reference"]
            assert "2024" in p["guideline_version"] or "ADPHC" in p["guideline_version"]

def test_16_missing_information_not_assumed_negative(client: TestClient):
    """Verify missing screening date or clinical measurement does not default to negative/clean."""
    payload = {
        "first_name": "Farida",
        "last_name": "Al Nuaimi",
        "date_of_birth": "1982-01-01", # 44yo female
        "sex": "female",
        "last_diabetes_screen_date": None,
        "last_lipid_panel_date": None,
        "last_mammogram_date": None
    }
    res = client.post("/api/patients", json=payload)
    assert res.status_code == 201
    pid = res.json()["id"]

    res_ass = client.get(f"/api/assessment/{pid}")
    assert res_ass.status_code == 200
    assessments = res_ass.json()
    pathways = assessments[0]["pathway_assessments"]

    # None of the unmeasured pathways should claim 'up_to_date'
    for p in pathways:
        if p["category"] in ["diabetes", "cardiovascular", "cancer_breast"]:
            assert p["status"] in ["potentially_due", "potentially_overdue", "insufficient_information", "flagged_risk", "requires_professional_review", "overdue", "due_soon"]
            assert p["status"] != "up_to_date"

def test_17_no_unvalidated_disease_probability(client: TestClient):
    """Verify the engine never outputs arbitrary risk probabilities or disease diagnoses."""
    pid = getattr(test_01_patient_creation, "patient_id", 1)
    res = client.get(f"/api/assessment/{pid}")
    assert res.status_code == 200
    assessments = res.json()
    for a in assessments:
        for p in a.get("pathway_assessments", []):
            reason = p["reason_for_flag"].lower()
            assert "you have diabetes" not in reason
            assert "you have cancer" not in reason
            if p["category"] == "cardiovascular":
                # Must never output arbitrary risk percentage
                assert "formal 10-year risk scoring is deferred" in str(p.get("uncertainty_note", "")).lower() or "deferred" in str(p.get("suggested_next_step", "")).lower() or p.get("risk_score") is None

def test_18_mandatory_professional_review(client: TestClient):
    """Verify all assessments and recommendations enforce physician review mandate."""
    res = client.get("/api/recommendations")
    assert res.status_code == 200
    recs = res.json()
    assert len(recs) >= 1
    for r in recs:
        assert r["requires_professional_review"] is True
        assert r["suggested_timing"] is not None
