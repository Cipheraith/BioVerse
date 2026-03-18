const db = require('../config/database');
const { logger } = require('./logger');
const { haversineDistance } = require('./routingService');
const dhis2Service = require('./dhis2Service');

// Status thresholds (days of supply)
const CRITICAL_THRESHOLD = 3;
const SURPLUS_THRESHOLD = 30;

/**
 * Compute stock status based on days of supply
 * @param {number} currentStock 
 * @param {number} dailyBurnRate 
 * @returns {'CRITICAL' | 'HEALTHY' | 'SURPLUS'}
 */
function computeStatus(currentStock, dailyBurnRate) {
  if (dailyBurnRate <= 0) return 'HEALTHY';
  const daysOfSupply = currentStock / dailyBurnRate;
  
  if (daysOfSupply < CRITICAL_THRESHOLD) return 'CRITICAL';
  if (daysOfSupply <= SURPLUS_THRESHOLD) return 'HEALTHY';
  return 'SURPLUS';
}

/**
 * Run full coordination cycle:
 * 1. Sync org units + data elements from DHIS2 (metadata)
 * 2. Ingest data values (stock levels)
 * 3. Compute statuses
 * 4. Generate transfer alerts
 */
async function runCoordinationCycle() {
  logger.info('=== Starting Coordination Cycle ===');
  const startTime = Date.now();

  try {
    // Step 1: Sync metadata from DHIS2
    try {
      await dhis2Service.syncOrganisationUnits();
    } catch (err) {
      logger.warn('Org unit sync failed (continuing with existing data):', err.message);
    }

    try {
      await dhis2Service.syncDataElements();
    } catch (err) {
      logger.warn('Data element sync failed (continuing with existing data):', err.message);
    }

    // Step 2: Ingest data values
    try {
      await dhis2Service.ingestDataValues();
    } catch (err) {
      logger.warn('Data ingestion failed (continuing with existing data):', err.message);
    }

    // Step 3: Compute statuses and generate alerts (always runs, even with local-only data)
    await computeStockStatuses();
    await generateTransferAlerts();

    const duration = Date.now() - startTime;
    logger.info(`=== Coordination Cycle Complete (${duration}ms) ===`);
  } catch (error) {
    logger.error('Coordination cycle failed:', error);
  }
}

/**
 * Update pharmacy stock (called via POST endpoint)
 */
async function updatePharmacyStock(facilityId, itemId, currentStock, dailyBurnRate) {
  // Validate inputs
  if (currentStock < 0) {
    throw new Error('current_stock must be >= 0');
  }
  if (dailyBurnRate <= 0) {
    throw new Error('daily_burn_rate must be > 0');
  }

  const result = await db.pool.query(`
    INSERT INTO facility_stock_levels (facility_id, item_id, current_stock, daily_burn_rate, last_updated)
    VALUES ($1, $2, $3, $4, NOW())
    ON CONFLICT (facility_id, item_id)
    DO UPDATE SET 
      current_stock = $3,
      daily_burn_rate = $4,
      last_updated = NOW()
    RETURNING *
  `, [facilityId, itemId, currentStock, dailyBurnRate]);

  return result.rows[0];
}

/**
 * Compute stock statuses for all facilities
 */
async function computeStockStatuses() {
  logger.info('Computing stock statuses...');
  
  const result = await db.pool.query(`
    SELECT id, current_stock, daily_burn_rate
    FROM facility_stock_levels
  `);

  let updated = 0;
  for (const row of result.rows) {
    const status = computeStatus(row.current_stock, row.daily_burn_rate);
    
    await db.pool.query(
      'UPDATE facility_stock_levels SET status = $1 WHERE id = $2',
      [status, row.id]
    );
    updated++;
  }

  logger.info(`Updated ${updated} stock statuses`);
}

/**
 * Generate transfer alerts by matching CRITICAL with SURPLUS
 */
async function generateTransferAlerts() {
  logger.info('Generating transfer alerts...');
  
  // Get all CRITICAL stock levels
  const criticalResult = await db.pool.query(`
    SELECT 
      fsl.id, fsl.facility_id, fsl.item_id, fsl.current_stock, fsl.daily_burn_rate,
      f.name as facility_name, f.latitude, f.longitude
    FROM facility_stock_levels fsl
    JOIN facilities f ON fsl.facility_id = f.id
    WHERE fsl.status = 'CRITICAL'
  `);

  let alertsGenerated = 0;

  for (const critical of criticalResult.rows) {
    // Find SURPLUS facilities with the same item
    const surplusResult = await db.pool.query(`
      SELECT 
        fsl.facility_id, fsl.current_stock,
        f.name as facility_name, f.latitude, f.longitude
      FROM facility_stock_levels fsl
      JOIN facilities f ON fsl.facility_id = f.id
      WHERE fsl.status = 'SURPLUS' AND fsl.item_id = $1
    `, [critical.item_id]);

    if (surplusResult.rows.length === 0) {
      continue; // No surplus available
    }

    // Find nearest surplus facility with valid coordinates
    let nearest = null;
    let minDistance = Infinity;

    for (const surplus of surplusResult.rows) {
      if (!critical.latitude || !critical.longitude || !surplus.latitude || !surplus.longitude) continue;
      const distance = haversineDistance(
        critical.latitude, critical.longitude,
        surplus.latitude, surplus.longitude
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = surplus;
      }
    }

    if (!nearest) continue;

    // Calculate shortage timeframe
    const burnRate = critical.daily_burn_rate || 1;
    const shortageHours = Math.round((critical.current_stock / burnRate) * 24);
    const timeframe = `${shortageHours} Hours`;

    // Generate alert ID
    const alertResult = await db.pool.query(`
      INSERT INTO transfer_alerts 
        (alert_id, item_id, from_facility_id, to_facility_id, surplus_amount, distance_km, shortage_timeframe, status)
      VALUES 
        ('TRN-' || nextval('transfer_alerts_id_seq'), $1, $2, $3, $4, $5, $6, 'OPEN')
      ON CONFLICT DO NOTHING
      RETURNING id
    `, [
      critical.item_id,
      nearest.facility_id,
      critical.facility_id,
      nearest.current_stock,
      minDistance,
      timeframe
    ]);

    if (alertResult.rows.length > 0) {
      alertsGenerated++;
    }
  }

  logger.info(`Generated ${alertsGenerated} transfer alerts`);
}

/**
 * Run full coordination cycle
 */
async function runCoordinationCycle() {
  logger.info('=== Starting Coordination Cycle ===');
  const startTime = Date.now();
  
  try {
    // Sync DHIS2 data (non-fatal if DHIS2 is unreachable)
    try {
      await dhis2Service.syncOrganisationUnits();
      await dhis2Service.syncDataElements();
      await dhis2Service.ingestDataValues();
    } catch (dhis2Error) {
      logger.warn('DHIS2 sync failed, continuing with existing data:', dhis2Error.message);
    }

    await computeStockStatuses();
    await generateTransferAlerts();
    
    const duration = Date.now() - startTime;
    logger.info(`=== Coordination Cycle Complete (${duration}ms) ===`);
  } catch (error) {
    logger.error('Coordination cycle failed:', error);
  }
}

// Helper functions
function getCurrentPeriod() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}${month}`;
}

module.exports = {
  computeStatus,
  updatePharmacyStock,
  computeStockStatuses,
  generateTransferAlerts,
  runCoordinationCycle
};
