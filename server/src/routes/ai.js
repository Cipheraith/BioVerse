/**
 * AI Routes - Integration with Python AI Backend
 * Provides endpoints for AI/ML services, Health Twins, and Analytics
 */

const express = require('express');
const { pythonAIService } = require('../services/pythonAIService');
const { authenticateToken } = require('../middleware/auth');
const { logger } = require('../services/logger');
const { validateRequest } = require('../middleware/validation');
const { body, param, query } = require('express-validator');

const router = express.Router();

// Middleware to check Python AI service availability
const checkAIService = (req, res, next) => {
  if (!pythonAIService.isAvailable()) {
    return res.status(503).json({
      success: false,
      error: 'AI service is currently unavailable',
      message: 'The Python AI backend is not connected. Please try again later.'
    });
  }
  next();
};

// Health check for AI service
router.get('/health', async (req, res) => {
  try {
    const status = await pythonAIService.getServiceStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('AI service health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check AI service health',
      details: error.message
    });
  }
});

// ==================== HEALTH TWIN ROUTES ====================

// Create Health Twin
router.post('/health-twins/create',
  authenticateToken,
  checkAIService,
  [
    body('patient_id').isString().notEmpty(),
    body('medical_history').optional().isObject(),
    body('current_vitals').optional().isObject(),
    body('lifestyle_data').optional().isObject()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const result = await pythonAIService.createHealthTwin(req.body);
      
      logger.info(`Health Twin created for patient ${req.body.patient_id}`, {
        user: req.user.id,
        twin_id: result.twin_id
      });

      res.json({
        success: true,
        data: result,
        message: 'Health Twin created successfully'
      });
    } catch (error) {
      logger.error('Failed to create Health Twin:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create Health Twin',
        details: error.message
      });
    }
  }
);

// Get Health Twin
router.get('/health-twins/:twinId',
  authenticateToken,
  checkAIService,
  [param('twinId').isString().notEmpty()],
  validateRequest,
  async (req, res) => {
    try {
      const result = await pythonAIService.getHealthTwin(req.params.twinId);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error(`Failed to get Health Twin ${req.params.twinId}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve Health Twin',
        details: error.message
      });
    }
  }
);

// Update Health Twin
router.put('/health-twins/:twinId',
  authenticateToken,
  checkAIService,
  [
    param('twinId').isString().notEmpty(),
    body('vitals').optional().isObject(),
    body('symptoms').optional().isArray(),
    body('medications').optional().isArray(),
    body('lifestyle_changes').optional().isObject()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const result = await pythonAIService.updateHealthTwin(req.params.twinId, req.body);
      
      logger.info(`Health Twin ${req.params.twinId} updated`, {
        user: req.user.id
      });

      res.json({
        success: true,
        data: result,
        message: 'Health Twin updated successfully'
      });
    } catch (error) {
      logger.error(`Failed to update Health Twin ${req.params.twinId}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update Health Twin',
        details: error.message
      });
    }
  }
);

// Get Health Twin Predictions
router.get('/health-twins/:twinId/predictions',
  authenticateToken,
  checkAIService,
  [
    param('twinId').isString().notEmpty(),
    query('timeframe').optional().isIn(['7d', '30d', '90d', '1y'])
  ],
  validateRequest,
  async (req, res) => {
    try {
      const timeframe = req.query.timeframe || '30d';
      const result = await pythonAIService.getHealthTwinPredictions(req.params.twinId, timeframe);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error(`Failed to get predictions for Health Twin ${req.params.twinId}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to get Health Twin predictions',
        details: error.message
      });
    }
  }
);

// Get Health Twin Visualization
router.get('/health-twins/:twinId/visualization',
  authenticateToken,
  checkAIService,
  [
    param('twinId').isString().notEmpty(),
    query('type').optional().isIn(['3d', '2d', 'chart', 'timeline'])
  ],
  validateRequest,
  async (req, res) => {
    try {
      const visualizationType = req.query.type || '3d';
      const result = await pythonAIService.getHealthTwinVisualization(req.params.twinId, visualizationType);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error(`Failed to get visualization for Health Twin ${req.params.twinId}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to get Health Twin visualization',
        details: error.message
      });
    }
  }
);

// ==================== MACHINE LEARNING ROUTES ====================

// Analyze Symptoms
router.post('/ml/analyze-symptoms',
  authenticateToken,
  checkAIService,
  [
    body('symptoms').isArray().notEmpty(),
    body('patient_history').optional().isObject(),
    body('severity').optional().isIn(['mild', 'moderate', 'severe'])
  ],
  validateRequest,
  async (req, res) => {
    try {
      const result = await pythonAIService.analyzeSymptoms(req.body.symptoms, req.body.patient_history);
      
      logger.info('Symptoms analyzed', {
        user: req.user.id,
        symptoms_count: req.body.symptoms.length
      });

      res.json({
        success: true,
        data: result,
        message: 'Symptoms analyzed successfully'
      });
    } catch (error) {
      logger.error('Failed to analyze symptoms:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze symptoms',
        details: error.message
      });
    }
  }
);

// Predict Health Risks
router.post('/ml/predict-risks',
  authenticateToken,
  checkAIService,
  [
    body('patient_data').isObject().notEmpty(),
    body('risk_factors').optional().isArray(),
    body('timeframe').optional().isIn(['1m', '3m', '6m', '1y'])
  ],
  validateRequest,
  async (req, res) => {
    try {
      const result = await pythonAIService.predictHealthRisks(req.body);
      
      logger.info('Health risks predicted', {
        user: req.user.id,
        patient_id: req.body.patient_data.patient_id
      });

      res.json({
        success: true,
        data: result,
        message: 'Health risks predicted successfully'
      });
    } catch (error) {
      logger.error('Failed to predict health risks:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to predict health risks',
        details: error.message
      });
    }
  }
);

// Generate Health Insights
router.post('/ml/health-insights',
  authenticateToken,
  checkAIService,
  [
    body('patient_id').isString().notEmpty(),
    body('data_points').isArray().notEmpty(),
    body('insight_type').optional().isIn(['trends', 'anomalies', 'recommendations', 'all'])
  ],
  validateRequest,
  async (req, res) => {
    try {
      const result = await pythonAIService.generateHealthInsights(req.body.patient_id, req.body.data_points);
      
      logger.info('Health insights generated', {
        user: req.user.id,
        patient_id: req.body.patient_id
      });

      res.json({
        success: true,
        data: result,
        message: 'Health insights generated successfully'
      });
    } catch (error) {
      logger.error('Failed to generate health insights:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate health insights',
        details: error.message
      });
    }
  }
);

// Run Diagnostic Model
router.post('/ml/models/:modelName/predict',
  authenticateToken,
  checkAIService,
  [
    param('modelName').isString().notEmpty(),
    body('input_data').isObject().notEmpty(),
    body('confidence_threshold').optional().isFloat({ min: 0, max: 1 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      const result = await pythonAIService.runDiagnosticModel(req.params.modelName, req.body);
      
      logger.info(`Diagnostic model ${req.params.modelName} executed`, {
        user: req.user.id
      });

      res.json({
        success: true,
        data: result,
        message: 'Diagnostic model executed successfully'
      });
    } catch (error) {
      logger.error(`Failed to run diagnostic model ${req.params.modelName}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to run diagnostic model',
        details: error.message
      });
    }
  }
);

// ==================== ANALYTICS ROUTES ====================

// Population Health Analytics
router.get('/analytics/population-health',
  authenticateToken,
  checkAIService,
  [
    query('region').optional().isString(),
    query('timeframe').optional().isIn(['1m', '3m', '6m', '1y', '2y'])
  ],
  validateRequest,
  async (req, res) => {
    try {
      const region = req.query.region || 'all';
      const timeframe = req.query.timeframe || '1y';
      const result = await pythonAIService.getPopulationHealthAnalytics(region, timeframe);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Failed to get population health analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get population health analytics',
        details: error.message
      });
    }
  }
);

// Disease Surveillance
router.get('/analytics/disease-surveillance',
  authenticateToken,
  checkAIService,
  [
    query('disease').optional().isString(),
    query('region').optional().isString(),
    query('timeframe').optional().isIn(['1m', '3m', '6m', '1y'])
  ],
  validateRequest,
  async (req, res) => {
    try {
      const disease = req.query.disease || 'all';
      const region = req.query.region || 'all';
      const timeframe = req.query.timeframe || '6m';
      const result = await pythonAIService.getDiseaseSurveillanceData(disease, region, timeframe);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Failed to get disease surveillance data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get disease surveillance data',
        details: error.message
      });
    }
  }
);

// Generate Health Report
router.post('/analytics/reports',
  authenticateToken,
  checkAIService,
  [
    body('report_type').isIn(['population', 'disease', 'facility', 'custom']),
    body('parameters').isObject().notEmpty(),
    body('format').optional().isIn(['json', 'pdf', 'excel', 'csv'])
  ],
  validateRequest,
  async (req, res) => {
    try {
      const result = await pythonAIService.generateHealthReport(req.body.report_type, req.body.parameters);
      
      logger.info(`Health report generated: ${req.body.report_type}`, {
        user: req.user.id
      });

      res.json({
        success: true,
        data: result,
        message: 'Health report generated successfully'
      });
    } catch (error) {
      logger.error('Failed to generate health report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate health report',
        details: error.message
      });
    }
  }
);

// ==================== AI CHAT ROUTES ====================

// Chat with AI
router.post('/chat',
  authenticateToken,
  checkAIService,
  [
    body('message').isString().notEmpty(),
    body('context').optional().isObject(),
    body('model').optional().isString()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const result = await pythonAIService.chatWithAI(
        req.body.message,
        req.body.context,
        req.body.model
      );
      
      logger.info('AI chat interaction', {
        user: req.user.id,
        message_length: req.body.message.length
      });

      res.json({
        success: true,
        data: result,
        message: 'AI response generated successfully'
      });
    } catch (error) {
      logger.error('Failed to chat with AI:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to chat with AI',
        details: error.message
      });
    }
  }
);

// Analyze with AI
router.post('/analyze',
  authenticateToken,
  checkAIService,
  [
    body('analysis_type').isIn(['medical', 'diagnostic', 'risk_assessment', 'treatment_plan']),
    body('data').isObject().notEmpty(),
    body('instructions').optional().isString()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const result = await pythonAIService.analyzeWithAI(
        req.body.analysis_type,
        req.body.data,
        req.body.instructions
      );
      
      logger.info(`AI analysis completed: ${req.body.analysis_type}`, {
        user: req.user.id
      });

      res.json({
        success: true,
        data: result,
        message: 'AI analysis completed successfully'
      });
    } catch (error) {
      logger.error('Failed to analyze with AI:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze with AI',
        details: error.message
      });
    }
  }
);

// ==================== VISUALIZATION ROUTES ====================

// Generate Visualization
router.post('/visualizations/generate',
  authenticateToken,
  checkAIService,
  [
    body('type').isIn(['chart', 'graph', '3d_model', 'heatmap', 'timeline']),
    body('data').isObject().notEmpty(),
    body('options').optional().isObject()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const result = await pythonAIService.generateVisualization(
        req.body.type,
        req.body.data,
        req.body.options
      );
      
      logger.info(`Visualization generated: ${req.body.type}`, {
        user: req.user.id
      });

      res.json({
        success: true,
        data: result,
        message: 'Visualization generated successfully'
      });
    } catch (error) {
      logger.error('Failed to generate visualization:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate visualization',
        details: error.message
      });
    }
  }
);

// Get Interactive Chart
router.post('/visualizations/interactive-chart',
  authenticateToken,
  checkAIService,
  [
    body('chart_type').isIn(['line', 'bar', 'scatter', 'pie', 'area', 'radar']),
    body('data').isObject().notEmpty(),
    body('config').optional().isObject()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const result = await pythonAIService.getInteractiveChart(
        req.body.chart_type,
        req.body.data,
        req.body.config
      );
      
      res.json({
        success: true,
        data: result,
        message: 'Interactive chart generated successfully'
      });
    } catch (error) {
      logger.error('Failed to generate interactive chart:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate interactive chart',
        details: error.message
      });
    }
  }
);

module.exports = router;