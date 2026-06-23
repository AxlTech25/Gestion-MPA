import api, { downloadFile } from '../../../lib/api';

export const equiposService = {
  getAllEquipos: async () => {
    const response = await api.get('/equipos');
    return response.data;
  },

  createEquipo: async (equipoData) => {
    const response = await api.post('/equipos', equipoData);
    return response.data;
  },

  descargarPlantilla: async () => {
    await downloadFile(
      '/equipos/plantilla',
      'plantilla_carga_equipos.xlsx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
  },

  cargaMasiva: async (file) => {
    const formData = new FormData();
    formData.append('archivo', file);
    const response = await api.post('/equipos/carga-masiva', formData);
    return response.data;
  },
};
