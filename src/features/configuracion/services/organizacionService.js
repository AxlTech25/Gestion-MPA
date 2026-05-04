import axios from 'axios';

const AREAS_URL = '/backend/api/v2/areas';
const USUARIOS_URL = '/backend/api/v2/usuarios';

export const organizacionService = {
  getAreas: async () => {
    try {
      const response = await axios.get(AREAS_URL);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo áreas:', error);
      throw error;
    }
  },

  createArea: async (data) => {
    try {
      const response = await axios.post(AREAS_URL, data, { headers: { 'Content-Type': 'application/json' }});
      return response.data;
    } catch (error) {
      console.error('Error creando área:', error);
      throw error;
    }
  },

  getUsuarios: async () => {
    try {
      const response = await axios.get(USUARIOS_URL);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      throw error;
    }
  },

  createUsuario: async (data) => {
    try {
      const response = await axios.post(USUARIOS_URL, data, { headers: { 'Content-Type': 'application/json' }});
      return response.data;
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw error;
    }
  }
};
