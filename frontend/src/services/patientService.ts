import { request } from './api';
import { Patient, PatientCreateInput } from '../types';

export const patientService = {
  getAll: (search?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<Patient[]>(`/patients${query}`);
  },

  getById: (id: number) => {
    return request<Patient>(`/patients/${id}`);
  },

  create: (patient: PatientCreateInput) => {
    return request<Patient>('/patients', {
      method: 'POST',
      body: JSON.stringify(patient),
    });
  },

  update: (id: number, patient: Partial<PatientCreateInput>) => {
    return request<Patient>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patient),
    });
  },

  delete: (id: number) => {
    return request<void>(`/patients/${id}`, {
      method: 'DELETE',
    });
  },
};
