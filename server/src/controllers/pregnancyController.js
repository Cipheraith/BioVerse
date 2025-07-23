const { runQuery, getQuery, allQuery } = require('../config/database');

const getAllPregnancies = async (req, res) => {
  try {
    const pregnancies = await allQuery('SELECT * FROM pregnancies');
    res.json(pregnancies.map(p => ({
      ...p,
      // alerts and deliveryDetails are already parsed by pg
      transportBooked: Boolean(p.transportBooked)
    })));
  } catch (error) {
    console.error('Error fetching pregnancies:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const getPregnancyByPatientId = async (req, res) => {
  try {
    const pregnancy = await getQuery('SELECT * FROM pregnancies WHERE patientId = $1', [req.params.patientId]);
    if (pregnancy) {
      if (req.user.role === 'patient' && req.user.id !== pregnancy.patientId.toString()) {
        return res.status(403).json({ message: 'Access Denied: Patients can only view their own pregnancy data.' });
      }
      res.json({
        ...pregnancy,
        // alerts and deliveryDetails are already parsed by pg
        transportBooked: Boolean(pregnancy.transportBooked)
      });
    } else {
      res.status(404).send('No pregnancy record found for this patient.');
    }
  } catch (error) {
    console.error('Error fetching pregnancy record:', error);
    res.status(400).json({ message: 'Invalid Patient ID format.' });
  }
};

const createPregnancy = async (req, res) => {
  const { patientId, estimatedDueDate, healthStatus } = req.body;
  if (!patientId || !estimatedDueDate) {
    return res.status(400).send('Missing required fields: patientId and estimatedDueDate');
  }
  const newPregnancy = {
    patientId,
    estimatedDueDate,
    healthStatus: healthStatus || 'stable',
    alerts: [],
    transportBooked: false,
    deliveryDetails: null,
  };
  try {
    const result = await runQuery(
      `INSERT INTO pregnancies (patientId, estimatedDueDate, healthStatus, alerts, transportBooked, deliveryDetails) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      Object.values(newPregnancy)
    );
    res.status(201).json({ ...newPregnancy, id: result.id });
  } catch (error) {
    console.error('Error creating pregnancy:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const updatePregnancy = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // No need to JSON.stringify for JSONB fields, pg handles it
  // transportBooked is BOOLEAN

  const setClause = Object.keys(updates).map((key, index) => `${key} = ${index + 1}`).join(', ');
  const values = Object.values(updates);

  try {
    const result = await runQuery(
      `UPDATE pregnancies SET ${setClause} WHERE id = ${values.length + 1} RETURNING *`,
      [...values, id]
    );
    if (result.rows.length > 0) {
      res.json({
        ...result.rows[0],
        transportBooked: Boolean(result.rows[0].transportBooked)
      });
    } else {
      res.status(404).send('Pregnancy record not found');
    }
  } catch (error) {
    console.error('Error updating pregnancy record:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = { getAllPregnancies, getPregnancyByPatientId, createPregnancy, updatePregnancy };