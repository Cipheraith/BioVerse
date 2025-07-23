const { getQuery, allQuery, runQuery } = require('../config/database');
const { logger } = require('./logger');

class DatabaseService {
  // User and subscription management
  async createSubscription(userId, planId, price, currency = 'USD') {
    try {
      const result = await runQuery(
        `INSERT INTO subscriptions (user_id, plan_id, status, start_date, next_billing_date, price, currency) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [
          userId, 
          planId, 
          'active', 
          new Date().toISOString(), 
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 
          price, 
          currency
        ]
      );
      return result.id;
    } catch (error) {
      logger.error('Error creating subscription:', error);
      throw error;
    }
  }

  async getUserSubscription(userId) {
    try {
      return await getQuery(
        'SELECT * FROM subscriptions WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 1',
        [userId, 'active']
      );
    } catch (error) {
      logger.error('Error getting user subscription:', error);
      throw error;
    }
  }

  async getSubscriptionAnalytics() {
    try {
      const totalRevenue = await getQuery(
        'SELECT SUM(price) as total FROM subscriptions WHERE status = $1',
        ['active']
      );
      
      const activeSubscriptions = await getQuery(
        'SELECT COUNT(*) as count FROM subscriptions WHERE status = $1',
        ['active']
      );
      
      const planBreakdown = await allQuery(
        `SELECT plan_id, COUNT(*) as count, SUM(price) as revenue 
         FROM subscriptions WHERE status = 'active' GROUP BY plan_id`
      );

      return {
        totalRevenue: parseFloat(totalRevenue?.total || 0),
        activeSubscriptions: parseInt(activeSubscriptions?.count || 0),
        planBreakdown
      };
    } catch (error) {
      logger.error('Error getting subscription analytics:', error);
      throw error;
    }
  }

  // Mobile device management
  async registerMobileDevice(userId, deviceData) {
    try {
      // Check if device already exists and update it
      const existingDevice = await getQuery(
        'SELECT id FROM mobile_devices WHERE user_id = $1 AND device_token = $2',
        [userId, deviceData.deviceToken]
      );

      if (existingDevice) {
        await runQuery(
          `UPDATE mobile_devices SET 
           device_type = $1, platform = $2, app_version = $3, 
           device_info = $4, last_active = NOW(), status = 'active'
           WHERE id = $5`,
          [
            deviceData.deviceType,
            deviceData.platform,
            deviceData.appVersion,
            JSON.stringify(deviceData.deviceInfo),
            existingDevice.id
          ]
        );
        return existingDevice.id;
      } else {
        const result = await runQuery(
          `INSERT INTO mobile_devices (user_id, device_type, device_token, platform, app_version, device_info) 
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [
            userId,
            deviceData.deviceType,
            deviceData.deviceToken,
            deviceData.platform,
            deviceData.appVersion,
            JSON.stringify(deviceData.deviceInfo)
          ]
        );
        return result.id;
      }
    } catch (error) {
      logger.error('Error registering mobile device:', error);
      throw error;
    }
  }

  async getUserMobileSettings(userId) {
    try {
      const settings = await getQuery(
        'SELECT settings FROM user_mobile_settings WHERE user_id = $1',
        [userId]
      );
      return settings?.settings || this.getDefaultMobileSettings();
    } catch (error) {
      logger.error('Error getting mobile settings:', error);
      return this.getDefaultMobileSettings();
    }
  }

  async updateUserMobileSettings(userId, settings) {
    try {
      const existingSettings = await getQuery(
        'SELECT id FROM user_mobile_settings WHERE user_id = $1',
        [userId]
      );

      if (existingSettings) {
        await runQuery(
          'UPDATE user_mobile_settings SET settings = $1, updated_at = NOW() WHERE user_id = $2',
          [JSON.stringify(settings), userId]
        );
      } else {
        await runQuery(
          'INSERT INTO user_mobile_settings (user_id, settings) VALUES ($1, $2)',
          [userId, JSON.stringify(settings)]
        );
      }
      return settings;
    } catch (error) {
      logger.error('Error updating mobile settings:', error);
      throw error;
    }
  }

  getDefaultMobileSettings() {
    return {
      pushNotifications: {
        enabled: true,
        appointments: true,
        healthAlerts: true,
        medicationReminders: true,
        emergencyAlerts: true,
        marketingUpdates: false
      },
      biometricAuth: {
        enabled: true,
        type: 'fingerprint'
      },
      dataSync: {
        autoSync: true,
        wifiOnly: false,
        syncFrequency: 'real-time'
      },
      privacy: {
        shareHealthData: true,
        anonymousAnalytics: true,
        locationServices: true
      },
      appearance: {
        theme: 'system',
        fontSize: 'medium',
        language: 'en'
      }
    };
  }

  // Feedback management
  async createFeedback(userId, userRole, feedbackData) {
    try {
      const result = await runQuery(
        `INSERT INTO user_feedback 
         (user_id, user_role, category, type, rating, title, description, feature, metadata, status, priority, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
        [
          userId,
          userRole,
          feedbackData.category,
          feedbackData.type,
          feedbackData.rating,
          feedbackData.title,
          feedbackData.description,
          feedbackData.feature,
          JSON.stringify(feedbackData.metadata),
          feedbackData.status || 'open',
          feedbackData.priority,
          JSON.stringify(feedbackData.tags || [])
        ]
      );
      return result.id;
    } catch (error) {
      logger.error('Error creating feedback:', error);
      throw error;
    }
  }

  async getAllFeedback(filters = {}) {
    try {
      let query = 'SELECT * FROM user_feedback';
      let params = [];
      const conditions = [];

      if (filters.category) {
        conditions.push('category = $' + (params.length + 1));
        params.push(filters.category);
      }

      if (filters.status) {
        conditions.push('status = $' + (params.length + 1));
        params.push(filters.status);
      }

      if (filters.rating) {
        conditions.push('rating = $' + (params.length + 1));
        params.push(filters.rating);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY created_at DESC';

      if (filters.limit) {
        query += ' LIMIT $' + (params.length + 1);
        params.push(filters.limit);
      }

      return await allQuery(query, params);
    } catch (error) {
      logger.error('Error getting all feedback:', error);
      throw error;
    }
  }

  async getUserFeedback(userId, filters = {}) {
    try {
      let query = 'SELECT * FROM user_feedback WHERE user_id = $1';
      let params = [userId];

      if (filters.status) {
        query += ' AND status = $2';
        params.push(filters.status);
      }

      query += ' ORDER BY created_at DESC';

      if (filters.limit) {
        query += ' LIMIT $' + (params.length + 1);
        params.push(filters.limit);
      }

      return await allQuery(query, params);
    } catch (error) {
      logger.error('Error getting user feedback:', error);
      throw error;
    }
  }

  async voteFeedback(feedbackId, userId, voteType) {
    try {
      // Check if user already voted
      const existingVote = await getQuery(
        'SELECT vote_type FROM feedback_votes WHERE feedback_id = $1 AND user_id = $2',
        [feedbackId, userId]
      );

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote if same type
          await runQuery(
            'DELETE FROM feedback_votes WHERE feedback_id = $1 AND user_id = $2',
            [feedbackId, userId]
          );
        } else {
          // Update vote type
          await runQuery(
            'UPDATE feedback_votes SET vote_type = $1, voted_at = NOW() WHERE feedback_id = $2 AND user_id = $3',
            [voteType, feedbackId, userId]
          );
        }
      } else {
        // Create new vote
        await runQuery(
          'INSERT INTO feedback_votes (feedback_id, user_id, vote_type) VALUES ($1, $2, $3)',
          [feedbackId, userId, voteType]
        );
      }

      // Update vote counts in feedback table
      await this.updateFeedbackVoteCounts(feedbackId);

      return await this.getFeedbackVoteCounts(feedbackId);
    } catch (error) {
      logger.error('Error voting on feedback:', error);
      throw error;
    }
  }

  async updateFeedbackVoteCounts(feedbackId) {
    try {
      const upvotes = await getQuery(
        'SELECT COUNT(*) as count FROM feedback_votes WHERE feedback_id = $1 AND vote_type = $2',
        [feedbackId, 'upvote']
      );

      const downvotes = await getQuery(
        'SELECT COUNT(*) as count FROM feedback_votes WHERE feedback_id = $1 AND vote_type = $2',
        [feedbackId, 'downvote']
      );

      await runQuery(
        'UPDATE user_feedback SET votes_up = $1, votes_down = $2, updated_at = NOW() WHERE id = $3',
        [parseInt(upvotes.count), parseInt(downvotes.count), feedbackId]
      );
    } catch (error) {
      logger.error('Error updating feedback vote counts:', error);
      throw error;
    }
  }

  async getFeedbackVoteCounts(feedbackId) {
    try {
      const feedback = await getQuery(
        'SELECT votes_up, votes_down FROM user_feedback WHERE id = $1',
        [feedbackId]
      );

      return {
        upvotes: feedback?.votes_up || 0,
        downvotes: feedback?.votes_down || 0,
        totalVotes: (feedback?.votes_up || 0) + (feedback?.votes_down || 0)
      };
    } catch (error) {
      logger.error('Error getting feedback vote counts:', error);
      return { upvotes: 0, downvotes: 0, totalVotes: 0 };
    }
  }

  async respondToFeedback(feedbackId, response, respondedBy) {
    try {
      await runQuery(`
        UPDATE user_feedback 
        SET admin_response = $1, responded_by = $2, responded_at = NOW(), updated_at = NOW()
        WHERE id = $3
      `, [response, respondedBy, feedbackId]);

      return await getQuery('SELECT * FROM user_feedback WHERE id = $1', [feedbackId]);
    } catch (error) {
      logger.error('Error responding to feedback:', error);
      throw error;
    }
  }

  // Push notification management
  async createPushNotification(userId, notificationData) {
    try {
      const result = await runQuery(`
        INSERT INTO push_notifications (user_id, title, body, data, priority, status)
        VALUES ($1, $2, $3, $4, $5, 'queued') RETURNING id
      `, [
        userId,
        notificationData.title,
        notificationData.body,
        JSON.stringify(notificationData.data || {}),
        notificationData.priority || 'normal'
      ]);

      return result.id;
    } catch (error) {
      logger.error('Error creating push notification:', error);
      throw error;
    }
  }

  async updatePushNotificationStatus(notificationId, status, timestamp = null) {
    try {
      let query, params;
      
      if (status === 'sent') {
        query = 'UPDATE push_notifications SET status = $1, sent_at = $2 WHERE id = $3';
        params = [status, timestamp || new Date().toISOString(), notificationId];
      } else if (status === 'delivered') {
        query = 'UPDATE push_notifications SET status = $1, delivered_at = $2 WHERE id = $3';
        params = [status, timestamp || new Date().toISOString(), notificationId];
      } else if (status === 'opened') {
        query = 'UPDATE push_notifications SET opened_at = $1 WHERE id = $2';
        params = [timestamp || new Date().toISOString(), notificationId];
      } else {
        query = 'UPDATE push_notifications SET status = $1 WHERE id = $2';
        params = [status, notificationId];
      }

      await runQuery(query, params);
    } catch (error) {
      logger.error('Error updating push notification status:', error);
      throw error;
    }
  }

  // Crash reporting
  async createCrashReport(userId, crashData) {
    try {
      const result = await runQuery(`
        INSERT INTO crash_reports (user_id, crash_details, device_info, stack_trace)
        VALUES ($1, $2, $3, $4) RETURNING id
      `, [
        userId,
        JSON.stringify(crashData.crashDetails),
        JSON.stringify(crashData.deviceInfo),
        crashData.stackTrace
      ]);

      return result.id;
    } catch (error) {
      logger.error('Error creating crash report:', error);
      throw error;
    }
  }

  // Data request management (GDPR compliance)
  async createDataRequest(userId, requestType, reason, additionalInfo) {
    try {
      const estimatedCompletion = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      const result = await runQuery(`
        INSERT INTO data_requests (user_id, request_type, reason, additional_info, estimated_completion)
        VALUES ($1, $2, $3, $4, $5) RETURNING id
      `, [userId, requestType, reason, additionalInfo, estimatedCompletion.toISOString()]);

      return result.id;
    } catch (error) {
      logger.error('Error creating data request:', error);
      throw error;
    }
  }

  // Audit logging
  async createAuditLog(userId, userRole, action, resource, resourceId, ipAddress, userAgent, outcome, details) {
    try {
      await runQuery(`
        INSERT INTO audit_logs (user_id, user_role, action, resource, resource_id, ip_address, user_agent, outcome, details)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        userId,
        userRole,
        action,
        resource,
        resourceId,
        ipAddress,
        userAgent,
        outcome,
        JSON.stringify(details || {})
      ]);
    } catch (error) {
      logger.error('Error creating audit log:', error);
      // Don't throw here to avoid breaking the main operation
    }
  }

  async getAuditLogs(filters = {}) {
    try {
      let query = 'SELECT * FROM audit_logs';
      let params = [];
      const conditions = [];

      if (filters.userId) {
        conditions.push('user_id = $' + (params.length + 1));
        params.push(filters.userId);
      }

      if (filters.action) {
        conditions.push('action = $' + (params.length + 1));
        params.push(filters.action);
      }

      if (filters.startDate) {
        conditions.push('timestamp >= $' + (params.length + 1));
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        conditions.push('timestamp <= $' + (params.length + 1));
        params.push(filters.endDate);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY timestamp DESC';

      if (filters.limit) {
        query += ' LIMIT $' + (params.length + 1);
        params.push(filters.limit);
      }

      return await allQuery(query, params);
    } catch (error) {
      logger.error('Error getting audit logs:', error);
      throw error;
    }
  }

  // Security incident reporting
  async createSecurityIncident(incidentData, reportedBy) {
    try {
      const result = await runQuery(`
        INSERT INTO security_incidents 
        (incident_type, severity, description, affected_users, discovered_at, reported_by, notifications, timeline, compliance_requirements)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
      `, [
        incidentData.incidentType,
        incidentData.severity,
        incidentData.description,
        incidentData.affectedUsers || 0,
        incidentData.discoveredAt || new Date().toISOString(),
        reportedBy,
        JSON.stringify(incidentData.notifications || {}),
        JSON.stringify(incidentData.timeline || {}),
        JSON.stringify(incidentData.complianceRequirements || {})
      ]);

      return result.id;
    } catch (error) {
      logger.error('Error creating security incident:', error);
      throw error;
    }
  }
}

module.exports = new DatabaseService();
