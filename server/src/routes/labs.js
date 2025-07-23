const express = require('express');
const router = express.Router();
const { createLabResult } = require('../controllers/labController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.post('/patient/:id', authenticateToken, authorizeRoles(['admin', 'health_worker']), createLabResult);

module.exports = router;
