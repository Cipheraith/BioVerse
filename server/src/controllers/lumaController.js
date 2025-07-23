const { getLumaResponse: getLumaResponseFromAI } = require('../services/aiService');
const { app: logger } = require('../services/logger');

const getLumaResponse = async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ message: 'Missing query.' });
  }

  try {
    const lumaResponse = await getLumaResponseFromAI(query);
    res.json(lumaResponse);
  } catch (error) {
    logger.error('Error getting Luma response:', error);
    res.status(500).json({ message: 'Failed to get Luma response due to an internal error.' });
  }
};

module.exports = { getLumaResponse };
