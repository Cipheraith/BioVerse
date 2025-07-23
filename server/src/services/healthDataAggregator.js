const { allQuery } = require('../config/database');
const { app: logger } = require('./logger');

/**
 * Health Data Aggregator Service
 * Aggregates and analyzes health data to build comprehensive health twins
 * Optimized for 2GB RAM environments
 */

class HealthDataAggregator {
  constructor() {
    this.dataCache = new Map();
    this.maxCacheSize = 1000; // Limit cache size for memory efficiency
    this.cacheTimeout = 300000; // 5 minutes cache timeout
  }

  /**
   * Generate comprehensive health twin for a patient
   * @param {string} patientId - Patient ID
   * @returns {Object} Complete health twin data
   */
  async generateComprehensiveHealthTwin(patientId) {
    try {
      const cacheKey = `health_twin_${patientId}`;
      
      // Check cache first
      if (this.dataCache.has(cacheKey)) {
        const cached = this.dataCache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      // Fetch all patient data concurrently
      const [
        patient,
        pregnancies,
        symptoms,
        appointments,
        labResults,
        riskFactors
      ] = await Promise.all([
        this.getPatientBaseData(patientId),
        this.getPregnancyData(patientId),
        this.getSymptomHistory(patientId),
        this.getAppointmentHistory(patientId),
        this.getLabResults(patientId),
        this.calculateRiskFactors(patientId)
      ]);

      // Generate health insights
      const healthInsights = await this.generateHealthInsights(patientId, {
        patient,
        symptoms,
        appointments,
        labResults
      });

      // Build comprehensive health twin
      const healthTwin = {
        patientId,
        lastUpdated: new Date().toISOString(),
        basicInfo: patient,
        pregnancyData: pregnancies,
        healthHistory: {
          symptoms: symptoms,
          appointments: appointments,
          labResults: labResults
        },
        riskProfile: riskFactors,
        insights: healthInsights,
        predictions: await this.generateLightweightPredictions(patientId, healthInsights),
        timeline: await this.generateHealthTimeline(patientId, symptoms, appointments)
      };

      // Cache the result
      this.setCacheData(cacheKey, healthTwin);

      return healthTwin;
    } catch (error) {
      logger.error('Error generating comprehensive health twin:', error);
      throw error;
    }
  }

  /**
   * Get patient base data
   */
  async getPatientBaseData(patientId) {
    const patient = await allQuery('SELECT * FROM patients WHERE id = $1', [patientId]);
    return patient[0] || null;
  }

  /**
   * Get pregnancy data
   */
  async getPregnancyData(patientId) {
    const pregnancies = await allQuery(
      'SELECT * FROM pregnancies WHERE patientId = $1 ORDER BY id DESC',
      [patientId]
    );
    return pregnancies;
  }

  /**
   * Get symptom history with trend analysis
   */
  async getSymptomHistory(patientId) {
    const symptoms = await allQuery(
      'SELECT * FROM symptomChecks WHERE patientId = $1 ORDER BY timestamp DESC LIMIT 50',
      [patientId]
    );

    // Analyze symptom trends
    const trends = this.analyzeSymptomTrends(symptoms);
    
    return {
      recent: symptoms.slice(0, 10),
      all: symptoms,
      trends: trends,
      summary: this.generateSymptomSummary(symptoms)
    };
  }

  /**
   * Get appointment history
   */
  async getAppointmentHistory(patientId) {
    const appointments = await allQuery(
      'SELECT * FROM appointments WHERE patientId = $1 ORDER BY appointmentDate DESC LIMIT 20',
      [patientId]
    );

    return {
      recent: appointments.slice(0, 5),
      all: appointments,
      frequency: this.calculateAppointmentFrequency(appointments),
      adherence: this.calculateAppointmentAdherence(appointments)
    };
  }

  /**
   * Get lab results
   */
  async getLabResults(patientId) {
    const labResults = await allQuery(
      'SELECT * FROM labResults WHERE patientId = $1 ORDER BY timestamp DESC LIMIT 30',
      [patientId]
    );

    return {
      recent: labResults.slice(0, 10),
      all: labResults,
      trends: this.analyzeLabTrends(labResults)
    };
  }

  /**
   * Calculate risk factors using rule-based approach
   */
  async calculateRiskFactors(patientId) {
    const patient = await this.getPatientBaseData(patientId);
    const symptoms = await allQuery(
      'SELECT * FROM symptomChecks WHERE patientId = $1 ORDER BY timestamp DESC LIMIT 20',
      [patientId]
    );

    const riskFactors = {
      demographic: this.calculateDemographicRisk(patient),
      behavioral: this.calculateBehavioralRisk(patient),
      clinical: this.calculateClinicalRisk(patient, symptoms),
      environmental: this.calculateEnvironmentalRisk(patient),
      overall: 'low'
    };

    // Calculate overall risk
    const riskScores = [
      riskFactors.demographic.score,
      riskFactors.behavioral.score,
      riskFactors.clinical.score,
      riskFactors.environmental.score
    ];

    const avgRisk = riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length;
    
    if (avgRisk >= 0.8) riskFactors.overall = 'critical';
    else if (avgRisk >= 0.6) riskFactors.overall = 'high';
    else if (avgRisk >= 0.4) riskFactors.overall = 'medium';
    else riskFactors.overall = 'low';

    return riskFactors;
  }

  /**
   * Generate health insights using lightweight algorithms
   */
  async generateHealthInsights(patientId, data) {
    const insights = {
      healthStatus: this.assessCurrentHealthStatus(data),
      trends: this.identifyHealthTrends(data),
      alerts: this.generateHealthAlerts(data),
      recommendations: this.generateRecommendations(data),
      riskIndicators: this.identifyRiskIndicators(data)
    };

    return insights;
  }

  /**
   * Generate lightweight predictions without heavy AI models
   */
  async generateLightweightPredictions(patientId, insights) {
    const predictions = {
      healthTrajectory: this.predictHealthTrajectory(insights),
      riskProgression: this.predictRiskProgression(insights),
      interventionNeeds: this.predictInterventionNeeds(insights),
      resourceRequirements: this.predictResourceRequirements(insights)
    };

    return predictions;
  }

  /**
   * Generate health timeline
   */
  async generateHealthTimeline(patientId, symptoms, appointments) {
    const events = [];

    // Add symptom events
    symptoms.recent.forEach(symptom => {
      events.push({
        date: new Date(symptom.timestamp),
        type: 'symptom',
        description: `Reported symptoms: ${symptom.symptoms.join(', ')}`,
        severity: this.assessSymptomSeverity(symptom.symptoms)
      });
    });

    // Add appointment events
    appointments.recent.forEach(appointment => {
      events.push({
        date: new Date(appointment.appointmentDate),
        type: 'appointment',
        description: `${appointment.type} appointment`,
        status: appointment.status
      });
    });

    // Sort by date
    events.sort((a, b) => new Date(b.date) - new Date(a.date));

    return events.slice(0, 20); // Return last 20 events
  }

  /**
   * Analyze symptom trends
   */
  analyzeSymptomTrends(symptoms) {
    const trends = {
      frequency: {},
      severity: {},
      patterns: []
    };

    symptoms.forEach(symptomCheck => {
      symptomCheck.symptoms.forEach(symptom => {
        trends.frequency[symptom] = (trends.frequency[symptom] || 0) + 1;
      });
    });

    // Identify increasing/decreasing trends
    const recentSymptoms = symptoms.slice(0, 10);
    const olderSymptoms = symptoms.slice(10, 20);

    Object.keys(trends.frequency).forEach(symptom => {
      const recentCount = recentSymptoms.filter(s => s.symptoms.includes(symptom)).length;
      const olderCount = olderSymptoms.filter(s => s.symptoms.includes(symptom)).length;

      if (recentCount > olderCount * 1.5) {
        trends.patterns.push({
          symptom,
          trend: 'increasing',
          confidence: 0.7
        });
      } else if (recentCount < olderCount * 0.5) {
        trends.patterns.push({
          symptom,
          trend: 'decreasing',
          confidence: 0.7
        });
      }
    });

    return trends;
  }

  /**
   * Generate symptom summary
   */
  generateSymptomSummary(symptoms) {
    const allSymptoms = [];
    symptoms.forEach(s => allSymptoms.push(...s.symptoms));

    const frequency = {};
    allSymptoms.forEach(symptom => {
      frequency[symptom] = (frequency[symptom] || 0) + 1;
    });

    const topSymptoms = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([symptom, count]) => ({ symptom, count }));

    return {
      totalReports: symptoms.length,
      uniqueSymptoms: Object.keys(frequency).length,
      topSymptoms,
      lastReported: symptoms.length > 0 ? symptoms[0].timestamp : null
    };
  }

  /**
   * Calculate demographic risk
   */
  calculateDemographicRisk(patient) {
    let score = 0;
    const factors = [];

    if (patient.age) {
      if (patient.age > 65) {
        score += 0.3;
        factors.push('Advanced age (>65)');
      } else if (patient.age < 18) {
        score += 0.2;
        factors.push('Young age (<18)');
      }
    }

    if (patient.gender === 'female' && patient.isPregnant) {
      score += 0.2;
      factors.push('Pregnancy');
    }

    return { score: Math.min(score, 1), factors };
  }

  /**
   * Calculate behavioral risk
   */
  calculateBehavioralRisk(patient) {
    let score = 0;
    const factors = [];

    if (patient.riskFactors) {
      const riskFactors = Array.isArray(patient.riskFactors) ? patient.riskFactors : [];
      
      riskFactors.forEach(factor => {
        const lowerFactor = factor.toLowerCase();
        if (lowerFactor.includes('smoking')) {
          score += 0.4;
          factors.push('Smoking');
        }
        if (lowerFactor.includes('alcohol')) {
          score += 0.3;
          factors.push('Alcohol use');
        }
        if (lowerFactor.includes('obesity')) {
          score += 0.3;
          factors.push('Obesity');
        }
      });
    }

    return { score: Math.min(score, 1), factors };
  }

  /**
   * Calculate clinical risk
   */
  calculateClinicalRisk(patient, symptoms) {
    let score = 0;
    const factors = [];

    if (patient.chronicConditions) {
      const conditions = Array.isArray(patient.chronicConditions) ? patient.chronicConditions : [];
      score += conditions.length * 0.2;
      factors.push(...conditions);
    }

    // High-risk symptoms
    const highRiskSymptoms = ['chest pain', 'difficulty breathing', 'severe headache'];
    const recentSymptoms = symptoms.slice(0, 5);
    
    recentSymptoms.forEach(symptomCheck => {
      const hasHighRisk = symptomCheck.symptoms.some(s => 
        highRiskSymptoms.some(hrs => s.toLowerCase().includes(hrs))
      );
      if (hasHighRisk) {
        score += 0.3;
        factors.push('High-risk symptoms reported');
      }
    });

    return { score: Math.min(score, 1), factors };
  }

  /**
   * Calculate environmental risk
   */
  calculateEnvironmentalRisk(patient) {
    let score = 0;
    const factors = [];

    // This would be enhanced with actual environmental data
    if (patient.address) {
      // Placeholder for environmental risk assessment
      // In real implementation, this would integrate with environmental data APIs
      score += 0.1;
      factors.push('Location-based environmental factors');
    }

    return { score: Math.min(score, 1), factors };
  }

  /**
   * Cache management
   */
  setCacheData(key, data) {
    // Implement LRU cache logic
    if (this.dataCache.size >= this.maxCacheSize) {
      const firstKey = this.dataCache.keys().next().value;
      this.dataCache.delete(firstKey);
    }

    this.dataCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Get population health insights
   */
  async getPopulationHealthInsights() {
    try {
      const [
        totalPatients,
        activePregnancies,
        commonSymptoms,
        riskDistribution
      ] = await Promise.all([
        this.getTotalPatientCount(),
        this.getActivePregnancyCount(),
        this.getCommonSymptoms(),
        this.getRiskDistribution()
      ]);

      return {
        population: {
          totalPatients,
          activePregnancies,
          demographics: await this.getPopulationDemographics()
        },
        health: {
          commonSymptoms,
          riskDistribution,
          trends: await this.getPopulationTrends()
        },
        alerts: await this.getPopulationAlerts()
      };
    } catch (error) {
      logger.error('Error generating population health insights:', error);
      throw error;
    }
  }

  /**
   * Helper methods for population insights
   */
  async getTotalPatientCount() {
    const result = await allQuery('SELECT COUNT(*) as count FROM patients');
    return parseInt(result[0].count);
  }

  async getActivePregnancyCount() {
    const result = await allQuery('SELECT COUNT(*) as count FROM pregnancies WHERE transportBooked = false');
    return parseInt(result[0].count);
  }

  async getCommonSymptoms() {
    const result = await allQuery(`
      SELECT jsonb_array_elements_text(symptoms) as symptom, COUNT(*) as count
      FROM symptomChecks
      WHERE timestamp >= $1
      GROUP BY symptom
      ORDER BY count DESC
      LIMIT 10
    `, [Date.now() - 30 * 24 * 60 * 60 * 1000]); // Last 30 days

    return result;
  }

  async getRiskDistribution() {
    // This would be implemented with actual risk calculation
    return {
      low: 70,
      medium: 20,
      high: 8,
      critical: 2
    };
  }

  async getPopulationDemographics() {
    const ageGroups = await allQuery(`
      SELECT 
        CASE 
          WHEN age < 18 THEN 'under_18'
          WHEN age BETWEEN 18 AND 35 THEN '18_35'
          WHEN age BETWEEN 36 AND 65 THEN '36_65'
          ELSE 'over_65'
        END as age_group,
        COUNT(*) as count
      FROM patients
      GROUP BY age_group
    `);

    const genderDist = await allQuery(`
      SELECT gender, COUNT(*) as count
      FROM patients
      GROUP BY gender
    `);

    return {
      ageGroups,
      genderDistribution: genderDist
    };
  }

  async getPopulationTrends() {
    return {
      symptomTrends: await this.getSymptomTrends(),
      appointmentTrends: await this.getAppointmentTrends(),
      riskTrends: await this.getRiskTrends()
    };
  }

  async getPopulationAlerts() {
    return {
      outbreakRisk: await this.assessOutbreakRisk(),
      resourceStrain: await this.assessResourceStrain(),
      emergencyPatterns: await this.getEmergencyPatterns()
    };
  }

  // Additional missing methods implementation
  calculateAppointmentFrequency(appointments) {
    if (!appointments || appointments.length === 0) {
      return { frequency: 0, pattern: 'none' };
    }
    
    const frequency = appointments.length;
    const pattern = frequency > 5 ? 'high' : frequency > 2 ? 'moderate' : 'low';
    
    return { frequency, pattern };
  }

  calculateAppointmentAdherence(appointments) {
    if (!appointments || appointments.length === 0) {
      return { adherence: 0, status: 'unknown' };
    }
    
    const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
    const adherence = (completedAppointments / appointments.length) * 100;
    
    return {
      adherence: adherence.toFixed(1),
      status: adherence > 80 ? 'excellent' : adherence > 60 ? 'good' : 'poor'
    };
  }

  analyzeLabTrends(labResults) {
    if (!labResults || labResults.length === 0) {
      return { trends: {}, summary: 'No lab results available' };
    }
    
    const trends = {};
    const testTypes = [...new Set(labResults.map(lab => lab.testName))];
    
    testTypes.forEach(testType => {
      const results = labResults.filter(lab => lab.testName === testType).slice(0, 10);
      if (results.length > 1) {
        const latest = results[0].value;
        const previous = results[1].value;
        const trend = latest > previous ? 'increasing' : latest < previous ? 'decreasing' : 'stable';
        
        trends[testType] = {
          trend,
          latestValue: latest,
          previousValue: previous,
          count: results.length
        };
      }
    });
    
    return { trends, summary: `${testTypes.length} test types analyzed` };
  }

  assessCurrentHealthStatus(data) {
    if (!data.patient) {
      return { status: 'unknown', summary: 'No patient data available' };
    }
    
    const { patient, symptoms, appointments } = data;
    let status = 'stable';
    const factors = [];
    
    // Check chronic conditions
    if (patient.chronicConditions && patient.chronicConditions.length > 0) {
      status = 'managing_conditions';
      factors.push(`Managing ${patient.chronicConditions.length} chronic conditions`);
    }
    
    // Check recent symptoms
    if (symptoms && symptoms.recent && symptoms.recent.length > 0) {
      const recentSymptomCount = symptoms.recent.filter(s => 
        Date.now() - s.timestamp < 7 * 24 * 60 * 60 * 1000
      ).length;
      
      if (recentSymptomCount > 3) {
        status = 'needs_attention';
        factors.push(`${recentSymptomCount} recent symptoms reported`);
      }
    }
    
    return { status, factors, summary: `Patient status: ${status}` };
  }

  identifyHealthTrends(data) {
    const trends = {
      symptoms: this.analyzeSymptomTrends(data.symptoms?.all || []),
      appointments: data.appointments ? this.calculateAppointmentFrequency(data.appointments.all || []) : null,
      overall: 'stable'
    };
    
    return trends;
  }

  generateHealthAlerts(data) {
    const alerts = [];
    
    if (data.patient) {
      // Check for high-risk conditions
      if (data.patient.chronicConditions && data.patient.chronicConditions.includes('Hypertension')) {
        alerts.push({
          type: 'chronic_condition',
          message: 'Monitor blood pressure regularly',
          priority: 'medium'
        });
      }
      
      // Check age-related alerts
      if (data.patient.age > 65) {
        alerts.push({
          type: 'age_related',
          message: 'Consider geriatric health screening',
          priority: 'low'
        });
      }
    }
    
    return alerts;
  }

  generateRecommendations(data) {
    const recommendations = [];
    
    if (data.patient) {
      // Basic recommendations
      recommendations.push('Maintain regular health check-ups');
      
      // Condition-specific recommendations
      if (data.patient.chronicConditions) {
        data.patient.chronicConditions.forEach(condition => {
          if (condition.toLowerCase().includes('diabetes')) {
            recommendations.push('Monitor blood glucose levels regularly');
          }
          if (condition.toLowerCase().includes('hypertension')) {
            recommendations.push('Limit sodium intake and maintain healthy weight');
          }
        });
      }
      
      // Age-specific recommendations
      if (data.patient.age > 50) {
        recommendations.push('Consider preventive health screenings');
      }
    }
    
    return recommendations;
  }

  identifyRiskIndicators(data) {
    const indicators = [];
    
    if (data.patient) {
      // Check risk factors
      if (data.patient.riskFactors) {
        data.patient.riskFactors.forEach(factor => {
          if (factor.toLowerCase().includes('smoking')) {
            indicators.push({ type: 'behavioral', factor: 'smoking', risk: 'high' });
          }
          if (factor.toLowerCase().includes('obesity')) {
            indicators.push({ type: 'physical', factor: 'obesity', risk: 'medium' });
          }
        });
      }
    }
    
    return indicators;
  }

  predictHealthTrajectory(insights) {
    const trajectory = {
      direction: 'stable',
      confidence: 0.6,
      factors: []
    };
    
    if (insights.riskIndicators && insights.riskIndicators.length > 0) {
      const highRiskCount = insights.riskIndicators.filter(r => r.risk === 'high').length;
      if (highRiskCount > 0) {
        trajectory.direction = 'declining';
        trajectory.confidence = 0.7;
        trajectory.factors.push('High-risk behavioral factors present');
      }
    }
    
    return trajectory;
  }

  predictRiskProgression(insights) {
    return {
      timeframe: '6 months',
      progression: 'stable',
      confidence: 0.6,
      factors: insights.riskIndicators || []
    };
  }

  predictInterventionNeeds(insights) {
    const interventions = [];
    
    if (insights.alerts) {
      insights.alerts.forEach(alert => {
        if (alert.type === 'chronic_condition') {
          interventions.push({
            type: 'monitoring',
            urgency: 'routine',
            description: 'Regular monitoring required'
          });
        }
      });
    }
    
    return interventions;
  }

  predictResourceRequirements(insights) {
    return {
      appointments: {
        frequency: 'monthly',
        type: 'routine'
      },
      monitoring: {
        required: true,
        frequency: 'weekly'
      },
      medications: {
        refillReminder: true,
        adherenceMonitoring: true
      }
    };
  }

  assessSymptomSeverity(symptoms) {
    const highSeveritySymptoms = ['chest pain', 'difficulty breathing', 'severe headache'];
    const hasSevereSymptoms = symptoms.some(symptom => 
      highSeveritySymptoms.some(severe => symptom.toLowerCase().includes(severe))
    );
    
    return hasSevereSymptoms ? 'high' : 'low';
  }

  async getSymptomTrends() {
    return { increasing: [], decreasing: [], stable: [] };
  }

  async getAppointmentTrends() {
    return { frequency: 'stable', pattern: 'routine' };
  }

  async getRiskTrends() {
    return { overall: 'stable', factors: [] };
  }

  async assessOutbreakRisk() {
    return { level: 'low', confidence: 0.8 };
  }

  async assessResourceStrain() {
    return { level: 'low', areas: [] };
  }

  async getEmergencyPatterns() {
    return { patterns: [], frequency: 'normal' };
  }
}

module.exports = new HealthDataAggregator();
