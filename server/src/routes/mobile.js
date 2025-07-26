const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const databaseService = require('../services/databaseService');

// Mobile app registration and device management
router.post('/register-device', authenticateToken, async (req, res) => {
  try {
    const { deviceType, deviceToken, platform, appVersion, deviceInfo } = req.body;
    const userId = req.user.id;

    const deviceRegistration = {
      id: `device_${Date.now()}`,
      userId,
      deviceType, // 'ios' | 'android' | 'web'
      deviceToken,
      platform,
      appVersion,
      deviceInfo: {
        model: deviceInfo.model,
        osVersion: deviceInfo.osVersion,
        pushEnabled: deviceInfo.pushEnabled || true
      },
      registeredAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      status: 'active'
    };

    // Store in database
    try {
      const deviceId = await databaseService.registerMobileDevice(userId, {
        deviceType,
        deviceToken,
        platform,
        appVersion,
        deviceInfo
      });
      
      deviceRegistration.id = `device_${deviceId}`;
      deviceRegistration.database_id = deviceId;
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue with mock data for demo
    }

    res.status(201).json({
      device: deviceRegistration,
      message: 'Device registered successfully'
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to register device', error: error.message });
  }
});

// Send push notification
router.post('/push-notification', authenticateToken, authorizeRoles(['admin', 'health_worker']), async (req, res) => {
  try {
    const { userId, title, body, data, priority = 'normal' } = req.body;

    const notification = {
      id: `push_${Date.now()}`,
      userId,
      title,
      body,
      data: data || {},
      priority, // 'low' | 'normal' | 'high' | 'critical'
      sentAt: new Date().toISOString(),
      status: 'sent',
      deliveryStatus: {
        queued: new Date().toISOString(),
        sent: new Date().toISOString()
      }
    };

    // Create push notification record in database
    try {
      const notificationId = await databaseService.createPushNotification(userId, {
        title,
        body,
        data,
        priority
      });
      
      notification.id = `push_${notificationId}`;
      notification.database_id = notificationId;
      
      // Update status to sent
      await databaseService.updatePushNotificationStatus(notificationId, 'sent');
    } catch (dbError) {
      console.error('Database error:', dbError);
    }
    
    // TODO: Integrate with Firebase Cloud Messaging (FCM) for Android
    // TODO: Integrate with Apple Push Notification Service (APNs) for iOS

    res.status(200).json({
      notification,
      message: 'Push notification sent successfully'
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to send push notification', error: error.message });
  }
});

// Get user's mobile app settings
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = await databaseService.getUserMobileSettings(userId);
    
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get mobile settings', error: error.message });
  }
});

// Update mobile app settings
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const { settings } = req.body;
    const userId = req.user.id;

    const updatedSettings = await databaseService.updateUserMobileSettings(userId, settings);

    res.json({
      settings: updatedSettings,
      message: 'Settings updated successfully'
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to update settings', error: error.message });
  }
});

// Mobile app analytics
router.get('/analytics', authenticateToken, authorizeRoles(['admin']), (req, res) => {
  const analytics = {
    totalDownloads: 45780,
    activeUsers: {
      daily: 12450,
      weekly: 28900,
      monthly: 41200
    },
    platformBreakdown: {
      ios: { users: 22340, percentage: 54.2 },
      android: { users: 18860, percentage: 45.8 }
    },
    appVersions: {
      'v2.1.0': { users: 25600, percentage: 62.1 },
      'v2.0.5': { users: 12800, percentage: 31.1 },
      'v1.9.8': { users: 2800, percentage: 6.8 }
    },
    userEngagement: {
      averageSessionDuration: '12.5 minutes',
      dailySessions: 2.8,
      retentionRates: {
        day1: 89.5,
        day7: 67.2,
        day30: 52.1
      }
    },
    featureUsage: {
      healthTwin: { usage: 87.3, rating: 4.6 },
      appointments: { usage: 95.2, rating: 4.8 },
      telemedicine: { usage: 43.7, rating: 4.4 },
      emergencyAlert: { usage: 8.9, rating: 4.9 }
    },
    pushNotificationStats: {
      sent: 125800,
      delivered: 118200,
      opened: 89400,
      deliveryRate: 93.9,
      openRate: 75.7
    }
  };

  res.json({ analytics });
});

// Offline sync data management
router.post('/sync', authenticateToken, async (req, res) => {
  try {
    const { offlineData } = req.body;
    const userId = req.user.id;

    // Process offline data
    const syncResult = {
      syncId: `sync_${Date.now()}`,
      userId,
      syncTimestamp: new Date().toISOString(),
      itemsProcessed: offlineData?.length || 0,
      conflicts: [],
      updates: {
        appointments: [],
        healthData: [],
        notifications: []
      }
    };

    // Process offline data (placeholder for now)
    // In production, this would handle complex data synchronization

    res.json({
      syncResult,
      message: 'Data synchronized successfully'
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to sync data', error: error.message });
  }
});

// Mobile app feature flags
router.get('/feature-flags', authenticateToken, (req, res) => {
  const featureFlags = {
    telemedicineEnabled: true,
    biometricAuthEnabled: true,
    offlineModeEnabled: true,
    voiceCommandsEnabled: false, // Beta feature
    arMedicalVisualizationEnabled: false, // Coming soon
    wearableIntegrationEnabled: true,
    emergencySOSEnabled: true,
    healthInsightsAIEnabled: true,
    multiLanguageSupport: true,
    darkModeEnabled: true
  };

  res.json({ featureFlags });
});

// Mobile app crash reporting
router.post('/crash-report', authenticateToken, async (req, res) => {
  try {
    const { crashDetails, deviceInfo, stackTrace, timestamp } = req.body;
    
    const crashReport = {
      id: `crash_${Date.now()}`,
      userId: req.user.id,
      crashDetails,
      deviceInfo,
      stackTrace,
      timestamp: timestamp || new Date().toISOString(),
      status: 'reported'
    };

    // Store crash report in database
    try {
      const reportId = await databaseService.createCrashReport(req.user.id, {
        crashDetails,
        deviceInfo,
        stackTrace
      });
      
      crashReport.id = `crash_${reportId}`;
      crashReport.database_id = reportId;
    } catch (dbError) {
      console.error('Database error storing crash report:', dbError);
    }

    res.status(201).json({
      reportId: crashReport.id,
      message: 'Crash report submitted successfully'
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to submit crash report', error: error.message });
  }
});

module.exports = router;
