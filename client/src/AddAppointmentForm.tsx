import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const AddAppointmentForm: React.FC = () => {
  const { t } = useTranslation();
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('');
  const [notes, setNotes] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('loading');
    setMessage(null);

    try {
      const response = await fetch(`${process.env.VITE_API_BASE_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patientId, patientName, date, time, type, notes }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setMessage(t('appointment_add_success'));
        setPatientId('');
        setPatientName('');
        setDate('');
        setTime('');
        setType('');
        setNotes('');
      } else {
        const errorData = await response.json();
        setSubmitStatus('error');
        setMessage(t('appointment_add_error', { error: errorData.error || 'Unknown error' }));
      }
    } catch (e) {
      setSubmitStatus('error');
      setMessage(t('appointment_add_network_error', { error: e instanceof Error ? e.message : String(e) }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-8 text-text dark:text-dark-text">Add Appointment</h1>
      <div className="bg-card dark:bg-dark-card p-8 rounded-lg shadow-md border border-border dark:border-dark-border">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="patientId" className="block text-sm font-medium text-muted dark:text-dark-muted">{t('patient_id_label')}</label>
              <input
                type="text"
                id="patientId"
                className="mt-1 block w-full p-3 rounded-md bg-input dark:bg-dark-input border border-border dark:border-dark-border text-text dark:text-dark-text focus:ring-primary focus:border-primary"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="patientName" className="block text-sm font-medium text-muted dark:text-dark-muted">{t('patient_name_label')}</label>
              <input
                type="text"
                id="patientName"
                className="mt-1 block w-full p-3 rounded-md bg-input dark:bg-dark-input border border-border dark:border-dark-border text-text dark:text-dark-text focus:ring-primary focus:border-primary"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-muted dark:text-dark-muted">{t('appointment_date_label')}</label>
              <input
                type="date"
                id="date"
                className="mt-1 block w-full p-3 rounded-md bg-input dark:bg-dark-input border border-border dark:border-dark-border text-text dark:text-dark-text focus:ring-primary focus:border-primary"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-muted dark:text-dark-muted">{t('appointment_time_label')}</label>
              <input
                type="time"
                id="time"
                className="mt-1 block w-full p-3 rounded-md bg-input dark:bg-dark-input border border-border dark:border-dark-border text-text dark:text-dark-text focus:ring-primary focus:border-primary"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-muted dark:text-dark-muted">{t('appointment_type_label')}</label>
            <input
              type="text"
              id="type"
              className="mt-1 block w-full p-3 rounded-md bg-input dark:bg-dark-input border border-border dark:border-dark-border text-text dark:text-dark-text focus:ring-primary focus:border-primary"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder={t('appointment_type_placeholder')}
              required
            />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-muted dark:text-dark-muted">{t('appointment_notes_label')}</label>
            <textarea
              id="notes"
              rows={4}
              className="mt-1 block w-full p-3 rounded-md bg-input dark:bg-dark-input border border-border dark:border-dark-border text-text dark:text-dark-text focus:ring-primary focus:border-primary"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('appointment_notes_placeholder')}
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primary hover:bg-primary-700 text-primary-text font-bold py-3 px-6 rounded-lg transition-all duration-300"
              disabled={submitStatus === 'loading'}
            >
              {submitStatus === 'loading' ? t('adding_appointment') : t('add_appointment_button')}
            </button>
          </div>
        </form>
        {message && (
          <p className={`mt-4 text-center ${submitStatus === 'error' ? 'text-destructive' : 'text-success'}`}>
            {message}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default AddAppointmentForm;