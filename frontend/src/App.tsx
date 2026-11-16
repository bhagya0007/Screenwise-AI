import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { PatientDetailPage } from './pages/PatientDetailPage';
import { ScreeningAssessmentPage } from './pages/ScreeningAssessmentPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { FollowUpsPage } from './pages/FollowUpsPage';
import { PopulationAnalyticsPage } from './pages/PopulationAnalyticsPage';
import { GuidelinesPage } from './pages/GuidelinesPage';
import { SettingsPage } from './pages/SettingsPage';
import { LandingPage } from './pages/LandingPage';

export function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
