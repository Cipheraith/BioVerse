const { allQuery, runQuery } = require('../config/database');
const { app: logger } = require('../services/logger');

/**
 * Get all policies with pagination and filtering
 */
const getAllPolicies = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM policies';
    let countQuery = 'SELECT COUNT(*) as total FROM policies';
    let params = [];
    let countParams = [];
    
    // Add filters if provided
    const whereConditions = [];
    
    if (status) {
      whereConditions.push(`status = $${params.length + 1}`);
      params.push(status);
      countParams.push(status);
    }
    
    if (search) {
      whereConditions.push('(title LIKE ? OR description LIKE ?)');
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
    
    const policies = await allQuery(query, params);
    const [totalCount] = await allQuery(countQuery, countParams);
    
    res.json({
      policies,
      pagination: {
        total: totalCount.total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount.total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching policies:', error);
    res.status(500).json({ message: 'Failed to retrieve policies due to an internal error.' });
  }
};

/**
 * Get policy by ID
 */
const getPolicyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [policy] = await allQuery('SELECT * FROM policies WHERE id = ?', [id]);
    
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    
    res.json(policy);
  } catch (error) {
    logger.error('Error fetching policy by ID:', error);
    res.status(500).json({ message: 'Failed to retrieve policy due to an internal error.' });
  }
};

/**
 * Create a new policy
 */
const createPolicy = async (req, res) => {
  try {
    const { title, description, content, status = 'draft', targetAudience, effectiveDate } = req.body;
    
    // Validate required fields
    if (!title || !description || !content) {
      return res.status(400).json({ message: 'Title, description, and content are required' });
    }
    
    // Validate status
    const validStatuses = ['draft', 'published', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status specified' });
    }
    
    // Create policy
    const result = await runQuery(
      `INSERT INTO policies (
        title, 
        description, 
        content, 
        status, 
        targetAudience, 
        effectiveDate, 
        createdAt, 
        createdBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, 
        description, 
        content, 
        status, 
        targetAudience || null, 
        effectiveDate || null, 
        Date.now(), 
        req.user.id
      ]
    );
    
    const [newPolicy] = await allQuery('SELECT * FROM policies WHERE id = ?', [result.lastID]);
    
    res.status(201).json(newPolicy);
  } catch (error) {
    logger.error('Error creating policy:', error);
    res.status(500).json({ message: 'Failed to create policy due to an internal error.' });
  }
};

/**
 * Update a policy
 */
const updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, content, status, targetAudience, effectiveDate } = req.body;
    
    // Check if policy exists
    const [existingPolicy] = await allQuery('SELECT * FROM policies WHERE id = ?', [id]);
    
    if (!existingPolicy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    
    // Prepare update fields
    const updates = [];
    const params = [];
    
    if (title) {
      updates.push('title = ?');
      params.push(title);
    }
    
    if (description) {
      updates.push('description = ?');
      params.push(description);
    }
    
    if (content) {
      updates.push('content = ?');
      params.push(content);
    }
    
    if (status) {
      // Validate status
      const validStatuses = ['draft', 'published', 'archived'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status specified' });
      }
      updates.push('status = ?');
      params.push(status);
    }
    
    if (targetAudience !== undefined) {
      updates.push('targetAudience = ?');
      params.push(targetAudience);
    }
    
    if (effectiveDate !== undefined) {
      updates.push('effectiveDate = ?');
      params.push(effectiveDate);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    // Add updated timestamp and user
    updates.push('updatedAt = ?');
    params.push(Date.now());
    updates.push('updatedBy = ?');
    params.push(req.user.id);
    
    // Add ID to params
    params.push(id);
    
    // Update policy
    await runQuery(
      `UPDATE policies SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    
    // Get updated policy
    const [updatedPolicy] = await allQuery('SELECT * FROM policies WHERE id = ?', [id]);
    
    res.json(updatedPolicy);
  } catch (error) {
    logger.error('Error updating policy:', error);
    res.status(500).json({ message: 'Failed to update policy due to an internal error.' });
  }
};

/**
 * Delete a policy
 */
const deletePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if policy exists
    const [existingPolicy] = await allQuery('SELECT id FROM policies WHERE id = ?', [id]);
    
    if (!existingPolicy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    
    // Delete policy
    await runQuery('DELETE FROM policies WHERE id = ?', [id]);
    
    res.json({ message: 'Policy deleted successfully' });
  } catch (error) {
    logger.error('Error deleting policy:', error);
    res.status(500).json({ message: 'Failed to delete policy due to an internal error.' });
  }
};

/**
 * Publish a policy
 */
const publishPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if policy exists
    const [existingPolicy] = await allQuery('SELECT * FROM policies WHERE id = ?', [id]);
    
    if (!existingPolicy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    
    // Update policy status to published
    await runQuery(
      'UPDATE policies SET status = ?, publishedAt = ?, publishedBy = ? WHERE id = ?',
      ['published', Date.now(), req.user.id, id]
    );
    
    // Get updated policy
    const [updatedPolicy] = await allQuery('SELECT * FROM policies WHERE id = ?', [id]);
    
    res.json(updatedPolicy);
  } catch (error) {
    logger.error('Error publishing policy:', error);
    res.status(500).json({ message: 'Failed to publish policy due to an internal error.' });
  }
};

module.exports = {
  getAllPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  deletePolicy,
  publishPolicy
};