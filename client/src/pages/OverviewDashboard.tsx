import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, CheckCircle, TrendingUp,
  Building2, Database, ArrowRight, Wifi, WifiOff,
  BarChart3, Truck, MapPin
} from 'lucide-react';
import {
  coordinationService,
  FacilityStatus,
  TransferAlert,
  DHIS2Status,
} from '../services/coordinationService';
import { useAuth } from '../hooks/useAuth';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

const OverviewDashboard: React.FC = () => {
  const navigate = useNavigate();
  useAuth();
  const [facilities, setFacilities] = useState<FacilityStatus[]>([]);
  const [alerts, setAlerts] = useState<TransferAlert[]>([]);
  const [dhis2, setDhis2] = useState<DHIS2Status | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [fac, al, dh] = await Promise.all([
        coordinationService.getStatusMap(),
        coordinationService.getCriticalTransfers().catch(() => []),
        coordinationService.getDHIS2Status().catch(() => null),
      ]);
      setFacilities(fac);
      setAlerts(al);
      setDhis2(dh);
    } catch {
      // graceful — dashboard still renders
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const critical = facilities.filter(f => f.status === 'CRITICAL').length;
  const healthy = facilities.filter(f => f.status === 'HEALTHY').length;

  const districts = [...new Set(facilities.map(f => f.district).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          System Overview
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Health system coordination across {districts.length} districts &middot; {facilities.length} facilities
        </p>
      </div>

      {/* DHIS2 Connection Banner */}
      {dhis2 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm text-sm"
        >
          {dhis2.connection.ok ? (
            <Wifi className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
          )}
          <span className="text-gray-700 dark:text-gray-300">
            DHIS2 {dhis2.connection.ok ? `Connected (v${dhis2.connection.version})` : 'Disconnected'}
          </span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <Database className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-600 dark:text-gray-400">
            {dhis2.mapped_org_units} org units &middot; {dhis2.mapped_data_elements} data elements
          </span>
        </motion.div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Building2, title: 'Total Facilities', value: facilities.length, sub: `Across ${districts.length} districts`, bg: 'bg-blue-50 dark:bg-blue-900/20', fg: 'text-blue-600 dark:text-blue-400', link: '/facilities' },
          { icon: AlertTriangle, title: 'Critical Stock', value: critical, sub: critical > 0 ? 'Need immediate action' : 'All clear', bg: 'bg-red-50 dark:bg-red-900/20', fg: 'text-red-600 dark:text-red-400', link: '/coordination' },
          { icon: CheckCircle, title: 'Healthy', value: healthy, sub: 'Stock within range', bg: 'bg-green-50 dark:bg-green-900/20', fg: 'text-green-600 dark:text-green-400', link: '/stock' },
          { icon: TrendingUp, title: 'Transfer Alerts', value: alerts.length, sub: 'Open recommendations', bg: 'bg-yellow-50 dark:bg-yellow-900/20', fg: 'text-yellow-600 dark:text-yellow-400', link: '/coordination' },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            onClick={() => navigate(card.link)}
            className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</h3>
              <div className={`p-2 rounded-lg ${card.bg} ${card.fg}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              {card.sub}
              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </motion.div>
        ))}
      </div>

      {/* Two-column: Alerts + District Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              Recent Transfer Alerts
            </h2>
            <button
              onClick={() => navigate('/coordination')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              View All
            </button>
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-10 h-10 text-green-300 dark:text-green-800 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No active transfer alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.alert_id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{alert.item}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      <span className="text-green-700 dark:text-green-400">{alert.from_facility.name}</span>
                      <ArrowRight className="w-3 h-3 inline mx-1" />
                      <span className="text-red-700 dark:text-red-400">{alert.to_facility.name}</span>
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                    {alert.from_facility.distance_km} km
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* District Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              District Summary
            </h2>
            <button
              onClick={() => navigate('/facilities')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              View All
            </button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {districts.slice(0, 12).map((district) => {
              const distFacs = facilities.filter(f => f.district === district);
              const distCrit = distFacs.filter(f => f.status === 'CRITICAL').length;
              return (
                <div key={district} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{district}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{distFacs.length} facilities</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {distCrit > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                        {distCrit} critical
                      </span>
                    )}
                    <span className={`w-2.5 h-2.5 rounded-full ${distCrit > 0 ? 'bg-red-500' : 'bg-green-500'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: BarChart3, title: 'Stock Analytics', desc: 'View stock trends and forecasts', link: '/stock', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { icon: Database, title: 'DHIS2 Sync', desc: 'Manage data synchronization', link: '/dhis2', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { icon: Truck, title: 'Emergency Logistics', desc: 'Track deliveries and dispatches', link: '/logistics', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map((action, i) => (
          <motion.div
            key={action.title}
            custom={i + 4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            onClick={() => navigate(action.link)}
            className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className={`p-2.5 rounded-lg ${action.bg} ${action.color} w-fit mb-3`}>
              <action.icon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{action.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              {action.desc}
              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default OverviewDashboard;
