/**
 * IoT Integration Service
 * Real-time health device data streaming and management
 */

import { io, Socket } from 'socket.io-client';

export interface HealthDevice {
  deviceId: string;
  type: 'heart_rate' | 'blood_pressure' | 'glucose' | 'temperature' | 'weight' | 'oxygen_saturation' | 'ecg' | 'pulse_oximeter';
  patientId: string;
  status: 'connected' | 'disconnected' | 'error' | 'calibrating';
  lastReading?: DeviceReading;
  batteryLevel?: number;
  firmwareVersion?: string;
  location?: string;
}

export interface DeviceReading {
  deviceId: string;
  timestamp: number;
  type: string;
  value: number | { [key: string]: number };
  unit: string;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  metadata?: {
    heartRateVariability?: number;
    signalStrength?: number;
    movement?: boolean;
    temperature?: number;
  };
}

export interface IoTAlert {
  id: string;
  deviceId: string;
  patientId: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: number;
  acknowledged: boolean;
  severity: 1 | 2 | 3 | 4 | 5;
}

class IoTIntegrationService {
  private socket: Socket | null = null;
  private devices: Map<string, HealthDevice> = new Map();
  private dataCallbacks: Map<string, (reading: DeviceReading) => void> = new Map();
  private alertCallbacks: Set<(alert: IoTAlert) => void> = new Set();
  private connectionCallbacks: Set<(device: HealthDevice) => void> = new Set();
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    this.initializeConnection();
  }

  /**
   * Initialize WebSocket connection for real-time data
   */
  private initializeConnection(): void {
    this.socket = io(this.baseUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('IoT Service connected');
    });

    this.socket.on('device_reading', (reading: DeviceReading) => {
      this.handleDeviceReading(reading);
    });

    this.socket.on('device_status', (device: HealthDevice) => {
      this.handleDeviceStatusUpdate(device);
    });

    this.socket.on('iot_alert', (alert: IoTAlert) => {
      this.handleAlert(alert);
    });

    this.socket.on('disconnect', () => {
      console.log('IoT Service disconnected');
    });
  }

  /**
   * Register a new health device
   */
  async registerDevice(device: Omit<HealthDevice, 'status'>): Promise<HealthDevice> {
    const response = await fetch(`${this.baseUrl}/api/iot/devices/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(device),
    });

    if (!response.ok) {
      throw new Error(`Failed to register device: ${response.statusText}`);
    }

    const registeredDevice = await response.json();
    this.devices.set(registeredDevice.deviceId, registeredDevice);
    
    // Join device room for real-time updates
    this.socket?.emit('join_device_room', registeredDevice.deviceId);
    
    return registeredDevice;
  }

  /**
   * Get all registered devices for a patient
   */
  async getPatientDevices(patientId: string): Promise<HealthDevice[]> {
    const response = await fetch(`${this.baseUrl}/api/iot/devices/patient/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch devices: ${response.statusText}`);
    }

    const devices = await response.json();
    devices.forEach((device: HealthDevice) => {
      this.devices.set(device.deviceId, device);
    });

    return devices;
  }

  /**
   * Start streaming data from a specific device
   */
  async startDeviceStream(deviceId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/iot/devices/${deviceId}/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to start device stream: ${response.statusText}`);
    }

    this.socket?.emit('start_device_stream', deviceId);
  }

  /**
   * Stop streaming data from a specific device
   */
  async stopDeviceStream(deviceId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/iot/devices/${deviceId}/stop`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to stop device stream: ${response.statusText}`);
    }

    this.socket?.emit('stop_device_stream', deviceId);
  }

  /**
   * Subscribe to real-time data from a device
   */
  subscribeToDeviceData(deviceId: string, callback: (reading: DeviceReading) => void): void {
    this.dataCallbacks.set(deviceId, callback);
  }

  /**
   * Unsubscribe from device data
   */
  unsubscribeFromDeviceData(deviceId: string): void {
    this.dataCallbacks.delete(deviceId);
  }

  /**
   * Subscribe to IoT alerts
   */
  subscribeToAlerts(callback: (alert: IoTAlert) => void): void {
    this.alertCallbacks.add(callback);
  }

  /**
   * Subscribe to device connection status changes
   */
  subscribeToConnectionStatus(callback: (device: HealthDevice) => void): void {
    this.connectionCallbacks.add(callback);
  }

  /**
   * Get historical data from a device
   */
  async getDeviceHistory(
    deviceId: string, 
    startTime: number, 
    endTime: number,
    limit: number = 1000
  ): Promise<DeviceReading[]> {
    const response = await fetch(
      `${this.baseUrl}/api/iot/devices/${deviceId}/history?start=${startTime}&end=${endTime}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch device history: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Calibrate a device
   */
  async calibrateDevice(deviceId: string, calibrationData: any): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/iot/devices/${deviceId}/calibrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(calibrationData),
    });

    if (!response.ok) {
      throw new Error(`Failed to calibrate device: ${response.statusText}`);
    }
  }

  /**
   * Set device alerts and thresholds
   */
  async setDeviceAlerts(deviceId: string, alerts: {
    minValue?: number;
    maxValue?: number;
    criticalMin?: number;
    criticalMax?: number;
    enabled: boolean;
  }): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/iot/devices/${deviceId}/alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(alerts),
    });

    if (!response.ok) {
      throw new Error(`Failed to set device alerts: ${response.statusText}`);
    }
  }

  /**
   * Get device statistics
   */
  async getDeviceStats(deviceId: string, timeframe: '24h' | '7d' | '30d'): Promise<{
    avgValue: number;
    minValue: number;
    maxValue: number;
    readingCount: number;
    uptime: number;
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  }> {
    const response = await fetch(`${this.baseUrl}/api/iot/devices/${deviceId}/stats?timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch device stats: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Handle incoming device readings
   */
  private handleDeviceReading(reading: DeviceReading): void {
    const callback = this.dataCallbacks.get(reading.deviceId);
    if (callback) {
      callback(reading);
    }

    // Update device last reading
    const device = this.devices.get(reading.deviceId);
    if (device) {
      device.lastReading = reading;
      this.devices.set(reading.deviceId, device);
    }
  }

  /**
   * Handle device status updates
   */
  private handleDeviceStatusUpdate(updatedDevice: HealthDevice): void {
    this.devices.set(updatedDevice.deviceId, updatedDevice);
    
    this.connectionCallbacks.forEach(callback => {
      callback(updatedDevice);
    });
  }

  /**
   * Handle IoT alerts
   */
  private handleAlert(alert: IoTAlert): void {
    this.alertCallbacks.forEach(callback => {
      callback(alert);
    });
  }

  /**
   * Generate synthetic data for testing (remove in production)
   */
  generateSyntheticData(deviceId: string, type: string): DeviceReading {
    const baseValues: { [key: string]: { value: number; unit: string } } = {
      heart_rate: { value: 72 + Math.random() * 20 - 10, unit: 'bpm' },
      blood_pressure: { value: { systolic: 120 + Math.random() * 20 - 10, diastolic: 80 + Math.random() * 15 - 7 }, unit: 'mmHg' },
      glucose: { value: 100 + Math.random() * 40 - 20, unit: 'mg/dL' },
      temperature: { value: 98.6 + Math.random() * 2 - 1, unit: '°F' },
      weight: { value: 70 + Math.random() * 10 - 5, unit: 'kg' },
      oxygen_saturation: { value: 98 + Math.random() * 3 - 1, unit: '%' },
    };

    const base = baseValues[type] || { value: Math.random() * 100, unit: 'units' };

    return {
      deviceId,
      timestamp: Date.now(),
      type,
      value: base.value,
      unit: base.unit,
      quality: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)] as any,
      metadata: {
        signalStrength: Math.random() * 100,
        movement: Math.random() > 0.8,
        temperature: 22 + Math.random() * 10,
      },
    };
  }

  /**
   * Disconnect from IoT service
   */
  disconnect(): void {
    this.socket?.disconnect();
    this.devices.clear();
    this.dataCallbacks.clear();
    this.alertCallbacks.clear();
    this.connectionCallbacks.clear();
  }
}

export const iotIntegrationService = new IoTIntegrationService();
export default iotIntegrationService;
