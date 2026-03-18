const axios = require('axios');
const db = require('../config/database');
const { logger } = require('./logger');

const DHIS2_API_URL = process.env.DHIS2_API_URL || 'https://play.im.dhis2.org/dev';
const DHIS2_USERNAME = process.env.DHIS2_USERNAME || 'admin';
const DHIS2_PASSWORD = process.env.DHIS2_PASSWORD || 'district';
const TIMEOUT = 30000;

/**
 * Create an authenticated axios instance for DHIS2
 */
function createDHIS2Client() {
  return axios.create({
    baseURL: DHIS2_API_URL,
    auth: { username: DHIS2_USERNAME, password: DHIS2_PASSWORD },
    timeout: TIMEOUT,
    headers: { 'Accept': 'application/json' }
  });
}

/**
 * Test connectivity to DHIS2 server
 * @returns {{ ok: boolean, version: string|null, error: string|null }}
 */
async function testConnection() {
  const client = createDHIS2Client();
  try {
    const res = await client.get('/api/system/info.json');
    return {
      ok: true,
      version: res.data.version || res.data.revision,
      serverDate: res.data.serverDate,
      contextPath: res.data.contextPath,
      error: null
    };
  } catch (err) {
    return {
      ok: false,
      version: null,
      serverDate: null,
      contextPath: null,
      error: err.response ? `${err.response.status} ${err.response.statusText}` : err.message
    };
  }
}

/**
 * Sync organisation units from DHIS2 into local DB
 * Pulls facility-level org units (level 4 in most DHIS2 instances)
 */
async function syncOrganisationUnits() {
  const client = createDHIS2Client();
  const syncLogId = await logSyncStart('DHIS2_ORG_UNIT_SYNC');
  let processed = 0;
  let failed = 0;

  try {
    // Pull org units with coordinates - paginate through all results
    let page = 1;
    let hasMore = true;
    const allOrgUnits = [];

    while (hasMore) {
      const res = await client.get('/api/organisationUnits.json', {
        params: {
          fields: 'id,name,level,parent[id],geometry',
          paging: true,
          page,
          pageSize: 100,
          // Get org units that are children of our root org unit
          filter: `ancestors.id:eq:${process.env.DHIS2_ORG_UNIT_ID || 'ImspTQPwCqd'}`
        }
      });

      const orgUnits = res.data.organisationUnits || [];
      allOrgUnits.push(...orgUnits);
      
      hasMore = res.data.pager && page < res.data.pager.pageCount;
      page++;
    }

    logger.info(`Fetched ${allOrgUnits.length} org units from DHIS2`);

    for (const ou of allOrgUnits) {
      try {
        let lat = null;
        let lon = null;

        // Extract coordinates from geometry if available
        if (ou.geometry && ou.geometry.type === 'Point' && ou.geometry.coordinates) {
          lon = ou.geometry.coordinates[0];
          lat = ou.geometry.coordinates[1];
        }

        // Upsert into org unit mapping table
        await db.pool.query(`
          INSERT INTO dhis2_org_unit_map (dhis2_uid, name, level, parent_uid, latitude, longitude, last_synced)
          VALUES ($1, $2, $3, $4, $5, $6, NOW())
          ON CONFLICT (dhis2_uid)
          DO UPDATE SET name = $2, level = $3, parent_uid = $4, latitude = $5, longitude = $6, last_synced = NOW()
        `, [ou.id, ou.name, ou.level, ou.parent?.id || null, lat, lon]);

        // Auto-create or update facility record for this org unit
        const facilityResult = await db.pool.query(`
          INSERT INTO facilities (name, type, latitude, longitude, dhis2_org_unit_id, district, province)
          VALUES ($1, 'PUBLIC_HOSPITAL', $2, $3, $4, $1, '')
          ON CONFLICT (dhis2_org_unit_id)
          DO UPDATE SET name = $1, latitude = $2, longitude = $3, updated_at = NOW()
          RETURNING id
        `, [ou.name, lat, lon, ou.id]);

        // Link the mapping to the facility
        if (facilityResult.rows.length > 0) {
          await db.pool.query(
            'UPDATE dhis2_org_unit_map SET facility_id = $1 WHERE dhis2_uid = $2',
            [facilityResult.rows[0].id, ou.id]
          );
        }

        processed++;
      } catch (err) {
        logger.error(`Failed to sync org unit ${ou.id}: ${err.message}`);
        failed++;
      }
    }

    await logSyncComplete(syncLogId, 'SUCCESS', processed, failed);
    logger.info(`Org unit sync complete: ${processed} processed, ${failed} failed`);
    return { processed, failed };
  } catch (err) {
    logger.error('Org unit sync failed:', err.message);
    await logSyncComplete(syncLogId, 'FAILED', processed, failed, err.message);
    throw err;
  }
}

/**
 * Sync data elements from a specific data set in DHIS2
 * Discovers what commodities/items are being reported
 */
async function syncDataElements() {
  const client = createDHIS2Client();
  const dataSetId = process.env.DHIS2_STOCK_DATASET_ID || 'BfMAe6Itzgt';
  const syncLogId = await logSyncStart('DHIS2_DATA_ELEMENT_SYNC');
  let processed = 0;
  let failed = 0;

  try {
    // Get data elements for the configured data set
    const res = await client.get(`/api/dataSets/${dataSetId}.json`, {
      params: {
        fields: 'id,name,dataSetElements[dataElement[id,name,shortName,valueType]]'
      }
    });

    const dataSetElements = res.data.dataSetElements || [];
    logger.info(`Found ${dataSetElements.length} data elements in dataset ${dataSetId}`);

    for (const dse of dataSetElements) {
      const de = dse.dataElement;
      if (!de) continue;

      try {
        // Upsert into data element mapping table
        await db.pool.query(`
          INSERT INTO dhis2_data_element_map (dhis2_uid, name, short_name, value_type, last_synced)
          VALUES ($1, $2, $3, $4, NOW())
          ON CONFLICT (dhis2_uid)
          DO UPDATE SET name = $2, short_name = $3, value_type = $4, last_synced = NOW()
        `, [de.id, de.name, de.shortName || de.name, de.valueType || 'TEXT']);

        // Auto-create inventory item for this data element if it doesn't exist
        const itemResult = await db.pool.query(`
          INSERT INTO inventory_catalog (item_name, category, dhis2_data_element_id, unit_of_measure, description)
          VALUES ($1, 'DHIS2_IMPORT', $2, 'units', $3)
          ON CONFLICT (dhis2_data_element_id)
          DO UPDATE SET item_name = $1, description = $3
          RETURNING id
        `, [de.shortName || de.name, de.id, de.name]);

        // Link the mapping to the inventory item
        if (itemResult.rows.length > 0) {
          await db.pool.query(
            'UPDATE dhis2_data_element_map SET item_id = $1 WHERE dhis2_uid = $2',
            [itemResult.rows[0].id, de.id]
          );
        }

        processed++;
      } catch (err) {
        logger.error(`Failed to sync data element ${de.id}: ${err.message}`);
        failed++;
      }
    }

    await logSyncComplete(syncLogId, 'SUCCESS', processed, failed);
    logger.info(`Data element sync complete: ${processed} processed, ${failed} failed`);
    return { processed, failed };
  } catch (err) {
    logger.error('Data element sync failed:', err.message);
    await logSyncComplete(syncLogId, 'FAILED', processed, failed, err.message);
    throw err;
  }
}

/**
 * Ingest actual data values from DHIS2 for a given period
 * @param {string} [period] - DHIS2 period string like '202603'. Defaults to current month
 */
async function ingestDataValues(period) {
  const client = createDHIS2Client();
  const syncLogId = await logSyncStart('DHIS2_DATA_INGEST');
  let processed = 0;
  let failed = 0;

  if (!period) {
    period = getCurrentPeriod();
  }

  try {
    logger.info(`Ingesting DHIS2 data values for period ${period}...`);

    // Get all tracked org units from our mapping
    const orgUnitsResult = await db.pool.query(
      'SELECT dhis2_uid, facility_id FROM dhis2_org_unit_map WHERE facility_id IS NOT NULL'
    );

    if (orgUnitsResult.rows.length === 0) {
      logger.warn('No mapped org units found. Run org unit sync first.');
      await logSyncComplete(syncLogId, 'SKIPPED', 0, 0, 'No mapped org units');
      return { processed: 0, failed: 0, skipped: true };
    }

    // Build org unit list for the API call (batch max 50 at a time)
    const orgUnitIds = orgUnitsResult.rows.map(r => r.dhis2_uid);
    const orgUnitMap = new Map(orgUnitsResult.rows.map(r => [r.dhis2_uid, r.facility_id]));

    // Get data element to item mapping
    const itemMapResult = await db.pool.query(
      'SELECT dhis2_uid, item_id FROM dhis2_data_element_map WHERE item_id IS NOT NULL'
    );
    const itemMap = new Map(itemMapResult.rows.map(r => [r.dhis2_uid, r.item_id]));

    if (itemMap.size === 0) {
      logger.warn('No mapped data elements found. Run data element sync first.');
      await logSyncComplete(syncLogId, 'SKIPPED', 0, 0, 'No mapped data elements');
      return { processed: 0, failed: 0, skipped: true };
    }

    // Fetch data values in batches of 50 org units
    // DHIS2 requires separate orgUnit params, not semicolon-separated
    const batchSize = 50;
    for (let i = 0; i < orgUnitIds.length; i += batchSize) {
      const batch = orgUnitIds.slice(i, i + batchSize);
      
      try {
        // Build URL params with multiple orgUnit entries
        const params = new URLSearchParams();
        params.append('dataSet', process.env.DHIS2_STOCK_DATASET_ID || 'BfMAe6Itzgt');
        params.append('period', period);
        for (const uid of batch) {
          params.append('orgUnit', uid);
        }

        const res = await client.get('/api/dataValueSets.json', { params });

        const dataValues = res.data.dataValues || [];
        logger.info(`Batch ${Math.floor(i / batchSize) + 1}: received ${dataValues.length} data values`);

        for (const dv of dataValues) {
          const facilityId = orgUnitMap.get(dv.orgUnit);
          const itemId = itemMap.get(dv.dataElement);

          if (!facilityId) {
            logger.debug(`Skipping unmapped org unit: ${dv.orgUnit}`);
            continue;
          }
          if (!itemId) {
            logger.debug(`Skipping unmapped data element: ${dv.dataElement}`);
            continue;
          }

          const value = parseInt(dv.value);
          if (isNaN(value)) {
            logger.debug(`Skipping non-numeric value for ${dv.dataElement}: ${dv.value}`);
            continue;
          }

          try {
            await db.pool.query(`
              INSERT INTO facility_stock_levels (facility_id, item_id, current_stock, last_updated)
              VALUES ($1, $2, $3, NOW())
              ON CONFLICT (facility_id, item_id)
              DO UPDATE SET current_stock = $3, last_updated = NOW()
            `, [facilityId, itemId, value]);
            processed++;
          } catch (err) {
            logger.error(`Failed to upsert stock level: ${err.message}`);
            failed++;
          }
        }
      } catch (err) {
        // Batch fetch can fail due to missing data - log and continue
        if (err.response && err.response.status === 409) {
          logger.warn(`Batch ${Math.floor(i / batchSize) + 1}: no data (409 Conflict)`);
        } else {
          logger.error(`Batch ${Math.floor(i / batchSize) + 1} failed: ${err.message}`);
          failed++;
        }
      }
    }

    await logSyncComplete(syncLogId, 'SUCCESS', processed, failed);
    logger.info(`Data ingestion complete: ${processed} processed, ${failed} failed`);
    return { processed, failed };
  } catch (err) {
    logger.error('Data value ingestion failed:', err.message);
    await logSyncComplete(syncLogId, 'FAILED', processed, failed, err.message);
    throw err;
  }
}

/**
 * Get sync history from the log
 * @param {number} limit
 */
async function getSyncHistory(limit = 20) {
  const result = await db.pool.query(
    `SELECT * FROM dhis2_sync_log ORDER BY started_at DESC LIMIT $1`,
    [limit]
  );
  return result.rows;
}

/**
 * Get DHIS2 integration status summary
 */
async function getIntegrationStatus() {
  const [connection, orgUnits, dataElements, lastSync] = await Promise.all([
    testConnection(),
    db.pool.query('SELECT COUNT(*) as count FROM dhis2_org_unit_map'),
    db.pool.query('SELECT COUNT(*) as count FROM dhis2_data_element_map'),
    db.pool.query('SELECT * FROM dhis2_sync_log ORDER BY started_at DESC LIMIT 1')
  ]);

  return {
    dhis2_url: DHIS2_API_URL,
    connection,
    mapped_org_units: parseInt(orgUnits.rows[0].count),
    mapped_data_elements: parseInt(dataElements.rows[0].count),
    last_sync: lastSync.rows[0] || null
  };
}

// Helper functions
function getCurrentPeriod() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}${month}`;
}

async function logSyncStart(syncType) {
  const result = await db.pool.query(
    'INSERT INTO dhis2_sync_log (sync_type, status, started_at) VALUES ($1, $2, NOW()) RETURNING id',
    [syncType, 'RUNNING']
  );
  return result.rows[0].id;
}

async function logSyncComplete(syncLogId, status, recordsProcessed, recordsFailed, errorMessage = null) {
  await db.pool.query(`
    UPDATE dhis2_sync_log 
    SET status = $1, records_processed = $2, records_failed = $3, error_message = $4, completed_at = NOW()
    WHERE id = $5
  `, [status, recordsProcessed, recordsFailed, errorMessage, syncLogId]);
}

module.exports = {
  createDHIS2Client,
  testConnection,
  syncOrganisationUnits,
  syncDataElements,
  ingestDataValues,
  getSyncHistory,
  getIntegrationStatus,
  getCurrentPeriod
};
