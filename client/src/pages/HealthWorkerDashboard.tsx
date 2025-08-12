import React, { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { useSocket } from "../SocketContext";
import { AlertTriangle, CheckCircle, Users, Activity, Calendar, Stethoscope, Brain, Heart, Zap, Shield, Clock, MapPin, Phone } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import MetricCard from '../components/ui/MetricCard';
import GlowingOrb from '../components/ui/GlowingOrb';

interface PatientDetails {
  name: string;
  contact: string;
  medicalHistory: string[];
}

interface EmergencyAlert {
  alertId: string;
  patientId: string;
  location: string;
  severity: string;
  symptoms: string;
  diagnosis: string;
  timestamp: string;
  reportedBy: string;
  patientDetails: PatientDetails; // Comprehensive patient data
}

const HealthWorkerDashboard: React.FC = () => {
  const { socket } = useSocket();
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>([]);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<string[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleNewEmergency = (alert: EmergencyAlert) => {
      console.log('New emergency alert received:', alert);
      setEmergencyAlerts((prevAlerts) => [...prevAlerts, alert]);
    };

    const handleAcknowledgedEmergency = (ackData: { alertId: string; acknowledgedBy: string; role: string; message?: string }) => {
      console.log('Emergency acknowledged broadcast:', ackData);
      setAcknowledgedAlerts((prevAcks) => [...prevAcks, ackData.alertId]);
      // Optionally, remove from active alerts if desired
      setEmergencyAlerts((prevAlerts) => prevAlerts.filter(alert => alert.alertId !== ackData.alertId));
    };

    socket.on('emergency:new', handleNewEmergency);
    socket.on('emergency:acknowledged:broadcast', handleAcknowledgedEmergency);

    return () => {
      socket.off('emergency:new', handleNewEmergency);
      socket.off('emergency:acknowledged:broadcast', handleAcknowledgedEmergency);
    };
  }, [socket]);

  const acknowledgeEmergency = (alertId: string, patientId: string) => {
    if (socket) {
      socket.emit('emergency:acknowledge', { alertId, patientId });
      setAcknowledgedAlerts((prevAcks) => [...prevAcks, alertId]);
      setEmergencyAlerts((prevAlerts) => prevAlerts.filter(alert => alert.alertId !== alertId));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <GlowingOrb size="xl" color="blue" className="absolute top-20 left-10 opacity-20" />
        <GlowingOrb size="lg" color="cyan" className="absolute bottom-20 right-20 opacity-30" />
        <GlowingOrb size="md" color="green" className="absolute top-1/2 left-1/3 opacity-25" />
        
        {/* Medical cross particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 text-cyan-400"
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0, 1, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            ✚
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 container mx-auto p-6"
      >
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-full px-6 py-2 mb-6">
            <Stethoscope className="w-4 h-4 text-blue-400 mr-2" />
            <span className="text-sm text-blue-300 font-medium">Healthcare Professional Dashboard</span>
            <motion.div
              className="ml-2 w-2 h-2 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
              Health Worker
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Command Center
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-6">AI-powered healthcare management at your fingertips</p>
        </motion.div>
        {/* Emergency Alerts Section */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-red-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                🚨 Emergency Alerts
              </span>
            </h2>
            <p className="text-gray-400">Real-time emergency response system</p>
          </motion.div>
          
          {emergencyAlerts.length === 0 ? (
            <Card variant="glass" className="p-12 text-center">
              <div className="p-6 bg-green-500/10 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Shield className="w-12 h-12 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">All Clear</h3>
              <p className="text-gray-400 text-lg">No emergency alerts at this time</p>
              <div className="mt-6 text-sm text-green-400">
                ✅ System monitoring active • Response team ready
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {emergencyAlerts.map((alert, index) => (
                <motion.div
                  key={alert.alertId}
                  initial={{ opacity: 0, x: -20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative ${acknowledgedAlerts.includes(alert.alertId) ? 'opacity-50' : ''}`}
                >
                  <Card variant="gradient" className="p-8 border-red-500/30 bg-gradient-to-br from-red-500/10 via-orange-500/10 to-red-500/10">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-4">
                          <motion.div
                            className="p-3 bg-red-500/20 rounded-xl mr-4"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <AlertTriangle className="w-8 h-8 text-red-400" />
                          </motion.div>
                          <div>
                            <h3 className="text-2xl font-bold text-red-300 mb-1">
                              EMERGENCY: {alert.severity.toUpperCase()}
                            </h3>
                            <div className="flex items-center text-gray-400 text-sm">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(alert.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="space-y-3">
                            <div className="flex items-center text-white">
                              <Users className="w-5 h-5 mr-2 text-blue-400" />
                              <span className="font-semibold">Patient:</span>
                              <span className="ml-2">{alert.patientId}</span>
                            </div>
                            <div className="flex items-center text-white">
                              <Activity className="w-5 h-5 mr-2 text-green-400" />
                              <span className="font-semibold">Symptoms:</span>
                              <span className="ml-2">{alert.symptoms}</span>
                            </div>
                            <div className="flex items-center text-white">
                              <Brain className="w-5 h-5 mr-2 text-purple-400" />
                              <span className="font-semibold">Diagnosis:</span>
                              <span className="ml-2">{alert.diagnosis}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center text-white">
                              <MapPin className="w-5 h-5 mr-2 text-red-400" />
                              <span className="font-semibold">Location:</span>
                              <span className="ml-2">{alert.location}</span>
                            </div>
                            <div className="flex items-center text-white">
                              <Stethoscope className="w-5 h-5 mr-2 text-cyan-400" />
                              <span className="font-semibold">Reported By:</span>
                              <span className="ml-2">{alert.reportedBy}</span>
                            </div>
                          </div>
                        </div>
                        
                        {alert.patientDetails && (
                          <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 mb-4">
                            <h4 className="font-semibold text-white mb-2 flex items-center">
                              <Users className="w-4 h-4 mr-2" />
                              Patient Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              <div className="text-gray-300">
                                <span className="font-medium">Name:</span> {alert.patientDetails.name}
                              </div>
                              <div className="text-gray-300">
                                <span className="font-medium">Contact:</span> {alert.patientDetails.contact}
                              </div>
                              <div className="text-gray-300">
                                <span className="font-medium">History:</span> {alert.patientDetails.medicalHistory.join(', ')}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {!acknowledgedAlerts.includes(alert.alertId) && (
                        <div className="ml-6">
                          <Button
                            variant="danger"
                            size="lg"
                            onClick={() => acknowledgeEmergency(alert.alertId, alert.patientId)}
                            icon={<CheckCircle className="w-5 h-5" />}
                            glow={true}
                            pulse={true}
                          >
                            Acknowledge Emergency
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <MetricCard
            title="Active Patients"
            value="247"
            icon={<Users className="w-6 h-6" />}
            status="excellent"
            change={12}
            changeType="increase"
          />
          <MetricCard
            title="Today's Appointments"
            value="18"
            icon={<Calendar className="w-6 h-6" />}
            status="normal"
            change={3}
            changeType="increase"
          />
          <MetricCard
            title="Emergency Responses"
            value="3"
            icon={<AlertTriangle className="w-6 h-6" />}
            status="warning"
            change={1}
            changeType="decrease"
          />
          <MetricCard
            title="System Health"
            value="99.9%"
            unit=""
            icon={<Activity className="w-6 h-6" />}
            status="excellent"
            change={0.1}
            changeType="increase"
          />
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            variant="medical"
            hover={true}
            className="p-6 cursor-pointer group"
            onClick={() => window.location.href = '/patients'}
          >
            <div className="text-center">
              <motion.div
                className="p-4 bg-blue-500/20 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Users className="w-8 h-8 text-blue-400" />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">Patient Management</h3>
              <p className="text-gray-400 text-sm mb-4">List, search, add, and edit patients</p>
              <div className="text-xs text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
                247 Active Patients
              </div>
            </div>
          </Card>
          
          <Card
            variant="medical"
            hover={true}
            className="p-6 cursor-pointer group"
            onClick={() => window.location.href = '/appointments'}
          >
            <div className="text-center">
              <motion.div
                className="p-4 bg-emerald-500/20 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Calendar className="w-8 h-8 text-emerald-400" />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">Appointments</h3>
              <p className="text-gray-400 text-sm mb-4">Manage and schedule appointments</p>
              <div className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                18 Today
              </div>
            </div>
          </Card>
          
          <Card
            variant="medical"
            hover={true}
            className="p-6 cursor-pointer group"
            onClick={() => window.location.href = '/dispatch-map'}
          >
            <div className="text-center">
              <motion.div
                className="p-4 bg-purple-500/20 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <MapPin className="w-8 h-8 text-purple-400" />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">Dispatch Map</h3>
              <p className="text-gray-400 text-sm mb-4">Live ambulance and dispatch requests</p>
              <div className="text-xs text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full">
                3 Active
              </div>
            </div>
          </Card>
          
          <Card
            variant="medical"
            hover={true}
            className="p-6 cursor-pointer group"
          >
            <div className="text-center">
              <motion.div
                className="p-4 bg-cyan-500/20 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Heart className="w-8 h-8 text-cyan-400" />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">Health Analytics</h3>
              <p className="text-gray-400 text-sm mb-4">View health trends and insights</p>
              <div className="text-xs text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full">
                Real-time Data
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default HealthWorkerDashboard;
