import axios from 'axios';

const BASE = '/backend/api/v2/fichas-tecnicas';

export const fichaTecnicaService = {
  getFicha: async (equipoId) => {
    const res = await axios.get(`${BASE}/${equipoId}`);
    return res.data;
  },
  saveFicha: async (equipoId, data) => {
    const res = await axios.put(`${BASE}/${equipoId}`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
    return res.data;
  }
};
