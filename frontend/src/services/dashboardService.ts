import { request } from './api';
import { DashboardStats, HealthStatus } from '../types';

export const dashboardService = {
  getStats: () => {
    return request<DashboardStats>('/dashboard/stats');
  },

  getHealth: () => {
    return request<HealthStatus>('/health');
  },
};
