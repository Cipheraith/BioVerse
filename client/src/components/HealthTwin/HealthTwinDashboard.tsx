/**
 * Health Twin Dashboard
 * Main comprehensive dashboard for displaying and managing health twin data
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Brain,
  Heart,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Clock,
  ChevronRight,
  Shield,
  Zap,
  BarChart3,
  History,
  Beaker,
  Pill,
  Clipboard,
} from 'lucide-react';
import { useHealthTwin } from '../../hooks/useHealthTwin';
import { HealthTwinOverview } from './HealthTwinOverview';
import { RiskAssessment } from './RiskAssessment';
import { HealthTimeline } from './HealthTimeline';
import { PredictiveInsights } from './PredictiveInsights';
import { VitalTrends } from './VitalTrends';
import { SymptomAnalysis } from './SymptomAnalysis';
import { HealthMetrics } from './HealthMetrics';
import { LabResults } from './LabResults';
import { MedicationManagement } from './MedicationManagement';
import { CarePlanTracking } from './CarePlanTracking';

interface HealthTwinDashboardProps {
  patientId: string;
  view?: 'patient' | 'healthcare_worker' | 'admin';
  allowUpdates?: boolean;
  className?: string;
}

type TabType = 'overview' | 'trends' | 'insights' | 'timeline' | 'metrics' | 'analysis' | 'risk' | 'labs' | 'medications' | 'careplan';

const HealthTwinDashboard: React.FC<HealthTwinDashboardProps> = ({
  patientId,
  view = 'healthcare_worker',
  allowUpdates = false,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  const {
    healthTwin,
    predictiveInsights,
    visualizationData,
    loading,
    error,
    lastUpdated,
    isDataFresh,
    refetch,
    healthSummary,
    clearError,
  } = useHealthTwin(patientId, {
    comprehensive: true,
    autoRefresh: true,
    enableRealTimeUpdates: true,
  });

  const tabs = [
    {
      id: 'overview' as TabType,
      name: 'Overview',
      icon: Activity,
      description: 'Complete health profile',
    },
    {
      id: 'trends' as TabType,
      name: 'Vital Trends',
      icon: TrendingUp,
      description: 'Vital sign patterns',
    },
    {
      id: 'insights' as TabType,
      name: 'AI Insights',
      icon: Brain,
      description: 'Predictive analytics',
    },
    {
      id: 'timeline' as TabType,
      name: 'Timeline',
      icon: History,
      description: 'Health history',
    },
    {
      id: 'metrics' as TabType,
      name: 'Metrics',
      icon: BarChart3,
      description: 'Key health indicators',
    },
    {
      id: 'analysis' as TabType,
      name: 'Analysis',
      icon: Zap,
      description: 'Deep dive analytics',
    },
    {
      id: 'risk' as TabType,
      name: 'Risk Assessment',
      icon: Shield,
      description: 'Health risk evaluation',
    },
    {
      id: 'labs' as TabType,
      name: 'Lab Results',
      icon: Beaker,
      description: 'Laboratory test results',
    },
    {
      id: 'medications' as TabType,
      name: 'Medications',
      icon: Pill,
      description: 'Medication management',
    },
    {
      id: 'careplan' as TabType,
      name: 'Care Plan',
      icon: Clipboard,
      description: 'Care plan tracking',
    },
  ];

  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (err) {
      console.error('Refresh failed:', err);
    }
  };

  if (loading && !healthTwin) {
    return (
      <div className={`bg-card dark:bg-dark-card rounded-xl shadow-lg border border-border dark:border-dark-border ${className}`}>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-lg font-medium text-text dark:text-dark-text">Loading Health Twin...</p>
          <p className="text-sm text-muted dark:text-dark-muted mt-2">Analyzing comprehensive health data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-card dark:bg-dark-card rounded-xl shadow-lg border border-red-200 dark:border-red-800 ${className}`}>
        <div className="p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
            Unable to Load Health Twin
          </h3>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-primary text-primary-text rounded-lg hover:bg-primary-700 transition-colors flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </button>
            <button
              onClick={clearError}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!healthTwin) {
    return (
      <div className={`bg-card dark:bg-dark-card rounded-xl shadow-lg border border-border dark:border-dark-border ${className}`}>
        <div className="p-8 text-center">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-text dark:text-dark-text">No Health Twin Data</p>
          <p className="text-sm text-muted dark:text-dark-muted mt-2">
            Health twin data not available for this patient
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Health Summary */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card dark:bg-dark-card rounded-xl shadow-lg border border-border dark:border-dark-border overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <Heart className="h-8 w-8 mr-3" />
                Digital Health Twin
              </h2>
              <p className="text-blue-100 mt-1">
                {healthTwin.basicInfo.name} • {healthTwin.basicInfo.age} years old
              </p>
            </div>
            <div className="text-right">
              {healthSummary && (
                <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                  <div className="text-3xl font-bold">{healthSummary.score}</div>
                  <div className="text-sm text-blue-100">Health Score</div>
                </div>
              )}
            </div>
          </div>
          
          {/* Quick Insights */}
          {healthSummary && healthSummary.keyInsights.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {healthSummary.keyInsights.slice(0, 3).map((insight, index) => (
                <span
                  key={index}
                  className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm"
                >
                  {insight}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-t border-border dark:border-dark-border">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted dark:text-dark-muted" />
                <span className="text-muted dark:text-dark-muted">
                  Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
                </span>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${isDataFresh ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="text-muted dark:text-dark-muted">
                  {isDataFresh ? 'Data Fresh' : 'Data Stale'}
                </span>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center px-3 py-1 text-primary hover:text-primary-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="bg-card dark:bg-dark-card rounded-xl shadow-lg border border-border dark:border-dark-border">
        <div className="border-b border-border dark:border-dark-border">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary dark:text-primary-300 bg-primary/5'
                      : 'border-transparent text-muted dark:text-dark-muted hover:text-text dark:hover:text-dark-text hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  <div className="text-left">
                    <div>{tab.name}</div>
                    <div className="text-xs opacity-75">{tab.description}</div>
                  </div>
                  {activeTab === tab.id && (
                    <ChevronRight className="h-4 w-4 ml-2" />
                  )}
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <HealthTwinOverview
                healthTwin={healthTwin}
                healthSummary={healthSummary}
                allowUpdates={allowUpdates}
                view={view}
              />
            )}

            {activeTab === 'trends' && (
              <VitalTrends
                healthTwin={healthTwin}
                visualizationData={visualizationData}
                patientId={patientId}
              />
            )}

            {activeTab === 'insights' && (
              <PredictiveInsights
                healthTwin={healthTwin}
                predictiveInsights={predictiveInsights}
                patientId={patientId}
              />
            )}

            {activeTab === 'timeline' && (
              <HealthTimeline
                healthTwin={healthTwin}
                patientId={patientId}
              />
            )}

            {activeTab === 'metrics' && (
              <HealthMetrics
                healthTwin={healthTwin}
                visualizationData={visualizationData}
                view={view}
              />
            )}

            {activeTab === 'analysis' && (
              <SymptomAnalysis
                healthTwin={healthTwin}
                predictiveInsights={predictiveInsights}
                patientId={patientId}
              />
            )}

            {activeTab === 'risk' && (
              <RiskAssessment
                healthTwin={healthTwin}
              />
            )}

            {activeTab === 'labs' && (
              <LabResults
                healthTwin={healthTwin}
                patientId={patientId}
              />
            )}

            {activeTab === 'medications' && (
              <MedicationManagement
                healthTwin={healthTwin}
                patientId={patientId}
              />
            )}

            {activeTab === 'careplan' && (
              <CarePlanTracking
                healthTwin={healthTwin}
                patientId={patientId}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export { HealthTwinDashboard };
export default HealthTwinDashboard;
