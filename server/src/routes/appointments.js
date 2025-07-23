const express = require('express');
const router = express.Router();
const { createAppointment, getAllAppointments, getMyAppointments } = require('../controllers/appointmentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.post('/', authenticateToken, authorizeRoles(['admin', 'health_worker']), createAppointment);
router.get('/my-appointments', authenticateToken, authorizeRoles(['patient']), getMyAppointments);
router.get('/', authenticateToken, authorizeRoles(['admin', 'health_worker', 'moh']), getAllAppointments);

module.exports = router;
