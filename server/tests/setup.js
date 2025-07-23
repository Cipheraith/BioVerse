const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const testDbConfig = {
  user: process.env.PGUSER || 'bioverse_test_user',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE_TEST || 'bioverse_test_db',
  password: process.env.PGPASSWORD || 'bioverse_test_password',
  port: process.env.PGPORT || 5432,
};

const pool = new Pool(testDbConfig);

const setupTestDatabase = async () => {
  try {
    console.log('Connecting to test database...');
    await pool.connect();
    console.log('Connected to test database.');

    // Read schema.sql and srhSchema.sql
    const schemaPath = path.join(__dirname, '../src/config/schema.sql');
    const srhSchemaPath = path.join(__dirname, '../src/config/srhSchema.sql');
    const telemedicineSchemaPath = path.join(__dirname, '../src/config/telemedicineSchema.sql');

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const srhSchemaSql = fs.readFileSync(srhSchemaPath, 'utf8');
    const telemedicineSchemaSql = fs.readFileSync(telemedicineSchemaPath, 'utf8');

    // Execute schema to create tables
    await pool.query(schemaSql);
    await pool.query(srhSchemaSql);
    await pool.query(telemedicineSchemaSql);
    console.log('Test database schema applied.');

  } catch (error) {
    console.error('Error setting up test database:', error);
    process.exit(1); // Exit if database setup fails
  }
};

const clearTestDatabase = async () => {
  try {
    console.log('Clearing test database...');
    // Get all table names
    const res = await pool.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public' AND tablename NOT LIKE 'pg_%' AND tablename NOT LIKE 'sql_%';
    `);
    
    // Truncate all tables
    for (let row of res.rows) {
      await pool.query(`TRUNCATE TABLE "${row.tablename}" RESTART IDENTITY CASCADE;`);
    }
    console.log('Test database cleared.');
  } catch (error) {
    console.error('Error clearing test database:', error);
  }
};

const closeTestDatabase = async () => {
  console.log('Closing test database connection...');
  await pool.end();
  console.log('Test database connection closed.');
};

module.exports = {
  pool,
  setupTestDatabase,
  clearTestDatabase,
  closeTestDatabase,
};