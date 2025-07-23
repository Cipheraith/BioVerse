const bcrypt = require('bcryptjs');
const { initializeDatabase, runQuery, getQuery } = require('../src/config/database');

const seedDatabase = async () => {
  try {
    // Ensure the database is initialized and schema is applied
    await initializeDatabase();

    // Check if users table is empty, if not, skip seeding to prevent duplicates
    const userCountResult = await getQuery("SELECT COUNT(*) as count FROM users");
    const userCount = parseInt(userCountResult.count, 10);

    if (userCount === 0) {
      // Insert sample admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await runQuery(
        `INSERT INTO users (username, password, role, name, dob, nationalId, phoneNumber) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        ['admin@example.com', hashedPassword, 'admin', 'Admin User', '1980-01-01', '1234567890123', '0977123456']
      );
      console.log('Admin user seeded.');
    }

    // Check if patients table is empty
    const patientCountResult = await getQuery("SELECT COUNT(*) as count FROM patients");
    const patientCount = parseInt(patientCountResult.count, 10);

    if (patientCount === 0) {
      // Insert sample patients
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
          false
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
          false
        ]
      );
      console.log('Patients seeded.');
    }

    // Insert sample appointment (using patientId 1, assuming Alice Smith is ID 1)
    const appointmentCountResult = await getQuery("SELECT COUNT(*) as count FROM appointments");
    const appointmentCount = parseInt(appointmentCountResult.count, 10);
    if (appointmentCount === 0) {
      await runQuery(
        `INSERT INTO appointments (patientId, patientName, date, time, appointmentDate, type, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [1, 'Alice Smith', '2024-07-20', '10:00', Date.parse('2024-07-20T10:00:00'), 'General Checkup', 'First appointment']
      );
      console.log('Appointment seeded.');
    }

    // Insert sample symptom check (using patientId 1)
    const symptomCheckCountResult = await getQuery("SELECT COUNT(*) as count FROM symptomChecks");
    const symptomCheckCount = parseInt(symptomCheckCountResult.count, 10);
    if (symptomCheckCount === 0) {
      await runQuery(
        `INSERT INTO symptomChecks (patientId, symptoms, timestamp) VALUES ($1, $2, $3) RETURNING id`,
        [1, JSON.stringify({'fever': true, 'cough': true}), Date.now()]
      );
      console.log('Symptom check seeded.');
    }

    // Insert sample message (using patientId 1)
    const messageCountResult = await getQuery("SELECT COUNT(*) as count FROM messages");
    const messageCount = parseInt(messageCountResult.count, 10);
    if (messageCount === 0) {
      await runQuery(
        `INSERT INTO messages (sender, receiver, content, timestamp) VALUES ($1, $2, $3, $4) RETURNING id`,
        ['Health Worker', '1', 'Hello Alice, how are you feeling today?', Date.now()]
      );
      console.log('Message seeded.');
    }

    // Insert sample location
    const locationCountResult = await getQuery("SELECT COUNT(*) as count FROM locations");
    const locationCount = parseInt(locationCountResult.count, 10);
    if (locationCount === 0) {
      await runQuery(
        `INSERT INTO locations (name, type, position, bedsAvailable) VALUES ($1, $2, $3, $4) RETURNING id`,
        ['Main Clinic', 'clinic', JSON.stringify([-15.4167, 28.2833]), 10]
      );
      console.log('Location seeded.');
    }

    console.log('Database seeding complete.');
  } catch (error) {
    console.error('Database seeding failed:', error);
  }
};

seedDatabase();