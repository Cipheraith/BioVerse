/**
 * Mobile Integration Service
 * Manages mobile app interactions and data flow
 */

import { HealthDevice } from './iotIntegrationService';

export interface MobileAppData {
  appVersion: string;
  lastSync: number;
  featuresEnabled: string[];
  connectedDevices: HealthDevice[];
  notifications: MobileNotification[];
  syncStatus: 'synced' | 'syncing' | 'error';
}

export interface MobileNotification {
  id: string;
  title: string;
  message: string;
  type: 'health_alert' | 'appointment' | 'medication' | 'update';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  read: boolean;
  actionRequired: boolean;
}

export interface MobileSession {
  sessionId: string;
  patientId: string;
  deviceType: 'ios' | 'android';
  appVersion: string;
  startTime: number;
  lastActivity: number;
  features: string[];
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

class MobileIntegrationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  }

  /**
   * Sync data with the mobile app
   */
  async syncMobileApp(patientId: string): Promise<MobileAppData> {
    const response = await fetch(`${this.baseUrl}/api/mobile/sync/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to sync mobile app: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Check for mobile app updates
   */
  async checkAppUpdates(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/api/mobile/updates`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to check app updates: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get connected mobile devices
   */
  async getConnectedDevices(patientId: string): Promise<HealthDevice[]> {
    const response = await fetch(`${this.baseUrl}/api/mobile/devices/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch connected devices: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Enable feature on mobile app
   */
  async enableFeature(patientId: string, feature: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/mobile/enable-feature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ patientId, feature }),
    });

    if (!response.ok) {
      throw new Error(`Failed to enable feature: ${response.statusText}`);
    }
  }
}

export const mobileIntegrationService = new MobileIntegrationService();
export default mobileIntegrationService;

