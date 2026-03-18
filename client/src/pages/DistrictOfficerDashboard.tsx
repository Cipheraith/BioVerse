import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, AlertTriangle, Package, Search,
  RefreshCw, ChevronDown, MapPin, Truck, BarChart3
} from 'lucide-react';
import { personaDashboardService, DistrictDashboard } from '../services/personaDashboardService';

const card = 'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm';
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function DistrictOfficerDashboard() {
  const [districts, setDistricts] = useState<{ district: string; facility_count: number }[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [data, setData] = useState<DistrictDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    personaDashboardService.getDistrict().then((res: any) => {
      setDistricts(res.districts || []);
      if (res.districts?.length > 0) {
        setSelectedDistrict(res.districts[0].district);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedDistrict) return;
    setLoading(true);
    personaDashboardService.getDistrict(selectedDistrict).then((res: any) => {
      setData(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedDistrict]);

  if (!data && !loading) return <EmptyState />;

  return (
    <div className="space-y-6">
      {/* Header + District Selector */}
      <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">District Health Office</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Cross-facility coordination & resource allocation</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {districts.map(d => (
                <option key={d.district} value={d.district}>{d.district} ({d.facility_count})</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <button onClick={() => { if (selectedDistrict) { setLoading(true); personaDashboardService.getDistrict(selectedDistrict).then((r: any) => { setData(r); setLoading(false); }); }}}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </motion.div>

      {loading ? <LoadingSkeleton /> : data && (
        <>
          {/* District KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Facilities', value: data.summary.total_facilities, icon: Building2, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
              { label: 'Critical Facilities', value: data.summary.critical_facilities, icon: AlertTriangle, color: 'text-red-600 bg-red-50 dark:bg-red-900/20', accent: data.summary.critical_facilities > 0 },
              { label: 'Critical Stock Items', value: data.summary.critical_stock_items, icon: Package, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
              { label: 'Active Transfers', value: data.summary.active_transfers, icon: Truck, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
            ].map((kpi, i) => (
              <motion.div key={kpi.label} {...fadeUp} transition={{ delay: 0.05 + i * 0.05 }}
                className={`${card} p-5 ${kpi.accent ? 'ring-2 ring-red-200 dark:ring-red-800' : ''}`}>
                <div className={`inline-flex p-2.5 rounded-lg ${kpi.color} mb-3`}>
                  <kpi.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{kpi.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Two-Column: Facility List + Stock Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Facility List */}
            <motion.div {...fadeUp} transition={{ delay: 0.2 }} className={`${card} p-6 lg:col-span-3`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" /> Facilities
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-48"
                  />
                </div>
              </div>
              <div className="overflow-y-auto max-h-[500px] space-y-2">
                {data.facilities
                  .filter((f: any) => f.name.toLowerCase().includes(search.toLowerCase()))
                  .map((f: any) => (
                  <div key={f.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{f.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{f.type?.replace(/_/g, ' ')} • {f.total_items} items</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {f.critical_items > 0 && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          {f.critical_items} critical
                        </span>
                      )}
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        f.status === 'CRITICAL' ? 'bg-red-500' : f.status === 'SURPLUS' ? 'bg-blue-500' : 'bg-emerald-500'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Stock Item Breakdown */}
            <motion.div {...fadeUp} transition={{ delay: 0.25 }} className={`${card} p-6 lg:col-span-2`}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" /> Stock by Item
              </h2>
              <div className="space-y-3 overflow-y-auto max-h-[500px]">
                {data.stock_breakdown.map((item: any, i: number) => {
                  const total = item.critical + item.healthy + item.surplus;
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.item_name}</p>
                        <span className="text-xs text-gray-400">{total} facilities</span>
                      </div>
                      <div className="flex h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                        {item.critical > 0 && <div className="bg-red-500" style={{ width: `${(item.critical / total) * 100}%` }} />}
                        {item.healthy > 0 && <div className="bg-emerald-500" style={{ width: `${(item.healthy / total) * 100}%` }} />}
                        {item.surplus > 0 && <div className="bg-blue-500" style={{ width: `${(item.surplus / total) * 100}%` }} />}
                      </div>
                      <div className="flex gap-3 text-[10px] text-gray-400">
                        <span className="text-red-500">{item.critical} critical</span>
                        <span className="text-emerald-500">{item.healthy} healthy</span>
                        <span className="text-blue-500">{item.surplus} surplus</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Transfer Alerts */}
          <motion.div {...fadeUp} transition={{ delay: 0.3 }} className={`${card} p-6`}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-purple-600" /> Transfer Alerts in {data.district}
            </h2>
            {data.transfers.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No transfer activity in this district</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-200 dark:border-gray-700">
                      <th className="py-2 pr-4">Item</th>
                      <th className="py-2 pr-4">From</th>
                      <th className="py-2 pr-4">To</th>
                      <th className="py-2 pr-4 text-center">Qty</th>
                      <th className="py-2 pr-4 text-center">Distance</th>
                      <th className="py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {data.transfers.map((t: any) => (
                      <tr key={t.alert_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="py-2.5 pr-4 font-medium text-gray-900 dark:text-white">{t.item}</td>
                        <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-300 truncate max-w-[140px]">{t.from_facility}</td>
                        <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-300 truncate max-w-[140px]">{t.to_facility}</td>
                        <td className="py-2.5 pr-4 text-center">{t.surplus_amount}</td>
                        <td className="py-2.5 pr-4 text-center text-gray-500">{t.distance_km.toFixed(1)} km</td>
                        <td className="py-2.5 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            t.status === 'OPEN' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          }`}>{t.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
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
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl lg:col-span-3" />
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl lg:col-span-2" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <MapPin className="w-12 h-12 text-gray-300 mb-4" />
      <p className="text-gray-500">No district data available</p>
    </div>
  );
}
