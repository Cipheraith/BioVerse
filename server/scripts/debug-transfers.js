require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'bioverse_zambia_db'
});

async function debug() {
  try {
    // 1. Check transfer_alerts schema
    const cols = await pool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='transfer_alerts' ORDER BY ordinal_position"
    );
    console.log('=== transfer_alerts columns ===');
    cols.rows.forEach(c => console.log(' ', c.column_name, '-', c.data_type));

    // 2. Check inventory_catalog schema
    const icCols = await pool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='inventory_catalog' ORDER BY ordinal_position"
    );
    console.log('\n=== inventory_catalog columns ===');
    icCols.rows.forEach(c => console.log(' ', c.column_name, '-', c.data_type));

    // 3. Check facilities schema
    const fCols = await pool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='facilities' ORDER BY ordinal_position"
    );
    console.log('\n=== facilities columns ===');
    fCols.rows.forEach(c => console.log(' ', c.column_name, '-', c.data_type));

    // 4. Check distinct statuses in transfer_alerts
    const statuses = await pool.query('SELECT DISTINCT status FROM transfer_alerts');
    console.log('\n=== transfer_alerts statuses ===');
    statuses.rows.forEach(r => console.log(' ', r.status));

    // 5. Sample row from transfer_alerts
    const sample = await pool.query('SELECT * FROM transfer_alerts LIMIT 2');
    console.log('\n=== sample transfer_alerts rows ===');
    console.log(JSON.stringify(sample.rows, null, 2));

    // 6. Sample row from inventory_catalog
    const icSample = await pool.query('SELECT * FROM inventory_catalog LIMIT 2');
    console.log('\n=== sample inventory_catalog rows ===');
    console.log(JSON.stringify(icSample.rows, null, 2));

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

debug();
