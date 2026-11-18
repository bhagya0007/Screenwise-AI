import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';

// Lazy-loaded route components for high performance, code-splitting, and minimal bundle size
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const PatientsPage = lazy(() => import('./pages/PatientsPage').then(m => ({ default: m.PatientsPage })));
const PatientDetailPage = lazy(() => import('./pages/PatientDetailPage').then(m => ({ default: m.PatientDetailPage })));
const ScreeningAssessmentPage = lazy(() => import('./pages/ScreeningAssessmentPage').then(m => ({ default: m.ScreeningAssessmentPage })));
const RecommendationsPage = lazy(() => import('./pages/RecommendationsPage').then(m => ({ default: m.RecommendationsPage })));
const FollowUpsPage = lazy(() => import('./pages/FollowUpsPage').then(m => ({ default: m.FollowUpsPage })));
const PopulationAnalyticsPage = lazy(() => import('./pages/PopulationAnalyticsPage').then(m => ({ default: m.PopulationAnalyticsPage })));
const GuidelinesPage = lazy(() => import('./pages/GuidelinesPage').then(m => ({ default: m.GuidelinesPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));

// Accessible loading fallback
const PageLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] p-8" role="status" aria-live="polite">
    <div className="w-10 h-10 border-4 border-[#0F8B8D]/30 border-t-[#0F8B8D] rounded-full animate-spin mb-4" />
    <span className="text-sm font-medium text-slate-600">Loading clinical module...</span>
    <span className="sr-only">Loading content, please wait</span>
  </div>
);

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Landing & Product Overview */}
          <Route path="/landing" element={<LandingPage />} />

          {/* Main Application Layout */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="overview" element={<DashboardPage />} />
            <Route path="patients" element={<PatientsPage />} />
            <Route path="patients/:id" element={<PatientDetailPage />} />
            <Route path="assessment" element={<ScreeningAssessmentPage />} />
            <Route path="recommendations" element={<RecommendationsPage />} />
            <Route path="follow-ups" element={<FollowUpsPage />} />
            <Route path="analytics" element={<PopulationAnalyticsPage />} />
            <Route path="guidelines" element={<GuidelinesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
