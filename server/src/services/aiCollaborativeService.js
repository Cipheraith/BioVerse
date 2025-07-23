/**
 * AI-Human Collaborative Healthcare Service
 * Enables true collaboration between AI systems and healthcare providers
 */

const { predictive: logger } = require('./logger');
const { generatePredictiveInsights } = require('./aiPredictiveService');

/**
 * Stores feedback from healthcare providers to improve AI recommendations
 * @type {Map<string, Array>}
 */
const clinicianFeedbackStore = new Map();

/**
 * Generate collaborative health insights with explanation
 * @param {Object} patientData - Patient data including history and context
 * @param {Object} clinicianContext - Additional context from the clinician
 * @returns {Object} Collaborative insights with explanations
 */
const generateCollaborativeInsights = async (patientData, clinicianContext = {}) => {
  try {
    logger.info('Generating collaborative insights for patient');
    
    // Get base predictive insights
    const predictiveInsights = await generatePredictiveInsights(patientData);
    
    if (predictiveInsights.status !== 'success') {
      return predictiveInsights;
    }
    
    // Enhance with explanations and confidence levels
    const enhancedInsights = addExplanations(predictiveInsights.insights);
    
    // Incorporate clinician context if available
    if (Object.keys(clinicianContext).length > 0) {
      incorporateClinicianContext(enhancedInsights, clinicianContext);
    }
    
    // Generate alternative perspectives
    const alternativePerspectives = generateAlternatives(enhancedInsights);
    
    return {
      status: 'success',
      insights: enhancedInsights,
      alternativePerspectives,
      earlyWarnings: predictiveInsights.earlyWarnings,
      recommendations: generateCollaborativeRecommendations(
        enhancedInsights, 
        predictiveInsights.recommendations,
        clinicianContext
      ),
      explanations: {
        methodology: explainMethodology(enhancedInsights),
        dataFactors: explainDataFactors(patientData, enhancedInsights),
        limitations: identifyLimitations(patientData, enhancedInsights)
      }
    };
  } catch (error) {
    logger.error('Error generating collaborative insights:', error);
    return {
      status: 'error',
      message: 'Failed to generate collaborative insights',
      error: error.message
    };
  }
};

/**
 * Add explanations to predictive insights
 * @param {Object} insights - Base predictive insights
 * @returns {Object} Insights with explanations
 */
const addExplanations = (insights) => {
  const enhancedInsights = { ...insights };
  
  // Add explanation for health trajectory
  if (enhancedInsights.healthTrajectory) {
    enhancedInsights.trajectoryExplanation = explainTrajectory(enhancedInsights.healthTrajectory);
    enhancedInsights.trajectoryConfidence = calculateConfidence(enhancedInsights, 'trajectory');
  }
  
  // Add explanation for concern level
  if (enhancedInsights.overallConcernLevel) {
    enhancedInsights.concernExplanation = explainConcernLevel(enhancedInsights.overallConcernLevel);
    enhancedInsights.concernConfidence = calculateConfidence(enhancedInsights, 'concern');
  }
  
  // Add explanations for symptom insights
  if (enhancedInsights.symptomInsights) {
    enhancedInsights.symptomInsights.explanations = {};
    
    if (enhancedInsights.symptomInsights.recurringSymptoms) {
      enhancedInsights.symptomInsights.explanations.recurring = 
        explainRecurringSymptoms(enhancedInsights.symptomInsights.recurringSymptoms);
    }
    
    if (enhancedInsights.symptomInsights.patterns) {
      enhancedInsights.symptomInsights.explanations.patterns = 
        explainSymptomPatterns(enhancedInsights.symptomInsights.patterns);
    }
  }
  
  return enhancedInsights;
};

/**
 * Explain health trajectory assessment
 * @param {String} trajectory - Health trajectory assessment
 * @returns {String} Explanation of trajectory
 */
const explainTrajectory = (trajectory) => {
  switch (trajectory) {
    case 'improving':
      return 'Health indicators show positive trends over time, with symptoms decreasing in frequency or severity and vital signs moving toward normal ranges.';
    case 'declining':
      return 'Multiple health indicators show negative trends, with increasing symptom frequency or severity, or vital signs moving away from normal ranges.';
    case 'fluctuating':
      return 'Health indicators show mixed trends with some improvements and some declines, suggesting unstable health status.';
    case 'stable':
    default:
      return 'Health indicators remain relatively constant over the observed period, without significant improvement or decline.';
  }
};

/**
 * Explain concern level assessment
 * @param {String} concernLevel - Overall concern level
 * @returns {String} Explanation of concern level
 */
const explainConcernLevel = (concernLevel) => {
  switch (concernLevel) {
    case 'high':
      return 'Multiple high-priority health indicators suggest immediate attention is needed. This assessment is based on symptom patterns, vital sign trends, and risk factors.';
    case 'medium':
      return 'Some concerning health indicators were identified that warrant monitoring and potential intervention. This is based on moderate deviations in symptoms or vital signs.';
    case 'low':
    default:
      return 'Few or no concerning health indicators were identified. Current patterns suggest routine monitoring is appropriate.';
  }
};

/**
 * Explain recurring symptoms
 * @param {Array} recurringSymptoms - List of recurring symptoms
 * @returns {String} Explanation of recurring symptoms
 */
const explainRecurringSymptoms = (recurringSymptoms) => {
  if (!recurringSymptoms || recurringSymptoms.length === 0) {
    return 'No recurring symptoms identified.';
  }
  
  const worseningSymptoms = recurringSymptoms.filter(s => s.trend === 'worsening');
  const improvingSymptoms = recurringSymptoms.filter(s => s.trend === 'improving');
  const stableSymptoms = recurringSymptoms.filter(s => s.trend === 'stable');
  
  let explanation = 'Analysis of symptom history reveals: ';
  
  if (worseningSymptoms.length > 0) {
    explanation += `${worseningSymptoms.length} worsening symptoms (${worseningSymptoms.map(s => s.name).join(', ')}), `;
  }
  
  if (improvingSymptoms.length > 0) {
    explanation += `${improvingSymptoms.length} improving symptoms (${improvingSymptoms.map(s => s.name).join(', ')}), `;
  }
  
  if (stableSymptoms.length > 0) {
    explanation += `${stableSymptoms.length} stable symptoms (${stableSymptoms.map(s => s.name).join(', ')}), `;
  }
  
  // Remove trailing comma and space
  explanation = explanation.replace(/, $/, '');
  
  return explanation;
};

/**
 * Explain symptom patterns
 * @param {Array} patterns - Identified symptom patterns
 * @returns {String} Explanation of symptom patterns
 */
const explainSymptomPatterns = (patterns) => {
  if (!patterns || patterns.length === 0) {
    return 'No significant symptom patterns identified.';
  }
  
  const coOccurrences = patterns.filter(p => p.type === 'co_occurrence');
  const cyclical = patterns.filter(p => p.type === 'cyclical');
  
  let explanation = '';
  
  if (coOccurrences.length > 0) {
    explanation += 'Co-occurring symptoms: ';
    explanation += coOccurrences.map(p => 
      `${p.symptoms.join(' and ')} (observed ${p.frequency} times)`
    ).join('; ');
    explanation += '. ';
  }
  
  if (cyclical.length > 0) {
    explanation += 'Cyclical patterns: ';
    explanation += cyclical.map(p => 
      `${p.symptom} appears approximately every ${p.intervalDays} days`
    ).join('; ');
    explanation += '.';
  }
  
  return explanation;
};

/**
 * Calculate confidence level for insights
 * @param {Object} insights - Enhanced insights
 * @param {String} insightType - Type of insight
 * @returns {Number} Confidence level (0-1)
 */
const calculateConfidence = (insights, insightType) => {
  // Base confidence on data quality and quantity
  let confidence = 0.7; // Default moderate confidence
  
  switch (insightType) {
    case 'trajectory':
      // Adjust based on data points and consistency
      if (insights.symptomInsights && insights.symptomInsights.recurringSymptoms) {
        const symptoms = insights.symptomInsights.recurringSymptoms;
        if (symptoms.length >= 5) confidence += 0.1;
        if (symptoms.length >= 10) confidence += 0.1;
        
        // Check consistency of trends
        const trends = symptoms.map(s => s.trend);
        const uniqueTrends = new Set(trends);
        if (uniqueTrends.size === 1) confidence += 0.1; // All trends are the same
      }
      break;
      
    case 'concern':
      // Adjust based on vital signs and symptoms
      if (insights.vitalInsights && insights.vitalInsights.trends) {
        const vitalCount = Object.keys(insights.vitalInsights.trends).length;
        if (vitalCount >= 3) confidence += 0.1;
        if (vitalCount >= 5) confidence += 0.1;
      }
      break;
  }
  
  // Cap confidence at 0.95
  return Math.min(0.95, confidence);
};

/**
 * Incorporate clinician context into insights
 * @param {Object} insights - Enhanced insights
 * @param {Object} clinicianContext - Context provided by clinician
 */
const incorporateClinicianContext = (insights, clinicianContext) => {
  // Add clinician observations
  if (clinicianContext.observations) {
    insights.clinicianObservations = clinicianContext.observations;
  }
  
  // Adjust concern level based on clinician assessment if provided
  if (clinicianContext.concernLevel) {
    insights.clinicianConcernLevel = clinicianContext.concernLevel;
    
    // If clinician concern is higher, increase the overall concern
    if (getConcernLevel(clinicianContext.concernLevel) > getConcernLevel(insights.overallConcernLevel)) {
      insights.overallConcernLevel = clinicianContext.concernLevel;
      insights.concernAdjusted = true;
      insights.concernAdjustmentReason = 'Adjusted based on clinician assessment';
    }
  }
  
  // Add clinician notes on specific symptoms
  if (clinicianContext.symptomNotes && insights.symptomInsights) {
    insights.symptomInsights.clinicianNotes = clinicianContext.symptomNotes;
  }
};

/**
 * Get numeric value for concern level
 * @param {String} concernLevel - Concern level string
 * @returns {Number} Numeric value
 */
const getConcernLevel = (concernLevel) => {
  switch (concernLevel) {
    case 'critical': return 4;
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
};

/**
 * Generate alternative perspectives on the insights
 * @param {Object} insights - Enhanced insights
 * @returns {Array} Alternative perspectives
 */
const generateAlternatives = (insights) => {
  const alternatives = [];
  
  // Alternative 1: More conservative interpretation
  if (insights.overallConcernLevel !== 'low') {
    alternatives.push({
      type: 'conservative',
      description: 'A more conservative interpretation of the data',
      concernLevel: lowerConcernLevel(insights.overallConcernLevel),
      reasoning: 'This perspective places more weight on stable indicators and considers that some symptoms may be temporary or unrelated.'
    });
  }
  
  // Alternative 2: More cautious interpretation
  if (insights.overallConcernLevel !== 'critical') {
    alternatives.push({
      type: 'cautious',
      description: 'A more cautious interpretation of the data',
      concernLevel: raiseConcernLevel(insights.overallConcernLevel),
      reasoning: 'This perspective emphasizes potential risks and places more weight on concerning indicators, even if they are fewer in number.'
    });
  }
  
  // Alternative 3: Longer-term view
  alternatives.push({
    type: 'longitudinal',
    description: 'A longer-term perspective on health trajectory',
    reasoning: 'This perspective considers longer-term patterns and places current indicators in the context of the patient\'s overall health history.'
  });
  
  return alternatives;
};

/**
 * Lower the concern level by one step
 * @param {String} concernLevel - Current concern level
 * @returns {String} Lower concern level
 */
const lowerConcernLevel = (concernLevel) => {
  switch (concernLevel) {
    case 'critical': return 'high';
    case 'high': return 'medium';
    case 'medium': return 'low';
    default: return 'low';
  }
};

/**
 * Raise the concern level by one step
 * @param {String} concernLevel - Current concern level
 * @returns {String} Higher concern level
 */
const raiseConcernLevel = (concernLevel) => {
  switch (concernLevel) {
    case 'low': return 'medium';
    case 'medium': return 'high';
    case 'high': return 'critical';
    default: return 'critical';
  }
};

/**
 * Generate collaborative recommendations
 * @param {Object} insights - Enhanced insights
 * @param {Array} baseRecommendations - Base recommendations
 * @param {Object} clinicianContext - Clinician context
 * @returns {Array} Collaborative recommendations
 */
const generateCollaborativeRecommendations = (insights, baseRecommendations, clinicianContext) => {
  let recommendations = [...baseRecommendations];
  
  // Add explanation for each recommendation
  recommendations = recommendations.map(rec => {
    return {
      recommendation: rec,
      explanation: generateRecommendationExplanation(rec, insights)
    };
  });
  
  // Add clinician recommendations if available
  if (clinicianContext.recommendations && clinicianContext.recommendations.length > 0) {
    recommendations.push(...clinicianContext.recommendations.map(rec => {
      return {
        recommendation: rec,
        source: 'clinician',
        explanation: 'Based on clinician assessment'
      };
    }));
  }
  
  // Add collaborative recommendations
  if (insights.symptomInsights && insights.symptomInsights.recurringSymptoms) {
    const worseningSymptoms = insights.symptomInsights.recurringSymptoms.filter(s => s.trend === 'worsening');
    
    if (worseningSymptoms.length > 0) {
      recommendations.push({
        recommendation: 'Consider collaborative monitoring plan for worsening symptoms',
        explanation: 'AI and healthcare provider should jointly monitor these specific symptoms',
        collaborative: true
      });
    }
  }
  
  return recommendations;
};

/**
 * Generate explanation for a recommendation
 * @param {String} recommendation - Recommendation text
 * @param {Object} insights - Enhanced insights
 * @returns {String} Explanation
 */
const generateRecommendationExplanation = (recommendation, insights) => {
  // Simple pattern matching for common recommendations
  if (recommendation.includes('monitor') && recommendation.includes('symptoms')) {
    return 'Regular symptom monitoring helps detect changes in health status early.';
  }
  
  if (recommendation.includes('medical') && recommendation.includes('attention')) {
    return `Based on ${insights.overallConcernLevel} concern level and presence of potentially serious symptoms.`;
  }
  
  if (recommendation.includes('lifestyle')) {
    return 'Lifestyle modifications can address underlying risk factors and improve overall health outcomes.';
  }
  
  // Default explanation
  return 'Based on analysis of health data and identified patterns.';
};

/**
 * Explain the methodology used for generating insights
 * @param {Object} insights - Enhanced insights
 * @returns {Object} Methodology explanation
 */
const explainMethodology = (insights) => {
  return {
    dataAnalysis: 'Time series analysis of symptoms and vital signs to identify patterns and trends',
    riskAssessment: 'Multi-factor risk assessment incorporating patient history and current health status',
    predictionModel: 'Hybrid statistical and rule-based model for health trajectory prediction',
    confidenceCalculation: 'Confidence scores based on data quality, quantity, and consistency'
  };
};

/**
 * Explain which data factors influenced the insights
 * @param {Object} patientData - Patient data
 * @param {Object} insights - Enhanced insights
 * @returns {Object} Data factor explanations
 */
const explainDataFactors = (patientData, insights) => {
  const factors = {
    symptoms: [],
    vitals: [],
    history: [],
    demographics: []
  };
  
  // Identify influential symptoms
  if (insights.symptomInsights && insights.symptomInsights.recurringSymptoms) {
    factors.symptoms = insights.symptomInsights.recurringSymptoms
      .filter(s => s.frequency > 1)
      .map(s => `${s.name} (occurred ${s.frequency} times, trend: ${s.trend})`);
  }
  
  // Identify influential vital signs
  if (insights.vitalInsights && insights.vitalInsights.trends) {
    Object.entries(insights.vitalInsights.trends).forEach(([vitalType, data]) => {
      if (data.concernLevel !== 'low') {
        factors.vitals.push(`${vitalType} (${data.trendDirection} trend, concern: ${data.concernLevel})`);
      }
    });
  }
  
  // Identify influential history factors
  if (patientData.medicalHistory && patientData.medicalHistory.length > 0) {
    factors.history = patientData.medicalHistory.map(item => 
      `${item.condition} (diagnosed ${item.diagnosisYear || 'unknown'})`
    );
  }
  
  // Identify influential demographic factors
  if (patientData.age) {
    if (patientData.age < 12) {
      factors.demographics.push('Pediatric patient (age < 12)');
    } else if (patientData.age > 65) {
      factors.demographics.push('Elderly patient (age > 65)');
    }
  }
  
  if (patientData.gender) {
    factors.demographics.push(`Gender: ${patientData.gender}`);
  }
  
  return factors;
};/**
 * Id
entify limitations in the analysis
 * @param {Object} patientData - Patient data
 * @param {Object} insights - Enhanced insights
 * @returns {Array} List of limitations
 */
const identifyLimitations = (patientData, insights) => {
  const limitations = [];
  
  // Check data quantity
  if (!patientData.history || patientData.history.length < 5) {
    limitations.push('Limited historical data may reduce prediction accuracy');
  }
  
  // Check data recency
  if (patientData.history && patientData.history.length > 0) {
    const latestEntry = new Date(patientData.history[patientData.history.length - 1].timestamp);
    const now = new Date();
    const daysSinceLastEntry = Math.floor((now - latestEntry) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastEntry > 30) {
      limitations.push(`Data may be outdated (last entry was ${daysSinceLastEntry} days ago)`);
    }
  }
  
  // Check for missing vital signs
  const essentialVitals = ['heart_rate', 'blood_pressure_systolic', 'blood_pressure_diastolic'];
  if (!insights.vitalInsights || !insights.vitalInsights.trends) {
    limitations.push('No vital sign data available for analysis');
  } else {
    const missingVitals = essentialVitals.filter(vital => 
      !insights.vitalInsights.trends[vital]
    );
    
    if (missingVitals.length > 0) {
      limitations.push(`Missing key vital signs: ${missingVitals.join(', ')}`);
    }
  }
  
  // Check for potential confounding factors
  if (patientData.medications && patientData.medications.length > 0) {
    limitations.push('Medications may influence symptom patterns and vital signs');
  }
  
  // Check for data consistency
  if (insights.symptomInsights && 
      insights.symptomInsights.recurringSymptoms && 
      insights.vitalInsights && 
      insights.vitalInsights.trends) {
    
    // Check if symptom trends and vital trends are contradictory
    const symptomTrend = insights.healthTrajectory;
    const vitalConcern = insights.vitalInsights.status;
    
    if ((symptomTrend === 'improving' && vitalConcern === 'high_concern') ||
        (symptomTrend === 'declining' && vitalConcern === 'stable')) {
      limitations.push('Contradictory trends between symptoms and vital signs may indicate data inconsistency');
    }
  }
  
  return limitations;
};

/**
 * Store clinician feedback for model improvement
 * @param {String} patientId - Patient ID
 * @param {Object} insights - Generated insights
 * @param {Object} feedback - Clinician feedback
 * @returns {Boolean} Success status
 */
const storeFeedback = (patientId, insights, feedback) => {
  try {
    if (!clinicianFeedbackStore.has(patientId)) {
      clinicianFeedbackStore.set(patientId, []);
    }
    
    clinicianFeedbackStore.get(patientId).push({
      timestamp: new Date().toISOString(),
      insights,
      feedback,
    });
    
    logger.info(`Stored clinician feedback for patient ${patientId}`);
    return true;
  } catch (error) {
    logger.error(`Error storing clinician feedback: ${error.message}`);
    return false;
  }
};

/**
 * Get stored feedback for a patient
 * @param {String} patientId - Patient ID
 * @returns {Array} Feedback history
 */
const getFeedbackHistory = (patientId) => {
  return clinicianFeedbackStore.get(patientId) || [];
};

module.exports = {
  generateCollaborativeInsights,
  storeFeedback,
  getFeedbackHistory
};