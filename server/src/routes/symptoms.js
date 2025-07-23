const express = require("express");
const router = express.Router();
const { body, validationResult } = require('express-validator');
const {
  getSymptomChecksByPatientId,
  createSymptomCheck,
  getSymptomTrends,
  getSymptomAnalysis,
  getMySymptoms,
} = require("../controllers/symptomController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Middleware for symptom validation
const validateSymptoms = [
  body('symptoms')
    .isArray().withMessage('Symptoms must be an array.')
    .notEmpty().withMessage('Symptoms array cannot be empty.'),
  body('symptoms.*').isString().notEmpty().withMessage('Each symptom must be a non-empty string.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

router.get(
  "/my-symptoms",
  authenticateToken,
  authorizeRoles(["patient"]),
  getMySymptoms,
);

router.get(
  "/patient/:id",
  authenticateToken,
  authorizeRoles(["admin", "health_worker", "moh", "patient"]),
  (req, res, next) => {
    if (req.user.role === 'patient' && req.user.id !== req.params.id) {
        return res.status(403).json({ message: 'Access Denied: You can only view your own symptom checks.' });
    }
    next();
  },
  getSymptomChecksByPatientId,
);
router.post(
  "/patient/:id",
  authenticateToken,
  authorizeRoles(["admin", "health_worker", "patient"]),
  validateSymptoms, // Apply validation middleware here
  createSymptomCheck,
);
router.get(
  "/trends",
  authenticateToken,
  authorizeRoles(["admin", "moh", "health_worker"]),
  getSymptomTrends,
);
router.post(
  "/analyze",
  authenticateToken,
  authorizeRoles(["admin", "health_worker", "patient"]),
  getSymptomAnalysis,
);


module.exports = router;
