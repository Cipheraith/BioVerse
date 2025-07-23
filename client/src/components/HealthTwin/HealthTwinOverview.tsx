/**
 * Health Twin Overview
 * Comprehensive overview of patient's health twin data
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Calendar,
  Heart,
  Activity,
  AlertTriangle,
  Pill,
  Shield,
  TrendingUp,
  MapPin,
  Phone,
  Clock,
  Zap,
} from 'lucide-react';
import { HealthTwin } from '../../types/healthTwin';
import healthTwinService from '../../services/healthTwinService';

interface HealthTwinOverviewProps {
  healthTwin: HealthTwin;
  healthSummary: {
    score: number;
    status: string;
    keyInsights: string[];
    nextActions: string[];
  } | null;
  allowUpdates?: boolean;
  view?: 'patient' | 'healthcare_worker' | 'admin';
}

export const HealthTwinOverview: React.FC<HealthTwinOverviewProps> = ({
  healthTwin,
  healthSummary,
  // allowUpdates = false,
  view = 'healthcare_worker',
}) => {
  const riskStyling = healthTwinService.formatRiskLevel(healthTwin.riskProfile.overall);
  const statusStyling = healthTwinService.getHealthStatusStyling(healthTwin.insights.healthStatus.status);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Patient Information */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center mb-4">
            <User className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Patient Information</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center">
              <span className="font-medium text-blue-800 dark:text-blue-200 w-20">Name:</span>
              <span className="text-blue-700 dark:text-blue-300">{healthTwin.basicInfo.name}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium text-blue-800 dark:text-blue-200 w-20">Age:</span>
              <span className="text-blue-700 dark:text-blue-300">{healthTwin.basicInfo.age} years</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium text-blue-800 dark:text-blue-200 w-20">Gender:</span>
              <span className="text-blue-700 dark:text-blue-300">{healthTwin.basicInfo.gender}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium text-blue-800 dark:text-blue-200 w-20">Blood:</span>
              <span className="text-blue-700 dark:text-blue-300">{healthTwin.basicInfo.bloodType}</span>
            </div>
            {view !== 'patient' && (
              <>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-700 dark:text-blue-300">{healthTwin.basicInfo.contact}</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <span className="text-blue-700 dark:text-blue-300">{healthTwin.basicInfo.address}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Health Status */}
        <div className={`rounded-lg p-6 border ${statusStyling.bgColor} ${statusStyling.color.replace('text-', 'border-')}`}>
          <div className="flex items-center mb-4">
            <Activity className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-semibold">Health Status</h3>
          </div>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-2">{statusStyling.icon}</div>
              <div className="text-xl font-bold">{healthTwin.insights.healthStatus.status}</div>
              {healthSummary && (
                <div className="text-2xl font-bold mt-2">
                  {healthSummary.score}/100
                  <span className="text-sm font-normal ml-1">Health Score</span>
                </div>
              )}
            </div>
            {healthTwin.insights.healthStatus.summary && (
              <p className="text-sm text-center">{healthTwin.insights.healthStatus.summary}</p>
            )}
          </div>
        </div>

        {/* Risk Assessment */}
        <div className={`rounded-lg p-6 border ${riskStyling.bgColor} ${riskStyling.color.replace('text-', 'border-')}`}>
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-semibold">Risk Assessment</h3>
          </div>
          <div className="space-y-3">
            <div className="text-center">
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${riskStyling.bgColor} ${riskStyling.color}`}>
                {riskStyling.label}
              </div>
              {healthTwin.riskAssessment && (
                <div className="mt-2 text-lg font-bold">
                  Score: {healthTwin.riskAssessment.score}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center">
                <div className="font-medium">Demographic</div>
                <div>{(healthTwin.riskProfile.demographic.score * 100).toFixed(0)}%</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Clinical</div>
                <div>{(healthTwin.riskProfile.clinical.score * 100).toFixed(0)}%</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Behavioral</div>
                <div>{(healthTwin.riskProfile.behavioral.score * 100).toFixed(0)}%</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Environmental</div>
                <div>{(healthTwin.riskProfile.environmental.score * 100).toFixed(0)}%</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Insights */}
      {healthSummary && healthSummary.keyInsights.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
            <div className="flex items-center mb-4">
              <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-2" />
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Key Insights</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {healthSummary.keyInsights.map((insight, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-purple-200 dark:border-purple-700"
                >
                  <p className="text-sm text-purple-700 dark:text-purple-300">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Medical Information Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chronic Conditions */}
        <div className="bg-card dark:bg-dark-card rounded-lg p-6 border border-border dark:border-dark-border">
          <div className="flex items-center mb-4">
            <Heart className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold">Chronic Conditions</h3>
          </div>
          {healthTwin.basicInfo.chronicConditions.length > 0 ? (
            <div className="space-y-2">
              {healthTwin.basicInfo.chronicConditions.map((condition, index) => (
                <div
                  key={index}
                  className="flex items-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3" />
                  <span className="text-red-700 dark:text-red-300">{condition}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-green-600 dark:text-green-400 text-sm">No chronic conditions reported</p>
          )}
        </div>

        {/* Current Medications */}
        <div className="bg-card dark:bg-dark-card rounded-lg p-6 border border-border dark:border-dark-border">
          <div className="flex items-center mb-4">
            <Pill className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold">Current Medications</h3>
          </div>
          {healthTwin.basicInfo.medications.length > 0 ? (
            <div className="space-y-2">
              {healthTwin.basicInfo.medications.map((medication, index) => (
                <div
                  key={index}
                  className="flex items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  <span className="text-blue-700 dark:text-blue-300">{medication}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No medications recorded</p>
          )}
        </div>

        {/* Allergies */}
        <div className="bg-card dark:bg-dark-card rounded-lg p-6 border border-border dark:border-dark-border">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="text-lg font-semibold">Allergies</h3>
          </div>
          {healthTwin.basicInfo.allergies.length > 0 ? (
            <div className="space-y-2">
              {healthTwin.basicInfo.allergies.map((allergy, index) => (
                <div
                  key={index}
                  className="flex items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                >
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3" />
                  <span className="text-yellow-700 dark:text-yellow-300">{allergy}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-green-600 dark:text-green-400 text-sm">No known allergies</p>
          )}
        </div>

        {/* Risk Factors */}
        <div className="bg-card dark:bg-dark-card rounded-lg p-6 border border-border dark:border-dark-border">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-orange-500 mr-2" />
            <h3 className="text-lg font-semibold">Risk Factors</h3>
          </div>
          {healthTwin.basicInfo.riskFactors.length > 0 ? (
            <div className="space-y-2">
              {healthTwin.basicInfo.riskFactors.map((factor, index) => (
                <div
                  key={index}
                  className="flex items-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
                >
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3" />
                  <span className="text-orange-700 dark:text-orange-300">{factor}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-green-600 dark:text-green-400 text-sm">No identified risk factors</p>
          )}
        </div>
      </motion.div>

      {/* Recent Activity Summary */}
      <motion.div variants={itemVariants}>
        <div className="bg-card dark:bg-dark-card rounded-lg p-6 border border-border dark:border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-semibold">Recent Activity</h3>
            </div>
            <div className="text-sm text-muted dark:text-dark-muted">
              Last 30 days
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {healthTwin.healthHistory.symptoms.recent.length}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Symptom Reports</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {healthTwin.healthHistory.appointments.recent.length}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Appointments</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {healthTwin.healthHistory.labResults.recent.length}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Lab Results</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pregnancy Information */}
      {healthTwin.basicInfo.isPregnant && healthTwin.pregnancyData && (
        <motion.div variants={itemVariants}>
          <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-6 border border-pink-200 dark:border-pink-700">
            <div className="flex items-center mb-4">
              <Heart className="h-6 w-6 text-pink-600 dark:text-pink-400 mr-2" />
              <h3 className="text-lg font-semibold text-pink-900 dark:text-pink-100">Pregnancy Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-pink-800 dark:text-pink-200">Due Date:</span>
                <div className="text-pink-700 dark:text-pink-300">{healthTwin.pregnancyData.estimatedDueDate}</div>
              </div>
              <div>
                <span className="font-medium text-pink-800 dark:text-pink-200">Status:</span>
                <div className="text-pink-700 dark:text-pink-300">{healthTwin.pregnancyData.healthStatus}</div>
              </div>
              <div>
                <span className="font-medium text-pink-800 dark:text-pink-200">Transport:</span>
                <div className="text-pink-700 dark:text-pink-300">
                  {healthTwin.pregnancyData.transportBooked ? 'Booked' : 'Not Booked'}
                </div>
              </div>
            </div>
            {healthTwin.pregnancyData.alerts.length > 0 && (
              <div className="mt-4">
                <span className="font-medium text-pink-800 dark:text-pink-200">Alerts:</span>
                <div className="mt-2 space-y-1">
                  {healthTwin.pregnancyData.alerts.map((alert, index) => (
                    <div key={index} className="text-sm text-pink-700 dark:text-pink-300 bg-pink-100 dark:bg-pink-800/30 px-3 py-1 rounded">
                      {alert}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Next Actions */}
      {healthSummary && healthSummary.nextActions.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
            <div className="flex items-center mb-4">
              <Calendar className="h-6 w-6 text-green-600 dark:text-green-400 mr-2" />
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Recommended Next Actions</h3>
            </div>
            <div className="space-y-2">
              {healthSummary.nextActions.map((action, index) => (
                <div
                  key={index}
                  className="flex items-start p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2" />
                  <span className="text-green-700 dark:text-green-300">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
