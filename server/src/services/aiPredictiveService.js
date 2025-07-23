const { predictive: logger } = require('./logger');
const { analyzeSymptoms, assessHealthRisk } = require('./aiService');

// Configuration for predictive service
const PREDICTION_CONFIDENCE_THRESHOLD = 0.7;
const TREND_ANALYSIS_MIN_DATA_POINTS = 3;
const HIGH_RISK_THRESHOLD = 0.8;

/**
 * Analyze patient data for predictive insights
 * @param {Object} patientData - Patient data including history, vitals, and symptoms
 * @returns {Object} Predictive analysis results
 */
const generatePredictiveInsights = async (patientData) => {
  try {
    logger.info('Generating predictive insights for patient');
    
    // Ensure we have enough data for meaningful predictions
    if (!patientData || !patientData.history || patientData.history.length < TREND_ANALYSIS_MIN_DATA_POINTS) {
      return {
        status: 'insufficient_data',
        message: 'Not enough historical data for predictive analysis',
        recommendations: ['Continue recording health data for more accurate predictions']
      };
    }

    // Extract relevant data for analysis
    const symptoms = extractSymptomHistory(patientData);
    const vitals = extractVitalHistory(patientData);
    const riskFactors = patientData.riskFactors || [];
    
    // Generate different types of insights
    const [symptomTrends, vitalTrends, riskAssessment] = await Promise.all([
      analyzeSymptomTrends(symptoms),
      analyzeVitalTrends(vitals),
      assessHealthRisk(patientData)
    ]);

    // Combine insights into comprehensive analysis
    const combinedInsights = combineInsights(symptomTrends, vitalTrends, riskAssessment);
    
    // Generate early warnings if applicable
    const earlyWarnings = generateEarlyWarnings(combinedInsights, patientData);
    
    return {
      status: 'success',
      insights: combinedInsights,
      earlyWarnings,
      recommendations: generateRecommendations(combinedInsights, earlyWarnings),
      nextSteps: suggestNextSteps(combinedInsights, patientData)
    };
  } catch (error) {
    logger.error('Error generating predictive insights:', error);
    return {
      status: 'error',
      message: 'Failed to generate predictive insights',
      error: error.message
    };
  }
};

/**
 * Extract symptom history from patient data
 * @param {Object} patientData - Patient data
 * @returns {Array} Symptom history with timestamps
 */
const extractSymptomHistory = (patientData) => {
  if (!patientData.history) return [];
  
  return patientData.history
    .filter(entry => entry.symptoms && entry.symptoms.length > 0)
    .map(entry => ({
      timestamp: entry.timestamp || entry.date,
      symptoms: entry.symptoms,
      severity: entry.severity || 'medium'
    }))
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};

/**
 * Extract vital sign history from patient data
 * @param {Object} patientData - Patient data
 * @returns {Array} Vital sign history with timestamps
 */
const extractVitalHistory = (patientData) => {
  if (!patientData.history) return [];
  
  return patientData.history
    .filter(entry => entry.vitals)
    .map(entry => ({
      timestamp: entry.timestamp || entry.date,
      vitals: entry.vitals
    }))
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};

/**
 * Analyze symptom trends over time
 * @param {Array} symptomHistory - History of symptoms
 * @returns {Object} Symptom trend analysis
 */
const analyzeSymptomTrends = async (symptomHistory) => {
  if (symptomHistory.length < TREND_ANALYSIS_MIN_DATA_POINTS) {
    return { status: 'insufficient_data' };
  }
  
  // Count symptom occurrences
  const symptomFrequency = {};
  symptomHistory.forEach(entry => {
    entry.symptoms.forEach(symptom => {
      symptomFrequency[symptom] = (symptomFrequency[symptom] || 0) + 1;
    });
  });
  
  // Identify recurring symptoms
  const recurringSymptoms = Object.keys(symptomFrequency)
    .filter(symptom => symptomFrequency[symptom] > 1)
    .map(symptom => ({
      name: symptom,
      frequency: symptomFrequency[symptom],
      trend: calculateSymptomTrend(symptom, symptomHistory)
    }));
  
  // Identify symptom patterns
  const patterns = identifySymptomPatterns(symptomHistory);
  
  return {
    recurringSymptoms,
    patterns,
    trendDirection: determineTrendDirection(recurringSymptoms),
    concernLevel: calculateConcernLevel(recurringSymptoms, patterns)
  };
};

/**
 * Calculate trend for a specific symptom
 * @param {String} symptom - Symptom name
 * @param {Array} history - Symptom history
 * @returns {String} Trend direction
 */
const calculateSymptomTrend = (symptom, history) => {
  // Get only entries containing this symptom
  const relevantEntries = history.filter(entry => 
    entry.symptoms.includes(symptom)
  );
  
  if (relevantEntries.length < 3) return 'insufficient_data';
  
  // Check if symptom is becoming more frequent over time
  const timeIntervals = [];
  for (let i = 1; i < relevantEntries.length; i++) {
    const interval = new Date(relevantEntries[i].timestamp) - new Date(relevantEntries[i-1].timestamp);
    timeIntervals.push(interval);
  }
  
  // Calculate if intervals are getting shorter (worsening) or longer (improving)
  let shorterIntervals = 0;
  let longerIntervals = 0;
  
  for (let i = 1; i < timeIntervals.length; i++) {
    if (timeIntervals[i] < timeIntervals[i-1]) shorterIntervals++;
    else if (timeIntervals[i] > timeIntervals[i-1]) longerIntervals++;
  }
  
  if (shorterIntervals > longerIntervals) return 'worsening';
  if (longerIntervals > shorterIntervals) return 'improving';
  return 'stable';
};

/**
 * Identify patterns in symptom occurrence
 * @param {Array} history - Symptom history
 * @returns {Array} Identified patterns
 */
const identifySymptomPatterns = (history) => {
  const patterns = [];
  
  // Check for co-occurring symptoms
  const coOccurrences = {};
  
  history.forEach(entry => {
    if (entry.symptoms.length > 1) {
      for (let i = 0; i < entry.symptoms.length; i++) {
        for (let j = i + 1; j < entry.symptoms.length; j++) {
          const pair = [entry.symptoms[i], entry.symptoms[j]].sort().join('_');
          coOccurrences[pair] = (coOccurrences[pair] || 0) + 1;
        }
      }
    }
  });
  
  // Find significant co-occurrences
  Object.keys(coOccurrences).forEach(pair => {
    if (coOccurrences[pair] >= 2) {
      const [symptom1, symptom2] = pair.split('_');
      patterns.push({
        type: 'co_occurrence',
        symptoms: [symptom1, symptom2],
        frequency: coOccurrences[pair]
      });
    }
  });
  
  // Check for cyclical patterns (e.g., symptoms that occur every X days)
  // This is a simplified implementation
  const symptomTimestamps = {};
  
  history.forEach(entry => {
    entry.symptoms.forEach(symptom => {
      if (!symptomTimestamps[symptom]) symptomTimestamps[symptom] = [];
      symptomTimestamps[symptom].push(new Date(entry.timestamp));
    });
  });
  
  Object.keys(symptomTimestamps).forEach(symptom => {
    const timestamps = symptomTimestamps[symptom];
    if (timestamps.length >= 3) {
      const intervals = [];
      for (let i = 1; i < timestamps.length; i++) {
        intervals.push(timestamps[i] - timestamps[i-1]);
      }
      
      // Check if intervals are consistent
      const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
      const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length;
      const stdDev = Math.sqrt(variance);
      
      // If standard deviation is less than 20% of average, consider it cyclical
      if (stdDev < avgInterval * 0.2) {
        patterns.push({
          type: 'cyclical',
          symptom,
          intervalDays: Math.round(avgInterval / (1000 * 60 * 60 * 24)),
          confidence: 1 - (stdDev / avgInterval)
        });
      }
    }
  });
  
  return patterns;
};

/**
 * Determine overall trend direction from symptom analysis
 * @param {Array} recurringSymptoms - List of recurring symptoms with trends
 * @returns {String} Overall trend direction
 */
const determineTrendDirection = (recurringSymptoms) => {
  if (recurringSymptoms.length === 0) return 'stable';
  
  const counts = {
    worsening: 0,
    improving: 0,
    stable: 0,
    insufficient_data: 0
  };
  
  recurringSymptoms.forEach(symptom => {
    counts[symptom.trend] = (counts[symptom.trend] || 0) + 1;
  });
  
  if (counts.worsening > counts.improving) return 'worsening';
  if (counts.improving > counts.worsening) return 'improving';
  return 'stable';
};

/**
 * Calculate concern level based on symptom analysis
 * @param {Array} recurringSymptoms - Recurring symptoms
 * @param {Array} patterns - Identified patterns
 * @returns {String} Concern level (low, medium, high)
 */
const calculateConcernLevel = (recurringSymptoms, patterns) => {
  // Count worsening high-severity symptoms
  const worseningSymptoms = recurringSymptoms.filter(s => 
    s.trend === 'worsening'
  ).length;
  
  // Count concerning patterns
  const concerningPatterns = patterns.filter(p => 
    (p.type === 'co_occurrence' && p.frequency >= 3) || 
    (p.type === 'cyclical' && p.confidence > 0.8)
  ).length;
  
  if (worseningSymptoms >= 2 || concerningPatterns >= 2) return 'high';
  if (worseningSymptoms >= 1 || concerningPatterns >= 1) return 'medium';
  return 'low';
};

/**
 * Analyze vital sign trends
 * @param {Array} vitalHistory - History of vital signs
 * @returns {Object} Vital trend analysis
 */
const analyzeVitalTrends = async (vitalHistory) => {
  if (vitalHistory.length < TREND_ANALYSIS_MIN_DATA_POINTS) {
    return { status: 'insufficient_data' };
  }
  
  const vitalTrends = {};
  const vitalTypes = new Set();
  
  // Collect all vital types
  vitalHistory.forEach(entry => {
    Object.keys(entry.vitals).forEach(vitalType => {
      vitalTypes.add(vitalType);
    });
  });
  
  // Analyze each vital type
  vitalTypes.forEach(vitalType => {
    const values = vitalHistory
      .filter(entry => entry.vitals[vitalType] !== undefined)
      .map(entry => ({
        timestamp: entry.timestamp,
        value: entry.vitals[vitalType]
      }))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    if (values.length >= TREND_ANALYSIS_MIN_DATA_POINTS) {
      vitalTrends[vitalType] = analyzeVitalType(values, vitalType);
    }
  });
  
  return {
    vitalTrends,
    overallStatus: determineOverallVitalStatus(vitalTrends)
  };
};

/**
 * Analyze trend for a specific vital sign
 * @param {Array} values - Vital sign values with timestamps
 * @param {String} vitalType - Type of vital sign
 * @returns {Object} Analysis for this vital sign
 */
const analyzeVitalType = (values, vitalType) => {
  // Calculate trend using linear regression
  const xValues = values.map(v => new Date(v.timestamp).getTime());
  const yValues = values.map(v => parseFloat(v.value));
  
  const n = xValues.length;
  const avgX = xValues.reduce((sum, val) => sum + val, 0) / n;
  const avgY = yValues.reduce((sum, val) => sum + val, 0) / n;
  
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (xValues[i] - avgX) * (yValues[i] - avgY);
    denominator += Math.pow(xValues[i] - avgX, 2);
  }
  
  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = avgY - slope * avgX;
  
  // Determine if values are within normal range
  const normalRanges = {
    'heart_rate': { min: 60, max: 100 },
    'blood_pressure_systolic': { min: 90, max: 120 },
    'blood_pressure_diastolic': { min: 60, max: 80 },
    'temperature': { min: 36.1, max: 37.2 },
    'respiratory_rate': { min: 12, max: 20 },
    'oxygen_saturation': { min: 95, max: 100 },
    'glucose': { min: 70, max: 140 }
  };
  
  const range = normalRanges[vitalType] || { min: -Infinity, max: Infinity };
  const outOfRangeValues = yValues.filter(v => v < range.min || v > range.max).length;
  const outOfRangePercentage = (outOfRangeValues / n) * 100;
  
  // Determine trend direction
  let trendDirection = 'stable';
  if (Math.abs(slope) > 0.0001) {
    trendDirection = slope > 0 ? 'increasing' : 'decreasing';
  }
  
  // Determine if trend is concerning
  let concernLevel = 'low';
  
  if (outOfRangePercentage > 50) {
    concernLevel = 'high';
  } else if (outOfRangePercentage > 20) {
    concernLevel = 'medium';
  }
  
  // For specific vitals, check if trend direction is concerning
  if (vitalType === 'heart_rate' && Math.abs(slope) > 0.001) {
    concernLevel = Math.max(concernLevel, 'medium');
  }
  
  if (vitalType === 'blood_pressure_systolic' && slope > 0.001) {
    concernLevel = Math.max(concernLevel, 'medium');
  }
  
  return {
    trendDirection,
    concernLevel,
    outOfRangePercentage,
    latestValue: yValues[yValues.length - 1],
    averageValue: avgY,
    slope
  };
};

/**
 * Determine overall status from vital trends
 * @param {Object} vitalTrends - Analysis of vital trends
 * @returns {String} Overall status
 */
const determineOverallVitalStatus = (vitalTrends) => {
  const concernLevels = Object.values(vitalTrends).map(trend => trend.concernLevel);
  
  if (concernLevels.includes('high')) return 'high_concern';
  if (concernLevels.includes('medium')) return 'moderate_concern';
  return 'stable';
};

/**
 * Combine different types of insights
 * @param {Object} symptomTrends - Symptom trend analysis
 * @param {Object} vitalTrends - Vital trend analysis
 * @param {Object} riskAssessment - Risk assessment results
 * @returns {Object} Combined insights
 */
const combineInsights = (symptomTrends, vitalTrends, riskAssessment) => {
  // Determine overall health trajectory
  let trajectory = 'stable';
  let concernLevel = 'low';
  
  // Check symptom trends
  if (symptomTrends.status !== 'insufficient_data') {
    if (symptomTrends.trendDirection === 'worsening') {
      trajectory = 'declining';
    } else if (symptomTrends.trendDirection === 'improving') {
      trajectory = 'improving';
    }
    
    if (symptomTrends.concernLevel === 'high') {
      concernLevel = 'high';
    } else if (symptomTrends.concernLevel === 'medium' && concernLevel !== 'high') {
      concernLevel = 'medium';
    }
  }
  
  // Check vital trends
  if (vitalTrends.overallStatus === 'high_concern') {
    trajectory = 'declining';
    concernLevel = 'high';
  } else if (vitalTrends.overallStatus === 'moderate_concern') {
    if (trajectory !== 'declining') trajectory = 'fluctuating';
    if (concernLevel !== 'high') concernLevel = 'medium';
  }
  
  // Check risk assessment
  if (riskAssessment.overallRisk === 'high') {
    if (concernLevel !== 'high') concernLevel = 'high';
  } else if (riskAssessment.overallRisk === 'medium') {
    if (concernLevel === 'low') concernLevel = 'medium';
  }
  
  return {
    healthTrajectory: trajectory,
    overallConcernLevel: concernLevel,
    symptomInsights: symptomTrends.status !== 'insufficient_data' ? {
      recurringSymptoms: symptomTrends.recurringSymptoms,
      patterns: symptomTrends.patterns
    } : null,
    vitalInsights: vitalTrends.overallStatus ? {
      trends: vitalTrends.vitalTrends,
      status: vitalTrends.overallStatus
    } : null,
    riskFactors: riskAssessment.riskFactors || []
  };
};

/**
 * Generate early warnings based on insights
 * @param {Object} insights - Combined insights
 * @param {Object} patientData - Patient data
 * @returns {Array} Early warnings
 */
const generateEarlyWarnings = (insights, patientData) => {
  const warnings = [];
  
  // Check for high concern level
  if (insights.overallConcernLevel === 'high') {
    warnings.push({
      type: 'high_concern',
      message: 'Multiple health indicators showing concerning patterns',
      urgency: 'high'
    });
  }
  
  // Check for worsening symptoms
  if (insights.symptomInsights && insights.symptomInsights.recurringSymptoms) {
    const worseningSymptoms = insights.symptomInsights.recurringSymptoms
      .filter(s => s.trend === 'worsening')
      .map(s => s.name);
    
    if (worseningSymptoms.length > 0) {
      warnings.push({
        type: 'worsening_symptoms',
        message: `Worsening symptoms detected: ${worseningSymptoms.join(', ')}`,
        urgency: worseningSymptoms.length > 2 ? 'high' : 'medium',
        symptoms: worseningSymptoms
      });
    }
  }
  
  // Check for concerning vital signs
  if (insights.vitalInsights && insights.vitalInsights.trends) {
    const concerningVitals = Object.entries(insights.vitalInsights.trends)
      .filter(([_, data]) => data.concernLevel === 'high')
      .map(([vitalType, _]) => vitalType);
    
    if (concerningVitals.length > 0) {
      warnings.push({
        type: 'concerning_vitals',
        message: `Concerning vital sign trends: ${concerningVitals.join(', ')}`,
        urgency: 'high',
        vitals: concerningVitals
      });
    }
  }
  
  // Check for high-risk combinations
  if (patientData.age > 65 && insights.healthTrajectory === 'declining') {
    warnings.push({
      type: 'age_related_risk',
      message: 'Declining health trajectory in elderly patient',
      urgency: 'high'
    });
  }
  
  return warnings;
};

/**
 * Generate recommendations based on insights and warnings
 * @param {Object} insights - Combined insights
 * @param {Array} warnings - Early warnings
 * @returns {Array} Recommendations
 */
const generateRecommendations = (insights, warnings) => {
  const recommendations = [];
  
  // Base recommendations on concern level
  if (insights.overallConcernLevel === 'high') {
    recommendations.push('Schedule medical consultation within 1-2 days');
    recommendations.push('Monitor symptoms and vital signs closely');
  } else if (insights.overallConcernLevel === 'medium') {
    recommendations.push('Schedule routine medical check-up within 1-2 weeks');
    recommendations.push('Continue monitoring health indicators');
  } else {
    recommendations.push('Maintain regular health monitoring');
    recommendations.push('Follow preventive health guidelines');
  }
  
  // Add specific recommendations based on warnings
  warnings.forEach(warning => {
    if (warning.type === 'worsening_symptoms') {
      recommendations.push(`Track ${warning.symptoms.join(', ')} symptoms daily`);
    }
    
    if (warning.type === 'concerning_vitals') {
      recommendations.push(`Monitor ${warning.vitals.join(', ')} more frequently`);
    }
    
    if (warning.type === 'age_related_risk') {
      recommendations.push('Consider geriatric health assessment');
    }
  });
  
  // Add lifestyle recommendations
  if (insights.riskFactors.some(factor => 
    factor.toLowerCase().includes('smoking') || 
    factor.toLowerCase().includes('alcohol')
  )) {
    recommendations.push('Consider lifestyle modifications to reduce health risks');
  }
  
  return recommendations;
};

/**
 * Suggest next steps based on insights
 * @param {Object} insights - Combined insights
 * @param {Object} patientData - Patient data
 * @returns {Array} Suggested next steps
 */
const suggestNextSteps = (insights, patientData) => {
  const nextSteps = [];
  
  // Suggest appropriate monitoring frequency
  if (insights.overallConcernLevel === 'high') {
    nextSteps.push({
      action: 'monitoring',
      frequency: 'daily',
      description: 'Monitor symptoms and vital signs daily'
    });
  } else if (insights.overallConcernLevel === 'medium') {
    nextSteps.push({
      action: 'monitoring',
      frequency: 'weekly',
      description: 'Monitor symptoms and vital signs weekly'
    });
  } else {
    nextSteps.push({
      action: 'monitoring',
      frequency: 'monthly',
      description: 'Continue routine health monitoring'
    });
  }
  
  // Suggest medical consultation if needed
  if (insights.overallConcernLevel === 'high') {
    nextSteps.push({
      action: 'consultation',
      urgency: 'urgent',
      description: 'Schedule urgent medical consultation'
    });
  } else if (insights.overallConcernLevel === 'medium') {
    nextSteps.push({
      action: 'consultation',
      urgency: 'routine',
      description: 'Schedule routine medical check-up'
    });
  }
  
  // Suggest specific tests if needed
  if (insights.vitalInsights && insights.vitalInsights.trends) {
    if (insights.vitalInsights.trends.blood_pressure_systolic && 
        insights.vitalInsights.trends.blood_pressure_systolic.concernLevel === 'high') {
      nextSteps.push({
        action: 'test',
        type: 'cardiovascular',
        description: 'Consider cardiovascular assessment'
      });
    }
    
    if (insights.vitalInsights.trends.glucose && 
        insights.vitalInsights.trends.glucose.concernLevel === 'high') {
      nextSteps.push({
        action: 'test',
        type: 'metabolic',
        description: 'Consider metabolic panel and diabetes screening'
      });
    }
  }
  
  return nextSteps;
};

/**
 * Predict potential health issues based on current data
 * @param {Object} patientData - Patient data
 * @returns {Object} Prediction results
 */
const predictPotentialIssues = async (patientData) => {
  try {
    logger.info('Predicting potential health issues');
    
    // Get predictive insights first
    const insights = await generatePredictiveInsights(patientData);
    
    if (insights.status !== 'success') {
      return {
        status: insights.status,
        message: insights.message
      };
    }
    
    // Identify potential conditions based on trends
    const potentialConditions = [];
    
    // Check symptom patterns
    if (insights.insights.symptomInsights && 
        insights.insights.symptomInsights.patterns) {
      
      const patterns = insights.insights.symptomInsights.patterns;
      
      // Check co-occurring symptoms
      patterns.filter(p => p.type === 'co_occurrence').forEach(pattern => {
        const symptoms = pattern.symptoms.join(', ');
        
        // Simple rule-based condition prediction
        if (pattern.symptoms.includes('chest pain') && 
            pattern.symptoms.includes('shortness of breath')) {
          potentialConditions.push({
            condition: 'Potential cardiovascular issue',
            confidence: 0.7,
            basedOn: `Co-occurring symptoms: ${symptoms}`
          });
        }
        
        if (pattern.symptoms.includes('headache') && 
            pattern.symptoms.includes('dizziness')) {
          potentialConditions.push({
            condition: 'Potential hypertension',
            confidence: 0.6,
            basedOn: `Co-occurring symptoms: ${symptoms}`
          });
        }
      });
    }
    
    // Check vital trends
    if (insights.insights.vitalInsights && 
        insights.insights.vitalInsights.trends) {
      
      const vitalTrends = insights.insights.vitalInsights.trends;
      
      if (vitalTrends.blood_pressure_systolic && 
          vitalTrends.blood_pressure_systolic.trendDirection === 'increasing' &&
          vitalTrends.blood_pressure_systolic.latestValue > 130) {
        potentialConditions.push({
          condition: 'Developing hypertension',
          confidence: 0.75,
          basedOn: 'Increasing blood pressure trend'
        });
      }
      
      if (vitalTrends.glucose && 
          vitalTrends.glucose.trendDirection === 'increasing' &&
          vitalTrends.glucose.latestValue > 120) {
        potentialConditions.push({
          condition: 'Pre-diabetic condition',
          confidence: 0.65,
          basedOn: 'Increasing glucose levels'
        });
      }
    }
    
    // Filter conditions by confidence threshold
    const significantConditions = potentialConditions.filter(
      condition => condition.confidence >= PREDICTION_CONFIDENCE_THRESHOLD
    );
    
    return {
      status: 'success',
      potentialConditions: significantConditions,
      recommendations: generatePreventiveRecommendations(significantConditions),
      timeframe: estimateDevelopmentTimeframe(significantConditions, insights.insights)
    };
  } catch (error) {
    logger.error('Error predicting potential health issues:', error);
    return {
      status: 'error',
      message: 'Failed to predict potential health issues',
      error: error.message
    };
  }
};

/**
 * Generate preventive recommendations for predicted conditions
 * @param {Array} conditions - Predicted conditions
 * @returns {Array} Preventive recommendations
 */
const generatePreventiveRecommendations = (conditions) => {
  const recommendations = [];
  
  conditions.forEach(condition => {
    if (condition.condition.includes('cardiovascular')) {
      recommendations.push('Monitor blood pressure regularly');
      recommendations.push('Consider cardiovascular assessment');
      recommendations.push('Maintain heart-healthy diet and exercise');
    }
    
    if (condition.condition.includes('hypertension')) {
      recommendations.push('Reduce sodium intake');
      recommendations.push('Regular blood pressure monitoring');
      recommendations.push('Consider stress management techniques');
    }
    
    if (condition.condition.includes('diabetic')) {
      recommendations.push('Monitor blood glucose levels');
      recommendations.push('Consider dietary changes to reduce sugar intake');
      recommendations.push('Increase physical activity');
    }
  });
  
  // Remove duplicates
  return [...new Set(recommendations)];
};

/**
 * Estimate timeframe for condition development
 * @param {Array} conditions - Predicted conditions
 * @param {Object} insights - Health insights
 * @returns {Object} Estimated timeframes
 */
const estimateDevelopmentTimeframe = (conditions, insights) => {
  const timeframes = {};
  
  conditions.forEach(condition => {
    // Base timeframe on condition and trend severity
    let timeframe = '6-12 months'; // Default
    
    if (insights.overallConcernLevel === 'high') {
      timeframe = '1-3 months';
    } else if (insights.overallConcernLevel === 'medium') {
      timeframe = '3-6 months';
    }
    
    // Adjust based on specific conditions
    if (condition.condition.includes('hypertension') && 
        condition.confidence > 0.8) {
      timeframe = '3-6 months';
    }
    
    timeframes[condition.condition] = timeframe;
  });
  
  return timeframes;
};

module.exports = {
  generatePredictiveInsights,
  predictPotentialIssues,
  analyzeSymptomTrends,
  analyzeVitalTrends,
  generateEarlyWarnings
};