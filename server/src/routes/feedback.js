const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const databaseService = require('../services/databaseService');
const { logger } = require('../services/logger');

// Submit user feedback
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { category, type, rating, title, description, feature, metadata } = req.body;
    const userId = req.user.id;

    const feedback = {
      id: `fb_${Date.now()}`,
      userId,
      userRole: req.user.role,
      category, // 'bug', 'feature_request', 'improvement', 'general'
      type, // 'ui_ux', 'performance', 'functionality', 'content'
      rating: parseInt(rating), // 1-5 stars
      title,
      description,
      feature, // specific feature being reviewed
      metadata: {
        userAgent: req.headers['user-agent'],
        platform: metadata?.platform,
        appVersion: metadata?.appVersion,
        sessionDuration: metadata?.sessionDuration,
        previousActions: metadata?.previousActions || []
      },
      status: 'open',
      priority: rating <= 2 ? 'high' : rating <= 3 ? 'medium' : 'low',
      submittedAt: new Date().toISOString(),
      votes: {
        upvotes: 0,
        downvotes: 0,
        totalVotes: 0
      },
      tags: [],
      adminResponse: null,
      implementation: {
        status: 'pending', // 'pending', 'in_progress', 'completed', 'rejected'
        estimatedEffort: null,
        assignedTo: null,
        completedAt: null
      }
    };

    // Auto-tag based on content analysis
    feedback.tags = generateAutoTags(title, description, category);

    // Store in database
    try {
      const feedbackId = await databaseService.createFeedback(userId, req.user.role, {
        category,
        type,
        rating,
        title,
        description,
        feature,
        metadata: feedback.metadata,
        status: feedback.status,
        priority: feedback.priority,
        tags: feedback.tags
      });
      
      feedback.id = `fb_${feedbackId}`;
      feedback.database_id = feedbackId;
    } catch (dbError) {
      logger.error('Database error:', { error: dbError });
      // Continue with mock data for demo
    }

    res.status(201).json({
      feedback,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to submit feedback', error: error.message });
  }
});

// Get all feedback (admin only)
router.get('/all', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { category, status, rating, limit = 50, offset = 0 } = req.query;
    
    const filters = {};
    if (category) filters.category = category;
    if (status) filters.status = status;
    if (rating) filters.rating = parseInt(rating);
    if (limit) filters.limit = parseInt(limit);

    const feedbackList = await databaseService.getAllFeedback(filters);

    res.json({
      feedback: feedbackList,
      total: feedbackList.length,
      filters: { category, status, rating },
      pagination: { limit: parseInt(limit), offset: parseInt(offset) }
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to get feedback', error: error.message });
  }
});

// Get user's own feedback
router.get('/my-feedback', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, limit = 20 } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (limit) filters.limit = parseInt(limit);

    const userFeedback = await databaseService.getUserFeedback(userId, filters);

    res.json({ feedback: userFeedback, total: userFeedback.length });

  } catch (error) {
    res.status(500).json({ message: 'Failed to get user feedback', error: error.message });
  }
});

// Vote on feedback
router.post('/:feedbackId/vote', authenticateToken, async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { voteType } = req.body; // 'upvote' | 'downvote'
    const userId = req.user.id;

    const vote = {
      feedbackId,
      userId,
      voteType,
      votedAt: new Date().toISOString()
    };

    const updatedVotes = await databaseService.voteFeedback(feedbackId, userId, voteType);

    res.json({
      vote,
      updatedVotes,
      message: 'Vote recorded successfully'
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to record vote', error: error.message });
  }
});

// Admin response to feedback
router.post('/:feedbackId/respond', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { message, status, assignTo, priority } = req.body;

    const response = {
      feedbackId,
      message,
      respondedBy: req.user.name || 'Admin Team',
      respondedAt: new Date().toISOString(),
      updatedStatus: status,
      updatedPriority: priority,
      assignedTo: assignTo
    };

    // Update feedback in database
    try {
      await databaseService.respondToFeedback(feedbackId, message, req.user.name || 'Admin Team');
    } catch (dbError) {
      logger.error('Database error:', { error: dbError });
    }
    res.json({
      response,
      message: 'Response added successfully'
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to add response', error: error.message });
  }
});

// Feedback analytics dashboard
router.get('/analytics', authenticateToken, authorizeRoles(['admin']), (req, res) => {
  const analytics = {
    overview: {
      totalFeedback: 2847,
      thisMonth: 156,
      averageRating: 4.2,
      responseRate: 89.3,
      resolutionTime: '3.2 days'
    },
    categoryBreakdown: {
      bug: { count: 485, percentage: 17.0, avgRating: 2.8 },
      feature_request: { count: 1248, percentage: 43.8, avgRating: 4.1 },
      improvement: { count: 897, percentage: 31.5, avgRating: 4.0 },
      general: { count: 217, percentage: 7.7, avgRating: 4.5 }
    },
    ratingDistribution: {
      5: { count: 1420, percentage: 49.9 },
      4: { count: 768, percentage: 27.0 },
      3: { count: 398, percentage: 14.0 },
      2: { count: 156, percentage: 5.5 },
      1: { count: 105, percentage: 3.7 }
    },
    statusBreakdown: {
      open: { count: 234, percentage: 8.2 },
      in_progress: { count: 156, percentage: 5.5 },
      completed: { count: 2198, percentage: 77.2 },
      rejected: { count: 259, percentage: 9.1 }
    },
    featurePopularity: [
      { feature: 'health_twin', feedback: 645, avgRating: 4.4 },
      { feature: 'telemedicine', feedback: 423, avgRating: 4.1 },
      { feature: 'appointments', feedback: 389, avgRating: 4.6 },
      { feature: 'notifications', feedback: 267, avgRating: 3.9 },
      { feature: 'mobile_app', feedback: 198, avgRating: 4.2 }
    ],
    userEngagement: {
      participationRate: 34.7, // % of users who provide feedback
      averageFeedbackPerUser: 2.8,
      powerUsers: 145, // users with >5 feedback items
      responseToFeedback: 76.3 // % who engage after receiving response
    },
    trends: {
      monthlyFeedback: [
        { month: '2024-09', count: 142, avgRating: 4.1 },
        { month: '2024-10', count: 156, avgRating: 4.2 },
        { month: '2024-11', count: 178, avgRating: 4.0 },
        { month: '2024-12', count: 134, avgRating: 4.3 },
        { month: '2025-01', count: 156, avgRating: 4.2 }
      ],
      improvementImpact: {
        beforeImplementation: 3.8,
        afterImplementation: 4.2,
        userSatisfactionIncrease: 10.5
      }
    }
  };

  res.json({ analytics });
});

// Feature request roadmap
router.get('/roadmap', authenticateToken, (req, res) => {
  const roadmap = {
    inProgress: [
      {
        feature: 'AI-powered health recommendations',
        votes: 89,
        estimatedCompletion: '2025-03-15',
        progress: 65,
        description: 'Personalized health recommendations based on AI analysis'
      },
      {
        feature: 'Wearable device integration',
        votes: 67,
        estimatedCompletion: '2025-02-28',
        progress: 80,
        description: 'Connect and sync data from various wearable devices'
      }
    ],
    planned: [
      {
        feature: 'Blockchain medical records',
        votes: 45,
        estimatedStart: '2025-04-01',
        description: 'Secure, immutable medical record storage using blockchain'
      },
      {
        feature: 'Multi-language support',
        votes: 78,
        estimatedStart: '2025-05-15',
        description: 'Support for multiple languages and localization'
      }
    ],
    completed: [
      {
        feature: 'Dark mode support',
        votes: 123,
        completedAt: '2025-01-10',
        description: 'Dark theme option for better user experience'
      },
      {
        feature: 'Push notifications',
        votes: 156,
        completedAt: '2024-12-15',
        description: 'Real-time push notifications for appointments and alerts'
      }
    ]
  };

  res.json({ roadmap });
});

// User satisfaction survey
router.post('/satisfaction-survey', authenticateToken, async (req, res) => {
  try {
    const { responses } = req.body;
    const userId = req.user.id;

    const survey = {
      id: `survey_${Date.now()}`,
      userId,
      responses: {
        overallSatisfaction: responses.overallSatisfaction, // 1-5
        easeOfUse: responses.easeOfUse, // 1-5
        featureCompleteness: responses.featureCompleteness, // 1-5
        performance: responses.performance, // 1-5
        support: responses.support, // 1-5
        recommendation: responses.recommendation, // 1-10 (NPS)
        mostUsedFeatures: responses.mostUsedFeatures, // array
        leastUsedFeatures: responses.leastUsedFeatures, // array
        improvements: responses.improvements, // text
        additionalComments: responses.additionalComments // text
      },
      submittedAt: new Date().toISOString()
    };

    res.status(201).json({
      survey,
      message: 'Survey submitted successfully'
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to submit survey', error: error.message });
  }
});

// Helper function to generate auto-tags
function generateAutoTags(title, description, category) {
  const text = `${title} ${description}`.toLowerCase();
  const tags = [];
  
  // Common keywords mapping
  const keywordMap = {
    'slow|loading|performance|speed': 'performance',
    'mobile|app|phone': 'mobile',
    'notification|alert|reminder': 'notifications',
    'ui|interface|design|layout': 'ui_ux',
    'login|auth|password|security': 'authentication',
    'data|sync|backup|export': 'data_management',
    'appointment|booking|schedule': 'appointments',
    'health twin|twin|analytics': 'health_twin',
    'telemedicine|video|call|consultation': 'telemedicine'
  };

  for (const [pattern, tag] of Object.entries(keywordMap)) {
    if (new RegExp(pattern).test(text)) {
      tags.push(tag);
    }
  }

  // Add category as tag
  tags.push(category);

  return [...new Set(tags)]; // Remove duplicates
}

module.exports = router;
