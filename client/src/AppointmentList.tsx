import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: string;
  notes: string;
}

const AppointmentList: React.FC = () => {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.VITE_API_BASE_URL}/api/appointments`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Appointment[] = await response.json();
        setAppointments(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) {
    return <div className="text-center text-text dark:text-dark-text">{t('loading_appointments')}</div>;
  }

  if (error) {
    return <div className="text-center text-destructive dark:text-dark-destructive">{t('error_loading_appointments', { error })}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-8 text-text dark:text-dark-text">Appointments</h1>
      <div className="bg-card dark:bg-dark-card rounded-lg shadow-md border border-border dark:border-dark-border">
        {appointments.length === 0 ? (
          <p className="p-6 text-muted dark:text-dark-muted">{t('no_appointments_found')}</p>
        ) : (
          <ul className="divide-y divide-border dark:divide-dark-border">
            {appointments.map((appointment) => (
              <li key={appointment.id} className="p-4">
                <p className="font-semibold text-lg text-text dark:text-dark-text">{appointment.patientName}</p>
                <p className="text-muted dark:text-dark-muted">{appointment.type}</p>
                <div className="flex justify-between items-center mt-2 text-sm">
                  <p className="text-text dark:text-dark-text">{appointment.date} at {appointment.time}</p>
                  <p className="text-primary dark:text-primary-300 font-semibold">Upcoming</p>
                </div>
                {appointment.notes && <p className="mt-2 text-sm text-text dark:text-dark-text">Notes: {appointment.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
};

export default AppointmentList;