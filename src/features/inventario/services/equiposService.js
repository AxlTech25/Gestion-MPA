import axios from 'axios';

// Asume que la API V2 está corriendo en el mismo servidor en /backend/api/v2
const API_URL = '/backend/api/v2/equipos';

export const equiposService = {
  /**
   * Obtiene la lista completa de equipos (V2)
   */
  getAllEquipos: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo equipos:', error);
      throw error;
    }
  },

  /**
   * Crea un nuevo equipo en el inventario V2
   */
  createEquipo: async (equipoData) => {
    try {
      const response = await axios.post(API_URL, equipoData, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error) {
      console.error('Error creando equipo:', error);
      throw error;
    }
  }
};
