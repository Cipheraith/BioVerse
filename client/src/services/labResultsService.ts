/**
 * Lab Results Management Service
 * Handles viewing, adding, and accessing lab results for patients and administrators
 */

export interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  value: string;
  unit: string;
  normalRange: string;
  timestamp: number;
  status: 'normal' | 'abnormal' | 'critical';
  comments?: string;
  technicianId?: string;
}

class LabResultsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  }

  /**
   * Patients view their lab results
   */
  async getPatientLabResults(patientId: string): Promise<LabResult[]> {
    const response = await fetch(`${this.baseUrl}/api/labs/patient/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch lab results: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Workers and admins view lab results
   */
  async getAllLabResults(): Promise<LabResult[]> {
    const response = await fetch(`${this.baseUrl}/api/labs/all`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch all lab results: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Add new lab result
   */
  async addLabResult(resultData: Omit<LabResult, 'id'>): Promise<LabResult> {
    const response = await fetch(`${this.baseUrl}/api/labs/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(resultData),
    });

    if (!response.ok) {
      throw new Error(`Failed to add lab result: ${response.statusText}`);
    }

    return await response.json();
  }
}

export const labResultsService = new LabResultsService();
export default labResultsService;

