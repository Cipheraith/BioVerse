import React, { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { useSocket } from "../SocketContext";
import { AlertTriangle, CheckCircle } from 'lucide-react';

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-6"
    >
      <h1 className="text-3xl font-bold mb-6 text-text dark:text-dark-text">Health Worker Dashboard</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-text dark:text-dark-text">Urgent Emergency Alerts</h2>
        {emergencyAlerts.length === 0 ? (
          <p className="text-muted dark:text-dark-muted">No new emergency alerts.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {emergencyAlerts.map((alert) => (
              <motion.div
                key={alert.alertId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 p-4 rounded-lg shadow-md flex justify-between items-center ${acknowledgedAlerts.includes(alert.alertId) ? 'opacity-50' : ''}`}
              >
                <div>
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="mr-2" />
                    <h3 className="font-bold text-lg">Emergency: {alert.severity.toUpperCase()} Severity</h3>
                  </div>
                  <p>Patient ID: {alert.patientId}</p>
                  <p>Symptoms: {alert.symptoms}</p>
                  <p>Diagnosis: {alert.diagnosis}</p>
                  <p>Location: {alert.location}</p>
                  <p>Reported By: {alert.reportedBy}</p>
                  <p className="text-sm">{new Date(alert.timestamp).toLocaleString()}</p>
                  {alert.patientDetails && (
                    <div className="mt-2 text-sm">
                      <p>Patient Name: {alert.patientDetails.name}</p>
                      <p>Contact: {alert.patientDetails.contact}</p>
                      <p>Medical History: {alert.patientDetails.medicalHistory.join(', ')}</p>
                      {/* Add more patient details as needed */}
                    </div>
                  )}
                </div>
                {!acknowledgedAlerts.includes(alert.alertId) && (
                  <button
                    onClick={() => acknowledgeEmergency(alert.alertId, alert.patientId)}
                    className="ml-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
                  >
                    <CheckCircle className="mr-2" size={20} /> Acknowledge
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card dark:bg-dark-card rounded-xl p-4 shadow border border-border dark:border-dark-border">
          <h2 className="text-lg font-semibold mb-2 text-text dark:text-dark-text">Patient Management</h2>
          <p className="text-muted dark:text-dark-muted">List, search, add, and edit patients.</p>
        </div>
        <div className="bg-card dark:bg-dark-card rounded-xl p-4 shadow border border-border dark:border-dark-border">
          <h2 className="text-lg font-semibold mb-2 text-text dark:text-dark-text">Appointments</h2>
          <p className="text-muted dark:text-dark-muted">Manage and schedule appointments.</p>
        </div>
        <div className="bg-card dark:bg-dark-card rounded-xl p-4 shadow border border-border dark:border-dark-border">
          <h2 className="text-lg font-semibold mb-2 text-text dark:text-dark-text">Dispatch Map</h2>
          <p className="text-muted dark:text-dark-muted">View and manage live ambulance/dispatch requests.</p>
        </div>
        <div className="bg-card dark:bg-dark-card rounded-xl p-4 shadow border border-border dark:border-dark-border">
          <h2 className="text-lg font-semibold mb-2 text-text dark:text-dark-text">Alerts & Notifications</h2>
          <p className="text-muted dark:text-dark-muted">View urgent alerts and system notifications.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default HealthWorkerDashboard;
