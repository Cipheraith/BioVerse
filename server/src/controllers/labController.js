const { runQuery } = require('../config/database');

const createLabResult = async (req, res) => {
  try {
    const patientId = req.params.id;
    const { testName, value, unit } = req.body;
    if (!testName || value === undefined || !unit) {
      return res.status(400).send('Missing testName, value, or unit');
    }
    const newLabResult = { patientId, testName, value, unit, timestamp: Date.now() };
    const result = await runQuery(
      `INSERT INTO labResults (patientId, testName, value, unit, timestamp) VALUES ($1, $2, $3, $4, $5)`,
      Object.values(newLabResult)
    );
    res.status(201).json({ ...newLabResult, id: result.id });
  } catch (error) {
    console.error('Error adding lab result:', error);
    res.status(400).json({ message: 'Invalid Patient ID format.' });
  }
};

module.exports = { createLabResult };