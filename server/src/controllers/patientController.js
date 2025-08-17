const { runQuery, getQuery, allQuery } = require('../config/database');
const { getAIDiagnosis } = require('../services/aiService');
const { generateHealthTwin } = require('../services/healthTwinService');
const { app: logger } = require('../services/logger');

// Helper function to parse JSON fields
const parsePatient = (patient) => {
  if (!patient) return null;
  return {
    ...patient,
    isPregnant: Boolean(patient.isPregnant),
  };
};

const getAllPatients = async (req, res) => {
  try {
    const patients = await allQuery('SELECT * FROM patients');
    res.json(patients.map(parsePatient));
  } catch (error) {
    logger.error('Error fetching patients:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const createPatient = async (req, res) => {
  const { name, dateOfBirth, gender, contact, address, medicalHistory, bloodType, allergies, chronicConditions, medications, lastCheckupDate, riskFactors, isPregnant } = req.body;

  if (!name || !dateOfBirth || !gender || !contact || !address) {
    return res.status(400).json({ message: 'Missing required patient fields.' });
  }

  if (isNaN(new Date(dateOfBirth).getTime())) {
    return res.status(400).json({ message: 'Invalid dateOfBirth format.' });
  }

  const newPatient = {
    name,
    dateOfBirth,
    age: new Date().getFullYear() - new Date(dateOfBirth).getFullYear(),
    gender,
    contact,
    address,
    medicalHistory: JSON.stringify(medicalHistory || []),
    bloodType: bloodType || '',
    allergies: JSON.stringify(allergies || []),
    chronicConditions: JSON.stringify(chronicConditions || []),
    medications: JSON.stringify(medications || []),
    lastCheckupDate: lastCheckupDate || '',
    riskFactors: JSON.stringify(riskFactors || []),
    isPregnant: isPregnant || false,
  };

  try {
    const result = await runQuery(
      `INSERT INTO patients (name, dateOfBirth, age, gender, contact, address, medicalHistory, bloodType, allergies, chronicConditions, medications, lastCheckupDate, riskFactors, isPregnant) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
      Object.values(newPatient)
    );
    res.status(201).json({ ...newPatient, id: result.id });
  } catch (error) {
    logger.error('Error creating patient:', error);
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ message: 'A patient with this contact or national ID already exists.' });
    }
    res.status(500).json({ message: 'Failed to create patient due to an internal error.' });
  }
};

const getPatientById = async (req, res) => {
  try {
  const patient = await getQuery('SELECT * FROM patients WHERE id = $1', [req.params.id]);
    if (patient) {
      if (req.user.role === 'patient' && req.user.id !== patient.id.toString()) {
        return res.status(403).json({ message: 'Access Denied: Patients can only view their own data.' });
      }
      res.json(parsePatient(patient));
    } else {
      res.status(404).send('Patient not found');
    }
  } catch (error) {
    logger.error('Error fetching patient:', error);
    res.status(500).json({ message: 'Failed to retrieve patient data due to an internal error.' });
  }
};

const getPatientHealthTwin = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role === 'patient' && req.user.id !== id) {
      return res.status(403).json({ message: 'Access Denied: Patients can only view their own health twin.' });
    }
    const healthTwin = await generateHealthTwin(id);
    if (healthTwin) {
      res.json(healthTwin);
    } else {
      res.status(404).send('Health twin not found for this patient.');
    }
  } catch (error) {
    logger.error('Error fetching health twin:', error);
    res.status(500).json({ message: 'Failed to retrieve health twin due to an internal error.' });
  }
};

const updatePatient = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Ensure that only whitelisted fields can be updated
  const allowedUpdates = [
    'name', 'dateOfBirth', 'gender', 'contact', 'address', 'medicalHistory', 
    'bloodType', 'allergies', 'chronicConditions', 'medications', 
    'lastCheckupDate', 'riskFactors', 'isPregnant'
  ];
  
  const filteredUpdates = Object.keys(updates)
    .filter(key => allowedUpdates.includes(key))
    .reduce((obj, key) => {
      obj[key] = updates[key];
      return obj;
    }, {});

  // Convert array fields to JSON strings before updating
  const jsonFields = ['medicalHistory', 'allergies', 'chronicConditions', 'medications', 'riskFactors'];
  for (const key of jsonFields) {
    if (filteredUpdates[key] !== undefined) {
      // JSONB fields are handled directly by pg, no need to stringify
    }
  }
  if (filteredUpdates.isPregnant !== undefined) {
    filteredUpdates.isPregnant = Boolean(filteredUpdates.isPregnant);
  }

  const setClause = Object.keys(filteredUpdates).map((key, i) => `${key} = $${i + 1}`).join(', ');
  const values = [...Object.values(filteredUpdates), id];

  // The id parameter position is after the update values
  const idPosition = values.length;

  try {
    const result = await runQuery(
      `UPDATE patients SET ${setClause} WHERE id = $${idPosition}`,
      values
    );
    if (result.rowCount > 0) {
      const updatedPatient = await getQuery('SELECT * FROM patients WHERE id = $1', [id]);
      res.json(parsePatient(updatedPatient));
    } else {
      res.status(404).send('Patient not found');
    }
  } catch (error) {
    logger.error('Error updating patient:', error);
    res.status(500).json({ message: 'Failed to update patient due to an internal error.' });
  }
};

const createSymptomCheck = async (req, res) => {
  const { id } = req.params;
  const { symptoms } = req.body;

  if (!symptoms) {
    return res.status(400).json({ message: 'Missing symptoms data.' });
  }

  try {
    // Save the symptom check to the database
    await runQuery(
      'INSERT INTO symptomChecks (patientId, symptoms, timestamp) VALUES ($1, $2, $3)',
      [id, JSON.stringify(symptoms), Date.now()]
    );

    // Get AI-powered diagnosis
    const diagnosis = await getAIDiagnosis(symptoms);

    res.status(201).json({ diagnosis });
  } catch (error) {
    logger.error('Error in createSymptomCheck:', error);
    res.status(500).json({ message: 'Failed to process symptom check due to an internal error.' });
  }
};

const getMe = async (req, res) => {
  try {
  const patient = await getQuery('SELECT * FROM patients WHERE id = $1', [req.user.id]);
    if (patient) {
      res.json(parsePatient(patient));
    } else {
      res.status(404).send('Patient not found');
    }
  } catch (error) {
    logger.error('Error fetching patient:', error);
    res.status(500).json({ message: 'Failed to retrieve patient data due to an internal error.' });
  }
};

module.exports = { getAllPatients, createPatient, getPatientById, updatePatient, createSymptomCheck, getMe, getPatientHealthTwin };