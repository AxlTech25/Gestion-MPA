import api from '../../../lib/api';

export const dashboardService = {
  getResumen: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },
};
