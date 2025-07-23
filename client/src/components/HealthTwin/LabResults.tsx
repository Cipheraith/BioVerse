/**
 * Lab Results Visualization Component
 * Interactive display of laboratory test results with trends and analysis
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Beaker,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Target,
  Activity,
  Droplets,
  Heart,
  Zap,
} from 'lucide-react';
import { HealthTwin } from '../../types/healthTwin';

interface LabResult {
  id: string;
  testName: string;
  value: number;
  unit: string;
  referenceRange: {
    min: number;
    max: number;
  };
  status: 'normal' | 'low' | 'high' | 'critical';
  date: string;
  category: 'hematology' | 'chemistry' | 'lipids' | 'hormones' | 'immunology' | 'other';
  trend?: 'up' | 'down' | 'stable';
  previousValue?: number;
  notes?: string;
}

interface LabResultsProps {
  healthTwin: HealthTwin;
  patientId: string;
  className?: string;
}

export const LabResults: React.FC<LabResultsProps> = ({
  // healthTwin,
  // patientId,
  className = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y'>('3m');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date');

  // Mock lab results data - in real implementation, this would come from the API
  const labResults: LabResult[] = [
    {
      id: '1',
      testName: 'Hemoglobin',
      value: 13.5,
      unit: 'g/dL',
      referenceRange: { min: 12.0, max: 15.5 },
      status: 'normal',
      date: '2025-01-15',
      category: 'hematology',
      trend: 'stable',
      previousValue: 13.2,
    },
    {
      id: '2',
      testName: 'White Blood Cell Count',
      value: 11.2,
      unit: 'K/uL',
      referenceRange: { min: 4.5, max: 11.0 },
      status: 'high',
      date: '2025-01-15',
      category: 'hematology',
      trend: 'up',
      previousValue: 9.8,
      notes: 'Slightly elevated, monitor for infection',
    },
    {
      id: '3',
      testName: 'Total Cholesterol',
      value: 195,
      unit: 'mg/dL',
      referenceRange: { min: 0, max: 200 },
      status: 'normal',
      date: '2025-01-10',
      category: 'lipids',
      trend: 'down',
      previousValue: 210,
    },
    {
      id: '4',
      testName: 'HDL Cholesterol',
      value: 38,
      unit: 'mg/dL',
      referenceRange: { min: 40, max: 100 },
      status: 'low',
      date: '2025-01-10',
      category: 'lipids',
      trend: 'stable',
      previousValue: 39,
      notes: 'Below recommended level, consider lifestyle changes',
    },
    {
      id: '5',
      testName: 'Glucose (Fasting)',
      value: 102,
      unit: 'mg/dL',
      referenceRange: { min: 70, max: 100 },
      status: 'high',
      date: '2025-01-12',
      category: 'chemistry',
      trend: 'up',
      previousValue: 95,
      notes: 'Slightly elevated, pre-diabetic range',
    },
    {
      id: '6',
      testName: 'Creatinine',
      value: 0.9,
      unit: 'mg/dL',
      referenceRange: { min: 0.6, max: 1.2 },
      status: 'normal',
      date: '2025-01-15',
      category: 'chemistry',
      trend: 'stable',
      previousValue: 0.8,
    },
  ];

  const categories = [
    { id: 'all', name: 'All Tests', icon: Beaker },
    { id: 'hematology', name: 'Blood Count', icon: Droplets },
    { id: 'chemistry', name: 'Chemistry', icon: Zap },
    { id: 'lipids', name: 'Lipid Panel', icon: Heart },
    { id: 'hormones', name: 'Hormones', icon: Activity },
    { id: 'immunology', name: 'Immunology', icon: Target },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300';
      case 'low':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'normal':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
      case 'high':
      case 'low':
        return <AlertCircle className="h-4 w-4" />;
      case 'normal':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const filteredResults = labResults.filter(result => 
    selectedCategory === 'all' || result.category === selectedCategory
  );

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.testName.localeCompare(b.testName);
      case 'status': {
        const statusOrder = { critical: 0, high: 1, low: 2, normal: 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      }
      case 'date':
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  const abnormalResults = labResults.filter(r => r.status !== 'normal');
  const criticalResults = labResults.filter(r => r.status === 'critical');

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
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Tests</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{labResults.length}</p>
            </div>
            <Beaker className="h-8 w-8 text-blue-500" />
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
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Normal</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {labResults.filter(r => r.status === 'normal').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
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
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Abnormal</p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{abnormalResults.length}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-500" />
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
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Critical</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">{criticalResults.length}</p>
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
              <span className="text-sm font-medium text-text dark:text-dark-text">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text text-sm"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted dark:text-dark-muted" />
              <span className="text-sm font-medium text-text dark:text-dark-text">Period:</span>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '1m' | '3m' | '6m' | '1y')}
                className="px-3 py-1 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text text-sm"
              >
                <option value="1m">Last Month</option>
                <option value="3m">Last 3 Months</option>
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-text dark:text-dark-text">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'status')}
                className="px-3 py-1 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text text-sm"
              >
                <option value="date">Date</option>
                <option value="name">Test Name</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <RefreshCw className="h-4 w-4 text-muted dark:text-dark-muted" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Download className="h-4 w-4 text-muted dark:text-dark-muted" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Lab Results Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card dark:bg-dark-card rounded-xl border border-border dark:border-dark-border overflow-hidden"
      >
        <div className="p-6 border-b border-border dark:border-dark-border">
          <h3 className="text-xl font-semibold text-text dark:text-dark-text flex items-center">
            <Beaker className="h-6 w-6 mr-2 text-primary" />
            Laboratory Results
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted dark:text-dark-muted uppercase tracking-wider">
                  Test Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted dark:text-dark-muted uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted dark:text-dark-muted uppercase tracking-wider">
                  Reference Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted dark:text-dark-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted dark:text-dark-muted uppercase tracking-wider">
                  Trend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted dark:text-dark-muted uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted dark:text-dark-muted uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-dark-border">
              {sortedResults.map((result, index) => (
                <motion.tr
                  key={result.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-text dark:text-dark-text">
                      {result.testName}
                    </div>
                    <div className="text-xs text-muted dark:text-dark-muted capitalize">
                      {result.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-text dark:text-dark-text">
                      <span className="font-semibold">{result.value}</span> {result.unit}
                    </div>
                    {result.previousValue && (
                      <div className="text-xs text-muted dark:text-dark-muted">
                        Previous: {result.previousValue} {result.unit}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted dark:text-dark-muted">
                    {result.referenceRange.min} - {result.referenceRange.max} {result.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                      {getStatusIcon(result.status)}
                      <span className="ml-1 capitalize">{result.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTrendIcon(result.trend)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted dark:text-dark-muted">
                    {new Date(result.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted dark:text-dark-muted max-w-xs">
                    <div className="truncate" title={result.notes}>
                      {result.notes || '-'}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
