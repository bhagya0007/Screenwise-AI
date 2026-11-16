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
  ArrowUpRight,
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
} from 'recharts';
import { analyticsService } from '../services/analyticsService';
import { PopulationAnalyticsData } from '../types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ClinicalDisclaimer } from '../components/ClinicalDisclaimer';

export const PopulationAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<PopulationAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getPopulationData()
      .then((res) => setData(res))
      .catch((err) => console.error('Failed to load analytics:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#173A56]" />
      </div>
    );
  }

  const pathwayChartData = data?.pathway_metrics.map((m) => ({
    name: m.name.replace('Type 2 ', '').replace(' Health', '').replace(' Cancer', ''),
    'Adherence %': m.adherence_rate,
    'Care Gaps': m.overdue + m.flagged_risk,
    'Compliant': m.up_to_date,
  })) || [];

  const ageCohortChartData = data?.age_cohorts.map((c) => ({
    cohort: `Age ${c.cohort}`,
    'Coverage Rate %': c.adherence_rate,
    'Active Gaps': c.care_gaps,
    'Screened': c.up_to_date,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#173A56] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#378C83]" />
            <span>Population Health & Preventive Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cohort-level preventive screening coverage, quality metrics, and clinical care gap trends.
          </p>
        </div>
      </div>

      <ClinicalDisclaimer variant="compact" />

      {/* 4 Core Population Analytics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Screening Coverage Rate */}
        <Card className="p-5">
          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">
            Overall Screening Coverage
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-[#173A56]">
              {data?.summary.coverage_rate || 0}%
            </span>
            <span className="text-xs text-[#378C83] font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> Active Target
            </span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Eligible population up to date
          </span>
        </Card>

        {/* Total Care Gaps */}
        <Card className="p-5">
          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">
            Identified Care Gaps
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-amber-600">
              {data?.summary.care_gap_count || 0}
            </span>
            <Badge variant="warning" size="sm">Actionable</Badge>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Overdue or risk-flagged needs
          </span>
        </Card>

        {/* Follow-up Completion Rate */}
        <Card className="p-5">
          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">
            Follow-Up Completion Rate
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-[#378C83]">
              {data?.summary.task_completion_rate || 0}%
            </span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {data?.summary.completed_follow_ups} of {data?.summary.total_follow_ups} orders closed
          </span>
        </Card>

        {/* Monitored Cohort Size */}
        <Card className="p-5">
          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">
            Total Monitored Cohort
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-[#173A56]">
              {data?.summary.total_patients || 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">Patients</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {data?.summary.total_screenings} total pathways tracked
          </span>
        </Card>
      </div>

      {/* Aggregate Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pathway Adherence Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Screening Adherence by Pathway (%)</CardTitle>
            <CardDescription>
              Percentage of eligible cohort meeting guideline intervals
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pathwayChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#475569' }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    borderColor: '#cbd5e1',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Adherence %" fill="#378C83" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Age Cohort Screening Coverage */}
        <Card>
          <CardHeader>
            <CardTitle>Screening Coverage by Age Cohort (%)</CardTitle>
            <CardDescription>
              Adherence breakdown across adult age windows (USPSTF cohorts)
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageCohortChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="cohort" tick={{ fontSize: 11, fill: '#475569' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#475569' }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    borderColor: '#cbd5e1',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Coverage Rate %" fill="#173A56" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pathway Detail Quality Table */}
      <Card>
        <CardHeader>
          <CardTitle>Preventive Quality Metric Breakdown</CardTitle>
          <CardDescription>
            Detailed screening numbers, care gap counts, and compliance benchmarks
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F6F8FB] border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-4">Clinical Pathway</th>
                  <th className="py-3 px-4">Eligible Patients</th>
                  <th className="py-3 px-4">Up to Date</th>
                  <th className="py-3 px-4">Overdue Needs</th>
                  <th className="py-3 px-4">Elevated Risk Flags</th>
                  <th className="py-3 px-4 text-right">Adherence Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.pathway_metrics.map((p) => (
                  <tr key={p.category} className="hover:bg-[#F6F8FB] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#173A56]">{p.name}</td>
                    <td className="py-3 px-4 text-slate-700">{p.total_eligible}</td>
                    <td className="py-3 px-4 text-[#378C83] font-semibold">{p.up_to_date}</td>
                    <td className="py-3 px-4 text-amber-600 font-semibold">{p.overdue}</td>
                    <td className="py-3 px-4 text-rose-600 font-semibold">{p.flagged_risk}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-[#173A56]">{p.adherence_rate}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
