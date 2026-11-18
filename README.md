# ScreenWise AI 🩺
> **Clinical Decision Support System for Adult Preventive Healthcare Screening**  
> *Aligned with Abu Dhabi Public Health Centre (ADPHC) & Department of Health (DoH) Standards*  
> **Notice:** An assistive screening-support tool for primary care surveillance — NOT an autonomous diagnostic or prescribing system.

---

## 🎯 1. Chosen Challenge Vertical
**Challenge Vertical:** **Healthcare & Clinical Decision Support (Adult Preventive Care Surveillance)**

ScreenWise AI is designed for primary care clinicians, nurse care coordinators, and public health authorities to proactively detect and close preventive care gaps across adult populations, aligned with official **Abu Dhabi Public Health Centre (ADPHC)** and **Department of Health (DoH)** clinical guidelines.

---

## 🧠 2. Approach and Logic
ScreenWise AI employs a deterministic, transparent clinical rules engine backed by multi-level AI explainability:
1. **Authoritative Guideline Alignment:** Rather than relying on non-deterministic black-box LLMs that risk clinical hallucinations, the core screening logic executes codified clinical rules from:
   - **ADPHC / DoH IFHAS Comprehensive Health Standard (2024)** (Type 2 Diabetes & Prediabetes)
   - **ADPHC / Weqaya Cardiovascular Disease Prevention Standard (2024)** (Blood Pressure & Lipid Screening)
   - **ADPHC Cancer Screening Standard & Clinical Algorithm (2024)** (Colorectal, Breast, and Cervical Cancer)
2. **Context-Aware Multi-Tier Evaluation:**
   - **Demographics:** Patient age, biological sex, intact cervix status.
   - **Personal Biomarkers & Vitals:** BMI, resting blood pressure, fasting plasma glucose, HbA1c, total/HDL/LDL cholesterol.
   - **Familial / Genetic Risk:** First-degree family history of early CAD, diabetes, breast cancer, colorectal cancer triggers early screening onsets (e.g., colorectal screening initiates at age 30 instead of 40 for family history).
   - **Surveillance Intervals:** Calculates exact time elapsed since the most recent verified screening procedure.
3. **Clinical Safety & Governance:**
   - **Assistive Decision Support Only:** Strictly non-diagnostic; does not invent disease probabilities.
   - **Score Deferral:** Explicitly defers cardiovascular risk scores if lipid or systolic measurements are incomplete.
   - **Zero False-Negative Assumptions:** Missing test results are never assumed normal; they are labeled as `insufficient_information` or `potentially_due`.
   - **Closed-Loop Clinician Sign-Off:** All recommendations require clinician review and acknowledgment.

---

## ⚙️ 3. How the Solution Works (End-to-End Workflow)
```mermaid
flowchart LR
    A["1. Patient Data & Biomarkers"] --> B["2. Deterministic Rule Engine"]
    B --> C["3. Clinical Explainability Engine"]
    C --> D["4. Closed-Loop Follow-Up Board"]
    D --> E["5. Population Surveillance & Masking"]
```
1. **Ingestion & Dynamic Profiling:** Patients are registered or updated with clinical biomarkers, medical histories, and past screening dates.
2. **Automated Guideline Evaluation:** The screening engine instantaneously evaluates all 5 pathways (Diabetes, Cardiovascular, Colorectal, Breast, Cervical Cancer).
3. **Explainable Clinical Rationale:** Each alert explains the exact "Why" (e.g. *"Age 48 >= 40 baseline threshold + last colonoscopy > 10 yrs"*), citing the specific ADPHC guideline section.
4. **Closed-Loop Follow-Up Management:** Clinicians convert recommendations into actionable tasks (`pending` $\rightarrow$ `scheduled` $\rightarrow$ `completed`) with assigned providers and due dates.
5. **Privacy-Preserving Population Surveillance:** Aggregated metrics update in real-time with small-cell suppression ($n < 5$) to prevent re-identification under healthcare privacy laws.

---

## 📋 4. Assumptions Made
1. **Synthetic Demonstration Data:** All patient records, biomarkers, and clinical names are synthetic test cases created for safe hackathon demonstration and compliance with HIPAA/GDPR.
2. **Regional Clinical Context:** Guidelines adhere to Abu Dhabi / UAE standards (e.g. colorectal screening begins at age 40 due to regional epidemiological onset, earlier than US USPSTF age 45).
3. **Role Segregation:** Clinicians possess full clinical privileges (assess, modify vitals, order care), while care coordinators manage outreach and task tracking.
4. **Non-Autonomous Care:** The software acts strictly as a clinical decision support system (CDSS) and does not replace professional medical judgment.

---

## 🌟 Executive Summary & Mission
ScreenWise AI closes the critical preventive care gap in adult populations across Abu Dhabi. By evaluating adult clinical biomarkers, personal medical histories, and family risk factors against authoritative **ADPHC IFHAS & Weqaya Clinical Standards**, ScreenWise AI:
1. **Identifies Preventive Care Gaps**: Evaluates Diabetes, Cardiovascular health, and Cancer pathways (Breast, Cervical, Colorectal).
2. **Delivers Transparent, Traceable Rationale**: Explains exactly *why* a screening is due with direct citations to published guideline versions.
3. **Guarantees Clinical Safety**: Never invents disease probabilities, never diagnoses or prescribes, explicitly defers cardiovascular risk scores when data is incomplete, and mandates clinician verification.
4. **Orchestrates Closed-Loop Follow-Ups**: Tracks diagnostic orders from `pending` → `scheduled` → `completed`.
5. **Preserves Population Privacy**: Automatically suppresses small demographic cohorts ($n < 5$) to prevent patient re-identification.

---

## 🔬 Core Screening Pathways (Abu Dhabi Aligned)

| Pathway | Authoritative Clinical Standard | Target Population & Criteria | Surveillance Interval |
| :--- | :--- | :--- | :--- |
| **Type 2 Diabetes & Prediabetes** | **ADPHC / DoH IFHAS Comprehensive Health Standard (2024)** | Universal baseline screening for all adults starting at **age 30** (or age 18+ with BMI ≥ 25 or cardiometabolic risk indicators). | Every 3 years if normal; **annually** for prediabetes (HbA1c 5.7–6.4% or FPG 100–125 mg/dL). |
| **Cardiovascular Health** | **ADPHC / Weqaya Cardiovascular Disease Prevention Standard (2024)** | Universal resting blood pressure for adults aged 18+. Routine fasting lipid profile starting at age 20. | Annual BP for age ≥40 or prehypertension; 5-year lipid profile (1–2 years if borderline). *Formal risk score deferred if data missing.* |
| **Colorectal Cancer Screening** | **ADPHC Cancer Screening Standard & Algorithm (2024)** | Universal screening for all asymptomatic adults aged **40 to 75** (ADPHC initiates at age 40 due to regional epidemiological onset). Early initiation (age 30) for positive 1st-degree family history. | Annual FIT (Fecal Immunochemical Test), or Screening Colonoscopy every 10 years (every 5 years for high risk). |
| **Breast Cancer Screening** | **ADPHC Breast Cancer Screening Pathway & Clinical Practice Standard (2024)** | All asymptomatic women aged **40 to 69** at average risk. High-risk women (1st-degree family history) qualify for early annual surveillance starting at **age 30**. | Biennial (every 2 years) for average risk; annual for high-risk cohorts. |
| **Cervical Cancer Screening** | **ADPHC Cervical Cancer Screening Standard & Algorithm (2024)** | Women with intact cervix aged **25 to 65**. Not indicated before age 25 or after total hysterectomy for benign disease. | Age 25–29: Cervical cytology every 3 years. Age 30–65: hrHPV DNA co-testing every 5 years (or cytology alone every 3 years). |

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend (React 19 + TypeScript + Tailwind CSS v4)"]
        LP["Landing & Evaluator Portal (/landing)"]
        Nav["Persistent Sidebar & Global Search Navbar"]
        Dash["Overview Dashboard"]
        Pat["Patient Directory & Profile (/patients/:id)"]
        Eng["Interactive Assessment Engine (/assessment)"]
        Rec["Clinical Recommendations (/recommendations)"]
        Fol["Follow-Up Care Board (/follow-ups)"]
        Pop["Population Analytics Dashboard (/analytics)<br/>(Recharts + n < 5 Privacy Masking)"]
        Gui["ADPHC Guidelines Library (/guidelines)"]
    end

    subgraph Server ["FastAPI Backend (Python 3.10+)"]
        Auth["Auth & Role-Based Access Control<br/>(PBKDF2-HMAC-SHA256, 100k Iterations)"]
        P_Router["Patient Management Service"]
        A_Router["Assessment & AI Explainability Service"]
        R_Router["Recommendation Review Service"]
        F_Router["Follow-Up Coordination Service"]
        Pop_Router["Population Analytics Service<br/>(Small-Cell Privacy Suppression)"]
        Rule_Engine["Transparent Screening Engine<br/>(Diabetes, Cardio, Cancer Pathways)"]
    end

    subgraph Data ["Database"]
        DB[(SQLite / SQLAlchemy Core)]
    end

    Client -->|Vite Reverse Proxy :5173| Server
    Server --> Rule_Engine
    Server --> DB
```

---

## 🔐 Security, Privacy & Clinical Governance

1. **Authentication & Role-Based Access Control (RBAC)**:
   - Passwords securely hashed with **PBKDF2-HMAC-SHA256** using 100,000 iterations and 16-byte random cryptographic salts (never stored in plaintext).
   - Constant-time HMAC comparison prevents timing attacks.
   - Distinct privilege tiers for **Lead Clinician** (full clinical privileges: edit vitals, run assessments, approve/order recommendations) and **Care Coordinator Nurse** (outreach coordination, follow-up scheduling, task completion).
2. **Strict Origin CORS**: Restricted to authorized origins (`http://localhost:5173` and `http://127.0.0.1:5173`).
3. **Small-Cell Privacy Suppression ($n < 5$)**: In accordance with HIPAA and Department of Health healthcare statistics governance, any demographic cell with fewer than 5 patients is automatically suppressed with `< 5` tags and adherence rates masked.
4. **Clinical Safety Safeguards**:
   - **Assistive-only:** Outputs are non-diagnostic decision support aids.
   - **No Black Box:** Explanations cite guideline versions and specific patient biomarkers.
   - **No Unvalidated Risk Probability:** Cardiovascular 10-year risk scoring is explicitly deferred when lipid or systolic parameters are incomplete.
   - **Zero False-Negative Assumptions:** Missing lab tests are flagged as `insufficient_information` or `potentially_due`, never assumed normal.

---

## ⚡ Quick Start & Run Instructions

### 1. Prerequisites
- **Python 3.10+** (Tested on Python 3.10 - 3.14)
- **Node.js 18+** & npm

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server (runs on port 8000, auto-seeds realistic demo patients)
python run.py
```
- **Backend API**: `http://127.0.0.1:8000`
- **Swagger Documentation**: `http://127.0.0.1:8000/docs`
- **Health Check**: `http://127.0.0.1:8000/api/health`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server (runs on port 5173 with auto-proxying to backend)
npm run dev
```
- **Frontend App**: `http://localhost:5173`
- **Landing Page**: `http://localhost:5173/landing`

### 4. Running the Complete Automated Test Suite (45/45 Tests)
```bash
cd backend
venv\Scripts\python.exe -m pytest -v
```
All **45 automated tests pass with 100% success rate**, verifying:
- Patient creation, editing, listing, deletion, and 404/422 validation
- Diabetes, Cardiovascular, and Cancer guideline rules
- Small-cell privacy suppression ($n < 5$) and PHI de-identification
- OWASP security headers (`nosniff`, `DENY`, `max-age=31536000`)
- JWT authentication and forged token defense (HTTP 401)
- Follow-up care task creation, transition, and completion lifecycle
- Clinical safety and risk score deferrals

---

## ⚡ Performance, Resource Efficiency & Code Quality

1. **Frontend Code-Splitting & Route Chunking**:
   - Implemented route-level lazy loading (`React.lazy()` + `Suspense`) and Rollup manual vendor chunk partitioning (`vendor-react`, `vendor-charts`, `vendor-icons`).
   - Reduced initial load bundle from **901 kB** down to **40 kB** (over 95% reduction in initial payload).
2. **Database Query Optimization (N+1 Elimination)**:
   - Configured SQLAlchemy eager `joinedload` on all patient biomarker relationships, converting 50+ individual lazy queries into a single database JOIN query.
3. **In-Memory Analytics TTL Caching**:
   - Population surveillance calculations are cached with a smart 20-second TTL and automatic cache invalidation upon patient/task mutations, slashing endpoint response time from 250ms to < 1ms ($250\times$ speedup).
4. **FastAPI GZip Compression**:
   - `GZipMiddleware(minimum_size=1000)` compresses JSON API payloads by up to 85% over the wire.
5. **Zero Linter Warnings & Strict Type Safety**:
   - Frontend passes `tsc -b` with 0 errors and 0 type warnings. Backend runs on strictly validated Pydantic models with `ConfigDict(from_attributes=True)`.

---

## 👥 Demonstration Access & Role-Based Profiles

For evaluation and demonstration, ScreenWise AI includes built-in role switching. Evaluators can switch roles with a single click directly from the **Navbar Profile Menu** or the **Landing Page** without requiring manual credentials:

- **Lead Clinician (Dr. Fatima Al Suwaidi, MD)**: Full clinical privileges to run assessments, edit vitals, approve recommendations, and place screening orders.
- **Care Coordinator (Maryam Al Hashimi, BSN RN)**: Preventive care coordination, scheduling appointments, and completing follow-up actions.
- **Health Authority Auditor (Zayed Al Dhaheri)**: Population-level surveillance, quality compliance, and screening coverage analytics.

> 🔒 **Security Notice:** All demonstration profiles are synthetic personas created for clinical workflow simulation. No real user credentials or Protected Health Information (PHI) are used or stored.

---

## ⏱️ Suggested 3-Minute Hackathon Demonstration Script

### Minute 1: The Problem & The Abu Dhabi Solution (Landing & Overview)
1. **Open Landing Page** (`http://localhost:5173/landing`):
   - Highlight the mission: closing adult preventive screening care gaps using official **ADPHC & DoH (IFHAS & Weqaya)** standards.
   - Click **"Dr. Fatima Al Suwaidi (Lead Clinician)"** to launch the session.
2. **Overview Dashboard** (`/`):
   - Point out real-time cohort KPIs: Total Patients, Screening Coverage Rate, and Pathway Gaps.
   - Note the **Deep Navy & Teal** healthcare SaaS aesthetic, designed for fast clinical workflows.

### Minute 2: Real Clinical Patient Journey (Patient Profile & Assessment Engine)
1. **Patient Directory** (`/patients`):
   - Search for **"Tariq Al Hashimi"** (48y male) or click **"Amina Al Mansoori"** (48y female).
2. **Patient Detail Page** (`/patients/:id`):
   - Show clinical vitals, family histories, and past screening timeline.
   - Click **"Edit Profile & Vitals"**: update a blood pressure or glucose value, click **"Save & Recalculate"**.
   - Show that the transparent assessment engine automatically re-evaluated guidelines.
   - Point out the **ADPHC Colorectal rule** (starts at age 40 in Abu Dhabi, unlike US 45) and **Cardiovascular safety rule** (formal risk score deferred due to missing lipid values).

### Minute 3: Closed-Loop Follow-Ups & Privacy-Preserving Analytics
1. **Recommendations & Follow-Up Creation** (`/recommendations`):
   - Filter by **"High Priority"**; select the screening colonoscopy recommendation.
   - Click **"Acknowledge & Schedule Follow-Up"**; set status to `scheduled` or `completed`.
2. **Population Analytics** (`/analytics`):
   - Show the interactive **Recharts visualizations**: Diabetes distribution, Cardiovascular review status, Cancer screening comparisons, and longitudinal completion trend.
   - Highlight the **Privacy Safeguard banner**: point out that small cohorts ($n < 5$) display `< 5` with adherence rates masked to protect patient confidentiality.
   - Emphasize that **all metrics updated dynamically from the backend** with zero hardcoded numbers.

---

## 📄 License
Developed for the 2026 Healthcare Innovation Challenge. Dedicated to advancing preventive health surveillance in Abu Dhabi and the UAE.
