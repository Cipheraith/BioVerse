const { getQuery, allQuery } = require('../config/database');
const { generatePredictiveInsights, predictPotentialIssues } = require('../services/aiPredictiveService');
const { app: logger } = require('../services/logger');

/**
 * Get comprehensive health twin insights for a patient
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getHealthTwinInsights = async (req, res) => {
  try {
    const patientId = req.params.id;
    const patient = await getQuery('SELECT * FROM patients WHERE id = $1', [patientId]);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    if (req.user.role === 'patient' && req.user.id !== patientId) {
      return res.status(403).json({
        message: 'Access Denied: Patients can only view their own health twin insights.'
      });
    }

    // Get patient history data
    const [symptomChecks, labResults] = await Promise.all([
      allQuery('SELECT * FROM symptomChecks WHERE patientId = $1', [patientId]),
      allQuery('SELECT * FROM labResults WHERE patientId = $1', [patientId]),
    ]);

    // Basic insights (legacy approach)
    const basicInsights = {
      healthStatus: 'Good',
      potentialRisks: [],
      recommendations: [],
    };

    const chronicConditions = JSON.parse(patient.chronicConditions || '[]');
    if (chronicConditions.length > 0) {
      basicInsights.healthStatus = 'Needs Attention';
      basicInsights.potentialRisks.push(...chronicConditions.map(condition => `Risk of complications from ${condition}`));
      basicInsights.recommendations.push('Regular monitoring of chronic conditions.');
    }

    const riskFactors = JSON.parse(patient.riskFactors || '[]');
    if (riskFactors.length > 0) {
      basicInsights.healthStatus = 'Needs Attention';
      basicInsights.potentialRisks.push(...riskFactors.map(factor => `Increased risk due to ${factor}`));
      basicInsights.recommendations.push('Address identified risk factors through lifestyle changes.');
    }

    // Check recent symptoms
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentSymptoms = symptomChecks.filter(check => check.timestamp > oneWeekAgo);

    if (recentSymptoms.length > 0) {
      basicInsights.healthStatus = 'Needs Attention';
      basicInsights.potentialRisks.push('Recent symptom reports indicate potential issues.');
      basicInsights.recommendations.push('Follow up on recent symptoms with a healthcare professional.');
    }

    // Check recent lab results
    const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentLabResults = labResults.filter(result => result.timestamp > oneMonthAgo);

    recentLabResults.forEach(result => {
      if (result.testName === 'Blood Sugar' && result.value > 120) {
        basicInsights.healthStatus = 'Critical';
        basicInsights.potentialRisks.push('High blood sugar detected. Potential for diabetes complications.');
        basicInsights.recommendations.push('Consult a doctor immediately for blood sugar management.');
      } else if (result.testName === 'Cholesterol' && result.value > 200) {
        basicInsights.healthStatus = 'Needs Attention';
        basicInsights.potentialRisks.push('High cholesterol detected. Increased risk of cardiovascular disease.');
        basicInsights.recommendations.push('Consider dietary changes and consult a doctor for cholesterol management.');
      }
    });

    // Prepare patient data for advanced analysis
    const patientData = {
      id: patient.id,
      age: patient.age,
      gender: patient.gender,
      medicalHistory: JSON.parse(patient.medicalHistory || '[]'),
      chronicConditions: chronicConditions,
      allergies: JSON.parse(patient.allergies || '[]'),
      medications: JSON.parse(patient.medications || '[]'),
      riskFactors: riskFactors,
      history: [
        ...symptomChecks.map(check => ({
          type: 'symptom',
          timestamp: check.timestamp,
          symptoms: JSON.parse(check.symptoms || '[]'),
          severity: check.severity || 'medium'
        })),
        ...labResults.map(result => ({
          type: 'lab',
          timestamp: result.timestamp,
          testName: result.testName,
          value: result.value,
          unit: result.unit,
          normalRange: result.normalRange,
          vitals: {
            [result.testName.toLowerCase().replace(/\s+/g, '_')]: result.value
          }
        }))
      ]
    };

    // Get advanced predictive insights
    let predictiveInsights = { status: 'insufficient_data' };
    let potentialIssues = { status: 'insufficient_data' };

    try {
      if (patientData.history.length >= 3) {
        predictiveInsights = await generatePredictiveInsights(patientData);
        potentialIssues = await predictPotentialIssues(patientData);
      }
    } catch (aiError) {
      logger.error(`AI predictive analysis failed for patient ${patientId}:`, aiError);
    }

    // Combine basic and advanced insights
    const combinedInsights = {
      ...basicInsights,
      timestamp: new Date().toISOString(),
      patientId,
      predictiveAnalysis: predictiveInsights.status === 'success' ? {
        healthTrajectory: predictiveInsights.insights.healthTrajectory,
        concernLevel: predictiveInsights.insights.overallConcernLevel,
        recommendations: predictiveInsights.recommendations || []
      } : { status: 'unavailable' },
      potentialConditions: potentialIssues.status === 'success' ?
        potentialIssues.potentialConditions || [] : [],
      earlyWarnings: predictiveInsights.status === 'success' ?
        predictiveInsights.earlyWarnings || [] : []
    };

    // Update health status based on predictive analysis
    if (predictiveInsights.status === 'success') {
      if (predictiveInsights.insights.overallConcernLevel === 'high') {
        combinedInsights.healthStatus = 'Critical';
      } else if (predictiveInsights.insights.overallConcernLevel === 'medium' &&
        combinedInsights.healthStatus !== 'Critical') {
        combinedInsights.healthStatus = 'Needs Attention';
      }

      // Add predictive recommendations
      if (predictiveInsights.recommendations && predictiveInsights.recommendations.length > 0) {
        combinedInsights.recommendations = [
          ...combinedInsights.recommendations,
          ...predictiveInsights.recommendations
        ];
      }
    }

    res.json(combinedInsights);
  } catch (error) {
    logger.error('Error fetching health twin insights:', error);
    res.status(500).json({
      message: 'Failed to retrieve health twin insights due to an internal error.'
    });
  }
};

/**
 * Get detailed health twin data for visualization
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getHealthTwinData = async (req, res) => {
  try {
    const patientId = req.params.id;
    const patient = await getQuery('SELECT * FROM patients WHERE id = $1', [patientId]);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    if (req.user.role === 'patient' && req.user.id !== patientId) {
      return res.status(403).json({
        message: 'Access Denied: Patients can only view their own health twin data.'
      });
    }

    // Get patient history data
    const [symptomChecks, labResults, appointments] = await Promise.all([
      allQuery('SELECT * FROM symptomChecks WHERE patientId = $1', [patientId]),
      allQuery('SELECT * FROM labResults WHERE patientId = $1', [patientId]),
      allQuery('SELECT * FROM appointments WHERE patientId = $1 ORDER BY scheduledTime DESC LIMIT 5', [patientId])
    ]);

    // Process symptom data for visualization
    const symptomData = symptomChecks.map(check => ({
      id: check.id,
      timestamp: check.timestamp,
      date: new Date(check.timestamp).toISOString().split('T')[0],
      symptoms: JSON.parse(check.symptoms || '[]'),
      count: JSON.parse(check.symptoms || '[]').length
    }));

    // Group symptoms by date for timeline visualization
    const symptomTimeline = {};
    symptomData.forEach(entry => {
      if (!symptomTimeline[entry.date]) {
        symptomTimeline[entry.date] = [];
      }
      symptomTimeline[entry.date].push(...entry.symptoms);
    });

    // Process lab results for visualization
    const vitalSigns = {};
    labResults.forEach(result => {
      const testName = result.testName.toLowerCase().replace(/\s+/g, '_');
      if (!vitalSigns[testName]) {
        vitalSigns[testName] = [];
      }
      vitalSigns[testName].push({
        timestamp: result.timestamp,
        date: new Date(result.timestamp).toISOString().split('T')[0],
        value: result.value,
        unit: result.unit,
        normalRange: result.normalRange
      });
    });

    // Format appointment data
    const appointmentData = appointments.map(apt => ({
      id: apt.id,
      scheduledTime: apt.scheduledTime,
      status: apt.status,
      type: apt.type,
      notes: apt.notes
    }));

    res.json({
      patientId,
      patientInfo: {
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        chronicConditions: JSON.parse(patient.chronicConditions || '[]'),
        riskFactors: JSON.parse(patient.riskFactors || '[]')
      },
      symptomData: {
        timeline: symptomTimeline,
        raw: symptomData
      },
      vitalSigns,
      appointments: appointmentData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching health twin data:', error);
    res.status(500).json({
      message: 'Failed to retrieve health twin data due to an internal error.'
    });
  }
};

/**
 * Update health twin with new data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateHealthTwin = async (req, res) => {
  try {
    const { vitals, symptoms, medications, lifestyle } = req.body;
    
    // Basic validation
    if (!vitals || symptoms === undefined || medications === undefined || !lifestyle) {
      return res.status(400).json({ message: 'Invalid data format' });
    }
    
    // Calculate health score
    const healthScore = calculateHealthScore(vitals, lifestyle);
    const riskFactors = calculateRiskFactors(vitals, symptoms);
    const recommendations = calculateRecommendations(vitals, symptoms, lifestyle);
    
    // For now, we'll just return the calculated values since we may not have the actual table
    // In a real implementation, you would save this to the database:
    /*
    await getQuery(
      `INSERT INTO healthTwins (patientId, vitals, symptoms, medications, lifestyle, healthScore, riskFactors, recommendations) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      ON CONFLICT (patientId) DO UPDATE SET 
      vitals = EXCLUDED.vitals, 
      symptoms = EXCLUDED.symptoms, 
      medications = EXCLUDED.medications, 
      lifestyle = EXCLUDED.lifestyle,
      healthScore = EXCLUDED.healthScore,
      riskFactors = EXCLUDED.riskFactors,
      recommendations = EXCLUDED.recommendations,
      updatedAt = CURRENT_TIMESTAMP`,
      [
        patientId, 
        JSON.stringify(vitals), 
        JSON.stringify(symptoms), 
        JSON.stringify(medications), 
        JSON.stringify(lifestyle),
        healthScore,
        JSON.stringify(riskFactors),
        JSON.stringify(recommendations)
      ]
    );
    */
    
    res.json({
      success: true,
      healthTwin: {
        healthScore,
        riskFactors,
        recommendations
      }
    });
  } catch (error) {
    logger.error('Error updating health twin:', error);
    res.status(500).json({
      message: 'Failed to update health twin due to an internal error.'
    });
  }
};

function calculateHealthScore(vitals, lifestyle) {
  let score = 10;
  
  // Blood pressure scoring
  if (vitals.bloodPressure) {
    const systolic = vitals.bloodPressure.systolic;
    const diastolic = vitals.bloodPressure.diastolic;
    
    if (systolic > 140 || diastolic > 90) {
      score -= 2;
    } else if (systolic > 130 || diastolic > 85) {
      score -= 1;
    }
  }
  
  // Heart rate scoring
  if (vitals.heartRate) {
    if (vitals.heartRate > 100 || vitals.heartRate < 60) {
      score -= 1;
    }
  }
  
  // Lifestyle scoring
  if (lifestyle.exercise === 'high') {
    score += 1;
  } else if (lifestyle.exercise === 'low') {
    score -= 1;
  }
  
  if (lifestyle.diet === 'healthy') {
    score += 0.5;
  } else if (lifestyle.diet === 'poor') {
    score -= 1;
  }
  
  if (lifestyle.sleep < 6) {
    score -= 1;
  } else if (lifestyle.sleep >= 8) {
    score += 0.5;
  }
  
  if (lifestyle.stress === 'high') {
    score -= 1;
  }
  
  return Math.max(0, Math.min(10, score));
}

function calculateRiskFactors(vitals, symptoms) {
  const risks = [];
  
  if (vitals.bloodPressure) {
    const systolic = vitals.bloodPressure.systolic;
    const diastolic = vitals.bloodPressure.diastolic;
    
    if (systolic > 140 || diastolic > 90) {
      risks.push('High blood pressure detected');
    }
  }
  
  if (symptoms && symptoms.length > 0) {
    const seriousSymptoms = ['chest pain', 'shortness of breath', 'severe headache'];
    const hasSerious = symptoms.some(symptom => 
      seriousSymptoms.some(serious => symptom.toLowerCase().includes(serious))
    );
    
    if (hasSerious) {
      risks.push('Concerning symptoms reported');
    }
  }
  
  return risks;
}

function calculateRecommendations(vitals, symptoms, lifestyle) {
  const recommendations = [];
  
  if (lifestyle.exercise === 'low') {
    recommendations.push({
      category: 'lifestyle',
      priority: 'high',
      message: 'Increase physical activity to at least 30 minutes daily'
    });
  }
  
  if (lifestyle.diet === 'poor') {
    recommendations.push({
      category: 'lifestyle',
      priority: 'high',
      message: 'Improve diet with more fruits, vegetables, and whole grains'
    });
  }
  
  if (vitals.bloodPressure && (vitals.bloodPressure.systolic > 140 || vitals.bloodPressure.diastolic > 90)) {
    recommendations.push({
      category: 'medical',
      priority: 'high',
      message: 'Consult a healthcare provider about blood pressure management'
    });
  }
  
  return recommendations;
}

module.exports = {
  getHealthTwinInsights,
  getHealthTwinData,
  updateHealthTwin
};