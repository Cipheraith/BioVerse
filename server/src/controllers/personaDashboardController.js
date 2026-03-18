const db = require('../config/database');
const { logger } = require('../services/logger');

/**
 * GET /api/v1/dashboard/national
 * Ministry of Health — national-level overview
 */
async function getNationalDashboard(req, res) {
  try {
    // Parallel queries for performance
    const [
      facilityStats,
      districtBreakdown,
      transferStats,
      stockSummary,
      recentTransfers,
      topCriticalFacilities
    ] = await Promise.all([
      // 1. Facility count by status
      db.pool.query(`
        SELECT 
          COUNT(*) as total_facilities,
          COUNT(*) FILTER (WHERE sub.status = 'CRITICAL') as critical,
          COUNT(*) FILTER (WHERE sub.status = 'HEALTHY') as healthy,
          COUNT(*) FILTER (WHERE sub.status = 'SURPLUS') as surplus
        FROM (
          SELECT f.id,
            COALESCE(
              (SELECT fsl.status FROM facility_stock_levels fsl 
               WHERE fsl.facility_id = f.id 
               ORDER BY CASE status WHEN 'CRITICAL' THEN 1 WHEN 'HEALTHY' THEN 2 WHEN 'SURPLUS' THEN 3 END 
               LIMIT 1),
              'HEALTHY'
            ) as status
          FROM facilities f
        ) sub
      `),

      // 2. District-level breakdown
      db.pool.query(`
        SELECT 
          f.district,
          COUNT(*) as facility_count,
          COUNT(*) FILTER (WHERE fsl_agg.worst_status = 'CRITICAL') as critical,
          COUNT(*) FILTER (WHERE fsl_agg.worst_status = 'HEALTHY') as healthy,
          COUNT(*) FILTER (WHERE fsl_agg.worst_status = 'SURPLUS') as surplus,
          COALESCE(SUM(fsl_agg.critical_items), 0) as total_critical_items
        FROM facilities f
        LEFT JOIN LATERAL (
          SELECT 
            COALESCE(
              (SELECT status FROM facility_stock_levels WHERE facility_id = f.id
               ORDER BY CASE status WHEN 'CRITICAL' THEN 1 WHEN 'HEALTHY' THEN 2 WHEN 'SURPLUS' THEN 3 END
               LIMIT 1),
              'HEALTHY'
            ) as worst_status,
            (SELECT COUNT(*) FROM facility_stock_levels WHERE facility_id = f.id AND status = 'CRITICAL') as critical_items
        ) fsl_agg ON true
        GROUP BY f.district
        ORDER BY critical DESC, facility_count DESC
        LIMIT 30
      `),

      // 3. Transfer alerts stats
      db.pool.query(`
        SELECT 
          COUNT(*) as total_alerts,
          COUNT(*) FILTER (WHERE status = 'OPEN') as open_alerts,
          COUNT(*) FILTER (WHERE status = 'ACKNOWLEDGED') as acknowledged,
          COUNT(*) FILTER (WHERE status = 'RESOLVED') as resolved
        FROM transfer_alerts
      `),

      // 4. Stock coverage summary
      db.pool.query(`
        SELECT 
          COUNT(*) as total_stock_records,
          COUNT(*) FILTER (WHERE status = 'CRITICAL') as critical_items,
          COUNT(*) FILTER (WHERE status = 'HEALTHY') as healthy_items,
          COUNT(*) FILTER (WHERE status = 'SURPLUS') as surplus_items,
          COUNT(DISTINCT facility_id) as facilities_with_stock
        FROM facility_stock_levels
      `),

      // 5. Recent transfer alerts
      db.pool.query(`
        SELECT 
          ta.alert_id, ta.status, ta.distance_km, ta.shortage_timeframe, ta.surplus_amount, ta.created_at,
          ic.item_name as item, ic.category,
          ff.name as from_facility, ff.district as from_district,
          tf.name as to_facility, tf.district as to_district
        FROM transfer_alerts ta
        JOIN inventory_catalog ic ON ta.item_id = ic.id
        JOIN facilities ff ON ta.from_facility_id = ff.id
        JOIN facilities tf ON ta.to_facility_id = tf.id
        ORDER BY ta.created_at DESC
        LIMIT 10
      `),

      // 6. Top critical facilities
      db.pool.query(`
        SELECT 
          f.id, f.name, f.district, f.type, f.latitude, f.longitude,
          COUNT(*) FILTER (WHERE fsl.status = 'CRITICAL') as critical_items,
          COUNT(*) as total_items
        FROM facilities f
        JOIN facility_stock_levels fsl ON fsl.facility_id = f.id
        WHERE fsl.status = 'CRITICAL'
        GROUP BY f.id, f.name, f.district, f.type, f.latitude, f.longitude
        ORDER BY critical_items DESC
        LIMIT 15
      `)
    ]);

    const stats = facilityStats.rows[0];
    const stock = stockSummary.rows[0];
    const transfers = transferStats.rows[0];

    res.json({
      summary: {
        total_facilities: parseInt(stats.total_facilities),
        critical_facilities: parseInt(stats.critical),
        healthy_facilities: parseInt(stats.healthy),
        surplus_facilities: parseInt(stats.surplus),
        health_score: stats.total_facilities > 0 
          ? Math.round(((parseInt(stats.healthy) + parseInt(stats.surplus)) / parseInt(stats.total_facilities)) * 100) 
          : 0,
        total_stock_records: parseInt(stock.total_stock_records),
        critical_stock_items: parseInt(stock.critical_items),
        facilities_with_stock: parseInt(stock.facilities_with_stock),
        open_transfers: parseInt(transfers.open_alerts),
        total_transfers: parseInt(transfers.total_alerts),
      },
      districts: districtBreakdown.rows.map(d => ({
        district: d.district,
        facility_count: parseInt(d.facility_count),
        critical: parseInt(d.critical),
        healthy: parseInt(d.healthy),
        surplus: parseInt(d.surplus),
        critical_items: parseInt(d.total_critical_items),
        health_score: d.facility_count > 0 
          ? Math.round(((parseInt(d.healthy) + parseInt(d.surplus)) / parseInt(d.facility_count)) * 100) 
          : 0
      })),
      recent_transfers: recentTransfers.rows.map(t => ({
        ...t,
        distance_km: parseFloat(t.distance_km) || 0
      })),
      critical_facilities: topCriticalFacilities.rows.map(f => ({
        ...f,
        critical_items: parseInt(f.critical_items),
        total_items: parseInt(f.total_items)
      }))
    });
  } catch (error) {
    logger.error('Error fetching national dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch national dashboard data' });
  }
}

/**
 * GET /api/v1/dashboard/district?district=X
 * District Health Officer — district-level view
 */
async function getDistrictDashboard(req, res) {
  try {
    const { district } = req.query;

    // If no district specified, return list of all districts
    if (!district) {
      const districts = await db.pool.query(`
        SELECT DISTINCT district, COUNT(*) as facility_count
        FROM facilities
        GROUP BY district
        ORDER BY district
      `);
      return res.json({ districts: districts.rows });
    }

    const [
      facilities,
      districtStats,
      transfers,
      stockBreakdown
    ] = await Promise.all([
      // All facilities in district with status
      db.pool.query(`
        SELECT 
          f.id, f.name, f.type, f.latitude, f.longitude,
          COALESCE(
            (SELECT status FROM facility_stock_levels fsl 
             WHERE fsl.facility_id = f.id 
             ORDER BY CASE status WHEN 'CRITICAL' THEN 1 WHEN 'HEALTHY' THEN 2 WHEN 'SURPLUS' THEN 3 END 
             LIMIT 1),
            'HEALTHY'
          ) as status,
          (SELECT COUNT(*) FROM facility_stock_levels fsl WHERE fsl.facility_id = f.id AND fsl.status = 'CRITICAL') as critical_items,
          (SELECT COUNT(*) FROM facility_stock_levels fsl WHERE fsl.facility_id = f.id) as total_items
        FROM facilities f
        WHERE f.district = $1
        ORDER BY 
          CASE WHEN (SELECT COUNT(*) FROM facility_stock_levels fsl WHERE fsl.facility_id = f.id AND fsl.status = 'CRITICAL') > 0 THEN 0 ELSE 1 END,
          f.name
      `, [district]),

      // District aggregate stats
      db.pool.query(`
        SELECT 
          COUNT(DISTINCT f.id) as total_facilities,
          COUNT(DISTINCT CASE WHEN fsl.status = 'CRITICAL' THEN f.id END) as critical_facilities,
          COUNT(*) FILTER (WHERE fsl.status = 'CRITICAL') as critical_stock_items,
          COUNT(*) FILTER (WHERE fsl.status = 'HEALTHY') as healthy_stock_items,
          COUNT(*) FILTER (WHERE fsl.status = 'SURPLUS') as surplus_stock_items
        FROM facilities f
        LEFT JOIN facility_stock_levels fsl ON fsl.facility_id = f.id
        WHERE f.district = $1
      `, [district]),

      // Transfers involving district facilities
      db.pool.query(`
        SELECT 
          ta.alert_id, ta.status, ta.distance_km, ta.shortage_timeframe, ta.surplus_amount, ta.created_at,
          ic.item_name as item,
          ff.name as from_facility, ff.district as from_district,
          tf.name as to_facility, tf.district as to_district
        FROM transfer_alerts ta
        JOIN inventory_catalog ic ON ta.item_id = ic.id
        JOIN facilities ff ON ta.from_facility_id = ff.id
        JOIN facilities tf ON ta.to_facility_id = tf.id
        WHERE ff.district = $1 OR tf.district = $1
        ORDER BY ta.created_at DESC
        LIMIT 20
      `, [district]),

      // Stock item breakdown 
      db.pool.query(`
        SELECT 
          ic.item_name, ic.category,
          COUNT(*) as facility_count,
          COUNT(*) FILTER (WHERE fsl.status = 'CRITICAL') as critical,
          COUNT(*) FILTER (WHERE fsl.status = 'HEALTHY') as healthy,
          COUNT(*) FILTER (WHERE fsl.status = 'SURPLUS') as surplus
        FROM facility_stock_levels fsl
        JOIN facilities f ON fsl.facility_id = f.id
        JOIN inventory_catalog ic ON fsl.item_id = ic.id
        WHERE f.district = $1
        GROUP BY ic.item_name, ic.category
        ORDER BY critical DESC
      `, [district])
    ]);

    const stats = districtStats.rows[0] || {};

    res.json({
      district,
      summary: {
        total_facilities: parseInt(stats.total_facilities) || 0,
        critical_facilities: parseInt(stats.critical_facilities) || 0,
        critical_stock_items: parseInt(stats.critical_stock_items) || 0,
        healthy_stock_items: parseInt(stats.healthy_stock_items) || 0,
        surplus_stock_items: parseInt(stats.surplus_stock_items) || 0,
        active_transfers: transfers.rows.filter(t => t.status === 'OPEN').length
      },
      facilities: facilities.rows.map(f => ({
        ...f,
        critical_items: parseInt(f.critical_items),
        total_items: parseInt(f.total_items)
      })),
      transfers: transfers.rows.map(t => ({
        ...t,
        distance_km: parseFloat(t.distance_km) || 0
      })),
      stock_breakdown: stockBreakdown.rows.map(s => ({
        ...s,
        facility_count: parseInt(s.facility_count),
        critical: parseInt(s.critical),
        healthy: parseInt(s.healthy),
        surplus: parseInt(s.surplus)
      }))
    });
  } catch (error) {
    logger.error('Error fetching district dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch district dashboard data' });
  }
}

/**
 * GET /api/v1/dashboard/facility?facilityId=X
 * Facility Manager — facility-level view
 */
async function getFacilityDashboard(req, res) {
  try {
    const { facilityId } = req.query;

    if (!facilityId) {
      // Return facilities list for selection
      const facilities = await db.pool.query(`
        SELECT id, name, type, district FROM facilities ORDER BY name LIMIT 100
      `);
      return res.json({ facilities: facilities.rows });
    }

    const [
      facilityInfo,
      stockLevels,
      wardData,
      transfers,
      intakeLogs,
      referrals
    ] = await Promise.all([
      // Facility details
      db.pool.query(`SELECT * FROM facilities WHERE id = $1`, [facilityId]),

      // Stock levels for this facility
      db.pool.query(`
        SELECT 
          fsl.id, fsl.status, fsl.current_stock, fsl.daily_burn_rate, fsl.last_updated,
          ic.item_name, ic.category, ic.unit_of_measure,
          CASE WHEN fsl.daily_burn_rate > 0 
            THEN ROUND(fsl.current_stock::numeric / fsl.daily_burn_rate, 1) 
            ELSE NULL 
          END as days_of_supply
        FROM facility_stock_levels fsl
        JOIN inventory_catalog ic ON fsl.item_id = ic.id
        WHERE fsl.facility_id = $1
        ORDER BY CASE fsl.status WHEN 'CRITICAL' THEN 1 WHEN 'HEALTHY' THEN 2 WHEN 'SURPLUS' THEN 3 END
      `, [facilityId]),

      // Wards and beds for this facility
      db.pool.query(`
        SELECT fw.id, fw.name, fw.ward_type, fw.capacity,
          COALESCE(SUM(fwb.beds_total), 0) as total_beds,
          COALESCE(SUM(fwb.beds_occupied), 0) as occupied_beds
        FROM facility_wards fw
        LEFT JOIN facility_ward_beds fwb ON fwb.ward_id = fw.id
        WHERE fw.facility_id = $1
        GROUP BY fw.id, fw.name, fw.ward_type, fw.capacity
        ORDER BY fw.name
      `, [facilityId]),

      // Transfers involving this facility
      db.pool.query(`
        SELECT 
          ta.alert_id, ta.status, ta.distance_km, ta.surplus_amount, ta.shortage_timeframe, ta.created_at,
          ic.item_name as item,
          ff.name as from_facility, tf.name as to_facility,
          CASE WHEN ta.from_facility_id = $1 THEN 'OUTGOING' ELSE 'INCOMING' END as direction
        FROM transfer_alerts ta
        JOIN inventory_catalog ic ON ta.item_id = ic.id
        JOIN facilities ff ON ta.from_facility_id = ff.id
        JOIN facilities tf ON ta.to_facility_id = tf.id
        WHERE ta.from_facility_id = $1 OR ta.to_facility_id = $1
        ORDER BY ta.created_at DESC
        LIMIT 20
      `, [facilityId]),

      // Patient intake logs
      db.pool.query(`
        SELECT * FROM patient_intake_logs 
        WHERE facility_id = $1 
        ORDER BY created_at DESC LIMIT 20
      `).catch(() => ({ rows: [] })),

      // Care referrals
      db.pool.query(`
        SELECT cr.*, 
          ff.name as from_facility_name, tf.name as to_facility_name
        FROM care_referrals cr
        LEFT JOIN facilities ff ON cr.from_facility_id = ff.id
        LEFT JOIN facilities tf ON cr.to_facility_id = tf.id
        WHERE cr.from_facility_id = $1 OR cr.to_facility_id = $1
        ORDER BY cr.created_at DESC LIMIT 20
      `).catch(() => ({ rows: [] }))
    ]);

    if (facilityInfo.rows.length === 0) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    const facility = facilityInfo.rows[0];
    const stocks = stockLevels.rows;
    const wards = wardData.rows;

    res.json({
      facility,
      stock_summary: {
        total_items: stocks.length,
        critical: stocks.filter(s => s.status === 'CRITICAL').length,
        healthy: stocks.filter(s => s.status === 'HEALTHY').length,
        surplus: stocks.filter(s => s.status === 'SURPLUS').length,
      },
      stock_levels: stocks,
      wards: wards.map(w => ({
        ...w,
        total_beds: parseInt(w.total_beds),
        occupied_beds: parseInt(w.occupied_beds),
        occupancy_rate: w.total_beds > 0 ? Math.round((parseInt(w.occupied_beds) / parseInt(w.total_beds)) * 100) : 0
      })),
      bed_summary: {
        total_beds: wards.reduce((sum, w) => sum + parseInt(w.total_beds), 0),
        occupied_beds: wards.reduce((sum, w) => sum + parseInt(w.occupied_beds), 0),
        available_beds: wards.reduce((sum, w) => sum + (parseInt(w.total_beds) - parseInt(w.occupied_beds)), 0),
      },
      transfers: transfers.rows.map(t => ({
        ...t,
        distance_km: parseFloat(t.distance_km) || 0
      })),
      intake_logs: intakeLogs.rows,
      referrals: referrals.rows,
    });
  } catch (error) {
    logger.error('Error fetching facility dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch facility dashboard data' });
  }
}

/**
 * GET /api/v1/dashboard/health-worker
 * Health Worker — simple operational view
 */
async function getHealthWorkerDashboard(req, res) {
  try {
    const [
      recentIntake,
      pendingReferrals,
      lowStockAlerts,
      inventoryItems,
      facilityList
    ] = await Promise.all([
      // Recent patient intake logs
      db.pool.query(`
        SELECT pil.*, f.name as facility_name
        FROM patient_intake_logs pil
        LEFT JOIN facilities f ON pil.facility_id = f.id
        ORDER BY pil.created_at DESC LIMIT 15
      `).catch(() => ({ rows: [] })),

      // Pending referrals
      db.pool.query(`
        SELECT cr.*, 
          ff.name as from_facility_name, tf.name as to_facility_name
        FROM care_referrals cr
        LEFT JOIN facilities ff ON cr.from_facility_id = ff.id
        LEFT JOIN facilities tf ON cr.to_facility_id = tf.id
        WHERE cr.status = 'PENDING'
        ORDER BY cr.created_at DESC LIMIT 15
      `).catch(() => ({ rows: [] })),

      // Critical stock alerts across facilities
      db.pool.query(`
        SELECT 
          f.id as facility_id, f.name as facility_name, f.district,
          ic.item_name, ic.category, ic.unit_of_measure,
          fsl.current_stock, fsl.daily_burn_rate,
          CASE WHEN fsl.daily_burn_rate > 0 
            THEN ROUND(fsl.current_stock::numeric / fsl.daily_burn_rate, 1) 
            ELSE NULL 
          END as days_of_supply
        FROM facility_stock_levels fsl
        JOIN facilities f ON fsl.facility_id = f.id
        JOIN inventory_catalog ic ON fsl.item_id = ic.id
        WHERE fsl.status = 'CRITICAL'
        ORDER BY days_of_supply ASC NULLS LAST
        LIMIT 20
      `),

      // All inventory items for forms
      db.pool.query(`SELECT id, item_name, category, unit_of_measure FROM inventory_catalog ORDER BY item_name`),

      // Facilities for forms
      db.pool.query(`SELECT id, name, district FROM facilities ORDER BY name LIMIT 50`)
    ]);

    res.json({
      recent_intake: recentIntake.rows,
      pending_referrals: pendingReferrals.rows,
      low_stock_alerts: lowStockAlerts.rows,
      inventory_items: inventoryItems.rows,
      facilities: facilityList.rows,
    });
  } catch (error) {
    logger.error('Error fetching health worker dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch health worker dashboard data' });
  }
}

/**
 * POST /api/v1/patient-intake
 * Health Worker submits patient intake log
 */
async function submitPatientIntake(req, res) {
  try {
    const { facility_id, patient_name, age, gender, symptoms, triage_level, notes } = req.body;

    if (!facility_id || !patient_name || !symptoms) {
      return res.status(400).json({ error: 'facility_id, patient_name, and symptoms are required' });
    }

    const result = await db.pool.query(`
      INSERT INTO patient_intake_logs (facility_id, patient_name, age, gender, symptoms, triage_level, notes, recorded_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [facility_id, patient_name, age || null, gender || null, symptoms, triage_level || 'STANDARD', notes || null, req.user?.id || null]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Error submitting patient intake:', error);
    res.status(500).json({ error: 'Failed to submit patient intake' });
  }
}

/**
 * POST /api/v1/referrals
 * Health Worker submits care referral
 */
async function submitReferral(req, res) {
  try {
    const { from_facility_id, to_facility_id, patient_name, reason, urgency, notes } = req.body;

    if (!from_facility_id || !to_facility_id || !patient_name || !reason) {
      return res.status(400).json({ error: 'from_facility_id, to_facility_id, patient_name, and reason are required' });
    }

    const result = await db.pool.query(`
      INSERT INTO care_referrals (from_facility_id, to_facility_id, patient_name, reason, urgency, notes, referred_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [from_facility_id, to_facility_id, patient_name, reason, urgency || 'ROUTINE', notes || null, req.user?.id || null]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Error submitting referral:', error);
    res.status(500).json({ error: 'Failed to submit referral' });
  }
}

/**
 * POST /api/v1/stock-update
 * Health Worker updates stock level for a facility item
 */
async function submitStockUpdate(req, res) {
  try {
    const { facility_id, item_id, new_stock, notes } = req.body;

    if (!facility_id || !item_id || new_stock === undefined) {
      return res.status(400).json({ error: 'facility_id, item_id, and new_stock are required' });
    }

    // Update or insert stock level
    const result = await db.pool.query(`
      INSERT INTO facility_stock_levels (facility_id, item_id, current_stock, status, last_updated)
      VALUES ($1, $2, $3, 
        CASE 
          WHEN $3::int < 50 THEN 'CRITICAL'
          WHEN $3::int > 500 THEN 'SURPLUS'
          ELSE 'HEALTHY'
        END,
        NOW()
      )
      ON CONFLICT (facility_id, item_id) 
      DO UPDATE SET 
        current_stock = $3,
        status = CASE 
          WHEN $3::int < 50 THEN 'CRITICAL'
          WHEN $3::int > 500 THEN 'SURPLUS'
          ELSE 'HEALTHY'
        END,
        last_updated = NOW()
      RETURNING *
    `, [facility_id, item_id, new_stock]);

    res.json({ success: true, stock: result.rows[0] });
  } catch (error) {
    logger.error('Error updating stock:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
}

module.exports = {
  getNationalDashboard,
  getDistrictDashboard,
  getFacilityDashboard,
  getHealthWorkerDashboard,
  submitPatientIntake,
  submitReferral,
  submitStockUpdate
};
