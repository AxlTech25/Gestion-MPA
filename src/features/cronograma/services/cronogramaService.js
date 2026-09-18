import api, { downloadPdf } from '../../../lib/api';

export const cronogramaService = {
  listar: async (anio) => {
    const params = anio ? { anio } : undefined;
    const response = await api.get('/cronogramas', { params });
    return response.data;
  },

  crear: async (data) => {
    const response = await api.post('/cronogramas', data);
    return response.data;
  },

  eliminar: async (id) => {
    const response = await api.delete(`/cronogramas/${id}`);
    return response.data;
  },

  getMatriz: async (id) => {
    const response = await api.get(`/cronogramas/${id}`);
    return response.data;
  },

  marcarCelda: async (id, data) => {
    const response = await api.post(`/cronogramas/${id}/celdas`, data);
    return response.data;
  },

  liberarCelda: async (id, celdaId) => {
    const response = await api.delete(`/cronogramas/${id}/celdas/${celdaId}`);
    return response.data;
  },

  exportarPdf: async (id) => {
    await downloadPdf(`/reportes/cronograma/${id}`, `cronograma_${id}.pdf`);
  },

  guardarHorarios: async (id, celdaId, horarios) => {
    const response = await api.put(`/cronogramas/${id}/celdas/${celdaId}/horarios`, { horarios });
    return response.data;
  },

  guardarPersonal: async (id, personal) => {
    const response = await api.put(`/cronogramas/${id}/personal`, { personal });
    return response.data;
  },
};
