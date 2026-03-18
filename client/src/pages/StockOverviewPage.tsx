import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, AlertTriangle, CheckCircle, TrendingUp
} from 'lucide-react';
import {
  coordinationService,
  FacilityStatus,
} from '../services/coordinationService';

const StockOverviewPage: React.FC = () => {
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

  const critical = facilities.filter(f => f.status === 'CRITICAL');
  const healthy = facilities.filter(f => f.status === 'HEALTHY');
  const surplus = facilities.filter(f => f.status === 'SURPLUS');

  // Group by district for breakdown
  const districtStats = Object.entries(
    facilities.reduce<Record<string, { total: number; critical: number; healthy: number; surplus: number }>>((acc, f) => {
      const d = f.district || 'Unknown';
      if (!acc[d]) acc[d] = { total: 0, critical: 0, healthy: 0, surplus: 0 };
      acc[d].total++;
      if (f.status === 'CRITICAL') acc[d].critical++;
      else if (f.status === 'HEALTHY') acc[d].healthy++;
      else if (f.status === 'SURPLUS') acc[d].surplus++;
      return acc;
    }, {})
  ).sort((a, b) => b[1].critical - a[1].critical);

  const criticalPct = facilities.length > 0 ? Math.round((critical.length / facilities.length) * 100) : 0;
  const healthyPct = facilities.length > 0 ? Math.round((healthy.length / facilities.length) * 100) : 0;
  const surplusPct = facilities.length > 0 ? Math.round((surplus.length / facilities.length) * 100) : 0;

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
          <BarChart3 className="w-6 h-6 text-blue-600" />
          Stock Overview
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          System-wide stock health across {facilities.length} facilities
        </p>
      </div>

      {/* Stock Health Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { label: 'Critical', count: critical.length, pct: criticalPct, icon: AlertTriangle, fg: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', bar: 'bg-red-500' },
          { label: 'Healthy', count: healthy.length, pct: healthyPct, icon: CheckCircle, fg: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', bar: 'bg-green-500' },
          { label: 'Surplus', count: surplus.length, pct: surplusPct, icon: TrendingUp, fg: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', bar: 'bg-blue-500' },
        ].map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{s.label} Facilities</h3>
              <div className={`p-2 rounded-lg ${s.bg} ${s.fg}`}><s.icon className="w-4 h-4" /></div>
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{s.count}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">({s.pct}%)</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
              <div className={`${s.bar} h-2 rounded-full transition-all duration-500`} style={{ width: `${s.pct}%` }} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Overall Health Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6"
      >
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">System Stock Health</h2>
        <div className="flex rounded-full h-4 overflow-hidden bg-gray-100 dark:bg-gray-800">
          {criticalPct > 0 && <div className="bg-red-500 transition-all" style={{ width: `${criticalPct}%` }} title={`Critical: ${criticalPct}%`} />}
          {healthyPct > 0 && <div className="bg-green-500 transition-all" style={{ width: `${healthyPct}%` }} title={`Healthy: ${healthyPct}%`} />}
          {surplusPct > 0 && <div className="bg-blue-500 transition-all" style={{ width: `${surplusPct}%` }} title={`Surplus: ${surplusPct}%`} />}
        </div>
        <div className="flex items-center gap-6 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <div className="w-3 h-3 rounded-full bg-red-500" /> Critical ({criticalPct}%)
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <div className="w-3 h-3 rounded-full bg-green-500" /> Healthy ({healthyPct}%)
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <div className="w-3 h-3 rounded-full bg-blue-500" /> Surplus ({surplusPct}%)
          </div>
        </div>
      </motion.div>

      {/* District Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
      >
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Stock by District</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sorted by most critical first</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">District</th>
                <th className="text-center py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Total</th>
                <th className="text-center py-3 px-4 text-red-600 dark:text-red-400 font-medium">Critical</th>
                <th className="text-center py-3 px-4 text-green-600 dark:text-green-400 font-medium">Healthy</th>
                <th className="text-center py-3 px-4 text-blue-600 dark:text-blue-400 font-medium">Surplus</th>
                <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Health Bar</th>
              </tr>
            </thead>
            <tbody>
              {districtStats.map(([district, stats]) => {
                const cPct = stats.total > 0 ? Math.round((stats.critical / stats.total) * 100) : 0;
                const hPct = stats.total > 0 ? Math.round((stats.healthy / stats.total) * 100) : 0;
                const sPct = stats.total > 0 ? Math.round((stats.surplus / stats.total) * 100) : 0;
                return (
                  <tr key={district} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{district}</td>
                    <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">{stats.total}</td>
                    <td className="py-3 px-4 text-center">
                      {stats.critical > 0 ? <span className="text-red-600 dark:text-red-400 font-semibold">{stats.critical}</span> : <span className="text-gray-400">0</span>}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">{stats.healthy}</td>
                    <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">{stats.surplus}</td>
                    <td className="py-3 px-4">
                      <div className="flex rounded-full h-2 overflow-hidden bg-gray-100 dark:bg-gray-700 w-24">
                        {cPct > 0 && <div className="bg-red-500" style={{ width: `${cPct}%` }} />}
                        {hPct > 0 && <div className="bg-green-500" style={{ width: `${hPct}%` }} />}
                        {sPct > 0 && <div className="bg-blue-500" style={{ width: `${sPct}%` }} />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Critical Facilities List */}
      {critical.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white dark:bg-gray-900 rounded-xl border border-red-200 dark:border-red-800/40 shadow-sm p-6"
        >
          <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            Facilities Needing Immediate Attention
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {critical.slice(0, 12).map((f) => (
              <div key={f.facility_id} className="flex items-center gap-3 p-3 rounded-lg bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{f.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{f.district || 'Unknown'} &middot; {f.critical_items_count} critical items</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StockOverviewPage;
