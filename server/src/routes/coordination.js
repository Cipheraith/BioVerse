const express = require('express');
const router = express.Router();
const coordinationController = require('../controllers/coordinationController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All coordination endpoints require authentication
router.use(authenticateToken);

// GET /api/v1/coordination/status-map
// Accessible to: admin, moh, health_worker
router.get('/status-map', 
  authorizeRoles(['admin', 'moh', 'health_worker']),
  coordinationController.getStatusMap
);

// GET /api/v1/coordination/critical-transfers
// Accessible to: admin, moh
router.get('/critical-transfers',
  authorizeRoles(['admin', 'moh']),
  coordinationController.getCriticalTransfers
);

// PATCH /api/v1/coordination/alerts/:alertId
// Update alert status
router.patch('/alerts/:alertId',
  authorizeRoles(['admin', 'moh']),
  coordinationController.updateAlertStatus
);

module.exports = router;
