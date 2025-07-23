const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getUserNotifications,
  markAsRead,
  deleteNotification,
  getNotificationStats,
  createNotification,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES
} = require('../services/notificationService');

// Get user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0, unreadOnly = false } = req.query;
    
    const notifications = await getUserNotifications(req.user.id, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      unreadOnly: unreadOnly === 'true'
    });

    res.json({
      notifications,
      count: notifications.length,
      hasMore: notifications.length === parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve notifications',
      error: error.message
    });
  }
});

// Mark notification as read
router.put('/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    await markAsRead(notificationId, req.user.id);
    
    res.json({ message: 'Notification marked as read successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

// Delete notification
router.delete('/:notificationId', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    await deleteNotification(notificationId, req.user.id);
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete notification',
      error: error.message
    });
  }
});

// Get notification statistics (admin only)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'moh') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const stats = getNotificationStats();
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve notification statistics',
      error: error.message
    });
  }
});

// Create notification (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'moh') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const notificationData = {
      ...req.body,
      senderId: req.user.id
    };
    
    const notification = await createNotification(notificationData);
    
    res.status(201).json({
      message: 'Notification created successfully',
      notification
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create notification',
      error: error.message
    });
  }
});

// Get notification types and priorities
router.get('/types', authenticateToken, (req, res) => {
  res.json({
    types: NOTIFICATION_TYPES,
    priorities: NOTIFICATION_PRIORITIES
  });
});

module.exports = router;
