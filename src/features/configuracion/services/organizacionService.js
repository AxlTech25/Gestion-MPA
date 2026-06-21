import api from '../../../lib/api';

export const organizacionService = {
  getAreas: async () => {
    const response = await api.get('/areas');
    return response.data;
  },

  createArea: async (data) => {
    const response = await api.post('/areas', data);
    return response.data;
  },

  getUsuarios: async () => {
    const response = await api.get('/usuarios');
    return response.data;
  },

  createUsuario: async (data) => {
    const response = await api.post('/usuarios', data);
    return response.data;
  },
};
