require('dotenv').config();
const { Client } = require('pg');
const axios = require('axios');

async function ensureDatabaseExists() {
  const adminClient = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  });

  await adminClient.connect();
  const dbName = process.env.DB_NAME;
  const exists = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);

  if (exists.rowCount === 0) {
    const quotedName = '"' + String(dbName).replace(/"/g, '""') + '"';
    await adminClient.query(`CREATE DATABASE ${quotedName}`);
    console.log('[POSTGRES] Database created:', dbName);
  } else {
    console.log('[POSTGRES] Database exists:', dbName);
  }

  await adminClient.end();

  const appClient = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: dbName,
  });

  await appClient.connect();
  const result = await appClient.query('SELECT current_database() AS db, current_user AS usr');
  console.log('[POSTGRES] Connection OK:', result.rows[0]);
  await appClient.end();
}

async function testDhis2() {
  const baseUrls = [
    process.env.DHIS2_API_URL,
    'https://play.dhis2.org/2.40.0',
    'https://play.im.dhis2.org/dev',
    'https://play.dhis2.org/demo',
    'https://play.im.dhis2.org/stable-2-40-0',
    'https://play.im.dhis2.org/stable-2-41-0',
  ].filter(Boolean);

  for (const base of baseUrls) {
    try {
      const response = await axios.get(`${base}/api/system/info`, {
        auth: {
          username: process.env.DHIS2_USERNAME,
          password: process.env.DHIS2_PASSWORD,
        },
        timeout: 15000,
      });
      console.log('[DHIS2] Connection OK:', { base, version: response.data.version, serverDate: response.data.serverDate });
      return;
    } catch (error) {
      const status = error.response ? error.response.status : error.message;
      console.log('[DHIS2] Failed:', base, status);
    }
  }

  throw new Error('No DHIS2 endpoint responded successfully.');
}

(async () => {
  try {
    await ensureDatabaseExists();
    await testDhis2();
    console.log('All connectivity checks passed.');
  } catch (error) {
    console.error('Connectivity check failed:', error.message);
    process.exit(1);
  }
})();
