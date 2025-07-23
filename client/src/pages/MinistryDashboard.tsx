import React, { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { Heart, MapPin, TrendingUp, Activity, Server, Clock, AlertTriangle, CheckCircle, Users, AlertCircle } from 'lucide-react';
import { useSocket } from "../SocketContext";

interface SymptomData {
  symptom: string;
  count: number;
}

interface LocationData {
  location: string;
  count: number;
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

interface PatientDetails {
  name: string;
  contact: string;
  medicalHistory: string[];
}

const MinistryDashboard: React.FC = () => {
  const { socket } = useSocket();
  const [overview, setOverview] = useState({
    topSymptoms: [],
    topLocations: [],
    totalPregnancies: 0,
    riskDistribution: { high: 0, medium: 0, low: 0 },
  });
  const [performanceMetrics, setPerformanceMetrics] = useState({
    activeUsers: 0,
    apiResponseTime: "0.00",
    errorRate: "0.000",
    uptime: "0%",
    databaseConnections: 0,
  });
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>([]);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        // Fetch national health overview
        const overviewResponse = await fetch(`${process.env.VITE_API_BASE_URL}/api/dashboard/national-health-overview`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!overviewResponse.ok) {
          throw new Error(`HTTP error! status: ${overviewResponse.status}`);
        }
        const overviewData = await overviewResponse.json();
        setOverview(overviewData);

        // Fetch system performance metrics
        const performanceResponse = await fetch(`${process.env.VITE_API_BASE_URL}/api/dashboard/system-performance`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!performanceResponse.ok) {
          throw new Error(`HTTP error! status: ${performanceResponse.status}`);
        }
        const performanceData = await performanceResponse.json();
        setPerformanceMetrics(performanceData);

        // Fetch dashboard stats for risk distribution
        const statsResponse = await fetch(`${process.env.VITE_API_BASE_URL}/api/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!statsResponse.ok) {
          throw new Error(`HTTP error! status: ${statsResponse.status}`);
        }
        const statsData = await statsResponse.json();
        setOverview(prev => ({ ...prev, riskDistribution: statsData.riskDistribution }));

      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewEmergency = (alert: EmergencyAlert) => {
      console.log('New emergency alert received (Ministry):', alert);
      setEmergencyAlerts((prevAlerts) => [...prevAlerts, alert]);
    };

    const handleAcknowledgedEmergency = (ackData: { alertId: string; acknowledgedBy: string; role: string; message?: string }) => {
      console.log('Emergency acknowledged broadcast (Ministry):', ackData);
      setAcknowledgedAlerts((prevAcks) => [...prevAcks, ackData.alertId]);
      setEmergencyAlerts((prevAlerts) => prevAlerts.filter(alert => alert.alertId !== ackData.alertId));
    };

    socket.on('emergency:new', handleNewEmergency);
    socket.on('emergency:critical', handleNewEmergency); // MOH also listens to critical alerts
    socket.on('emergency:acknowledged', handleAcknowledgedEmergency); // Listen for direct acknowledgements
    socket.on('emergency:acknowledged:broadcast', handleAcknowledgedEmergency);

    return () => {
      socket.off('emergency:new', handleNewEmergency);
      socket.off('emergency:critical', handleNewEmergency);
      socket.off('emergency:acknowledged', handleAcknowledgedEmergency);
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

  if (loading) {
    return <div className="text-center text-text dark:text-dark-text">Loading Ministry Dashboard...</div>;
  }

  if (error) {
    return <div className="text-center text-destructive dark:text-dark-destructive">Error: {error}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-6"
    >
      <h2 className="text-4xl font-sans font-bold text-center mb-12 text-primary-700 dark:text-primary-300">
        Ministry of Health Dashboard
      </h2>

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-card dark:bg-dark-card p-6 rounded-xl shadow-lg border border-border dark:border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-muted dark:text-dark-muted">Total Pregnancies</h3>
            <Heart size={24} className="text-pink-500" />
          </div>
          <p className="text-3xl font-bold text-text dark:text-dark-text">{overview.totalPregnancies}</p>
        </div>

        <div className="bg-card dark:bg-dark-card p-6 rounded-xl shadow-lg border border-border dark:border-dark-border lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-muted dark:text-dark-muted">Top 5 Common Symptoms</h3>
            <TrendingUp size={24} className="text-green-500" />
          </div>
          <ul className="space-y-2">
            {overview.topSymptoms.length > 0 ? (
              overview.topSymptoms.map((symptom: SymptomData, index: number) => (
                <li key={index} className="flex justify-between items-center text-text dark:text-dark-text">
                  <span>{symptom.symptom}</span>
                  <span className="font-bold">{symptom.count}</span>
                </li>
              ))
            ) : (
              <p className="text-dark-muted">No symptom data available.</p>
            )}
          </ul>
        </div>

        <div className="bg-card dark:bg-dark-card p-6 rounded-xl shadow-lg border border-border dark:border-dark-border lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-muted dark:text-dark-muted">Top 5 Patient Locations</h3>
            <MapPin size={24} className="text-blue-500" />
          </div>
          <ul className="space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
            {overview.topLocations.length > 0 ? (
              overview.topLocations.map((location: LocationData, index: number) => (
                <li key={index} className="flex justify-between items-center text-text dark:text-dark-text">
                  <span>{location.location}</span>
                  <span className="font-bold">{location.count}</span>
                </li>
              ))
            ) : (
              <p className="text-dark-muted">No location data available.</p>
            )}
          </ul>
        </div>

        <div className="bg-card dark:bg-dark-card p-6 rounded-xl shadow-lg border border-border dark:border-dark-border lg:col-span-3">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-text dark:text-dark-text">Patient Risk Level Distribution</h2>
          <div className="flex items-center h-32 mt-4">
            <div 
              className="bg-red-500 h-full rounded-l" 
              style={{ width: `${(overview.riskDistribution.high / (overview.riskDistribution.high + overview.riskDistribution.medium + overview.riskDistribution.low)) * 100 || 0}%` }}
            ></div>
            <div 
              className="bg-yellow-500 h-full" 
              style={{ width: `${(overview.riskDistribution.medium / (overview.riskDistribution.high + overview.riskDistribution.medium + overview.riskDistribution.low)) * 100 || 0}%` }}
            ></div>
            <div 
              className="bg-green-500 h-full rounded-r" 
              style={{ width: `${(overview.riskDistribution.low / (overview.riskDistribution.high + overview.riskDistribution.medium + overview.riskDistribution.low)) * 100 || 0}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
              <span>High Risk ({overview.riskDistribution.high})</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
              <span>Medium Risk ({overview.riskDistribution.medium})</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
              <span>Low Risk ({overview.riskDistribution.low})</span>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-3xl font-sans font-bold text-center mb-8 mt-12 text-primary-700 dark:text-primary-300">
        System Performance Metrics
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card dark:bg-dark-card p-6 rounded-xl shadow-lg border border-border dark:border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-muted dark:text-dark-muted">Active Users</h3>
            <Users size={24} className="text-indigo-500" />
          </div>
          <p className="text-3xl font-bold text-text dark:text-dark-text">{performanceMetrics.activeUsers}</p>
        </div>
        <div className="bg-card dark:bg-dark-card p-6 rounded-xl shadow-lg border border-border dark:border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-muted dark:text-dark-muted">API Response Time</h3>
            <Clock size={24} className="text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-text dark:text-dark-text">{performanceMetrics.apiResponseTime} s</p>
        </div>
        <div className="bg-card dark:bg-dark-card p-6 rounded-xl shadow-lg border border-border dark:border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-muted dark:text-dark-muted">Error Rate</h3>
            <AlertCircle size={24} className="text-red-500" />
          </div>
          <p className="text-3xl font-bold text-text dark:text-dark-text">{performanceMetrics.errorRate}%</p>
        </div>
        <div className="bg-card dark:bg-dark-card p-6 rounded-xl shadow-lg border border-border dark:border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-muted dark:text-dark-muted">Uptime</h3>
            <Server size={24} className="text-teal-500" />
          </div>
          <p className="text-3xl font-bold text-text dark:text-dark-text">{performanceMetrics.uptime}</p>
        </div>
        <div className="bg-card dark:bg-dark-card p-6 rounded-xl shadow-lg border border-border dark:border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-muted dark:text-dark-muted">DB Connections</h3>
            <Activity size={24} className="text-cyan-500" />
          </div>
          <p className="text-3xl font-bold text-text dark:text-dark-text">{performanceMetrics.databaseConnections}</p>
        </div>
      </div>

      {/* Include the LumaChatbot component */}
      {/* <LumaChatbot /> */}
    </motion.div>
  );
};

export default MinistryDashboard;
