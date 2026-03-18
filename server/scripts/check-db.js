require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'bioverse_zambia_db'
});

(async () => {
  try {
    const r = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename");
    console.log('=== ALL TABLES ===');
    r.rows.forEach(row => console.log(row.tablename));

    // Check if transfer_alerts exists
    const ta = r.rows.find(x => x.tablename === 'transfer_alerts');
    console.log('\ntransfer_alerts exists:', !!ta);

    // Check if inventory_catalog exists
    const ic = r.rows.find(x => x.tablename === 'inventory_catalog');
    console.log('inventory_catalog exists:', !!ic);

    // Check facilities count
    const fac = await pool.query('SELECT COUNT(*) as cnt FROM facilities');
    console.log('facilities count:', fac.rows[0].cnt);

    // Check DHIS2-related tables
    const dhis2 = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE '%dhis2%'");
    console.log('\nDHIS2 tables:', dhis2.rows.map(x => x.tablename));

    // Check data_values
    const dv = r.rows.find(x => x.tablename === 'data_values');
    if (dv) {
      const dvCount = await pool.query('SELECT COUNT(*) as cnt FROM data_values');
      console.log('data_values count:', dvCount.rows[0].cnt);
    }

    // Check org_units
    const ou = r.rows.find(x => x.tablename === 'org_units');
    if (ou) {
      const ouCount = await pool.query('SELECT COUNT(*) as cnt FROM org_units');
      console.log('org_units count:', ouCount.rows[0].cnt);
    }

    await pool.end();
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
