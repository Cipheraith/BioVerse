import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BedDouble, Package, ArrowRight,
  RefreshCw, ChevronDown, Pill, Truck, Activity, ClipboardList
} from 'lucide-react';
import { personaDashboardService, FacilityDashboard } from '../services/personaDashboardService';

const card = 'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm';
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function FacilityManagerDashboard() {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<number | null>(null);
  const [data, setData] = useState<FacilityDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [stockFilter, setStockFilter] = useState<string>('ALL');

  useEffect(() => {
    personaDashboardService.getFacility().then((res: any) => {
      setFacilities(res.facilities || []);
      if (res.facilities?.length > 0) {
        setSelectedFacility(res.facilities[0].id);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedFacility) return;
    setLoading(true);
    personaDashboardService.getFacility(selectedFacility).then((res: any) => {
      setData(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedFacility]);

  const reload = () => {
    if (!selectedFacility) return;
    setLoading(true);
    personaDashboardService.getFacility(selectedFacility).then((res: any) => {
      setData(res);
      setLoading(false);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Facility Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Beds, stock, equipment & patient flow — {data?.facility?.name || 'Select a facility'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedFacility || ''}
              onChange={e => setSelectedFacility(parseInt(e.target.value))}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none max-w-[250px]"
            >
              {facilities.map((f: any) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <button onClick={reload} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </motion.div>

      {loading ? <LoadingSkeleton /> : data && (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Beds', value: data.bed_summary.total_beds, sub: `${data.bed_summary.available_beds} available`, icon: BedDouble, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
              { label: 'Stock Items', value: data.stock_summary.total_items, sub: `${data.stock_summary.critical} critical`, icon: Package, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
              { label: 'Active Transfers', value: data.transfers.length, sub: `${data.transfers.filter((t: any) => t.direction === 'INCOMING').length} incoming`, icon: Truck, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
              { label: 'Patient Intake', value: data.intake_logs.length, sub: 'recent records', icon: ClipboardList, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
            ].map((kpi, i) => (
              <motion.div key={kpi.label} {...fadeUp} transition={{ delay: 0.05 + i * 0.05 }} className={`${card} p-5`}>
                <div className={`inline-flex p-2.5 rounded-lg ${kpi.color} mb-3`}>
                  <kpi.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{kpi.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Ward / Bed Management */}
          {data.wards.length > 0 && (
            <motion.div {...fadeUp} transition={{ delay: 0.2 }} className={`${card} p-6`}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-blue-600" /> Ward & Bed Status
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.wards.map((w: any) => {
                  const capacity = w.total_beds > 0 ? Math.round((w.occupied_beds / w.total_beds) * 100) : 0;
                  return (
                    <div key={w.id} className={`p-4 rounded-lg border ${
                      capacity >= 90 ? 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800'
                      : capacity >= 60 ? 'border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800'
                      : 'border-gray-200 bg-gray-50 dark:bg-gray-700/30 dark:border-gray-600'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{w.name}</p>
                        <span className="text-xs text-gray-500 capitalize">{w.ward_type}</span>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {w.total_beds - w.occupied_beds}
                            <span className="text-sm font-normal text-gray-400"> / {w.total_beds} available</span>
                          </p>
                        </div>
                        <span className={`text-sm font-bold ${capacity >= 90 ? 'text-red-600' : capacity >= 60 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {capacity}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                        <div className={`h-2 rounded-full transition-all ${
                          capacity >= 90 ? 'bg-red-500' : capacity >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} style={{ width: `${capacity}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Two-Column: Pharmacy / Stock + Transfers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pharmacy Inventory */}
            <motion.div {...fadeUp} transition={{ delay: 0.25 }} className={`${card} p-6 lg:col-span-2`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Pill className="w-5 h-5 text-emerald-600" /> Pharmacy & Stock Inventory
                </h2>
                <div className="flex gap-1">
                  {['ALL', 'CRITICAL', 'HEALTHY', 'SURPLUS'].map(f => (
                    <button key={f} onClick={() => setStockFilter(f)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                        stockFilter === f
                          ? f === 'CRITICAL' ? 'bg-red-600 text-white'
                          : f === 'HEALTHY' ? 'bg-emerald-600 text-white'
                          : f === 'SURPLUS' ? 'bg-blue-600 text-white'
                          : 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                          : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-y-auto max-h-[400px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white dark:bg-gray-800">
                    <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-200 dark:border-gray-700">
                      <th className="py-2 pr-3">Item</th>
                      <th className="py-2 pr-3 text-center">Stock</th>
                      <th className="py-2 pr-3 text-center">Daily Use</th>
                      <th className="py-2 pr-3 text-center">Days Supply</th>
                      <th className="py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {data.stock_levels
                      .filter((s: any) => stockFilter === 'ALL' || s.status === stockFilter)
                      .map((s: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="py-2.5 pr-3">
                          <p className="font-medium text-gray-900 dark:text-white">{s.item_name}</p>
                          <p className="text-xs text-gray-400">{s.category} • {s.unit_of_measure}</p>
                        </td>
                        <td className="py-2.5 pr-3 text-center font-medium">{s.current_stock?.toLocaleString() ?? '—'}</td>
                        <td className="py-2.5 pr-3 text-center text-gray-500">{s.daily_usage_rate ?? '—'}</td>
                        <td className="py-2.5 pr-3 text-center">
                          <span className={`font-semibold ${
                            s.days_of_supply && parseFloat(s.days_of_supply) < 3 ? 'text-red-600'
                            : s.days_of_supply && parseFloat(s.days_of_supply) > 30 ? 'text-blue-600'
                            : 'text-emerald-600'
                          }`}>{s.days_of_supply ? `${s.days_of_supply}d` : '—'}</span>
                        </td>
                        <td className="py-2.5 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            s.status === 'CRITICAL' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : s.status === 'SURPLUS' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          }`}>{s.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Transfers */}
            <motion.div {...fadeUp} transition={{ delay: 0.3 }} className={`${card} p-6`}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-600" /> Transfers
              </h2>
              <div className="space-y-3 overflow-y-auto max-h-[400px]">
                {data.transfers.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No active transfers</p>
                ) : data.transfers.map((t: any) => (
                  <div key={t.alert_id} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        t.direction === 'INCOMING' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>{t.direction}</span>
                      <span className="text-xs text-gray-400">{t.distance_km.toFixed(1)} km</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{t.item}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <span className="truncate">{t.from_facility}</span>
                      <ArrowRight className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{t.to_facility}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{t.surplus_amount} units • {t.shortage_timeframe}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Patient Intake + Referrals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Intake */}
            <motion.div {...fadeUp} transition={{ delay: 0.35 }} className={`${card} p-6`}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-amber-600" /> Recent Patient Intake
              </h2>
              {data.intake_logs.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No intake records yet</p>
              ) : (
                <div className="space-y-2 overflow-y-auto max-h-[300px]">
                  {data.intake_logs.map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{log.patient_name}</p>
                        <p className="text-xs text-gray-500">{log.symptoms}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        log.triage_level === 'EMERGENCY' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : log.triage_level === 'URGENT' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                      }`}>{log.triage_level}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Care Referrals */}
            <motion.div {...fadeUp} transition={{ delay: 0.4 }} className={`${card} p-6`}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" /> Care Referrals
              </h2>
              {data.referrals.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No referrals yet</p>
              ) : (
                <div className="space-y-2 overflow-y-auto max-h-[300px]">
                  {data.referrals.map((ref: any) => (
                    <div key={ref.id} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{ref.patient_name}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          ref.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : ref.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        }`}>{ref.status}</span>
                      </div>
                      <p className="text-xs text-gray-500">{ref.reason}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <span>{ref.from_facility_name}</span>
                        <ArrowRight className="w-3 h-3" />
                        <span>{ref.to_facility_name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-xl" />)}
      </div>
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl lg:col-span-2" />
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    </div>
  );
}
