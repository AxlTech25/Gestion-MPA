import api from '../../../lib/api';

export const mantenimientoService = {
  getAll: async () => {
    const response = await api.get('/mantenimientos');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/mantenimientos', data);
    return response.data;
  },
};
