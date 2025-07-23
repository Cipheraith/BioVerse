const express = require('express');
const router = express.Router();
const { getAllLocations } = require('../controllers/locationController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, authorizeRoles(['admin', 'moh', 'ambulance_driver']), getAllLocations);

module.exports = router;
