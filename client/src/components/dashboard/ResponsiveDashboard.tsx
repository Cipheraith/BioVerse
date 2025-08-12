import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import AdminDashboard from '../../pages/AdminDashboard';
import PatientDashboard from '../../pages/PatientDashboard';
import HealthWorkerDashboard from '../../pages/HealthWorkerDashboard';
import AmbulanceDriverDashboard from '../../pages/AmbulanceDriverDashboard';
import MinistryDashboard from '../../pages/MinistryDashboard';
import TelemedicineDashboard from '../../pages/TelemedicineDashboard';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ResponsiveDashboardProps {
  className?: string;
}

const ResponsiveDashboard: React.FC<ResponsiveDashboardProps> = ({ className = '' }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen size="xl" color="blue" text="Loading Dashboard..." />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-400">Please log in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'patient':
        return <PatientDashboard />;
      case 'health_worker':
        return <HealthWorkerDashboard />;
      case 'ambulance_driver':
        return <AmbulanceDriverDashboard />;
      case 'moh':
        return <MinistryDashboard />;
      case 'pharmacy':
        return <TelemedicineDashboard />; // Placeholder - create PharmacyDashboard later
      default:
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Dashboard Not Available</h2>
              <p className="text-gray-400">Dashboard for role "{user.role}" is not yet implemented.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div
      className={`w-full ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {renderDashboard()}
    </motion.div>
  );
};

export default ResponsiveDashboard;