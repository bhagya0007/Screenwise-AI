import { request } from './api';
import { FollowUpTask, FollowUpTaskCreateInput } from '../types';

export const followUpService = {
  getAll: (patientId?: number, status?: string) => {
    const params = new URLSearchParams();
    if (patientId) params.append('patient_id', patientId.toString());
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<FollowUpTask[]>(`/follow-ups${query}`);
  },

  create: (task: FollowUpTaskCreateInput) => {
    return request<FollowUpTask>('/follow-ups', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },

  update: (id: number, task: Partial<FollowUpTask>) => {
    return request<FollowUpTask>(`/follow-ups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  },

  delete: (id: number) => {
    return request<void>(`/follow-ups/${id}`, {
      method: 'DELETE',
    });
  },
};
