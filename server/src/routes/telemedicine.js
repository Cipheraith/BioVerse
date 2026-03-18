const express = require('express');
const {
  createVirtualConsultation,
  startConsultationSession,
  getAIDiagnosticSupport,
  initializeRemoteMonitoring,
  processRealtimeHealthData,
  createImmersiveMedicalTraining
} = require('../controllers/telemedicineController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// All telemedicine endpoints return 501 Not Implemented until the feature is built.
router.post('/consultations', authenticateToken, createVirtualConsultation);
router.post('/consultations/:consultationId/start', authenticateToken, startConsultationSession);
router.post('/consultations/:consultationId/ai-support', authenticateToken, getAIDiagnosticSupport);
router.post('/monitoring', authenticateToken, initializeRemoteMonitoring);
router.post('/monitoring/:sessionId/data', authenticateToken, processRealtimeHealthData);
router.post('/training', authenticateToken, createImmersiveMedicalTraining);

module.exports = router;