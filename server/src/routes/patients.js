const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getAllPatients, createPatient, getPatientById, updatePatient, createSymptomCheck, getMe, getPatientHealthTwin } = require('../controllers/patientController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, authorizeRoles(['admin', 'health_worker', 'moh']), getAllPatients);
router.post('/', authenticateToken, authorizeRoles(['admin', 'health_worker']), [
  body('name').notEmpty().withMessage('Patient name is required').isString().withMessage('Patient name must be a string'),
  body('dateOfBirth').isISO8601().withMessage('Date of birth must be a valid date (YYYY-MM-DD)'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
  body('contact').notEmpty().withMessage('Contact information is required').isString().withMessage('Contact must be a string'),
  body('address').notEmpty().withMessage('Address is required').isString().withMessage('Address must be a string'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
], createPatient);

router.get('/me', authenticateToken, authorizeRoles(['patient']), getMe);
router.get('/:id', authenticateToken, authorizeRoles(['admin', 'health_worker', 'moh', 'patient']), getPatientById);
router.get('/:id/health-twin', authenticateToken, authorizeRoles(['admin', 'health_worker', 'moh', 'patient']), getPatientHealthTwin);
router.put('/:id', authenticateToken, authorizeRoles(['admin', 'health_worker']), updatePatient);

router.post('/:id/symptom-checks', authenticateToken, authorizeRoles(['patient']), [
  body('symptoms').notEmpty().withMessage('Symptoms are required').isArray().withMessage('Symptoms must be an array'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
], createSymptomCheck);

module.exports = router;
