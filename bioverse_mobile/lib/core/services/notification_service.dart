import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:permission_handler/permission_handler.dart';

class NotificationService {
  static final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  static const MethodChannel _channel = MethodChannel('bioverse_notifications');

  static Future<void> initialize() async {
    try {
      // Request notification permissions
      await requestPermissions();
      
      // Initialize Firebase Messaging
      await _initializeFirebaseMessaging();
      
      // Setup message handlers
      _setupMessageHandlers();
      
      debugPrint('NotificationService initialized successfully');
    } catch (e) {
      debugPrint('Failed to initialize NotificationService: $e');
    }
  }

  static Future<void> requestPermissions() async {
    try {
      // Request notification permission
      final NotificationSettings settings = await _firebaseMessaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: true,
        provisional: false,
        sound: true,
      );

      debugPrint('Notification permission status: ${settings.authorizationStatus}');

      // For Android, also request system notification permission
      if (defaultTargetPlatform == TargetPlatform.android) {
        final status = await Permission.notification.request();
        debugPrint('Android notification permission: $status');
      }
    } catch (e) {
      debugPrint('Error requesting notification permissions: $e');
    }
  }

  static Future<void> _initializeFirebaseMessaging() async {
    try {
      // Get FCM token
      final token = await _firebaseMessaging.getToken();
      debugPrint('FCM Token: $token');
      
      // Configure foreground notification presentation options
      await _firebaseMessaging.setForegroundNotificationPresentationOptions(
        alert: true,
        badge: true,
        sound: true,
      );
    } catch (e) {
      debugPrint('Error initializing Firebase Messaging: $e');
    }
  }

  static void _setupMessageHandlers() {
    // Handle messages when app is in foreground
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      debugPrint('Received foreground message: ${message.messageId}');
      _handleMessage(message);
    });

    // Handle messages when app is opened from background
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      debugPrint('App opened from background via message: ${message.messageId}');
      _handleMessageTap(message);
    });

    // Handle initial message if app was opened from terminated state
    FirebaseMessaging.instance.getInitialMessage().then((RemoteMessage? message) {
      if (message != null) {
        debugPrint('App opened from terminated state via message: ${message.messageId}');
        _handleMessageTap(message);
      }
    });
  }

  static void _handleMessage(RemoteMessage message) {
    try {
      final data = message.data;
      final notification = message.notification;
      
      if (notification != null) {
        // Show local notification for foreground messages
        _showLocalNotification(
          title: notification.title ?? 'BioVerse',
          body: notification.body ?? '',
          data: data,
        );
      }
      
      // Handle different notification types
      final type = data['type'];
      switch (type) {
        case 'emergency_alert':
          _handleEmergencyAlert(data);
          break;
        case 'health_reminder':
          _handleHealthReminder(data);
          break;
        case 'appointment_reminder':
          _handleAppointmentReminder(data);
          break;
        case 'medication_reminder':
          _handleMedicationReminder(data);
          break;
        case 'health_twin_update':
          _handleHealthTwinUpdate(data);
          break;
        case 'telemedicine_call':
          _handleTelemedicineCall(data);
          break;
        default:
          debugPrint('Unknown notification type: $type');
      }
    } catch (e) {
      debugPrint('Error handling message: $e');
    }
  }

  static void _handleMessageTap(RemoteMessage message) {
    try {
      final data = message.data;
      final type = data['type'];
      
      // Navigate based on notification type
      switch (type) {
        case 'emergency_alert':
          // Navigate to emergency page
          break;
        case 'health_reminder':
          // Navigate to health twin page
          break;
        case 'appointment_reminder':
          // Navigate to appointments page
          break;
        case 'medication_reminder':
          // Navigate to prescriptions page
          break;
        case 'telemedicine_call':
          // Navigate to telemedicine page
          break;
        default:
          // Navigate to dashboard
          break;
      }
    } catch (e) {
      debugPrint('Error handling message tap: $e');
    }
  }

  static Future<void> _showLocalNotification({
    required String title,
    required String body,
    Map<String, dynamic>? data,
  }) async {
    try {
      await _channel.invokeMethod('showNotification', {
        'title': title,
        'body': body,
        'data': data,
      });
    } catch (e) {
      debugPrint('Error showing local notification: $e');
    }
  }

  static void _handleEmergencyAlert(Map<String, dynamic> data) {
    debugPrint('Handling emergency alert: $data');
    // Trigger emergency notification with high priority
    _showCriticalNotification(
      title: '🚨 EMERGENCY ALERT',
      body: data['message'] ?? 'Emergency assistance needed',
      priority: 'high',
    );
  }

  static void _handleHealthReminder(Map<String, dynamic> data) {
    debugPrint('Handling health reminder: $data');
    // Show health reminder notification
  }

  static void _handleAppointmentReminder(Map<String, dynamic> data) {
    debugPrint('Handling appointment reminder: $data');
    // Show appointment reminder notification
  }

  static void _handleMedicationReminder(Map<String, dynamic> data) {
    debugPrint('Handling medication reminder: $data');
    // Show medication reminder notification
  }

  static void _handleHealthTwinUpdate(Map<String, dynamic> data) {
    debugPrint('Handling health twin update: $data');
    // Show health twin update notification
  }

  static void _handleTelemedicineCall(Map<String, dynamic> data) {
    debugPrint('Handling telemedicine call: $data');
    // Show incoming call notification
    _showCriticalNotification(
      title: '📞 Incoming Video Call',
      body: 'Dr. ${data['doctorName'] ?? 'Unknown'} is calling',
      priority: 'high',
    );
  }

  static Future<void> _showCriticalNotification({
    required String title,
    required String body,
    String priority = 'normal',
  }) async {
    try {
      await _channel.invokeMethod('showCriticalNotification', {
        'title': title,
        'body': body,
        'priority': priority,
      });
    } catch (e) {
      debugPrint('Error showing critical notification: $e');
    }
  }

  // Schedule local notifications
  static Future<void> scheduleHealthReminder({
    required String title,
    required String body,
    required DateTime scheduledTime,
    Map<String, dynamic>? data,
  }) async {
    try {
      await _channel.invokeMethod('scheduleNotification', {
        'title': title,
        'body': body,
        'scheduledTime': scheduledTime.millisecondsSinceEpoch,
        'data': data,
      });
    } catch (e) {
      debugPrint('Error scheduling notification: $e');
    }
  }

  // Cancel scheduled notifications
  static Future<void> cancelNotification(int notificationId) async {
    try {
      await _channel.invokeMethod('cancelNotification', {
        'notificationId': notificationId,
      });
    } catch (e) {
      debugPrint('Error canceling notification: $e');
    }
  }

  // Get FCM token for backend registration
  static Future<String?> getFCMToken() async {
    try {
      return await _firebaseMessaging.getToken();
    } catch (e) {
      debugPrint('Error getting FCM token: $e');
      return null;
    }
  }

  // Subscribe to topic for broadcast notifications
  static Future<void> subscribeToTopic(String topic) async {
    try {
      await _firebaseMessaging.subscribeToTopic(topic);
      debugPrint('Subscribed to topic: $topic');
    } catch (e) {
      debugPrint('Error subscribing to topic $topic: $e');
    }
  }

  // Unsubscribe from topic
  static Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await _firebaseMessaging.unsubscribeFromTopic(topic);
      debugPrint('Unsubscribed from topic: $topic');
    } catch (e) {
      debugPrint('Error unsubscribing from topic $topic: $e');
    }
  }

  // Emergency notification methods
  static Future<void> sendEmergencyAlert({
    required String patientId,
    required double latitude,
    required double longitude,
    String? message,
  }) async {
    try {
      // This would typically call your backend API
      debugPrint('Sending emergency alert for patient: $patientId at $latitude, $longitude');
      
      // Show local confirmation
      await _showLocalNotification(
        title: '🚨 Emergency Alert Sent',
        body: 'Help is on the way. Emergency services have been notified.',
        data: {
          'type': 'emergency_sent',
          'patientId': patientId,
          'latitude': latitude.toString(),
          'longitude': longitude.toString(),
        },
      );
    } catch (e) {
      debugPrint('Error sending emergency alert: $e');
    }
  }

  // Health reminder scheduling
  static Future<void> scheduleHealthReminders({
    required String patientId,
    required List<Map<String, dynamic>> reminders,
  }) async {
    try {
      for (var reminder in reminders) {
        await scheduleHealthReminder(
          title: reminder['title'],
          body: reminder['body'],
          scheduledTime: DateTime.parse(reminder['scheduledTime']),
          data: {
            'type': 'health_reminder',
            'patientId': patientId,
            'reminderId': reminder['id'],
          },
        );
      }
      debugPrint('Scheduled ${reminders.length} health reminders for patient: $patientId');
    } catch (e) {
      debugPrint('Error scheduling health reminders: $e');
    }
  }

  // Clear all notifications
  static Future<void> clearAllNotifications() async {
    try {
      await _channel.invokeMethod('clearAllNotifications');
      debugPrint('Cleared all notifications');
    } catch (e) {
      debugPrint('Error clearing notifications: $e');
    }
  }
}

// Background message handler (must be top-level function)
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint('Handling background message: ${message.messageId}');
  
  // Handle background message processing
  final data = message.data;
  final type = data['type'];
  
  switch (type) {
    case 'emergency_alert':
      // Process emergency alert in background
      break;
    case 'critical_health_update':
      // Process critical health updates
      break;
    default:
      debugPrint('Background message type: $type');
  }
}
