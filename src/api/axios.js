import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:/gestion_mpa/backend', // Verifica que el nombre de la carpeta coincida
});

export default api;