import api from '../../../lib/api';

export const ticketsService = {
  getCatalogo: async () => {
    const response = await api.get('/tickets/catalogo');
    return response.data;
  },

  crear: async (data) => {
    const response = await api.post('/tickets', data);
    return response.data;
  },

  consultar: async (codigo) => {
    const response = await api.get('/tickets', { params: { codigo } });
    return response.data;
  },

  listar: async (estado = '') => {
    const params = estado ? { estado } : {};
    const response = await api.get('/tickets', { params });
    return response.data;
  },

  actualizar: async (id, data) => {
    const response = await api.patch(`/tickets/${id}`, data);
    return response.data;
  },
};
