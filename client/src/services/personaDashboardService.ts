import { apiClient } from './api';

/* ── Types ─────────────────────────────────────── */
export interface NationalDashboard {
  summary: {
    total_facilities: number;
    critical_facilities: number;
    healthy_facilities: number;
    surplus_facilities: number;
    health_score: number;
    total_stock_records: number;
    critical_stock_items: number;
    facilities_with_stock: number;
    open_transfers: number;
    total_transfers: number;
  };
  districts: DistrictRow[];
  recent_transfers: any[];
  critical_facilities: any[];
}

export interface DistrictRow {
  district: string;
  facility_count: number;
  critical: number;
  healthy: number;
  surplus: number;
  critical_items: number;
  health_score: number;
}

export interface DistrictDashboard {
  district: string;
  summary: {
    total_facilities: number;
    critical_facilities: number;
    critical_stock_items: number;
    healthy_stock_items: number;
    surplus_stock_items: number;
    active_transfers: number;
  };
  facilities: any[];
  transfers: any[];
  stock_breakdown: any[];
}

export interface FacilityDashboard {
  facility: any;
  stock_summary: { total_items: number; critical: number; healthy: number; surplus: number };
  stock_levels: any[];
  wards: any[];
  bed_summary: { total_beds: number; occupied_beds: number; available_beds: number };
  transfers: any[];
  intake_logs: any[];
  referrals: any[];
}

export interface HealthWorkerDashboard {
  recent_intake: any[];
  pending_referrals: any[];
  low_stock_alerts: any[];
  inventory_items: any[];
  facilities: any[];
}

/* ── API calls ────────────────────────────────── */
export const personaDashboardService = {
  async getNational(): Promise<NationalDashboard> {
    const res = await apiClient.get('/api/v1/dashboard/national');
    return res.data;
  },

  async getDistrict(district?: string): Promise<DistrictDashboard | { districts: { district: string; facility_count: number }[] }> {
    const url = district ? `/api/v1/dashboard/district?district=${encodeURIComponent(district)}` : '/api/v1/dashboard/district';
    const res = await apiClient.get(url);
    return res.data;
  },

  async getFacility(facilityId?: number): Promise<FacilityDashboard | { facilities: any[] }> {
    const url = facilityId ? `/api/v1/dashboard/facility?facilityId=${facilityId}` : '/api/v1/dashboard/facility';
    const res = await apiClient.get(url);
    return res.data;
  },

  async getHealthWorker(): Promise<HealthWorkerDashboard> {
    const res = await apiClient.get('/api/v1/dashboard/health-worker');
    return res.data;
  },

  async submitPatientIntake(data: {
    facility_id: number;
    patient_name: string;
    age?: number;
    gender?: string;
    symptoms: string;
    triage_level?: string;
    notes?: string;
  }) {
    const res = await apiClient.post('/api/v1/dashboard/patient-intake', data);
    return res.data;
  },

  async submitReferral(data: {
    from_facility_id: number;
    to_facility_id: number;
    patient_name: string;
    reason: string;
    urgency?: string;
    notes?: string;
  }) {
    const res = await apiClient.post('/api/v1/dashboard/referrals', data);
    return res.data;
  },

  async submitStockUpdate(data: {
    facility_id: number;
    item_id: number;
    new_stock: number;
    notes?: string;
  }) {
    const res = await apiClient.post('/api/v1/dashboard/stock-update', data);
    return res.data;
  },
};
