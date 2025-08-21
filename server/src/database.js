const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'bioverse_admin',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'bioverse_zambia_db',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

module.exports = pool;
