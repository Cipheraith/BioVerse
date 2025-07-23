const express = require('express');
const router = express.Router();
const { 
  generatePatientReport, 
  generateSymptomReport, 
  generateAppointmentReport, 
  generateSystemUsageReport
} = require('../controllers/reportController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// All report endpoints are restricted to admin and MOH roles
router.use(authorizeRoles(['admin', 'moh']));

// Generate patient statistics report
router.get('/patients', generatePatientReport);

// Generate symptom statistics report
router.get('/symptoms', generateSymptomReport);

// Generate appointment statistics report
router.get('/appointments', generateAppointmentReport);

// Generate system usage report
router.get('/system-usage', generateSystemUsageReport);

module.exports = router;
