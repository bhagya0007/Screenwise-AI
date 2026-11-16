import { request } from './api';
import { PopulationAnalyticsData } from '../types';

export const analyticsService = {
  getPopulationData: () => {
    return request<PopulationAnalyticsData>('/analytics/population');
  },
};
