import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, 
  Calendar, 
  Monitor, 
  Users, 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Settings,
  BarChart3,
  Stethoscope,
  Brain
} from 'lucide-react';
import axios from 'axios';

// Session features for telemedicine consultations
interface SessionFeatures {
  videoQuality?: 'hd' | 'sd' | 'auto';
  audioSettings?: {
    noiseCancellation: boolean;
    echoCancellation: boolean;
  };
  screenSharing?: boolean;
  recording?: boolean;
  chatEnabled?: boolean;
  aiTranscription?: boolean;
}

// Data stream for monitoring sessions
interface DataStream {
  id: string;
  type: 'vitals' | 'wearable' | 'environmental' | 'manual';
  source: string;
  lastUpdate: string;
  status: 'active' | 'inactive' | 'error';
  data: Record<string, unknown>;
}

// Alert for monitoring sessions
interface MonitoringAlert {
  id: string;
  type: 'threshold_exceeded' | 'device_offline' | 'data_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface Consultation {
  id: number;
  patientId: number;
  doctorId: number;
  scheduledDateTime: string;
  consultationType?: string;
  status?: string;
  symptoms?: string[] | string;
  preferredLanguage?: string;
  sessionFeatures?: SessionFeatures;
}

interface MonitoringSession {
  id: number;
  patientId: number;
  monitoringType: string;
  status: string;
  startTime: string;
  dataStreams: DataStream[];
  alerts: MonitoringAlert[];
}

const TelemedicineDashboard: React.FC = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [monitoringSessions, setMonitoringSessions] = useState<MonitoringSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('consultations');
  const [stats, setStats] = useState({
    totalConsultations: 0,
    activeMonitoring: 0,
    completedToday: 0,
    upcomingToday: 0
  });

  const fetchTelemedicineData = useCallback(async () => {
    try {
      setLoading(true);
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      
      const [consultationsResponse, monitoringResponse] = await Promise.all([
        axios.get(`${baseURL}/api/telemedicine/consultations?limit=20`),
        axios.get(`${baseURL}/api/telemedicine/monitoring/sessions?limit=10`)
      ]);

      setConsultations(consultationsResponse.data.consultations || []);
      setMonitoringSessions(monitoringResponse.data.sessions || []);

      // Calculate stats
      const today = new Date().toDateString();
      const upcomingToday = consultationsResponse.data.consultations?.filter((c: Consultation) => 
        new Date(c.scheduledDateTime).toDateString() === today && 
        c.status && ['scheduled', 'confirmed'].includes(c.status)
      ).length || 0;

      const completedToday = consultationsResponse.data.consultations?.filter((c: Consultation) => 
        new Date(c.scheduledDateTime).toDateString() === today && 
        c.status === 'completed'
      ).length || 0;

      setStats({
        totalConsultations: consultationsResponse.data.consultations?.length || 0,
        activeMonitoring: monitoringSessions.length,
        completedToday,
        upcomingToday
      });

    } catch (error) {
      console.error('Error fetching telemedicine data:', error);
    } finally {
      setLoading(false);
    }
  }, [monitoringSessions.length]);

  useEffect(() => {
    fetchTelemedicineData();
  }, [fetchTelemedicineData]);

  const startConsultation = async (consultationId: number) => {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await axios.post(
        `${baseURL}/api/telemedicine/consultations/${consultationId}/start`,
        {
          deviceInfo: {
            camera: true,
            microphone: true,
            screenSharing: true
          },
          environmentalSensors: {}
        }
      );

      // In a real implementation, this would redirect to the video call interface
      alert('Consultation session started! Redirecting to video call...');
      console.log('Session started:', response.data);
      
    } catch (error) {
      console.error('Error starting consultation:', error);
      alert('Failed to start consultation. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return 'text-blue-600 bg-blue-100';
      case 'active':
      case 'in-progress':
        return 'text-green-600 bg-green-100';
      case 'completed':
        return 'text-gray-600 bg-gray-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }: {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    title: string;
    value: number;
    color: string;
  }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 w-full"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 break-words">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">{value}</p>
        </div>
        <div className={`p-2 sm:p-3 rounded-full ${color} flex-shrink-0 ml-2`}>
          <Icon size={20} className="sm:w-6 sm:h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex flex-col sm:flex-row items-start sm:items-center">
            <Video className="mb-2 sm:mb-0 sm:mr-4 text-primary-600" size={32} />
            <span className="break-words">Telemedicine Dashboard</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400">
            Advanced Virtual Healthcare & Remote Monitoring
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Calendar}
            title="Upcoming Today"
            value={stats.upcomingToday}
            color="bg-blue-500"
          />
          <StatCard
            icon={CheckCircle}
            title="Completed Today"
            value={stats.completedToday}
            color="bg-green-500"
          />
          <StatCard
            icon={Monitor}
            title="Active Monitoring"
            value={stats.activeMonitoring}
            color="bg-purple-500"
          />
          <StatCard
            icon={Activity}
            title="Total Consultations"
            value={stats.totalConsultations}
            color="bg-orange-500"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex overflow-x-auto scrollbar-hide">
              {[
                { id: 'consultations', name: 'Consultations', shortName: 'Consults', icon: Video },
                { id: 'monitoring', name: 'Monitoring', shortName: 'Monitor', icon: Monitor },
                { id: 'ai-insights', name: 'AI Insights', shortName: 'AI', icon: Brain },
                { id: 'analytics', name: 'Analytics', shortName: 'Reports', icon: BarChart3 }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-3 sm:py-4 px-3 sm:px-6 border-b-2 font-medium text-xs sm:text-sm flex items-center flex-shrink-0`}
                  >
                    <Icon size={16} className="sm:w-[18px] sm:h-[18px] mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{tab.name}</span>
                    <span className="sm:hidden">{tab.shortName}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Virtual Consultations Tab */}
            {activeTab === 'consultations' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Virtual Consultations
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center"
                    onClick={() => {
                      // In a real implementation, this would open a scheduling modal
                  	// Handle scheduling logic here
                  	console.log('Open scheduling modal');
                    }}
                  >
                    <Calendar size={18} className="mr-2" />
                    Schedule New
                  </motion.button>
                </div>

                <div className="grid gap-4">
                  {consultations.length > 0 ? consultations.map((consultation) => (
                    <motion.div
                      key={consultation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-3">
                            <div className="flex items-center">
                              <Stethoscope size={18} className="text-primary-600 mr-2" />
                              <span className="font-medium text-gray-900 dark:text-white">
                                {consultation.consultationType ? 
                                  consultation.consultationType.charAt(0).toUpperCase() + 
                                  consultation.consultationType.slice(1) : 'General'} Consultation
                              </span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
                              {consultation.status ? 
                                consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1) : 'Unknown'}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-6">
                            <div className="flex items-center">
                              <Clock size={16} className="mr-2" />
                              {new Date(consultation.scheduledDateTime).toLocaleString()}
                            </div>
                            <div className="flex items-center">
                              <Users size={16} className="mr-2" />
                              Patient #{consultation.patientId}
                            </div>
                            {consultation.symptoms && consultation.symptoms.length > 0 && (
                              <div className="flex items-center">
                                <AlertCircle size={16} className="mr-2" />
                                {Array.isArray(consultation.symptoms) ? consultation.symptoms.join(', ') : consultation.symptoms}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {consultation.status === 'scheduled' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => startConsultation(consultation.id)}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center"
                            >
                              <Video size={16} className="mr-2" />
                              Start Call
                            </motion.button>
                          )}
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-gray-600 dark:text-gray-400 hover:text-primary-600 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <Settings size={18} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="text-center py-12">
                      <Video size={64} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                        No consultations scheduled
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Schedule your first virtual consultation to get started.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Remote Monitoring Tab */}
            {activeTab === 'monitoring' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Remote Patient Monitoring
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center"
                  >
                    <Monitor size={18} className="mr-2" />
                    Setup Monitoring
                  </motion.button>
                </div>

                <div className="text-center py-12">
                  <Monitor size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    Remote monitoring coming soon
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Advanced patient monitoring with real-time health data analysis.
                  </p>
                </div>
              </motion.div>
            )}

            {/* AI Insights Tab */}
            {activeTab === 'ai-insights' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    AI-Powered Insights
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center"
                  >
                    <Brain size={18} className="mr-2" />
                    Generate Insights
                  </motion.button>
                </div>

                <div className="text-center py-12">
                  <Brain size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    AI insights processing
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Advanced AI diagnostic support and predictive analytics.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Telemedicine Analytics
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center"
                  >
                    <BarChart3 size={18} className="mr-2" />
                    Generate Report
                  </motion.button>
                </div>

                <div className="text-center py-12">
                  <BarChart3 size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    Analytics dashboard
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Comprehensive performance metrics and outcome tracking.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelemedicineDashboard;
