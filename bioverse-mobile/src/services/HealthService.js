import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

class HealthService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });

    // Add request interceptor for auth token
    this.apiClient.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // Health Twin Data
  async getHealthTwinData() {
    try {
      const response = await this.apiClient.get('/health-twin');
      return response.data;
    } catch (error) {
      console.error('Error fetching health twin data:', error);
      // Return mock data for demo
      return this.getMockHealthTwinData();
    }
  }

  async getLatestHealthData() {
    try {
      const response = await this.apiClient.get('/health/latest');
      return response.data;
    } catch (error) {
      console.error('Error fetching latest health data:', error);
      // Return mock data for demo
      return {
        heartRate: 72 + Math.floor(Math.random() * 20),
        bloodPressure: '120/80',
        steps: 8547 + Math.floor(Math.random() * 2000),
        calories: 2150 + Math.floor(Math.random() * 500),
        sleep: 7.5,
        stress: 'Low',
      };
    }
  }

  // Token Management
  async getTokenBalance() {
    try {
      const response = await this.apiClient.get('/tokens/balance');
      return response.data.balance;
    } catch (error) {
      console.error('Error fetching token balance:', error);
      // Return mock balance
      return 1250 + Math.floor(Math.random() * 500);
    }
  }

  async awardTokens(amount, reason) {
    try {
      const response = await this.apiClient.post('/tokens/award', {
        amount,
        reason,
      });
      return response.data;
    } catch (error) {
      console.error('Error awarding tokens:', error);
      // Mock successful award
      return { success: true, amount, reason };
    }
  }

  // Health Records
  async getHealthRecords() {
    try {
      const response = await this.apiClient.get('/health/records');
      return response.data;
    } catch (error) {
      console.error('Error fetching health records:', error);
      return [];
    }
  }

  async createHealthRecord(recordData) {
    try {
      const response = await this.apiClient.post('/health/records', recordData);
      return response.data;
    } catch (error) {
      console.error('Error creating health record:', error);
      throw error;
    }
  }

  // Mock Data Methods
  getMockHealthTwinData() {
    return {
      healthScore: 95,
      riskFactors: [
        {
          type: 'cardiovascular',
          risk: 0.15,
          level: 'low',
          description: 'Low cardiovascular risk based on current health metrics',
        },
        {
          type: 'diabetes',
          risk: 0.08,
          level: 'very_low',
          description: 'Very low diabetes risk with excellent glucose control',
        },
      ],
      predictions: [
        {
          id: 'pred_001',
          type: 'health_trajectory',
          confidence: 0.92,
          timeframe: '6_months',
          prediction: 'Excellent health trajectory with continued improvement',
          recommendations: [
            'Maintain current exercise routine',
            'Continue balanced nutrition',
            'Regular health monitoring',
          ],
        },
      ],
      vitals: {
        heartRate: { current: 72, trend: 'stable', status: 'normal' },
        bloodPressure: { current: '120/80', trend: 'stable', status: 'normal' },
        weight: { current: 70, trend: 'stable', status: 'normal' },
        bmi: { current: 22.5, trend: 'stable', status: 'normal' },
      },
    };
  }

  // Biometric Data
  async recordBiometricData(data) {
    try {
      const response = await this.apiClient.post('/health/biometrics', data);
      return response.data;
    } catch (error) {
      console.error('Error recording biometric data:', error);
      throw error;
    }
  }

  // Emergency Services
  async triggerEmergency(emergencyData) {
    try {
      const response = await this.apiClient.post('/emergency/trigger', emergencyData);
      return response.data;
    } catch (error) {
      console.error('Error triggering emergency:', error);
      throw error;
    }
  }

  // Health Goals
  async getHealthGoals() {
    try {
      const response = await this.apiClient.get('/health/goals');
      return response.data;
    } catch (error) {
      console.error('Error fetching health goals:', error);
      return [
        {
          id: 'goal_001',
          type: 'steps',
          target: 10000,
          current: 8547,
          progress: 85.47,
          status: 'in_progress',
        },
        {
          id: 'goal_002',
          type: 'weight',
          target: 68,
          current: 70,
          progress: 66.67,
          status: 'in_progress',
        },
      ];
    }
  }

  async updateHealthGoal(goalId, progress) {
    try {
      const response = await this.apiClient.put(`/health/goals/${goalId}`, {
        progress,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating health goal:', error);
      throw error;
    }
  }

  // Medication Tracking
  async getMedications() {
    try {
      const response = await this.apiClient.get('/health/medications');
      return response.data;
    } catch (error) {
      console.error('Error fetching medications:', error);
      return [];
    }
  }

  async recordMedicationTaken(medicationId) {
    try {
      const response = await this.apiClient.post(`/health/medications/${medicationId}/taken`);
      return response.data;
    } catch (error) {
      console.error('Error recording medication taken:', error);
      throw error;
    }
  }

  // Appointments
  async getUpcomingAppointments() {
    try {
      const response = await this.apiClient.get('/appointments/upcoming');
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  }

  async scheduleAppointment(appointmentData) {
    try {
      const response = await this.apiClient.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      throw error;
    }
  }

  // Health Insights
  async getHealthInsights() {
    try {
      const response = await this.apiClient.get('/health/insights');
      return response.data;
    } catch (error) {
      console.error('Error fetching health insights:', error);
      return [
        {
          id: 'insight_001',
          type: 'activity',
          title: 'Great Activity Level!',
          description: 'You\'ve been consistently active this week. Keep it up!',
          icon: 'walk',
          priority: 'medium',
        },
        {
          id: 'insight_002',
          type: 'sleep',
          title: 'Improve Sleep Quality',
          description: 'Consider going to bed 30 minutes earlier for better recovery.',
          icon: 'moon',
          priority: 'high',
        },
      ];
    }
  }

  // Sync with wearable devices
  async syncWearableData() {
    try {
      const response = await this.apiClient.post('/health/sync-wearables');
      return response.data;
    } catch (error) {
      console.error('Error syncing wearable data:', error);
      throw error;
    }
  }

  // Health Reports
  async generateHealthReport(timeframe = '1M') {
    try {
      const response = await this.apiClient.post('/health/reports/generate', {
        timeframe,
      });
      return response.data;
    } catch (error) {
      console.error('Error generating health report:', error);
      throw error;
    }
  }

  // Offline Data Management
  async saveOfflineData(data) {
    try {
      const existingData = await AsyncStorage.getItem('offlineHealthData');
      const offlineData = existingData ? JSON.parse(existingData) : [];
      
      offlineData.push({
        ...data,
        timestamp: new Date().toISOString(),
        synced: false,
      });

      await AsyncStorage.setItem('offlineHealthData', JSON.stringify(offlineData));
      return true;
    } catch (error) {
      console.error('Error saving offline data:', error);
      return false;
    }
  }

  async syncOfflineData() {
    try {
      const offlineData = await AsyncStorage.getItem('offlineHealthData');
      if (!offlineData) return;

      const data = JSON.parse(offlineData);
      const unsyncedData = data.filter(item => !item.synced);

      for (const item of unsyncedData) {
        try {
          await this.apiClient.post('/health/sync-offline', item);
          item.synced = true;
        } catch (error) {
          console.error('Error syncing offline item:', error);
        }
      }

      await AsyncStorage.setItem('offlineHealthData', JSON.stringify(data));
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  }
}

export { HealthService };
export default new HealthService();