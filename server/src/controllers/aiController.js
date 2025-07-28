/**
 * Enhanced AI Controller with Ollama Integration
 * Handles all AI-powered features using local models
 */

const ollamaAI = require('../services/ollamaAIService');
const { getQuery, allQuery } = require('../config/database');
const { logger } = require('../services/logger');

class AIController {
  /**
   * Enhanced Luma chatbot with local AI
   */
  async processLumaQuery(req, res) {
    try {
      const { message, patientId, conversationId } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Get patient context if available
      let patientContext = null;
      if (patientId) {
        const patient = await getQuery('SELECT * FROM patients WHERE id = $1', [patientId]);
        if (patient) {
          patientContext = {
            age: patient.age,
            gender: patient.gender,
            chronicConditions: patient.chronicConditions || [],
            medications: patient.medications || [],
            allergies: patient.allergies || []
          };
        }
      }

      // Process query with Ollama
      const aiResponse = await ollamaAI.processHealthQuery(
        message, 
        patientId || 'anonymous', 
        patientContext ? [patientContext] : []
      );

      // Store conversation in database (optional)
      if (patientId) {
        await this.storeConversation(patientId, message, aiResponse.response);
      }

      res.json({
        response: aiResponse.response,
        conversationId: aiResponse.conversationId,
        timestamp: aiResponse.timestamp,
        model: aiResponse.model,
        confidence: 0.85 // Could be calculated based on model response
      });

    } catch (error) {
      logger.error('Error processing Luma query:', error);
      res.status(500).json({ 
        error: 'Failed to process query',
        message: 'Our AI assistant is temporarily unavailable. Please try again later.'
      });
    }
  }

  /**
   * Advanced symptom analysis with local AI
   */
  async analyzeSymptoms(req, res) {
    try {
      const { symptoms, patientId, additionalInfo } = req.body;

      if (!symptoms || !Array.isArray(symptoms)) {
        return res.status(400).json({ error: 'Symptoms array is required' });
      }

      // Get patient data
      const patient = await getQuery('SELECT * FROM patients WHERE id = $1', [patientId]);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      // Get medical history
      const medicalHistory = patient.medicalHistory || [];

      // Format symptoms for AI analysis
      const formattedSymptoms = symptoms.map(symptom => ({
        symptom: symptom.name || symptom.symptom,
        severity: symptom.severity || 'moderate',
        duration: symptom.duration || 'recent',
        description: symptom.description || ''
      }));

      // Generate AI diagnosis
      const diagnosis = await ollamaAI.generateMedicalDiagnosis(
        {
          age: patient.age,
          gender: patient.gender,
          medications: patient.medications || [],
          allergies: patient.allergies || []
        },
        formattedSymptoms,
        medicalHistory
      );

      // Store symptom check in database
      await this.storeSymptomCheck(patientId, formattedSymptoms, diagnosis);

      res.json({
        diagnosis: diagnosis.diagnoses || [],
        recommendations: diagnosis.recommendations || [],
        suggestedTests: diagnosis.tests || [],
        warnings: diagnosis.warnings || [],
        confidence: diagnosis.confidence || 0.8,
        disclaimer: 'This AI analysis is for informational purposes only. Please consult a healthcare professional for proper medical advice.',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error analyzing symptoms:', error);
      res.status(500).json({ 
        error: 'Failed to analyze symptoms',
        message: 'Symptom analysis is temporarily unavailable.'
      });
    }
  }

  /**
   * Generate health predictions using AI
   */
  async generateHealthPredictions(req, res) {
    try {
      const { patientId, timeframe = '6m' } = req.params;

      // Get comprehensive patient data
      const [patient, symptoms, labResults, appointments] = await Promise.all([
        getQuery('SELECT * FROM patients WHERE id = $1', [patientId]),
        allQuery('SELECT * FROM symptomChecks WHERE patientId = $1 ORDER BY timestamp DESC LIMIT 20', [patientId]),
        allQuery('SELECT * FROM labResults WHERE patientId = $1 ORDER BY timestamp DESC LIMIT 10', [patientId]),
        allQuery('SELECT * FROM appointments WHERE patientId = $1 ORDER BY appointmentDate DESC LIMIT 5', [patientId])
      ]);

      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      // Prepare health twin data for AI analysis
      const healthTwinData = {
        patient: {
          age: patient.age,
          gender: patient.gender,
          chronicConditions: patient.chronicConditions || [],
          medications: patient.medications || [],
          riskFactors: patient.riskFactors || []
        },
        vitals: this.extractVitalsFromLabResults(labResults),
        symptoms: this.processSymptomHistory(symptoms),
        labResults: labResults.map(lab => ({
          testName: lab.testName,
          value: lab.value,
          date: lab.timestamp,
          status: lab.status
        })),
        lifestyle: {
          // This would come from patient lifestyle data
          exercise: 'moderate',
          diet: 'average',
          sleep: 7,
          stress: 'medium'
        }
      };

      // Generate AI predictions
      const predictions = await ollamaAI.analyzeHealthTrends(healthTwinData, timeframe);

      res.json({
        patientId,
        timeframe,
        predictions: predictions.predictions || [],
        trends: predictions.trends || [],
        risks: predictions.risks || [],
        interventions: predictions.interventions || [],
        confidence: predictions.confidence || 0.75,
        generatedAt: new Date().toISOString(),
        disclaimer: 'These predictions are based on AI analysis and should not replace professional medical advice.'
      });

    } catch (error) {
      logger.error('Error generating health predictions:', error);
      res.status(500).json({ 
        error: 'Failed to generate predictions',
        message: 'Health prediction service is temporarily unavailable.'
      });
    }
  }

  /**
   * Generate personalized health recommendations
   */
  async generateRecommendations(req, res) {
    try {
      const { patientId } = req.params;
      const { goals = [], preferences = {} } = req.body;

      // Get patient data
      const patient = await getQuery('SELECT * FROM patients WHERE id = $1', [patientId]);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      // Get recent health data
      const recentSymptoms = await allQuery(
        'SELECT * FROM symptomChecks WHERE patientId = $1 ORDER BY timestamp DESC LIMIT 5',
        [patientId]
      );

      const recentLabs = await allQuery(
        'SELECT * FROM labResults WHERE patientId = $1 ORDER BY timestamp DESC LIMIT 5',
        [patientId]
      );

      // Prepare patient profile
      const patientProfile = {
        age: patient.age,
        gender: patient.gender,
        chronicConditions: patient.chronicConditions || [],
        medications: patient.medications || [],
        allergies: patient.allergies || [],
        riskFactors: patient.riskFactors || []
      };

      // Current health status
      const currentHealth = {
        recentSymptoms: recentSymptoms.map(s => s.symptoms).flat(),
        labResults: recentLabs,
        overallStatus: this.calculateHealthStatus(patient, recentSymptoms, recentLabs)
      };

      // Generate AI recommendations
      const recommendations = await ollamaAI.generateHealthRecommendations(
        patientProfile,
        currentHealth,
        goals
      );

      res.json({
        patientId,
        recommendations: recommendations.recommendations || [],
        lifestyle: recommendations.lifestyle || [],
        medical: recommendations.medical || [],
        monitoring: recommendations.monitoring || [],
        priority: recommendations.priority || 'medium',
        confidence: recommendations.confidence || 0.8,
        generatedAt: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error generating recommendations:', error);
      res.status(500).json({ 
        error: 'Failed to generate recommendations',
        message: 'Recommendation service is temporarily unavailable.'
      });
    }
  }

  /**
   * Analyze uploaded health documents
   */
  async analyzeHealthDocument(req, res) {
    try {
      const { documentText, documentType = 'general', patientId } = req.body;

      if (!documentText) {
        return res.status(400).json({ error: 'Document text is required' });
      }

      // Analyze document with AI
      const analysis = await ollamaAI.analyzeHealthDocument(documentText, documentType);

      // Store analysis if patient ID provided
      if (patientId) {
        await this.storeDocumentAnalysis(patientId, documentType, analysis);
      }

      res.json({
        analysis: analysis.summary || '',
        keyFindings: analysis.findings || [],
        recommendations: analysis.recommendations || [],
        extractedData: analysis.data || {},
        confidence: analysis.confidence || 0.8,
        documentType,
        analyzedAt: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error analyzing health document:', error);
      res.status(500).json({ 
        error: 'Failed to analyze document',
        message: 'Document analysis service is temporarily unavailable.'
      });
    }
  }

  /**
   * Generate health education content
   */
  async generateHealthEducation(req, res) {
    try {
      const { topic, patientId, complexity = 'intermediate' } = req.body;

      if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
      }

      // Get patient profile for personalization
      let patientProfile = null;
      if (patientId) {
        const patient = await getQuery('SELECT * FROM patients WHERE id = $1', [patientId]);
        if (patient) {
          patientProfile = {
            age: patient.age,
            gender: patient.gender,
            chronicConditions: patient.chronicConditions || [],
            educationLevel: patient.educationLevel || 'intermediate'
          };
        }
      }

      // Generate educational content
      const education = await ollamaAI.generateHealthEducation(topic, patientProfile, complexity);

      res.json({
        topic,
        content: education.content || '',
        keyPoints: education.keyPoints || [],
        actionItems: education.actionItems || [],
        resources: education.resources || [],
        complexity,
        personalized: !!patientProfile,
        generatedAt: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error generating health education:', error);
      res.status(500).json({ 
        error: 'Failed to generate education content',
        message: 'Health education service is temporarily unavailable.'
      });
    }
  }

  /**
   * AI-powered health data analysis
   */
  async analyzeHealthDataPatterns(req, res) {
    try {
      const { patientId, analysisType = 'trends', timeRange = '3m' } = req.body;

      // Get patient health data
      const [symptoms, labResults, vitals] = await Promise.all([
        allQuery('SELECT * FROM symptomChecks WHERE patientId = $1 ORDER BY timestamp DESC', [patientId]),
        allQuery('SELECT * FROM labResults WHERE patientId = $1 ORDER BY timestamp DESC', [patientId]),
        // Add vitals query when table exists
        Promise.resolve([])
      ]);

      // Prepare data for analysis
      const healthData = {
        symptoms: symptoms,
        labResults: labResults,
        vitals: vitals,
        timeRange: timeRange
      };

      // Generate analysis with AI
      const analysis = await ollamaAI.analyzeHealthDataPatterns(healthData, analysisType);

      res.json({
        patientId,
        analysisType,
        timeRange,
        patterns: analysis.patterns || [],
        insights: analysis.insights || [],
        code: analysis.code || '', // Generated analysis code
        visualizations: analysis.visualizations || [],
        confidence: analysis.confidence || 0.8,
        analyzedAt: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error analyzing health data patterns:', error);
      res.status(500).json({ 
        error: 'Failed to analyze health data',
        message: 'Health data analysis service is temporarily unavailable.'
      });
    }
  }

  /**
   * Get AI service status and capabilities
   */
  async getAIStatus(req, res) {
    try {
      const [healthCheck, models, stats] = await Promise.all([
        ollamaAI.healthCheck(),
        ollamaAI.getAvailableModels(),
        ollamaAI.getModelStats()
      ]);

      res.json({
        status: healthCheck.status,
        capabilities: {
          medicalDiagnosis: true,
          healthPredictions: true,
          chatbot: true,
          documentAnalysis: true,
          healthEducation: true,
          dataAnalysis: true
        },
        models: {
          available: models.length,
          medical: models.filter(m => m.name.includes('meditron')).length > 0,
          chat: models.filter(m => m.name.includes('neural-chat')).length > 0,
          code: models.filter(m => m.name.includes('code')).length > 0
        },
        stats,
        lastCheck: healthCheck.timestamp
      });

    } catch (error) {
      logger.error('Error getting AI status:', error);
      res.status(500).json({ 
        error: 'Failed to get AI status',
        status: 'unknown'
      });
    }
  }

  // Helper methods
  async storeConversation(patientId, query, response) {
    try {
      // Store in conversations table (create if needed)
      // await query('INSERT INTO conversations (patientId, query, response, timestamp) VALUES ($1, $2, $3, $4)',
      //   [patientId, query, response, new Date()]);
    } catch (error) {
      logger.error('Error storing conversation:', error);
    }
  }

  async storeSymptomCheck(patientId, symptoms, diagnosis) {
    try {
      // Store in symptomChecks table
      // await query('INSERT INTO symptomChecks (patientId, symptoms, aiDiagnosis, timestamp) VALUES ($1, $2, $3, $4)',
      //   [patientId, JSON.stringify(symptoms), JSON.stringify(diagnosis), Date.now()]);
    } catch (error) {
      logger.error('Error storing symptom check:', error);
    }
  }

  async storeDocumentAnalysis(patientId, documentType, analysis) {
    try {
      // Store in documentAnalyses table (create if needed)
      // await query('INSERT INTO documentAnalyses (patientId, documentType, analysis, timestamp) VALUES ($1, $2, $3, $4)',
      //   [patientId, documentType, JSON.stringify(analysis), new Date()]);
    } catch (error) {
      logger.error('Error storing document analysis:', error);
    }
  }

  extractVitalsFromLabResults(labResults) {
    const vitals = {};
    
    labResults.forEach(lab => {
      const testName = lab.testName.toLowerCase();
      if (testName.includes('blood pressure')) {
        vitals.bloodPressure = lab.value;
      } else if (testName.includes('heart rate')) {
        vitals.heartRate = lab.value;
      } else if (testName.includes('temperature')) {
        vitals.temperature = lab.value;
      }
    });
    
    return vitals;
  }

  processSymptomHistory(symptoms) {
    return symptoms.map(symptom => ({
      symptoms: symptom.symptoms || [],
      timestamp: symptom.timestamp,
      severity: symptom.severity || 'moderate'
    }));
  }

  calculateHealthStatus(patient, symptoms, labResults) {
    // Simple health status calculation
    let score = 100;
    
    // Reduce score based on chronic conditions
    score -= (patient.chronicConditions?.length || 0) * 10;
    
    // Reduce score based on recent symptoms
    score -= symptoms.length * 5;
    
    // Adjust based on lab results
    const abnormalLabs = labResults.filter(lab => lab.status === 'abnormal').length;
    score -= abnormalLabs * 8;
    
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }
}

module.exports = new AIController();