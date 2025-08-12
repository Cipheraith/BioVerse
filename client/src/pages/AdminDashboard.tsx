import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, Calendar, Activity, AlertTriangle, TrendingUp, RefreshCw, Heart, Brain, Shield, Eye, Sparkles, Zap
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import FloatingParticles from '../components/ui/FloatingParticles';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, change }) => (
  <GlassCard gradient="blue" glow hover className="relative overflow-hidden">
    <div className="flex items-center justify-between mb-4">
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-300 mb-2">{title}</h3>
        <motion.p 
          className="text-3xl font-black text-white"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {value}
        </motion.p>
        <p className="text-sm text-gray-400 mt-1">{change}</p>
      </div>
      <motion.div 
        className="p-4 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <div className="text-white drop-shadow-lg">{icon}</div>
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

interface RecentActivity {
  type: 'patient' | 'symptomCheck' | 'appointment' | 'emergency';
  name?: string;
  patientId?: string;
  timestamp: string;
  severity?: string;
  location?: string;
  formattedTime?: string;
}

interface HealthTwinSummary {
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  healthScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: string;
  activeAlerts: number;
  chronicConditions: string[];
  recentActivity: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    patientsToday: 0,
    totalAppointments: 0,
    appointmentsToday: 0,
    totalSymptomChecks: 0,
    symptomChecksToday: 0,
    highRiskAlerts: 0,
    riskPercentChange: '0.0',
    predictedPatientLoad: 0,
    predictedChangePercent: 0,
    riskDistribution: { high: 0, medium: 0, low: 0 }
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [healthTwins, setHealthTwins] = useState<HealthTwinSummary[]>([]);
  const [healthTwinsLoading, setHealthTwinsLoading] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const navigate = useNavigate();

  const fetchHealthTwins = async () => {
    try {
      setHealthTwinsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.VITE_API_BASE_URL}/api/health-twins/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setHealthTwins(data);
    } catch (e) {
      console.error('Error fetching health twins:', e);
      // Generate mock data for demonstration
      const mockData: HealthTwinSummary[] = [
        {
          patientId: '1',
          patientName: 'Sarah Johnson',
          age: 34,
          gender: 'Female',
          healthScore: 85,
          riskLevel: 'low',
          lastUpdated: '2 hours ago',
          activeAlerts: 0,
          chronicConditions: ['Hypertension'],
          recentActivity: 'Vital signs updated'
        },
        {
          patientId: '2',
          patientName: 'Michael Chen',
          age: 45,
          gender: 'Male',
          healthScore: 62,
          riskLevel: 'medium',
          lastUpdated: '4 hours ago',
          activeAlerts: 1,
          chronicConditions: ['Diabetes', 'High Cholesterol'],
          recentActivity: 'Symptom check reported'
        },
        {
          patientId: '3',
          patientName: 'Maria Rodriguez',
          age: 67,
          gender: 'Female',
          healthScore: 45,
          riskLevel: 'high',
          lastUpdated: '1 hour ago',
          activeAlerts: 3,
          chronicConditions: ['Heart Disease', 'Diabetes'],
          recentActivity: 'Emergency alert triggered'
        }
      ];
      setHealthTwins(mockData);
    } finally {
      setHealthTwinsLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('token');
      
      // Fetch stats
      const statsResponse = await fetch(`${process.env.VITE_API_BASE_URL}/api/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!statsResponse.ok) {
        throw new Error(`HTTP error! status: ${statsResponse.status}`);
      }
      const statsData = await statsResponse.json();
      setStats(statsData);
      
      // Fetch recent activity
      const activityResponse = await fetch(`${process.env.VITE_API_BASE_URL}/api/dashboard/recent-activity`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!activityResponse.ok) {
        throw new Error(`HTTP error! status: ${activityResponse.status}`);
      }
      const activityData = await activityResponse.json();
      setRecentActivity(activityData);
      
      // Fetch health twins
      await fetchHealthTwins();
      
      // Update last updated timestamp
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      console.error('Error fetching dashboard data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 5 * 60 * 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen size="xl" color="purple" text="Loading Admin Dashboard..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard gradient="pink" className="text-center p-8">
          <AlertTriangle size={64} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Dashboard Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <GlassButton variant="danger" onClick={fetchData}>
            Retry
          </GlassButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      <FloatingParticles count={25} colors={['cyan', 'blue', 'purple', 'pink']} />
      
      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <motion.div
              className="inline-flex items-center bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full px-6 py-2 mb-6"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-blue-400 mr-2" />
              <span className="text-sm text-blue-300 font-medium">Administrative Control Center</span>
              <motion.div
                className="ml-2 w-2 h-2 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Admin
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <motion.p 
                className="text-xl text-gray-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Comprehensive Healthcare Management System
              </motion.p>
              
              <div className="flex items-center space-x-4">
                {lastUpdated && (
                  <span className="text-sm text-gray-400">
                    Last updated: {lastUpdated.toLocaleString()}
                  </span>
                )}
                <GlassButton
                  variant="primary"
                  size="sm"
                  onClick={fetchData}
                  disabled={refreshing}
                  loading={refreshing}
                  icon={<RefreshCw size={16} />}
                >
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </GlassButton>
              </div>
            </div>
          </motion.div>
          {/* Enhanced Stats Grid */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, staggerChildren: 0.1 }}
          >
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
              <StatCard icon={<Users size={24} />} title="Total Patients" value={stats.totalPatients.toString()} change={`+${stats.patientsToday} today`} />
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
              <StatCard icon={<Calendar size={24} />} title="Appointments" value={stats.totalAppointments.toString()} change={`+${stats.appointmentsToday} today`} />
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}>
              <StatCard icon={<Activity size={24} />} title="Symptom Reports" value={stats.totalSymptomChecks.toString()} change={`+${stats.symptomChecksToday} today`} />
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}>
              <StatCard icon={<AlertTriangle size={24} />} title="High-Risk Alerts" value={stats.highRiskAlerts.toString()} change={`${stats.riskPercentChange > '0' ? '+' : ''}${stats.riskPercentChange}% from yesterday`} />
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9 }}>
              <StatCard icon={<TrendingUp size={24} />} title="Predicted Patient Load" value={stats.predictedPatientLoad?.toString() || "0"} change={`+${stats.predictedChangePercent || 0}% next week`} />
            </motion.div>
          </motion.div>

          {/* Enhanced Activity and Quick Actions */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            <div className="xl:col-span-2">
              <GlassCard gradient="blue" glow>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Activity className="mr-3 text-blue-400" size={28} />
                  Recent Activity
                </h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                      >
                        <div className="p-2 rounded-xl mr-4 bg-white/10">
                          {activity.type === 'patient' && <Users size={20} className="text-blue-400" />}
                          {activity.type === 'symptomCheck' && <Activity size={20} className="text-green-400" />}
                          {activity.type === 'appointment' && <Calendar size={20} className="text-purple-400" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold text-sm">
                            {activity.type === 'patient' && `New patient registered: ${activity.name}`}
                            {activity.type === 'symptomCheck' && `Symptom check for: ${activity.name || 'Unknown'}`}
                            {activity.type === 'appointment' && `Appointment for: ${activity.name || 'Unknown'}`}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            {activity.formattedTime || new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Activity size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-400">No recent activity.</p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>

            <div>
              <GlassCard gradient="purple" glow>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Zap className="mr-3 text-purple-400" size={28} />
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <GlassButton
                    variant="primary"
                    className="w-full justify-start"
                    icon={<Users size={18} />}
                    onClick={() => navigate('/patients')}
                  >
                    Manage Patients
                  </GlassButton>
                  <GlassButton
                    variant="secondary"
                    className="w-full justify-start"
                    icon={<Calendar size={18} />}
                    onClick={() => navigate('/appointments')}
                  >
                    Manage Appointments
                  </GlassButton>
                  <GlassButton
                    variant="success"
                    className="w-full justify-start"
                    icon={<BarChart3 size={18} />}
                    onClick={() => navigate('/symptom-trends')}
                  >
                    View Analytics
                  </GlassButton>
                  <GlassButton
                    variant="warning"
                    className="w-full justify-start"
                    icon={<Heart size={18} />}
                    onClick={fetchHealthTwins}
                    glow
                  >
                    Health Twins
                  </GlassButton>
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Enhanced Risk Distribution */}
          <GlassCard gradient="orange" glow className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Shield className="mr-3 text-orange-400" size={28} />
              Patient Risk Level Distribution
            </h2>
            
            <div className="relative">
              <div className="flex items-center h-16 bg-white/10 rounded-2xl overflow-hidden mb-4">
                <motion.div 
                  className="bg-gradient-to-r from-red-500 to-red-600 h-full flex items-center justify-center text-white font-bold text-sm"
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.riskDistribution.high / (stats.totalPatients || 1)) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  {stats.riskDistribution.high > 0 && `${stats.riskDistribution.high}`}
                </motion.div>
                <motion.div 
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-full flex items-center justify-center text-white font-bold text-sm"
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.riskDistribution.medium / (stats.totalPatients || 1)) * 100}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                >
                  {stats.riskDistribution.medium > 0 && `${stats.riskDistribution.medium}`}
                </motion.div>
                <motion.div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-full flex items-center justify-center text-white font-bold text-sm"
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.riskDistribution.low / (stats.totalPatients || 1)) * 100}%` }}
                  transition={{ duration: 1, delay: 0.9 }}
                >
                  {stats.riskDistribution.low > 0 && `${stats.riskDistribution.low}`}
                </motion.div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center justify-center p-4 bg-red-500/20 rounded-xl border border-red-500/30">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-white font-bold">{stats.riskDistribution.high}</p>
                    <p className="text-red-300 text-sm">High Risk</p>
                  </div>
                </div>
                <div className="flex items-center justify-center p-4 bg-yellow-500/20 rounded-xl border border-yellow-500/30">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-white font-bold">{stats.riskDistribution.medium}</p>
                    <p className="text-yellow-300 text-sm">Medium Risk</p>
                  </div>
                </div>
                <div className="flex items-center justify-center p-4 bg-green-500/20 rounded-xl border border-green-500/30">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-white font-bold">{stats.riskDistribution.low}</p>
                    <p className="text-green-300 text-sm">Low Risk</p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Enhanced Health Twins Management */}
          <GlassCard gradient="pink" glow>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                  <Heart className="mr-3 text-pink-400" size={28} />
                  Health Twins Management
                </h2>
                <p className="text-gray-300">AI-powered digital health replicas</p>
              </div>
              <GlassButton
                variant="secondary"
                onClick={fetchHealthTwins}
                disabled={healthTwinsLoading}
                loading={healthTwinsLoading}
                icon={<Brain size={18} />}
                glow
              >
                {healthTwinsLoading ? 'Loading...' : 'Refresh Twins'}
              </GlassButton>
            </div>
            {healthTwinsLoading ? (
              <div className="flex justify-center items-center py-16">
                <LoadingSpinner size="lg" color="pink" text="Loading Health Twins..." />
              </div>
            ) : (
              <div className="space-y-4">
                {healthTwins.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {healthTwins.map((twin, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="cursor-pointer"
                        onClick={() => navigate(`/patients/${twin.patientId}`)}
                      >
                        <GlassCard gradient="blue" hover className="h-full">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-4">
                                <span className="text-white font-bold text-lg">{twin.patientName.charAt(0)}</span>
                              </div>
                              <div>
                                <h3 className="text-white font-bold text-lg">{twin.patientName}</h3>
                                <p className="text-gray-300 text-sm">{twin.age} years old, {twin.gender}</p>
                              </div>
                            </div>
                            <motion.div
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                twin.riskLevel === 'low' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                twin.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                twin.riskLevel === 'high' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                'bg-red-500/20 text-red-300 border border-red-500/30'
                              }`}
                              animate={{ scale: twin.riskLevel === 'high' ? [1, 1.05, 1] : 1 }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              {twin.riskLevel.toUpperCase()}
                            </motion.div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-300 text-sm">Health Score</span>
                                <span className="text-white font-bold">{twin.healthScore}</span>
                              </div>
                              <div className="w-full bg-white/10 rounded-full h-3">
                                <motion.div 
                                  className={`h-3 rounded-full ${
                                    twin.healthScore >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                    twin.healthScore >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                                    'bg-gradient-to-r from-red-500 to-red-600'
                                  }`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${twin.healthScore}%` }}
                                  transition={{ duration: 1, delay: idx * 0.1 }}
                                />
                              </div>
                            </div>

                            {twin.activeAlerts > 0 && (
                              <div className="flex items-center p-3 bg-red-500/20 rounded-xl border border-red-500/30">
                                <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                                <span className="text-red-300 font-semibold text-sm">
                                  {twin.activeAlerts} Active Alert{twin.activeAlerts > 1 ? 's' : ''}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                              <span className="text-gray-400 text-xs">Last updated: {twin.lastUpdated}</span>
                              <GlassButton
                                variant="ghost"
                                size="sm"
                                icon={<Eye size={16} />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/patients/${twin.patientId}`);
                                }}
                              >
                                View
                              </GlassButton>
                            </div>
                          </div>
                        </GlassCard>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Heart size={80} className="mx-auto text-pink-400 mb-6" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-4">No Health Twins Found</h3>
                    <p className="text-gray-400 mb-6">Health twins will appear here once patients are registered and their health data is processed.</p>
                    <GlassButton
                      variant="primary"
                      glow
                      icon={<Brain size={18} />}
                      onClick={fetchHealthTwins}
                    >
                      Initialize Health Twins
                    </GlassButton>
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
