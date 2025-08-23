import React, { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { useSocket } from "../hooks/useSocket";
import { AlertTriangle, CheckCircle, MapPin, Clock, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto p-6"
        >
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-text dark:text-dark-text">Ambulance Driver Dashboard</h1>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-muted dark:text-dark-muted">Status:</span>
                    <span className={`font-semibold ${getStatusColor(driverStatus)}`}>
                        {driverStatus.toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Status Control */}
            <div className="mb-6 bg-card dark:bg-dark-card p-4 rounded-xl shadow-lg border border-border dark:border-dark-border">
                <h2 className="text-lg font-semibold mb-3 text-text dark:text-dark-text">Driver Status</h2>
                <div className="flex space-x-3">
                    <button
                        onClick={() => updateDriverStatus('available')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${driverStatus === 'available'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900'
                            }`}
                    >
                        Available
                    </button>
                    <button
                        onClick={() => updateDriverStatus('busy')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${driverStatus === 'busy'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-yellow-100 dark:hover:bg-yellow-900'
                            }`}
                    >
                        Busy
                    </button>
                    <button
                        onClick={() => updateDriverStatus('offline')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${driverStatus === 'offline'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900'
                            }`}
                    >
                        Offline
                    </button>
                </div>
            </div>

            {/* Emergency Alerts */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-text dark:text-dark-text">Emergency Dispatch Alerts</h2>
                {emergencyAlerts.length === 0 ? (
                    <div className="bg-card dark:bg-dark-card p-6 rounded-xl shadow-lg border border-border dark:border-dark-border text-center">
                        <CheckCircle className="mx-auto mb-3 text-green-500" size={48} />
                        <p className="text-muted dark:text-dark-muted">No active emergency alerts.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {emergencyAlerts.map((alert) => (
                            <motion.div
                                key={alert.alertId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 p-6 rounded-lg shadow-md"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center mb-3">
                                            <AlertTriangle className="mr-2" size={24} />
                                            <h3 className="font-bold text-xl">EMERGENCY: {alert.severity.toUpperCase()}</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <p className="font-semibold">Patient ID: {alert.patientId}</p>
                                                <p>Symptoms: {alert.symptoms}</p>
                                                <p>Diagnosis: {alert.diagnosis}</p>
                                                <p>Reported By: {alert.reportedBy}</p>
                                            </div>
                                            <div>
                                                <div className="flex items-center mb-2">
                                                    <MapPin className="mr-1" size={16} />
                                                    <span className="font-semibold">Location:</span>
                                                </div>
                                                <p className="mb-2">{alert.location}</p>
                                                <div className="flex items-center">
                                                    <Clock className="mr-1" size={16} />
                                                    <span className="text-sm">{new Date(alert.timestamp).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {alert.patientDetails && (
                                            <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg mb-4">
                                                <h4 className="font-semibold mb-2">Patient Details:</h4>
                                                <p>Name: {alert.patientDetails.name}</p>
                                                <p>Contact: {alert.patientDetails.contact}</p>
                                                <p>Medical History: {alert.patientDetails.medicalHistory?.join(', ') || 'None'}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-4 flex flex-col space-y-2">
                                        <button
                                            onClick={() => acknowledgeEmergency(alert.alertId, alert.patientId)}
                                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg flex items-center transition-all"
                                        >
                                            <CheckCircle className="mr-2" size={20} />
                                            Respond
                                        </button>
                                        <button
                                            onClick={() => navigate('/dispatch-map')}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-all"
                                        >
                                            <Navigation className="mr-2" size={16} />
                                            View Map
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card dark:bg-dark-card rounded-xl p-6 shadow-lg border border-border dark:border-dark-border">
                    <h3 className="text-lg font-semibold mb-3 text-text dark:text-dark-text">Dispatch Map</h3>
                    <p className="text-muted dark:text-dark-muted mb-4">View live emergency locations and optimal routes.</p>
                    <button
                        onClick={() => navigate('/dispatch-map')}
                        className="w-full bg-primary hover:bg-primary-700 text-primary-text font-bold py-2 px-4 rounded-lg transition-all"
                    >
                        Open Map
                    </button>
                </div>
                <div className="bg-card dark:bg-dark-card rounded-xl p-6 shadow-lg border border-border dark:border-dark-border">
                    <h3 className="text-lg font-semibold mb-3 text-text dark:text-dark-text">Emergency Contacts</h3>
                    <p className="text-muted dark:text-dark-muted mb-4">Quick access to hospital and dispatch contacts.</p>
                    <button className="w-full bg-secondary hover:bg-secondary-700 text-secondary-text font-bold py-2 px-4 rounded-lg transition-all">
                        View Contacts
                    </button>
                </div>
                <div className="bg-card dark:bg-dark-card rounded-xl p-6 shadow-lg border border-border dark:border-dark-border">
                    <h3 className="text-lg font-semibold mb-3 text-text dark:text-dark-text">Trip History</h3>
                    <p className="text-muted dark:text-dark-muted mb-4">View your completed emergency responses.</p>
                    <button className="w-full bg-accent hover:bg-accent-700 text-accent-text font-bold py-2 px-4 rounded-lg transition-all">
                        View History
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default AmbulanceDriverDashboard;