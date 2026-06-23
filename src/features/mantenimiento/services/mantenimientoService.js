import api, { downloadPdf } from '../../../lib/api';

export const mantenimientoService = {
  getAll: async () => {
    const response = await api.get('/mantenimientos');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/mantenimientos/${id}`);
    return response.data;
  },

  buscarHistorialPorCodigo: async (codigo) => {
    const encoded = encodeURIComponent(codigo.trim());
    const response = await api.get(`/mantenimientos/historial/${encoded}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/mantenimientos', data);
    return response.data;
  },

  exportHistorialPdf: async (codigo) => {
    const encoded = encodeURIComponent(codigo.trim());
    await downloadPdf(`/reportes/mantenimiento/historial/${encoded}`);
  },

  exportFichaPdf: async (id) => {
    await downloadPdf(`/reportes/mantenimiento/${id}`);
  },
};
