const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecentActivity, getNationalHealthOverview, getSystemPerformanceMetrics } = require('../controllers/dashboardController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/stats', authenticateToken, authorizeRoles(['admin', 'moh', 'health_worker']), getDashboardStats);
router.get('/recent-activity', authenticateToken, authorizeRoles(['admin', 'moh', 'health_worker']), getRecentActivity);

router.get('/national-health-overview', authenticateToken, authorizeRoles(['admin', 'moh']), getNationalHealthOverview);
router.get('/system-performance', authenticateToken, authorizeRoles(['admin', 'moh']), getSystemPerformanceMetrics);

module.exports = router;
