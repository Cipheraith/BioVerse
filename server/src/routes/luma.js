const express = require('express');
const router = express.Router();
const { getLumaResponse } = require('../controllers/lumaController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.post('/query', authenticateToken, authorizeRoles(['admin', 'moh', 'health_worker']), getLumaResponse);

module.exports = router;
