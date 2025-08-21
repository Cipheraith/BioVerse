import { apiClient } from './api';

export interface MedicationItem {
  name: string;
  dosage: string;
  quantity: number;
}

export interface Prescription {
  id: string;
  patient_id: string;
  doctor_id: string;
  pharmacy_id?: string;
  medications: MedicationItem[];
  status: 'issued' | 'pending_pharmacy' | 'filled' | 'in_delivery' | 'delivered' | 'cancelled';
  issue_date: string;
  delivery_address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePrescriptionData {
  patient_id: string;
  doctor_id: string;
  medications: MedicationItem[];
  delivery_address?: string;
  notes?: string;
}

export class PrescriptionService {
  static async createPrescription(data: CreatePrescriptionData): Promise<Prescription> {
    try {
      const response = await apiClient.post<Prescription>('/api/prescriptions', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getPrescription(id: string): Promise<Prescription> {
    try {
      const response = await apiClient.get<Prescription>(`/api/prescriptions/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async updatePrescriptionStatus(id: string, status: Prescription['status'], pharmacy_id?: string): Promise<Prescription> {
    try {
      const response = await apiClient.put<Prescription>(`/api/prescriptions/${id}/status`, { status, pharmacy_id });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getPatientPrescriptions(patientId: string): Promise<Prescription[]> {
    try {
      const response = await apiClient.get<Prescription[]>(`/api/prescriptions/patient/${patientId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getPharmacyPrescriptions(pharmacyId: string): Promise<Prescription[]> {
    try {
      const response = await apiClient.get<Prescription[]>(`/api/prescriptions/pharmacy/${pharmacyId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default PrescriptionService;
