#!/usr/bin/env node
/**
 * BioVerse Database Update Script
 * Adds new tables for business features: billing, feedback, mobile, compliance
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function updateDatabase() {
  const pool = new Pool({
    user: process.env.DB_USER || 'bioverse_admin',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'bioverse_zambia_db',
    password: process.env.DB_PASSWORD || '2002Fred??',
    port: process.env.DB_PORT || 5432,
  });

  try {
    console.log('🔌 Connecting to database...');
    const client = await pool.connect();
    
    console.log('📄 Reading database update file...');
    const sqlFile = path.resolve(__dirname, '../database_updates.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('🚀 Executing database updates...');
    await client.query(sql);
    
    console.log('✅ Database updates completed successfully!');
    console.log('📊 New tables added:');
    console.log('  - subscriptions (billing system)');
    console.log('  - user_feedback (feedback management)');
    console.log('  - mobile_devices (mobile app support)');
    console.log('  - push_notifications (notification system)');
    console.log('  - api_integrations (marketplace)');
    console.log('  - audit_logs (compliance)');
    console.log('  - data_requests (GDPR compliance)');
    console.log('  - security_incidents (security management)');
    console.log('  - user_consent (privacy management)');
    console.log('  - revenue_analytics (business intelligence)');
    console.log('  - satisfaction_surveys (user feedback)');
    
    // Verify some key tables exist
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('subscriptions', 'user_feedback', 'mobile_devices')
      ORDER BY table_name;
    `);
    
    console.log('🎯 Verified tables:', tableCheck.rows.map(r => r.table_name).join(', '));
    
    client.release();
    await pool.end();
    
    console.log('🎉 BioVerse is now ready for business features!');
    console.log('💡 Next steps:');
    console.log('  1. Test the API endpoints');
    console.log('  2. Create a frontend dashboard');
    console.log('  3. Set up payment processing');
    console.log('  4. Deploy to production');
    
  } catch (error) {
    console.error('❌ Database update failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the update
updateDatabase();
