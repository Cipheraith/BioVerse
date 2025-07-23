require('dotenv').config({ path: '../.env' });
const bcrypt = require('bcryptjs');
const { initializeDatabase, runQuery, getQuery } = require('../src/config/database');

async function addAdmin() {
  try {
    await initializeDatabase();
    
    // Admin credentials
    const username = 'admin@bioverse.com';
    const password = 'Admin@BioVerse2025';
    const name = 'BioVerse System Admin';
    const role = 'admin';
    
    // Check if admin already exists
    const existingAdmin = await getQuery('SELECT * FROM users WHERE username = $1', [username]);
    
    if (existingAdmin) {
      console.log(`Admin user '${username}' already exists.`);
      process.exit(0);
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert the new admin
    const result = await runQuery(
      'INSERT INTO users (username, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [username, hashedPassword, name, role]
    );
    
    console.log(`Admin user '${username}' created successfully with ID: ${result.id}`);
    console.log('Admin credentials:');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

addAdmin();