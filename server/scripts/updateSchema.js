const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../bioverse.db');
const schemaPath = path.resolve(__dirname, '../src/config/schema.sql');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the bioverse database.');
});

const schema = fs.readFileSync(schemaPath, 'utf8');

db.serialize(() => {
  db.exec('BEGIN TRANSACTION;');
  db.exec('DROP TABLE IF EXISTS patients;');
  db.exec(schema, (err) => {
    if (err) {
      console.error('Error executing schema:', err.message);
      db.exec('ROLLBACK;');
    } else {
      db.exec('COMMIT;');
      console.log('Database schema updated successfully.');
    }
  });
});

db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Close the database connection.');
});
