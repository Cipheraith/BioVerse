import React from 'react';
import { useAuth } from "./hooks/useAuth";
import AdminDashboard from './pages/AdminDashboard';
import PatientDashboard from './pages/PatientDashboard';
import HealthWorkerDashboard from './pages/HealthWorkerDashboard';
import MinistryDashboard from './pages/MinistryDashboard';
import PharmacyPanel from './pages/PharmacyPanel';
import AmbulanceDriverDashboard from './pages/AmbulanceDriverDashboard';

const Dashboard: React.FC = () => {
  const { role } = useAuth();

  switch (role) {
    case 'admin':
      return <AdminDashboard />;
    case 'moh':
      return <MinistryDashboard />;
    case 'health_worker':
      return <HealthWorkerDashboard />;
    case 'patient':
      return <PatientDashboard />;
    case 'pharmacy':
      return <PharmacyPanel />;
    case 'ambulance_driver':
      return <AmbulanceDriverDashboard />;
    default:
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background dark:bg-dark-background p-4">
          <h2 className="text-2xl font-bold mb-4 text-text dark:text-dark-text">Access Denied</h2>
          <p className="text-muted dark:text-dark-muted">Unknown or invalid user role: {role}</p>
          <p className="text-sm text-muted dark:text-dark-muted mt-2">Please contact your administrator for assistance.</p>
        </div>
      );
  }
};

export default Dashboard;