import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList, Package, ArrowRight, AlertTriangle, RefreshCw,
  Plus, Heart, Send, UserPlus
} from 'lucide-react';
import { personaDashboardService, HealthWorkerDashboard } from '../services/personaDashboardService';

const card = 'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm';
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const input = 'w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white';

type ActiveForm = null | 'intake' | 'referral' | 'stock';

export default function HealthWorkerDashboardPage() {
  const [data, setData] = useState<HealthWorkerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeForm, setActiveForm] = useState<ActiveForm>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const d = await personaDashboardService.getHealthWorker();
      setData(d);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Health Worker Portal</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Stock updates, patient intake & care referrals</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors w-fit">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </motion.div>

      {/* Success Toast */}
      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-lg text-sm font-medium">
          {successMsg}
        </motion.div>
      )}

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: 'intake' as const, label: 'Patient Intake', desc: 'Record new patient visit', icon: UserPlus, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:border-blue-400' },
          { id: 'referral' as const, label: 'Care Referral', desc: 'Refer patient to another facility', icon: Send, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:border-purple-400' },
          { id: 'stock' as const, label: 'Stock Update', desc: 'Update inventory levels', icon: Package, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400' },
        ].map(action => (
          <motion.button key={action.id} {...fadeUp}
            onClick={() => setActiveForm(activeForm === action.id ? null : action.id)}
            className={`${card} p-5 text-left border-2 transition-all ${
              activeForm === action.id ? action.color : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
            }`}>
            <div className={`inline-flex p-2.5 rounded-lg ${action.color.split(' ').slice(0, 2).join(' ')} mb-3`}>
              <action.icon className="w-5 h-5" />
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{action.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{action.desc}</p>
          </motion.button>
        ))}
      </div>

      {/* Active Form */}
      {activeForm === 'intake' && data && (
        <PatientIntakeForm
          facilities={data.facilities}
          onSubmit={async (formData) => {
            setSubmitting(true);
            try {
              await personaDashboardService.submitPatientIntake(formData);
              showSuccess('Patient intake recorded successfully');
              setActiveForm(null);
              load();
            } catch { /* handled */ }
            setSubmitting(false);
          }}
          submitting={submitting}
        />
      )}
      {activeForm === 'referral' && data && (
        <ReferralForm
          facilities={data.facilities}
          onSubmit={async (formData) => {
            setSubmitting(true);
            try {
              await personaDashboardService.submitReferral(formData);
              showSuccess('Referral submitted successfully');
              setActiveForm(null);
              load();
            } catch { /* handled */ }
            setSubmitting(false);
          }}
          submitting={submitting}
        />
      )}
      {activeForm === 'stock' && data && (
        <StockUpdateForm
          facilities={data.facilities}
          items={data.inventory_items}
          onSubmit={async (formData) => {
            setSubmitting(true);
            try {
              await personaDashboardService.submitStockUpdate(formData);
              showSuccess('Stock updated successfully');
              setActiveForm(null);
              load();
            } catch { /* handled */ }
            setSubmitting(false);
          }}
          submitting={submitting}
        />
      )}

      {loading ? <LoadingSkeleton /> : data && (
        <>
          {/* Critical Stock Alerts */}
          <motion.div {...fadeUp} transition={{ delay: 0.2 }} className={`${card} p-6`}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Low Stock Alerts
            </h2>
            {data.low_stock_alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Heart className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
                <p className="text-sm">All stock levels healthy</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-200 dark:border-gray-700">
                      <th className="py-2 pr-3">Facility</th>
                      <th className="py-2 pr-3">Item</th>
                      <th className="py-2 pr-3 text-center">Stock</th>
                      <th className="py-2 text-center">Days Left</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {data.low_stock_alerts.slice(0, 15).map((a: any, i: number) => (
                      <tr key={i} className="hover:bg-red-50 dark:hover:bg-red-900/10">
                        <td className="py-2.5 pr-3">
                          <p className="font-medium text-gray-900 dark:text-white truncate max-w-[180px]">{a.facility_name}</p>
                          <p className="text-xs text-gray-400">{a.district}</p>
                        </td>
                        <td className="py-2.5 pr-3 text-gray-700 dark:text-gray-300">{a.item_name}</td>
                        <td className="py-2.5 pr-3 text-center text-red-600 font-semibold">{a.current_stock}</td>
                        <td className="py-2.5 text-center">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            {a.days_of_supply ? `${a.days_of_supply}d` : '< 1d'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Two-Column: Recent Intake + Pending Referrals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div {...fadeUp} transition={{ delay: 0.25 }} className={`${card} p-6`}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-600" /> Recent Patient Intake
              </h2>
              <div className="space-y-2 overflow-y-auto max-h-[350px]">
                {data.recent_intake.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No records yet. Use the form above to record a patient visit.</p>
                ) : data.recent_intake.map((log: any) => (
                  <div key={log.id} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{log.patient_name}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        log.triage_level === 'EMERGENCY' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : log.triage_level === 'URGENT' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}>{log.triage_level}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{log.symptoms}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {log.facility_name} • {log.age ? `${log.age}y ` : ''}{log.gender || ''}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...fadeUp} transition={{ delay: 0.3 }} className={`${card} p-6`}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-purple-600" /> Pending Referrals
              </h2>
              <div className="space-y-2 overflow-y-auto max-h-[350px]">
                {data.pending_referrals.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No pending referrals</p>
                ) : data.pending_referrals.map((ref: any) => (
                  <div key={ref.id} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{ref.patient_name}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        ref.urgency === 'EMERGENCY' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : ref.urgency === 'URGENT' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}>{ref.urgency}</span>
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
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Forms ─────────────────────────────────────── */

function PatientIntakeForm({ facilities, onSubmit, submitting }: { facilities: any[]; onSubmit: (d: any) => void; submitting: boolean }) {
  const [form, setForm] = useState({ facility_id: facilities[0]?.id || 0, patient_name: '', age: '', gender: '', symptoms: '', triage_level: 'STANDARD', notes: '' });
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <motion.div {...fadeUp} className={`${card} p-6`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <UserPlus className="w-5 h-5 text-blue-600" /> New Patient Intake
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Facility *</label>
          <select value={form.facility_id} onChange={e => set('facility_id', parseInt(e.target.value))} className={input}>
            {facilities.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Patient Name *</label>
          <input type="text" value={form.patient_name} onChange={e => set('patient_name', e.target.value)} className={input} placeholder="Full name" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Age</label>
          <input type="number" value={form.age} onChange={e => set('age', e.target.value)} className={input} placeholder="Age" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Gender</label>
          <select value={form.gender} onChange={e => set('gender', e.target.value)} className={input}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Symptoms *</label>
          <textarea value={form.symptoms} onChange={e => set('symptoms', e.target.value)} className={`${input} h-20 resize-none`} placeholder="Describe symptoms..." />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Triage Level</label>
          <select value={form.triage_level} onChange={e => set('triage_level', e.target.value)} className={input}>
            <option value="EMERGENCY">Emergency</option>
            <option value="URGENT">Urgent</option>
            <option value="STANDARD">Standard</option>
            <option value="NON_URGENT">Non-Urgent</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
          <input type="text" value={form.notes} onChange={e => set('notes', e.target.value)} className={input} placeholder="Additional notes" />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => onSubmit({ ...form, age: form.age ? parseInt(form.age) : undefined })}
          disabled={submitting || !form.patient_name || !form.symptoms}
          className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
          {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Record Intake
        </button>
      </div>
    </motion.div>
  );
}

function ReferralForm({ facilities, onSubmit, submitting }: { facilities: any[]; onSubmit: (d: any) => void; submitting: boolean }) {
  const [form, setForm] = useState({ from_facility_id: facilities[0]?.id || 0, to_facility_id: facilities[1]?.id || 0, patient_name: '', reason: '', urgency: 'ROUTINE', notes: '' });
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <motion.div {...fadeUp} className={`${card} p-6`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Send className="w-5 h-5 text-purple-600" /> New Care Referral
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">From Facility *</label>
          <select value={form.from_facility_id} onChange={e => set('from_facility_id', parseInt(e.target.value))} className={input}>
            {facilities.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">To Facility *</label>
          <select value={form.to_facility_id} onChange={e => set('to_facility_id', parseInt(e.target.value))} className={input}>
            {facilities.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Patient Name *</label>
          <input type="text" value={form.patient_name} onChange={e => set('patient_name', e.target.value)} className={input} placeholder="Full name" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Urgency</label>
          <select value={form.urgency} onChange={e => set('urgency', e.target.value)} className={input}>
            <option value="EMERGENCY">Emergency</option>
            <option value="URGENT">Urgent</option>
            <option value="ROUTINE">Routine</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Reason for Referral *</label>
          <textarea value={form.reason} onChange={e => set('reason', e.target.value)} className={`${input} h-20 resize-none`} placeholder="Why is this referral needed..." />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => onSubmit(form)}
          disabled={submitting || !form.patient_name || !form.reason}
          className="px-6 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
          {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Submit Referral
        </button>
      </div>
    </motion.div>
  );
}

function StockUpdateForm({ facilities, items, onSubmit, submitting }: { facilities: any[]; items: any[]; onSubmit: (d: any) => void; submitting: boolean }) {
  const [form, setForm] = useState({ facility_id: facilities[0]?.id || 0, item_id: items[0]?.id || 0, new_stock: '' });
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <motion.div {...fadeUp} className={`${card} p-6`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-emerald-600" /> Update Stock Level
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Facility *</label>
          <select value={form.facility_id} onChange={e => set('facility_id', parseInt(e.target.value))} className={input}>
            {facilities.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Item *</label>
          <select value={form.item_id} onChange={e => set('item_id', parseInt(e.target.value))} className={input}>
            {items.map((item: any) => <option key={item.id} value={item.id}>{item.item_name} ({item.unit_of_measure})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">New Stock Level *</label>
          <input type="number" value={form.new_stock} onChange={e => set('new_stock', e.target.value)} className={input} placeholder="Quantity" min="0" />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => onSubmit({ ...form, new_stock: parseInt(form.new_stock) })}
          disabled={submitting || !form.new_stock}
          className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
          {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
          Update Stock
        </button>
      </div>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    </div>
  );
}
