import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
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

