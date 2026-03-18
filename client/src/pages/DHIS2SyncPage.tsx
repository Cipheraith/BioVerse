import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Database, RefreshCw, CheckCircle, XCircle, Clock,
  Wifi, WifiOff, Download, History
} from 'lucide-react';
import {
  coordinationService,
  DHIS2Status,
} from '../services/coordinationService';

const DHIS2SyncPage: React.FC = () => {
  const [status, setStatus] = useState<DHIS2Status | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{ ok: boolean; version: string | null; error: string | null } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [s, h] = await Promise.all([
        coordinationService.getDHIS2Status().catch(() => null),
        coordinationService.getSyncHistory().catch(() => []),
      ]);
      setStatus(s);
      setHistory(h);
    } catch { /* empty */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleTestConnection = async () => {
    setTesting(true);
    setConnectionResult(null);
    try {
      const result = await coordinationService.testDHIS2Connection();
      setConnectionResult(result);
    } catch (err: any) {
      setConnectionResult({ ok: false, version: null, error: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleFullSync = async () => {
    setSyncing(true);
    try {
      await coordinationService.triggerFullSync();
      await fetchData();
    } catch { /* empty */ } finally {
      setSyncing(false);
    }
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
            <Database className="w-6 h-6 text-blue-600" />
            DHIS2 Integration
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage data synchronization with the national DHIS2 instance
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Wifi className={`w-4 h-4 ${testing ? 'animate-pulse' : ''}`} />
            Test Connection
          </button>
          <button
            onClick={handleFullSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Run Full Sync'}
          </button>
        </div>
      </div>

      {/* Connection Test Result */}
      {connectionResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm ${
            connectionResult.ok
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
          }`}
        >
          {connectionResult.ok ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {connectionResult.ok
            ? `Connected successfully — DHIS2 v${connectionResult.version}`
            : `Connection failed: ${connectionResult.error}`
          }
        </motion.div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Connection */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Connection</span>
            {status?.connection.ok ? (
              <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-600 dark:text-red-400" />
            )}
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {status?.connection.ok ? 'Active' : 'Disconnected'}
          </p>
          {status?.connection.version && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">v{status.connection.version}</p>
          )}
        </div>

        {/* Org Units */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Org Units</span>
            <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{status?.mapped_org_units || 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Mapped from DHIS2</p>
        </div>

        {/* Data Elements */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Data Elements</span>
            <Download className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{status?.mapped_data_elements || 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tracked indicators</p>
        </div>

        {/* Last Sync */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Last Sync</span>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          {status?.last_sync ? (
            <>
              <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">{status.last_sync.status}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {new Date(status.last_sync.started_at).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {status.last_sync.records_processed} records processed
              </p>
            </>
          ) : (
            <p className="text-lg font-bold text-gray-500 dark:text-gray-400">Never</p>
          )}
        </div>
      </div>

      {/* DHIS2 URL */}
      {status?.dhis2_url && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">DHIS2 Instance</h3>
          <p className="text-sm font-mono text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
            {status.dhis2_url}
          </p>
        </div>
      )}

      {/* Sync History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
      >
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <History className="w-4 h-4 text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Sync History</h2>
        </div>
        {history.length === 0 ? (
          <div className="py-12 text-center">
            <Database className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No sync history yet. Run your first sync above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Status</th>
                  <th className="text-right py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Records</th>
                  <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Started</th>
                  <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Completed</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 20).map((h: any, i: number) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white capitalize">{h.sync_type?.replace('_', ' ')}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                        h.status === 'completed'
                          ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                          : h.status === 'failed'
                          ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
                      }`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">{h.records_processed || 0}</td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">{h.started_at ? new Date(h.started_at).toLocaleString() : '—'}</td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">{h.completed_at ? new Date(h.completed_at).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DHIS2SyncPage;
