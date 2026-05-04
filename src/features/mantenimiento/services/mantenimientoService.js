import axios from 'axios';

const API_URL = '/backend/api/v2/mantenimientos';

export const mantenimientoService = {
  getAll: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo mantenimientos:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(API_URL, data, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error) {
      console.error('Error creando mantenimiento:', error);
      throw error;
    }
  }
};
