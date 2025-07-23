const express = require('express');
const router = express.Router();
const { getAllPregnancies, getPregnancyByPatientId, createPregnancy, updatePregnancy } = require('../controllers/pregnancyController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');


router.get('/', authenticateToken, authorizeRoles(['admin', 'health_worker', 'moh']), getAllPregnancies);
router.get('/patient/:patientId', authenticateToken, authorizeRoles(['admin', 'health_worker', 'moh', 'patient']), getPregnancyByPatientId);
router.post('/', authenticateToken, authorizeRoles(['admin', 'health_worker']), createPregnancy);
router.put('/:id', authenticateToken, authorizeRoles(['admin', 'health_worker']), updatePregnancy);


module.exports = router;
