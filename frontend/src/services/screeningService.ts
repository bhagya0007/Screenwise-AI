import { request } from './api';
import { ScreeningAssessment, PatientCreateInput, ReviewStatus } from '../types';

export const screeningService = {
  getByPatientId: (patientId: number) => {
    return request<ScreeningAssessment[]>(`/screenings/patient/${patientId}`);
  },

  reEvaluate: (patientId: number) => {
    return request<ScreeningAssessment[]>(`/screenings/evaluate/${patientId}`, {
      method: 'POST',
    });
  },

  getRecommendations: (category?: string, reviewStatus?: string, status?: string) => {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (reviewStatus && reviewStatus !== 'all') params.append('review_status', reviewStatus);
    if (status && status !== 'all') params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<ScreeningAssessment[]>(`/screenings/recommendations${query}`);
  },

  updateReviewStatus: (assessmentId: number, reviewStatus: ReviewStatus) => {
    return request<ScreeningAssessment>(`/screenings/${assessmentId}/review`, {
      method: 'PUT',
      body: JSON.stringify({ review_status: reviewStatus }),
    });
  },

  simulate: (patient: PatientCreateInput) => {
    return request<ScreeningAssessment[]>('/screenings/simulate', {
      method: 'POST',
      body: JSON.stringify(patient),
    });
  },
};
