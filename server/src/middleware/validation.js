/**
 * Request Validation Middleware
 * Handles validation of incoming requests using express-validator
 */

const { validationResult } = require('express-validator');
const { logger } = require('../services/logger');

/**
 * Middleware to validate request data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateRequest = (req, res, next) => {
  try {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      logger.warn('Request validation failed', {
        path: req.path,
        method: req.method,
        errors: errors.array(),
        body: req.body,
        query: req.query,
        params: req.params
      });

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array().map(error => ({
          field: error.path || error.param,
          message: error.msg,
          value: error.value,
          location: error.location
        }))
      });
    }

    next();
  } catch (error) {
    logger.error('Validation middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal validation error',
      message: 'An error occurred while validating the request'
    });
  }
};

/**
 * Custom validation functions
 */
const customValidators = {
  /**
   * Validate if value is a valid health score (0-100)
   */
  isHealthScore: (value) => {
    const score = parseFloat(value);
    return !isNaN(score) && score >= 0 && score <= 100;
  },

  /**
   * Validate if value is a valid risk level
   */
  isRiskLevel: (value) => {
    const validLevels = ['low', 'moderate', 'high', 'critical'];
    return validLevels.includes(value.toLowerCase());
  },

  /**
   * Validate if value is a valid user role
   */
  isValidRole: (value) => {
    const validRoles = ['patient', 'health_worker', 'admin', 'moh', 'ambulance_driver', 'pharmacy'];
    return validRoles.includes(value);
  },

  /**
   * Validate if value is a valid date string
   */
  isValidDate: (value) => {
    const date = new Date(value);
    return date instanceof Date && !isNaN(date);
  },

  /**
   * Validate if value is a valid phone number (Zambian format)
   */
  isValidPhoneNumber: (value) => {
    const phoneRegex = /^\+260-\d{2}-\d{3}-\d{4}$/;
    return phoneRegex.test(value);
  },

  /**
   * Validate if value is a valid email
   */
  isValidEmail: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  /**
   * Validate if value is a valid JSON object
   */
  isValidJSON: (value) => {
    try {
      JSON.parse(value);
      return true;
    } catch (error) {
      return false;
    }
  }
};

/**
 * Sanitization functions
 */
const sanitizers = {
  /**
   * Sanitize string input
   */
  sanitizeString: (value) => {
    if (typeof value !== 'string') return value;
    return value.trim().replace(/[<>]/g, '');
  },

  /**
   * Sanitize numeric input
   */
  sanitizeNumber: (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  },

  /**
   * Sanitize boolean input
   */
  sanitizeBoolean: (value) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  }
};

/**
 * Common validation chains
 */
const commonValidations = {
  /**
   * Patient ID validation
   */
  patientId: () => [
    require('express-validator').param('patientId')
      .isString()
      .notEmpty()
      .withMessage('Patient ID is required')
      .isLength({ min: 1, max: 50 })
      .withMessage('Patient ID must be between 1 and 50 characters')
  ],

  /**
   * Health twin ID validation
   */
  twinId: () => [
    require('express-validator').param('twinId')
      .isString()
      .notEmpty()
      .withMessage('Twin ID is required')
      .isLength({ min: 1, max: 100 })
      .withMessage('Twin ID must be between 1 and 100 characters')
  ],

  /**
   * Pagination validation
   */
  pagination: () => [
    require('express-validator').query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    require('express-validator').query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],

  /**
   * Date range validation
   */
  dateRange: () => [
    require('express-validator').query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    require('express-validator').query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date')
      .custom((endDate, { req }) => {
        if (req.query.startDate && endDate) {
          const start = new Date(req.query.startDate);
          const end = new Date(endDate);
          if (end <= start) {
            throw new Error('End date must be after start date');
          }
        }
        return true;
      })
  ]
};

module.exports = {
  validateRequest,
  customValidators,
  sanitizers,
  commonValidations
};