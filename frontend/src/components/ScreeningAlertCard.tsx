import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MinusCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CalendarPlus,
  ArrowRight,
} from 'lucide-react';
import { ScreeningAssessment, ScreeningCategory } from '../types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface ScreeningAlertCardProps {
  assessment: ScreeningAssessment;
  patientName?: string;
  onScheduleFollowUp?: (assessment: ScreeningAssessment) => void;
}

export const ScreeningAlertCard: React.FC<ScreeningAlertCardProps> = ({
  assessment,
  patientName,
  onScheduleFollowUp,
}) => {
  const [showAiExplainer, setShowAiExplainer] = useState(false);

  const categoryTitles: Record<ScreeningCategory, { title: string; subtitle: string }> = {
    diabetes: {
      title: 'Type 2 Diabetes & Prediabetes',
      subtitle: 'ADPHC IFHAS 2024 Standard (FPG / HbA1c)',
    },
    cardiovascular: {
      title: 'Cardiovascular Health',
      subtitle: 'ADPHC Weqaya 2024 Standard (Blood Pressure & Lipid Profile)',
    },
    cancer_breast: {
      title: 'Breast Cancer Screening',
      subtitle: 'ADPHC 2024 Standard (Biennial Mammography, Ages 40–75)',
    },
    cancer_cervical: {
      title: 'Cervical Cancer Screening',
      subtitle: 'ADPHC 2024 Standard (hrHPV & Cytology, Ages 25–65)',
    },
    cancer_colorectal: {
      title: 'Colorectal Cancer Screening',
      subtitle: 'ADPHC 2024 Standard (Annual FIT / Colonoscopy, Age 40+)',
    },
  };

  const meta = categoryTitles[assessment.category] || {
    title: assessment.category.replace('_', ' ').toUpperCase(),
    subtitle: assessment.applicable_guideline_reference || assessment.guideline_source,
  };

  const getStatusBadge = () => {
    if (assessment.flag_status) {
      switch (assessment.flag_status) {
        case 'Requires professional review':
          return (
            <Badge variant="danger">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Requires Professional Review</span>
            </Badge>
          );
        case 'Potentially overdue':
          return (
            <Badge variant="warning">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Potentially Overdue</span>
            </Badge>
          );
        case 'Potentially due':
          return (
            <Badge variant="teal">
              <Clock className="w-3.5 h-3.5" />
              <span>Potentially Due</span>
            </Badge>
          );
        case 'No current gap identified':
          return (
            <Badge variant="success">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>No Gap Identified</span>
            </Badge>
          );
        case 'Insufficient information':
          return (
            <Badge variant="secondary">
              <MinusCircle className="w-3.5 h-3.5" />
              <span>Insufficient Info</span>
            </Badge>
          );
      }
    }

    switch (assessment.status) {
      case 'up_to_date':
        return (
          <Badge variant="success">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Up to Date</span>
          </Badge>
        );
      case 'due_soon':
        return (
          <Badge variant="warning">
            <Clock className="w-3.5 h-3.5" />
            <span>Due Soon</span>
          </Badge>
        );
      case 'overdue':
        return (
          <Badge variant="danger">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Overdue</span>
          </Badge>
        );
      case 'flagged_risk':
        return (
          <Badge variant="danger">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Flagged Risk</span>
          </Badge>
        );
      case 'not_indicated':
      default:
        return (
          <Badge variant="secondary">
            <MinusCircle className="w-3.5 h-3.5" />
            <span>Not Indicated</span>
          </Badge>
        );
    }
  };

  const getRiskBadge = () => {
    switch (assessment.risk_level) {
      case 'high':
        return <Badge variant="danger" size="sm">High Risk</Badge>;
      case 'moderate':
        return <Badge variant="warning" size="sm">Moderate Risk</Badge>;
      case 'low':
        return <Badge variant="teal" size="sm">Standard / Low</Badge>;
      default:
        return null;
    }
  };

  const isActionNeeded = assessment.status === 'overdue' || assessment.status === 'flagged_risk' || assessment.status === 'due_soon';

  return (
    <div className={`rounded-xl border transition-all ${
      assessment.status === 'flagged_risk'
        ? 'border-rose-300 bg-rose-50/20'
        : assessment.status === 'overdue'
        ? 'border-amber-300 bg-amber-50/15'
        : 'border-slate-200 bg-white'
    } p-5 shadow-xs hover:shadow-md`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-slate-900 text-base">{meta.title}</h4>
            {getStatusBadge()}
            {getRiskBadge()}
          </div>
          <p className="text-xs text-slate-500 mt-1">{meta.subtitle}</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isActionNeeded && onScheduleFollowUp && (
            <Button
              variant={assessment.status === 'flagged_risk' ? 'danger' : 'primary'}
              size="sm"
              onClick={() => onScheduleFollowUp(assessment)}
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>Schedule Follow-Up</span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 text-xs">
        {/* Why Flagged (Reasons) */}
        <div className="bg-slate-50/80 p-3.5 rounded-lg border border-slate-100">
          <p className="font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Clinical Indicators / Rationale</span>
          </p>
          {assessment.flagged_reasons.length > 0 ? (
            <ul className="space-y-1.5 text-slate-600">
              {assessment.flagged_reasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400 italic">No specific risk triggers flagged.</p>
          )}

          {/* Missing data tags if any */}
          {assessment.missing_information && assessment.missing_information.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-slate-200/60">
              <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider block mb-1">
                Data Gaps Noted:
              </span>
              <div className="flex flex-wrap gap-1">
                {assessment.missing_information.map((m, i) => (
                  <span key={i} className="inline-block bg-amber-100/80 text-amber-900 text-[10px] px-1.5 py-0.5 rounded font-medium">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Suggested Next Steps */}
        <div className="bg-slate-50/80 p-3.5 rounded-lg border border-slate-100 flex flex-col justify-between">
          <div>
            <p className="font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
              <span>Recommended Preventive Next Steps</span>
            </p>
            {assessment.suggested_next_steps.length > 0 ? (
              <ul className="space-y-1.5 text-slate-600">
                {assessment.suggested_next_steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-blue-600 font-semibold">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400 italic">Continue routine surveillance.</p>
            )}
          </div>

          {/* Uncertainty or scoring note if present */}
          {assessment.uncertainty_note && (
            <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 italic">
              <strong>Clinical Note:</strong> {assessment.uncertainty_note}
            </div>
          )}
        </div>
      </div>

      {/* Dates row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-500 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <span>
            Last Screened:{' '}
            <strong className="text-slate-700">
              {assessment.last_screened_date || 'Never recorded'}
            </strong>
          </span>
          {assessment.next_due_date && (
            <span>
              Target Due Date:{' '}
              <strong className="text-slate-700">{assessment.next_due_date}</strong>
            </span>
          )}
        </div>

        {assessment.ai_explanation && (
          <button
            onClick={() => setShowAiExplainer(!showAiExplainer)}
            className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{showAiExplainer ? 'Hide AI Rationale' : 'View AI Clinical Explainer'}</span>
            {showAiExplainer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* AI Explainer Accordion */}
      {showAiExplainer && assessment.ai_explanation && (
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-slate-50 border border-indigo-200/80 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 mb-2 text-indigo-900 font-semibold text-xs">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>ScreenWise AI Clinical Decision Explanation</span>
          </div>
          <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed font-normal">
            {assessment.ai_explanation}
          </div>
        </div>
      )}
    </div>
  );
};
