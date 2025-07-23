const express = require('express');
const router = express.Router();
const { getMessagesByReceiverId, createMessage } = require('../controllers/messageController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/:receiverId', authenticateToken, authorizeRoles(['admin', 'health_worker', 'patient']), (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.id !== req.params.receiverId) {
    return res.status(403).json({ message: 'Access Denied: You can only view your own messages.' });
  }
  next();
}, getMessagesByReceiverId);
router.post('/', authenticateToken, authorizeRoles(['admin', 'health_worker', 'patient']), createMessage);

module.exports = router;
