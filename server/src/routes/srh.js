const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  // Pregnancy management
  createPregnancy,
  addAntenatalVisit,
  
  // Contraception
  getContraceptionOptions,
  createContraceptionPlan,
  
  // Menstrual tracking
  addMenstrualCycle,
  getMenstrualCycleHistory,
  
  // Education
  getSexualHealthEducation,
  
  // Assessments
  createSRHAssessment
} = require('../controllers/srhController');

// Import existing pregnancy controller functions
const { 
  getAllPregnancies, 
  getPregnancyByPatientId, 
  updatePregnancy 
} = require('../controllers/pregnancyController');

// =======================
// PREGNANCY MANAGEMENT ROUTES
// =======================

// Enhanced pregnancy creation with more comprehensive data
router.post('/pregnancy', 
  authenticateToken, 
  authorizeRoles(['admin', 'health_worker']), 
  createPregnancy
);

// Get all pregnancies (existing)
router.get('/pregnancies', 
  authenticateToken, 
  authorizeRoles(['admin', 'health_worker', 'moh']), 
  getAllPregnancies
);

// Get pregnancy by patient ID (existing)
router.get('/pregnancy/patient/:patientId', 
  authenticateToken, 
  authorizeRoles(['admin', 'health_worker', 'moh', 'patient']), 
  getPregnancyByPatientId
);

// Update pregnancy (existing)
router.put('/pregnancy/:id', 
  authenticateToken, 
  authorizeRoles(['admin', 'health_worker']), 
  updatePregnancy
);

// Add antenatal visit
router.post('/pregnancy/:pregnancyId/antenatal-visit', 
  authenticateToken, 
  authorizeRoles(['admin', 'health_worker']), 
  addAntenatalVisit
);

// =======================
// CONTRACEPTION ROUTES
// =======================

// Get contraception options with filtering (public endpoint for educational purposes)
router.get('/contraception/options', 
  getContraceptionOptions
);

// Create contraception plan
router.post('/contraception/plan', 
  authenticateToken, 
  authorizeRoles(['admin', 'health_worker', 'patient']), 
  createContraceptionPlan
);

// Get patient's contraception plans
router.get('/contraception/plans/:patientId', 
  authenticateToken, 
  authorizeRoles(['admin', 'health_worker', 'patient']), 
  async (req, res) => {
    try {
      const { patientId } = req.params;
      
      // Check if patient can access their own data
      if (req.user.role === 'patient' && req.user.id !== patientId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const { allQuery } = require('../config/database');
      const plans = await allQuery(
        'SELECT * FROM contraception_plans WHERE patientId = $1 ORDER BY createdAt DESC',
        [patientId]
      );

      res.json({
        plans,
        totalCount: plans.length
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// =======================
// SEXUAL HEALTH EDUCATION ROUTES
// =======================

// Get sexual health education content
router.get('/education', 
  authenticateToken, 
  getSexualHealthEducation
);

// Get specific education topic
router.get('/education/:topicId', 
  authenticateToken, 
  async (req, res) => {
    try {
      const { topicId } = req.params;
      
      // This would typically fetch from a database
      const topics = {
        1: {
          id: 1,
          title: 'Safe Sex Practices',
          content: 'Comprehensive guide on safe sex practices...',
          videos: ['/videos/safe-sex-basics.mp4'],
          documents: ['/docs/safe-sex-guide.pdf']
        },
        2: {
          id: 2,
          title: 'Understanding Your Menstrual Cycle',
          content: 'Learn about menstrual health and cycle tracking...',
          videos: ['/videos/menstrual-cycle-basics.mp4'],
          documents: ['/docs/menstrual-health-guide.pdf']
        }
      };

      const topic = topics[topicId];
      if (!topic) {
        return res.status(404).json({ message: 'Topic not found' });
      }

      res.json(topic);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// =======================
// SRH ASSESSMENTS ROUTES
// =======================

// Create SRH assessment
router.post('/assessment', 
  authenticateToken, 
  authorizeRoles(['admin', 'health_worker', 'patient']), 
  createSRHAssessment
);

// Get patient's SRH assessments
router.get('/assessments/:patientId', 
  authenticateToken, 
  authorizeRoles(['admin', 'health_worker', 'patient']), 
  async (req, res) => {
    try {
      const { patientId } = req.params;
      
      // Check if patient can access their own data
      if (req.user.role === 'patient' && req.user.id !== patientId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const { allQuery } = require('../config/database');
      const assessments = await allQuery(
        'SELECT * FROM srh_assessments WHERE patientId = $1 ORDER BY createdAt DESC',
        [patientId]
      );

      res.json({
        assessments,
        totalCount: assessments.length
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// =======================
// STI TESTING ROUTES
// =======================

// Get STI testing information
router.get('/sti/testing-info', 
  authenticateToken, 
  async (req, res) => {
    try {
      const testingInfo = {
        commonTests: [
          {
            name: 'Chlamydia',
            method: 'Urine sample or swab',
            frequency: 'Annually for sexually active individuals',
            symptoms: ['Painful urination', 'Unusual discharge', 'Pelvic pain']
          },
          {
            name: 'Gonorrhea',
            method: 'Urine sample or swab',
            frequency: 'Annually for sexually active individuals',
            symptoms: ['Painful urination', 'Unusual discharge', 'Pelvic pain']
          },
          {
            name: 'HIV',
            method: 'Blood test',
            frequency: 'Annually or as recommended by healthcare provider',
            symptoms: ['Flu-like symptoms', 'Fatigue', 'Weight loss']
          },
          {
            name: 'Syphilis',
            method: 'Blood test',
            frequency: 'Annually for high-risk individuals',
            symptoms: ['Painless sores', 'Rash', 'Fever']
          }
        ],
        recommendations: [
          'Get tested regularly if sexually active',
          'Discuss testing with partners',
          'Use barrier protection consistently',
          'Know your and your partner\'s status'
        ]
      };

      res.json(testingInfo);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// Schedule STI testing
router.post('/sti/schedule-test', 
  authenticateToken, 
  authorizeRoles(['admin', 'health_worker', 'patient']), 
  async (req, res) => {
    try {
      const { patientId, testTypes, preferredDate, notes } = req.body;

      if (req.user.role === 'patient' && req.user.id !== patientId) {
        return res.status(403).json({ message: 'Access Denied: You can only schedule STI tests for yourself.' });
      }

      if (!patientId || !testTypes || !preferredDate) {
        return res.status(400).json({ 
          message: 'Missing required fields: patientId, testTypes, preferredDate' 
        });
      }

      // Create appointment for STI testing
      const appointmentData = {
        patientId,
        type: 'sti_testing',
        date: preferredDate,
        notes: `STI Testing: ${testTypes.join(', ')}. ${notes || ''}`,
        status: 'scheduled',
        createdAt: new Date().toISOString()
      };

      const { runQuery } = require('../config/database');
      const result = await runQuery(
        `INSERT INTO appointments (patientId, type, date, notes, status, createdAt) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        Object.values(appointmentData)
      );

      res.status(201).json({
        ...appointmentData,
        id: result.id,
        message: 'STI testing appointment scheduled successfully'
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// =======================
// SRH STATISTICS ROUTES
// =======================

// Get SRH dashboard statistics
router.get('/dashboard/stats', 
  authenticateToken, 
  authorizeRoles(['admin', 'health_worker', 'moh']), 
  async (req, res) => {
    try {
      const { allQuery } = require('../config/database');
      
      const [
        totalPregnancies,
        activePregnancies,
        totalContraceptionPlans,
        totalAssessments,
        recentCycles
      ] = await Promise.all([
        allQuery('SELECT COUNT(*) as count FROM pregnancies'),
        allQuery('SELECT COUNT(*) as count FROM pregnancies WHERE transportBooked = false'),
        allQuery('SELECT COUNT(*) as count FROM contraception_plans WHERE active = true'),
        allQuery('SELECT COUNT(*) as count FROM srh_assessments WHERE createdAt >= $1', 
          [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()]),
        allQuery('SELECT COUNT(*) as count FROM menstrual_cycles WHERE createdAt >= $1', 
          [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()])
      ]);

      res.json({
        pregnancies: {
          total: totalPregnancies[0].count,
          active: activePregnancies[0].count,
          transportNeeded: activePregnancies[0].count
        },
        contraception: {
          activePlans: totalContraceptionPlans[0].count
        },
        assessments: {
          thisMonth: totalAssessments[0].count
        },
        menstrualTracking: {
          recentEntries: recentCycles[0].count
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

module.exports = router;
