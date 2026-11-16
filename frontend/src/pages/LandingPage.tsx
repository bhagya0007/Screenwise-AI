import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Activity,
  HeartPulse,
  Users,
  Sparkles,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
  Building2,
  Stethoscope,
  Award,
  BookOpen,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLaunchRole = async (role: string) => {
    try {
      // Set session role
      localStorage.setItem('screenwise_role', role);
      // Trigger demo switch API in background
      await fetch(`/api/auth/demo-switch?role=${role}`, { method: 'POST' });
    } catch (e) {
      console.warn('Role switch:', e);
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-slate-800 flex flex-col font-sans">
      {/* Top Notification Bar */}
      <div className="bg-[#173A56] text-white px-4 py-2 text-xs text-center flex items-center justify-center gap-2">
        <Badge variant="teal" size="sm">Abu Dhabi Healthcare Standard</Badge>
        <span className="text-slate-200">
          Built for ADPHC & DoH Preventive Screening Guidelines (IFHAS & Weqaya Standards)
        </span>
      </div>

      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#173A56] to-[#378C83] flex items-center justify-center text-white shadow-sm">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-[#173A56] tracking-tight">ScreenWise AI</span>
              <span className="text-[10px] bg-teal-50 text-[#378C83] border border-teal-200 font-semibold px-2 py-0.5 rounded-full">
                Clinical Decision Support
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Adult Preventive Screening & Surveillance</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/guidelines" className="text-xs font-semibold text-slate-600 hover:text-[#173A56] hidden sm:block">
            Guideline Library
          </Link>
          <Link to="/analytics" className="text-xs font-semibold text-slate-600 hover:text-[#173A56] hidden sm:block">
            Population Analytics
          </Link>
          <Button
            onClick={() => handleLaunchRole('clinician')}
            variant="teal"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <span>Enter Clinical App</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-12 md:py-16 max-w-6xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#173A56] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#378C83]" />
          <span>Hackathon 2026 Ready • 100% Transparent Screening Engine</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#173A56] tracking-tight max-w-4xl mx-auto leading-tight">
          Closing Care Gaps in Preventive Adult Healthcare Across Abu Dhabi
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          ScreenWise AI evaluates adult patients against official Abu Dhabi Public Health Centre (ADPHC) and DoH guidelines,
          identifying overdue screenings, explaining clinical rationale, and orchestrating closed-loop follow-up actions.
        </p>

        {/* 1-Click Safe Hackathon Evaluation Access */}
        <div className="pt-4 max-w-2xl mx-auto">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Award className="w-4 h-4 text-[#378C83]" />
              <span>One-Click Hackathon Evaluator Access</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <button
                onClick={() => handleLaunchRole('clinician')}
                className="p-3.5 rounded-xl border-2 border-[#173A56] bg-slate-50/60 hover:bg-[#173A56] hover:text-white text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[#173A56] group-hover:text-white">Dr. Fatima Al Suwaidi</div>
                  <Badge variant="navy" size="sm">Lead Clinician</Badge>
                </div>
                <p className="text-[11px] text-slate-500 group-hover:text-slate-200 mt-1">
                  Full clinical privileges: run assessments, edit vitals, approve & order recommendations.
                </p>
              </button>

              <button
                onClick={() => handleLaunchRole('nurse')}
                className="p-3.5 rounded-xl border-2 border-[#378C83] bg-teal-50/40 hover:bg-[#378C83] hover:text-white text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[#378C83] group-hover:text-white">Maryam Al Hashimi, RN</div>
                  <Badge variant="teal" size="sm">Care Coordinator</Badge>
                </div>
                <p className="text-[11px] text-slate-600 group-hover:text-teal-100 mt-1">
                  Follow-up tracking: outreach scheduling, task completion, and cohort care gap monitoring.
                </p>
              </button>
            </div>
            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-1">
              <Link to="/assessment" className="text-[#378C83] hover:underline font-semibold flex items-center gap-1">
                <span>Or test the standalone interactive simulator →</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Pathways Section */}
      <section className="px-6 py-10 max-w-6xl mx-auto w-full space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-[#173A56]">Three Transparent Clinical Screening Pathways</h2>
          <p className="text-xs text-slate-500">Zero black-box AI. Every flag is fully traceable to published ADPHC / DoH protocols.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pathway 1: Diabetes */}
          <Card className="p-5 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#173A56] flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#378C83]" />
            </div>
            <h3 className="font-bold text-sm text-[#173A56]">1. Diabetes & Prediabetes Pathway</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Aligned with ADPHC IFHAS adult standards. Universal screening initiation starting at <strong>age 30</strong> (or age 18+ with cardiometabolic indicators).
              Annual recall protocol for prediabetes (HbA1c 5.7–6.4%).
            </p>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Interval:</span> Every 3 years (Normal) / Annual (Prediabetes)
            </div>
          </Card>

          {/* Pathway 2: Cardiovascular */}
          <Card className="p-5 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="font-bold text-sm text-[#173A56]">2. Cardiovascular Health Pathway</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ADPHC / Weqaya screening protocol: annual resting blood pressure for all adults aged 18+ and routine fasting lipid profiles.
              <strong> Safety rule:</strong> Formal 10-year risk scoring is explicitly deferred if inputs are missing; arbitrary risk scores are forbidden.
            </p>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Interval:</span> Annual BP / 5-Year Lipids (Age 20+)
            </div>
          </Card>

          {/* Pathway 3: Cancer */}
          <Card className="p-5 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#378C83] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#378C83]" />
            </div>
            <h3 className="font-bold text-sm text-[#173A56]">3. Cancer Screening Pathways</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Configurable pathways for:
              <br />• <strong>Colorectal:</strong> Begins at <strong>age 40</strong> under ADPHC standard (earlier than US 45).
              <br />• <strong>Breast:</strong> Biennial mammogram ages 40–69 (age 30 if 1st-degree family history).
              <br />• <strong>Cervical:</strong> Cytology or hrHPV co-testing ages 25–65.
            </p>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Standards:</span> ADPHC Colorectal, Breast & Cervical Guidelines
            </div>
          </Card>
        </div>
      </section>

      {/* Governance & Safety Highlights */}
      <section className="bg-white border-y border-slate-200/80 py-10 px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-[#173A56]">Safety, Privacy & Clinical Governance</h2>
            <p className="text-xs text-slate-500">Engineered to meet stringent health authority standards.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#173A56]">
                <Lock className="w-4 h-4 text-[#378C83]" />
                <span>Small-Cell Suppression</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Population analytics automatically masks sample cohorts with $n &lt; 5$ to eliminate re-identification risk.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#173A56]">
                <Stethoscope className="w-4 h-4 text-[#378C83]" />
                <span>Physician Review Mandate</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Recommendations are assistive decision pathways; every action requires explicit professional clinician verification.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#173A56]">
                <Info className="w-4 h-4 text-[#378C83]" />
                <span>No Negative Assumptions</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Missing clinical tests never assume normal results; uncertainty and information gaps are explicitly flagged.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#173A56]">
                <Building2 className="w-4 h-4 text-[#378C83]" />
                <span>Synthetic Cohort Only</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                All demonstration patients and records are 100% synthetic representations compliant with HIPAA/DOH privacy ethics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#173A56] text-white py-6 px-6 text-xs text-center border-t border-slate-700">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-300">
          <p>© 2026 ScreenWise AI • Abu Dhabi Adult Preventive Healthcare Screening Decision Support</p>
          <div className="flex items-center gap-4">
            <Link to="/guidelines" className="hover:text-white underline">Guideline Standards</Link>
            <Link to="/overview" className="hover:text-white underline">Live Overview</Link>
            <Link to="/patients" className="hover:text-white underline">Patient Directory</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
