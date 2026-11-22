import api from '../../../lib/api';

export const fichaTecnicaService = {
  getFicha: async (equipoId) => {
    const response = await api.get(`/fichas-tecnicas/${equipoId}`);
    return response.data;
  },

  getCatalogo: async () => {
    const response = await api.get('/fichas-tecnicas/catalogo');
    return response.data;
  },

  eliminarCatalogo: async (categoria, valor) => {
    const response = await api.delete('/fichas-tecnicas/catalogo', {
      data: { categoria, valor },
    });
    return response.data;
  },

  getHistorial: async (equipoId) => {
    const response = await api.get(`/fichas-tecnicas/${equipoId}/historial`);
    return response.data;
  },

  buscarPorCodigo: async (codigo) => {
    const encoded = encodeURIComponent(codigo.trim());
    const response = await api.get(`/fichas-tecnicas/buscar/${encoded}`);
    return response.data;
  },

  saveFicha: async (equipoId, data, isFormData = false) => {
    const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined;
    // PHP no siempre popula $_POST para peticiones PUT con multipart/form-data.
    // Usar POST cuando enviamos FormData para que el backend reciba correctamente los campos.
    const method = isFormData ? 'post' : 'put';
    const response = await api[method](`/fichas-tecnicas/${equipoId}`, data, { headers });
    return response.data;
  },
};
