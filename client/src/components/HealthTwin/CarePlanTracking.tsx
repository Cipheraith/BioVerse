/**
 * Care Plan Tracking Component
 * Comprehensive care plan management and progress tracking
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  Award,
  Filter,
  Plus,
  Edit,
  Activity,
  Heart,
  Brain,
  Zap,
  Phone,
} from 'lucide-react';
import { HealthTwin } from '../../types/healthTwin';

interface CarePlanGoal {
  id: string;
  title: string;
  description: string;
  category: 'medication' | 'lifestyle' | 'monitoring' | 'therapy' | 'education';
  priority: 'high' | 'medium' | 'low';
  status: 'not_started' | 'in_progress' | 'completed' | 'paused' | 'cancelled';
  progress: number; // percentage 0-100
  targetDate: string;
  createdDate: string;
  assignedTo: string[];
  tasks: CarePlanTask[];
  outcomes: string[];
  metrics?: {
    name: string;
    target: number;
    current: number;
    unit: string;
  }[];
}

interface CarePlanTask {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  completedDate?: string;
  status: 'pending' | 'completed' | 'overdue';
  assignedTo: string;
  notes?: string;
}

interface CareTeamMember {
  id: string;
  name: string;
  role: string;
  specialty?: string;
  phone?: string;
  email?: string;
  primaryContact: boolean;
}

interface CarePlanTrackingProps {
  healthTwin: HealthTwin;
  patientId: string;
  className?: string;
}

export const CarePlanTracking: React.FC<CarePlanTrackingProps> = ({
  // healthTwin,
  // patientId,
  className = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('active');
  const [activeView, setActiveView] = useState<'goals' | 'tasks' | 'team' | 'progress'>('goals');

  // Mock care team data
  const careTeam: CareTeamMember[] = [
    {
      id: '1',
      name: 'Dr. Sarah Smith',
      role: 'Primary Care Physician',
      specialty: 'Internal Medicine',
      phone: '(555) 123-4567',
      email: 'sarah.smith@hospital.com',
      primaryContact: true,
    },
    {
      id: '2',
      name: 'Dr. Michael Johnson',
      role: 'Cardiologist',
      specialty: 'Cardiovascular Medicine',
      phone: '(555) 234-5678',
      email: 'michael.johnson@cardio.com',
      primaryContact: false,
    },
    {
      id: '3',
      name: 'Lisa Rodriguez',
      role: 'Nurse Practitioner',
      specialty: 'Diabetes Education',
      phone: '(555) 345-6789',
      email: 'lisa.rodriguez@hospital.com',
      primaryContact: false,
    },
    {
      id: '4',
      name: 'James Wilson',
      role: 'Physical Therapist',
      phone: '(555) 456-7890',
      email: 'james.wilson@therapy.com',
      primaryContact: false,
    },
  ];

  // Mock care plan goals
  const carePlanGoals: CarePlanGoal[] = [
    {
      id: '1',
      title: 'Blood Pressure Control',
      description: 'Achieve and maintain blood pressure below 130/80 mmHg',
      category: 'monitoring',
      priority: 'high',
      status: 'in_progress',
      progress: 75,
      targetDate: '2025-03-01',
      createdDate: '2025-01-01',
      assignedTo: ['1', '2'],
      outcomes: ['Reduced cardiovascular risk', 'Improved quality of life'],
      metrics: [
        {
          name: 'Systolic BP',
          target: 130,
          current: 135,
          unit: 'mmHg',
        },
        {
          name: 'Diastolic BP',
          target: 80,
          current: 82,
          unit: 'mmHg',
        },
      ],
      tasks: [
        {
          id: '1',
          title: 'Take daily BP medication',
          dueDate: '2025-01-21',
          status: 'completed',
          completedDate: '2025-01-21',
          assignedTo: 'Patient',
        },
        {
          id: '2',
          title: 'Weekly BP monitoring',
          dueDate: '2025-01-22',
          status: 'pending',
          assignedTo: 'Patient',
        },
      ],
    },
    {
      id: '2',
      title: 'Diabetes Management',
      description: 'Achieve HbA1c below 7% through medication and lifestyle changes',
      category: 'medication',
      priority: 'high',
      status: 'in_progress',
      progress: 60,
      targetDate: '2025-04-01',
      createdDate: '2024-12-15',
      assignedTo: ['1', '3'],
      outcomes: ['Better glucose control', 'Prevention of complications'],
      metrics: [
        {
          name: 'HbA1c',
          target: 7.0,
          current: 7.8,
          unit: '%',
        },
        {
          name: 'Fasting Glucose',
          target: 100,
          current: 110,
          unit: 'mg/dL',
        },
      ],
      tasks: [
        {
          id: '3',
          title: 'Take Metformin twice daily',
          dueDate: '2025-01-21',
          status: 'completed',
          completedDate: '2025-01-21',
          assignedTo: 'Patient',
        },
        {
          id: '4',
          title: 'Diabetes education session',
          dueDate: '2025-01-25',
          status: 'pending',
          assignedTo: 'Lisa Rodriguez',
        },
      ],
    },
    {
      id: '3',
      title: 'Weight Management',
      description: 'Lose 20 pounds through diet and exercise modifications',
      category: 'lifestyle',
      priority: 'medium',
      status: 'in_progress',
      progress: 40,
      targetDate: '2025-06-01',
      createdDate: '2025-01-10',
      assignedTo: ['1', '4'],
      outcomes: ['Improved mobility', 'Reduced joint pain', 'Better cardiovascular health'],
      metrics: [
        {
          name: 'Weight',
          target: 180,
          current: 192,
          unit: 'lbs',
        },
        {
          name: 'BMI',
          target: 25,
          current: 27.5,
          unit: 'kg/m²',
        },
      ],
      tasks: [
        {
          id: '5',
          title: 'Physical therapy consultation',
          dueDate: '2025-01-23',
          status: 'pending',
          assignedTo: 'James Wilson',
        },
        {
          id: '6',
          title: 'Daily 30-minute walk',
          dueDate: '2025-01-21',
          status: 'completed',
          completedDate: '2025-01-21',
          assignedTo: 'Patient',
        },
      ],
    },
    {
      id: '4',
      title: 'Cholesterol Management',
      description: 'Reduce LDL cholesterol to below 100 mg/dL',
      category: 'medication',
      priority: 'medium',
      status: 'completed',
      progress: 100,
      targetDate: '2025-02-01',
      createdDate: '2024-11-10',
      assignedTo: ['1'],
      outcomes: ['Reduced cardiovascular risk'],
      metrics: [
        {
          name: 'LDL Cholesterol',
          target: 100,
          current: 95,
          unit: 'mg/dL',
        },
        {
          name: 'Total Cholesterol',
          target: 200,
          current: 185,
          unit: 'mg/dL',
        },
      ],
      tasks: [
        {
          id: '7',
          title: 'Take Atorvastatin daily',
          dueDate: '2025-01-21',
          status: 'completed',
          completedDate: '2025-01-21',
          assignedTo: 'Patient',
        },
      ],
    },
  ];

  const categories = [
    { id: 'all', name: 'All Goals', icon: Target },
    { id: 'medication', name: 'Medication', icon: Zap },
    { id: 'lifestyle', name: 'Lifestyle', icon: Activity },
    { id: 'monitoring', name: 'Monitoring', icon: Heart },
    { id: 'therapy', name: 'Therapy', icon: Users },
    { id: 'education', name: 'Education', icon: Brain },
  ];

  const views = [
    { id: 'goals' as const, name: 'Goals', icon: Target },
    { id: 'tasks' as const, name: 'Tasks', icon: CheckCircle },
    { id: 'team' as const, name: 'Care Team', icon: Users },
    { id: 'progress' as const, name: 'Progress', icon: TrendingUp },
  ];

  const filteredGoals = carePlanGoals.filter(goal => {
    const categoryMatch = selectedCategory === 'all' || goal.category === selectedCategory;
    const statusMatch = selectedStatus === 'all' || 
      (selectedStatus === 'active' && ['not_started', 'in_progress'].includes(goal.status)) ||
      (selectedStatus === 'completed' && goal.status === 'completed') ||
      (selectedStatus === 'paused' && goal.status === 'paused');
    return categoryMatch && statusMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300';
      case 'paused':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'cancelled':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const allTasks = carePlanGoals.flatMap(goal => 
    goal.tasks.map(task => ({ ...task, goalTitle: goal.title }))
  );
  const pendingTasks = allTasks.filter(task => task.status === 'pending');

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
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Active Goals</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {carePlanGoals.filter(g => ['not_started', 'in_progress'].includes(g.status)).length}
              </p>
            </div>
            <Target className="h-8 w-8 text-blue-500" />
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
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Completed Goals</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {carePlanGoals.filter(g => g.status === 'completed').length}
              </p>
            </div>
            <Award className="h-8 w-8 text-green-500" />
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
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending Tasks</p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{pendingTasks.length}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Care Team</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{careTeam.length}</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </motion.div>
      </div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card dark:bg-dark-card rounded-xl border border-border dark:border-dark-border"
      >
        <div className="border-b border-border dark:border-dark-border">
          <nav className="flex overflow-x-auto">
            {views.map((view) => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeView === view.id
                      ? 'border-primary text-primary dark:text-primary-300 bg-primary/5'
                      : 'border-transparent text-muted dark:text-dark-muted hover:text-text dark:hover:text-dark-text hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {view.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeView === 'goals' && (
              <div className="space-y-6">
                {/* Controls */}
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
                      <span className="text-sm font-medium text-text dark:text-dark-text">Status:</span>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-3 py-1 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text text-sm"
                      >
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="paused">Paused</option>
                      </select>
                    </div>
                  </div>

                  <button className="px-4 py-2 bg-primary text-primary-text rounded-lg hover:bg-primary-700 transition-colors flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Goal
                  </button>
                </div>

                {/* Goals List */}
                <div className="space-y-4">
                  {filteredGoals.map((goal, index) => (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-text dark:text-dark-text">{goal.title}</h4>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                              {goal.status.replace('_', ' ').toUpperCase()}
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                              {goal.priority.toUpperCase()} PRIORITY
                            </div>
                          </div>
                          <p className="text-sm text-muted dark:text-dark-muted mb-4">{goal.description}</p>
                        </div>
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <Edit className="h-4 w-4 text-muted dark:text-dark-muted" />
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-text dark:text-dark-text">Progress</span>
                          <span className="text-sm text-muted dark:text-dark-muted">{goal.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <motion.div
                            className="bg-primary h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${goal.progress}%` }}
                            transition={{ duration: 1, delay: index * 0.2 }}
                          />
                        </div>
                      </div>

                      {/* Metrics */}
                      {goal.metrics && goal.metrics.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {goal.metrics.map((metric, idx) => (
                            <div key={idx} className="bg-white dark:bg-gray-700 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-text dark:text-dark-text">{metric.name}</span>
                                <span className="text-sm text-muted dark:text-dark-muted">
                                  {metric.current} / {metric.target} {metric.unit}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-2">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    metric.current <= metric.target ? 'bg-green-500' : 'bg-red-500'
                                  }`}
                                  style={{
                                    width: `${Math.min((metric.current / metric.target) * 100, 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tasks Summary */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-muted dark:text-dark-muted">
                            Tasks: {goal.tasks.filter(t => t.status === 'completed').length} / {goal.tasks.length} completed
                          </span>
                          <span className="text-muted dark:text-dark-muted">
                            Target: {new Date(goal.targetDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {goal.assignedTo.slice(0, 3).map(assigneeId => {
                            const member = careTeam.find(m => m.id === assigneeId);
                            return member ? (
                              <div
                                key={assigneeId}
                                className="w-6 h-6 bg-primary text-primary-text rounded-full flex items-center justify-center text-xs font-medium"
                                title={member.name}
                              >
                                {member.name.charAt(0)}
                              </div>
                            ) : null;
                          })}
                          {goal.assignedTo.length > 3 && (
                            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full flex items-center justify-center text-xs font-medium">
                              +{goal.assignedTo.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeView === 'tasks' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-text dark:text-dark-text">Upcoming Tasks</h3>
                <div className="space-y-3">
                  {pendingTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-medium text-text dark:text-dark-text">{task.title}</p>
                          <p className="text-sm text-muted dark:text-dark-muted">
                            Goal: {task.goalTitle} • Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted dark:text-dark-muted">{task.assignedTo}</span>
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeView === 'team' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-text dark:text-dark-text">Care Team Members</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {careTeam.map((member) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-primary text-primary-text rounded-full flex items-center justify-center text-lg font-semibold">
                          {member.name.split(' ').map(n => n.charAt(0)).join('')}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-text dark:text-dark-text">{member.name}</h4>
                            {member.primaryContact && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-full text-xs font-medium">
                                Primary
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted dark:text-dark-muted">{member.role}</p>
                          {member.specialty && (
                            <p className="text-xs text-muted dark:text-dark-muted">{member.specialty}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2">
                            {member.phone && (
                              <div className="flex items-center text-xs text-muted dark:text-dark-muted">
                                <Phone className="h-3 w-3 mr-1" />
                                {member.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeView === 'progress' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-text dark:text-dark-text">Overall Progress</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <h4 className="font-semibold text-text dark:text-dark-text mb-4">Goal Completion Rate</h4>
                    <div className="space-y-3">
                      {categories.slice(1).map((category) => {
                        const categoryGoals = carePlanGoals.filter(g => g.category === category.id);
                        const completed = categoryGoals.filter(g => g.status === 'completed').length;
                        const rate = categoryGoals.length > 0 ? (completed / categoryGoals.length) * 100 : 0;
                        
                        return (
                          <div key={category.id}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-text dark:text-dark-text capitalize">
                                {category.name}
                              </span>
                              <span className="text-sm text-muted dark:text-dark-muted">
                                {completed}/{categoryGoals.length}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all duration-500"
                                style={{ width: `${rate}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <h4 className="font-semibold text-text dark:text-dark-text mb-4">Recent Achievements</h4>
                    <div className="space-y-3">
                      {carePlanGoals.filter(g => g.status === 'completed').slice(0, 3).map((goal) => (
                        <div key={goal.id} className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-text dark:text-dark-text">{goal.title}</p>
                            <p className="text-xs text-muted dark:text-dark-muted">
                              Completed {new Date().toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
