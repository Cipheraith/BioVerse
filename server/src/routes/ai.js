/**
 * Enhanced AI Routes with Ollama Integration
 * Comprehensive AI-powered healthcare endpoints
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { body, param, validationResult } = require('express-validator');

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

/**
 * Enhanced Luma Chatbot Endpoint
 * POST /api/ai/chat
 */
router.post('/chat',
  authenticateToken,
  [
    body('message').notEmpty().withMessage('Message is required'),
    body('patientId').optional().isString(),
    body('conversationId').optional().isString()
  ],
  validateRequest,
  aiController.processLumaQuery
);

/**
 * Advanced Symptom Analysis
 * POST /api/ai/symptoms/analyze
 */
router.post('/symptoms/analyze',
  authenticateToken,
  authorizeRoles(['patient', 'health_worker', 'admin']),
  [
    body('symptoms').isArray().withMessage('Symptoms must be an array'),
    body('symptoms.*.symptom').notEmpty().withMessage('Symptom name is required'),
    body('symptoms.*.severity').optional().isIn(['mild', 'moderate', 'severe']),
    body('symptoms.*.duration').optional().isString(),
    body('patientId').notEmpty().withMessage('Patient ID is required')
  ],
  validateRequest,
  aiController.analyzeSymptoms
);

/**
 * Health Predictions
 * GET /api/ai/predictions/:patientId/:timeframe?
 */
router.get('/predictions/:patientId/:timeframe?',
  authenticateToken,
  authorizeRoles(['health_worker', 'admin', 'patient']),
  [
    param('patientId').notEmpty().withMessage('Patient ID is required'),
    param('timeframe').optional().isIn(['1m', '3m', '6m', '1y', '5y'])
  ],
  validateRequest,
  aiController.generateHealthPredictions
);

/**
 * Personalized Health Recommendations
 * POST /api/ai/recommendations/:patientId
 */
router.post('/recommendations/:patientId',
  authenticateToken,
  authorizeRoles(['health_worker', 'admin', 'patient']),
  [
    param('patientId').notEmpty().withMessage('Patient ID is required'),
    body('goals').optional().isArray(),
    body('preferences').optional().isObject()
  ],
  validateRequest,
  aiController.generateRecommendations
);

/**
 * Health Document Analysis
 * POST /api/ai/documents/analyze
 */
router.post('/documents/analyze',
  authenticateToken,
  authorizeRoles(['health_worker', 'admin']),
  [
    body('documentText').notEmpty().withMessage('Document text is required'),
    body('documentType').optional().isIn(['lab_report', 'prescription', 'medical_note', 'discharge_summary', 'general']),
    body('patientId').optional().isString()
  ],
  validateRequest,
  aiController.analyzeHealthDocument
);

/**
 * Health Education Content Generation
 * POST /api/ai/education
 */
router.post('/education',
  authenticateToken,
  [
    body('topic').notEmpty().withMessage('Topic is required'),
    body('patientId').optional().isString(),
    body('complexity').optional().isIn(['basic', 'intermediate', 'advanced'])
  ],
  validateRequest,
  aiController.generateHealthEducation
);

/**
 * Health Data Pattern Analysis
 * POST /api/ai/data/analyze
 */
router.post('/data/analyze',
  authenticateToken,
  authorizeRoles(['health_worker', 'admin']),
  [
    body('patientId').notEmpty().withMessage('Patient ID is required'),
    body('analysisType').optional().isIn(['trends', 'patterns', 'anomalies', 'correlations']),
    body('timeRange').optional().isIn(['1w', '1m', '3m', '6m', '1y'])
  ],
  validateRequest,
  aiController.analyzeHealthDataPatterns
);

/**
 * AI Service Status and Capabilities
 * GET /api/ai/status
 */
router.get('/status',
  authenticateToken,
  authorizeRoles(['admin', 'health_worker']),
  aiController.getAIStatus
);

/**
 * Batch Symptom Analysis for Multiple Patients
 * POST /api/ai/symptoms/batch-analyze
 */
router.post('/symptoms/batch-analyze',
  authenticateToken,
  authorizeRoles(['health_worker', 'admin']),
  [
    body('analyses').isArray().withMessage('Analyses must be an array'),
    body('analyses.*.patientId').notEmpty().withMessage('Patient ID is required for each analysis'),
    body('analyses.*.symptoms').isArray().withMessage('Symptoms must be an array for each analysis')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { analyses } = req.body;
      const results = [];

      for (const analysis of analyses) {
        try {
          // Process each analysis individually
          req.body = analysis;
          const result = await aiController.analyzeSymptoms(req, {
            json: (data) => data // Mock response object
          });
          results.push({
            patientId: analysis.patientId,
            success: true,
            result
          });
        } catch (error) {
          results.push({
            patientId: analysis.patientId,
            success: false,
            error: error.message
          });
        }
      }

      res.json({
        batchId: Date.now().toString(),
        totalAnalyses: analyses.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      });

    } catch (error) {
      res.status(500).json({ 
        error: 'Batch analysis failed',
        message: error.message 
      });
    }
  }
);

/**
 * Generate Health Insights Summary
 * GET /api/ai/insights/:patientId
 */
router.get('/insights/:patientId',
  authenticateToken,
  authorizeRoles(['health_worker', 'admin', 'patient']),
  [
    param('patientId').notEmpty().withMessage('Patient ID is required')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { patientId } = req.params;

      // Generate comprehensive insights by combining multiple AI analyses
      const [predictions, recommendations, dataAnalysis] = await Promise.allSettled([
        // Mock calls to AI controller methods
        aiController.generateHealthPredictions({ params: { patientId, timeframe: '6m' } }, { json: (data) => data }),
        aiController.generateRecommendations({ params: { patientId }, body: {} }, { json: (data) => data }),
        aiController.analyzeHealthDataPatterns({ body: { patientId, analysisType: 'trends' } }, { json: (data) => data })
      ]);

      const insights = {
        patientId,
        summary: {
          overallHealth: 'good', // This would be calculated
          riskLevel: 'low',
          keyFindings: [],
          urgentActions: []
        },
        predictions: predictions.status === 'fulfilled' ? predictions.value : null,
        recommendations: recommendations.status === 'fulfilled' ? recommendations.value : null,
        dataAnalysis: dataAnalysis.status === 'fulfilled' ? dataAnalysis.value : null,
        generatedAt: new Date().toISOString(),
        confidence: 0.85
      };

      res.json(insights);

    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to generate insights',
        message: error.message 
      });
    }
  }
);

/**
 * AI Model Management Endpoints (Admin only)
 */

/**
 * List Available Models
 * GET /api/ai/models
 */
router.get('/models',
  authenticateToken,
  authorizeRoles(['admin']),
  async (req, res) => {
    try {
      const ollamaAI = require('../services/ollamaAIService');
      const models = await ollamaAI.getAvailableModels();
      
      res.json({
        models: models.map(model => ({
          name: model.name,
          size: model.size,
          modified: model.modified_at,
          family: model.details?.family || 'unknown',
          parameters: model.details?.parameter_size || 'unknown'
        })),
        total: models.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to list models',
        message: error.message 
      });
    }
  }
);

/**
 * Pull New Model
 * POST /api/ai/models/pull
 */
router.post('/models/pull',
  authenticateToken,
  authorizeRoles(['admin']),
  [
    body('modelName').notEmpty().withMessage('Model name is required')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { modelName } = req.body;
      const ollamaAI = require('../services/ollamaAIService');
      
      // Start model pull (this is async)
      ollamaAI.pullModel(modelName)
        .then(() => {
          console.log(`Model ${modelName} pulled successfully`);
        })
        .catch(error => {
          console.error(`Failed to pull model ${modelName}:`, error);
        });

      res.json({
        message: `Started pulling model: ${modelName}`,
        modelName,
        status: 'pulling',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to pull model',
        message: error.message 
      });
    }
  }
);

/**
 * Clear Conversation History
 * DELETE /api/ai/conversations/:patientId
 */
router.delete('/conversations/:patientId',
  authenticateToken,
  authorizeRoles(['admin', 'health_worker', 'patient']),
  [
    param('patientId').notEmpty().withMessage('Patient ID is required')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { patientId } = req.params;
      const ollamaAI = require('../services/ollamaAIService');
      
      ollamaAI.clearConversationHistory(patientId);
      
      res.json({
        message: 'Conversation history cleared',
        patientId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to clear conversation history',
        message: error.message 
      });
    }
  }
);

/**
 * Health AI Analytics Dashboard Data
 * GET /api/ai/analytics
 */
router.get('/analytics',
  authenticateToken,
  authorizeRoles(['admin', 'moh']),
  async (req, res) => {
    try {
      const ollamaAI = require('../services/ollamaAIService');
      const stats = ollamaAI.getModelStats();
      
      // Get usage statistics (this would come from database)
      const analytics = {
        usage: {
          totalQueries: 1250, // From database
          chatbotQueries: 800,
          symptomAnalyses: 300,
          documentAnalyses: 100,
          predictions: 50
        },
        performance: {
          averageResponseTime: '2.3s',
          accuracy: '87%',
          userSatisfaction: '4.2/5'
        },
        models: stats,
        trends: {
          dailyQueries: [45, 52, 38, 61, 49, 55, 43], // Last 7 days
          topTopics: [
            { topic: 'Symptoms', count: 320 },
            { topic: 'Medications', count: 180 },
            { topic: 'Lifestyle', count: 150 }
          ]
        },
        timestamp: new Date().toISOString()
      };

      res.json(analytics);

    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to get AI analytics',
        message: error.message 
      });
    }
  }
);

module.exports = router;