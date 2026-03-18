require('dotenv').config();
const { Pool } = require('pg');
const p = new Pool({ user: process.env.DB_USER || 'postgres', password: process.env.DB_PASSWORD, host: process.env.DB_HOST || 'localhost', port: parseInt(process.env.DB_PORT || '5432'), database: process.env.DB_NAME || 'bioverse_zambia_db' });
(async () => {
  const r = await p.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='locations' ORDER BY ordinal_position");
  console.log('locations columns:');
  r.rows.forEach(c => console.log(' ', c.column_name, c.data_type));
  const c2 = await p.query('SELECT COUNT(*) FROM locations');
  console.log('locations count:', c2.rows[0].count);
  const s = await p.query('SELECT * FROM locations LIMIT 2');
  console.log(JSON.stringify(s.rows, null, 2));
  await p.end();
})();
