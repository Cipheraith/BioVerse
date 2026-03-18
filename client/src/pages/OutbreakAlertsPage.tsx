import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle, Shield, Activity,
  MapPin, Calendar, CheckCircle
} from 'lucide-react';
import {
  coordinationService,
  FacilityStatus,
} from '../services/coordinationService';

const OutbreakAlertsPage: React.FC = () => {
  const [facilities, setFacilities] = useState<FacilityStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const data = await coordinationService.getStatusMap();
      setFacilities(data);
    } catch { /* empty */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Derive outbreak-like signals from stock data patterns
  const critical = facilities.filter(f => f.status === 'CRITICAL');
  const criticalByDistrict = Object.entries(
    critical.reduce<Record<string, FacilityStatus[]>>((acc, f) => {
      const d = f.district || 'Unknown';
      if (!acc[d]) acc[d] = [];
      acc[d].push(f);
      return acc;
    }, {})
  ).sort((a, b) => b[1].length - a[1].length);

  // Districts with cluster alerts (3+ critical facilities = potential outbreak signal)
  const clusterAlerts = criticalByDistrict.filter(([, facs]) => facs.length >= 3);
  const watchDistricts = criticalByDistrict.filter(([, facs]) => facs.length >= 2 && facs.length < 3);

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-orange-600" />
          Outbreak Alerts
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Early warning signals derived from facility stock depletion patterns
        </p>
      </div>

      {/* Alert Level Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          className={`p-5 rounded-xl border shadow-sm ${
            clusterAlerts.length > 0
              ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/40'
              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Cluster Alerts</span>
            <div className={`p-2 rounded-lg ${clusterAlerts.length > 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{clusterAlerts.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Districts with 3+ critical facilities</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className={`p-5 rounded-xl border shadow-sm ${
            watchDistricts.length > 0
              ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800/40'
              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Watch Zones</span>
            <div className={`p-2 rounded-lg ${watchDistricts.length > 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{watchDistricts.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Districts with 2 critical facilities</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Critical</span>
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{critical.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Facilities in critical state</p>
        </motion.div>
      </div>

      {/* Cluster Alerts Detail */}
      {clusterAlerts.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white dark:bg-gray-900 rounded-xl border border-red-200 dark:border-red-800/40 shadow-sm overflow-hidden"
        >
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-red-50/50 dark:bg-red-900/10">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
              Active Cluster Alerts
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Districts with concentrated stock depletion — potential demand surge or supply chain disruption
            </p>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {clusterAlerts.map(([district, facs]) => (
              <div key={district} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{district}</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                      {facs.length} facilities critical
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Detected now
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {facs.map((f) => (
                    <div key={f.facility_id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                      <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{f.name}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{f.critical_items_count} critical items</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-12 text-center"
        >
          <CheckCircle className="w-12 h-12 text-green-300 dark:text-green-800 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No Cluster Alerts</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">No districts show concentrated stock depletion patterns</p>
        </motion.div>
      )}

      {/* Watch Zones */}
      {watchDistricts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-xl border border-yellow-200 dark:border-yellow-800/40 shadow-sm overflow-hidden"
        >
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-yellow-50/50 dark:bg-yellow-900/10">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              Watch Zones
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Districts approaching cluster threshold — monitor closely
            </p>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {watchDistricts.map(([district, facs]) => (
              <div key={district} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{district}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{facs.length} critical facilities</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
                  Watching
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* All Critical by District */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
      >
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Critical Facilities by District</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">District</th>
                <th className="text-center py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Critical Count</th>
                <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Severity</th>
                <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Affected Facilities</th>
              </tr>
            </thead>
            <tbody>
              {criticalByDistrict.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-500 dark:text-gray-400">No critical facilities</td></tr>
              ) : (
                criticalByDistrict.map(([district, facs]) => (
                  <tr key={district} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{district}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-red-600 dark:text-red-400 font-semibold">{facs.length}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                        facs.length >= 3 ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' :
                        facs.length >= 2 ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800' :
                        'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                      }`}>
                        {facs.length >= 3 ? 'CLUSTER' : facs.length >= 2 ? 'WATCH' : 'ISOLATED'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">
                      {facs.slice(0, 3).map(f => f.name).join(', ')}{facs.length > 3 ? ` +${facs.length - 3} more` : ''}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default OutbreakAlertsPage;
