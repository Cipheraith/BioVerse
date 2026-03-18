import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, AlertTriangle, CheckCircle, TrendingUp, Layers
} from 'lucide-react';
import {
  coordinationService,
  FacilityStatus,
} from '../services/coordinationService';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const statusColor: Record<string, string> = {
  CRITICAL: '#ef4444',
  HEALTHY: '#22c55e',
  SURPLUS: '#3b82f6',
};

function FlyToSelected({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 10, { duration: 1 });
  }, [lat, lng, map]);
  return null;
}

const FacilityMapPage: React.FC = () => {
  const [facilities, setFacilities] = useState<FacilityStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<FacilityStatus | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'HEALTHY' | 'SURPLUS'>('ALL');

  const fetchData = useCallback(async () => {
    try {
      const data = await coordinationService.getStatusMap();
      setFacilities(data);
    } catch { /* empty */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = filter === 'ALL' ? facilities : facilities.filter(f => f.status === filter);
  const withCoords = filtered.filter(f => f.latitude && f.longitude);

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
          <MapPin className="w-6 h-6 text-blue-600" />
          Facility Map
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Geographic view of {facilities.length} facilities — {withCoords.length} with coordinates
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {([
          { key: 'ALL' as const, label: 'All', count: facilities.length, icon: Layers },
          { key: 'CRITICAL' as const, label: 'Critical', count: critical, icon: AlertTriangle },
          { key: 'HEALTHY' as const, label: 'Healthy', count: healthy, icon: CheckCircle },
          { key: 'SURPLUS' as const, label: 'Surplus', count: surplus, icon: TrendingUp },
        ]).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              filter === f.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <f.icon className="w-3.5 h-3.5" />
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Map + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map Area */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
        >
          <div className="relative w-full h-[500px]">
            <MapContainer
              center={[-8.5, -12.0]}
              zoom={7}
              scrollWheelZoom={true}
              className="w-full h-full z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {withCoords.map((f) => (
                <CircleMarker
                  key={f.facility_id}
                  center={[f.latitude!, f.longitude!]}
                  radius={selected?.facility_id === f.facility_id ? 10 : 6}
                  pathOptions={{
                    fillColor: statusColor[f.status] || '#6b7280',
                    color: selected?.facility_id === f.facility_id ? '#1d4ed8' : '#ffffff',
                    weight: selected?.facility_id === f.facility_id ? 3 : 1,
                    fillOpacity: 0.85,
                  }}
                  eventHandlers={{
                    click: () => setSelected(f),
                  }}
                >
                  <Popup>
                    <div className="text-xs">
                      <p className="font-semibold">{f.name}</p>
                      <p>{f.district} &bull; {f.type}</p>
                      <p className="mt-1">Status: <strong>{f.status}</strong></p>
                      {f.critical_items_count > 0 && (
                        <p className="text-red-600">Critical items: {f.critical_items_count}</p>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
              {selected && selected.latitude && selected.longitude && (
                <FlyToSelected lat={selected.latitude} lng={selected.longitude} />
              )}
            </MapContainer>

            {/* Legend overlay */}
            <div className="absolute bottom-3 right-3 z-[1000] bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Critical</div>
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /> Healthy</div>
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Surplus</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sidebar: Selected Facility or list */}
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
        >
          {selected ? (
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Facility Details</h3>
                <button onClick={() => setSelected(null)} className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  Clear
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selected.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">District</p>
                    <p className="text-sm text-gray-900 dark:text-white">{selected.district || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Province</p>
                    <p className="text-sm text-gray-900 dark:text-white">{selected.province || '—'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
                    <p className="text-sm text-gray-900 dark:text-white">{selected.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${
                      selected.status === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' :
                      selected.status === 'SURPLUS' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
                      'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                    }`}>{selected.status}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Critical Items</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selected.critical_items_count > 0 ? (
                      <span className="text-red-600 dark:text-red-400">{selected.critical_items_count}</span>
                    ) : '0'}
                  </p>
                </div>
                {selected.latitude && selected.longitude && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Coordinates</p>
                    <p className="text-xs font-mono text-gray-600 dark:text-gray-400">{selected.latitude?.toFixed(4)}, {selected.longitude?.toFixed(4)}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Facilities ({filtered.length})</h3>
              <div className="space-y-1.5 max-h-[420px] overflow-y-auto">
                {filtered.slice(0, 50).map((f) => (
                  <button
                    key={f.facility_id}
                    onClick={() => setSelected(f)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${f.status === 'CRITICAL' ? 'bg-red-500' : f.status === 'SURPLUS' ? 'bg-blue-500' : 'bg-green-500'}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{f.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{f.district || f.type}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default FacilityMapPage;
