/**
 * Patient Detail Page
 * Comprehensive patient view with health twin integration
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Heart,
  Activity,
  FileText,
  Settings,
  Share2,
  Download,
  Bell,
  Clock,
  Users,
} from 'lucide-react';
import { HealthTwinDashboard } from '../components/HealthTwin/HealthTwinDashboard';
import { useAuth } from '../hooks/useAuth';
import { NotificationBell, ToastNotifications, NotificationProvider } from '../components/common/NotificationSystem';

interface Patient {
  id: string;
  name: string;
  age: number;
  dateOfBirth: string;
  gender: string;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalRecordNumber: string;
  primaryProvider?: string;
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
  };
  lastVisit?: string;
  upcomingAppointments?: number;
  activeAlerts?: number;
}

const PatientDetail: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'overview' | 'health-twin' | 'records' | 'appointments'>('health-twin');

  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) {
        setError('Patient ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/patients/${patientId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch patient data');
        }

        const data = await response.json();
        setPatient(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  const handleBack = () => {
    navigate('/patients');
  };

  const sections = [
    {
      id: 'overview' as const,
      name: 'Overview',
      icon: User,
      description: 'Basic patient information',
    },
    {
      id: 'health-twin' as const,
      name: 'Health Twin',
      icon: Heart,
      description: 'Digital health twin dashboard',
    },
    {
      id: 'records' as const,
      name: 'Medical Records',
      icon: FileText,
      description: 'Medical history and documents',
    },
    {
      id: 'appointments' as const,
      name: 'Appointments',
      icon: Calendar,
      description: 'Past and upcoming visits',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-dark-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-card dark:bg-dark-card rounded-xl shadow-lg border border-border dark:border-dark-border p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-lg font-medium text-text dark:text-dark-text">Loading Patient Details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-background dark:bg-dark-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-card dark:bg-dark-card rounded-xl shadow-lg border border-red-200 dark:border-red-800 p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
              Unable to Load Patient
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Patient not found'}</p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-primary text-primary-text rounded-lg hover:bg-primary-700 transition-colors flex items-center mx-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patients
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-background dark:bg-dark-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card dark:bg-dark-card rounded-xl shadow-lg border border-border dark:border-dark-border overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={handleBack}
                  className="mr-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold flex items-center">
                    <User className="h-8 w-8 mr-3" />
                    {patient.name}
                  </h1>
                  <div className="flex items-center mt-2 space-x-4 text-blue-100">
                    <span>{patient.age} years old</span>
                    <span>•</span>
                    <span>MRN: {patient.medicalRecordNumber}</span>
                    {patient.primaryProvider && (
                      <>
                        <span>•</span>
                        <span>Dr. {patient.primaryProvider}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {patient.activeAlerts && patient.activeAlerts > 0 && (
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
                    <Bell className="h-4 w-4 mr-1" />
                    {patient.activeAlerts} Alert{patient.activeAlerts > 1 ? 's' : ''}
                  </div>
                )}
                
                {hasPermission('patient:edit') && (
                  <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <Settings className="h-5 w-5" />
                  </button>
                )}
                
                <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <Share2 className="h-5 w-5" />
                </button>
                
                <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <Download className="h-5 w-5" />
                </button>
                
                <NotificationBell />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                <div>
                  <div className="text-sm font-medium text-text dark:text-dark-text">Last Visit</div>
                  <div className="text-xs text-muted dark:text-dark-muted">
                    {patient.lastVisit || 'No recent visits'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-500 mr-2" />
                <div>
                  <div className="text-sm font-medium text-text dark:text-dark-text">Upcoming</div>
                  <div className="text-xs text-muted dark:text-dark-muted">
                    {patient.upcomingAppointments || 0} appointment{patient.upcomingAppointments !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <Activity className="h-5 w-5 text-purple-500 mr-2" />
                <div>
                  <div className="text-sm font-medium text-text dark:text-dark-text">Health Twin</div>
                  <div className="text-xs text-green-600 dark:text-green-400">Active</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <Users className="h-5 w-5 text-orange-500 mr-2" />
                <div>
                  <div className="text-sm font-medium text-text dark:text-dark-text">Care Team</div>
                  <div className="text-xs text-muted dark:text-dark-muted">3 providers</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card dark:bg-dark-card rounded-xl shadow-lg border border-border dark:border-dark-border"
        >
          <div className="border-b border-border dark:border-dark-border">
            <nav className="flex overflow-x-auto">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeSection === section.id
                        ? 'border-primary text-primary dark:text-primary-300 bg-primary/5'
                        : 'border-transparent text-muted dark:text-dark-muted hover:text-text dark:hover:text-dark-text hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    <div className="text-left">
                      <div>{section.name}</div>
                      <div className="text-xs opacity-75">{section.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeSection === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 text-text dark:text-dark-text">Basic Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-3 text-muted dark:text-dark-muted" />
                        <span className="text-sm text-text dark:text-dark-text">
                          Born {patient.dateOfBirth} ({patient.gender})
                        </span>
                      </div>
                      {patient.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-3 text-muted dark:text-dark-muted" />
                          <span className="text-sm text-text dark:text-dark-text">{patient.phone}</span>
                        </div>
                      )}
                      {patient.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-3 text-muted dark:text-dark-muted" />
                          <span className="text-sm text-text dark:text-dark-text">{patient.email}</span>
                        </div>
                      )}
                      {patient.address && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-3 text-muted dark:text-dark-muted" />
                          <span className="text-sm text-text dark:text-dark-text">{patient.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  {patient.emergencyContact && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4 text-text dark:text-dark-text">Emergency Contact</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-text dark:text-dark-text">
                            {patient.emergencyContact.name}
                          </span>
                          <span className="text-sm text-muted dark:text-dark-muted ml-2">
                            ({patient.emergencyContact.relationship})
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-3 text-muted dark:text-dark-muted" />
                          <span className="text-sm text-text dark:text-dark-text">
                            {patient.emergencyContact.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Insurance Information */}
                  {patient.insuranceInfo && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 lg:col-span-2">
                      <h3 className="text-lg font-semibold mb-4 text-text dark:text-dark-text">Insurance Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-muted dark:text-dark-muted">Provider</span>
                          <div className="text-sm text-text dark:text-dark-text">
                            {patient.insuranceInfo.provider}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted dark:text-dark-muted">Policy Number</span>
                          <div className="text-sm text-text dark:text-dark-text">
                            {patient.insuranceInfo.policyNumber}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'health-twin' && patientId && (
                <HealthTwinDashboard
                  patientId={patientId}
                  view={user?.role === 'patient' ? 'patient' : 'healthcare_worker'}
                  allowUpdates={hasPermission('health_twin:edit')}
                />
              )}

              {activeSection === 'records' && (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-muted dark:text-dark-muted mx-auto mb-4" />
                  <p className="text-lg font-medium text-text dark:text-dark-text mb-2">Medical Records</p>
                  <p className="text-muted dark:text-dark-muted">
                    Medical records functionality will be implemented here
                  </p>
                </div>
              )}

              {activeSection === 'appointments' && (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-muted dark:text-dark-muted mx-auto mb-4" />
                  <p className="text-lg font-medium text-text dark:text-dark-text mb-2">Appointments</p>
                  <p className="text-muted dark:text-dark-muted">
                    Appointment management functionality will be implemented here
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
      
        <ToastNotifications />
      </div>
    </NotificationProvider>
  );
};

export default PatientDetail;
