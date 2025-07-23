const { allQuery, runQuery } = require('../config/database');
const { app: logger } = require('../services/logger');
const bcrypt = require('bcryptjs');

/**
 * Get all users with pagination and filtering
 */
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT id, username, email, role, createdAt, lastLogin FROM users';
    let countQuery = 'SELECT COUNT(*) as total FROM users';
    let params = [];
    let countParams = [];
    
    // Add filters if provided
    const whereConditions = [];
    
    if (role) {
      whereConditions.push('role = ?');
      params.push(role);
      countParams.push(role);
    }
    
    if (search) {
      whereConditions.push('(username LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    if (whereConditions.length > 0) {
      const whereClause = ' WHERE ' + whereConditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }
    
    // Add pagination
    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const users = await allQuery(query, params);
    const [totalCount] = await allQuery(countQuery, countParams);
    
    res.json({
      users,
      pagination: {
        total: totalCount.total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount.total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to retrieve users due to an internal error.' });
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'admin' && req.user.role !== 'moh' && req.user.id !== id) {
      return res.status(403).json({ message: 'Access Denied: You can only view your own data.' });
    }
    
    const [user] = await allQuery(
      'SELECT id, username, email, role, createdAt, lastLogin FROM users WHERE id = ?',
      [id]
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    logger.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Failed to retrieve user due to an internal error.' });
  }
};

/**
 * Create a new user
 */
const createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Validate role
    const validRoles = ['admin', 'moh', 'health_worker', 'patient', 'ambulance_driver', 'pharmacy'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }
    
    // Check if user already exists
    const [existingUser] = await allQuery(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email or username already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const result = await runQuery(
      'INSERT INTO users (username, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, role, Date.now()]
    );
    
    res.status(201).json({
      id: result.lastID,
      username,
      email,
      role,
      createdAt: Date.now()
    });
  } catch (error) {
    logger.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user due to an internal error.' });
  }
};

/**
 * Update a user
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Access Denied: You can only update your own data.' });
    }

    const { username, email, role, password } = req.body;
    
    // Check if user exists
    const [existingUser] = await allQuery('SELECT * FROM users WHERE id = ?', [id]);
    
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prepare update fields
    const updates = [];
    const params = [];
    
    if (username) {
      updates.push('username = ?');
      params.push(username);
    }
    
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    
    if (role) {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access Denied: You are not authorized to change roles.' });
      }
      // Validate role
      const validRoles = ['admin', 'moh', 'health_worker', 'patient', 'ambulance_driver', 'pharmacy'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role specified' });
      }
      updates.push('role = ?');
      params.push(role);
    }
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updates.push('password = ?');
      params.push(hashedPassword);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    // Add ID to params
    params.push(id);
    
    // Update user
    await runQuery(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    
    // Get updated user
    const [updatedUser] = await allQuery(
      'SELECT id, username, email, role, createdAt, lastLogin FROM users WHERE id = ?',
      [id]
    );
    
    res.json(updatedUser);
  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user due to an internal error.' });
  }
};

/**
 * Delete a user
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const [existingUser] = await allQuery('SELECT id FROM users WHERE id = ?', [id]);
    
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete user
    await runQuery('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user due to an internal error.' });
  }
};

/**
 * Get user audit logs
 */
const getUserAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    // This assumes you have an auditLogs table
    const logs = await allQuery(
      `SELECT * FROM auditLogs 
       ORDER BY timestamp DESC 
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );
    
    const [totalCount] = await allQuery('SELECT COUNT(*) as total FROM auditLogs');
    
    res.json({
      logs,
      pagination: {
        total: totalCount.total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount.total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Failed to retrieve audit logs due to an internal error.' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserAuditLogs
};