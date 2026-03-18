const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'bioverse_zambia_db'
});

async function migrate() {
  console.log('Running persona tables migration...\n');

  // 1. Patient intake logs
  await pool.query(`
    CREATE TABLE IF NOT EXISTS patient_intake_logs (
      id SERIAL PRIMARY KEY,
      facility_id INTEGER REFERENCES facilities(id),
      patient_name VARCHAR(255) NOT NULL,
      age INTEGER,
      gender VARCHAR(20),
      symptoms TEXT NOT NULL,
      triage_level VARCHAR(20) DEFAULT 'STANDARD',
      notes TEXT,
      recorded_by INTEGER REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('  [OK] patient_intake_logs table');

  // 2. Care referrals
  await pool.query(`
    CREATE TABLE IF NOT EXISTS care_referrals (
      id SERIAL PRIMARY KEY,
      from_facility_id INTEGER REFERENCES facilities(id),
      to_facility_id INTEGER REFERENCES facilities(id),
      patient_name VARCHAR(255) NOT NULL,
      reason TEXT NOT NULL,
      urgency VARCHAR(20) DEFAULT 'ROUTINE',
      notes TEXT,
      status VARCHAR(20) DEFAULT 'PENDING',
      referred_by INTEGER REFERENCES users(id),
      accepted_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('  [OK] care_referrals table');

  // 3. Facility wards (separate from legacy wards table which references locations)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS facility_wards (
      id SERIAL PRIMARY KEY,
      facility_id INTEGER REFERENCES facilities(id),
      name VARCHAR(255) NOT NULL,
      ward_type VARCHAR(50),
      capacity INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('  [OK] facility_wards table');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS facility_ward_beds (
      id SERIAL PRIMARY KEY,
      ward_id INTEGER REFERENCES facility_wards(id),
      room_number VARCHAR(20),
      beds_total INTEGER DEFAULT 0,
      beds_occupied INTEGER DEFAULT 0,
      status VARCHAR(20) DEFAULT 'available',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('  [OK] facility_ward_beds table');

  // Seed wards for first 10 facilities
  const facilityRows = await pool.query('SELECT id, name FROM facilities ORDER BY id LIMIT 10');
  const wardTypes = ['General', 'Maternity', 'Pediatric', 'Emergency', 'Surgical'];

  for (const fac of facilityRows.rows) {
    const existing = await pool.query('SELECT COUNT(*) FROM facility_wards WHERE facility_id = $1', [fac.id]);
    if (parseInt(existing.rows[0].count) > 0) continue;

    const numWards = 2 + Math.floor(Math.random() * 3);
    const shuffled = [...wardTypes].sort(() => 0.5 - Math.random()).slice(0, numWards);

    for (const wardType of shuffled) {
      const capacity = 10 + Math.floor(Math.random() * 40);
      const wardResult = await pool.query(
        `INSERT INTO facility_wards (facility_id, name, ward_type, capacity) VALUES ($1, $2, $3, $4) RETURNING id`,
        [fac.id, `${wardType} Ward`, wardType.toLowerCase(), capacity]
      );

      const numRooms = 2 + Math.floor(Math.random() * 2);
      for (let r = 1; r <= numRooms; r++) {
        const beds = 2 + Math.floor(Math.random() * 6);
        const occupied = Math.floor(Math.random() * (beds + 1));
        await pool.query(
          `INSERT INTO facility_ward_beds (ward_id, room_number, beds_total, beds_occupied, status) VALUES ($1, $2, $3, $4, $5)`,
          [wardResult.rows[0].id, `${wardType.charAt(0)}${r.toString().padStart(2, '0')}`, beds, occupied, occupied >= beds ? 'full' : 'available']
        );
      }
    }
    console.log(`  [OK] Seeded wards/rooms for: ${fac.name}`);
  }

  // 4. Seed some patient intake logs
  const intakeCount = await pool.query('SELECT COUNT(*) FROM patient_intake_logs');
  if (parseInt(intakeCount.rows[0].count) === 0) {
    const names = [
      'Chipo Banda', 'Mwila Tembo', 'Grace Mulenga', 'Joseph Phiri', 'Mary Sakala',
      'Peter Zulu', 'Agnes Mumba', 'David Lungu', 'Ruth Mwanza', 'Samuel Chanda',
      'Florence Bwalya', 'James Musonda', 'Elizabeth Ng\'andu', 'Michael Kapembwa', 'Sarah Mwape'
    ];
    const symptomsList = [
      'Fever, headache, body aches', 'Cough, difficulty breathing', 'Diarrhea, dehydration',
      'Malaria symptoms - high fever, chills', 'Pregnancy complications - bleeding',
      'Chest pain, dizziness', 'Wound infection, swelling', 'Abdominal pain, vomiting',
      'Skin rash, itching', 'Eye infection, blurred vision', 'Joint pain, limited mobility',
      'Chronic cough, weight loss', 'Severe headache, neck stiffness', 'Burns, pain management',
      'Fracture, immobilization needed'
    ];
    const triageLevels = ['EMERGENCY', 'URGENT', 'STANDARD', 'STANDARD', 'STANDARD', 'NON_URGENT'];
    const genders = ['male', 'female'];

    const facs = await pool.query('SELECT id FROM facilities ORDER BY id LIMIT 10');
    for (let i = 0; i < 15; i++) {
      const fId = facs.rows[i % facs.rows.length].id;
      await pool.query(`
        INSERT INTO patient_intake_logs (facility_id, patient_name, age, gender, symptoms, triage_level, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL '${Math.floor(Math.random() * 48)} hours')
      `, [
        fId,
        names[i],
        18 + Math.floor(Math.random() * 55),
        genders[Math.floor(Math.random() * 2)],
        symptomsList[i],
        triageLevels[Math.floor(Math.random() * triageLevels.length)]
      ]);
    }
    console.log('  [OK] Seeded 15 patient intake logs');
  }

  // 5. Seed some care referrals
  const refCount = await pool.query('SELECT COUNT(*) FROM care_referrals');
  if (parseInt(refCount.rows[0].count) === 0) {
    const reasons = [
      'Specialist consultation - cardiology', 'Surgical intervention required',
      'Maternity high-risk delivery', 'Pediatric intensive care',
      'TB treatment follow-up', 'Diagnostic imaging needed',
      'Mental health assessment', 'Orthopedic surgery consult',
      'Oncology referral', 'Dialysis treatment'
    ];
    const urgencies = ['EMERGENCY', 'URGENT', 'ROUTINE', 'ROUTINE', 'ROUTINE'];
    const statuses = ['PENDING', 'PENDING', 'ACCEPTED', 'COMPLETED', 'PENDING'];
    const names = [
      'John Mwamba', 'Grace Chileshe', 'Peter Nkole', 'Agnes Bwalya', 'David Kabwe',
      'Mary Mulenga', 'Samuel Tembo', 'Florence Phiri', 'James Banda', 'Ruth Zulu'
    ];

    const facs = await pool.query('SELECT id FROM facilities ORDER BY id LIMIT 10');
    for (let i = 0; i < 10; i++) {
      const fromFac = facs.rows[i % facs.rows.length].id;
      const toFac = facs.rows[(i + 3) % facs.rows.length].id;
      await pool.query(`
        INSERT INTO care_referrals (from_facility_id, to_facility_id, patient_name, reason, urgency, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL '${Math.floor(Math.random() * 72)} hours')
      `, [fromFac, toFac, names[i], reasons[i], urgencies[i % urgencies.length], statuses[i % statuses.length]]);
    }
    console.log('  [OK] Seeded 10 care referrals');
  }

  // 6. Add more transfer alerts to cover more items/facilities
  const alertCount = await pool.query('SELECT COUNT(*) FROM transfer_alerts');
  if (parseInt(alertCount.rows[0].count) < 30) {
    const items = await pool.query('SELECT id FROM inventory_catalog ORDER BY id LIMIT 20');
    const facs = await pool.query('SELECT id FROM facilities ORDER BY id LIMIT 15');
    const timeframes = ['24 Hours', '48 Hours', '72 Hours', '96 Hours'];
    let alertNum = parseInt(alertCount.rows[0].count);
    
    for (let i = 0; i < 10; i++) {
      alertNum++;
      const fromFac = facs.rows[(i + 5) % facs.rows.length].id;
      const toFac = facs.rows[(i + 8) % facs.rows.length].id;
      const itemId = items.rows[i % items.rows.length].id;
      await pool.query(`
        INSERT INTO transfer_alerts (alert_id, item_id, from_facility_id, to_facility_id, surplus_amount, distance_km, shortage_timeframe, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'OPEN', NOW() - INTERVAL '${Math.floor(Math.random() * 24)} hours')
        ON CONFLICT (alert_id) DO NOTHING
      `, [
        `TRN-${alertNum}`,
        itemId,
        fromFac,
        toFac,
        200 + Math.floor(Math.random() * 800),
        (5 + Math.random() * 150).toFixed(2),
        timeframes[Math.floor(Math.random() * timeframes.length)]
      ]);
    }
    console.log(`  [OK] Seeded additional transfer alerts (total: ~${alertNum})`);
  }

  console.log('\nMigration complete!');
  await pool.end();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  pool.end();
  process.exit(1);
});
