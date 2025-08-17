import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Calendar,
  MessageSquare,
  Clock,
  Settings
} from 'lucide-react';
export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error' | 'appointment' | 'system' | 'message';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionText?: string;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
  const [loading, setLoading] = useState(true);

  // Mock notifications data
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'appointment',
        title: 'Appointment Reminder',
        message: 'You have an upcoming appointment tomorrow at 2:00 PM with Dr. Smith.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        priority: 'high',
        actionUrl: '/appointments',
        actionText: 'View Details'
      },
      {
        id: '2',
        type: 'success',
        title: 'Test Results Available',
        message: 'Your recent blood test results are now available in your patient portal.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false,
        priority: 'medium',
        actionUrl: '/health-records',
        actionText: 'View Results'
      },
      {
        id: '3',
        type: 'warning',
        title: 'Emergency Alert',
        message: 'High-risk patient alert: John Doe requires immediate attention.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        read: true,
        priority: 'high',
        actionUrl: '/patients/123',
        actionText: 'View Patient'
      },
      {
        id: '4',
        type: 'info',
        title: 'System Update',
        message: 'BioVerse will undergo maintenance tonight from 11 PM to 1 AM.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        read: true,
        priority: 'low'
      },
      {
        id: '5',
        type: 'message',
        title: 'New Message',
        message: 'Dr. Johnson sent you a message regarding your recent consultation.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
        read: false,
        priority: 'medium',
        actionUrl: '/messages',
        actionText: 'Read Message'
      },
      {
        id: '6',
        type: 'system',
        title: 'Weekly Health Report',
        message: 'Your weekly health summary is ready for review.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true,
        priority: 'low',
        actionUrl: '/reports',
        actionText: 'View Report'
      }
    ];

    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 500);
  }, []);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'warning':
      case 'error':
        return <AlertTriangle className="text-red-500" size={20} />;
      case 'info':
      case 'system':
        return <Info className="text-blue-500" size={20} />;
      case 'appointment':
        return <Calendar className="text-purple-500" size={20} />;
      case 'message':
        return <MessageSquare className="text-indigo-500" size={20} />;
      default:
        return <Bell className="text-gray-500" size={20} />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-blue-500';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread':
        return !notif.read;
      case 'important':
        return notif.priority === 'high' || notif.priority === 'medium';
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full max-w-xs sm:max-w-sm md:max-w-md h-full bg-card dark:bg-dark-card border-l border-border dark:border-dark-border shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-border dark:border-dark-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Bell className="text-primary-600" size={24} />
                  <h2 className="text-xl font-bold text-text dark:text-dark-text">
                    Notifications
                  </h2>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="text-muted dark:text-dark-muted hover:text-text dark:hover:text-dark-text transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex space-x-1 bg-background dark:bg-dark-background rounded-lg p-1">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'unread', label: 'Unread' },
                  { key: 'important', label: 'Important' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key as 'all' | 'unread' | 'important')}
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                      filter === tab.key
                        ? 'bg-primary-600 text-white'
                        : 'text-muted dark:text-dark-muted hover:text-text dark:hover:text-dark-text'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between mt-4">
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="text-sm text-primary-600 hover:text-primary-700 disabled:text-muted disabled:cursor-not-allowed"
                >
                  Mark all as read
                </button>
                <button className="text-sm text-muted dark:text-dark-muted hover:text-text dark:hover:text-dark-text">
                  <Settings size={16} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Bell className="text-muted dark:text-dark-muted mb-4" size={48} />
                  <p className="text-muted dark:text-dark-muted">
                    {filter === 'unread' ? 'No unread notifications' : 
                     filter === 'important' ? 'No important notifications' : 
                     'No notifications'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border dark:divide-dark-border">
                  {filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 hover:bg-background dark:hover:bg-dark-background transition-colors border-l-4 ${getPriorityColor(notification.priority)} ${
                        !notification.read ? 'bg-primary-50 dark:bg-primary-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className={`font-medium text-sm ${
                                !notification.read 
                                  ? 'text-text dark:text-dark-text' 
                                  : 'text-muted dark:text-dark-muted'
                              }`}>
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted dark:text-dark-muted mb-2 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-xs text-muted dark:text-dark-muted">
                                <Clock size={12} />
                                <span>{formatTimestamp(notification.timestamp)}</span>
                              </div>
                              {notification.actionUrl && (
                                <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                                  {notification.actionText}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-muted dark:text-dark-muted hover:text-text dark:hover:text-dark-text p-1"
                              title="Mark as read"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-muted dark:text-dark-muted hover:text-red-500 p-1"
                            title="Delete notification"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border dark:border-dark-border">
              <button className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium">
                View All Notifications
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationPanel;
