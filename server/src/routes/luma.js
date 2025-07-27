const express = require('express');
const router = express.Router();
const { getLumaResponse } = require('../controllers/lumaController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Development mode - bypass authentication for Luma
const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
  router.post('/query', getLumaResponse);
} else {
  router.post('/query', authenticateToken, authorizeRoles(['admin', 'moh', 'health_worker']), getLumaResponse);
}

module.exports = router;
