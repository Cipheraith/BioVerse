const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacyController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All pharmacy endpoints require authentication
router.use(authenticateToken);

// POST /api/v1/pharmacy/update-stock
// Restricted to pharmacy role
router.post('/update-stock',
  authorizeRoles(['pharmacy', 'admin']),
  pharmacyController.updateStock
);

module.exports = router;
