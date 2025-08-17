import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

class IoTService {
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

    this.connectedDevices = new Map();
    this.realTimeData = new Map();
  }

  // Device Management
  async getConnectedDevices() {
    try {
      const response = await this.apiClient.get('/iot/devices');
      return response.data;
    } catch (error) {
      console.error('Error fetching connected devices:', error);
      // Return mock connected devices
      return this.getMockConnectedDevices();
    }
  }

  async getAvailableDevices() {
    try {
      const response = await this.apiClient.get('/iot/devices/available');
      return response.data;
    } catch (error) {
      console.error('Error fetching available devices:', error);
      // Return mock available devices
      return this.getMockAvailableDevices();
    }
  }

  async connectDevice(device) {
    try {
      const response = await this.apiClient.post('/iot/devices/connect', {
        deviceId: device.id,
        deviceType: device.type,
        credentials: device.credentials,
      });

      if (response.data.success) {
        this.connectedDevices.set(device.id, {
          ...device,
          connected: true,
          monitoring: true,
          lastSync: new Date().toISOString(),
        });
        
        // Start real-time data simulation
        this.startDeviceDataSimulation(device);
      }

      return response.data.success;
    } catch (error) {
      console.error('Error connecting device:', error);
      // Mock successful connection
      this.connectedDevices.set(device.id, {
        ...device,
        connected: true,
        monitoring: true,
        lastSync: new Date().toISOString(),
      });
      this.startDeviceDataSimulation(device);
      return true;
    }
  }

  async disconnectDevice(device) {
    try {
      const response = await this.apiClient.post('/iot/devices/disconnect', {
        deviceId: device.id,
      });

      if (response.data.success) {
        this.connectedDevices.delete(device.id);
        this.realTimeData.delete(device.id);
      }

      return response.data.success;
    } catch (error) {
      console.error('Error disconnecting device:', error);
      // Mock successful disconnection
      this.connectedDevices.delete(device.id);
      this.realTimeData.delete(device.id);
      return true;
    }
  }

  async toggleMonitoring(deviceId, enabled) {
    try {
      const response = await this.apiClient.put(`/iot/devices/${deviceId}/monitoring`, {
        enabled,
      });

      const device = this.connectedDevices.get(deviceId);
      if (device) {
        device.monitoring = enabled;
        this.connectedDevices.set(deviceId, device);
      }

      return response.data.success;
    } catch (error) {
      console.error('Error toggling monitoring:', error);
      // Mock successful toggle
      const device = this.connectedDevices.get(deviceId);
      if (device) {
        device.monitoring = enabled;
        this.connectedDevices.set(deviceId, device);
      }
      return true;
    }
  }

  // Real-time Data
  async getRealTimeData() {
    try {
      const response = await this.apiClient.get('/iot/data/realtime');
      return response.data;
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      // Return mock real-time data
      return this.getMockRealTimeData();
    }
  }

  async getConnectedDevicesCount() {
    try {
      const devices = await this.getConnectedDevices();
      return devices.length;
    } catch (error) {
      console.error('Error getting device count:', error);
      return 3; // Mock count
    }
  }

  // Device Data History
  async getDeviceDataHistory(deviceId, timeframe = '24h') {
    try {
      const response = await this.apiClient.get(`/iot/devices/${deviceId}/history`, {
        params: { timeframe },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching device history:', error);
      return this.getMockDeviceHistory(deviceId);
    }
  }

  // Device Settings
  async updateDeviceSettings(deviceId, settings) {
    try {
      const response = await this.apiClient.put(`/iot/devices/${deviceId}/settings`, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating device settings:', error);
      throw error;
    }
  }

  async getDeviceSettings(deviceId) {
    try {
      const response = await this.apiClient.get(`/iot/devices/${deviceId}/settings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching device settings:', error);
      return {};
    }
  }

  // Device Calibration
  async calibrateDevice(deviceId, calibrationData) {
    try {
      const response = await this.apiClient.post(`/iot/devices/${deviceId}/calibrate`, calibrationData);
      return response.data;
    } catch (error) {
      console.error('Error calibrating device:', error);
      throw error;
    }
  }

  // Alerts and Notifications
  async getDeviceAlerts() {
    try {
      const response = await this.apiClient.get('/iot/alerts');
      return response.data;
    } catch (error) {
      console.error('Error fetching device alerts:', error);
      return [];
    }
  }

  async acknowledgeAlert(alertId) {
    try {
      const response = await this.apiClient.put(`/iot/alerts/${alertId}/acknowledge`);
      return response.data;
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      throw error;
    }
  }

  // Mock Data Methods
  getMockConnectedDevices() {
    return [
      {
        id: 'apple_watch_001',
        name: 'Apple Watch Series 9',
        type: 'apple_watch',
        icon: 'watch',
        connected: true,
        monitoring: true,
        batteryLevel: 85,
        lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        features: ['Heart Rate', 'Steps', 'Calories', 'Sleep'],
        status: 'active',
      },
      {
        id: 'glucose_monitor_001',
        name: 'Continuous Glucose Monitor',
        type: 'glucose_monitor',
        icon: 'medical',
        connected: true,
        monitoring: true,
        batteryLevel: 92,
        lastSync: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
        features: ['Blood Glucose', 'Trends', 'Alerts'],
        status: 'active',
      },
      {
        id: 'bp_monitor_001',
        name: 'Smart Blood Pressure Monitor',
        type: 'bp_monitor',
        icon: 'heart',
        connected: true,
        monitoring: false,
        batteryLevel: 78,
        lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        features: ['Systolic', 'Diastolic', 'Pulse'],
        status: 'standby',
      },
    ];
  }

  getMockAvailableDevices() {
    return [
      {
        id: 'fitbit_charge_001',
        name: 'Fitbit Charge 6',
        type: 'fitbit_charge',
        icon: 'fitness',
        features: ['Heart Rate', 'Steps', 'Sleep', 'Stress'],
        compatibility: 'iOS/Android',
      },
      {
        id: 'oura_ring_001',
        name: 'Oura Ring Gen 3',
        type: 'oura_ring',
        icon: 'radio-button-on',
        features: ['Sleep', 'HRV', 'Temperature', 'Recovery'],
        compatibility: 'iOS/Android',
      },
      {
        id: 'smart_scale_001',
        name: 'Smart Body Scale',
        type: 'smart_scale',
        icon: 'scale',
        features: ['Weight', 'BMI', 'Body Fat', 'Muscle Mass'],
        compatibility: 'WiFi/Bluetooth',
      },
    ];
  }

  getMockRealTimeData() {
    return {
      'apple_watch_001': {
        name: 'Heart Rate',
        value: 72 + Math.floor(Math.random() * 20),
        unit: 'BPM',
        status: 'normal',
        icon: 'heart',
        timestamp: new Date().toISOString(),
      },
      'glucose_monitor_001': {
        name: 'Blood Glucose',
        value: 95 + Math.floor(Math.random() * 30),
        unit: 'mg/dL',
        status: 'normal',
        icon: 'medical',
        timestamp: new Date().toISOString(),
      },
      'bp_monitor_001': {
        name: 'Blood Pressure',
        value: '120/80',
        unit: 'mmHg',
        status: 'normal',
        icon: 'heart',
        timestamp: new Date().toISOString(),
      },
    };
  }

  getMockDeviceHistory(deviceId) {
    const now = new Date();
    const history = [];
    
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      
      let value;
      switch (deviceId) {
        case 'apple_watch_001':
          value = 70 + Math.floor(Math.random() * 25);
          break;
        case 'glucose_monitor_001':
          value = 90 + Math.floor(Math.random() * 40);
          break;
        case 'bp_monitor_001':
          value = `${115 + Math.floor(Math.random() * 20)}/${75 + Math.floor(Math.random() * 15)}`;
          break;
        default:
          value = Math.floor(Math.random() * 100);
      }
      
      history.push({
        timestamp: timestamp.toISOString(),
        value,
        quality: 0.8 + Math.random() * 0.2,
      });
    }
    
    return history;
  }

  // Real-time Data Simulation
  startDeviceDataSimulation(device) {
    const interval = setInterval(() => {
      if (!this.connectedDevices.has(device.id)) {
        clearInterval(interval);
        return;
      }

      const deviceData = this.generateSimulatedData(device);
      this.realTimeData.set(device.id, deviceData);
    }, 5000); // Update every 5 seconds
  }

  generateSimulatedData(device) {
    const baseData = {
      deviceId: device.id,
      timestamp: new Date().toISOString(),
      quality: 0.8 + Math.random() * 0.2,
    };

    switch (device.type) {
      case 'apple_watch':
        return {
          ...baseData,
          name: 'Heart Rate',
          value: 70 + Math.floor(Math.random() * 25),
          unit: 'BPM',
          status: 'normal',
          icon: 'heart',
        };
      
      case 'glucose_monitor':
        const glucose = 90 + Math.floor(Math.random() * 40);
        return {
          ...baseData,
          name: 'Blood Glucose',
          value: glucose,
          unit: 'mg/dL',
          status: glucose > 140 ? 'high' : glucose < 70 ? 'low' : 'normal',
          icon: 'medical',
        };
      
      case 'bp_monitor':
        const systolic = 115 + Math.floor(Math.random() * 20);
        const diastolic = 75 + Math.floor(Math.random() * 15);
        return {
          ...baseData,
          name: 'Blood Pressure',
          value: `${systolic}/${diastolic}`,
          unit: 'mmHg',
          status: systolic > 140 || diastolic > 90 ? 'high' : 'normal',
          icon: 'heart',
        };
      
      default:
        return {
          ...baseData,
          name: 'Unknown',
          value: Math.floor(Math.random() * 100),
          unit: '',
          status: 'normal',
          icon: 'pulse',
        };
    }
  }

  // Device Firmware Updates
  async checkFirmwareUpdates(deviceId) {
    try {
      const response = await this.apiClient.get(`/iot/devices/${deviceId}/firmware/check`);
      return response.data;
    } catch (error) {
      console.error('Error checking firmware updates:', error);
      return { hasUpdate: false };
    }
  }

  async updateFirmware(deviceId) {
    try {
      const response = await this.apiClient.post(`/iot/devices/${deviceId}/firmware/update`);
      return response.data;
    } catch (error) {
      console.error('Error updating firmware:', error);
      throw error;
    }
  }

  // Data Export
  async exportDeviceData(deviceId, format = 'json', timeframe = '1M') {
    try {
      const response = await this.apiClient.get(`/iot/devices/${deviceId}/export`, {
        params: { format, timeframe },
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting device data:', error);
      throw error;
    }
  }
}

export { IoTService };
export default new IoTService();