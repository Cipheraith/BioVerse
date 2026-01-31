const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { database: logger } = require('../services/logger');

let pool;

async function initializeDatabase() {
  try {
    const dbUser = process.env.DB_USER || 'bioverse_admin';
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbName = process.env.DB_NAME || 'bioverse_zambia_db';
    const dbPassword = process.env.DB_PASSWORD;

    if (!dbPassword) {
      logger.warn('WARNING: DB_PASSWORD is not set. Using empty password is insecure for production.');
    }

    pool = new Pool({
      user: dbUser,
      host: dbHost,
      database: dbName,
      password: dbPassword || '',
      port: process.env.DB_PORT || 5432,
      // Performance optimizations
      max: 20, // Maximum number of clients in the pool
      min: 5,  // Minimum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
      query_timeout: 10000, // Return an error if query takes longer than 10 seconds
      statement_timeout: 10000, // Return an error if statement takes longer than 10 seconds
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    await pool.connect();
    logger.info('Connected to PostgreSQL database');

    const schema = fs.readFileSync(path.resolve(__dirname, './schema.sql'), 'utf8');
    // Split schema into individual statements and execute them
    const statements = schema.split(';').filter(s => s.trim() !== '');
    for (const statement of statements) {
      await pool.query(statement);
    }
    logger.info('Tables created or already exist.');
    await seedData();
  } catch (err) {
    logger.error('Failed to connect or initialize PostgreSQL database', { error: err });
    throw err;
  }
}

async function getDB() {
  if (!pool) {
    // Auto-initialize for tests or development
    if (process.env.NODE_ENV === 'test' || !process.env.NODE_ENV) {
      await initializeDatabase();
    } else {
      throw new Error('Database not initialized. Call initializeDatabase first.');
    }
  }
  return pool;
}

async function runQuery(query, params = []) {
  if (!pool) await getDB();
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    // For INSERT, UPDATE, DELETE, pg returns rowCount and potentially rows (if RETURNING is used)
    // For INSERT, we often need the last inserted ID. PostgreSQL's way is RETURNING id.
    // This function assumes the query will return an 'id' if it's an insert.
    if (query.trim().toUpperCase().startsWith('INSERT') && result.rows.length > 0) {
      return { id: result.rows[0].id };
    } else {
      return { changes: result.rowCount };
    }
  } finally {
    client.release();
  }
}

async function getQuery(query, params = []) {
  if (!pool) await getDB();
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result.rows[0];
  } finally {
    client.release();
  }
}

async function allQuery(query, params = []) {
  if (!pool) await getDB();
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

async function seedData() {
  const patientCountResult = await getQuery("SELECT COUNT(*) as count FROM patients");
  const patientCount = parseInt(patientCountResult.count, 10);

  if (patientCount === 0) {
    await runQuery(
      `INSERT INTO patients (name, dateOfBirth, age, gender, contact, address, medicalHistory, bloodType, allergies, chronicConditions, medications, lastCheckupDate, riskFactors, isPregnant) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
      [
        'Alice Smith',
        '1995-03-15',
        30,
        'Female',
        '123-456-7890',
        '123 Main St, Lusaka',
        JSON.stringify(['Hypertension']),
        'A+',
        JSON.stringify(['Penicillin']),
        JSON.stringify(['Hypertension']),
        JSON.stringify(['Lisinopril']),
        '2024-01-20',
        JSON.stringify(['Family history of heart disease']),
        0
      ]
    );
    await runQuery(
      `INSERT INTO patients (name, dateOfBirth, age, gender, contact, address, medicalHistory, bloodType, allergies, chronicConditions, medications, lastCheckupDate, riskFactors, isPregnant) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
      [
        'Bob Johnson',
        '1980-07-22',
        45,
        'Male',
        '098-765-4321',
        '456 Oak Ave, Ndola',
        JSON.stringify(['Diabetes', 'Asthma']),
        'O-',
        JSON.stringify(['None']),
        JSON.stringify(['Type 2 Diabetes', 'Asthma']),
        JSON.stringify(['Metformin', 'Albuterol']),
        '2024-03-10',
        JSON.stringify(['Obesity', 'Smoking']),
        0
      ]
    );
    await runQuery(
      `INSERT INTO patients (name, dateOfBirth, age, gender, contact, address, medicalHistory, bloodType, allergies, chronicConditions, medications, lastCheckupDate, riskFactors, isPregnant) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
      [
        'Mary Mwaba',
        '1992-11-05',
        32,
        'Female',
        '097-123-4567',
        '789 Church Road, Kitwe',
        JSON.stringify(['Previous heart condition']),
        'B+',
        JSON.stringify(['Iodine']),
        JSON.stringify(['Mild hypertension']),
        JSON.stringify(['Amlodipine']),
        '2024-05-15',
        JSON.stringify(['Family history of cardiac issues']),
        0
      ]
    );
    logger.info('Patients seeded.');
  }

  const messageCountResult = await getQuery("SELECT COUNT(*) as count FROM messages");
  const messageCount = parseInt(messageCountResult.count, 10);
  if (messageCount === 0) {
    await runQuery(
      `INSERT INTO messages (sender, receiver, content, timestamp) VALUES ($1, $2, $3, $4) RETURNING id`,
      [
        'Health Worker',
        '1',
        'Hello Alice, how are you feeling today?',
        Date.now(),
      ]
    );
    await runQuery(
      `INSERT INTO messages (sender, receiver, content, timestamp) VALUES ($1, $2, $3, $4) RETURNING id`,
      [
        '1',
        'Health Worker',
        'I am feeling a bit tired.',
        Date.now(),
      ]
    );
    logger.info('Messages seeded.');
  }

  const locationCountResult = await getQuery("SELECT COUNT(*) as count FROM locations");
  const locationCount = parseInt(locationCountResult.count, 10);
  if (locationCount === 0) {
    await runQuery(
      `INSERT INTO locations (name, type, position, bedsAvailable) VALUES ($1, $2, $3, $4) RETURNING id`,
      [
        'Main Clinic',
        'clinic',
        JSON.stringify([-15.4167, 28.2833]),
        10,
      ]
    );
    await runQuery(
      `INSERT INTO locations (name, type, position, medicationStock) VALUES ($1, $2, $3, $4) RETURNING id`,
      [
        'Central Pharmacy',
        'pharmacy',
        JSON.stringify([-15.4200, 28.2900]),
        JSON.stringify({ Paracetamol: 100, Amoxicillin: 50 }),
      ]
    );
    await runQuery(
      `INSERT INTO locations (name, type, position) VALUES ($1, $2, $3) RETURNING id`,
      [
        'Ambulance Base 1',
        'ambulance',
        JSON.stringify([-15.4100, 28.2700]),
      ]
    );
    logger.info('Locations seeded.');
  }

  const userCountResult = await getQuery("SELECT COUNT(*) as count FROM users");
  const userCount = parseInt(userCountResult.count, 10);
  if (userCount === 0) {
    // Hash the password before inserting
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Admin user
    await runQuery(
      `INSERT INTO users (username, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id`,
      [
        'admin',
        hashedPassword,
        'BioVerse Admin',
        'admin',
      ]
    );
    
    // Doctor users for telemedicine
    await runQuery(
      `INSERT INTO users (username, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id`,
      [
        'dr.smith',
        hashedPassword,
        'Dr. Sarah Smith',
        'doctor',
      ]
    );
    
    await runQuery(
      `INSERT INTO users (username, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id`,
      [
        'dr.jones',
        hashedPassword,
        'Dr. Michael Jones',
        'doctor',
      ]
    );
    
    await runQuery(
      `INSERT INTO users (username, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id`,
      [
        'dr.brown',
        hashedPassword,
        'Dr. Emily Brown',
        'doctor',
      ]
    );
    
    logger.info('Users seeded.');
  }

  // Seed telemedicine data if tables are empty
  const consultationCountResult = await getQuery("SELECT COUNT(*) as count FROM virtual_consultations");
  const consultationCount = parseInt(consultationCountResult.count, 10);
  
  if (consultationCount === 0) {
    // Add some sample consultations
    await runQuery(
      `INSERT INTO virtual_consultations (patientid, doctorid, scheduleddatetime, consultationtype, status, symptoms, preferredlanguage, sessionfeatures) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [
        1, // patientId
        2, // doctorId (assuming user with ID 2 exists)
        new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        'general',
        'scheduled',
        JSON.stringify(['headache', 'fever']),
        'en',
        JSON.stringify({})
      ]
    );
    await runQuery(
      `INSERT INTO virtual_consultations (patientid, doctorid, scheduleddatetime, consultationtype, status, symptoms, preferredlanguage, sessionfeatures) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [
        3, // patientId (assuming patient with ID 3 exists, we'll insert Bob's data)
        2, // doctorId
        new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
        'cardiology',
        'scheduled',
        JSON.stringify(['chest pain', 'shortness of breath']),
        'en',
        JSON.stringify({})
      ]
    );
    await runQuery(
      `INSERT INTO virtual_consultations (patientid, doctorid, scheduleddatetime, consultationtype, status, symptoms, preferredlanguage, sessionfeatures) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [
        1, // patientId
        4, // doctorId (assuming user with ID 4 exists)
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        'dermatology',
        'scheduled',
        JSON.stringify(['rash', 'itching']),
        'en',
        JSON.stringify({})
      ]
    );
    logger.info('Virtual consultations seeded.');
  }

  // Temporarily remove monitoring session seeding to debug column names
  logger.info('Telemedicine seeding completed - monitoring sessions seeding disabled for debugging');
}

module.exports = { initializeDatabase, getDB, runQuery, getQuery, allQuery };
