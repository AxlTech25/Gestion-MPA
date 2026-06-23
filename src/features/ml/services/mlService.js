import api from '../../../lib/api';

const ML_TIMEOUT = 90000;

export const mlService = {
  getStatus: async () => {
    const { data } = await api.get('/ml/status');
    return data;
  },

  getRiesgoInventario: async () => {
    const { data } = await api.get('/ml/equipos/riesgo', { timeout: ML_TIMEOUT });
    return data;
  },

  getRiesgoEquipo: async (equipoId) => {
    const { data } = await api.get(`/ml/equipos/${equipoId}/riesgo`, { timeout: ML_TIMEOUT });
    return data;
  },

  getAlertas: async () => {
    const { data } = await api.get('/ml/alertas', { timeout: ML_TIMEOUT });
    return data;
  },

  predictCategoria: async (equipoId) => {
    const { data } = await api.post('/ml/predict/categoria', { equipo_id: equipoId });
    return data;
  },
};
