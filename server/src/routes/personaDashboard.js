const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/personaDashboardController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

// National dashboard — MOH + Admin
router.get('/national',
  authorizeRoles(['admin', 'moh', 'dhis2_admin']),
  ctrl.getNationalDashboard
);

// District dashboard — Admin, MOH, Facility Managers
router.get('/district',
  authorizeRoles(['admin', 'moh', 'facility_manager', 'logistics_coordinator']),
  ctrl.getDistrictDashboard
);

// Facility dashboard — Facility Managers, Health Workers, Admin
router.get('/facility',
  authorizeRoles(['admin', 'moh', 'facility_manager', 'health_worker']),
  ctrl.getFacilityDashboard
);

// Health Worker dashboard
router.get('/health-worker',
  authorizeRoles(['admin', 'moh', 'health_worker', 'facility_manager']),
  ctrl.getHealthWorkerDashboard
);

// Forms — Health Workers + Facility Managers
const formRoles = ['admin', 'moh', 'health_worker', 'facility_manager'];

router.post('/patient-intake',
  authorizeRoles(formRoles),
  ctrl.submitPatientIntake
);

router.post('/referrals',
  authorizeRoles(formRoles),
  ctrl.submitReferral
);

router.post('/stock-update',
  authorizeRoles(formRoles),
  ctrl.submitStockUpdate
);

module.exports = router;
