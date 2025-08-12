import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from "../hooks/useSocket";
import { AlertTriangle, CheckCircle, MapPin, Clock, Navigation, Sparkles, Zap, Siren } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import FloatingParticles from '../components/ui/FloatingParticles';

interface PatientDetails {
    name: string;
    contact: string;
    medicalHistory?: string[];
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
    patientDetails: PatientDetails;
}

const AmbulanceDriverDashboard: React.FC = () => {
    const { socket } = useSocket();
    const navigate = useNavigate();
    const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>([]);
    
    const [driverStatus, setDriverStatus] = useState<'available' | 'busy' | 'offline'>('available');

    useEffect(() => {
        if (!socket) return;

        const handleNewEmergency = (alert: EmergencyAlert) => {
            console.log('New emergency alert received (Ambulance):', alert);
            setEmergencyAlerts((prevAlerts) => [...prevAlerts, alert]);
        };

        const handleAcknowledgedEmergency = (ackData: { alertId: string; acknowledgedBy: string; role: string; message?: string }) => {
            console.log('Emergency acknowledged broadcast (Ambulance):', ackData);
            
            setEmergencyAlerts((prevAlerts) => prevAlerts.filter(alert => alert.alertId !== ackData.alertId));
        };

        socket.on('emergency:new', handleNewEmergency);
        socket.on('emergency:critical', handleNewEmergency);
        socket.on('emergency:acknowledged:broadcast', handleAcknowledgedEmergency);

        return () => {
            socket.off('emergency:new', handleNewEmergency);
            socket.off('emergency:critical', handleNewEmergency);
            socket.off('emergency:acknowledged:broadcast', handleAcknowledgedEmergency);
        };
    }, [socket]);

    const acknowledgeEmergency = (alertId: string, patientId: string) => {
        if (socket) {
            socket.emit('emergency:acknowledge', { alertId, patientId });
            
            setEmergencyAlerts((prevAlerts) => prevAlerts.filter(alert => alert.alertId !== alertId));
            setDriverStatus('busy');
        }
    };

    const updateDriverStatus = (status: 'available' | 'busy' | 'offline') => {
        setDriverStatus(status);
        if (socket) {
            socket.emit('driver:status:update', { status });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': return 'text-green-600 dark:text-green-400';
            case 'busy': return 'text-yellow-600 dark:text-yellow-400';
            case 'offline': return 'text-red-600 dark:text-red-400';
            default: return 'text-gray-600 dark:text-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 relative overflow-hidden">
            <FloatingParticles count={20} colors={['red', 'orange', 'yellow']} />
            
            <div className="relative z-10 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Enhanced Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 text-center"
                    >
                        <motion.div
                            className="inline-flex items-center bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-full px-6 py-2 mb-6"
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            <Siren className="w-4 h-4 text-red-400 mr-2" />
                            <span className="text-sm text-red-300 font-medium">Emergency Response System</span>
                            <motion.div
                                className={`ml-2 w-2 h-2 rounded-full ${
                                    driverStatus === 'available' ? 'bg-green-400' :
                                    driverStatus === 'busy' ? 'bg-yellow-400' : 'bg-red-400'
                                }`}
                                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </motion.div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4">
                            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                                Emergency
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Response
                            </span>
                        </h1>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
                            <motion.p 
                                className="text-xl text-gray-300"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                Ambulance Driver Control Center
                            </motion.p>
                            
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-400">Status:</span>
                                <motion.span 
                                    className={`font-bold text-lg ${getStatusColor(driverStatus)}`}
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    {driverStatus.toUpperCase()}
                                </motion.span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Enhanced Status Control */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mb-8"
                    >
                        <GlassCard gradient="green" glow className="text-center">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center justify-center">
                                <Zap className="mr-3 text-yellow-400" size={28} />
                                Driver Status Control
                            </h2>
                            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                                <GlassButton
                                    variant={driverStatus === 'available' ? 'success' : 'ghost'}
                                    glow={driverStatus === 'available'}
                                    onClick={() => updateDriverStatus('available')}
                                    icon={<CheckCircle size={18} />}
                                >
                                    Available
                                </GlassButton>
                                <GlassButton
                                    variant={driverStatus === 'busy' ? 'warning' : 'ghost'}
                                    glow={driverStatus === 'busy'}
                                    onClick={() => updateDriverStatus('busy')}
                                    icon={<Clock size={18} />}
                                >
                                    Busy
                                </GlassButton>
                                <GlassButton
                                    variant={driverStatus === 'offline' ? 'danger' : 'ghost'}
                                    glow={driverStatus === 'offline'}
                                    onClick={() => updateDriverStatus('offline')}
                                    icon={<AlertTriangle size={18} />}
                                >
                                    Offline
                                </GlassButton>
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* Enhanced Emergency Alerts */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mb-8"
                    >
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-black text-white mb-2 flex items-center justify-center">
                                <AlertTriangle className="mr-3 text-red-400" size={32} />
                                Emergency Dispatch Alerts
                            </h2>
                            <p className="text-gray-400">Real-time emergency response coordination</p>
                        </div>

                        <AnimatePresence>
                            {emergencyAlerts.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                >
                                    <GlassCard gradient="green" className="text-center py-16">
                                        <motion.div
                                            animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
                                            transition={{ duration: 3, repeat: Infinity }}
                                        >
                                            <CheckCircle className="mx-auto mb-6 text-green-400" size={80} />
                                        </motion.div>
                                        <h3 className="text-2xl font-bold text-white mb-4">All Clear</h3>
                                        <p className="text-gray-400">No active emergency alerts at this time.</p>
                                    </GlassCard>
                                </motion.div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {emergencyAlerts.map((alert, index) => (
                                        <motion.div
                                            key={alert.alertId}
                                            initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <GlassCard gradient="pink" glow className="relative overflow-hidden">
                                                {/* Pulsing emergency indicator */}
                                                <motion.div
                                                    className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"
                                                    animate={{ opacity: [1, 0.5, 1] }}
                                                    transition={{ duration: 1, repeat: Infinity }}
                                                />
                                                
                                                <div className="flex flex-col lg:flex-row justify-between items-start space-y-6 lg:space-y-0">
                                                    <div className="flex-1">
                                                        <div className="flex items-center mb-4">
                                                            <motion.div
                                                                className="p-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl mr-4"
                                                                animate={{ scale: [1, 1.1, 1] }}
                                                                transition={{ duration: 2, repeat: Infinity }}
                                                            >
                                                                <AlertTriangle className="text-red-400" size={28} />
                                                            </motion.div>
                                                            <div>
                                                                <h3 className="font-black text-2xl text-white">
                                                                    EMERGENCY: {alert.severity.toUpperCase()}
                                                                </h3>
                                                                <p className="text-red-300 font-semibold">
                                                                    Patient ID: {alert.patientId}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                            <div className="space-y-3">
                                                                <div className="bg-white/5 rounded-xl p-4">
                                                                    <h4 className="text-white font-bold mb-2">Medical Info</h4>
                                                                    <p className="text-gray-300 text-sm">Symptoms: {alert.symptoms}</p>
                                                                    <p className="text-gray-300 text-sm">Diagnosis: {alert.diagnosis}</p>
                                                                    <p className="text-gray-300 text-sm">Reported By: {alert.reportedBy}</p>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <div className="bg-white/5 rounded-xl p-4">
                                                                    <div className="flex items-center mb-2">
                                                                        <MapPin className="mr-2 text-blue-400" size={18} />
                                                                        <h4 className="text-white font-bold">Location</h4>
                                                                    </div>
                                                                    <p className="text-gray-300 text-sm mb-2">{alert.location}</p>
                                                                    <div className="flex items-center">
                                                                        <Clock className="mr-2 text-cyan-400" size={16} />
                                                                        <span className="text-gray-400 text-xs">
                                                                            {new Date(alert.timestamp).toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {alert.patientDetails && (
                                                            <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                                                                <h4 className="text-white font-bold mb-3 flex items-center">
                                                                    <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                                                                    Patient Details
                                                                </h4>
                                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                                                                    <div>
                                                                        <span className="text-gray-400">Name:</span>
                                                                        <p className="text-white font-semibold">{alert.patientDetails.name}</p>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-400">Contact:</span>
                                                                        <p className="text-white font-semibold">{alert.patientDetails.contact}</p>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-400">Medical History:</span>
                                                                        <p className="text-white font-semibold">
                                                                            {alert.patientDetails.medicalHistory?.join(', ') || 'None'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex flex-col space-y-3 lg:ml-6">
                                                        <GlassButton
                                                            variant="danger"
                                                            size="lg"
                                                            glow
                                                            icon={<CheckCircle size={20} />}
                                                            onClick={() => acknowledgeEmergency(alert.alertId, alert.patientId)}
                                                        >
                                                            Respond Now
                                                        </GlassButton>
                                                        <GlassButton
                                                            variant="primary"
                                                            icon={<Navigation size={18} />}
                                                            onClick={() => navigate('/dispatch-map')}
                                                        >
                                                            View Map
                                                        </GlassButton>
                                                    </div>
                                                </div>
                                                
                                                {/* Animated background elements */}
                                                <motion.div
                                                    className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/5 to-transparent rounded-full blur-2xl"
                                                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                                    transition={{ duration: 4, repeat: Infinity }}
                                                />
                                            </GlassCard>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Enhanced Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        <GlassCard gradient="blue" hover glow>
                            <div className="text-center">
                                <motion.div
                                    className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                >
                                    <MapPin className="w-8 h-8 text-blue-400" />
                                </motion.div>
                                <h3 className="text-xl font-bold text-white mb-3">Dispatch Map</h3>
                                <p className="text-gray-400 mb-6">View live emergency locations and optimal routes.</p>
                                <GlassButton
                                    variant="primary"
                                    glow
                                    icon={<Navigation size={18} />}
                                    onClick={() => navigate('/dispatch-map')}
                                    className="w-full"
                                >
                                    Open Map
                                </GlassButton>
                            </div>
                        </GlassCard>

                        <GlassCard gradient="purple" hover glow>
                            <div className="text-center">
                                <motion.div
                                    className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    <CheckCircle className="w-8 h-8 text-purple-400" />
                                </motion.div>
                                <h3 className="text-xl font-bold text-white mb-3">Emergency Contacts</h3>
                                <p className="text-gray-400 mb-6">Quick access to hospital and dispatch contacts.</p>
                                <GlassButton
                                    variant="secondary"
                                    glow
                                    className="w-full"
                                    onClick={() => console.log('View contacts')}
                                >
                                    View Contacts
                                </GlassButton>
                            </div>
                        </GlassCard>

                        <GlassCard gradient="orange" hover glow>
                            <div className="text-center">
                                <motion.div
                                    className="w-16 h-16 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Clock className="w-8 h-8 text-orange-400" />
                                </motion.div>
                                <h3 className="text-xl font-bold text-white mb-3">Trip History</h3>
                                <p className="text-gray-400 mb-6">View your completed emergency responses.</p>
                                <GlassButton
                                    variant="warning"
                                    glow
                                    className="w-full"
                                    onClick={() => console.log('View history')}
                                >
                                    View History
                                </GlassButton>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AmbulanceDriverDashboard;