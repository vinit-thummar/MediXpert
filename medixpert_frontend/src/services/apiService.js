import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Ensure OPTIONS requests are properly handled
    if (config.method === 'options') {
      config.headers['Access-Control-Request-Method'] = 'GET,POST,PUT,DELETE,OPTIONS';
      config.headers['Access-Control-Request-Headers'] = 'Content-Type,Authorization';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const apiService = {
  // Auth related
  setAuthToken(token) {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  },

  // Symptoms
  async getSymptoms() {
    const response = await api.get('/symptoms/');
    return response.data;
  },

  // Diseases
  async getDiseases() {
    const response = await api.get('/diseases/');
    return response.data;
  },

  // Predictions
  async predictDisease(symptoms, additionalSymptoms = '', notes = '') {
    const response = await api.post('/predict/', {
      symptoms,
      additional_symptoms: additionalSymptoms,
      notes
    });
    return response.data;
  },

  async getPredictions() {
    const response = await api.get('/predictions/');
    return response.data;
  },

  // Dashboard
  async getDashboard() {
    const response = await api.get('/dashboard/');
    return response.data;
  },

  // Health Records
  async getHealthRecords() {
    const response = await api.get('/health-records/');
    return response.data;
  }
};

