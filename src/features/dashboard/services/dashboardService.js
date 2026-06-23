import api from '../../../lib/api';

export const dashboardService = {
  getResumen: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },

  consultarEquipos: async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.tipo_equipo) params.set('tipo_equipo', filtros.tipo_equipo);
    if (filtros.tipo_otro) params.set('tipo_otro', filtros.tipo_otro);
    if (filtros.estado_operativo) params.set('estado_operativo', filtros.estado_operativo);
    if (filtros.estado_conservacion) params.set('estado_conservacion', filtros.estado_conservacion);
    const response = await api.get(`/dashboard/consulta?${params.toString()}`);
    return response.data;
  },
};
