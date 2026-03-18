#!/usr/bin/env node
/**
 * Run database migrations
 * Usage: node scripts/run-migrations.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'bioverse_zambia_db',
  user: process.env.DB_USER || 'bioverse_admin',
  password: process.env.DB_PASSWORD
});

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '../migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} migration files`);

  for (const file of files) {
    console.log(`\nRunning migration: ${file}`);
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    try {
      await pool.query(sql);
      console.log(`✓ ${file} completed successfully`);
    } catch (error) {
      console.error(`✗ ${file} failed:`, error.message);
      if (error.message.includes('already exists')) {
        console.log('  (Skipping - already exists)');
      } else {
        throw error;
      }
    }
  }

  console.log('\n✓ All migrations completed');
}

runMigrations()
  .then(() => {
    pool.end();
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration failed:', error);
    pool.end();
    process.exit(1);
  });
