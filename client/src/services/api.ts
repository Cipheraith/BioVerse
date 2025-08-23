import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Service Class
export class ApiService {
  // Authentication endpoints
  static async login(credentials: { username: string; password: string }) {
    try {
      const response = await apiClient.post('/api/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async register(userData: any) {
    try {
      const response = await apiClient.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async logout() {
    try {
      const response = await apiClient.post('/api/auth/logout');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // User endpoints
  static async getCurrentUser() {
    try {
      const response = await apiClient.get('/api/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async updateProfile(userData: any) {
    try {
      const response = await apiClient.put('/api/users/profile', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Patient endpoints
  static async getPatients() {
    try {
      const response = await apiClient.get('/api/patients');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getPatient(id: string) {
    try {
      const response = await apiClient.get(`/api/patients/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async createPatient(patientData: any) {
    try {
      const response = await apiClient.post('/api/patients', patientData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async updatePatient(id: string, patientData: any) {
    try {
      const response = await apiClient.put(`/api/patients/${id}`, patientData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Appointment endpoints
  static async getAppointments() {
    try {
      const response = await apiClient.get('/api/appointments');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async createAppointment(appointmentData: any) {
    try {
      const response = await apiClient.post('/api/appointments', appointmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async updateAppointment(id: string, appointmentData: any) {
    try {
      const response = await apiClient.put(`/api/appointments/${id}`, appointmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteAppointment(id: string) {
    try {
      const response = await apiClient.delete(`/api/appointments/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Telemedicine endpoints
  static async getTelemedicineData() {
    try {
      const response = await apiClient.get('/api/telemedicine');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async createConsultation(consultationData: any) {
    try {
      const response = await apiClient.post('/api/telemedicine/consultations', consultationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getConsultations() {
    try {
      const response = await apiClient.get('/api/telemedicine/consultations');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Emergency endpoints
  static async createEmergencyAlert(alertData: any) {
    try {
      const response = await apiClient.post('/api/emergency/alerts', alertData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getEmergencyAlerts() {
    try {
      const response = await apiClient.get('/api/emergency/alerts');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Health Twin endpoints
  static async getHealthTwinData(patientId?: string) {
    try {
      const url = patientId ? `/api/health-twins/${patientId}` : '/api/health-twins';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async updateHealthTwinData(patientId: string, data: any) {
    try {
      const response = await apiClient.put(`/api/health-twins/${patientId}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Analytics endpoints
  static async getAnalytics(type?: string) {
    try {
      const url = type ? `/api/analytics/${type}` : '/api/analytics';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Luma AI endpoints
  static async queryLuma(query: string) {
    try {
      const response = await apiClient.post('/api/luma/query', { query });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Generic API methods
  static async get(endpoint: string, config?: AxiosRequestConfig) {
    try {
      const response = await apiClient.get(endpoint, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async post(endpoint: string, data?: any, config?: AxiosRequestConfig) {
    try {
      const response = await apiClient.post(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async put(endpoint: string, data?: any, config?: AxiosRequestConfig) {
    try {
      const response = await apiClient.put(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async delete(endpoint: string, config?: AxiosRequestConfig) {
    try {
      const response = await apiClient.delete(endpoint, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export { apiClient };
export default ApiService;
