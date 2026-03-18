import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Search, AlertTriangle, CheckCircle,
  TrendingUp, ChevronDown
} from 'lucide-react';
import {
  coordinationService,
  FacilityStatus,
} from '../services/coordinationService';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    CRITICAL: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    HEALTHY: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
    SURPLUS: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {status}
    </span>
  );
};

const FacilitiesPage: React.FC = () => {
  const [facilities, setFacilities] = useState<FacilityStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CRITICAL' | 'HEALTHY' | 'SURPLUS'>('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const fetchData = useCallback(async () => {
    try {
      const data = await coordinationService.getStatusMap();
      setFacilities(data);
    } catch { /* empty */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const districts = ['ALL', ...new Set(facilities.map(f => f.district).filter(Boolean))];
  const types = ['ALL', ...new Set(facilities.map(f => f.type).filter(Boolean))];

  const filtered = facilities.filter(f => {
    if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;
    if (districtFilter !== 'ALL' && f.district !== districtFilter) return false;
    if (typeFilter !== 'ALL' && f.type !== typeFilter) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.district?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const critical = facilities.filter(f => f.status === 'CRITICAL').length;
  const healthy = facilities.filter(f => f.status === 'HEALTHY').length;
  const surplus = facilities.filter(f => f.status === 'SURPLUS').length;

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
          <Building2 className="w-6 h-6 text-blue-600" />
          Facilities
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {facilities.length} facilities tracked across the health system
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: facilities.length, icon: Building2, bg: 'bg-blue-50 dark:bg-blue-900/20', fg: 'text-blue-600 dark:text-blue-400' },
          { label: 'Critical', value: critical, icon: AlertTriangle, bg: 'bg-red-50 dark:bg-red-900/20', fg: 'text-red-600 dark:text-red-400' },
          { label: 'Healthy', value: healthy, icon: CheckCircle, bg: 'bg-green-50 dark:bg-green-900/20', fg: 'text-green-600 dark:text-green-400' },
          { label: 'Surplus', value: surplus, icon: TrendingUp, bg: 'bg-blue-50 dark:bg-blue-900/20', fg: 'text-blue-600 dark:text-blue-400' },
        ].map((c) => (
          <div key={c.label} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{c.label}</span>
              <div className={`p-1.5 rounded-md ${c.bg} ${c.fg}`}><c.icon className="w-3.5 h-3.5" /></div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search facilities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-1.5">
            {(['ALL', 'CRITICAL', 'HEALTHY', 'SURPLUS'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === s
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* District dropdown */}
          <div className="relative">
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-xs font-medium border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500"
            >
              {districts.map(d => <option key={d} value={d}>{d === 'ALL' ? 'All Districts' : d}</option>)}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Type dropdown */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-xs font-medium border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500"
            >
              {types.map(t => <option key={t} value={t}>{t === 'ALL' ? 'All Types' : t}</option>)}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Facility</th>
                <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">District</th>
                <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Province</th>
                <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Status</th>
                <th className="text-right py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Critical Items</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    No facilities match your search.
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 100).map((f) => (
                  <tr key={f.facility_id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${f.status === 'CRITICAL' ? 'bg-red-500' : f.status === 'SURPLUS' ? 'bg-blue-500' : 'bg-green-500'}`} />
                        <span className="text-gray-900 dark:text-white font-medium">{f.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{f.district || '—'}</td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{f.province || '—'}</td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{f.type}</td>
                    <td className="py-3 px-4"><StatusBadge status={f.status} /></td>
                    <td className="py-3 px-4 text-right">
                      {f.critical_items_count > 0 ? (
                        <span className="text-red-600 dark:text-red-400 font-semibold">{f.critical_items_count}</span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 100 && (
          <div className="text-center py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Showing 100 of {filtered.length} facilities</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default FacilitiesPage;
