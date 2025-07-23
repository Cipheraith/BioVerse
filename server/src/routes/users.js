const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser,
  getUserAuditLogs
} = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all users - admin only
router.get('/', authorizeRoles(['admin', 'moh']), getAllUsers);

// Get user by ID - admin or the user themselves
router.get('/:id', (req, res, next) => {
  // Allow users to access their own data
  if (req.user.id === req.params.id) {
    return next();
  }
  // Otherwise, check if they're an admin
  return authorizeRoles(['admin', 'moh'])(req, res, next);
}, getUserById);

// Create new user - admin only
router.post('/', authorizeRoles(['admin']), createUser);

// Update user - admin or the user themselves
router.put('/:id', (req, res, next) => {
  // Allow users to update their own data
  if (req.user.id === req.params.id) {
    // But restrict role changes to admin only
    if (req.body.role && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to change roles' });
    }
    return next();
  }
  // Otherwise, check if they're an admin
  return authorizeRoles(['admin'])(req, res, next);
}, updateUser);

// Delete user - admin only
router.delete('/:id', authorizeRoles(['admin']), deleteUser);

// Get audit logs - admin only
router.get('/audit/logs', authorizeRoles(['admin', 'moh']), getUserAuditLogs);

module.exports = router;