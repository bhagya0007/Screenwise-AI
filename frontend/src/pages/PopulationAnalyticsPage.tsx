import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  ShieldCheck,
  Activity,
  Layers,
  CalendarCheck,
  Clock,
  ShieldAlert,
  Info,
  Lock,
  FileCheck2,
  Ribbon,
  HeartPulse,
  Dna,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { analyticsService } from '../services/analyticsService';
import { PopulationAnalyticsData } from '../types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ClinicalDisclaimer } from '../components/ClinicalDisclaimer';

const CHART_COLORS = {
  navy: '#173A56',
  teal: '#378C83',
  tealLight: '#5fb8ae',
  amber: '#F59E0B',
  rose: '#E11D48',
  indigo: '#4F46E5',
  slate: '#64748B',
  slateLight: '#94A3B8',
  slateBorder: '#E2E8F0',
};

export const PopulationAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<PopulationAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setError(null);
      const res = await analyticsService.getPopulationData();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load population analytics:', err);
      setError(err?.message || 'Failed to connect to analytics service.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-3">
        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-[#173A56]" />
        <span className="text-xs text-slate-500 font-medium">Aggregating cohort screening metrics...</span>
      </div>
    );
  }

  // 1. Diabetes Data for Chart
  const diabetesData = data?.diabetes_breakdown
    ? [
        { name: 'Up to Date', count: data.diabetes_breakdown.up_to_date, fill: CHART_COLORS.teal },
        { name: 'Potentially Due', count: data.diabetes_breakdown.potentially_due, fill: CHART_COLORS.navy },
        { name: 'Potentially Overdue', count: data.diabetes_breakdown.potentially_overdue, fill: CHART_COLORS.amber },
        { name: 'Prediabetes / Elevated', count: data.diabetes_breakdown.prediabetes_high_risk, fill: CHART_COLORS.rose },
      ]
    : [];

  // 2. Cardiovascular Data for Chart
  const cardioData = data?.cardiovascular_breakdown
    ? [
        { name: 'Up to Date', count: data.cardiovascular_breakdown.up_to_date, fill: CHART_COLORS.teal },
        { name: 'BP Overdue', count: data.cardiovascular_breakdown.bp_overdue, fill: CHART_COLORS.amber },
        { name: 'Lipid Overdue', count: data.cardiovascular_breakdown.lipid_overdue, fill: CHART_COLORS.amber },
        { name: 'Stage 1/2 HTN', count: data.cardiovascular_breakdown.stage1_stage2_htn, fill: CHART_COLORS.rose },
        { name: 'Multi-Risk', count: data.cardiovascular_breakdown.multi_risk_flagged, fill: CHART_COLORS.rose },
      ]
    : [];

  // 3. Cancer Screening Pathways Grouped Data
  const cancerData = data?.cancer_breakdown
    ? [
        {
          pathway: 'Breast Cancer',
          'Up to Date': data.cancer_breakdown.breast.up_to_date,
          'Potentially Due': data.cancer_breakdown.breast.potentially_due,
          'Overdue': data.cancer_breakdown.breast.potentially_overdue,
          'High Hereditary Risk': data.cancer_breakdown.breast.high_risk,
        },
        {
          pathway: 'Cervical Cancer',
          'Up to Date': data.cancer_breakdown.cervical.up_to_date,
          'Potentially Due': data.cancer_breakdown.cervical.potentially_due,
          'Overdue': data.cancer_breakdown.cervical.potentially_overdue,
          'High Hereditary Risk': 0,
        },
        {
          pathway: 'Colorectal (Age 40+)',
          'Up to Date': data.cancer_breakdown.colorectal.up_to_date,
          'Potentially Due': data.cancer_breakdown.colorectal.potentially_due,
          'Overdue': data.cancer_breakdown.colorectal.potentially_overdue,
          'High Hereditary Risk': data.cancer_breakdown.colorectal.high_risk,
        },
      ]
    : [];

  // 4. Monthly Screening Completion Trend Data
  const monthlyCompletionData = data?.monthly_screening_completion || [];

  // 5. Follow-Up Completion Trend Data
  const followupTrendData = data?.followup_completion_trend || [];

  // 6. Age Cohorts Data with Privacy Suppression check
  const ageCohortChartData = (data?.age_cohorts || []).map((c) => {
    const isSmall = c.patient_count < 5;
    return {
      cohort: `Age ${c.cohort}`,
      patientCount: c.patient_count,
      displayCount: c.display_patient_count || (isSmall ? '< 5' : String(c.patient_count)),
      isSuppressed: isSmall,
      'Adherence Rate %': isSmall ? 0 : c.adherence_rate,
      'Eligible Screenings': c.screenings_evaluated,
      'Documented Up-to-Date': c.up_to_date,
      'Care Gaps': c.care_gaps,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#173A56] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#378C83]" />
            <span>Population Health & Screening Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cohort-level adult preventive screening adherence, quality metrics, care gaps, and follow-up completion trends.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={refreshing}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Analytics'}</span>
          </Button>
        </div>
      </div>

      {/* Mandatory Clinical & Synthetic Data Disclaimer */}
      <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-amber-950">
              Synthetic Demonstration Cohort & Clinical Decision Support Notice
            </p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Analytics displayed are computed strictly from synthetic, de-identified demo patient profiles for
              adult preventive screening simulation. Screening recommendations represent guideline-triggered decision pathways
              and do not equate to clinical diagnoses. Professional clinician review is required before ordering or completing care.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
          <Badge variant="warning" size="sm">
            <Lock className="w-3 h-3 mr-1" />
            Cell Suppression (n &lt; 5) Active
          </Badge>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 6 Core Population Analytics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        {/* Metric 1: Total Adult Patients */}
        <Card className="p-3.5">
          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">
            Total Adult Cohort
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-[#173A56]">
              {data?.summary.total_patients || 0}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Patients</span>
          </div>
          <span className="text-[11px] text-[#378C83] mt-1 block font-medium">
            {data?.summary.patients_assessed || 0} Assessed with Guidelines
          </span>
        </Card>

        {/* Metric 2: Overall Screening Coverage Rate */}
        <Card className="p-3.5">
          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">
            Screening Coverage Rate
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-[#378C83]">
              {data?.summary.coverage_rate || 0}%
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {data?.summary.total_screenings || 0} Eligible pathways tracked
          </span>
        </Card>

        {/* Metric 3: Potentially Due Flags */}
        <Card className="p-3.5">
          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">
            Potentially Due Flags
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-[#173A56]">
              {data?.summary.potentially_due_flags ?? data?.summary.care_gap_count ?? 0}
            </span>
            <span className="text-[11px] text-amber-600 font-semibold">Recall Due</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {data?.summary.potentially_overdue_flags || 0} Overdue for screening
          </span>
        </Card>

        {/* Metric 4: Completed Screening Actions */}
        <Card className="p-3.5">
          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">
            Completed Actions
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-[#378C83]">
              {data?.summary.completed_screening_actions ?? data?.summary.completed_follow_ups ?? 0}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Verified</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Procedures &amp; follow-ups completed
          </span>
        </Card>

        {/* Metric 5: Follow-Up Completion Rate */}
        <Card className="p-3.5">
          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">
            Follow-Up Completion
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-[#173A56]">
              {data?.summary.task_completion_rate || 0}%
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {data?.summary.completed_follow_ups || 0} of {data?.summary.total_follow_ups || 0} Orders fulfilled
          </span>
        </Card>

        {/* Metric 6: Pending & Overdue Follow-ups */}
        <Card className="p-3.5">
          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">
            Pending / Overdue Orders
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-amber-600">
              {data?.summary.pending_followups ?? (data?.summary.total_follow_ups ? data.summary.total_follow_ups - (data.summary.completed_follow_ups || 0) : 0)}
            </span>
            <span className="text-[11px] text-rose-600 font-semibold">
              {data?.summary.overdue_followups || 0} Overdue
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {data?.summary.scheduled_followups || 0} Currently scheduled
          </span>
        </Card>
      </div>

      {/* Row 1 Charts: Specific Pathway Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart 1: Diabetes Screening Status */}
        <Card className="p-5">
          <CardHeader className="p-0 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#173A56] flex items-center gap-1.5">
                <Dna className="w-4 h-4 text-[#378C83]" />
                <span>Diabetes Screening Status</span>
              </CardTitle>
              <Badge variant="outline" size="sm">ADPHC IFHAS</Badge>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Distribution of cohort glycemic surveillance (HbA1c / FPG).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="h-[230px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={diabetesData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={CHART_COLORS.slateBorder} />
                  <XAxis type="number" allowDecimals={false} tick={{ fill: CHART_COLORS.slate, fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fill: CHART_COLORS.navy, fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                    formatter={(val: any) => [`${val} Patients`, 'Count']}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {diabetesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Universal screening age: <strong>30+</strong></span>
              <span className="text-rose-600 font-medium">Prediabetes: Annual recall</span>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Cardiovascular Screening Review Status */}
        <Card className="p-5">
          <CardHeader className="p-0 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#173A56] flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-[#E11D48]" />
                <span>Cardiovascular Review Status</span>
              </CardTitle>
              <Badge variant="outline" size="sm">ADPHC Weqaya</Badge>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Blood pressure and lipid surveillance flags across cohort.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="h-[230px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cardioData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={CHART_COLORS.slateBorder} />
                  <XAxis type="number" allowDecimals={false} tick={{ fill: CHART_COLORS.slate, fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={95} tick={{ fill: CHART_COLORS.navy, fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                    formatter={(val: any) => [`${val} Patients`, 'Count']}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {cardioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Strict policy: <strong>No pseudo-scores</strong></span>
              <span className="text-slate-600 font-medium">Annual BP review required</span>
            </div>
          </CardContent>
        </Card>

        {/* Chart 3: Cancer Screening Status (Breast, Cervical, Colorectal) */}
        <Card className="p-5">
          <CardHeader className="p-0 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#173A56] flex items-center gap-1.5">
                <Ribbon className="w-4 h-4 text-[#4F46E5]" />
                <span>Cancer Screening Status</span>
              </CardTitle>
              <Badge variant="outline" size="sm">ADPHC 2024</Badge>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Adherence across Breast, Cervical, and Colorectal (Age 40+).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="h-[230px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cancerData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.slateBorder} />
                  <XAxis dataKey="pathway" tick={{ fill: CHART_COLORS.navy, fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fill: CHART_COLORS.slate, fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }} />
                  <Bar dataKey="Up to Date" fill={CHART_COLORS.teal} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Potentially Due" fill={CHART_COLORS.navy} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Overdue" fill={CHART_COLORS.amber} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="High Hereditary Risk" fill={CHART_COLORS.rose} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Colorectal starts: <strong>Age 40 (UAE)</strong></span>
              <span>Mammography: <strong>Biennial 40–75</strong></span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2 Charts: Trends & Longitudinal Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 4: Monthly Screening Completion Trend */}
        <Card className="p-5">
          <CardHeader className="p-0 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#173A56] flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-[#378C83]" />
                <span>Monthly Screening Procedure Completion Trend</span>
              </CardTitle>
              <Badge variant="teal" size="sm">Past 6 Months</Badge>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Documented completed diagnostic procedures and screening tests (FPG, HbA1c, Lipids, Mammograms, Pap, FIT).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyCompletionData} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.teal} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={CHART_COLORS.teal} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.slateBorder} />
                  <XAxis dataKey="month" tick={{ fill: CHART_COLORS.navy, fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: CHART_COLORS.slate, fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Total Screenings"
                    stroke={CHART_COLORS.teal}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                  <Line type="monotone" dataKey="cardiovascular" name="Cardiovascular" stroke={CHART_COLORS.navy} strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="diabetes" name="Diabetes" stroke={CHART_COLORS.indigo} strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 italic">
              * Note: Separates documented completed clinical procedures from pending decision support recommendations.
            </p>
          </CardContent>
        </Card>

        {/* Chart 5: Follow-Up Action Completion Trend */}
        <Card className="p-5">
          <CardHeader className="p-0 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#173A56] flex items-center gap-1.5">
                <CalendarCheck className="w-4 h-4 text-[#173A56]" />
                <span>Follow-Up Care Action Completion Trend</span>
              </CardTitle>
              <Badge variant="outline" size="sm">Lifecycle Tracker</Badge>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Orders progressing through Pending, Scheduled, and Completed milestones.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={followupTrendData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.slateBorder} />
                  <XAxis dataKey="month" tick={{ fill: CHART_COLORS.navy, fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: CHART_COLORS.slate, fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="completed" name="Completed" stackId="a" fill={CHART_COLORS.teal} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="scheduled" name="Scheduled" stackId="a" fill={CHART_COLORS.navy} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="pending" name="Pending" stackId="a" fill={CHART_COLORS.amber} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 italic">
              Active closure rate reflects confirmed laboratory results and specialist consultation attendance.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Population Demographic Segments & Privacy Safeguards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Segment 1: Age Cohort Coverage with Privacy Suppression */}
        <Card className="p-5">
          <CardHeader className="p-0 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#173A56] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#378C83]" />
                <span>Screening Coverage by Age Cohort</span>
              </CardTitle>
              <Badge variant="outline" size="sm">Privacy Safeguarded</Badge>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Adherence rate across adult life stages. Cohorts with n &lt; 5 display suppression tags.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="h-[230px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageCohortChartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.slateBorder} />
                  <XAxis dataKey="cohort" tick={{ fill: CHART_COLORS.navy, fontSize: 11 }} />
                  <YAxis unit="%" domain={[0, 100]} tick={{ fill: CHART_COLORS.slate, fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                    formatter={(val: any, name: any, item: any) => {
                      if (item.payload.isSuppressed) {
                        return ['Suppressed (n < 5)', 'Adherence Rate %'];
                      }
                      return [`${val}%`, name];
                    }}
                  />
                  <Bar dataKey="Adherence Rate %" fill={CHART_COLORS.teal} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Privacy Badges List */}
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
              <p className="text-[11px] font-semibold text-slate-700">Sample Size &amp; Data Reliability Status:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                {data?.age_cohorts.map((c, i) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex flex-col">
                    <span className="font-semibold text-slate-800">Age {c.cohort}</span>
                    <span className="text-slate-500 text-[10px]">
                      Patients: {c.is_suppressed ? '< 5 (Suppressed)' : c.patient_count}
                    </span>
                    {c.is_sample_too_small ? (
                      <span className="text-amber-700 font-medium text-[10px] mt-0.5">Limited Sample</span>
                    ) : (
                      <span className="text-[#378C83] font-medium text-[10px] mt-0.5">Reliable Rate</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Segment 2: Gender Demographics & Table */}
        <Card className="p-5">
          <CardHeader className="p-0 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#173A56] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#173A56]" />
                <span>Demographic Sex Distribution &amp; Adherence</span>
              </CardTitle>
              <Badge variant="outline" size="sm">Aggregate Only</Badge>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Preventive care distribution segmented by biological sex.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-4">
            <div className="space-y-3">
              {(data?.gender_cohorts || []).map((g, idx) => {
                const isSmall = g.patient_count < 5;
                return (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-[#173A56] text-sm">{g.gender} Cohort</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">
                          Cohort Size: <strong>{isSmall ? '< 5 (Suppressed)' : g.patient_count}</strong>
                        </span>
                        {isSmall && (
                          <Badge variant="warning" size="sm">Small Cell</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                      <span>Screening Adherence Rate</span>
                      <span className="font-bold text-[#378C83]">{g.adherence_rate}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#378C83] h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, g.adherence_rate))}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                      <span>Evaluated: {g.screenings_evaluated} screenings</span>
                      <span>Compliant: {g.up_to_date} | Care Gaps: {g.care_gaps}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
              <strong>Statistical Safeguard:</strong> In adherence with health data governance standards,
              percentages are not extrapolated when sample denominators are critically small. Patient identities remain fully anonymous.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Pathway Coverage Breakdown Table */}
      <Card className="overflow-hidden">
        <CardHeader className="p-5 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold text-[#173A56]">
                Preventive Screening Pathway Coverage Matrix
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Authoritative breakdown of patient compliance, overdue screenings, and clinical risk flags across all 5 adult pathways.
              </CardDescription>
            </div>
            <Badge variant="teal" size="sm">ADPHC Guidelines Active</Badge>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#F6F8FB] text-[#173A56] font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Screening Pathway</th>
                <th className="py-3 px-4 text-center">Eligible Population</th>
                <th className="py-3 px-4 text-center">Documented Up-to-Date</th>
                <th className="py-3 px-4 text-center">Overdue Screening</th>
                <th className="py-3 px-4 text-center">High Clinical Risk</th>
                <th className="py-3 px-4 text-center">Adherence %</th>
                <th className="py-3 px-4 text-right">Primary Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.pathway_metrics.map((p) => {
                const isHighCompliance = p.adherence_rate >= 50;
                return (
                  <tr key={p.category} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#173A56]">
                      {p.name}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-slate-700">
                      {p.total_eligible}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-[#378C83]">
                      {p.up_to_date}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-amber-600">
                      {p.overdue}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-rose-600">
                      {p.flagged_risk}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[11px] ${
                        isHighCompliance ? 'bg-teal-50 text-[#378C83]' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {p.adherence_rate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {p.overdue > 0 || p.flagged_risk > 0 ? (
                        <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                          Review Care Gaps
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-[#378C83] bg-teal-50 px-2 py-0.5 rounded">
                          Surveillance Current
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Row 5: Recent Preventive Activity Stream */}
      <Card className="p-5">
        <CardHeader className="p-0 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-[#173A56] flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#378C83]" />
              <span>Recent Preventive Clinical Activity Feed</span>
            </CardTitle>
            <Badge variant="outline" size="sm">Live Feed</Badge>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Real-time chronology of follow-up care scheduling, test orders, and completed screenings.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <div className="divide-y divide-slate-100">
            {(data?.recent_activity || []).map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    item.status === 'completed'
                      ? 'bg-teal-50 text-[#378C83]'
                      : item.status === 'scheduled'
                      ? 'bg-blue-50 text-[#173A56]'
                      : 'bg-amber-50 text-amber-600'
                  }`}>
                    {item.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : item.status === 'scheduled' ? (
                      <CalendarCheck className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{item.description}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {item.action} &bull; Recorded on {item.time}
                    </p>
                  </div>
                </div>

                <Badge
                  variant={
                    item.status === 'completed' ? 'success' : item.status === 'scheduled' ? 'teal' : 'warning'
                  }
                  size="sm"
                >
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
