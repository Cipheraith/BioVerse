import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import { AlertTriangle, CheckCircle, Calendar, Activity, Heart, TrendingUp, Phone, MapPin, Sparkles, Zap, Brain, Stethoscope, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 dark:text-green-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 dark:bg-green-900';
      case 'warning': return 'bg-yellow-100 dark:bg-yellow-900';
      case 'critical': return 'bg-red-100 dark:bg-red-900';
      default: return 'bg-gray-100 dark:bg-gray-900';
    }
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-8 max-w-7xl mx-auto"
    >
      {/* Header with Patient Info */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-text dark:text-dark-text mb-2">
              Welcome back, {patientInfo.name || 'Patient'}
            </h1>
            <p className="text-muted dark:text-dark-muted">Your personalized health dashboard</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-4 text-sm text-muted dark:text-dark-muted">
            {patientInfo.contact && (
              <div className="flex items-center">
                <Phone size={16} className="mr-1" />
                {patientInfo.contact}
              </div>
            )}
            {patientInfo.location && (
              <div className="flex items-center">
                <MapPin size={16} className="mr-1" />
                {patientInfo.location}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Button */}
      <div className="mb-8 p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 rounded-xl shadow-2xl border-2 border-red-300 dark:border-red-700">
        <div className="text-center">
          <motion.div
            animate={emergencySent ? {} : { scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-4"
          >
            <AlertTriangle className="mx-auto text-red-600 dark:text-red-400" size={56} />
          </motion.div>
          <h2 className="text-3xl font-bold text-red-700 dark:text-red-300 mb-4">🚨 Emergency Assistance</h2>
          <p className="text-red-600 dark:text-red-400 mb-6 text-lg">
            In case of a medical emergency, press the button below to instantly alert health workers and ambulance services.
          </p>
          <motion.button
            onClick={handleEmergencyClick}
            disabled={emergencySent || loadingLocation}
            whileHover={emergencySent || loadingLocation ? {} : { scale: 1.05 }}
            whileTap={emergencySent || loadingLocation ? {} : { scale: 0.95 }}
            animate={emergencySent ? {} : { boxShadow: ['0 0 0 0 rgba(239, 68, 68, 0.7)', '0 0 0 20px rgba(239, 68, 68, 0)'] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`w-full sm:w-auto px-12 py-6 rounded-full text-white font-bold text-2xl transition-all duration-300 shadow-2xl ${
              emergencySent ? 'bg-green-600 cursor-not-allowed' : 
              loadingLocation ? 'bg-orange-500 cursor-wait' :
              'bg-red-600 hover:bg-red-700 active:bg-red-800'
            }`}
          >
            {loadingLocation ? (
              <>
                <span className="animate-spin inline-block mr-2">⚡</span>
                Getting Location...
              </>
            ) : emergencySent ? (
              <>
                <CheckCircle className="inline-block mr-2" size={24} />
                Alert Sent!
              </>
            ) : (
              <>
                🆘 EMERGENCY BUTTON
              </>
            )}
          </motion.button>
          {emergencyMessage && (
            <div className={`mt-4 p-3 rounded-lg ${emergencyAcknowledged ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              <p className={`text-sm ${emergencyAcknowledged ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {emergencyMessage}
                {emergencyAcknowledged && <CheckCircle className="inline-block ml-2" size={16} />}
              </p>
              {(emergencySent || emergencyAcknowledged) && (
                <button
                  onClick={resetEmergencyState}
                  className="mt-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-all"
                >
                  Reset Emergency Status
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Health Metrics */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-text dark:text-dark-text">Health Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {healthMetrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl shadow-lg border ${getStatusBg(metric.status)} border-border dark:border-dark-border`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-text dark:text-dark-text">{metric.type}</h3>
                <Heart size={20} className={getStatusColor(metric.status)} />
              </div>
              <p className="text-2xl font-bold text-text dark:text-dark-text">
                {metric.value} <span className="text-sm font-normal text-muted dark:text-dark-muted">{metric.unit}</span>
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(metric.status)} ${getStatusBg(metric.status)}`}>
                  {metric.status.toUpperCase()}
                </span>
                <span className="text-xs text-muted dark:text-dark-muted">{metric.lastUpdated}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Upcoming Appointments */}
        <div className="bg-card dark:bg-dark-card p-6 rounded-xl shadow-lg border border-border dark:border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text dark:text-dark-text flex items-center">
              <Calendar className="mr-2" size={24} />
              Upcoming Appointments
            </h2>
            <button
              onClick={() => navigate('/appointments/add')}
              className="text-primary hover:text-primary-700 text-sm font-medium"
            >
              Book New
            </button>
          </div>
          {appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.slice(0, 3).map((appointment) => (
                <div key={appointment.id} className="p-3 bg-background dark:bg-dark-background rounded-lg border border-border dark:border-dark-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-text dark:text-dark-text">{appointment.type}</p>
                      <p className="text-sm text-muted dark:text-dark-muted">Dr. {appointment.doctor}</p>
                      <p className="text-sm text-muted dark:text-dark-muted">{appointment.date} at {appointment.time}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      appointment.status === 'upcoming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      appointment.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto mb-3 text-muted dark:text-dark-muted" size={48} />
              <p className="text-muted dark:text-dark-muted mb-4">No upcoming appointments</p>
              <button
                onClick={() => navigate('/appointments/add')}
                className="bg-primary hover:bg-primary-700 text-primary-text px-4 py-2 rounded-lg transition-all"
              >
                Schedule Appointment
              </button>
            </div>
          )}
        </div>

        {/* Recent Symptom Checks */}
        <div className="bg-card dark:bg-dark-card p-6 rounded-xl shadow-lg border border-border dark:border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text dark:text-dark-text flex items-center">
              <Activity className="mr-2" size={24} />
              Recent Symptom Checks
            </h2>
            <button
              onClick={() => navigate('/luma')}
              className="text-primary hover:text-primary-700 text-sm font-medium"
            >
              Check Symptoms
            </button>
          </div>
          {recentSymptoms.length > 0 ? (
            <div className="space-y-3">
              {recentSymptoms.slice(0, 3).map((symptom) => (
                <div key={symptom.id} className="p-3 bg-background dark:bg-dark-background rounded-lg border border-border dark:border-dark-border">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-text dark:text-dark-text">
                      {symptom.symptoms.join(', ')}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      symptom.severity === 'mild' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      symptom.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {symptom.severity}
                    </span>
                  </div>
                  <p className="text-sm text-muted dark:text-dark-muted mb-2">{symptom.date}</p>
                  {symptom.aiRecommendation && (
                    <p className="text-sm text-primary dark:text-primary-300 bg-primary-50 dark:bg-primary-950 p-2 rounded">
                      AI Recommendation: {symptom.aiRecommendation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="mx-auto mb-3 text-muted dark:text-dark-muted" size={48} />
              <p className="text-muted dark:text-dark-muted mb-4">No recent symptom checks</p>
              <button
                onClick={() => navigate('/luma')}
                className="bg-primary hover:bg-primary-700 text-primary-text px-4 py-2 rounded-lg transition-all"
              >
                Check Symptoms with AI
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/luma')}
          className="p-4 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-xl border border-blue-200 dark:border-blue-800 transition-all group"
        >
          <Activity className="mx-auto mb-2 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" size={32} />
          <h3 className="font-semibold text-blue-800 dark:text-blue-200">AI Health Check</h3>
          <p className="text-sm text-blue-600 dark:text-blue-400">Get instant health insights</p>
        </button>
        
        <button
          onClick={() => navigate('/appointments/add')}
          className="p-4 bg-green-50 dark:bg-green-950 hover:bg-green-100 dark:hover:bg-green-900 rounded-xl border border-green-200 dark:border-green-800 transition-all group"
        >
          <Calendar className="mx-auto mb-2 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" size={32} />
          <h3 className="font-semibold text-green-800 dark:text-green-200">Book Appointment</h3>
          <p className="text-sm text-green-600 dark:text-green-400">Schedule with a doctor</p>
        </button>
        
        <button
          onClick={() => navigate('/srh')}
          className="p-4 bg-pink-50 dark:bg-pink-950 hover:bg-pink-100 dark:hover:bg-pink-900 rounded-xl border border-pink-200 dark:border-pink-800 transition-all group"
        >
          <Heart className="mx-auto mb-2 text-pink-600 dark:text-pink-400 group-hover:scale-110 transition-transform" size={32} />
          <h3 className="font-semibold text-pink-800 dark:text-pink-200">Sexual Health</h3>
          <p className="text-sm text-pink-600 dark:text-pink-400">Reproductive health info</p>
        </button>
        
        <button
          className="p-4 bg-purple-50 dark:bg-purple-950 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-xl border border-purple-200 dark:border-purple-800 transition-all group"
        >
          <TrendingUp className="mx-auto mb-2 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" size={32} />
          <h3 className="font-semibold text-purple-800 dark:text-purple-200">Health Trends</h3>
          <p className="text-sm text-purple-600 dark:text-purple-400">View your progress</p>
        </button>
      </div>
    </motion.div>
  );
};

export default PatientDashboard;