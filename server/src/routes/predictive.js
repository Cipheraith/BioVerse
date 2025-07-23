const express = require('express');
const router = express.Router();
const { 
  getPredictiveInsights, 
  getPotentialIssues, 
  getSymptomTrendAnalysis, 
  getVitalTrendAnalysis,
  getEarlyWarnings
} = require('../controllers/predictiveController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Predictive insights endpoints
router.get('/insights/patient/:id', 
  authenticateToken, 
  authorizeRoles(['admin', 'health_worker', 'moh', 'patient']), 
  getPredictiveInsights
);

// Potential health issues prediction
router.get('/potential-issues/patient/:id', 
  authenticateToken, 
  authorizeRoles(['admin', 'health_worker', 'moh', 'patient']), 
  getPotentialIssues
);

// Symptom trend analysis
router.get('/symptom-trends/patient/:id', 
  authenticateToken, 
  authorizeRoles(['admin', 'health_worker', 'moh', 'patient']), 
  getSymptomTrendAnalysis
);

// Vital sign trend analysis
router.get('/vital-trends/patient/:id', 
  authenticateToken, 
  authorizeRoles(['admin', 'health_worker', 'moh', 'patient']), 
  getVitalTrendAnalysis
);

// Early warnings
router.get('/early-warnings/patient/:id', 
  authenticateToken, 
  authorizeRoles(['admin', 'health_worker', 'moh', 'patient']), 
  getEarlyWarnings
);

module.exports = router;