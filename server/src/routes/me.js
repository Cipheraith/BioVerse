const express = require('express');
const router = express.Router();
const { getMe } = require('../controllers/patientController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getMe);

module.exports = router;
