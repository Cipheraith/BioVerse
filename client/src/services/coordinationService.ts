import { apiClient } from './api';

export interface FacilityStatus {
  facility_id: number;
  name: string;
  type: string;
  latitude: number | null;
  longitude: number | null;
  district: string;
  province: string;
  status: 'CRITICAL' | 'HEALTHY' | 'SURPLUS';
  critical_items_count: number;
}

export interface TransferAlert {
  alert_id: string;
  item: string;
  item_category: string;
  action: string;
  from_facility: {
    name: string;
    type: string;
    district: string;
    surplus_amount: number;
    distance_km: number;
  };
  to_facility: {
    name: string;
    type: string;
    district: string;
    shortage_timeframe: string;
    location: { latitude: number; longitude: number };
  };
  status: string;
  created_at: string;
}

export interface DHIS2Status {
  dhis2_url: string;
  connection: { ok: boolean; version: string | null; error: string | null };
  mapped_org_units: number;
  mapped_data_elements: number;
  last_sync: { sync_type: string; status: string; records_processed: number; started_at: string } | null;
}

export interface SyncResult {
  processed: number;
  failed: number;
}

export const coordinationService = {
  async getStatusMap(): Promise<FacilityStatus[]> {
    const res = await apiClient.get('/api/v1/coordination/status-map');
    return res.data;
  },

  async getCriticalTransfers(): Promise<TransferAlert[]> {
    const res = await apiClient.get('/api/v1/coordination/critical-transfers');
    return res.data;
  },

  async updateAlertStatus(alertId: string, status: string, notes?: string): Promise<void> {
    await apiClient.patch(`/api/v1/coordination/alerts/${alertId}`, { status, notes });
  },

  async getDHIS2Status(): Promise<DHIS2Status> {
    const res = await apiClient.get('/api/v1/dhis2/status');
    return res.data;
  },

  async testDHIS2Connection(): Promise<{ ok: boolean; version: string | null; error: string | null }> {
    const res = await apiClient.get('/api/v1/dhis2/test-connection');
    return res.data;
  },

  async triggerFullSync(): Promise<SyncResult> {
    const res = await apiClient.post('/api/v1/dhis2/sync/full', {});
    return res.data;
  },

  async getSyncHistory(): Promise<any[]> {
    const res = await apiClient.get('/api/v1/dhis2/sync/history');
    return res.data;
  },
};
