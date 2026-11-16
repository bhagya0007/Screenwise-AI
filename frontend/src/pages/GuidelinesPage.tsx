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
  Info,
  Building2,
  Lock,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ClinicalDisclaimer } from '../components/ClinicalDisclaimer';

export const GuidelinesPage: React.FC = () => {
  const guidelines = [
    {
      id: 'diabetes',
      title: '1. Type 2 Diabetes & Prediabetes Pathway',
      source: 'Abu Dhabi Public Health Centre (ADPHC) / DoH IFHAS Comprehensive Health Assessment Standard (2024)',
      badge: 'Official ADPHC IFHAS Standard',
      population: 'Universal screening for all UAE citizens and residents aged 30 and older. Early initiation starting at age 18 for adults with BMI ≥ 25 kg/m² or cardiometabolic risk indicators (hypertension, dyslipidemia, first-degree family history, gestational diabetes).',
      tests: [
        'Fasting Plasma Glucose (FPG) — Normal < 100 mg/dL',
        'Hemoglobin A1c (HbA1c) — Normal < 5.7%',
        '2-Hour Oral Glucose Tolerance Test (OGTT)',
      ],
      interval: 'Every 3 years if normal. Annually if prediabetes identified (HbA1c 5.7% - 6.4% or FPG 100-125 mg/dL).',
      rationale: 'Given high regional cardiometabolic prevalence, ADPHC mandates baseline universal screening at age 30. Early detection of impaired fasting glucose enables structured lifestyle modification and secondary prevention.',
    },
    {
      id: 'cardiovascular',
      title: '2. Cardiovascular Health (Hypertension & Dyslipidemia)',
      source: 'ADPHC / DoH Weqaya Cardiovascular Disease Prevention Standard (2024)',
      badge: 'ADPHC Weqaya Protocol',
      population: 'Universal resting blood pressure evaluation for all adults aged 18 and older. Routine fasting lipid panel screening starting at age 20 for all adults, repeated every 5 years if normal, and every 1-2 years if borderline or with comorbid conditions.',
      tests: [
        'Resting Blood Pressure (Validated automated oscillometric or manual sphygmomanometer)',
        'Fasting Lipid Profile (Total Cholesterol, HDL-C, LDL-C, Triglycerides)',
        'Qualitative Cardiometabolic Profile Evaluation',
      ],
      interval: 'Annual blood pressure measurement for adults ≥40 or with prehypertension (120-129/<80); every 3 years for 18-39 if normal. Lipid panel every 5 years starting at age 20.',
      rationale: 'Hypertension and dyslipidemia are primary drivers of premature cardiovascular events in the UAE. Strict clinical safety rule: Formal 10-year risk scores are explicitly deferred when required inputs are missing to prevent arbitrary, unvalidated estimations.',
    },
    {
      id: 'cancer_breast',
      title: '3A. Cancer Screening: Breast Cancer Pathway',
      source: 'ADPHC Cancer Screening Clinical Standard & Practice Guidelines (2024)',
      badge: 'ADPHC Breast Screening Standard',
      population: 'All asymptomatic women aged 40 to 69 years at average risk. High-risk women (documented first-degree relative diagnosed with breast cancer or confirmed BRCA1/BRCA2 mutation) qualify for accelerated annual surveillance starting at age 30 (or 10 years earlier than earliest diagnosed relative).',
      tests: [
        'Bilateral Digital Screening Mammography (2D / 3D Digital Breast Tomosynthesis)',
        'Supplemental Breast Ultrasound or MRI for dense breast tissue or high hereditary risk',
      ],
      interval: 'Biennial (every 2 years) for average-risk women aged 40–69. Annual surveillance for high-risk cohorts starting at age 30.',
      rationale: 'ADPHC prioritizes early detection where 5-year survival exceeds 90%. Tailored intervals ensure high-risk women receive necessary imaging prior to general cohort age thresholds.',
    },
    {
      id: 'cancer_cervical',
      title: '3B. Cancer Screening: Cervical Cancer Pathway',
      source: 'ADPHC Cervical Cancer Screening Standard & Algorithm (2024)',
      badge: 'ADPHC Cervical Standard',
      population: 'Women with an intact cervix aged 25 to 65 years. Not recommended before age 25 or after total hysterectomy with removal of cervix for benign disease. Discontinuation after age 65 if documented adequate negative screening history.',
      tests: [
        'Liquid-Based Cervical Cytology (Pap smear) — Ages 25 to 29',
        'High-Risk HPV (hrHPV) DNA testing or Cytology/hrHPV Co-testing — Ages 30 to 65',
      ],
      interval: 'Ages 25–29: Cervical cytology every 3 years. Ages 30–65: hrHPV DNA testing or co-testing every 5 years (or cytology alone every 3 years if HPV testing unavailable).',
      rationale: 'Primary prevention with HPV vaccination combined with organized screening and timely management of cervical intraepithelial neoplasia (CIN) provides near-complete protection against invasive disease.',
    },
    {
      id: 'cancer_colorectal',
      title: '3C. Cancer Screening: Colorectal Cancer Pathway',
      source: 'ADPHC Colorectal Cancer Screening Standard & Algorithm (2024)',
      badge: 'ADPHC Colorectal Standard (Age 40+)',
      population: 'All asymptomatic adults aged 40 to 75 years (ADPHC initiates screening at age 40, earlier than standard Western guidelines due to regional epidemiological onset). Early initiation (age 30 or 10 years younger than relative) for positive first-degree family history.',
      tests: [
        'Annual High-Sensitivity Fecal Immunochemical Test (FIT)',
        'Screening Colonoscopy (gold standard full visualization and polypectomy)',
        'Stool DNA-FIT Co-testing (every 3 years)',
      ],
      interval: 'Fecal Immunochemical Test (FIT) annually, OR Screening Colonoscopy every 10 years (every 5 years for high-risk cohorts).',
      rationale: 'Due to documented younger age of onset in the UAE population, Abu Dhabi health authorities mandate colorectal screening starting at age 40. Removing precancerous adenomatous polyps dramatically lowers mortality.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#173A56] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#378C83]" />
            <span>Clinical Preventive Guidelines Library</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Authoritative, evidence-based parameters powering the ScreenWise AI screening intelligence engine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="teal" size="sm">
            <Building2 className="w-3.5 h-3.5 mr-1" />
            ADPHC & DoH Abu Dhabi 2024 Edition
          </Badge>
        </div>
      </div>

      <ClinicalDisclaimer variant="compact" />

      {/* Guidelines Accordion / Cards */}
      <div className="space-y-4">
        {guidelines.map((g) => (
          <Card key={g.id} className="overflow-hidden">
            <CardHeader className="bg-slate-50/70 border-b border-slate-200/80 py-3.5 px-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-bold text-[#173A56]">{g.title}</CardTitle>
                  <p className="text-[11px] text-slate-500 mt-0.5">{g.source}</p>
                </div>
                <Badge variant="teal" size="sm">
                  {g.badge}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="font-semibold text-slate-700 block">Applicable Population</span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">{g.population}</p>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-slate-700 block">Recommended Screening Modalities</span>
                  <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                    {g.tests.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-slate-700 block">Surveillance Interval</span>
                  <p className="text-slate-600 leading-relaxed text-[11px] font-medium text-[#378C83]">
                    {g.interval}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-start gap-2 bg-blue-50/50 p-3 rounded-lg text-slate-700">
                <Info className="w-4 h-4 text-[#173A56] shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong className="text-[#173A56]">Clinical Rationale: </strong>
                  {g.rationale}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
