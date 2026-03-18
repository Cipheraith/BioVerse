const { updatePharmacyStock } = require('../services/coordinationService');
const { logger } = require('../services/logger');

/**
 * POST /api/v1/pharmacy/update-stock
 * Allows pharmacies to push stock updates
 */
async function updateStock(req, res) {
  try {
    const { facility_id, item_id, current_stock, daily_burn_rate } = req.body;

    // Validation
    if (!facility_id || !item_id || current_stock === undefined || !daily_burn_rate) {
      return res.status(400).json({
        error: 'Missing required fields: facility_id, item_id, current_stock, daily_burn_rate'
      });
    }

    if (current_stock < 0) {
      return res.status(400).json({ error: 'current_stock must be >= 0' });
    }

    if (daily_burn_rate <= 0) {
      return res.status(400).json({ error: 'daily_burn_rate must be > 0' });
    }

    const updated = await updatePharmacyStock(
      facility_id,
      item_id,
      current_stock,
      daily_burn_rate
    );

    res.json({
      success: true,
      updated: {
        facility_id: updated.facility_id,
        item_id: updated.item_id,
        current_stock: updated.current_stock,
        daily_burn_rate: updated.daily_burn_rate,
        status: updated.status,
        last_updated: updated.last_updated
      }
    });
  } catch (error) {
    logger.error('Error updating pharmacy stock:', error);
    res.status(500).json({ error: error.message || 'Failed to update stock' });
  }
}

module.exports = {
  updateStock
};
