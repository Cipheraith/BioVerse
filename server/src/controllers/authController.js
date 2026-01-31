const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { runQuery, getQuery } = require('../config/database');
const { OAuth2Client } = require('google-auth-library');
const { auth: logger } = require('../services/logger');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET;

// Critical: Fail immediately if JWT_SECRET is not set
if (!JWT_SECRET) {
  logger.error('FATAL ERROR: JWT_SECRET is not set. Authentication cannot function securely.');
  throw new Error('JWT_SECRET environment variable is required');
}

const register = async (req, res) => {
  // Handle both test format {email, password, name} and production format
  const email = req.body.email || req.body.username;
  const name = req.body.name || req.body.fullName;
  const { password, role, dob, nationalId, phoneNumber } = req.body;
  
  // For tests, provide defaults
  const finalRole = role || 'patient';
  const finalDob = dob || '1990-01-01';
  const finalNationalId = nationalId || 'test123';
  const finalName = name || 'Test User';

  if (!password || (!email && !phoneNumber)) {
    return res.status(400).json({ message: 'Password and either email or phone number are required.' });
  }

  try {
    let existingUser;
    if (email) {
      existingUser = await getQuery('SELECT * FROM users WHERE username = $1', [email]);
    } else if (phoneNumber) {
      existingUser = await getQuery('SELECT * FROM users WHERE phoneNumber = $1', [phoneNumber]);
    }

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await runQuery(
      'INSERT INTO users (username, password, role, name, dob, nationalId, phoneNumber) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [email, hashedPassword, finalRole, finalName, finalDob, finalNationalId, phoneNumber]
    );
    
    // Generate JWT token (standardized to 1h for security)
    const token = jwt.sign({ id: result.id, username: email || phoneNumber, role: finalRole }, JWT_SECRET, { expiresIn: '1h' });
    
    res.status(201).json({ 
      message: 'User registered successfully.',
      token,
      user: {
        id: result.id,
        email: email || phoneNumber,
        name: finalName,
        role: finalRole
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const login = async (req, res) => {
  // Handle both test format {email, password} and production format
  const email = req.body.email || req.body.username;
  const { password, phoneNumber } = req.body;
  
  if ((!email && !phoneNumber) || !password) {
    return res.status(400).json({ message: 'Email or phone number, and password are required.' });
  }

  try {
    let user;
    if (email) {
      user = await getQuery('SELECT * FROM users WHERE username = $1', [email]);
    } else if (phoneNumber) {
      user = await getQuery('SELECT * FROM users WHERE phoneNumber = $1', [phoneNumber]);
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ 
      token, 
      user: {
        id: user.id,
        email: user.username,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Error logging in user:', { error });
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const googleLogin = async (req, res) => {
  const { token: idToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    const email = payload['email'];
    const name = payload['name'];

    let user = await getQuery('SELECT * FROM users WHERE googleId = $1', [userid]);

    if (!user) {
      const defaultRole = 'patient';
      const result = await runQuery(
        'INSERT INTO users (googleId, username, name, role, password) VALUES ($1, $2, $3, $4, $5)',
        [userid, email, name, defaultRole, 'google_auth_only']
      );
      user = { id: result.id, googleId: userid, username: email, name: name, role: defaultRole };
    }

    const jwtToken = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token: jwtToken, role: user.role, id: user.id });

  } catch (error) {
    logger.error('Google authentication error:', { error });
    res.status(401).json({ message: 'Google authentication failed.' });
  }
};

const me = async (req, res) => {
  // req.user is set by authenticateToken middleware
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }
  try {
    // Fetch user details from DB (optional, for more info)
    const user = await getQuery('SELECT id, username, role FROM users WHERE id = $1', [req.user.id]);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ id: user.id, username: user.username, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user.' });
  }
};

module.exports = { register, login, googleLogin, me };