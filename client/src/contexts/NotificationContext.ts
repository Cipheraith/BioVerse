import { createContext } from 'react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'health_alert';
  title: string;
  message: string;
  timestamp: Date;
  patientId?: string;
  patientName?: string;
  category?: 'vital_signs' | 'medication' | 'lab_results' | 'appointment' | 'risk_assessment' | 'general';
  priority: 'low' | 'medium' | 'high' | 'critical';
  autoClose?: boolean;
  duration?: number; // in seconds
  actions?: NotificationAction[];
}

interface NotificationAction {
  label: string;
  action: () => void;
  type?: 'primary' | 'secondary';
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  markAsRead: (id: string) => void;
  unreadCount: number;
}

export const NotificationContext = createContext<NotificationContextType | null>(null);

// Export types for use in components
export type { Notification, NotificationAction, NotificationContextType };
