const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { register, login, googleLogin, me } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Stricter rate limiting for auth endpoints to prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login/register requests per windowMs
  message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation rules for registration
const validateRegister = [
  body('username').optional().isString().trim().notEmpty().withMessage('Username is required if provided.'),
  body('phoneNumber').optional().isMobilePhone('any').withMessage('Please enter a valid phone number if provided.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  body('role').isIn(['health_worker', 'admin', 'moh', 'facility_manager', 'logistics_coordinator', 'dhis2_admin']).withMessage('Invalid role.'),
  body('fullName').optional().isString().withMessage('Full name must be a string.'),
  body().custom((value, { req }) => {
    if (!req.body.username && !req.body.phoneNumber) {
      throw new Error('Either username or phone number is required.');
    }
    return true;
  }),
];

// Validation rules for login
const validateLogin = [
  body('username').optional().isString().trim().notEmpty().withMessage('Username is required if provided.'),
  body('phoneNumber').optional().isMobilePhone('any').withMessage('Please enter a valid phone number if provided.'),
  body('password').notEmpty().withMessage('Password is required.'),
  body().custom((value, { req }) => {
    if (!req.body.username && !req.body.phoneNumber) {
      throw new Error('Either username or phone number is required.');
    }
    return true;
  }),
];

// Apply validation middleware and rate limiting to auth routes for security
router.post('/register', authLimiter, validateRegister, handleValidationErrors, register);
router.post('/login', authLimiter, validateLogin, handleValidationErrors, login);
router.post('/google', googleLogin);
router.get('/me', authenticateToken, me);
router.get('/profile', authenticateToken, (req, res) => {
  res.json({ user: { id: req.user.id, email: req.user.username, role: req.user.role } });
});

module.exports = router;
