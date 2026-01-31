/**
 * Security Middleware
 * Enforces HTTPS and other security best practices
 */

/**
 * Enforce HTTPS in production
 * Redirects HTTP requests to HTTPS
 */
const enforceHTTPS = (req, res, next) => {
  // Only enforce in production environment
  if (process.env.NODE_ENV === 'production') {
    // Check if request is secure
    const isSecure = req.secure || 
                     req.headers['x-forwarded-proto'] === 'https' ||
                     req.get('X-Forwarded-Proto') === 'https';
    
    if (!isSecure) {
      // Redirect to HTTPS
      const httpsUrl = `https://${req.headers.host}${req.url}`;
      return res.redirect(301, httpsUrl);
    }
  }
  
  next();
};

/**
 * Add security headers
 * Sets Strict-Transport-Security header to enforce HTTPS
 */
const securityHeaders = (req, res, next) => {
  // Only set HSTS in production
  if (process.env.NODE_ENV === 'production') {
    // HSTS: Tell browsers to only use HTTPS for 1 year
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
};

module.exports = {
  enforceHTTPS,
  securityHeaders
};
