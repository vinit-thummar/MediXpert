import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  async login(username, password) {
    const response = await api.post('/login/', { username, password });
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/register/', userData);
    return response.data;
  },

  async healthCheck() {
    const response = await api.get('/health-check/');
    return response.data;
  }
};

