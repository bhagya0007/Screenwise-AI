import React from 'react';
import {
  BookOpen,
  Activity,
  HeartPulse,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ClinicalDisclaimer } from '../components/ClinicalDisclaimer';

export const GuidelinesPage: React.FC = () => {
  const guidelines = [
    {
      id: 'diabetes',
      title: '1. Type 2 Diabetes & Prediabetes Pathway',
      source: 'USPSTF (2021) & ADA Standards of Care (2024)',
      badge: 'Grade B Recommendation',
      population: 'Asymptomatic adults aged 35 to 70 who are overweight or obese (BMI ≥ 25 kg/m², or ≥ 23 kg/m² for Asian Americans). Also adults of any age with risk factors (hypertension, family history, gestational diabetes).',
      tests: [
        'Fasting Plasma Glucose (FPG) — Normal < 100 mg/dL',
        'Hemoglobin A1c (HbA1c) — Normal < 5.7%',
        '2-Hour Oral Glucose Tolerance Test (OGTT)',
      ],
      interval: 'Every 3 years if normal. Annually if prediabetes (HbA1c 5.7% - 6.4% or FPG 100-125 mg/dL).',
      rationale: 'Early detection of prediabetes and diabetes enables lifestyle interventions and pharmacotherapy that significantly reduce microvascular and macrovascular complications.',
    },
    {
      id: 'cardiovascular',
      title: '2. Cardiovascular Health (Hypertension & Dyslipidemia)',
      source: 'USPSTF, ACC/AHA Primary Prevention Guidelines (2019/2023)',
      badge: 'Grade A / B Recommendations',
      population: 'Blood pressure screening for all adults aged 18+. Lipid panel screening universally for adults aged 40-75 (and aged 20-39 with cardiovascular risk factors such as smoking, family history, or diabetes).',
      tests: [
        'Office Resting Blood Pressure (Manual or automated oscillometric)',
        'Fasting / Non-Fasting Lipid Panel (Total Cholesterol, HDL, LDL, Triglycerides)',
        '10-Year ASCVD Risk Score calculation',
      ],
      interval: 'Annual BP check for adults ≥40 or with high-normal BP (120-129/<80); every 3-5 years if 18-39 and normal. Lipid profile every 5 years starting at age 40.',
      rationale: 'Hypertension and hyperlipidemia are primary modifiable risk factors for myocardial infarction, stroke, and heart failure. Routine monitoring directs statin and antihypertensive therapy.',
    },
    {
      id: 'cancer_breast',
      title: '3A. Cancer Screening: Breast Cancer Pathway',
      source: 'USPSTF Updated Recommendation (2024)',
      badge: 'Grade B Recommendation',
      population: 'All cisgender women and individuals assigned female at birth aged 40 to 74 at average risk. High-risk individuals (first-degree relative with premenopausal breast cancer or genetic mutations) qualify for early/augmented surveillance.',
      tests: [
        'Digital Screening Mammography (2D or 3D Digital Breast Tomosynthesis)',
        'Supplemental Breast MRI for high-risk individuals',
      ],
      interval: 'Biennial (every 2 years) from age 40 through age 74. High-risk patients may begin annual screening at age 30 or 10 years earlier than youngest affected relative.',
      rationale: 'Starting biennial mammograms at age 40 rather than age 50 prevents an estimated 1.3 additional breast cancer deaths per 1,000 women screened.',
    },
    {
      id: 'cancer_cervical',
      title: '3B. Cancer Screening: Cervical Cancer Pathway',
      source: 'USPSTF (2018) & ASCCP Consensus Guidelines',
      badge: 'Grade A Recommendation',
      population: 'Individuals with a cervix aged 21 to 65. Not indicated before age 21, nor after age 65 if documented history of adequate negative prior screening.',
      tests: [
        'Cervical Cytology (Liquid-based Pap smear)',
        'High-Risk Human Papillomavirus (hrHPV) testing',
        'hrHPV and Cytology Co-testing',
      ],
      interval: 'Age 21–29: Cytology alone every 3 years. Age 30–65: Cytology alone every 3 years, OR hrHPV alone every 5 years, OR hrHPV co-testing every 5 years.',
      rationale: 'Cervical cancer develops slowly from precursor lesions driven by persistent high-risk HPV. Screening and treatment of high-grade dysplasias effectively prevents invasive cervical cancer.',
    },
    {
      id: 'cancer_colorectal',
      title: '3C. Cancer Screening: Colorectal Cancer Pathway',
      source: 'USPSTF Updated Recommendation (2021)',
      badge: 'Grade A / B Recommendation',
      population: 'All adults aged 45 to 75 (Grade A: 50-75; Grade B: 45-49). Selective screening for ages 76-85. Early initiation (age 40) if 1st-degree relative has CRC.',
      tests: [
        'High-sensitivity Fecal Immunochemical Test (FIT) or gFOBT',
        'Stool DNA-FIT (Cologuard)',
        'Colonoscopy (direct endoscopic visualization and polypectomy)',
        'CT Colonography or Flexible Sigmoidoscopy',
      ],
      interval: 'Annual for FIT; every 3 years for Stool DNA-FIT; every 10 years for screening Colonoscopy (every 5 years for high-risk).',
      rationale: 'Lowering the baseline screening age to 45 addresses rising incidence of early-onset colorectal adenocarcinoma. Polypectomy during colonoscopy halts malignant progression.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span>Clinical Preventive Guidelines Library</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Authoritative evidence-based parameters powering the ScreenWise AI screening intelligence engine.
          </p>
        </div>
      </div>

      <ClinicalDisclaimer variant="compact" />

      {/* Guidelines Accordion / Cards */}
      <div className="space-y-6">
        {guidelines.map((g) => (
          <Card key={g.id} className="overflow-hidden border border-slate-200">
            <CardHeader className="bg-slate-50/80 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-900">{g.title}</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">{g.source}</p>
                </div>
                <Badge variant="navy">{g.badge}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 text-xs">
              <div>
                <p className="font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Target Screening Population
                </p>
                <p className="text-slate-600 leading-relaxed">{g.population}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <p className="font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Recommended Screening Modalities
                  </p>
                  <ul className="space-y-1 text-slate-600">
                    {g.tests.map((t, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Guideline Screening Intervals
                  </p>
                  <p className="text-slate-600 leading-relaxed font-medium">{g.interval}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 bg-blue-50/40 p-3 rounded-lg">
                <p className="font-semibold text-blue-900 mb-1">Clinical Evidence & Rationale:</p>
                <p className="text-blue-950/80 leading-relaxed">{g.rationale}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
