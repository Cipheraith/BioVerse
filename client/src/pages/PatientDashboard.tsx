import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import { AlertTriangle, CheckCircle, Calendar, Activity, Heart, Phone, MapPin, Sparkles, Zap, Brain, Plus, Shield, Cpu, BarChart3, Clock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import MetricCard from '../components/ui/MetricCard';
import GlowingOrb from '../components/ui/GlowingOrb';

interface Appointment {
  id: string;
  date: string;
  time: string;
  doctor: string;
  type: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

interface SymptomCheck {
  id: string;
  symptoms: string[];
  severity: string;
  date: string;
  aiRecommendation?: string;
}

interface HealthMetric {
  type: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  lastUpdated: string;
}

import MobileOptimizedDashboard from '../components/dashboard/MobileOptimizedDashboard';
import ResponsiveDashboardLayout from '../components/dashboard/ResponsiveDashboardLayout';
import MobileBottomNav from '../components/navigation/MobileBottomNav';
import ResponsiveGrid from '../components/layout/ResponsiveGrid';

const PatientDashboard: React.FC = () => {
  const { socket } = useSocket();
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [emergencySent, setEmergencySent] = useState(false);
  const [emergencyAcknowledged, setEmergencyAcknowledged] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [recentSymptoms, setRecentSymptoms] = useState<SymptomCheck[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    age: '',
    contact: '',
    location: '',
    medicalHistory: []
  });

  useEffect(() => {
    if (!socket) return;

    socket.on('emergency:acknowledged', (data) => {
      console.log('Emergency acknowledged by responder:', data);
      setEmergencyAcknowledged(true);
      setEmergencyMessage(data.message || 'Your emergency alert has been acknowledged. Help is on the way.');
    });

    return () => {
      socket.off('emergency:acknowledged');
    };
  }, [socket]);

  // Fetch patient data on component mount
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch patient info
        const patientResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/patients/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (patientResponse.ok) {
          const patientData = await patientResponse.json();
          setPatientInfo(patientData);
        }

        // Fetch appointments
        const appointmentsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/appointments/my-appointments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (appointmentsResponse.ok) {
          const appointmentsData = await appointmentsResponse.json();
          setAppointments(appointmentsData);
        }

        // Fetch recent symptoms
        const symptomsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/symptoms/my-symptoms`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (symptomsResponse.ok) {
          const symptomsData = await symptomsResponse.json();
          setRecentSymptoms(symptomsData);
        }

        // Mock health metrics for now
        setHealthMetrics([
          { type: 'Blood Pressure', value: '120/80', unit: 'mmHg', status: 'normal', lastUpdated: '2024-01-15' },
          { type: 'Heart Rate', value: '72', unit: 'bpm', status: 'normal', lastUpdated: '2024-01-15' },
          { type: 'Temperature', value: '36.5', unit: '°C', status: 'normal', lastUpdated: '2024-01-15' },
          { type: 'Weight', value: '70', unit: 'kg', status: 'normal', lastUpdated: '2024-01-10' }
        ]);

      } catch (error) {
        console.error('Error fetching patient data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []);

  const handleEmergencyClick = () => {
    if (!socket) {
      setEmergencyMessage('Error: Not connected to real-time services. Please refresh.');
      return;
    }
    if (!userId) {
      setEmergencyMessage('Error: Patient ID not found. Please log in.');
      return;
    }

    setLoadingLocation(true);
    setEmergencySent(false);
    setEmergencyAcknowledged(false);
    setEmergencyMessage('Sending emergency alert...');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = `Lat: ${latitude}, Lon: ${longitude}`;
          sendEmergencyAlert(userId, location);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setEmergencyMessage('Could not get your location. Sending alert without location.');
          sendEmergencyAlert(userId, 'Location Unknown');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setEmergencyMessage('Geolocation not supported. Sending alert without location.');
      sendEmergencyAlert(userId, 'Location Unknown');
    }
  };

  const sendEmergencyAlert = (patientId: string, location: string) => {
    if (socket) {
      socket.emit('emergency:alert', {
        id: Date.now().toString(), // Add unique ID for tracking
        patientId: patientId,
        location: location,
        severity: 'critical',
        symptoms: 'Patient initiated emergency',
        diagnosis: 'Immediate assistance required',
        timestamp: new Date().toISOString(),
      });
      setEmergencySent(true);
      setLoadingLocation(false);
      setEmergencyMessage('🚨 Emergency alert sent! Responders have been notified and are on their way.');
    }
  };

  const resetEmergencyState = () => {
    setEmergencySent(false);
    setEmergencyAcknowledged(false);
    setEmergencyMessage('');
    setLoadingLocation(false);
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted dark:text-dark-muted">Loading your health data...</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveDashboardLayout userRole="patient">
      <MobileOptimizedDashboard userRole="patient" />
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <GlowingOrb size="xl" color="blue" className="absolute top-20 left-10 opacity-20" />
        <GlowingOrb size="lg" color="purple" className="absolute bottom-20 right-20 opacity-30" />
        <GlowingOrb size="md" color="cyan" className="absolute top-1/2 left-1/3 opacity-25" />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 p-4 sm:p-8 max-w-7xl mx-auto"
      >
        {/* Enhanced Header */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full px-6 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-blue-400 mr-2" />
              <span className="text-sm text-blue-300 font-medium">AI-Powered Health Dashboard</span>
              <motion.div
                className="ml-2 w-2 h-2 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black mb-4">
              <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
                Welcome back,
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                {patientInfo.name || 'Patient'}
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-6">Your personalized AI health companion</p>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              {patientInfo.contact && (
                <div className="flex items-center bg-white/5 backdrop-blur-sm rounded-full px-4 py-2">
                  <Phone size={16} className="mr-2 text-blue-400" />
                  {patientInfo.contact}
                </div>
              )}
              {patientInfo.location && (
                <div className="flex items-center bg-white/5 backdrop-blur-sm rounded-full px-4 py-2">
                  <MapPin size={16} className="mr-2 text-green-400" />
                  {patientInfo.location}
                </div>
              )}
              <div className="flex items-center bg-white/5 backdrop-blur-sm rounded-full px-4 py-2">
                <Shield size={16} className="mr-2 text-purple-400" />
                Health Twin Active
              </div>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Emergency Button */}
        <Card variant="gradient" className="mb-12 p-8 border-red-500/30 bg-gradient-to-br from-red-500/10 via-pink-500/10 to-red-500/10">
          <div className="text-center">
            <motion.div
              animate={emergencySent ? {} : { scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-6"
            >
              <div className="relative inline-block">
                <AlertTriangle className="mx-auto text-red-400" size={64} />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-red-400"
                  animate={emergencySent ? {} : { scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>
            
            <h2 className="text-4xl font-bold text-red-300 mb-4 flex items-center justify-center">
              <span className="mr-3">🚨</span>
              Emergency Assistance
              <span className="ml-3">🚨</span>
            </h2>
            
            <p className="text-red-200 mb-8 text-lg max-w-2xl mx-auto">
              In case of a medical emergency, press the button below to instantly alert health workers, 
              ambulance services, and emergency responders with your exact location.
            </p>
            
            <Button
              variant="danger"
              size="xl"
              onClick={handleEmergencyClick}
              disabled={emergencySent || loadingLocation}
              loading={loadingLocation}
              glow={!emergencySent && !loadingLocation}
              pulse={!emergencySent && !loadingLocation}
              className="text-2xl px-16 py-6 mb-6"
            >
              {emergencySent ? (
                <>
                  <CheckCircle className="mr-3" size={28} />
                  Alert Sent Successfully!
                </>
              ) : (
                <>
                  🆘 EMERGENCY BUTTON
                </>
              )}
            </Button>
            
            {emergencyMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl backdrop-blur-sm ${
                  emergencyAcknowledged 
                    ? 'bg-green-500/20 border border-green-400/30' 
                    : 'bg-red-500/20 border border-red-400/30'
                }`}
              >
                <p className={`text-lg font-medium ${
                  emergencyAcknowledged ? 'text-green-300' : 'text-red-300'
                }`}>
                  {emergencyMessage}
                  {emergencyAcknowledged && <CheckCircle className="inline-block ml-2" size={20} />}
                </p>
                {(emergencySent || emergencyAcknowledged) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetEmergencyState}
                    className="mt-3"
                  >
                    Reset Emergency Status
                  </Button>
                )}
              </motion.div>
            )}
          </div>
        </Card>

        {/* Enhanced Health Metrics */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Your Health Metrics
              </span>
            </h2>
            <p className="text-gray-400">Real-time monitoring powered by AI</p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {healthMetrics.map((metric, index) => {
              const icons = {
                'Blood Pressure': <Heart className="w-6 h-6" />,
                'Heart Rate': <Activity className="w-6 h-6" />,
                'Temperature': <Zap className="w-6 h-6" />,
                'Weight': <BarChart3 className="w-6 h-6" />
              };
              
              return (
                <MetricCard
                  key={index}
                  title={metric.type}
                  value={metric.value}
                  unit={metric.unit}
                  status={metric.status as any}
                  icon={icons[metric.type as keyof typeof icons]}
                  change={Math.random() > 0.5 ? Math.floor(Math.random() * 10) : undefined}
                  changeType={Math.random() > 0.5 ? 'increase' : 'decrease'}
                />
              );
            })}
          </div>
        </div>

        {/* Enhanced Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Upcoming Appointments */}
          <Card variant="glass" className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
                Upcoming Appointments
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/appointments/add')}
                icon={<Plus className="w-4 h-4" />}
              >
                Book New
              </Button>
            </div>
            
            {appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.slice(0, 3).map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">{appointment.type}</h3>
                        <p className="text-gray-300 text-sm mb-1">Dr. {appointment.doctor}</p>
                        <div className="flex items-center text-gray-400 text-sm">
                          <Clock className="w-4 h-4 mr-1" />
                          {appointment.date} at {appointment.time}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'upcoming' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        appointment.status === 'completed' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                        'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-4 bg-blue-500/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No upcoming appointments</h3>
                <p className="text-gray-400 mb-6">Schedule your next health checkup</p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/appointments/add')}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Schedule Appointment
                </Button>
              </div>
            )}
          </Card>

          {/* Recent Symptom Checks */}
          <Card variant="glass" className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
                  <Brain className="w-6 h-6 text-purple-400" />
                </div>
                AI Health Insights
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/luma')}
                icon={<Sparkles className="w-4 h-4" />}
              >
                New Check
              </Button>
            </div>
            
            {recentSymptoms.length > 0 ? (
              <div className="space-y-4">
                {recentSymptoms.slice(0, 3).map((symptom, index) => (
                  <motion.div
                    key={symptom.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-white">
                        {symptom.symptoms.join(', ')}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        symptom.severity === 'mild' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                        symptom.severity === 'moderate' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                        'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {symptom.severity}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{symptom.date}</p>
                    {symptom.aiRecommendation && (
                      <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        <p className="text-purple-300 text-sm">
                          <Cpu className="w-4 h-4 inline mr-2" />
                          AI Recommendation: {symptom.aiRecommendation}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-4 bg-purple-500/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Brain className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No recent health checks</h3>
                <p className="text-gray-400 mb-6">Get AI-powered health insights</p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/luma')}
                  icon={<Sparkles className="w-4 h-4" />}
                >
                  Check Symptoms with AI
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Quick Actions
              </span>
            </h2>
            <p className="text-gray-400">Access your most-used health features</p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card
              variant="medical"
              hover={true}
              onClick={() => navigate('/luma')}
              className="p-6 cursor-pointer group"
            >
              <div className="text-center">
                <motion.div
                  className="p-4 bg-blue-500/20 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Brain className="w-8 h-8 text-blue-400" />
                </motion.div>
                <h3 className="text-lg font-bold text-white mb-2">AI Health Check</h3>
                <p className="text-gray-400 text-sm">Get instant AI-powered health insights</p>
              </div>
            </Card>
            
            <Card
              variant="medical"
              hover={true}
              onClick={() => navigate('/appointments/add')}
              className="p-6 cursor-pointer group"
            >
              <div className="text-center">
                <motion.div
                  className="p-4 bg-emerald-500/20 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Calendar className="w-8 h-8 text-emerald-400" />
                </motion.div>
                <h3 className="text-lg font-bold text-white mb-2">Book Appointment</h3>
                <p className="text-gray-400 text-sm">Schedule with healthcare providers</p>
              </div>
            </Card>
            
            <Card
              variant="medical"
              hover={true}
              onClick={() => navigate('/health-twins')}
              className="p-6 cursor-pointer group"
            >
              <div className="text-center">
                <motion.div
                  className="p-4 bg-purple-500/20 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <User className="w-8 h-8 text-purple-400" />
                </motion.div>
                <h3 className="text-lg font-bold text-white mb-2">Health Twin</h3>
                <p className="text-gray-400 text-sm">View your digital health twin</p>
              </div>
            </Card>
            
            <Card
              variant="medical"
              hover={true}
              onClick={() => navigate('/srh')}
              className="p-6 cursor-pointer group"
            >
              <div className="text-center">
                <motion.div
                  className="p-4 bg-pink-500/20 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Heart className="w-8 h-8 text-pink-400" />
                </motion.div>
                <h3 className="text-lg font-bold text-white mb-2">Sexual Health</h3>
                <p className="text-gray-400 text-sm">Reproductive health resources</p>
              </div>
            </Card>
          </div>
        </div>
      </motion.div>
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <MobileBottomNav userRole="patient" />
      </div>
    </ResponsiveDashboardLayout>
  );
};

export default PatientDashboard;