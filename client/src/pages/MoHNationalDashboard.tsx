import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, AlertTriangle, TrendingUp, Activity, ArrowRight, 
  ShieldCheck, Package, MapPin, RefreshCw 
} from 'lucide-react';
import { personaDashboardService, NationalDashboard, DistrictRow } from '../services/personaDashboardService';

const card = 'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm';
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function MoHNationalDashboard() {
  const [data, setData] = useState<NationalDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const d = await personaDashboardService.getNational();
      setData(d);
      setError('');
    } catch {
      setError('Failed to load national dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSkeleton />;
  if (error || !data) return <ErrorState message={error} onRetry={load} />;

  const s = data.summary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">National Health Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Ministry of Health — Real-time facility coordination across all districts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </motion.div>

      {/* National Health Score */}
      <motion.div {...fadeUp} transition={{ delay: 0.05 }} className={`${card} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">National Health System Score</h2>
          <div className={`text-3xl font-black ${s.health_score >= 70 ? 'text-emerald-600' : s.health_score >= 40 ? 'text-amber-500' : 'text-red-600'}`}>
            {s.health_score}%
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-1000 ${s.health_score >= 70 ? 'bg-emerald-500' : s.health_score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${s.health_score}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Based on {s.total_facilities} facilities — {s.healthy_facilities + s.surplus_facilities} operational, {s.critical_facilities} critical
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Facilities', value: s.total_facilities.toLocaleString(), icon: Building2, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Critical Facilities', value: s.critical_facilities, icon: AlertTriangle, color: 'text-red-600 bg-red-50 dark:bg-red-900/20', accent: s.critical_facilities > 0 },
          { label: 'Active Transfers', value: s.open_transfers, icon: Package, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Stock Records', value: s.total_stock_records.toLocaleString(), icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} {...fadeUp} transition={{ delay: 0.1 + i * 0.05 }}
            className={`${card} p-5 ${kpi.accent ? 'ring-2 ring-red-200 dark:ring-red-800' : ''}`}>
            <div className={`inline-flex p-2.5 rounded-lg ${kpi.color} mb-3`}>
              <kpi.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Stock Status Breakdown */}
      <motion.div {...fadeUp} transition={{ delay: 0.3 }} className={`${card} p-6`}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Stock Status Distribution</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Critical Items', count: s.critical_stock_items, pct: s.total_stock_records > 0 ? Math.round((s.critical_stock_items / s.total_stock_records) * 100) : 0, color: 'bg-red-500', text: 'text-red-600' },
            { label: 'Healthy Items', count: s.total_stock_records - s.critical_stock_items - (s.total_stock_records > 0 ? Math.max(0, s.total_stock_records - s.critical_stock_items - s.facilities_with_stock) : 0), pct: 100 - Math.round((s.critical_stock_items / Math.max(1, s.total_stock_records)) * 100), color: 'bg-emerald-500', text: 'text-emerald-600' },
            { label: 'Monitored Facilities', count: s.facilities_with_stock, pct: s.total_facilities > 0 ? Math.round((s.facilities_with_stock / s.total_facilities) * 100) : 0, color: 'bg-blue-500', text: 'text-blue-600' },
          ].map(item => (
            <div key={item.label} className="text-center">
              <p className={`text-2xl font-bold ${item.text}`}>{item.count.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                <div className={`h-1.5 rounded-full ${item.color}`} style={{ width: `${Math.min(100, item.pct)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Two-column: District Table + Critical Facilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* District Health Breakdown */}
        <motion.div {...fadeUp} transition={{ delay: 0.35 }} className={`${card} p-6`}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" /> District Health Scores
          </h2>
          <div className="overflow-y-auto max-h-[400px] -mx-2">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white dark:bg-gray-800">
                <tr className="text-left text-xs text-gray-400 uppercase">
                  <th className="px-2 py-2">District</th>
                  <th className="px-2 py-2 text-center">Facilities</th>
                  <th className="px-2 py-2 text-center">Critical</th>
                  <th className="px-2 py-2 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {data.districts.map((d: DistrictRow) => (
                  <tr key={d.district} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-2 py-2 font-medium text-gray-900 dark:text-white truncate max-w-[180px]" title={d.district}>{d.district}</td>
                    <td className="px-2 py-2 text-center text-gray-600 dark:text-gray-300">{d.facility_count}</td>
                    <td className="px-2 py-2 text-center">
                      {d.critical > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          {d.critical}
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-2 py-2 text-right">
                      <span className={`font-semibold ${d.health_score >= 70 ? 'text-emerald-600' : d.health_score >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                        {d.health_score}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Critical Facilities */}
        <motion.div {...fadeUp} transition={{ delay: 0.4 }} className={`${card} p-6`}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" /> Critical Facilities
          </h2>
          <div className="space-y-2 overflow-y-auto max-h-[400px]">
            {data.critical_facilities.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
                <p className="text-sm">No critical facilities — system healthy</p>
              </div>
            ) : (
              data.critical_facilities.map((f: any) => (
                <div key={f.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{f.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{f.district} • {f.type?.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-600 text-white">
                      {f.critical_items} critical
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Transfer Activity */}
      <motion.div {...fadeUp} transition={{ delay: 0.45 }} className={`${card} p-6`}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" /> Recent Transfer Alerts
        </h2>
        {data.recent_transfers.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No transfer activity</p>
        ) : (
          <div className="space-y-3">
            {data.recent_transfers.slice(0, 8).map((t: any) => (
              <div key={t.alert_id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className={`flex-shrink-0 w-2 h-2 rounded-full ${t.status === 'OPEN' ? 'bg-amber-500' : t.status === 'RESOLVED' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{t.item}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="truncate max-w-[120px]">{t.from_facility}</span>
                    <ArrowRight className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate max-w-[120px]">{t.to_facility}</span>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${
                  t.status === 'OPEN' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                }`}>{t.status}</span>
                <span className="text-xs text-gray-400 flex-shrink-0">{t.distance_km.toFixed(1)} km</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64" />
      <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
      <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
      <button onClick={onRetry} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Retry</button>
    </div>
  );
}
