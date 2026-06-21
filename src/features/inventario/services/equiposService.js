import api from '../../../lib/api';

export const equiposService = {
  getAllEquipos: async () => {
    const response = await api.get('/equipos');
    return response.data;
  },

  createEquipo: async (equipoData) => {
    const response = await api.post('/equipos', equipoData);
    return response.data;
  },
};
