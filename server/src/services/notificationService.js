const { sendToRole, sendToUser } = require('./socketService');
const { notification: logger } = require('./logger');

// In-memory notification store (suitable for single instance)
const notificationStore = new Map();

// Notification types
const NOTIFICATION_TYPES = {
  EMERGENCY: 'emergency',
  APPOINTMENT: 'appointment',
  MATERNAL_HEALTH: 'maternal_health',
  MEDICATION_REMINDER: 'medication_reminder',
  HEALTH_ALERT: 'health_alert',
  TRANSPORT_BOOKING: 'transport_booking',
  SYSTEM_UPDATE: 'system_update'
};

// Notification priorities
const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Create a new notification
 * @param {Object} notification - Notification data
 * @returns {Object} Created notification
 */
const createNotification = async (notification) => {
  try {
    const notificationId = Date.now().toString();
    const newNotification = {
      id: notificationId,
      type: notification.type || NOTIFICATION_TYPES.SYSTEM_UPDATE,
      priority: notification.priority || NOTIFICATION_PRIORITIES.MEDIUM,
      title: notification.title,
      message: notification.message,
      data: notification.data || {},
      recipientId: notification.recipientId,
      recipientRole: notification.recipientRole,
      senderId: notification.senderId,
      isRead: false,
      createdAt: new Date().toISOString(),
      expiresAt: notification.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days default
    };

    // Store in memory
    notificationStore.set(notificationId, newNotification);

    // Send real-time notification
    await sendRealTimeNotification(newNotification);

    // Log notification creation
    logger.info(`Notification created: ${notification.title} for ${notification.recipientId || notification.recipientRole}`);

    return newNotification;
  } catch (error) {
    logger.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Send real-time notification via Socket.IO
 * @param {Object} notification - Notification to send
 */
const sendRealTimeNotification = async (notification) => {
  try {
    if (notification.recipientId) {
      // Send to specific user
      sendToUser(notification.recipientId, 'notification', notification);
    } else if (notification.recipientRole) {
      // Send to all users with specific role
      sendToRole(notification.recipientRole, 'notification', notification);
    }
  } catch (error) {
    logger.error('Error sending real-time notification:', error);
  }
};

/**
 * Get notifications for a user
 * @param {String} userId - User ID
 * @param {Object} options - Query options
 * @returns {Array} User notifications
 */
const getUserNotifications = async (userId, options = {}) => {
  try {
    const { limit = 50, offset = 0, unreadOnly = false } = options;
    
    // Get user role for role-based notifications
    const user = await allQuery('SELECT role FROM users WHERE id = $1', [userId]);
    const userRole = user[0]?.role;

    // Filter notifications from memory store
    const userNotifications = Array.from(notificationStore.values())
      .filter(notification => {
        // Check if notification is for this user or role
        const isForUser = notification.recipientId === userId;
        const isForRole = notification.recipientRole === userRole;
        
        // Check if expired
        const isExpired = new Date(notification.expiresAt) < new Date();
        
        // Check if unread only filter
        const matchesReadFilter = !unreadOnly || !notification.isRead;
        
        return (isForUser || isForRole) && !isExpired && matchesReadFilter;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(offset, offset + limit);

    return userNotifications;
  } catch (error) {
    logger.error('Error getting user notifications:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 * @param {String} notificationId - Notification ID
 * @param {String} userId - User ID
 * @returns {Boolean} Success status
 */
const markAsRead = async (notificationId, userId) => {
  try {
    const notification = notificationStore.get(notificationId);
    
    if (!notification) {
      throw new Error('Notification not found');
    }

    // Check if user has permission to mark as read
    if (notification.recipientId && notification.recipientId !== userId) {
      throw new Error('Unauthorized to mark notification as read');
    }

    notification.isRead = true;
    notification.readAt = new Date().toISOString();
    
    notificationStore.set(notificationId, notification);
    
    logger.info(`Notification marked as read: ${notificationId} by user ${userId}`);
    
    return true;
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Delete notification
 * @param {String} notificationId - Notification ID
 * @param {String} userId - User ID
 * @returns {Boolean} Success status
 */
const deleteNotification = async (notificationId, userId) => {
  try {
    const notification = notificationStore.get(notificationId);
    
    if (!notification) {
      throw new Error('Notification not found');
    }

    // Check if user has permission to delete
    if (notification.recipientId && notification.recipientId !== userId) {
      throw new Error('Unauthorized to delete notification');
    }

    notificationStore.delete(notificationId);
    
    logger.info(`Notification deleted: ${notificationId} by user ${userId}`);
    
    return true;
  } catch (error) {
    logger.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * Send emergency notification
 * @param {Object} emergencyData - Emergency data
 */
const sendEmergencyNotification = async (emergencyData) => {
  try {
    const notification = {
      type: NOTIFICATION_TYPES.EMERGENCY,
      priority: NOTIFICATION_PRIORITIES.CRITICAL,
      title: 'Emergency Alert',
      message: `Emergency reported: ${emergencyData.symptoms || 'Unknown symptoms'}`,
      data: emergencyData,
      recipientRole: 'health_worker',
      senderId: emergencyData.reportedBy
    };

    await createNotification(notification);

    // Also send to ambulance drivers
    await createNotification({
      ...notification,
      recipientRole: 'ambulance_driver'
    });

    // Send to MOH for high severity
    if (emergencyData.severity === 'high' || emergencyData.severity === 'critical') {
      await createNotification({
        ...notification,
        recipientRole: 'moh',
        title: 'Critical Emergency Alert'
      });
    }
  } catch (error) {
    logger.error('Error sending emergency notification:', error);
  }
};

/**
 * Send appointment notification
 * @param {Object} appointmentData - Appointment data
 */
const sendAppointmentNotification = async (appointmentData) => {
  try {
    const notification = {
      type: NOTIFICATION_TYPES.APPOINTMENT,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      title: 'Appointment Scheduled',
      message: `Your appointment has been scheduled for ${appointmentData.date} at ${appointmentData.time}`,
      data: appointmentData,
      recipientId: appointmentData.patientId,
      senderId: appointmentData.createdBy
    };

    await createNotification(notification);
  } catch (error) {
    logger.error('Error sending appointment notification:', error);
  }
};

/**
 * Send transport booking notification
 * @param {Object} transportData - Transport booking data
 */
const sendTransportBookingNotification = async (transportData) => {
  try {
    const notification = {
      type: NOTIFICATION_TYPES.TRANSPORT_BOOKING,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      title: 'Transport Booked',
      message: `Transport has been booked for your delivery. Due date: ${transportData.dueDate}`,
      data: transportData,
      recipientId: transportData.patientId,
      senderId: 'system'
    };

    await createNotification(notification);
  } catch (error) {
    logger.error('Error sending transport booking notification:', error);
  }
};

/**
 * Send health alert notification
 * @param {Object} healthData - Health alert data
 */
const sendHealthAlertNotification = async (healthData) => {
  try {
    const notification = {
      type: NOTIFICATION_TYPES.HEALTH_ALERT,
      priority: healthData.priority || NOTIFICATION_PRIORITIES.MEDIUM,
      title: 'Health Alert',
      message: healthData.message,
      data: healthData,
      recipientId: healthData.patientId,
      senderId: 'system'
    };

    await createNotification(notification);
  } catch (error) {
    logger.error('Error sending health alert notification:', error);
  }
};

/**
 * Clean up expired notifications
 */
const cleanupExpiredNotifications = () => {
  try {
    const now = new Date();
    let cleanedCount = 0;

    for (const [id, notification] of notificationStore.entries()) {
      if (new Date(notification.expiresAt) < now) {
        notificationStore.delete(id);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.info(`Cleaned up ${cleanedCount} expired notifications`);
    }
  } catch (error) {
    logger.error('Error cleaning up expired notifications:', error);
  }
};

// Run cleanup every hour
setInterval(cleanupExpiredNotifications, 60 * 60 * 1000);

/**
 * Get notification statistics
 * @returns {Object} Notification statistics
 */
const getNotificationStats = () => {
  try {
    const stats = {
      total: notificationStore.size,
      byType: {},
      byPriority: {},
      unread: 0,
      expired: 0
    };

    const now = new Date();

    for (const notification of notificationStore.values()) {
      // Count by type
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
      
      // Count by priority
      stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;
      
      // Count unread
      if (!notification.isRead) {
        stats.unread++;
      }
      
      // Count expired
      if (new Date(notification.expiresAt) < now) {
        stats.expired++;
      }
    }

    return stats;
  } catch (error) {
    logger.error('Error getting notification stats:', error);
    return {
      total: 0,
      byType: {},
      byPriority: {},
      unread: 0,
      expired: 0
    };
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  deleteNotification,
  sendEmergencyNotification,
  sendAppointmentNotification,
  sendTransportBookingNotification,
  sendHealthAlertNotification,
  getNotificationStats,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES
};
