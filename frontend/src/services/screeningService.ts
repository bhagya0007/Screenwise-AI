import { request } from './api';
import { ScreeningAssessment } from '../types';

export const screeningService = {
  getByPatientId: (patientId: number) => {
    return request<ScreeningAssessment[]>(`/screenings/patient/${patientId}`);
  },

  reEvaluate: (patientId: number) => {
    return request<ScreeningAssessment[]>(`/screenings/evaluate/${patientId}`, {
      method: 'POST',
    });
  },
};
