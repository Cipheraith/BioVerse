import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
}

const PatientList: React.FC = () => {
  const { t } = useTranslation();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch(`${process.env.VITE_API_BASE_URL}/api/patients`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data: Patient[] = await response.json();
        setPatients(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  if (loading) {
    return <div className="text-center text-text dark:text-dark-text">{t('loading_patients')}</div>;
  }

  if (error) {
    return <div className="text-center text-destructive dark:text-dark-destructive">{t('error_loading_patients', { error })}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-text dark:text-dark-text">Patients</h1>
        <Link
          to="/patients/add" // Assuming a route to add patients
          className="bg-primary hover:bg-primary-700 text-primary-text font-bold py-2 px-4 rounded-lg transition-all duration-300"
        >
          Add Patient
        </Link>
      </div>

      <div className="bg-card dark:bg-dark-card rounded-lg shadow-md border border-border dark:border-dark-border">
        <ul className="divide-y divide-border dark:divide-dark-border">
          {patients.map((patient) => (
            <motion.li
              key={patient.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Link
                to={`/patients/${patient.id}`}
                className="flex items-center justify-between p-4 hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center font-bold text-primary dark:text-primary-300">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-text dark:text-dark-text">{patient.name}</p>
                    <p className="text-sm text-muted dark:text-dark-muted">
                      {patient.age} {t('years_old')}, {patient.gender}
                    </p>
                  </div>
                </div>
                <ChevronRight className="text-muted dark:text-dark-muted" />
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default PatientList;