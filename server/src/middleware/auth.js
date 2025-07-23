const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Access Denied: Invalid token.' });
    }
    req.user = { ...user, id: user.id.toString() }; // Attach user payload to the request, ensure id is string
    next();
  });
};

const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access Denied: Insufficient permissions.' });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRoles };
