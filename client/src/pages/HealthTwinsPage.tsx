import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, User, Users, Shield, Search, Filter } from 'lucide-react';
import HealthTwinDashboard from '../components/HealthTwin/HealthTwinDashboard';
import { useAuth } from '../hooks/useAuth';

const HealthTwinsPage: React.FC = () => {
  const { role, userId } = useAuth();
  const [selectedPatientId, setSelectedPatientId] = useState<string>(userId || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [patients] = useState([
    // Mock patient data - in real app, this would come from an API
    { id: '1', name: 'John Doe', age: 35, healthScore: 85 },
    { id: '2', name: 'Jane Smith', age: 28, healthScore: 92 },
    { id: '3', name: 'Bob Johnson', age: 45, healthScore: 68 },
  ]);

  // Determine view permissions based on role
  const getViewPermissions = () => {
    switch (role) {
      case 'admin':
      case 'moh':
        return {
          canViewAll: true,
          canEdit: true,
          viewType: 'admin' as const,
          title: 'Health Twin Management Dashboard',
          subtitle: 'View and manage digital health twins for all patients'
        };
      case 'health_worker':
      case 'doctor':
        return {
          canViewAll: true,
          canEdit: false,
          viewType: 'health_worker' as const,
          title: 'Patient Health Twins',
          subtitle: 'Monitor and analyze patient health data'
        };
      case 'patient':
        return {
          canViewAll: false,
          canEdit: false,
          viewType: 'patient' as const,
          title: 'My Digital Health Twin',
          subtitle: 'View your personalized health visualization'
        };
      default:
        return {
          canViewAll: false,
          canEdit: false,
          viewType: 'patient' as const,
          title: 'Health Twin',
          subtitle: 'Digital health visualization'
        };
    }
  };

  const permissions = getViewPermissions();
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!role || !userId) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <Heart className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          Access Required
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
          Please log in to access your Digital Health Twin. This secure portal provides 
          personalized health insights and 3D visualization of your health data.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
          Go to Login
        </button>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Heart className="h-8 w-8 text-red-500" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {permissions.title}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {permissions.subtitle}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Role indicator */}
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full">
              {role === 'admin' || role === 'moh' ? (
                <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              ) : role === 'health_worker' || role === 'doctor' ? (
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              )}
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400 capitalize">
                {role?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Patient Selection for Healthcare Workers and Admins */}
        {permissions.canViewAll && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Select Patient
              </h3>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              
              {/* Patient Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPatients.map((patient) => (
                  <motion.button
                    key={patient.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedPatientId(patient.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedPatientId === patient.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {patient.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Age: {patient.age}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {patient.healthScore}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Health Score
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Health Twin Dashboard */}
        {selectedPatientId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <HealthTwinDashboard 
              patientId={selectedPatientId} 
              view={permissions.viewType}
              allowUpdates={permissions.canEdit}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HealthTwinsPage;

