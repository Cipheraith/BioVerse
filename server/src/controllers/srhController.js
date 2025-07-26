const { runQuery, getQuery, allQuery } = require('../config/database');
const { sendSRHNotification } = require('../services/notificationService');
const { generateSRHRecommendations } = require('../services/aiService');
const { logger } = require('../services/logger');

// =======================
// PREGNANCY MANAGEMENT
// =======================

const createPregnancy = async (req, res) => {
  try {
    const { 
      patientId, 
      lastMenstrualPeriod, 
      estimatedDueDate, 
      isFirstPregnancy, 
      previousPregnancies,
      riskFactors,
      currentSymptoms,
      healthStatus = 'stable'
    } = req.body;

    if (!patientId || !lastMenstrualPeriod) {
      return res.status(400).json({ 
        message: 'Missing required fields: patientId and lastMenstrualPeriod' 
      });
    }

    // Calculate gestational age
    const lmp = new Date(lastMenstrualPeriod);
    const today = new Date();
    const gestationalAge = Math.floor((today - lmp) / (1000 * 60 * 60 * 24 * 7));

    // Calculate EDD if not provided
    let edd = estimatedDueDate;
    if (!edd) {
      edd = new Date(lmp);
      edd.setDate(edd.getDate() + 280); // 40 weeks from LMP
    }

    const pregnancyData = {
      patientId,
      lastMenstrualPeriod,
      estimatedDueDate: edd,
      gestationalAge,
      isFirstPregnancy: isFirstPregnancy || false,
      previousPregnancies: previousPregnancies || 0,
      riskFactors: riskFactors || [],
      currentSymptoms: currentSymptoms || [],
      healthStatus,
      alerts: [],
      transportBooked: false,
      deliveryDetails: null,
      antenatalVisits: [],
      vaccinations: [],
      labResults: [],
      createdAt: new Date().toISOString()
    };

    const result = await runQuery(
      `INSERT INTO pregnancies (
        patientId, lastMenstrualPeriod, estimatedDueDate, gestationalAge, 
        isFirstPregnancy, previousPregnancies, riskFactors, currentSymptoms,
        healthStatus, alerts, transportBooked, deliveryDetails, antenatalVisits,
        vaccinations, labResults, createdAt
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id`,
      Object.values(pregnancyData)
    );

    // Update patient pregnancy status
    await runQuery(
      'UPDATE patients SET isPregnant = true WHERE id = $1',
      [patientId]
    );

    // Send welcome notification
    await sendSRHNotification({
      patientId,
      type: 'pregnancy_registered',
      message: `Congratulations! Your pregnancy has been registered. EDD: ${edd.toDateString()}`,
      priority: 'medium'
    });

    res.status(201).json({ 
      ...pregnancyData, 
      id: result.id,
      message: 'Pregnancy registered successfully'
    });

  } catch (error) {
    logger.error('Error creating pregnancy:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const addAntenatalVisit = async (req, res) => {
  try {
    const { pregnancyId } = req.params;
    const { 
      visitDate, 
      gestationalAge, 
      weight, 
      bloodPressure, 
      fundalHeight, 
      fetalHeartRate,
      symptoms,
      notes,
      nextVisitDate,
      recommendations
    } = req.body;

    const pregnancy = await getQuery('SELECT * FROM pregnancies WHERE id = $1', [pregnancyId]);
    if (!pregnancy) {
      return res.status(404).json({ message: 'Pregnancy record not found' });
    }

    const visit = {
      id: Date.now(),
      visitDate,
      gestationalAge,
      weight,
      bloodPressure,
      fundalHeight,
      fetalHeartRate,
      symptoms: symptoms || [],
      notes,
      nextVisitDate,
      recommendations: recommendations || [],
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    };

    const antenatalVisits = pregnancy.antenatalVisits || [];
    antenatalVisits.push(visit);

    await runQuery(
      'UPDATE pregnancies SET antenatalVisits = $1, gestationalAge = $2 WHERE id = $3',
      [antenatalVisits, gestationalAge, pregnancyId]
    );

    // Send follow-up notification
    await sendSRHNotification({
      patientId: pregnancy.patientId,
      type: 'antenatal_visit_completed',
      message: `Your antenatal visit has been recorded. Next visit: ${nextVisitDate}`,
      priority: 'medium'
    });

    res.json({ 
      message: 'Antenatal visit recorded successfully',
      visit
    });

  } catch (error) {
    logger.error('Error adding antenatal visit:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// =======================
// CONTRACEPTION MANAGEMENT
// =======================

const getContraceptionOptions = async (req, res) => {
  try {
    const { age, medicalHistory, preferences } = req.query;

    const contraceptionOptions = [
      {
        id: 1,
        name: 'Combined Oral Contraceptive Pills',
        type: 'hormonal',
        effectiveness: '91%',
        duration: 'Daily',
        suitableFor: ['18-35', 'non-smoker'],
        benefits: ['Regulates periods', 'Reduces acne', 'Reduces ovarian cancer risk'],
        sideEffects: ['Nausea', 'Mood changes', 'Weight gain'],
        contraindications: ['Smoking over 35', 'Blood clots history', 'Breast cancer']
      },
      {
        id: 2,
        name: 'Intrauterine Device (IUD)',
        type: 'long-acting',
        effectiveness: '99%',
        duration: '3-10 years',
        suitableFor: ['all ages', 'long-term'],
        benefits: ['Long-lasting', 'Highly effective', 'Reversible'],
        sideEffects: ['Irregular bleeding', 'Cramping'],
        contraindications: ['Pelvic infection', 'Pregnancy']
      },
      {
        id: 3,
        name: 'Contraceptive Implant',
        type: 'long-acting',
        effectiveness: '99%',
        duration: '3 years',
        suitableFor: ['all ages', 'breastfeeding'],
        benefits: ['Highly effective', 'Long-lasting', 'Reversible'],
        sideEffects: ['Irregular bleeding', 'Weight gain'],
        contraindications: ['Breast cancer', 'Liver disease']
      },
      {
        id: 4,
        name: 'Condoms',
        type: 'barrier',
        effectiveness: '85%',
        duration: 'Per use',
        suitableFor: ['all ages', 'STI protection'],
        benefits: ['STI protection', 'No hormones', 'Readily available'],
        sideEffects: ['Allergic reactions (rare)'],
        contraindications: ['Latex allergy (use non-latex)']
      },
      {
        id: 5,
        name: 'Emergency Contraception',
        type: 'emergency',
        effectiveness: '85%',
        duration: 'Within 72-120 hours',
        suitableFor: ['emergency use'],
        benefits: ['Prevents pregnancy after unprotected sex'],
        sideEffects: ['Nausea', 'Irregular bleeding'],
        contraindications: ['Pregnancy', 'Repeated use']
      }
    ];

    // Filter based on age and medical history if provided
    let filteredOptions = contraceptionOptions;
    if (age) {
      const ageNum = parseInt(age);
      filteredOptions = filteredOptions.filter(option => {
        if (option.contraindications.includes('Smoking over 35') && ageNum > 35) {
          return false;
        }
        return true;
      });
    }

    res.json({
      options: filteredOptions,
      totalCount: filteredOptions.length,
      recommendations: await generateSRHRecommendations('contraception', { age, medicalHistory, preferences })
    });

  } catch (error) {
    logger.error('Error fetching contraception options:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createContraceptionPlan = async (req, res) => {
  try {
    const { 
      patientId, 
      contraceptionMethod, 
      startDate, 
      duration, 
      reminders, 
      notes 
    } = req.body;

    if (!patientId || !contraceptionMethod || !startDate) {
      return res.status(400).json({ 
        message: 'Missing required fields: patientId, contraceptionMethod, startDate' 
      });
    }

    const planData = {
      patientId,
      contraceptionMethod,
      startDate,
      duration,
      reminders: reminders || [],
      notes,
      active: true,
      createdAt: new Date().toISOString()
    };

    const result = await runQuery(
      `INSERT INTO contraception_plans (
        patientId, contraceptionMethod, startDate, duration, 
        reminders, notes, active, createdAt
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      Object.values(planData)
    );

    // Send confirmation notification
    await sendSRHNotification({
      patientId,
      type: 'contraception_plan_created',
      message: `Your contraception plan has been created: ${contraceptionMethod}`,
      priority: 'medium'
    });

    res.status(201).json({ 
      ...planData, 
      id: result.id,
      message: 'Contraception plan created successfully'
    });

  } catch (error) {
    logger.error('Error creating contraception plan:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// =======================
// MENSTRUAL CYCLE TRACKING
// =======================

const addMenstrualCycle = async (req, res) => {
  try {
    const { 
      patientId, 
      cycleStartDate, 
      cycleLength, 
      periodLength, 
      symptoms, 
      flow, 
      mood,
      notes 
    } = req.body;

    if (!patientId || !cycleStartDate) {
      return res.status(400).json({ 
        message: 'Missing required fields: patientId, cycleStartDate' 
      });
    }

    const cycleData = {
      patientId,
      cycleStartDate,
      cycleLength: cycleLength || 28,
      periodLength: periodLength || 5,
      symptoms: symptoms || [],
      flow: flow || 'medium',
      mood: mood || [],
      notes,
      createdAt: new Date().toISOString()
    };

    const result = await runQuery(
      `INSERT INTO menstrual_cycles (
        patientId, cycleStartDate, cycleLength, periodLength, 
        symptoms, flow, mood, notes, createdAt
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      Object.values(cycleData)
    );

    // Calculate next period prediction
    const nextPeriod = new Date(cycleStartDate);
    nextPeriod.setDate(nextPeriod.getDate() + cycleLength);

    // Send period reminder notification
    await sendSRHNotification({
      patientId,
      type: 'period_tracked',
      message: `Period tracked successfully. Next period expected: ${nextPeriod.toDateString()}`,
      priority: 'low'
    });

    res.status(201).json({ 
      ...cycleData, 
      id: result.id,
      nextPeriodDate: nextPeriod,
      message: 'Menstrual cycle tracked successfully'
    });

  } catch (error) {
    logger.error('Error adding menstrual cycle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getMenstrualCycleHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { months = 6 } = req.query;

    const cycles = await allQuery(
      `SELECT * FROM menstrual_cycles 
       WHERE patientId = $1 
       AND cycleStartDate >= $2 
       ORDER BY cycleStartDate DESC`,
      [patientId, new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000)]
    );

    // Calculate cycle statistics
    const cycleLengths = cycles.map(c => c.cycleLength).filter(l => l > 0);
    const avgCycleLength = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length || 28;
    const cycleRegularity = calculateCycleRegularity(cycleLengths);

    // Predict next periods
    const nextPeriods = [];
    if (cycles.length > 0) {
      const lastCycle = cycles[0];
      const lastPeriodDate = new Date(lastCycle.cycleStartDate);
      
      for (let i = 1; i <= 3; i++) {
        const nextPeriod = new Date(lastPeriodDate);
        nextPeriod.setDate(nextPeriod.getDate() + (avgCycleLength * i));
        nextPeriods.push({
          date: nextPeriod,
          confidence: cycleRegularity > 0.8 ? 'high' : cycleRegularity > 0.6 ? 'medium' : 'low'
        });
      }
    }

    res.json({
      cycles,
      statistics: {
        totalCycles: cycles.length,
        averageCycleLength: Math.round(avgCycleLength),
        cycleRegularity: cycleRegularity,
        commonSymptoms: getCommonSymptoms(cycles)
      },
      predictions: {
        nextPeriods,
        fertileWindow: calculateFertileWindow(cycles[0], avgCycleLength)
      }
    });

  } catch (error) {
    logger.error('Error fetching menstrual cycle history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// =======================
// SEXUAL HEALTH EDUCATION
// =======================

const getSexualHealthEducation = async (req, res) => {
  try {
    const { category, ageGroup } = req.query;

    const educationContent = [
      {
        id: 1,
        title: 'Safe Sex Practices',
        category: 'prevention',
        ageGroup: 'all',
        content: {
          overview: 'Learn about safe sex practices to prevent STIs and unwanted pregnancy.',
          keyPoints: [
            'Use condoms consistently and correctly',
            'Get regular STI testing',
            'Communicate with partners about sexual health',
            'Know your contraception options'
          ],
          resources: [
            { type: 'video', url: '/videos/safe-sex-basics', duration: '5 minutes' },
            { type: 'pdf', url: '/pdfs/safe-sex-guide.pdf', pages: 8 }
          ]
        }
      },
      {
        id: 2,
        title: 'Understanding Your Menstrual Cycle',
        category: 'reproductive-health',
        ageGroup: 'teens-adults',
        content: {
          overview: 'Learn about the menstrual cycle and what is normal for you.',
          keyPoints: [
            'Track your menstrual cycle',
            'Understand hormonal changes',
            'Recognize abnormal symptoms',
            'Maintain menstrual hygiene'
          ],
          resources: [
            { type: 'interactive', url: '/tools/cycle-tracker', duration: 'ongoing' },
            { type: 'article', url: '/articles/menstrual-health', readTime: '7 minutes' }
          ]
        }
      },
      {
        id: 3,
        title: 'Family Planning Options',
        category: 'family-planning',
        ageGroup: 'adults',
        content: {
          overview: 'Explore different contraception methods and family planning options.',
          keyPoints: [
            'Compare contraception effectiveness',
            'Understand side effects and benefits',
            'Consider long-term vs short-term options',
            'Discuss with healthcare provider'
          ],
          resources: [
            { type: 'comparison-tool', url: '/tools/contraception-comparison', duration: '10 minutes' },
            { type: 'consultation', url: '/book-consultation', action: 'scheduling' }
          ]
        }
      },
      {
        id: 4,
        title: 'STI Prevention and Testing',
        category: 'prevention',
        ageGroup: 'teens-adults',
        content: {
          overview: 'Learn about sexually transmitted infections and prevention strategies.',
          keyPoints: [
            'Common STIs and symptoms',
            'Testing recommendations',
            'Treatment options',
            'Prevention strategies'
          ],
          resources: [
            { type: 'symptom-checker', url: '/tools/sti-symptom-checker', duration: '5 minutes' },
            { type: 'testing-locations', url: '/locations/sti-testing', action: 'directory' }
          ]
        }
      },
      {
        id: 5,
        title: 'Pregnancy Health and Nutrition',
        category: 'pregnancy',
        ageGroup: 'adults',
        content: {
          overview: 'Essential information for a healthy pregnancy journey.',
          keyPoints: [
            'Prenatal nutrition guidelines',
            'Exercise during pregnancy',
            'Common pregnancy symptoms',
            'Antenatal care schedule'
          ],
          resources: [
            { type: 'meal-planner', url: '/tools/pregnancy-nutrition', duration: 'ongoing' },
            { type: 'appointment-scheduler', url: '/book-antenatal', action: 'scheduling' }
          ]
        }
      }
    ];

    let filteredContent = educationContent;

    if (category) {
      filteredContent = filteredContent.filter(item => item.category === category);
    }

    if (ageGroup) {
      filteredContent = filteredContent.filter(item => 
        item.ageGroup === 'all' || item.ageGroup.includes(ageGroup)
      );
    }

    res.json({
      content: filteredContent,
      totalCount: filteredContent.length,
      categories: ['prevention', 'reproductive-health', 'family-planning', 'pregnancy'],
      ageGroups: ['teens', 'adults', 'all']
    });

  } catch (error) {
    logger.error('Error fetching sexual health education:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// =======================
// SRH ASSESSMENTS
// =======================

const createSRHAssessment = async (req, res) => {
  try {
    const { 
      patientId, 
      assessmentType, 
      responses, 
      riskFactors 
    } = req.body;

    if (!patientId || !assessmentType || !responses) {
      return res.status(400).json({ 
        message: 'Missing required fields: patientId, assessmentType, responses' 
      });
    }

    const assessmentData = {
      patientId,
      assessmentType,
      responses,
      riskFactors: riskFactors || [],
      recommendations: [],
      score: calculateAssessmentScore(assessmentType, responses),
      createdAt: new Date().toISOString()
    };

    // Generate AI-powered recommendations
    assessmentData.recommendations = await generateSRHRecommendations(assessmentType, {
      responses,
      riskFactors,
      score: assessmentData.score
    });

    const result = await runQuery(
      `INSERT INTO srh_assessments (
        patientId, assessmentType, responses, riskFactors, 
        recommendations, score, createdAt
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      Object.values(assessmentData)
    );

    // Send assessment results notification
    await sendSRHNotification({
      patientId,
      type: 'assessment_completed',
      message: `Your ${assessmentType} assessment has been completed. Check your recommendations.`,
      priority: 'medium'
    });

    res.status(201).json({ 
      ...assessmentData, 
      id: result.id,
      message: 'SRH assessment completed successfully'
    });

  } catch (error) {
    logger.error('Error creating SRH assessment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// =======================
// HELPER FUNCTIONS
// =======================

function calculateCycleRegularity(cycleLengths) {
  if (cycleLengths.length < 3) return 0;
  
  const mean = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
  const variance = cycleLengths.reduce((sum, length) => sum + Math.pow(length - mean, 2), 0) / cycleLengths.length;
  const stdDev = Math.sqrt(variance);
  
  // Regularity score: higher score means more regular cycles
  return Math.max(0, 1 - (stdDev / mean));
}

function getCommonSymptoms(cycles) {
  const symptomCounts = {};
  cycles.forEach(cycle => {
    cycle.symptoms.forEach(symptom => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
  });
  
  return Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([symptom, count]) => ({ symptom, frequency: count / cycles.length }));
}

function calculateFertileWindow(lastCycle, avgCycleLength) {
  if (!lastCycle) return null;
  
  const lastPeriod = new Date(lastCycle.cycleStartDate);
  const nextOvulation = new Date(lastPeriod);
  nextOvulation.setDate(nextOvulation.getDate() + avgCycleLength - 14);
  
  const fertileStart = new Date(nextOvulation);
  fertileStart.setDate(fertileStart.getDate() - 5);
  
  const fertileEnd = new Date(nextOvulation);
  fertileEnd.setDate(fertileEnd.getDate() + 1);
  
  return {
    ovulationDate: nextOvulation,
    fertileStart,
    fertileEnd,
    confidence: 'medium'
  };
}

function calculateAssessmentScore(assessmentType, responses) {
  // Simplified scoring system - can be enhanced based on specific assessment types
  const totalQuestions = Object.keys(responses).length;
  const positiveResponses = Object.values(responses).filter(response => 
    response === 'yes' || response === 'often' || response === 'always'
  ).length;
  
  return Math.round((positiveResponses / totalQuestions) * 100);
}

module.exports = {
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
};
