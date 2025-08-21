import React, { useState, useEffect } from 'react';

interface PregnancyData {
  id: string;
  patientId: string;
  estimatedDueDate: string;
  healthStatus: string;
  alerts: string[];
  transportBooked: boolean;
}

interface MaternalHealthProps {
  patientId: string;
}

const MaternalHealth: React.FC<MaternalHealthProps> = ({ patientId }) => {
  const [pregnancy, setPregnancy] = useState<PregnancyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPregnancyData = async () => {
      try {
                const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found.');
          return;
        }

        const response = await fetch(`${process.env.VITE_API_BASE_URL}/api/patients/${patientId}/pregnancy`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('No pregnancy record found for this patient.');
        }
        const data = await response.json();
        setPregnancy(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      }
    };

    fetchPregnancyData();
  }, [patientId]);

  if (error) {
    return <div className="text-destructive dark:text-destructive-400">{error}</div>;
  }

  if (!pregnancy) {
    return <div className="text-text dark:text-dark-text">Loading pregnancy data...</div>;
  }

  return (
    <div className="p-4 bg-card rounded-lg shadow-md border border-border dark:bg-dark-card dark:border-dark-border dark:text-dark-text">
      <h3 className="text-xl font-bold mb-2 text-primary-700 dark:text-primary-300">Maternal Health Status</h3>
      <p className="text-text dark:text-dark-text"><strong>Estimated Due Date:</strong> {pregnancy.estimatedDueDate}</p>
      <p className="text-text dark:text-dark-text"><strong>Health Status:</strong> {pregnancy.healthStatus}</p>
      <p className="text-text dark:text-dark-text"><strong>Transport Booked:</strong> {pregnancy.transportBooked ? 'Yes' : 'No'}</p>
      <div>
        <strong className="text-text dark:text-dark-text">Alerts:</strong>
        <ul>
          {pregnancy.alerts.map((alert, index) => (
            <li key={index} className="text-destructive dark:text-destructive-400">{alert}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MaternalHealth;
