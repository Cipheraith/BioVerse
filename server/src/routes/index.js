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
const srhRoutes = require('./srh');
const symptomRoutes = require('./symptoms');
const messageRoutes = require('./messages');
const locationRoutes = require('./locations');
const labRoutes = require('./labs');
const healthTwinRoutes = require('./healthTwin');
const dashboardRoutes = require('./dashboard');
const predictiveRoutes = require('./predictive');
const policyRoutes = require('./policies');
const reportRoutes = require('./reports');
const performanceRoutes = require('./performance');
const notificationRoutes = require('./notifications');
const meRoutes = require('./me');
const userRoutes = require('./users');
const telemedicineRoutes = require('./telemedicine');
const billingRoutes = require('./billing');
const marketplaceRoutes = require('./marketplace');
const mobileRoutes = require('./mobile');
const feedbackRoutes = require('./feedback');
const complianceRoutes = require('./compliance');
const lumaRoutes = require('./luma');
const aiRoutes = require('./ai');
const voiceAnalysisRoutes = require('./health/voiceAnalysis');

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/pregnancies', pregnancyRoutes);
router.use('/symptoms', symptomRoutes);
router.use('/srh', srhRoutes);
router.use('/messages', messageRoutes);
router.use('/locations', locationRoutes);
router.use('/labs', labRoutes);
router.use('/health-twin', healthTwinRoutes);
// Alias for pluralized path used by some clients
router.use('/health-twins', healthTwinRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/predictive', predictiveRoutes);
router.use('/policies', policyRoutes);
router.use('/reports', reportRoutes);
router.use('/performance', performanceRoutes);
router.use('/notifications', notificationRoutes);
router.use('/me', meRoutes);
router.use('/users', userRoutes);
router.use('/telemedicine', telemedicineRoutes);
router.use('/billing', billingRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/mobile', mobileRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/compliance', complianceRoutes);
router.use('/luma', lumaRoutes);
router.use('/ai', aiRoutes);
router.use('/health', voiceAnalysisRoutes);

module.exports = router;
