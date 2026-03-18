const dhis2Service = require('../services/dhis2Service');
const { logger } = require('../services/logger');

/**
 * GET /api/v1/dhis2/status
 * Returns DHIS2 integration status
 */
async function getStatus(req, res) {
  try {
    const status = await dhis2Service.getIntegrationStatus();
    res.json(status);
  } catch (error) {
    logger.error('Error fetching DHIS2 status:', error);
    res.status(500).json({ error: 'Failed to fetch DHIS2 status' });
  }
}

/**
 * GET /api/v1/dhis2/test-connection
 * Tests connectivity to DHIS2 server
 */
async function testConnection(req, res) {
  try {
    const result = await dhis2Service.testConnection();
    const statusCode = result.ok ? 200 : 502;
    res.status(statusCode).json(result);
  } catch (error) {
    logger.error('Error testing DHIS2 connection:', error);
    res.status(500).json({ error: 'Failed to test DHIS2 connection' });
  }
}

/**
 * POST /api/v1/dhis2/sync/org-units
 * Triggers org unit synchronization from DHIS2
 */
async function syncOrgUnits(req, res) {
  try {
    logger.info('Manual org unit sync triggered');
    const result = await dhis2Service.syncOrganisationUnits();
    res.json({ success: true, ...result });
  } catch (error) {
    logger.error('Org unit sync failed:', error);
    res.status(500).json({ error: 'Org unit sync failed', details: error.message });
  }
}

/**
 * POST /api/v1/dhis2/sync/data-elements
 * Triggers data element synchronization from DHIS2
 */
async function syncDataElements(req, res) {
  try {
    logger.info('Manual data element sync triggered');
    const result = await dhis2Service.syncDataElements();
    res.json({ success: true, ...result });
  } catch (error) {
    logger.error('Data element sync failed:', error);
    res.status(500).json({ error: 'Data element sync failed', details: error.message });
  }
}

/**
 * POST /api/v1/dhis2/sync/data-values
 * Triggers data value ingestion from DHIS2
 */
async function syncDataValues(req, res) {
  try {
    const period = req.body.period || null;
    logger.info(`Manual data value sync triggered${period ? ` for period ${period}` : ''}`);
    const result = await dhis2Service.ingestDataValues(period);
    res.json({ success: true, ...result });
  } catch (error) {
    logger.error('Data value sync failed:', error);
    res.status(500).json({ error: 'Data value sync failed', details: error.message });
  }
}

/**
 * POST /api/v1/dhis2/sync/full
 * Runs a full sync: org units → data elements → data values
 */
async function runFullSync(req, res) {
  try {
    logger.info('Full DHIS2 sync triggered');
    const results = {};

    results.orgUnits = await dhis2Service.syncOrganisationUnits();
    results.dataElements = await dhis2Service.syncDataElements();
    results.dataValues = await dhis2Service.ingestDataValues(req.body.period || null);

    res.json({ success: true, results });
  } catch (error) {
    logger.error('Full DHIS2 sync failed:', error);
    res.status(500).json({ error: 'Full sync failed', details: error.message });
  }
}

/**
 * GET /api/v1/dhis2/sync/history
 * Returns sync history log
 */
async function getSyncHistory(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const history = await dhis2Service.getSyncHistory(limit);
    res.json(history);
  } catch (error) {
    logger.error('Error fetching sync history:', error);
    res.status(500).json({ error: 'Failed to fetch sync history' });
  }
}

module.exports = {
  getStatus,
  testConnection,
  syncOrgUnits,
  syncDataElements,
  syncDataValues,
  runFullSync,
  getSyncHistory
};
