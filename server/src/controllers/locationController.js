const { allQuery } = require('../config/database');

const getAllLocations = async (req, res) => {
  try {
    const locations = await allQuery('SELECT * FROM locations');
    res.json(locations.map(l => ({
      ...l,
      position: JSON.parse(l.position || 'null'),
      medicationStock: JSON.parse(l.medicationStock || '[]'),
    })));
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Error fetching locations.' });
  }
};

module.exports = { getAllLocations };