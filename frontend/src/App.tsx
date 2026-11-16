import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { PatientDetailPage } from './pages/PatientDetailPage';
import { ScreeningAssessmentPage } from './pages/ScreeningAssessmentPage';
import { FollowUpsPage } from './pages/FollowUpsPage';
import { GuidelinesPage } from './pages/GuidelinesPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="patients/:id" element={<PatientDetailPage />} />
          <Route path="screenings" element={<ScreeningAssessmentPage />} />
          <Route path="follow-ups" element={<FollowUpsPage />} />
          <Route path="guidelines" element={<GuidelinesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
