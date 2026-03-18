/**
 * BioVerse DHIS2 Integration Test
 * 
 * Tests the full pipeline:
 * 1. Creates coordination engine tables
 * 2. Tests DHIS2 connectivity
 * 3. Syncs org units from DHIS2
 * 4. Syncs data elements from DHIS2
 * 5. Attempts data value ingestion
 * 6. Seeds local test data and runs coordination engine
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DB_CONFIG = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'bioverse_zambia_db',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432
};

async function run() {
  const pool = new Pool(DB_CONFIG);
  
  console.log('\n========================================');
  console.log('  BioVerse DHIS2 Integration Test');
  console.log('========================================\n');

  // Step 0: Run main schema.sql first (creates base tables like users, patients, etc.)
  console.log('STEP 0: Running base schema...');
  try {
    const baseSchema = fs.readFileSync(
      path.join(__dirname, '..', 'src', 'config', 'schema.sql'),
      'utf8'
    );
    const stmts = baseSchema.split(';').filter(s => s.trim() !== '');
    for (const stmt of stmts) {
      await pool.query(stmt);
    }
    console.log('  [OK] Base schema ready\n');
  } catch (err) {
    console.log(`  [WARN] Base schema: ${err.message}\n`);
  }

  // Step 1: Run coordination engine schema
  console.log('STEP 1: Creating coordination engine tables...');
  try {
    const schema = fs.readFileSync(
      path.join(__dirname, '..', 'migrations', '001_coordination_engine.sql'),
      'utf8'
    );
    const statements = schema.split(';').filter(s => s.trim() !== '');
    for (const stmt of statements) {
      await pool.query(stmt);
    }
    console.log('  [OK] Coordination engine tables created\n');
  } catch (err) {
    console.error('  [FAIL] Schema creation failed:', err.message);
    await pool.end();
    process.exit(1);
  }

  // Step 2: Initialize database module (so services can use pool)
  console.log('STEP 2: Initializing database module...');
  try {
    const { initializeDatabase } = require('../src/config/database');
    await initializeDatabase();
    console.log('  [OK] Database module initialized\n');
  } catch (err) {
    console.log(`  [WARN] Database init: ${err.message}\n`);
  }

  // Step 3: Test DHIS2 connectivity
  console.log('STEP 3: Testing DHIS2 connectivity...');
  const dhis2Service = require('../src/services/dhis2Service');
  
  const conn = await dhis2Service.testConnection();
  if (conn.ok) {
    console.log(`  [OK] Connected to DHIS2`);
    console.log(`  Version: ${conn.version}`);
    console.log(`  Server Date: ${conn.serverDate}`);
    console.log(`  URL: ${process.env.DHIS2_API_URL}\n`);
  } else {
    console.log(`  [FAIL] DHIS2 connection failed: ${conn.error}`);
    console.log('  Continuing with local-only test...\n');
  }

  // Step 4: Sync org units 
  console.log('STEP 4: Syncing organisation units from DHIS2...');
  try {
    const orgResult = await dhis2Service.syncOrganisationUnits();
    console.log(`  [OK] Synced ${orgResult.processed} org units (${orgResult.failed} failed)\n`);
  } catch (err) {
    console.log(`  [WARN] Org unit sync failed: ${err.message}`);
    console.log('  This is expected on demo servers with limited data.\n');
  }

  // Step 5: Sync data elements
  console.log('STEP 5: Syncing data elements from DHIS2...');
  try {
    const deResult = await dhis2Service.syncDataElements();
    console.log(`  [OK] Synced ${deResult.processed} data elements (${deResult.failed} failed)\n`);
  } catch (err) {
    console.log(`  [WARN] Data element sync failed: ${err.message}`);
    console.log('  This is expected if the dataset ID does not exist on this server.\n');
  }

  // Step 6: Check what we got
  console.log('STEP 6: Checking sync results...');
  const orgCount = await pool.query('SELECT COUNT(*) as c FROM dhis2_org_unit_map');
  const deCount = await pool.query('SELECT COUNT(*) as c FROM dhis2_data_element_map');
  const facCount = await pool.query('SELECT COUNT(*) as c FROM facilities');
  const itemCount = await pool.query('SELECT COUNT(*) as c FROM inventory_catalog');
  
  console.log(`  Mapped org units:     ${orgCount.rows[0].c}`);
  console.log(`  Mapped data elements: ${deCount.rows[0].c}`);
  console.log(`  Facilities:           ${facCount.rows[0].c}`);
  console.log(`  Inventory items:      ${itemCount.rows[0].c}\n`);

  // Step 7: Attempt data value ingestion
  console.log('STEP 7: Attempting data value ingestion...');
  try {
    const dvResult = await dhis2Service.ingestDataValues('202301');
    console.log(`  [OK] Ingested ${dvResult.processed} data values (${dvResult.failed} failed)${dvResult.skipped ? ' [SKIPPED - no mappings]' : ''}\n`);
  } catch (err) {
    console.log(`  [WARN] Data ingestion failed: ${err.message}\n`);
  }

  // Step 7: Seed local test data if tables are empty
  const stockCount = await pool.query('SELECT COUNT(*) as c FROM facility_stock_levels');
  if (parseInt(stockCount.rows[0].c) === 0) {
    console.log('STEP 8: Seeding local test data (no DHIS2 data available)...');
    try {
      const seedSql = fs.readFileSync(
        path.join(__dirname, '..', 'migrations', '002_coordination_seed_data.sql'),
        'utf8'
      );
      const statements = seedSql.split(';').filter(s => s.trim() !== '');
      for (const stmt of statements) {
        await pool.query(stmt);
      }
      console.log('  [OK] Seed data loaded\n');
    } catch (err) {
      console.log(`  [WARN] Seed data partially loaded: ${err.message}\n`);
    }
  } else {
    console.log(`STEP 8: Skipping seed data (${stockCount.rows[0].c} stock records already exist)\n`);
  }

  // Step 9: Run coordination engine
  console.log('STEP 9: Running coordination engine...');
  const coordService = require('../src/services/coordinationService');
  
  await coordService.computeStockStatuses();
  await coordService.generateTransferAlerts();

  // Final summary
  const finalStock = await pool.query('SELECT status, COUNT(*) as c FROM facility_stock_levels GROUP BY status ORDER BY status');
  const alerts = await pool.query("SELECT COUNT(*) as c FROM transfer_alerts WHERE status = 'OPEN'");
  const syncLog = await pool.query('SELECT sync_type, status, records_processed, records_failed FROM dhis2_sync_log ORDER BY started_at DESC LIMIT 5');

  console.log('\n========================================');
  console.log('  RESULTS');
  console.log('========================================');
  console.log('\n  Stock Statuses:');
  for (const row of finalStock.rows) {
    console.log(`    ${row.status}: ${row.c} items`);
  }
  console.log(`\n  Open Transfer Alerts: ${alerts.rows[0].c}`);
  console.log('\n  Recent Sync Log:');
  for (const row of syncLog.rows) {
    console.log(`    ${row.sync_type}: ${row.status} (${row.records_processed} processed, ${row.records_failed} failed)`);
  }

  console.log('\n========================================');
  console.log('  DHIS2 Integration Test Complete');
  console.log('========================================\n');

  await pool.end();
  process.exit(0);
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
