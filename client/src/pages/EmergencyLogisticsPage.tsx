import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Truck, AlertTriangle, Package, ArrowRight, Clock,
  CheckCircle, MapPin, Zap, Activity
} from 'lucide-react';
import {
  coordinationService,
  TransferAlert,
  FacilityStatus,
} from '../services/coordinationService';

const EmergencyLogisticsPage: React.FC = () => {
  const [transfers, setTransfers] = useState<TransferAlert[]>([]);
  const [facilities, setFacilities] = useState<FacilityStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_transit' | 'delivered'>('all');

  const fetchData = useCallback(async () => {
    try {
      const [t, f] = await Promise.all([
        coordinationService.getCriticalTransfers().catch(() => []),
        coordinationService.getStatusMap().catch(() => []),
      ]);
      setTransfers(t);
      setFacilities(f);
    } catch { /* empty */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const critical = facilities.filter(f => f.status === 'CRITICAL');
  const filtered = filter === 'all' ? transfers : transfers.filter(t => t.status === filter);

  const pending = transfers.filter(t => t.status === 'pending').length;
  const inTransit = transfers.filter(t => t.status === 'in_transit').length;
  const delivered = transfers.filter(t => t.status === 'delivered').length;

  const handleAcknowledge = async (alertId: string) => {
    try {
      await coordinationService.updateAlertStatus(alertId, 'in_transit');
      await fetchData();
    } catch { /* empty */ }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-600" />
            Emergency Logistics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage critical supply transfers and emergency dispatches
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm"
        >
          <Zap className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Transfers</span>
            <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{transfers.length}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className={`rounded-xl border shadow-sm p-5 ${pending > 0 ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800/40' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Pending</span>
            <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{pending}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">In Transit</span>
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{inTransit}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Delivered</span>
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{delivered}</p>
        </motion.div>
      </div>

      {/* Critical Facilities Quick View */}
      {critical.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-red-50/50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800/40 p-4"
        >
          <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4" />
            {critical.length} Facilities Need Emergency Supply
          </h3>
          <div className="flex flex-wrap gap-2">
            {critical.slice(0, 12).map(f => (
              <span key={f.facility_id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
                <MapPin className="w-3 h-3" />
                {f.name}
                <span className="text-red-500 dark:text-red-500 font-semibold">({f.critical_items_count})</span>
              </span>
            ))}
            {critical.length > 12 && (
              <span className="text-xs text-red-500 dark:text-red-400 self-center">+{critical.length - 12} more</span>
            )}
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {([
          { key: 'all' as const, label: 'All' },
          { key: 'pending' as const, label: 'Pending' },
          { key: 'in_transit' as const, label: 'In Transit' },
          { key: 'delivered' as const, label: 'Delivered' },
        ]).map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === f.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Transfer List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
      >
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Truck className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No transfers {filter !== 'all' ? `with status "${filter.replace('_', ' ')}"` : 'found'}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((t) => (
              <div key={t.alert_id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                {/* Status indicator */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  t.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' :
                  t.status === 'in_transit' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                  'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                }`}>
                  {t.status === 'pending' ? <Clock className="w-5 h-5" /> :
                   t.status === 'in_transit' ? <Truck className="w-5 h-5" /> :
                   <CheckCircle className="w-5 h-5" />}
                </div>

                {/* Transfer info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                    <span className="truncate">{t.from_facility.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{t.to_facility.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{t.item}</span>
                    {t.item_category && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{t.item_category}</span>
                      </>
                    )}
                    <span className="text-xs text-gray-400">•</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                      t.action === 'EMERGENCY_TRANSFER'
                        ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                        : 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'
                    }`}>{t.action?.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                {/* Action */}
                {t.status === 'pending' && (
                  <button
                    onClick={() => handleAcknowledge(t.alert_id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-sm"
                  >
                    <Truck className="w-3 h-3" />
                    Dispatch
                  </button>
                )}

                {/* Status badge */}
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0 ${
                  t.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800' :
                  t.status === 'in_transit' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
                  'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                }`}>
                  {t.status?.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default EmergencyLogisticsPage;
