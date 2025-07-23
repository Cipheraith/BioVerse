/**
 * Risk Assessment Component
 * Detailed risk assessment visualization for health twins
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  MapPin,
  Heart,
} from 'lucide-react';
import { HealthTwin } from '../../types/healthTwin';
import healthTwinService from '../../services/healthTwinService';

interface RiskAssessmentProps {
  healthTwin: HealthTwin;
  className?: string;
}

export const RiskAssessment: React.FC<RiskAssessmentProps> = ({
  healthTwin,
  className = '',
}) => {
  const riskStyling = healthTwinService.formatRiskLevel(healthTwin.riskProfile.overall);

  const riskCategories = [
    {
      name: 'Demographic Risk',
      icon: Users,
      score: healthTwin.riskProfile.demographic.score,
      factors: healthTwin.riskProfile.demographic.factors,
      color: 'blue',
    },
    {
      name: 'Clinical Risk',
      icon: Heart,
      score: healthTwin.riskProfile.clinical.score,
      factors: healthTwin.riskProfile.clinical.factors,
      color: 'red',
    },
    {
      name: 'Behavioral Risk',
      icon: Activity,
      score: healthTwin.riskProfile.behavioral.score,
      factors: healthTwin.riskProfile.behavioral.factors,
      color: 'orange',
    },
    {
      name: 'Environmental Risk',
      icon: MapPin,
      score: healthTwin.riskProfile.environmental.score,
      factors: healthTwin.riskProfile.environmental.factors,
      color: 'green',
    },
  ];

  const getScoreColor = (score: number): string => {
    if (score >= 0.7) return 'text-red-600 bg-red-100';
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getScoreBarColor = (score: number): string => {
    if (score >= 0.7) return 'bg-red-500';
    if (score >= 0.4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

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
      className={`space-y-6 ${className}`}
    >
      {/* Overall Risk Assessment */}
      <motion.div variants={itemVariants}>
        <div className={`${riskStyling.bgColor} rounded-xl p-6 border ${riskStyling.color.replace('text-', 'border-')}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 mr-3" />
              <h2 className="text-2xl font-bold">Overall Risk Assessment</h2>
            </div>
            <div className={`px-6 py-2 rounded-full text-lg font-semibold ${riskStyling.bgColor} ${riskStyling.color}`}>
              {riskStyling.label}
            </div>
          </div>

          {healthTwin.riskAssessment && (
            <div className="text-center mb-4">
              <div className="text-4xl font-bold mb-2">
                {healthTwin.riskAssessment.score}
              </div>
              <div className="text-sm opacity-75">Risk Score</div>
            </div>
          )}

          {healthTwin.riskAssessment?.factors.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Contributing Factors:</h3>
              <div className="flex flex-wrap gap-2">
                {healthTwin.riskAssessment.factors.map((factor, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Risk Categories Breakdown */}
      <motion.div variants={itemVariants}>
        <div className="bg-card dark:bg-dark-card rounded-xl p-6 border border-border dark:border-dark-border">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <TrendingUp className="h-6 w-6 mr-2 text-primary" />
            Risk Categories Breakdown
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {riskCategories.map((category, index) => {
              const Icon = category.icon;
              const scorePercentage = Math.round(category.score * 100);
              
              return (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Icon className={`h-5 w-5 mr-2 text-${category.color}-500`} />
                      <h4 className="font-medium text-text dark:text-dark-text">
                        {category.name}
                      </h4>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${getScoreColor(category.score)}`}>
                      {scorePercentage}%
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                    <motion.div
                      className={`h-2 rounded-full ${getScoreBarColor(category.score)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${scorePercentage}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  </div>

                  {/* Risk Factors */}
                  {category.factors.length > 0 ? (
                    <div className="space-y-1">
                      {category.factors.slice(0, 3).map((factor, factorIndex) => (
                        <div
                          key={factorIndex}
                          className="text-xs text-muted dark:text-dark-muted flex items-center"
                        >
                          <div className={`w-1 h-1 bg-${category.color}-500 rounded-full mr-2`} />
                          {factor}
                        </div>
                      ))}
                      {category.factors.length > 3 && (
                        <div className="text-xs text-muted dark:text-dark-muted">
                          +{category.factors.length - 3} more factors
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-green-600 dark:text-green-400">
                      No risk factors identified
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Risk Alerts */}
      {healthTwin.insights.alerts.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-700">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mr-2" />
              <h3 className="text-xl font-semibold text-yellow-900 dark:text-yellow-100">
                Health Alerts
              </h3>
            </div>

            <div className="space-y-3">
              {healthTwin.insights.alerts.map((alert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${
                    alert.priority === 'high'
                      ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700'
                      : alert.priority === 'medium'
                      ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700'
                      : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700'
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                      alert.priority === 'high' ? 'bg-red-500' :
                      alert.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-medium ${
                          alert.priority === 'high' ? 'text-red-800 dark:text-red-200' :
                          alert.priority === 'medium' ? 'text-yellow-800 dark:text-yellow-200' :
                          'text-blue-800 dark:text-blue-200'
                        }`}>
                          {alert.type.replace('_', ' ').toUpperCase()}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          alert.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-800/30 dark:text-red-300' :
                          alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-800/30 dark:text-yellow-300' :
                          'bg-blue-100 text-blue-600 dark:bg-blue-800/30 dark:text-blue-300'
                        }`}>
                          {alert.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className={`text-sm ${
                        alert.priority === 'high' ? 'text-red-700 dark:text-red-300' :
                        alert.priority === 'medium' ? 'text-yellow-700 dark:text-yellow-300' :
                        'text-blue-700 dark:text-blue-300'
                      }`}>
                        {alert.message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Risk Indicators */}
      {healthTwin.insights.riskIndicators.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="bg-card dark:bg-dark-card rounded-xl p-6 border border-border dark:border-dark-border">
            <div className="flex items-center mb-4">
              <TrendingDown className="h-6 w-6 text-orange-500 mr-2" />
              <h3 className="text-xl font-semibold">Risk Indicators</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {healthTwin.insights.riskIndicators.map((indicator, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${
                    indicator.risk === 'high'
                      ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700'
                      : indicator.risk === 'medium'
                      ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700'
                      : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-medium text-sm ${
                      indicator.risk === 'high' ? 'text-red-800 dark:text-red-200' :
                      indicator.risk === 'medium' ? 'text-yellow-800 dark:text-yellow-200' :
                      'text-green-800 dark:text-green-200'
                    }`}>
                      {indicator.type.replace('_', ' ').toUpperCase()}
                    </h4>
                    <div className={`w-2 h-2 rounded-full ${
                      indicator.risk === 'high' ? 'bg-red-500' :
                      indicator.risk === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                  </div>
                  <p className={`text-xs ${
                    indicator.risk === 'high' ? 'text-red-600 dark:text-red-300' :
                    indicator.risk === 'medium' ? 'text-yellow-600 dark:text-yellow-300' :
                    'text-green-600 dark:text-green-300'
                  }`}>
                    {indicator.factor}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Recommendations */}
      {healthTwin.insights.recommendations.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                Risk Mitigation Recommendations
              </h3>
            </div>

            <div className="space-y-3">
              {healthTwin.insights.recommendations.slice(0, 5).map((recommendation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2" />
                  <span className="text-blue-700 dark:text-blue-300 text-sm">
                    {recommendation}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
