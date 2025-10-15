// /src/api/api.js
import axios from 'axios';

// 1. Cria a "instância" base do Axios
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // A URL do nosso back-end!
});

// 2. O "Interceptador" (A Mágica)
// Isso é executado ANTES de CADA requisição que fizermos.
api.interceptors.request.use(
  (config) => {
    // Pega o token do localStorage (que salvaremos ao logar)
    const token = localStorage.getItem('token');
    
    if (token) {
      // Se o token existir, adiciona ele ao Header "Authorization"
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;