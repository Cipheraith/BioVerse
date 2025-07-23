const express = require('express');
const router = express.Router();
const { 
  getAllPolicies, 
  getPolicyById, 
  createPolicy, 
  updatePolicy, 
  deletePolicy,
  publishPolicy
} = require('../controllers/policyController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all policies - accessible to all authenticated users
router.get('/', getAllPolicies);

// Get policy by ID - accessible to all authenticated users
router.get('/:id', getPolicyById);

// Create new policy - MOH and admin only
router.post('/', authorizeRoles(['admin', 'moh']), createPolicy);

// Update policy - MOH and admin only
router.put('/:id', authorizeRoles(['admin', 'moh']), updatePolicy);

// Delete policy - MOH and admin only
router.delete('/:id', authorizeRoles(['admin', 'moh']), deletePolicy);

// Publish policy - MOH and admin only
router.post('/:id/publish', authorizeRoles(['admin', 'moh']), publishPolicy);

module.exports = router;
