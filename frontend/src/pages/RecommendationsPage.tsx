import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowRight,
  Filter,
  Check,
  CalendarPlus,
  Sparkles,
} from 'lucide-react';
import { screeningService } from '../services/screeningService';
import { followUpService } from '../services/followUpService';
import { ScreeningAssessment, ReviewStatus } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ClinicalDisclaimer } from '../components/ClinicalDisclaimer';
import { NewFollowUpModal } from '../components/NewFollowUpModal';

export const RecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<ScreeningAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [pathwayFilter, setPathwayFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Follow-up modal state
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<ScreeningAssessment | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const data = await screeningService.getRecommendations(
        pathwayFilter === 'all' ? undefined : pathwayFilter,
        statusFilter === 'all' ? undefined : statusFilter,
        undefined
      );
      setRecommendations(data);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [pathwayFilter, statusFilter]);

  const handleUpdateReviewStatus = async (id: number, status: ReviewStatus) => {
    try {
      await screeningService.updateReviewStatus(id, status);
      fetchRecommendations();
    } catch (err) {
      console.error('Failed to update review status:', err);
    }
  };

  const getPriorityBadge = (assessment: ScreeningAssessment) => {
    if (assessment.status === 'flagged_risk' || assessment.risk_level === 'high') {
      return <Badge variant="danger" size="sm">Urgent Review</Badge>;
    }
    if (assessment.status === 'overdue' || assessment.risk_level === 'moderate') {
      return <Badge variant="warning" size="sm">Moderate</Badge>;
    }
    return <Badge variant="teal" size="sm">Routine</Badge>;
  };

  const getReviewStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case 'ordered':
        return <Badge variant="teal">Order Placed</Badge>;
      case 'acknowledged':
        return <Badge variant="navy">MD Acknowledged</Badge>;
      case 'pending_review':
      default:
        return <Badge variant="warning">Pending Review</Badge>;
    }
  };

  const categoryLabels: Record<string, string> = {
    diabetes: 'Type 2 Diabetes',
    cardiovascular: 'Cardiovascular Health',
    cancer_breast: 'Breast Cancer',
    cancer_cervical: 'Cervical Cancer',
    cancer_colorectal: 'Colorectal Cancer',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#173A56] flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#378C83]" />
            <span>Preventive Care Recommendations</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Screening pathways flagged as overdue or requiring clinical provider review across the patient cohort.
          </p>
        </div>
      </div>

      <ClinicalDisclaimer variant="compact" />

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Pathway Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Pathway:
            </span>
            <div className="flex flex-wrap rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-[11px]">
              {[
                { label: 'All', value: 'all' },
                { label: 'Diabetes', value: 'diabetes' },
                { label: 'Cardiovascular', value: 'cardiovascular' },
                { label: 'Breast CA', value: 'cancer_breast' },
                { label: 'Cervical CA', value: 'cancer_cervical' },
                { label: 'Colorectal CA', value: 'cancer_colorectal' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setPathwayFilter(tab.value)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    pathwayFilter === tab.value
                      ? 'bg-white shadow-xs text-[#173A56] font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Review Status Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px] font-medium">Review Status:</span>
            <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-[11px]">
              {[
                { label: 'All', value: 'all' },
                { label: 'Pending Review', value: 'pending_review' },
                { label: 'Acknowledged', value: 'acknowledged' },
                { label: 'Ordered', value: 'ordered' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    statusFilter === tab.value
                      ? 'bg-white shadow-xs text-[#173A56] font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Recommendations List / Table */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#173A56] mx-auto" />
          <p className="text-xs text-slate-400 mt-3">Loading recommendations...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <Card className="p-12 text-center text-slate-500">
          <CheckCircle2 className="w-8 h-8 text-[#378C83] mx-auto mb-2 opacity-80" />
          <p className="text-sm font-semibold text-[#173A56]">No pending recommendations</p>
          <p className="text-xs text-slate-400 mt-1">All patient screening needs in this category are up to date or acknowledged.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <Card key={rec.id} className="p-5 border-l-4 border-l-[#173A56]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <Link
                    to={`/patients/${rec.patient_id}`}
                    className="font-bold text-sm text-[#173A56] hover:text-[#378C83] transition-colors"
                  >
                    {rec.patient_name || `Patient #${rec.patient_id}`}
                  </Link>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-semibold text-slate-700">
                    {categoryLabels[rec.category] || rec.category}
                  </span>
                  {getPriorityBadge(rec)}
                  {getReviewStatusBadge(rec.review_status)}
                </div>

                <div className="flex items-center gap-2">
                  {rec.review_status === 'pending_review' && (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => rec.id && handleUpdateReviewStatus(rec.id, 'acknowledged')}
                    >
                      <Check className="w-3 h-3" />
                      <span>Acknowledge</span>
                    </Button>
                  )}
                  {rec.review_status !== 'ordered' && (
                    <Button
                      variant="teal"
                      size="xs"
                      onClick={() => {
                        setSelectedAssessment(rec);
                        setIsFollowUpModalOpen(true);
                      }}
                    >
                      <CalendarPlus className="w-3 h-3" />
                      <span>Order & Schedule Follow-Up</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Rationale and Next Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block mb-1.5">
                    Clinical Reasons for Flagging
                  </span>
                  <ul className="space-y-1 text-slate-700">
                    {rec.flagged_reasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block mb-1.5">
                    Suggested Preventive Next Steps
                  </span>
                  <ul className="space-y-1 text-slate-700">
                    {rec.suggested_next_steps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-[#378C83] font-bold">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Guideline Source: <strong className="text-slate-600">{rec.guideline_source}</strong></span>
                <Link
                  to={`/patients/${rec.patient_id}`}
                  className="font-medium text-[#378C83] hover:text-[#2c726a] flex items-center gap-1"
                >
                  <span>View Full Patient Assessment</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Follow-up modal */}
      {selectedAssessment && (
        <NewFollowUpModal
          isOpen={isFollowUpModalOpen}
          onClose={() => setIsFollowUpModalOpen(false)}
          patientId={selectedAssessment.patient_id}
          patientName={selectedAssessment.patient_name || 'Patient'}
          assessment={selectedAssessment}
          onTaskCreated={() => {
            if (selectedAssessment.id) {
              handleUpdateReviewStatus(selectedAssessment.id, 'ordered');
            }
            setIsFollowUpModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
