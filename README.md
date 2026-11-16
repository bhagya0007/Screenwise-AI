# ScreenWise AI 🩺

> **AI-Powered Adult Preventive Healthcare Screening Support Platform**  
> *A clinical decision-support surveillance tool — NOT a diagnostic system.*

ScreenWise AI assists healthcare providers and adults in identifying potentially overdue or unmet preventive screening needs across evidence-based clinical pathways. It explains **why** an individual was flagged, suggests **appropriate preventive next steps**, and tracks **follow-up care completion**.

---

## 🔬 Core Screening Pathways

| Pathway | Clinical Guideline | Target Population & Modalities | Frequency / Interval |
| :--- | :--- | :--- | :--- |
| **Type 2 Diabetes & Prediabetes** | **USPSTF (2021) & ADA (2024)** | Adults aged 35–70 with BMI ≥ 25 (or ≥ 23 Asian); adults with metabolic risk factors. Fasting Glucose / HbA1c. | Every 3 years if normal; annually if prediabetic (A1c 5.7–6.4%). |
| **Cardiovascular Health** | **USPSTF & ACC/AHA (2019/2023)** | Blood pressure checks (Adults 18+). Fasting/non-fasting lipid profile (Adults 40–75, or 20+ with CVD risk). | Annual BP for age ≥40 or elevated BP; 5-year lipid profile. |
| **Breast Cancer Screening** | **USPSTF Updated (2024)** | Cisgender women & individuals with breast tissue aged 40–74. Digital mammography (2D/3D tomosynthesis). | Biennial (every 2 years); annual if 1st-degree family history. |
| **Cervical Cancer Screening** | **USPSTF (2018) & ASCCP** | Individuals with a cervix aged 21–65. Cervical cytology alone or hrHPV / co-testing. | Age 21–29: Cytology every 3 yr. Age 30–65: hrHPV or co-test every 5 yr. |
| **Colorectal Cancer Screening** | **USPSTF Updated (2021)** | Adults aged 45–75. Colonoscopy, at-home FIT stool test, or Stool DNA-FIT (Cologuard). | Colonoscopy every 10 yr (5 yr for high risk); annual FIT; 3-yr sDNA-FIT. |

> **⚠️ Medical Disclaimer:** ScreenWise AI is an assistive screening-support tool designed for primary care workflows. It does **NOT** formulate medical diagnoses. All decisions must be confirmed by a licensed medical clinician.

---

## 🏛️ System Architecture

```
ScreenWise AI/
├── backend/
│   ├── app/
│   │   ├── core/           # Configuration & environment settings
│   │   ├── database/       # SQLite connection & SQLAlchemy Base
│   │   ├── models/         # Patient, ScreeningAssessment, FollowUpTask
│   │   ├── schemas/        # Pydantic schemas & response models
│   │   ├── guidelines/     # Rule engines (diabetes, cardiovascular, cancer)
│   │   ├── services/       # Business logic, AI explainer, seed data
│   │   └── routes/         # Health, Patients, Screenings, Follow-ups, Dashboard
│   ├── requirements.txt
│   ├── run.py
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/     # UI primitives, Navbar, Sidebar, ScreeningAlertCard, Modals
│   │   ├── pages/          # Dashboard, Patients, PatientDetail, Screenings, FollowUps, Guidelines
│   │   ├── layouts/        # AppLayout with medical disclaimer banner
│   │   ├── services/       # API clients for patients, screenings, follow-ups
│   │   ├── hooks/          # Custom hooks
│   │   └── types/          # Full TypeScript domain definitions
│   ├── vite.config.ts      # Vite configuration with Tailwind CSS v4 & proxy
│   └── package.json
└── README.md
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend server (auto-seeds realistic demo patients on first launch)
python run.py
```
Backend API will be running at: **`http://127.0.0.1:8000`**  
Interactive Swagger docs: **`http://127.0.0.1:8000/docs`**  
Health Check: **`http://127.0.0.1:8000/api/v1/health`**

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend will be available at: **`http://localhost:5173`**

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Health status and DB connectivity check |
| `GET` | `/api/v1/dashboard/stats` | Cohort-wide metrics, pathway breakdown, risk distribution |
| `GET` | `/api/v1/patients` | Search and list patients in surveillance cohort |
| `POST` | `/api/v1/patients` | Register new patient (triggers automatic guideline evaluation) |
| `GET` | `/api/v1/patients/{id}` | Patient profile and clinical parameters |
| `GET` | `/api/v1/screenings/patient/{id}` | Evaluations across all 5 pathways with AI explanations |
| `POST` | `/api/v1/screenings/evaluate/{id}` | Re-evaluate patient against clinical guidelines |
| `GET` | `/api/v1/follow-ups` | List pending, scheduled, and completed follow-up actions |
| `POST` | `/api/v1/follow-ups` | Schedule a new follow-up care order |
| `PUT` | `/api/v1/follow-ups/{id}` | Update status (e.g. mark as completed) |
