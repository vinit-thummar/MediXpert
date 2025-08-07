import axios from 'axios';
import { apiService } from './apiService';

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
    try {
      const response = await api.post('/login/', { username, password });
      if (response.data.token) {
        apiService.setAuthToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/register/', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async healthCheck() {
    try {
      const response = await api.get('/health-check/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout() {
    apiService.setAuthToken(null);
  }
};

