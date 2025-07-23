const databaseService = require('../services/databaseService');
const { logger } = require('../services/logger');

// Middleware to automatically log user actions for compliance
const auditLogger = (action, resource) => {
  return async (req, res, next) => {
    // Store original res.json and res.send methods
    const originalJson = res.json;
    const originalSend = res.send;
    
    // Override res.json to capture response
    res.json = function(body) {
      // Log the audit after successful response
      logAudit(req, res, action, resource, 'success', body);
      return originalJson.call(this, body);
    };
    
    // Override res.send to capture response
    res.send = function(body) {
      // Log the audit after response
      const outcome = res.statusCode >= 400 ? 'error' : 'success';
      logAudit(req, res, action, resource, outcome, body);
      return originalSend.call(this, body);
    };
    
    // Handle errors
    res.on('error', (error) => {
      logAudit(req, res, action, resource, 'error', { error: error.message });
    });
    
    next();
  };
};

async function logAudit(req, res, action, resource, outcome, responseData) {
  try {
    const userId = req.user?.id || null;
    const userRole = req.user?.role || 'anonymous';
    const resourceId = req.params?.id || req.params?.userId || req.params?.patientId || null;
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    const details = {
      method: req.method,
      url: req.originalUrl,
      params: req.params,
      query: req.query,
      statusCode: res.statusCode,
      responseTime: Date.now() - req.startTime
    };
    
    // Don't log sensitive data
    if (req.body && !containsSensitiveData(req.originalUrl)) {
      details.requestBody = req.body;
    }
    
    // Log successful operations and errors, but not routine GET requests
    if (outcome === 'error' || req.method !== 'GET' || isImportantGetRequest(req.originalUrl)) {
      await databaseService.createAuditLog(
        userId,
        userRole,
        action,
        resource,
        resourceId,
        ipAddress,
        userAgent,
        outcome,
        details
      );
    }
  } catch (error) {
    // Don't let audit logging errors break the main request
    logger.error('Audit logging failed:', error);
  }
}

function containsSensitiveData(url) {
  const sensitiveEndpoints = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/reset-password',
    '/api/billing/subscribe',
    '/api/compliance/privacy'
  ];
  
  return sensitiveEndpoints.some(endpoint => url.includes(endpoint));
}

function isImportantGetRequest(url) {
  const importantEndpoints = [
    '/api/compliance',
    '/api/billing/revenue',
    '/api/patients',
    '/api/health-twin',
    '/api/feedback/all'
  ];
  
  return importantEndpoints.some(endpoint => url.includes(endpoint));
}

// Specific audit middleware for different actions
const auditMiddleware = {
  // Patient data access
  patientDataAccess: auditLogger('patient_data_access', 'patient_records'),
  patientDataUpdate: auditLogger('patient_data_update', 'patient_records'),
  patientDataCreate: auditLogger('patient_data_create', 'patient_records'),
  patientDataDelete: auditLogger('patient_data_delete', 'patient_records'),
  
  // User management
  userLogin: auditLogger('user_login', 'authentication'),
  userLogout: auditLogger('user_logout', 'authentication'),
  userCreate: auditLogger('user_create', 'user_management'),
  userUpdate: auditLogger('user_update', 'user_management'),
  userDelete: auditLogger('user_delete', 'user_management'),
  
  // Health Twin access
  healthTwinAccess: auditLogger('health_twin_access', 'health_twin'),
  healthTwinUpdate: auditLogger('health_twin_update', 'health_twin'),
  
  // Subscription management
  subscriptionCreate: auditLogger('subscription_create', 'billing'),
  subscriptionUpdate: auditLogger('subscription_update', 'billing'),
  subscriptionCancel: auditLogger('subscription_cancel', 'billing'),
  
  // Feedback and compliance
  feedbackSubmit: auditLogger('feedback_submit', 'feedback'),
  feedbackResponse: auditLogger('feedback_response', 'feedback'),
  complianceReport: auditLogger('compliance_report_access', 'compliance'),
  
  // Mobile and device management
  deviceRegister: auditLogger('device_register', 'mobile_device'),
  pushNotificationSend: auditLogger('push_notification_send', 'notifications'),
  
  // Data requests (GDPR)
  dataRequestSubmit: auditLogger('data_request_submit', 'data_privacy'),
  dataRequestProcess: auditLogger('data_request_process', 'data_privacy'),
  
  // Security incidents
  securityIncidentReport: auditLogger('security_incident_report', 'security'),
  
  // Generic auditing
  genericAction: (action, resource) => auditLogger(action, resource)
};

module.exports = auditMiddleware;
