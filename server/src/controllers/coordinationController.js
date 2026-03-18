const db = require('../config/database');
const { logger } = require('../services/logger');

/**
 * GET /api/v1/coordination/status-map
 * Returns facility status map for visualization
 */
async function getStatusMap(req, res) {
  try {
    const result = await db.pool.query(`
      SELECT 
        f.id as facility_id,
        f.name,
        f.type,
        f.latitude,
        f.longitude,
        f.district,
        f.province,
        COALESCE(
          (SELECT status 
           FROM facility_stock_levels fsl 
           WHERE fsl.facility_id = f.id 
           ORDER BY 
             CASE status 
               WHEN 'CRITICAL' THEN 1 
               WHEN 'HEALTHY' THEN 2 
               WHEN 'SURPLUS' THEN 3 
             END 
           LIMIT 1),
          'HEALTHY'
        ) as status,
        (SELECT COUNT(*) 
         FROM facility_stock_levels fsl 
         WHERE fsl.facility_id = f.id AND fsl.status = 'CRITICAL') as critical_items_count
      FROM facilities f
      ORDER BY f.name
    `);

    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching status map:', error);
    res.status(500).json({ error: 'Failed to fetch status map' });
  }
}

/**
 * GET /api/v1/coordination/critical-transfers
 * Returns open transfer alerts
 */
async function getCriticalTransfers(req, res) {
  try {
    const result = await db.pool.query(`
      SELECT 
        ta.alert_id,
        ta.status as alert_status,
        ta.distance_km,
        ta.shortage_timeframe,
        ta.surplus_amount,
        ta.created_at,
        ic.item_name as item,
        ic.category as item_category,
        ff.name as from_facility_name,
        ff.type as from_facility_type,
        ff.district as from_district,
        tf.name as to_facility_name,
        tf.type as to_facility_type,
        tf.district as to_district,
        tf.latitude as to_latitude,
        tf.longitude as to_longitude
      FROM transfer_alerts ta
      JOIN inventory_catalog ic ON ta.item_id = ic.id
      JOIN facilities ff ON ta.from_facility_id = ff.id
      JOIN facilities tf ON ta.to_facility_id = tf.id
      WHERE ta.status = 'OPEN'
      ORDER BY ta.created_at DESC
      LIMIT 100
    `);

    // Format response
    const alerts = result.rows.map(row => ({
      alert_id: row.alert_id,
      item: row.item,
      item_category: row.item_category,
      action: 'TRANSFER_REQUIRED',
      from_facility: {
        name: row.from_facility_name,
        type: row.from_facility_type,
        district: row.from_district,
        surplus_amount: row.surplus_amount,
        distance_km: parseFloat(row.distance_km) || 0
      },
      to_facility: {
        name: row.to_facility_name,
        type: row.to_facility_type,
        district: row.to_district,
        shortage_timeframe: row.shortage_timeframe,
        location: {
          latitude: row.to_latitude,
          longitude: row.to_longitude
        }
      },
      created_at: row.created_at,
      status: row.alert_status
    }));

    res.json(alerts);
  } catch (error) {
    logger.error('Error fetching critical transfers:', error);
    res.status(500).json({ error: 'Failed to fetch critical transfers' });
  }
}

/**
 * PATCH /api/v1/coordination/alerts/:alertId
 * Update alert status
 */
async function updateAlertStatus(req, res) {
  try {
    const { alertId } = req.params;
    const { status, notes } = req.body;

    if (!['ACKNOWLEDGED', 'RESOLVED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateFields = ['status = $1'];
    const values = [status];
    let paramCount = 1;

    if (notes) {
      paramCount++;
      updateFields.push(`notes = $${paramCount}`);
      values.push(notes);
    }

    if (status === 'ACKNOWLEDGED') {
      paramCount++;
      updateFields.push(`acknowledged_at = NOW()`);
    } else if (status === 'RESOLVED') {
      paramCount++;
      updateFields.push(`resolved_at = NOW()`);
    }

    paramCount++;
    values.push(alertId);

    const result = await db.pool.query(`
      UPDATE transfer_alerts 
      SET ${updateFields.join(', ')}
      WHERE alert_id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ success: true, alert: result.rows[0] });
  } catch (error) {
    logger.error('Error updating alert status:', error);
    res.status(500).json({ error: 'Failed to update alert status' });
  }
}

module.exports = {
  getStatusMap,
  getCriticalTransfers,
  updateAlertStatus
};
