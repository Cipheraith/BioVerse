const express = require('express');
const router = express.Router();
const { getHealthTwinInsights, getHealthTwinData, updateHealthTwin } = require('../controllers/healthTwinController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { generateHealthTwin } = require('../services/healthTwinService');
const healthDataAggregator = require('../services/healthDataAggregator');
const { sendHealthAlertNotification } = require('../services/notificationService');

// Get health twin insights (existing)
router.get('/insights/patient/:id', 
  authenticateToken, 
  authorizeRoles(['admin', 'health_worker', 'moh', 'patient']), 
  getHealthTwinInsights
);

// Get detailed health twin data for visualization (existing)
router.get('/data/patient/:id', 
  authenticateToken, 
  authorizeRoles(['admin', 'health_worker', 'moh', 'patient']), 
  getHealthTwinData
);

// Update health twin
router.post('/update', 
  authenticateToken, 
  authorizeRoles(['patient']), 
  updateHealthTwin
);

// Get basic health twin
router.get('/:patientId', authenticateToken, authorizeRoles(['health_worker', 'admin', 'patient']), async (req, res) => {
  try {
    const { patientId } = req.params;
    if (req.user.role === 'patient' && req.user.id !== patientId) {
      return res.status(403).json({ message: 'Access Denied: Patients can only view their own health twin.' });
    }
    const healthTwin = await generateHealthTwin(patientId);
    
    if (!healthTwin) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(healthTwin);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate health twin', error: error.message });
  }
});

// Get comprehensive health twin with advanced analytics
router.get('/:patientId/comprehensive', authenticateToken, authorizeRoles(['health_worker', 'admin', 'patient']), async (req, res) => {
  try {
    const { patientId } = req.params;
    if (req.user.role === 'patient' && req.user.id !== patientId) {
      return res.status(403).json({ message: 'Access Denied: Patients can only view their own health twin.' });
    }
    const comprehensiveHealthTwin = await healthDataAggregator.generateComprehensiveHealthTwin(patientId);
    
    if (!comprehensiveHealthTwin) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(comprehensiveHealthTwin);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate comprehensive health twin', error: error.message });
  }
});

// Get patient health timeline
router.get('/:patientId/timeline', authenticateToken, authorizeRoles(['health_worker', 'admin', 'patient']), async (req, res) => {
  try {
    const { patientId } = req.params;
    if (req.user.role === 'patient' && req.user.id !== patientId) {
      return res.status(403).json({ message: 'Access Denied: Patients can only view their own health timeline.' });
    }
    const { limit = 50 } = req.query;
    
    const healthTwin = await healthDataAggregator.generateComprehensiveHealthTwin(patientId);
    
    if (!healthTwin) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json({
      patientId,
      timeline: healthTwin.timeline.slice(0, parseInt(limit)),
      summary: {
        totalEvents: healthTwin.timeline.length,
        recentSymptoms: healthTwin.healthHistory.symptoms.recent.length,
        recentAppointments: healthTwin.healthHistory.appointments.recent.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get health timeline', error: error.message });
  }
});

// Get patient risk analysis
router.get('/:patientId/risk-analysis', authenticateToken, authorizeRoles(['health_worker', 'admin', 'patient']), async (req, res) => {
  try {
    const { patientId } = req.params;
    if (req.user.role === 'patient' && req.user.id !== patientId) {
      return res.status(403).json({ message: 'Access Denied: Patients can only view their own risk analysis.' });
    }
    const healthTwin = await healthDataAggregator.generateComprehensiveHealthTwin(patientId);
    
    if (!healthTwin) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Check if risk level is high and send alert
    if (healthTwin.riskProfile.overall === 'high' || healthTwin.riskProfile.overall === 'critical') {
      await sendHealthAlertNotification({
        patientId,
        priority: healthTwin.riskProfile.overall === 'critical' ? 'critical' : 'high',
        message: `High risk patient identified: ${healthTwin.basicInfo.name}`,
        data: {
          riskLevel: healthTwin.riskProfile.overall,
          riskFactors: healthTwin.riskProfile
        }
      });
    }
    
    res.json({
      patientId,
      riskProfile: healthTwin.riskProfile,
      predictions: healthTwin.predictions,
      recommendations: healthTwin.insights.recommendations,
      alerts: healthTwin.insights.alerts
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get risk analysis', error: error.message });
  }
});

// Get population health insights (for Ministry of Health)
router.get('/population/insights', authenticateToken, authorizeRoles(['admin', 'moh']), async (req, res) => {
  try {
    const populationInsights = await healthDataAggregator.getPopulationHealthInsights();
    
    res.json({
      insights: populationInsights,
      message: 'Population health insights retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get population insights', error: error.message });
  }
});

// Get resource allocation recommendations
router.get('/population/resource-allocation', authenticateToken, authorizeRoles(['admin', 'moh']), async (req, res) => {
  try {
    const populationInsights = await healthDataAggregator.getPopulationHealthInsights();
    
    const resourceRecommendations = {
      healthWorkers: {
        currentDemand: 'moderate',
        predictedDemand: 'high',
        recommendations: [
          'Increase health worker capacity in high-risk areas',
          'Implement telemedicine for routine consultations'
        ]
      },
      ambulances: {
        currentUtilization: '65%',
        predictedSpikes: [
          { location: 'Lusaka', timeframe: '2-3 days', reason: 'Increased emergency calls' }
        ],
        recommendations: [
          'Pre-position ambulances in high-risk areas',
          'Maintain emergency response readiness'
        ]
      },
      medications: {
        currentStock: 'adequate',
        predictedNeeds: [
          { medication: 'Paracetamol', demand: 'high' },
          { medication: 'Antibiotics', demand: 'moderate' }
        ],
        recommendations: [
          'Maintain current stock levels',
          'Monitor consumption patterns'
        ]
      },
      facilities: {
        bedOccupancy: '70%',
        predictedCapacity: 'adequate',
        recommendations: [
          'Monitor bed availability',
          'Prepare surge capacity plans'
        ]
      }
    };
    
    res.json(resourceRecommendations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get resource allocation recommendations', error: error.message });
  }
});

module.exports = router;
