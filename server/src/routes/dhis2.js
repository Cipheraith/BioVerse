const express = require('express');
const router = express.Router();
const dhis2Controller = require('../controllers/dhis2Controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public endpoint: test connection (useful for setup)
router.get('/test-connection', dhis2Controller.testConnection);

// All other endpoints require authentication
router.use(authenticateToken);

// GET /api/v1/dhis2/status - integration overview
router.get('/status',
  authorizeRoles(['admin', 'moh']),
  dhis2Controller.getStatus
);

// POST /api/v1/dhis2/sync/org-units
router.post('/sync/org-units',
  authorizeRoles(['admin']),
  dhis2Controller.syncOrgUnits
);

// POST /api/v1/dhis2/sync/data-elements
router.post('/sync/data-elements',
  authorizeRoles(['admin']),
  dhis2Controller.syncDataElements
);

// POST /api/v1/dhis2/sync/data-values
router.post('/sync/data-values',
  authorizeRoles(['admin']),
  dhis2Controller.syncDataValues
);

// POST /api/v1/dhis2/sync/full - runs all three syncs
router.post('/sync/full',
  authorizeRoles(['admin']),
  dhis2Controller.runFullSync
);

// GET /api/v1/dhis2/sync/history
router.get('/sync/history',
  authorizeRoles(['admin', 'moh']),
  dhis2Controller.getSyncHistory
);

module.exports = router;
