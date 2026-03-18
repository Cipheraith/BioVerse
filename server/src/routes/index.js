const express = require('express');
const router = express.Router();

// Healthcheck endpoint
router.get('/healthcheck', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});

const authRoutes = require('./auth');
const patientRoutes = require('./patients');
const appointmentRoutes = require('./appointments');
const pregnancyRoutes = require('./pregnancies');
const symptomRoutes = require('./symptoms');
const messageRoutes = require('./messages');
const locationRoutes = require('./locations');
const labRoutes = require('./labs');

const dashboardRoutes = require('./dashboard');
const predictiveRoutes = require('./predictive');
const policyRoutes = require('./policies');
const reportRoutes = require('./reports');
const performanceRoutes = require('./performance');
const notificationRoutes = require('./notifications');
const meRoutes = require('./me');
const userRoutes = require('./users');
const telemedicineRoutes = require('./telemedicine');
const resourcesRoutes = require('./resources');
const prescriptionsRoutes = require('./prescriptions');
const wardsRoutes = require('./wards');
const coordinationRoutes = require('./coordination');
const pharmacyRoutes = require('./pharmacy');
const dhis2Routes = require('./dhis2');
const personaDashboardRoutes = require('./personaDashboard');
const lumaRoutes = require('./luma');


router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/pregnancies', pregnancyRoutes);
router.use('/symptoms', symptomRoutes);
router.use('/messages', messageRoutes);
router.use('/locations', locationRoutes);
router.use('/labs', labRoutes);

router.use('/dashboard', dashboardRoutes);
router.use('/predictive', predictiveRoutes);
router.use('/policies', policyRoutes);
router.use('/reports', reportRoutes);
router.use('/performance', performanceRoutes);
router.use('/notifications', notificationRoutes);
router.use('/me', meRoutes);
router.use('/users', userRoutes);
router.use('/telemedicine', telemedicineRoutes);
router.use('/resources', resourcesRoutes);
router.use('/prescriptions', prescriptionsRoutes);
router.use('/wards', wardsRoutes);
router.use('/v1/coordination', coordinationRoutes);
router.use('/v1/pharmacy', pharmacyRoutes);
router.use('/v1/dhis2', dhis2Routes);
router.use('/v1/dashboard', personaDashboardRoutes);
router.use('/luma', lumaRoutes);

module.exports = router;
