import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Package, AlertTriangle, CheckCircle, TrendingUp, RefreshCw,
  MapPin, ArrowRight, Clock, Database, Wifi, WifiOff
} from 'lucide-react';
import {
  coordinationService,
  FacilityStatus,
  TransferAlert,
  DHIS2Status,
} from '../services/coordinationService';

// --- Stat Card (Landing-page style) ---
const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  iconBg: string;
  iconColor: string;
}> = ({ icon, title, value, subtitle, iconBg, iconColor }) => (
  <motion.div
    className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
    whileHover={{ y: -2 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
  >
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <div className={`p-2 rounded-lg ${iconBg} ${iconColor}`}>{icon}</div>
    </div>
    <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
    {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
  </motion.div>
);

// --- Status Badge ---
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    CRITICAL: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    HEALTHY: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
    SURPLUS: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    OPEN: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'}`}>
      {status}
    </span>
  );
};

// --- Main Dashboard ---
const CoordinationDashboard: React.FC = () => {
  const [facilities, setFacilities] = useState<FacilityStatus[]>([]);
  const [alerts, setAlerts] = useState<TransferAlert[]>([]);
  const [dhis2Status, setDhis2Status] = useState<DHIS2Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'HEALTHY' | 'SURPLUS'>('ALL');

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [facilityData, alertData, statusData] = await Promise.all([
        coordinationService.getStatusMap(),
        coordinationService.getCriticalTransfers(),
        coordinationService.getDHIS2Status().catch(() => null),
      ]);
      setFacilities(facilityData);
      setAlerts(alertData);
      setDhis2Status(statusData);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await coordinationService.triggerFullSync();
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await coordinationService.updateAlertStatus(alertId, 'ACKNOWLEDGED');
      setAlerts(prev => prev.filter(a => a.alert_id !== alertId));
    } catch {
      // Silently handle - alert may already be resolved
    }
  };

  // Compute summary stats
  const criticalCount = facilities.filter(f => f.status === 'CRITICAL').length;
  const healthyCount = facilities.filter(f => f.status === 'HEALTHY').length;
  const surplusCount = facilities.filter(f => f.status === 'SURPLUS').length;

  const filteredFacilities = filter === 'ALL'
    ? facilities
    : facilities.filter(f => f.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Supply Chain Coordination</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time stock visibility across {facilities.length} facilities
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync DHIS2'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* DHIS2 Connection Status */}
      {dhis2Status && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm shadow-sm">
          {dhis2Status.connection.ok ? (
            <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-600 dark:text-red-400" />
          )}
          <span className="text-gray-600 dark:text-gray-400">
            DHIS2: {dhis2Status.connection.ok ? `Connected (v${dhis2Status.connection.version})` : 'Disconnected'}
          </span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <Database className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">
            {dhis2Status.mapped_org_units} org units, {dhis2Status.mapped_data_elements} data elements
          </span>
          {dhis2Status.last_sync && (
            <>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                Last sync: {new Date(dhis2Status.last_sync.started_at).toLocaleString()}
              </span>
            </>
          )}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Package className="w-5 h-5" />}
          title="Total Facilities"
          value={facilities.length}
          subtitle="Connected to DHIS2"
          iconBg="bg-blue-50 dark:bg-blue-900/20"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5" />}
          title="Critical Stock"
          value={criticalCount}
          subtitle={criticalCount > 0 ? 'Require immediate attention' : 'All facilities healthy'}
          iconBg="bg-red-50 dark:bg-red-900/20"
          iconColor="text-red-600 dark:text-red-400"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5" />}
          title="Healthy Facilities"
          value={healthyCount}
          subtitle="Stock levels within range"
          iconBg="bg-green-50 dark:bg-green-900/20"
          iconColor="text-green-600 dark:text-green-400"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          title="Transfer Alerts"
          value={alerts.length}
          subtitle="Open transfer recommendations"
          iconBg="bg-yellow-50 dark:bg-yellow-900/20"
          iconColor="text-yellow-600 dark:text-yellow-400"
        />
      </div>

      {/* Transfer Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-yellow-200 dark:border-yellow-800/40 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            Active Transfer Alerts
          </h2>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <motion.div
                key={alert.alert_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-center min-w-[80px]">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Item</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{alert.item}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="w-3 h-3" />
                    <span className="text-green-700 dark:text-green-400 font-medium">{alert.from_facility.name}</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="text-red-700 dark:text-red-400 font-medium">{alert.to_facility.name}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {alert.from_facility.surplus_amount} units, {alert.from_facility.distance_km} km
                  </div>
                </div>
                <button
                  onClick={() => handleAcknowledge(alert.alert_id)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-sm"
                >
                  Acknowledge
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Facility Status Grid */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Facility Stock Status</h2>
          <div className="flex gap-2">
            {(['ALL', 'CRITICAL', 'HEALTHY', 'SURPLUS'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {f} {f !== 'ALL' && `(${f === 'CRITICAL' ? criticalCount : f === 'HEALTHY' ? healthyCount : surplusCount})`}
              </button>
            ))}
          </div>
        </div>

        {filteredFacilities.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">No facilities match the current filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Facility</th>
                  <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">District</th>
                  <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Status</th>
                  <th className="text-right py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Critical Items</th>
                </tr>
              </thead>
              <tbody>
                {filteredFacilities.slice(0, 50).map((facility) => (
                  <tr key={facility.facility_id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{facility.name}</td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{facility.district || '—'}</td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{facility.type}</td>
                    <td className="py-3 px-4"><StatusBadge status={facility.status} /></td>
                    <td className="py-3 px-4 text-right">
                      {facility.critical_items_count > 0 ? (
                        <span className="text-red-600 dark:text-red-400 font-semibold">{facility.critical_items_count}</span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredFacilities.length > 50 && (
              <p className="text-center text-gray-500 dark:text-gray-400 text-xs mt-4">
                Showing 50 of {filteredFacilities.length} facilities
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoordinationDashboard;
