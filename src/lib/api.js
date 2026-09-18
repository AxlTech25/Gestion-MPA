import axios from 'axios';
import { API_BASE_URL, TOKEN_KEY, USER_KEY } from '../constants/config';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      // Evitar recarga completa; React Router redirige al detectar token ausente
      if (!window.location.pathname.startsWith('/login')) {
        window.dispatchEvent(new Event('auth:logout'));
      }
    }
    return Promise.reject(error);
  }
);

export const downloadPdf = async (path, filename = 'reporte.pdf') => {
  const response = await api.get(path, { responseType: 'blob' });
  const blob = response.data;
  const prefix = await blob.slice(0, 8).text();
  const looksPdf = prefix.startsWith('%PDF');

  if (!looksPdf) {
    let message = 'El servidor no devolvió un PDF válido.';
    try {
      const errorText = await blob.text();
      const errorData = JSON.parse(errorText);
      message = errorData.message || message;
    } catch {
      /* cuerpo no JSON */
    }
    throw new Error(message);
  }

  const pdfBlob = blob.type && blob.type.includes('pdf')
    ? blob
    : new Blob([blob], { type: 'application/pdf' });
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

export const downloadFile = async (path, filename, mimeType) => {
  const response = await api.get(path, { responseType: 'blob' });
  const url = URL.createObjectURL(new Blob([response.data], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

export default api;
