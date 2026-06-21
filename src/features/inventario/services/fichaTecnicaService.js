import api from '../../../lib/api';

export const fichaTecnicaService = {
  getFicha: async (equipoId) => {
    const response = await api.get(`/fichas-tecnicas/${equipoId}`);
    return response.data;
  },

  saveFicha: async (equipoId, data) => {
    const response = await api.put(`/fichas-tecnicas/${equipoId}`, data);
    return response.data;
  },
};
