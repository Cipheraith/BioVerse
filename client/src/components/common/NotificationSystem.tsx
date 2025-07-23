/**
 * Real-Time Notification System
 * Handles real-time health twin alerts and notifications
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationContext, type Notification } from '../../contexts/NotificationContext';
import {
  Bell,
  X,
  AlertTriangle,
  CheckCircle,
  Info,
  Heart,
  Activity,
  Pill,
  Calendar,
  Users,
  TrendingUp,
  Clock,
} from 'lucide-react';


interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      autoClose: notification.autoClose ?? (notification.priority !== 'critical'),
      duration: notification.duration ?? (notification.priority === 'critical' ? 0 : 5),
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-remove notification if autoClose is enabled
    if (newNotification.autoClose && newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, newNotification.duration * 1000);
    }
  }, [removeNotification]);

  const clearAll = () => {
    setNotifications([]);
  };

  const markAsRead = (id: string) => {
    // For now, just remove the notification when marked as read
    removeNotification(id);
  };

  const unreadCount = notifications.length;

  // Simulate real-time notifications (in a real app, this would come from WebSocket/SSE)
  useEffect(() => {
    const interval = setInterval(() => {
      const mockNotifications = [
        {
          type: 'health_alert' as const,
          title: 'Blood Pressure Alert',
          message: 'Patient Sarah Johnson has elevated blood pressure (145/90)',
          patientId: '1',
          patientName: 'Sarah Johnson',
          category: 'vital_signs' as const,
          priority: 'high' as const,
          actions: [
            {
              label: 'View Details',
              action: () => console.log('Navigate to patient details'),
              type: 'primary' as const,
            },
            {
              label: 'Contact Patient',
              action: () => console.log('Contact patient'),
              type: 'secondary' as const,
            },
          ],
        },
        {
          type: 'warning' as const,
          title: 'Medication Reminder',
          message: 'Patient John Doe has missed 2 consecutive medication doses',
          patientId: '2',
          patientName: 'John Doe',
          category: 'medication' as const,
          priority: 'medium' as const,
        },
        {
          type: 'info' as const,
          title: 'Lab Results Available',
          message: 'New lab results are available for Maria Garcia',
          patientId: '3',
          patientName: 'Maria Garcia',
          category: 'lab_results' as const,
          priority: 'low' as const,
        },
        {
          type: 'success' as const,
          title: 'Goal Achieved',
          message: 'Patient David Wilson has reached his weight loss goal',
          patientId: '4',
          patientName: 'David Wilson',
          category: 'general' as const,
          priority: 'low' as const,
        },
      ];

      // Randomly show a notification (20% chance every 10 seconds)
      if (Math.random() < 0.2) {
        const randomNotification = mockNotifications[Math.floor(Math.random() * mockNotifications.length)];
        addNotification(randomNotification);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [addNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAll,
        markAsRead,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const { notifications, unreadCount, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <Bell className="h-6 w-6 text-muted dark:text-dark-muted" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {unreadCount} new notification{unreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification, index) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    clearAll();
                    setIsOpen(false);
                  }}
                  className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  index: number;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, index }) => {
  const { removeNotification } = useNotifications();

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'health_alert':
        return <Heart className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getCategoryIcon = () => {
    switch (notification.category) {
      case 'vital_signs':
        return <Activity className="h-4 w-4" />;
      case 'medication':
        return <Pill className="h-4 w-4" />;
      case 'lab_results':
        return <TrendingUp className="h-4 w-4" />;
      case 'appointment':
        return <Calendar className="h-4 w-4" />;
      case 'risk_assessment':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'critical':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
      case 'high':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-4 border-l-4 ${getPriorityColor()} hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {notification.title}
            </h4>
            {notification.category && (
              <div className="flex-shrink-0 text-gray-400 dark:text-gray-500">
                {getCategoryIcon()}
              </div>
            )}
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {notification.message}
          </p>

          {notification.patientName && (
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
              <Users className="h-3 w-3 mr-1" />
              Patient: {notification.patientName}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3 mr-1" />
              {notification.timestamp.toLocaleTimeString()}
            </div>
            
            <div className="flex items-center space-x-2">
              {notification.actions && notification.actions.map((action, actionIndex) => (
                <button
                  key={actionIndex}
                  onClick={() => {
                    action.action();
                    removeNotification(notification.id);
                  }}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    action.type === 'primary'
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                  }`}
                >
                  {action.label}
                </button>
              ))}
              <button
                onClick={() => removeNotification(notification.id)}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <X className="h-3 w-3 text-gray-400 dark:text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface ToastNotificationsProps {
  className?: string;
}

export const ToastNotifications: React.FC<ToastNotificationsProps> = ({ className = '' }) => {
  const { notifications, removeNotification } = useNotifications();
  
  // Only show the most recent 3 notifications as toasts
  const toastNotifications = notifications.slice(0, 3).filter(n => 
    n.priority === 'critical' || n.type === 'health_alert'
  );

  return (
    <div className={`fixed top-4 right-4 z-50 space-y-2 ${className}`}>
      <AnimatePresence>
        {toastNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Heart className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {notification.message}
                </p>
                {notification.patientName && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Patient: {notification.patientName}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
