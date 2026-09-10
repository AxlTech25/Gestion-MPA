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

  updateUsuario: async (id, data) => {
    const response = await api.put(`/usuarios?id=${id}`, data);
    return response.data;
  },

  deleteUsuario: async (id) => {
    const response = await api.delete(`/usuarios?id=${id}`);
    return response.data;
  },
};
