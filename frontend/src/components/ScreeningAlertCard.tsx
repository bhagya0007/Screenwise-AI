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
      subtitle: 'USPSTF 2021 / ADA 2024 Criteria (FPG / HbA1c)',
    },
    cardiovascular: {
      title: 'Cardiovascular Health',
      subtitle: 'ACC/AHA & USPSTF (Blood Pressure & Lipid Profile)',
    },
    cancer_breast: {
      title: 'Breast Cancer Screening',
      subtitle: 'USPSTF 2024 (Biennial Digital Mammography)',
    },
    cancer_cervical: {
      title: 'Cervical Cancer Screening',
      subtitle: 'USPSTF 2018 / ASCCP (Cytology & hrHPV)',
    },
    cancer_colorectal: {
      title: 'Colorectal Cancer Screening',
      subtitle: 'USPSTF 2021 (FIT / sDNA-FIT / Colonoscopy)',
    },
  };

  const meta = categoryTitles[assessment.category] || {
    title: assessment.category.replace('_', ' ').toUpperCase(),
    subtitle: assessment.guideline_source,
  };

  const getStatusBadge = () => {
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
        return <Badge variant="info" size="sm">Standard / Low</Badge>;
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
        </div>

        {/* Suggested Next Steps */}
        <div className="bg-slate-50/80 p-3.5 rounded-lg border border-slate-100">
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
