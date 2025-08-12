import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Brain,
  Sparkles,
  Zap,
  Heart,
  Phone
} from 'lucide-react';
import ApiService from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import FloatingParticles from '../components/ui/FloatingParticles';
import LoadingSpinner from '../components/ui/LoadingSpinner';

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
      const [consultationsResponse, monitoringResponse] = await Promise.all([
        ApiService.get('/api/telemedicine/consultations?limit=20'),
        ApiService.get('/api/telemedicine/monitoring/sessions?limit=10')
      ]);

      setConsultations(consultationsResponse.consultations || []);
      setMonitoringSessions(monitoringResponse.sessions || []);

      // Calculate stats
      const today = new Date().toDateString();
      const upcomingToday = consultationsResponse.consultations?.filter((c: Consultation) => 
        new Date(c.scheduledDateTime).toDateString() === today && 
        c.status && ['scheduled', 'confirmed'].includes(c.status)
      ).length || 0;

      const completedToday = consultationsResponse.consultations?.filter((c: Consultation) => 
        new Date(c.scheduledDateTime).toDateString() === today && 
        c.status === 'completed'
      ).length || 0;

      setStats({
        totalConsultations: consultationsResponse.consultations?.length || 0,
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
      const response = await ApiService.post(
        `/api/telemedicine/consultations/${consultationId}/start`,
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

  const StatCard = ({ icon: Icon, title, value, gradient, pulse }: {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    title: string;
    value: number;
    gradient: 'blue' | 'purple' | 'cyan' | 'pink' | 'green' | 'orange';
    pulse?: boolean;
  }) => (
    <GlassCard gradient={gradient} glow hover className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-300 mb-2">{title}</p>
          <motion.p 
            className="text-3xl font-black text-white"
            animate={pulse ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {value}
          </motion.p>
        </div>
        <motion.div 
          className="p-4 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Icon size={28} className="text-white drop-shadow-lg" />
        </motion.div>
      </div>
      
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl" />
      <motion.div
        className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-white/10 to-transparent rounded-full"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </GlassCard>
  );

  if (loading) {
    return <LoadingSpinner fullScreen size="xl" color="cyan" text="Loading Telemedicine Dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      <FloatingParticles count={30} colors={['cyan', 'blue', 'purple']} />
      
      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto w-full">
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <motion.div
              className="inline-flex items-center bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-full px-6 py-2 mb-6"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-cyan-400 mr-2" />
              <span className="text-sm text-cyan-300 font-medium">Advanced Telemedicine Platform</span>
              <motion.div
                className="ml-2 w-2 h-2 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Telemedicine
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            
            <motion.p 
              className="text-xl text-gray-300 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Advanced Virtual Healthcare & Remote Monitoring Platform
            </motion.p>
          </motion.div>

          {/* Enhanced Stats Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, staggerChildren: 0.1 }}
          >
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
              <StatCard
                icon={Calendar}
                title="Upcoming Today"
                value={stats.upcomingToday}
                gradient="blue"
                pulse={stats.upcomingToday > 0}
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
              <StatCard
                icon={CheckCircle}
                title="Completed Today"
                value={stats.completedToday}
                gradient="green"
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}>
              <StatCard
                icon={Monitor}
                title="Active Monitoring"
                value={stats.activeMonitoring}
                gradient="purple"
                pulse={stats.activeMonitoring > 0}
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}>
              <StatCard
                icon={Activity}
                title="Total Consultations"
                value={stats.totalConsultations}
                gradient="orange"
              />
            </motion.div>
          </motion.div>

          {/* Enhanced Glass Tabs */}
          <GlassCard className="overflow-hidden" gradient="cyan">
            <div className="border-b border-white/10">
              <nav className="flex overflow-x-auto scrollbar-hide">
                {[
                  { id: 'consultations', name: 'Consultations', shortName: 'Consults', icon: Video, color: 'cyan' },
                  { id: 'monitoring', name: 'Monitoring', shortName: 'Monitor', icon: Monitor, color: 'purple' },
                  { id: 'ai-insights', name: 'AI Insights', shortName: 'AI', icon: Brain, color: 'pink' },
                  { id: 'analytics', name: 'Analytics', shortName: 'Reports', icon: BarChart3, color: 'orange' }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative py-4 px-6 font-semibold text-sm flex items-center space-x-2 transition-all duration-300 ${
                        isActive
                          ? 'text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg backdrop-blur-sm"
                          layoutId="activeTab"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <motion.div
                        className="relative z-10 flex items-center space-x-2"
                        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Icon size={18} />
                        <span className="hidden sm:inline">{tab.name}</span>
                        <span className="sm:hidden">{tab.shortName}</span>
                      </motion.div>
                    </motion.button>
                  );
                })}
              </nav>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {/* Virtual Consultations Tab */}
                {activeTab === 'consultations' && (
                  <motion.div
                    key="consultations"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                      <div>
                        <h3 className="text-3xl font-black text-white mb-2 flex items-center">
                          <Video className="mr-3 text-cyan-400" size={32} />
                          Virtual Consultations
                        </h3>
                        <p className="text-gray-400">Manage and conduct video consultations</p>
                      </div>
                      <GlassButton
                        variant="primary"
                        glow
                        icon={<Calendar size={18} />}
                        onClick={() => console.log('Open scheduling modal')}
                      >
                        Schedule New
                      </GlassButton>
                    </div>

                    <div className="grid gap-6">
                      {consultations.length > 0 ? consultations.map((consultation, index) => (
                        <motion.div
                          key={consultation.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <GlassCard gradient="blue" hover className="relative overflow-hidden">
                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                  <div className="flex items-center">
                                    <motion.div
                                      className="p-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl mr-3"
                                      animate={{ rotate: [0, 360] }}
                                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    >
                                      <Stethoscope size={20} className="text-cyan-400" />
                                    </motion.div>
                                    <span className="font-bold text-white text-lg">
                                      {consultation.consultationType ? 
                                        consultation.consultationType.charAt(0).toUpperCase() + 
                                        consultation.consultationType.slice(1) : 'General'} Consultation
                                    </span>
                                  </div>
                                  <motion.span 
                                    className={`px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm ${
                                      consultation.status === 'scheduled' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                      consultation.status === 'active' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                      consultation.status === 'completed' ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' :
                                      'bg-red-500/20 text-red-300 border border-red-500/30'
                                    }`}
                                    animate={{ scale: consultation.status === 'active' ? [1, 1.05, 1] : 1 }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  >
                                    {consultation.status ? 
                                      consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1) : 'Unknown'}
                                  </motion.span>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-300">
                                  <div className="flex items-center">
                                    <Clock size={16} className="mr-2 text-cyan-400" />
                                    <span className="text-sm">{new Date(consultation.scheduledDateTime).toLocaleString()}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Users size={16} className="mr-2 text-purple-400" />
                                    <span className="text-sm">Patient #{consultation.patientId}</span>
                                  </div>
                                  {consultation.symptoms && consultation.symptoms.length > 0 && (
                                    <div className="flex items-center">
                                      <AlertCircle size={16} className="mr-2 text-orange-400" />
                                      <span className="text-sm truncate">
                                        {Array.isArray(consultation.symptoms) ? consultation.symptoms.join(', ') : consultation.symptoms}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-3">
                                {consultation.status === 'scheduled' && (
                                  <GlassButton
                                    variant="success"
                                    glow
                                    icon={<Video size={16} />}
                                    onClick={() => startConsultation(consultation.id)}
                                  >
                                    Start Call
                                  </GlassButton>
                                )}
                                
                                <GlassButton
                                  variant="ghost"
                                  icon={<Settings size={16} />}
                                  onClick={() => console.log('Settings')}
                                />
                              </div>
                            </div>
                            
                            {/* Animated background elements */}
                            <motion.div
                              className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-full blur-2xl"
                              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                              transition={{ duration: 4, repeat: Infinity }}
                            />
                          </GlassCard>
                        </motion.div>
                      )) : (
                        <GlassCard gradient="blue" className="text-center py-16">
                          <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            <Video size={80} className="mx-auto text-cyan-400 mb-6" />
                          </motion.div>
                          <h3 className="text-2xl font-bold text-white mb-4">
                            No consultations scheduled
                          </h3>
                          <p className="text-gray-400 mb-6">
                            Schedule your first virtual consultation to get started.
                          </p>
                          <GlassButton
                            variant="primary"
                            glow
                            icon={<Calendar size={18} />}
                            onClick={() => console.log('Schedule consultation')}
                          >
                            Schedule Consultation
                          </GlassButton>
                        </GlassCard>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Remote Monitoring Tab */}
                {activeTab === 'monitoring' && (
                  <motion.div
                    key="monitoring"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                      <div>
                        <h3 className="text-3xl font-black text-white mb-2 flex items-center">
                          <Monitor className="mr-3 text-purple-400" size={32} />
                          Remote Patient Monitoring
                        </h3>
                        <p className="text-gray-400">Real-time health data monitoring and analysis</p>
                      </div>
                      <GlassButton
                        variant="secondary"
                        glow
                        icon={<Monitor size={18} />}
                        onClick={() => console.log('Setup monitoring')}
                      >
                        Setup Monitoring
                      </GlassButton>
                    </div>

                    <GlassCard gradient="purple" className="text-center py-16">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        <Monitor size={80} className="mx-auto text-purple-400 mb-6" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-white mb-4">
                        Remote Monitoring Platform
                      </h3>
                      <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                        Advanced patient monitoring with real-time health data analysis, 
                        IoT device integration, and predictive health alerts.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                        <div className="bg-white/5 rounded-xl p-4">
                          <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
                          <h4 className="text-white font-semibold">Vital Signs</h4>
                          <p className="text-gray-400 text-sm">Real-time monitoring</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                          <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
                          <h4 className="text-white font-semibold">Activity Tracking</h4>
                          <p className="text-gray-400 text-sm">24/7 health insights</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                          <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                          <h4 className="text-white font-semibold">Smart Alerts</h4>
                          <p className="text-gray-400 text-sm">Predictive notifications</p>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                )}

                {/* AI Insights Tab */}
                {activeTab === 'ai-insights' && (
                  <motion.div
                    key="ai-insights"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                      <div>
                        <h3 className="text-3xl font-black text-white mb-2 flex items-center">
                          <Brain className="mr-3 text-pink-400" size={32} />
                          AI-Powered Insights
                        </h3>
                        <p className="text-gray-400">Advanced diagnostic support and predictive analytics</p>
                      </div>
                      <GlassButton
                        variant="secondary"
                        glow
                        icon={<Brain size={18} />}
                        onClick={() => console.log('Generate insights')}
                      >
                        Generate Insights
                      </GlassButton>
                    </div>

                    <GlassCard gradient="pink" className="text-center py-16">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotateY: [0, 180, 360]
                        }}
                        transition={{ duration: 6, repeat: Infinity }}
                      >
                        <Brain size={80} className="mx-auto text-pink-400 mb-6" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-white mb-4">
                        AI Diagnostic Assistant
                      </h3>
                      <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                        Leverage advanced machine learning for diagnostic support, 
                        treatment recommendations, and predictive health analytics.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div className="bg-white/5 rounded-xl p-6 text-left">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mr-4">
                              <Brain className="w-6 h-6 text-pink-400" />
                            </div>
                            <h4 className="text-white font-bold">Diagnostic Support</h4>
                          </div>
                          <p className="text-gray-400 text-sm">AI-powered analysis of symptoms and medical history</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-6 text-left">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mr-4">
                              <Activity className="w-6 h-6 text-blue-400" />
                            </div>
                            <h4 className="text-white font-bold">Predictive Analytics</h4>
                          </div>
                          <p className="text-gray-400 text-sm">Forecast health risks and recommend preventive care</p>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                  <motion.div
                    key="analytics"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                      <div>
                        <h3 className="text-3xl font-black text-white mb-2 flex items-center">
                          <BarChart3 className="mr-3 text-orange-400" size={32} />
                          Telemedicine Analytics
                        </h3>
                        <p className="text-gray-400">Comprehensive performance metrics and outcome tracking</p>
                      </div>
                      <GlassButton
                        variant="warning"
                        glow
                        icon={<BarChart3 size={18} />}
                        onClick={() => console.log('Generate report')}
                      >
                        Generate Report
                      </GlassButton>
                    </div>

                    <GlassCard gradient="orange" className="text-center py-16">
                      <motion.div
                        animate={{ 
                          y: [0, -10, 0],
                          rotateX: [0, 10, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <BarChart3 size={80} className="mx-auto text-orange-400 mb-6" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-white mb-4">
                        Advanced Analytics Dashboard
                      </h3>
                      <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                        Comprehensive performance metrics, outcome tracking, and 
                        data-driven insights for optimal healthcare delivery.
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="text-2xl font-bold text-orange-400 mb-1">94%</div>
                          <div className="text-white text-sm font-semibold">Success Rate</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="text-2xl font-bold text-green-400 mb-1">2.3min</div>
                          <div className="text-white text-sm font-semibold">Avg Response</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="text-2xl font-bold text-blue-400 mb-1">4.8/5</div>
                          <div className="text-white text-sm font-semibold">Patient Rating</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="text-2xl font-bold text-purple-400 mb-1">1,247</div>
                          <div className="text-white text-sm font-semibold">Total Sessions</div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default TelemedicineDashboard;
