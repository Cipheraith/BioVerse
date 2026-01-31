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
const { logger } = require('../services/logger');

const router = express.Router();

// =======================
// VIRTUAL CONSULTATIONS
// =======================

/**
 * @route POST /api/telemedicine/consultations
 * @desc Create a new virtual consultation
 * @access Private
 */
router.post('/consultations', authenticateToken, authorizeRoles(['admin', 'health_worker', 'patient']), createVirtualConsultation);

/**
 * @route POST /api/telemedicine/consultations/:id/start
 * @desc Start a consultation session
 * @access Private
 */
router.post('/consultations/:consultationId/start', authenticateToken, authorizeRoles(['admin', 'health_worker', 'patient']), startConsultationSession);

/**
 * @route GET /api/telemedicine/consultations/:id/ai-support
 * @desc Get AI diagnostic support during consultation
 * @access Private
 */
router.post('/consultations/:consultationId/ai-support', authenticateToken, authorizeRoles(['admin', 'health_worker']), getAIDiagnosticSupport);

/**
 * @route GET /api/telemedicine/consultations
 * @desc Get all consultations for a user
 * @access Private
 */
router.get('/consultations', authenticateToken, authorizeRoles(['admin', 'health_worker', 'patient', 'moh']), async (req, res) => {
  try {
    const { patientId, doctorId, status, limit = 10 } = req.query;
    
    let whereClause = [];
    let params = [];
    let paramIndex = 1;

    if (patientId) {
      if (req.user.role === 'patient' && req.user.id !== patientId) {
        return res.status(403).json({ message: 'Access Denied: You can only view your own consultations.' });
      }
      whereClause.push(`patientId = $${paramIndex}`);
      params.push(patientId);
      paramIndex++;
    }

    if (doctorId) {
      whereClause.push(`doctorId = $${paramIndex}`);
      params.push(doctorId);
      paramIndex++;
    }

    if (status) {
      whereClause.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const query = `
      SELECT * FROM virtual_consultations 
      ${whereClause.length > 0 ? 'WHERE ' + whereClause.join(' AND ') : ''}
      ORDER BY scheduledDateTime DESC 
      LIMIT $${paramIndex}
    `;
    params.push(limit);

    const { allQuery } = require('../config/database');
    const consultations = await allQuery(query, params);

    res.json({
      consultations,
      total: consultations.length,
      message: 'Consultations retrieved successfully'
    });

  } catch (error) {
    logger.error('Error getting consultations:', { error });
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route GET /api/telemedicine/consultations/:id
 * @desc Get a specific consultation
 * @access Private
 */
router.get('/consultations/:consultationId', authenticateToken, authorizeRoles(['admin', 'health_worker', 'patient']), async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { getQuery } = require('../config/database');
    
    const consultation = await getQuery(
      'SELECT * FROM virtual_consultations WHERE id = $1',
      [consultationId]
    );

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    if (req.user.role === 'patient' && req.user.id !== consultation.patientId.toString()) {
      return res.status(403).json({ message: 'Access Denied: You can only view your own consultations.' });
    }

    res.json({
      consultation,
      message: 'Consultation retrieved successfully'
    });

  } catch (error) {
    logger.error('Error getting consultation:', { error });
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route PATCH /api/telemedicine/consultations/:id
 * @desc Update consultation status
 * @access Private
 */
router.patch('/consultations/:consultationId', authenticateToken, authorizeRoles(['admin', 'health_worker']), async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { status, notes, outcome } = req.body;
    
    const { runQuery } = require('../config/database');
    
    await runQuery(
      'UPDATE virtual_consultations SET status = $1, notes = $2, outcome = $3, updatedAt = $4 WHERE id = $5',
      [status, notes, outcome, new Date().toISOString(), consultationId]
    );

    res.json({
      consultationId,
      status,
      message: 'Consultation updated successfully'
    });

  } catch (error) {
    logger.error('Error updating consultation:', { error });
    res.status(500).json({ message: 'Internal server error' });
  }
});

// =======================
// REMOTE MONITORING
// =======================

/**
 * @route GET /api/telemedicine/monitoring/sessions
 * @desc Get all monitoring sessions
 * @access Private
 */
router.get('/monitoring/sessions', authenticateToken, authorizeRoles(['admin', 'health_worker', 'patient', 'moh']), async (req, res) => {
  try {
    const { limit = 50, offset = 0, status, patientId } = req.query;
    const { allQuery } = require('../config/database');
    
    let query = 'SELECT * FROM remote_monitoring_sessions';
    let params = [];
    let whereClause = [];

    if (req.user.role === 'patient') {
      whereClause.push('patientId = $1');
      params.push(req.user.id);
    } else if (patientId) {
      whereClause.push('patientId = $1');
      params.push(patientId);
    }
    
    if (status) {
      whereClause.push('status = $1');
      params.push(status);
    }

    if(whereClause.length > 0) {
      query += ' WHERE ' + whereClause.join(' AND ');
    }
    
    query += ' ORDER BY startTime DESC';
    
    if (limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(parseInt(limit));
    }
    
    if (offset) {
      query += ` OFFSET $${params.length + 1}`;
      params.push(parseInt(offset));
    }
    
    const sessions = await allQuery(query, params);
    
    res.json({
      sessions,
      total: sessions.length,
      message: 'Monitoring sessions retrieved successfully'
    });
    
  } catch (error) {
    logger.error('Error getting monitoring sessions:', { error });
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route POST /api/telemedicine/monitoring
 * @desc Initialize remote monitoring session
 * @access Private
 */
router.post('/monitoring', authenticateToken, authorizeRoles(['admin', 'health_worker', 'patient']), initializeRemoteMonitoring);

/**
 * @route POST /api/telemedicine/monitoring/:sessionId/data
 * @desc Process real-time health data
 * @access Private
 */
router.post('/monitoring/:sessionId/data', authenticateToken, authorizeRoles(['admin', 'health_worker', 'patient']), processRealtimeHealthData);

/**
 * @route GET /api/telemedicine/monitoring/:sessionId
 * @desc Get monitoring session details
 * @access Private
 */
router.get('/monitoring/:sessionId', authenticateToken, authorizeRoles(['admin', 'health_worker', 'patient']), async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { getQuery } = require('../config/database');
    
    const session = await getQuery(
      'SELECT * FROM remote_monitoring_sessions WHERE id = $1',
      [sessionId]
    );

    if (!session) {
      return res.status(404).json({ message: 'Monitoring session not found' });
    }

    if (req.user.role === 'patient' && req.user.id !== session.patientId.toString()) {
      return res.status(403).json({ message: 'Access Denied: You can only view your own monitoring sessions.' });
    }

    res.json({
      session,
      message: 'Monitoring session retrieved successfully'
    });

  } catch (error) {
    logger.error('Error getting monitoring session:', { error });
    res.status(500).json({ message: 'Internal server error' });
  }
});

// =======================
// MEDICAL TRAINING
// =======================

/**
 * @route POST /api/telemedicine/training
 * @desc Create immersive medical training session
 * @access Private
 */
router.post('/training', authenticateToken, authorizeRoles(['admin', 'health_worker']), createImmersiveMedicalTraining);

/**
 * @route GET /api/telemedicine/training/:traineeId
 * @desc Get training sessions for a trainee
 * @access Private
 */
router.get('/training/:traineeId', authenticateToken, authorizeRoles(['admin', 'health_worker']), async (req, res) => {
  try {
    const { traineeId } = req.params;
    const { allQuery } = require('../config/database');
    
    const trainingSessions = await allQuery(
      'SELECT * FROM immersive_medical_training WHERE traineeId = $1 ORDER BY startTime DESC',
      [traineeId]
    );

    res.json({
      trainingSessions,
      total: trainingSessions.length,
      message: 'Training sessions retrieved successfully'
    });

  } catch (error) {
    logger.error('Error getting training sessions:', { error });
    res.status(500).json({ message: 'Internal server error' });
  }
});

// =======================
// VIDEO CALL ENDPOINTS
// =======================

/**
 * @route POST /api/telemedicine/video/generate-token
 * @desc Generate video call access token
 * @access Private
 */
router.post('/video/generate-token', authenticateToken, authorizeRoles(['admin', 'health_worker', 'patient']), async (req, res) => {
  try {
    const { consultationId, userId, userType } = req.body;
    
    if (!consultationId || !userId || !userType) {
      return res.status(400).json({
        message: 'Missing required fields: consultationId, userId, userType'
      });
    }

    // Generate secure video call token (would integrate with video service like Agora, Twilio, etc.)
    const videoToken = await generateVideoCallToken({
      consultationId,
      userId,
      userType,
      expirationTime: Date.now() + (2 * 60 * 60 * 1000) // 2 hours
    });

    res.json({
      token: videoToken,
      channelName: `consultation_${consultationId}`,
      expirationTime: Date.now() + (2 * 60 * 60 * 1000),
      message: 'Video call token generated successfully'
    });

  } catch (error) {
    logger.error('Error generating video token:', { error });
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route POST /api/telemedicine/video/record-session
 * @desc Start/stop recording video session
 * @access Private
 */
router.post('/video/record-session', authenticateToken, authorizeRoles(['admin', 'health_worker']), async (req, res) => {
  try {
    const { consultationId, action, recordingSettings } = req.body;
    
    if (!consultationId || !action) {
      return res.status(400).json({
        message: 'Missing required fields: consultationId, action'
      });
    }

    let result;
    if (action === 'start') {
      result = await startVideoRecording(consultationId, recordingSettings);
    } else if (action === 'stop') {
      result = await stopVideoRecording(consultationId);
    } else {
      return res.status(400).json({ message: 'Invalid action. Use "start" or "stop"' });
    }

    res.json({
      consultationId,
      action,
      recordingData: result,
      message: `Video recording ${action}ed successfully`
    });

  } catch (error) {
    logger.error('Error managing video recording:', { error });
    res.status(500).json({ message: 'Internal server error' });
  }
});

// =======================
// HELPER FUNCTIONS
// =======================

async function generateVideoCallToken({ consultationId, userId, userType }) {
  // This would integrate with your chosen video service provider
  // For now, returning a mock token
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

async function startVideoRecording(consultationId, settings = {}) {
  // Implementation would depend on video service provider
  return {
    recordingId: `rec_${consultationId}_${Date.now()}`,
    status: 'recording',
    startTime: new Date().toISOString(),
    settings
  };
}

async function stopVideoRecording(consultationId) {
  // Implementation would depend on video service provider
  return {
    status: 'stopped',
    endTime: new Date().toISOString(),
    duration: '45:30', // Mock duration
    fileUrl: `https://recordings.bioverse.com/${consultationId}.mp4`
  };
}

module.exports = router;