/**
 * Medication Management Component
 * Comprehensive medication tracking and adherence monitoring
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Pill,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Bell,
  TrendingUp,
  Activity,
  Shield,
  AlertCircle,
  Filter,
  Download,
} from 'lucide-react';
import { HealthTwin } from '../../types/healthTwin';

interface Medication {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  route: 'oral' | 'injection' | 'topical' | 'inhalation' | 'other';
  prescribedBy: string;
  prescribedDate: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  purpose: string;
  sideEffects?: string[];
  interactions?: string[];
  adherenceRate: number; // percentage
  lastTaken?: string;
  nextDue?: string;
  instructions?: string;
  refillsRemaining?: number;
  pharmacy?: string;
}

interface MedicationDose {
  id: string;
  medicationId: string;
  scheduledTime: string;
  takenTime?: string;
  status: 'scheduled' | 'taken' | 'missed' | 'skipped';
  notes?: string;
}

interface MedicationManagementProps {
  healthTwin: HealthTwin;
  patientId: string;
  className?: string;
}

export const MedicationManagement: React.FC<MedicationManagementProps> = ({
  // healthTwin,
  // patientId,
  className = '',
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive'>('active');
  // const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  // const [showAddModal, setShowAddModal] = useState(false);

  // Mock medication data - in real implementation, this would come from the API
  const medications: Medication[] = [
    {
      id: '1',
      name: 'Lisinopril',
      genericName: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      route: 'oral',
      prescribedBy: 'Dr. Smith',
      prescribedDate: '2025-01-01',
      startDate: '2025-01-01',
      isActive: true,
      purpose: 'Blood pressure control',
      adherenceRate: 95,
      lastTaken: '2025-01-20T08:00:00Z',
      nextDue: '2025-01-21T08:00:00Z',
      instructions: 'Take with food',
      refillsRemaining: 3,
      pharmacy: 'Central Pharmacy',
      sideEffects: ['Dry cough', 'Dizziness'],
      interactions: ['NSAIDs', 'Potassium supplements'],
    },
    {
      id: '2',
      name: 'Metformin',
      genericName: 'Metformin HCl',
      dosage: '500mg',
      frequency: 'Twice daily',
      route: 'oral',
      prescribedBy: 'Dr. Johnson',
      prescribedDate: '2024-12-15',
      startDate: '2024-12-15',
      isActive: true,
      purpose: 'Type 2 diabetes management',
      adherenceRate: 87,
      lastTaken: '2025-01-20T19:00:00Z',
      nextDue: '2025-01-21T08:00:00Z',
      instructions: 'Take with meals',
      refillsRemaining: 1,
      pharmacy: 'Central Pharmacy',
      sideEffects: ['Nausea', 'Diarrhea'],
      interactions: ['Alcohol', 'Contrast dyes'],
    },
    {
      id: '3',
      name: 'Atorvastatin',
      genericName: 'Atorvastatin calcium',
      dosage: '20mg',
      frequency: 'Once daily at bedtime',
      route: 'oral',
      prescribedBy: 'Dr. Smith',
      prescribedDate: '2024-11-10',
      startDate: '2024-11-10',
      isActive: true,
      purpose: 'Cholesterol management',
      adherenceRate: 92,
      lastTaken: '2025-01-20T22:00:00Z',
      nextDue: '2025-01-21T22:00:00Z',
      instructions: 'Take at bedtime',
      refillsRemaining: 2,
      pharmacy: 'Central Pharmacy',
      sideEffects: ['Muscle pain', 'Liver enzyme elevation'],
      interactions: ['Grapefruit juice', 'Warfarin'],
    },
    {
      id: '4',
      name: 'Aspirin',
      genericName: 'Acetylsalicylic acid',
      dosage: '81mg',
      frequency: 'Once daily',
      route: 'oral',
      prescribedBy: 'Dr. Smith',
      prescribedDate: '2024-10-01',
      startDate: '2024-10-01',
      endDate: '2025-01-15',
      isActive: false,
      purpose: 'Cardioprotective therapy',
      adherenceRate: 98,
      instructions: 'Take with food',
      sideEffects: ['Stomach upset', 'Bleeding risk'],
    },
  ];

  // Mock dose history
  const recentDoses: MedicationDose[] = [
    {
      id: '1',
      medicationId: '1',
      scheduledTime: '2025-01-21T08:00:00Z',
      status: 'scheduled',
    },
    {
      id: '2',
      medicationId: '2',
      scheduledTime: '2025-01-21T08:00:00Z',
      status: 'scheduled',
    },
    {
      id: '3',
      medicationId: '1',
      scheduledTime: '2025-01-20T08:00:00Z',
      takenTime: '2025-01-20T08:15:00Z',
      status: 'taken',
    },
    {
      id: '4',
      medicationId: '2',
      scheduledTime: '2025-01-20T08:00:00Z',
      status: 'missed',
    },
  ];

  const filteredMedications = medications.filter(med => {
    switch (selectedFilter) {
      case 'active':
        return med.isActive;
      case 'inactive':
        return !med.isActive;
      default:
        return true;
    }
  });

  const activeMedications = medications.filter(m => m.isActive);
  const overallAdherence = activeMedications.length > 0 
    ? Math.round(activeMedications.reduce((sum, med) => sum + med.adherenceRate, 0) / activeMedications.length)
    : 0;

  const getRouteIcon = (route: string) => {
    switch (route) {
      case 'injection':
        return <Activity className="h-4 w-4" />;
      case 'inhalation':
        return <Shield className="h-4 w-4" />;
      default:
        return <Pill className="h-4 w-4" />;
    }
  };

  const getAdherenceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
    if (rate >= 70) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
  };

  const getDoseStatusIcon = (status: string) => {
    switch (status) {
      case 'taken':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'missed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'skipped':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Active Medications</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{activeMedications.length}</p>
            </div>
            <Pill className="h-8 w-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Adherence Rate</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{overallAdherence}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Due Today</p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                {recentDoses.filter(d => d.status === 'scheduled').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Missed Doses</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                {recentDoses.filter(d => d.status === 'missed').length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card dark:bg-dark-card rounded-xl p-6 border border-border dark:border-dark-border"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted dark:text-dark-muted" />
              <span className="text-sm font-medium text-text dark:text-dark-text">Filter:</span>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-1 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text text-sm"
              >
                <option value="all">All Medications</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => console.log('Add medication modal would open')}
              className="px-4 py-2 bg-primary text-primary-text rounded-lg hover:bg-primary-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Medication
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Download className="h-4 w-4 text-muted dark:text-dark-muted" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Medications List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card dark:bg-dark-card rounded-xl border border-border dark:border-dark-border overflow-hidden"
      >
        <div className="p-6 border-b border-border dark:border-dark-border">
          <h3 className="text-xl font-semibold text-text dark:text-dark-text flex items-center">
            <Pill className="h-6 w-6 mr-2 text-primary" />
            Current Medications
          </h3>
        </div>

        <div className="divide-y divide-border dark:divide-dark-border">
          {filteredMedications.map((medication, index) => (
            <motion.div
              key={medication.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getRouteIcon(medication.route)}
                    <h4 className="text-lg font-semibold text-text dark:text-dark-text">
                      {medication.name}
                    </h4>
                    {medication.genericName && medication.genericName !== medication.name && (
                      <span className="text-sm text-muted dark:text-dark-muted">
                        ({medication.genericName})
                      </span>
                    )}
                    {!medication.isActive && (
                      <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">
                        Discontinued
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-muted dark:text-dark-muted">Dosage:</span>
                      <p className="text-sm text-text dark:text-dark-text">{medication.dosage}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted dark:text-dark-muted">Frequency:</span>
                      <p className="text-sm text-text dark:text-dark-text">{medication.frequency}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted dark:text-dark-muted">Purpose:</span>
                      <p className="text-sm text-text dark:text-dark-text">{medication.purpose}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-muted dark:text-dark-muted">Prescribed by:</span>
                      <p className="text-sm text-text dark:text-dark-text">{medication.prescribedBy}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted dark:text-dark-muted">Start Date:</span>
                      <p className="text-sm text-text dark:text-dark-text">
                        {new Date(medication.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {medication.isActive && (
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-muted dark:text-dark-muted mr-2">Adherence:</span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getAdherenceColor(medication.adherenceRate)}`}>
                          {medication.adherenceRate}%
                        </div>
                      </div>
                      {medication.nextDue && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-muted dark:text-dark-muted mr-1" />
                          <span className="text-sm text-muted dark:text-dark-muted">
                            Next: {new Date(medication.nextDue).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {medication.instructions && (
                    <div className="mb-4">
                      <span className="text-sm font-medium text-muted dark:text-dark-muted">Instructions:</span>
                      <p className="text-sm text-text dark:text-dark-text">{medication.instructions}</p>
                    </div>
                  )}

                  {medication.sideEffects && medication.sideEffects.length > 0 && (
                    <div className="mb-4">
                      <span className="text-sm font-medium text-muted dark:text-dark-muted">Side Effects:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {medication.sideEffects.map((effect, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded text-xs"
                          >
                            {effect}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Edit className="h-4 w-4 text-muted dark:text-dark-muted" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Bell className="h-4 w-4 text-muted dark:text-dark-muted" />
                  </button>
                  <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Dose History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-card dark:bg-dark-card rounded-xl border border-border dark:border-dark-border overflow-hidden"
      >
        <div className="p-6 border-b border-border dark:border-dark-border">
          <h3 className="text-xl font-semibold text-text dark:text-dark-text flex items-center">
            <Calendar className="h-6 w-6 mr-2 text-primary" />
            Recent Dose History
          </h3>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {recentDoses.map((dose, index) => {
              const medication = medications.find(m => m.id === dose.medicationId);
              if (!medication) return null;

              return (
                <motion.div
                  key={dose.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getDoseStatusIcon(dose.status)}
                    <div>
                      <p className="text-sm font-medium text-text dark:text-dark-text">
                        {medication.name} - {medication.dosage}
                      </p>
                      <p className="text-xs text-muted dark:text-dark-muted">
                        Scheduled: {new Date(dose.scheduledTime).toLocaleString()}
                      </p>
                      {dose.takenTime && (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Taken: {new Date(dose.takenTime).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      dose.status === 'taken' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                      dose.status === 'missed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                      dose.status === 'skipped' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                    }`}>
                      {dose.status}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
