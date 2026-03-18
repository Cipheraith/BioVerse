require('dotenv').config();
const bcrypt = require('bcryptjs');
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
    const hash = await bcrypt.hash('password123', 10);
    const users = [
      ['admin', hash, 'BioVerse Admin', 'admin'],
      ['moh.director', hash, 'Dr. Mwansa Kaluba', 'moh'],
      ['h.worker', hash, 'Nurse Grace Banda', 'health_worker'],
      ['facility.mgr', hash, 'Joseph Tembo', 'facility_manager'],
      ['logistics', hash, 'Chanda Mulenga', 'logistics_coordinator'],
      ['dhis2.admin', hash, 'Fred Zulu', 'dhis2_admin'],
    ];
    for (const [username, password, name, role] of users) {
      const exists = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
      if (exists.rows.length === 0) {
        await pool.query('INSERT INTO users (username, password, name, role) VALUES ($1, $2, $3, $4)', [username, password, name, role]);
        console.log('Created:', username, '/', role);
      } else {
        await pool.query('UPDATE users SET role = $1, name = $2 WHERE username = $3', [role, name, username]);
        console.log('Updated:', username, '/', role);
      }
    }
    const all = await pool.query('SELECT id, username, name, role FROM users ORDER BY id');
    console.log('\nAll users:');
    console.table(all.rows);
    await pool.end();
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
