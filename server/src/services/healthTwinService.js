const { getQuery, allQuery } = require('../config/database');
const { calculatePatientRisk } = require('./predictiveService');

// Helper function to parse JSON fields from patient data
const parsePatient = (patient) => {
  if (!patient) return null;
  // JSONB fields are already parsed by pg, so no need for JSON.parse
  return {
    ...patient,
    isPregnant: Boolean(patient.isPregnant),
  };
};

// Helper function to parse JSON fields from pregnancy data
const parsePregnancy = (pregnancy) => {
  if (!pregnancy) return null;
  return {
    ...pregnancy,
    // JSONB fields are already parsed by pg, so no need for JSON.parse
    transportBooked: Boolean(pregnancy.transportBooked)
  };
};

// Helper function to parse JSON fields from symptom checks
const parseSymptomCheck = (symptomCheck) => {
  if (!symptomCheck) return null;
  return {
    ...symptomCheck,
    // JSONB fields are already parsed by pg, so no need for JSON.parse
  };
};

const generateHealthTwin = async (patientId) => {
  try {
    // Fetch patient basic information
    const patient = await getQuery('SELECT * FROM patients WHERE id = $1', [patientId]);
    if (!patient) {
      return null; // Patient not found
    }
    const parsedPatient = parsePatient(patient);

    // Fetch pregnancy data if applicable
    const pregnancy = await getQuery('SELECT * FROM pregnancies WHERE patientId = $1', [patientId]);
    const parsedPregnancy = parsePregnancy(pregnancy);

    // Fetch symptom checks
    const symptomChecks = await allQuery('SELECT * FROM symptomChecks WHERE patientId = $1 ORDER BY timestamp DESC', [patientId]);
    const parsedSymptomChecks = symptomChecks.map(parseSymptomCheck);

    // Fetch lab results
    const labResults = await allQuery('SELECT * FROM labResults WHERE patientId = $1 ORDER BY timestamp DESC', [patientId]);

    // Fetch appointments
    const appointments = await allQuery('SELECT * FROM appointments WHERE patientId = $1 ORDER BY appointmentDate DESC', [patientId]);

    // Construct the health twin object
    const healthTwin = {
      patientInfo: parsedPatient,
      pregnancyData: parsedPregnancy,
      symptomHistory: parsedSymptomChecks,
      labResults: labResults,
      appointments: appointments,
      riskAssessment: calculatePatientRisk(parsedPatient, parsedPregnancy),
      // Add more aggregated data here as needed
    };

    return healthTwin;
  } catch (error) {
    console.error('Error generating health twin for patient', patientId, ':', error);
    throw new Error('Failed to generate health twin.');
  }
};

module.exports = { generateHealthTwin };
