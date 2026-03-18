const { logger } = require('../services/logger');

/**
 * Telemedicine Controller - placeholder for future implementation.
 * Will support: consultation scheduling, video calls (Twilio/Agora), session notes.
 * Tables needed: virtual_consultations, consultation_notes
 */

const notImplemented = (featureName) => (req, res) => {
  res.status(501).json({
    message: `${featureName} is not yet implemented`,
    status: 'planned'
  });
};

module.exports = {
  createVirtualConsultation: notImplemented('Virtual consultations'),
  startConsultationSession: notImplemented('Consultation sessions'),
  getAIDiagnosticSupport: notImplemented('AI diagnostic support'),
  initializeRemoteMonitoring: notImplemented('Remote monitoring'),
  processRealtimeHealthData: notImplemented('Real-time health data'),
  createImmersiveMedicalTraining: notImplemented('Medical training')
};