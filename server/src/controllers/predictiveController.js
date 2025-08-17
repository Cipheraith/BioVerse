const { runQuery, getQuery, allQuery } = require("../config/database");
const { generatePredictiveInsights, predictPotentialIssues } = require("../services/aiPredictiveService");
const { app: logger } = require("../services/logger");

/**
 * Get predictive health insights for a patient
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPredictiveInsights = async (req, res) => {
  try {
    const patientId = req.params.id;
    
    // Check authorization
    if (req.user.role === "patient" && req.user.id !== patientId) {
      return res.status(403).json({ 
        message: "Access Denied: Patients can only view their own predictive insights." 
      });
    }

    // Get patient data
  const patient = await getQuery("SELECT * FROM patients WHERE id = $1", [patientId]);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Get patient history data
    const [symptomChecks, labResults] = await Promise.all([
  allQuery("SELECT * FROM symptomChecks WHERE patientId = $1", [patientId]),
  allQuery("SELECT * FROM labResults WHERE patientId = $1", [patientId]),
  allQuery("SELECT * FROM appointments WHERE patientId = $1", [patientId])
    ]);

    // Prepare patient data for analysis
    const patientData = {
      id: patient.id,
      age: patient.age,
      gender: patient.gender,
      medicalHistory: JSON.parse(patient.medicalHistory || "[]"),
      chronicConditions: JSON.parse(patient.chronicConditions || "[]"),
      allergies: JSON.parse(patient.allergies || "[]"),
      medications: JSON.parse(patient.medications || "[]"),
      riskFactors: JSON.parse(patient.riskFactors || "[]"),
      history: [
        ...symptomChecks.map(check => ({
          type: 'symptom',
          timestamp: check.timestamp,
          symptoms: JSON.parse(check.symptoms || "[]"),
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

    // Generate predictive insights
    const insights = await generatePredictiveInsights(patientData);
    
    // Log the request
    logger.info(`Generated predictive insights for patient ${patientId}`);
    
    res.json({
      patientId,
      timestamp: new Date().toISOString(),
      insights
    });
  } catch (error) {
    logger.error("Error generating predictive insights:", error);
    res.status(500).json({ 
      message: "Failed to generate predictive insights due to an internal error." 
    });
  }
};

/**
 * Get potential health issues prediction for a patient
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPotentialIssues = async (req, res) => {
  try {
    const patientId = req.params.id;
    
    // Check authorization
    if (req.user.role === "patient" && req.user.id !== patientId) {
      return res.status(403).json({ 
        message: "Access Denied: Patients can only view their own health predictions." 
      });
    }

    // Get patient data
  const patient = await getQuery("SELECT * FROM patients WHERE id = $1", [patientId]);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Get patient history data
    const [symptomChecks, labResults] = await Promise.all([
  allQuery("SELECT * FROM symptomChecks WHERE patientId = $1", [patientId]),
  allQuery("SELECT * FROM labResults WHERE patientId = $1", [patientId])
    ]);

    // Prepare patient data for analysis
    const patientData = {
      id: patient.id,
      age: patient.age,
      gender: patient.gender,
      medicalHistory: JSON.parse(patient.medicalHistory || "[]"),
      chronicConditions: JSON.parse(patient.chronicConditions || "[]"),
      allergies: JSON.parse(patient.allergies || "[]"),
      medications: JSON.parse(patient.medications || "[]"),
      riskFactors: JSON.parse(patient.riskFactors || "[]"),
      history: [
        ...symptomChecks.map(check => ({
          type: 'symptom',
          timestamp: check.timestamp,
          symptoms: JSON.parse(check.symptoms || "[]"),
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

    // Predict potential health issues
    const prediction = await predictPotentialIssues(patientData);
    
    // Log the request
    logger.info(`Generated health predictions for patient ${patientId}`);
    
    res.json({
      patientId,
      timestamp: new Date().toISOString(),
      prediction
    });
  } catch (error) {
    logger.error("Error predicting potential health issues:", error);
    res.status(500).json({ 
      message: "Failed to predict potential health issues due to an internal error." 
    });
  }
};

/**
 * Get symptom trend analysis
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSymptomTrendAnalysis = async (req, res) => {
  try {
    const patientId = req.params.id;
    
    // Check authorization
    if (req.user.role === "patient" && req.user.id !== patientId) {
      return res.status(403).json({ 
        message: "Access Denied: Patients can only view their own symptom trends." 
      });
    }

    // Get symptom checks for this patient
    const symptomChecks = await allQuery(
      "SELECT * FROM symptomChecks WHERE patientId = $1",
      [patientId]
    );

    if (symptomChecks.length === 0) {
      return res.json({
        patientId,
        status: 'insufficient_data',
        message: 'Not enough symptom data for trend analysis',
        trends: []
      });
    }

    // Format symptom history
    const symptomHistory = symptomChecks.map(check => ({
      timestamp: check.timestamp,
      symptoms: JSON.parse(check.symptoms || "[]"),
      severity: check.severity || 'medium'
    }));

    // Get trend analysis from the predictive service
    const { analyzeSymptomTrends } = require('../services/aiPredictiveService');
    const trends = await analyzeSymptomTrends(symptomHistory);
    
    res.json({
      patientId,
      timestamp: new Date().toISOString(),
      trends
    });
  } catch (error) {
    logger.error("Error analyzing symptom trends:", error);
    res.status(500).json({ 
      message: "Failed to analyze symptom trends due to an internal error." 
    });
  }
};

/**
 * Get vital sign trend analysis
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVitalTrendAnalysis = async (req, res) => {
  try {
    const patientId = req.params.id;
    
    // Check authorization
    if (req.user.role === "patient" && req.user.id !== patientId) {
      return res.status(403).json({ 
        message: "Access Denied: Patients can only view their own vital trends." 
      });
    }

    // Get lab results for this patient
    const labResults = await allQuery(
      "SELECT * FROM labResults WHERE patientId = $1",
      [patientId]
    );

    if (labResults.length === 0) {
      return res.json({
        patientId,
        status: 'insufficient_data',
        message: 'Not enough vital data for trend analysis',
        trends: {}
      });
    }

    // Format vital history
    const vitalHistory = labResults.map(result => ({
      timestamp: result.timestamp,
      vitals: {
        [result.testName.toLowerCase().replace(/\s+/g, '_')]: result.value
      }
    }));

    // Get trend analysis from the predictive service
    const { analyzeVitalTrends } = require('../services/aiPredictiveService');
    const trends = await analyzeVitalTrends(vitalHistory);
    
    res.json({
      patientId,
      timestamp: new Date().toISOString(),
      trends
    });
  } catch (error) {
    logger.error("Error analyzing vital trends:", error);
    res.status(500).json({ 
      message: "Failed to analyze vital trends due to an internal error." 
    });
  }
};

/**
 * Get early warnings for a patient
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEarlyWarnings = async (req, res) => {
  try {
    const patientId = req.params.id;
    
    // Check authorization
    if (req.user.role === "patient" && req.user.id !== patientId) {
      return res.status(403).json({ 
        message: "Access Denied: Patients can only view their own health warnings." 
      });
    }

    // Get patient data
  const patient = await getQuery("SELECT * FROM patients WHERE id = $1", [patientId]);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Get patient history data
    const [symptomChecks, labResults] = await Promise.all([
      allQuery("SELECT * FROM symptomChecks WHERE patientId = $1", [patientId]),
      allQuery("SELECT * FROM labResults WHERE patientId = $1", [patientId])
    ]);

    // Prepare patient data for analysis
    const patientData = {
      id: patient.id,
      age: patient.age,
      gender: patient.gender,
      medicalHistory: JSON.parse(patient.medicalHistory || "[]"),
      chronicConditions: JSON.parse(patient.chronicConditions || "[]"),
      allergies: JSON.parse(patient.allergies || "[]"),
      medications: JSON.parse(patient.medications || "[]"),
      riskFactors: JSON.parse(patient.riskFactors || "[]"),
      history: [
        ...symptomChecks.map(check => ({
          type: 'symptom',
          timestamp: check.timestamp,
          symptoms: JSON.parse(check.symptoms || "[]"),
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

    // Generate insights first
    const { generatePredictiveInsights, generateEarlyWarnings } = require('../services/aiPredictiveService');
    const insights = await generatePredictiveInsights(patientData);
    
    // Generate early warnings
    const warnings = insights.status === 'success' 
      ? await generateEarlyWarnings(insights.insights, patientData)
      : [];
    
    res.json({
      patientId,
      timestamp: new Date().toISOString(),
      warnings,
      recommendedActions: warnings.length > 0 
        ? warnings.map(w => ({
            warning: w.message,
            action: w.urgency === 'high' 
              ? 'Immediate medical attention recommended' 
              : 'Schedule follow-up with healthcare provider'
          }))
        : [{
            warning: 'No significant health warnings detected',
            action: 'Continue regular health monitoring'
          }]
    });
  } catch (error) {
    logger.error("Error generating early warnings:", error);
    res.status(500).json({ 
      message: "Failed to generate early warnings due to an internal error." 
    });
  }
};

module.exports = {
  getPredictiveInsights,
  getPotentialIssues,
  getSymptomTrendAnalysis,
  getVitalTrendAnalysis,
  getEarlyWarnings
};