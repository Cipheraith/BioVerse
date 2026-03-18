#!/usr/bin/env node
/**
 * Test coordination engine
 * Usage: node scripts/test-coordination.js
 */

require('dotenv').config();
const { runCoordinationCycle } = require('../src/services/coordinationService');
const { pool } = require('../src/config/database');

async function testCoordination() {
  console.log('=== Testing Coordination Engine ===\n');

  // Check database connection
  console.log('1. Checking database connection...');
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Database connected:', result.rows[0].now);
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    process.exit(1);
  }

  // Check facilities
  console.log('\n2. Checking facilities...');
  const facilitiesResult = await pool.query('SELECT COUNT(*) FROM facilities');
  console.log(`✓ Found ${facilitiesResult.rows[0].count} facilities`);

  // Check inventory
  console.log('\n3. Checking inventory catalog...');
  const inventoryResult = await pool.query('SELECT COUNT(*) FROM inventory_catalog');
  console.log(`✓ Found ${inventoryResult.rows[0].count} inventory items`);

  // Check stock levels
  console.log('\n4. Checking stock levels...');
  const stockResult = await pool.query(`
    SELECT status, COUNT(*) as count 
    FROM facility_stock_levels 
    GROUP BY status
  `);
  console.log('Stock status distribution:');
  stockResult.rows.forEach(row => {
    console.log(`  ${row.status}: ${row.count}`);
  });

  // Run coordination cycle
  console.log('\n5. Running coordination cycle...');
  await runCoordinationCycle();

  // Check generated alerts
  console.log('\n6. Checking generated alerts...');
  const alertsResult = await pool.query(`
    SELECT COUNT(*) as count, status 
    FROM transfer_alerts 
    GROUP BY status
  `);
  console.log('Transfer alerts:');
  alertsResult.rows.forEach(row => {
    console.log(`  ${row.status}: ${row.count}`);
  });

  // Show sample alert
  const sampleAlert = await pool.query(`
    SELECT 
      ta.alert_id,
      ic.item_name,
      ff.name as from_facility,
      tf.name as to_facility,
      ta.distance_km,
      ta.shortage_timeframe
    FROM transfer_alerts ta
    JOIN inventory_catalog ic ON ta.item_id = ic.id
    JOIN facilities ff ON ta.from_facility_id = ff.id
    JOIN facilities tf ON ta.to_facility_id = tf.id
    WHERE ta.status = 'OPEN'
    LIMIT 1
  `);

  if (sampleAlert.rows.length > 0) {
    const alert = sampleAlert.rows[0];
    console.log('\nSample alert:');
    console.log(`  Alert ID: ${alert.alert_id}`);
    console.log(`  Item: ${alert.item_name}`);
    console.log(`  From: ${alert.from_facility}`);
    console.log(`  To: ${alert.to_facility}`);
    console.log(`  Distance: ${alert.distance_km.toFixed(2)} km`);
    console.log(`  Timeframe: ${alert.shortage_timeframe}`);
  }

  console.log('\n✓ Coordination engine test completed successfully');
}

testCoordination()
  .then(() => {
    pool.end();
    process.exit(0);
  })
  .catch(error => {
    console.error('\n✗ Test failed:', error);
    pool.end();
    process.exit(1);
  });
