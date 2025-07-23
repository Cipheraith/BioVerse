const { logger } = require('./logger');
const databaseService = require('./databaseService');

class PushNotificationService {
  constructor() {
    this.isEnabled = false;
    this.admin = null;
    
    // Initialize Firebase Admin SDK if credentials are available
    this.initializeFirebase();
  }

  initializeFirebase() {
    try {
      if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        const admin = require('firebase-admin');
        
        // Initialize with service account
        const serviceAccount = {
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs"
        };

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID
        });

        this.admin = admin;
        this.isEnabled = true;
        logger.info('Firebase Admin SDK initialized successfully');
      } else {
        logger.warn('Firebase credentials not found - push notifications will run in mock mode');
      }
    } catch (error) {
      logger.error('Failed to initialize Firebase Admin SDK:', error);
      this.isEnabled = false;
    }
  }

  async sendPushNotification(userId, notificationData) {
    try {
      // Get user's registered devices from database
      const devices = await this.getUserDevices(userId);
      
      if (devices.length === 0) {
        logger.warn(`No registered devices found for user ${userId}`);
        return { success: false, reason: 'No devices registered' };
      }

      const results = [];
      
      for (const device of devices) {
        try {
          const result = await this.sendToDevice(device.device_token, notificationData, device.device_type);
          results.push({
            deviceId: device.id,
            deviceToken: device.device_token,
            result
          });
        } catch (error) {
          logger.error(`Failed to send notification to device ${device.id}:`, error);
          results.push({
            deviceId: device.id,
            deviceToken: device.device_token,
            error: error.message
          });
        }
      }

      return { success: true, results };
    } catch (error) {
      logger.error('Error sending push notification:', error);
      throw error;
    }
  }

  async sendToDevice(deviceToken, notificationData, deviceType) {
    if (!this.isEnabled) {
      return this.mockSendToDevice(deviceToken, notificationData);
    }

    try {
      const message = {
        token: deviceToken,
        notification: {
          title: notificationData.title,
          body: notificationData.body
        },
        data: this.convertDataToStrings(notificationData.data || {}),
        // iOS specific options
        apns: deviceType === 'ios' ? {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              'content-available': 1
            }
          }
        } : undefined,
        // Android specific options
        android: deviceType === 'android' ? {
          priority: notificationData.priority === 'high' ? 'high' : 'normal',
          notification: {
            sound: 'default',
            priority: notificationData.priority === 'high' ? 'high' : 'default'
          }
        } : undefined
      };

      const response = await this.admin.messaging().send(message);
      logger.info(`Push notification sent successfully: ${response}`);
      
      return {
        success: true,
        messageId: response,
        sentAt: new Date().toISOString()
      };
    } catch (error) {
      if (error.code === 'messaging/registration-token-not-registered' ||
          error.code === 'messaging/invalid-registration-token') {
        // Token is invalid, should be removed from database
        logger.warn(`Invalid device token detected: ${deviceToken}`);
        await this.markDeviceInactive(deviceToken);
      }
      
      throw error;
    }
  }

  async sendToTopic(topic, notificationData) {
    if (!this.isEnabled) {
      return this.mockSendToTopic(topic, notificationData);
    }

    try {
      const message = {
        topic: topic,
        notification: {
          title: notificationData.title,
          body: notificationData.body
        },
        data: this.convertDataToStrings(notificationData.data || {})
      };

      const response = await this.admin.messaging().send(message);
      logger.info(`Topic notification sent successfully: ${response}`);
      
      return {
        success: true,
        messageId: response,
        sentAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error sending topic notification:', error);
      throw error;
    }
  }

  async sendBulkNotifications(userIds, notificationData) {
    const results = [];
    
    for (const userId of userIds) {
      try {
        const result = await this.sendPushNotification(userId, notificationData);
        results.push({ userId, ...result });
      } catch (error) {
        results.push({ userId, success: false, error: error.message });
      }
    }

    return results;
  }

  async subscribeToTopic(deviceTokens, topic) {
    if (!this.isEnabled) {
      return this.mockSubscribeToTopic(deviceTokens, topic);
    }

    try {
      const response = await this.admin.messaging().subscribeToTopic(deviceTokens, topic);
      logger.info(`Subscribed ${response.successCount} devices to topic ${topic}`);
      
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount
      };
    } catch (error) {
      logger.error('Error subscribing to topic:', error);
      throw error;
    }
  }

  async unsubscribeFromTopic(deviceTokens, topic) {
    if (!this.isEnabled) {
      return this.mockUnsubscribeFromTopic(deviceTokens, topic);
    }

    try {
      const response = await this.admin.messaging().unsubscribeFromTopic(deviceTokens, topic);
      logger.info(`Unsubscribed ${response.successCount} devices from topic ${topic}`);
      
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount
      };
    } catch (error) {
      logger.error('Error unsubscribing from topic:', error);
      throw error;
    }
  }

  // Helper methods
  convertDataToStrings(data) {
    const stringData = {};
    for (const [key, value] of Object.entries(data)) {
      stringData[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }
    return stringData;
  }

  async getUserDevices(userId) {
    try {
      // This would typically query the database for user's registered devices
      // For now, return empty array as placeholder
      return [];
    } catch (error) {
      logger.error('Error getting user devices:', error);
      return [];
    }
  }

  async markDeviceInactive(deviceToken) {
    try {
      // Update device status to inactive in database
      logger.info(`Marking device token as inactive: ${deviceToken}`);
    } catch (error) {
      logger.error('Error marking device inactive:', error);
    }
  }

  // Mock methods for when Firebase is not available
  mockSendToDevice(deviceToken, notificationData) {
    logger.info(`Mock: Sending notification to device ${deviceToken}:`, notificationData);
    return {
      success: true,
      messageId: `mock_${Date.now()}`,
      sentAt: new Date().toISOString()
    };
  }

  mockSendToTopic(topic, notificationData) {
    logger.info(`Mock: Sending notification to topic ${topic}:`, notificationData);
    return {
      success: true,
      messageId: `mock_topic_${Date.now()}`,
      sentAt: new Date().toISOString()
    };
  }

  mockSubscribeToTopic(deviceTokens, topic) {
    logger.info(`Mock: Subscribing ${deviceTokens.length} devices to topic ${topic}`);
    return {
      success: true,
      successCount: deviceTokens.length,
      failureCount: 0
    };
  }

  mockUnsubscribeFromTopic(deviceTokens, topic) {
    logger.info(`Mock: Unsubscribing ${deviceTokens.length} devices from topic ${topic}`);
    return {
      success: true,
      successCount: deviceTokens.length,
      failureCount: 0
    };
  }

  // Predefined notification templates
  getNotificationTemplate(type, data = {}) {
    const templates = {
      appointment_reminder: {
        title: 'Appointment Reminder',
        body: `You have an appointment with ${data.doctorName || 'your healthcare provider'} at ${data.time || 'your scheduled time'}`,
        data: { type: 'appointment', appointmentId: data.appointmentId }
      },
      health_alert: {
        title: 'Health Alert',
        body: data.message || 'Please check your health status',
        data: { type: 'health_alert', severity: data.severity || 'normal' }
      },
      medication_reminder: {
        title: 'Medication Reminder',
        body: `Time to take your ${data.medicationName || 'medication'}`,
        data: { type: 'medication', medicationId: data.medicationId }
      },
      emergency_alert: {
        title: 'Emergency Alert',
        body: data.message || 'Emergency situation detected',
        data: { type: 'emergency', priority: 'high' }
      },
      test_results: {
        title: 'Test Results Available',
        body: 'Your latest test results are now available',
        data: { type: 'test_results', resultId: data.resultId }
      }
    };

    return templates[type] || {
      title: 'BioVerse Notification',
      body: data.message || 'You have a new notification',
      data: { type: 'general' }
    };
  }

  // Utility method to validate notification data
  validateNotificationData(notificationData) {
    const errors = [];

    if (!notificationData.title || notificationData.title.trim() === '') {
      errors.push('Title is required');
    }

    if (!notificationData.body || notificationData.body.trim() === '') {
      errors.push('Body is required');
    }

    if (notificationData.title && notificationData.title.length > 100) {
      errors.push('Title must be 100 characters or less');
    }

    if (notificationData.body && notificationData.body.length > 500) {
      errors.push('Body must be 500 characters or less');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = new PushNotificationService();
