const axios = require('axios');
const { ai: logger } = require('./logger');

// Mock AI analysis for development (replace with actual AI service in production)
const MOCK_AI_ENABLED = !process.env.OPENAI_API_KEY || process.env.NODE_ENV === 'development';

// Common symptoms and their associated conditions
const SYMPTOM_DATABASE = {
  'fever': {
    conditions: ['flu', 'cold', 'infection', 'malaria', 'typhoid'],
    severity: 'medium',
    urgency: 'moderate'
  },
  'cough': {
    conditions: ['cold', 'flu', 'bronchitis', 'pneumonia', 'tuberculosis'],
    severity: 'low',
    urgency: 'low'
  },
  'headache': {
    conditions: ['tension headache', 'migraine', 'dehydration', 'flu'],
    severity: 'low',
    urgency: 'low'
  },
  'chest pain': {
    conditions: ['heart attack', 'angina', 'pneumonia', 'muscle strain'],
    severity: 'high',
    urgency: 'high'
  },
  'difficulty breathing': {
    conditions: ['asthma', 'pneumonia', 'heart failure', 'anxiety'],
    severity: 'high',
    urgency: 'high'
  },
  'abdominal pain': {
    conditions: ['appendicitis', 'gastritis', 'food poisoning', 'ulcer'],
    severity: 'medium',
    urgency: 'moderate'
  },
  'nausea': {
    conditions: ['food poisoning', 'pregnancy', 'flu', 'gastritis'],
    severity: 'low',
    urgency: 'low'
  },
  'vomiting': {
    conditions: ['food poisoning', 'gastritis', 'appendicitis', 'pregnancy'],
    severity: 'medium',
    urgency: 'moderate'
  },
  'diarrhea': {
    conditions: ['food poisoning', 'gastroenteritis', 'IBS', 'cholera'],
    severity: 'medium',
    urgency: 'moderate'
  },
  'fatigue': {
    conditions: ['anemia', 'depression', 'chronic fatigue', 'sleep disorders'],
    severity: 'low',
    urgency: 'low'
  },
  'dizziness': {
    conditions: ['low blood pressure', 'dehydration', 'anemia', 'inner ear problems'],
    severity: 'medium',
    urgency: 'moderate'
  },
  'rash': {
    conditions: ['allergic reaction', 'eczema', 'measles', 'dermatitis'],
    severity: 'low',
    urgency: 'low'
  },
  'joint pain': {
    conditions: ['arthritis', 'rheumatism', 'injury', 'flu'],
    severity: 'low',
    urgency: 'low'
  },
  'sore throat': {
    conditions: ['strep throat', 'cold', 'flu', 'tonsillitis'],
    severity: 'low',
    urgency: 'low'
  },
  'back pain': {
    conditions: ['muscle strain', 'herniated disc', 'kidney stones', 'arthritis'],
    severity: 'medium',
    urgency: 'moderate'
  }
};

// SRH Knowledge Base
const SRH_DATABASE = {
  'contraception': {
    response: 'Contraception helps prevent pregnancy. There are many types, like condoms, pills, and IUDs. It is best to talk to a healthcare provider to find the best option for you.',
    keywords: ['contraception', 'birth control', 'pills', 'condoms', 'iud']
  },
  'sti': {
    response: 'STIs (Sexually Transmitted Infections) are infections passed from person to person through sexual contact. Using condoms is the best way to prevent STIs. If you are sexually active, it is important to get tested regularly.',
    keywords: ['sti', 'std', 'infection', 'disease', 'herpes', 'hiv', 'chlamydia', 'gonorrhea']
  },
  'consent': {
    response: 'Consent is a clear and enthusiastic agreement to engage in any sexual activity. It must be freely given and can be taken back at any time. You always have the right to say no.',
    keywords: ['consent', 'agree', 'permission', 'yes', 'no']
  },
  'menstruation': {
    response: 'Menstruation, or a period, is a normal and healthy part of a woman\'s life. It usually happens once a month. If you have questions about your period, or if it is causing you a lot of pain, it is a good idea to talk to a doctor or a trusted adult.',
    keywords: ['menstruation', 'period', 'cycle', 'cramps']
  },
  'pregnancy': {
    response: 'If you think you might be pregnant, it is important to take a pregnancy test and see a doctor. Early prenatal care is very important for a healthy pregnancy.',
    keywords: ['pregnant', 'pregnancy', 'baby', 'missed period']
  }
};

// High-risk symptom combinations
const HIGH_RISK_COMBINATIONS = [
  ['chest pain', 'difficulty breathing'],
  ['severe headache', 'neck stiffness'],
  ['abdominal pain', 'vomiting', 'fever'],
  ['difficulty breathing', 'chest pain', 'dizziness'],
  ['severe abdominal pain', 'rigid abdomen'],
  ['high fever', 'severe headache', 'neck stiffness'],
  ['chest pain', 'sweating', 'nausea'],
  ['difficulty breathing', 'wheezing', 'chest tightness']
];

// Analyze symptoms using AI or mock analysis
const analyzeSymptoms = async (symptoms, patientContext = {}) => {
  try {
    if (MOCK_AI_ENABLED) {
      return await mockSymptomAnalysis(symptoms, patientContext);
    } else {
      return await realAIAnalysis(symptoms, patientContext);
    }
  } catch (error) {
    logger.error('Error in symptom analysis:', error);
    return {
      primaryDiagnosis: 'Unable to analyze symptoms at this time',
      severity: 'unknown',
      recommendations: ['Please consult with a healthcare provider'],
      confidence: 0,
      possibleConditions: [],
      urgency: 'moderate',
      redFlags: [],
      followUpRecommendations: []
    };
  }
};

// Get Luma response for general questions
const getLumaResponse = async (query) => {
  const lowerCaseQuery = query.toLowerCase();

  // Check SRH database first
  for (const key in SRH_DATABASE) {
    const entry = SRH_DATABASE[key];
    if (entry.keywords.some(keyword => lowerCaseQuery.includes(keyword))) {
      return { response: entry.response, type: 'srh' };
    }
  }

  // If no SRH match, use symptom analysis
  const symptomAnalysis = await analyzeSymptoms(query);
  return { response: symptomAnalysis, type: 'symptom' };
};

// Mock AI analysis for development
const mockSymptomAnalysis = async (symptoms, patientContext) => {
  logger.info('Using mock AI analysis for symptoms:', symptoms);

  const symptomList = symptoms.toLowerCase().split(/[,;]/).map(s => s.trim());
  const analysis = {
    primaryDiagnosis: '',
    severity: 'low',
    confidence: 0,
    possibleConditions: [],
    recommendations: [],
    urgency: 'low',
    redFlags: [],
    followUpRecommendations: []
  };

  let maxSeverity = 'low';
  let maxUrgency = 'low';
  let possibleConditions = new Set();
  let redFlags = [];

  // Analyze each symptom
  symptomList.forEach(symptom => {
    const matchedSymptoms = Object.keys(SYMPTOM_DATABASE).filter(key =>
      symptom.includes(key) || key.includes(symptom)
    );

    matchedSymptoms.forEach(matchedSymptom => {
      const symptomData = SYMPTOM_DATABASE[matchedSymptom];

      // Add possible conditions
      symptomData.conditions.forEach(condition => possibleConditions.add(condition));

      // Update severity and urgency
      if (getSeverityLevel(symptomData.severity) > getSeverityLevel(maxSeverity)) {
        maxSeverity = symptomData.severity;
      }
      if (getUrgencyLevel(symptomData.urgency) > getUrgencyLevel(maxUrgency)) {
        maxUrgency = symptomData.urgency;
      }
    });
  });

  // Check for high-risk combinations
  HIGH_RISK_COMBINATIONS.forEach(combination => {
    const hasAllSymptoms = combination.every(symptom =>
      symptomList.some(userSymptom => userSymptom.includes(symptom))
    );

    if (hasAllSymptoms) {
      maxSeverity = 'high';
      maxUrgency = 'high';
      redFlags.push(`High-risk combination detected: ${combination.join(', ')}`);
    }
  });

  // Consider patient context
  if (patientContext.age && patientContext.age > 65) {
    if (maxSeverity === 'low') maxSeverity = 'medium';
    analysis.recommendations.push('Age-related risk factors considered');
  }

  if (patientContext.chronicConditions && patientContext.chronicConditions.length > 0) {
    if (maxSeverity === 'low') maxSeverity = 'medium';
    analysis.recommendations.push('Chronic conditions may affect severity');
  }

  // Set primary diagnosis
  const conditionsArray = Array.from(possibleConditions);
  if (conditionsArray.length > 0) {
    analysis.primaryDiagnosis = conditionsArray[0];
  } else {
    analysis.primaryDiagnosis = 'Symptoms require medical evaluation';
  }

  // Set analysis results
  analysis.severity = maxSeverity;
  analysis.urgency = maxUrgency;
  analysis.possibleConditions = conditionsArray.slice(0, 5);
  analysis.redFlags = redFlags;
  analysis.confidence = Math.min(90, 40 + (symptomList.length * 10));

  // Generate recommendations
  analysis.recommendations = generateRecommendations(analysis, patientContext);
  analysis.followUpRecommendations = generateFollowUpRecommendations(analysis);

  return analysis;
};

// Real AI analysis using OpenAI API
const realAIAnalysis = async (symptoms, patientContext) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const endpoint = process.env.AI_MODEL_ENDPOINT || 'https://api.openai.com/v1/chat/completions';

  const prompt = `You are a medical AI assistant helping with symptom analysis.

Patient Context:
- Age: ${patientContext.age || 'Unknown'}
- Gender: ${patientContext.gender || 'Unknown'}
- Medical History: ${JSON.stringify(patientContext.medicalHistory || [])}
- Chronic Conditions: ${JSON.stringify(patientContext.chronicConditions || [])}
- Current Medications: ${JSON.stringify(patientContext.medications || [])}
- Allergies: ${JSON.stringify(patientContext.allergies || [])}
- Risk Factors: ${JSON.stringify(patientContext.riskFactors || [])}

Symptoms: ${symptoms}

Please analyze these symptoms and provide a JSON response with the following structure:
{
  "primaryDiagnosis": "Most likely condition",
  "severity": "low|medium|high|critical",
  "confidence": 0-100,
  "possibleConditions": ["condition1", "condition2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...],
  "urgency": "low|moderate|high|critical",
  "redFlags": ["flag1", "flag2", ...],
  "followUpRecommendations": ["followup1", "followup2", ...]
}

Consider the patient's context and provide appropriate medical guidance. Always err on the side of caution for serious symptoms.`

  try {
    const response = await axios.post(endpoint, {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a medical AI assistant. Provide helpful, accurate medical information while always recommending professional medical consultation for serious symptoms.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const aiResponse = response.data.choices[0].message.content;
    const analysis = JSON.parse(aiResponse);

    logger.info('AI analysis completed successfully');
    return analysis;
  } catch (error) {
    logger.error('Real AI analysis failed, falling back to mock analysis:', error);
    return await mockSymptomAnalysis(symptoms, patientContext);
  }
};

// Helper functions
const getSeverityLevel = (severity) => {
  const levels = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
  return levels[severity] || 1;
};

const getUrgencyLevel = (urgency) => {
  const levels = { 'low': 1, 'moderate': 2, 'high': 3, 'critical': 4 };
  return levels[urgency] || 1;
};

const generateRecommendations = (analysis, patientContext) => {
  const recommendations = [];

  // Basic recommendations based on severity
  if (analysis.severity === 'critical' || analysis.urgency === 'critical') {
    recommendations.push('EMERGENCY: Seek immediate medical attention');
    recommendations.push('Call emergency services or go to the nearest emergency room');
  } else if (analysis.severity === 'high' || analysis.urgency === 'high') {
    recommendations.push('Seek medical attention within 24 hours');
    recommendations.push('Contact your healthcare provider or visit urgent care');
  } else if (analysis.severity === 'medium') {
    recommendations.push('Schedule an appointment with your healthcare provider');
    recommendations.push('Monitor symptoms and seek care if they worsen');
  } else {
    recommendations.push('Monitor symptoms and consider consulting a healthcare provider if they persist');
    recommendations.push('Practice self-care and rest');
  }

  // Specific recommendations based on symptoms
  if (analysis.possibleConditions.includes('dehydration')) {
    recommendations.push('Increase fluid intake');
  }
  if (analysis.possibleConditions.includes('flu') || analysis.possibleConditions.includes('cold')) {
    recommendations.push('Get plenty of rest');
    recommendations.push('Stay hydrated');
  }
  if (analysis.possibleConditions.includes('food poisoning')) {
    recommendations.push('Stay hydrated with clear fluids');
    recommendations.push('Avoid solid foods until symptoms improve');
  }

  // Context-specific recommendations
  if (patientContext.age && patientContext.age > 65) {
    recommendations.push('Consider age-related risk factors');
  }
  if (patientContext.chronicConditions && patientContext.chronicConditions.length > 0) {
    recommendations.push('Monitor how symptoms interact with existing conditions');
  }

  return recommendations;
};

const generateFollowUpRecommendations = (analysis) => {
  const followUp = [];

  if (analysis.severity === 'high' || analysis.urgency === 'high') {
    followUp.push('Follow up within 24-48 hours if symptoms persist');
    followUp.push('Return immediately if symptoms worsen');
  } else if (analysis.severity === 'medium') {
    followUp.push('Follow up in 3-5 days if symptoms persist');
    followUp.push('Schedule routine check-up if symptoms are recurring');
  } else {
    followUp.push('Follow up if symptoms persist beyond 7-10 days');
    followUp.push('Keep a symptom diary to track patterns');
  }

  return followUp;
};

// Health risk assessment
const assessHealthRisk = async (patientData) => {
  const riskFactors = [];
  let overallRisk = 'low';

  // Age-based risk
  if (patientData.age > 65) {
    riskFactors.push('Advanced age');
    overallRisk = 'medium';
  }

  // Chronic conditions
  if (patientData.chronicConditions && patientData.chronicConditions.length > 0) {
    riskFactors.push('Chronic health conditions');
    if (patientData.chronicConditions.length > 2) {
      overallRisk = 'high';
    } else {
      overallRisk = 'medium';
    }
  }

  // Lifestyle factors
  if (patientData.riskFactors) {
    const highRiskFactors = patientData.riskFactors.filter(factor =>
      factor.toLowerCase().includes('smoking') ||
      factor.toLowerCase().includes('alcohol') ||
      factor.toLowerCase().includes('obesity')
    );

    if (highRiskFactors.length > 0) {
      riskFactors.push(...highRiskFactors);
      overallRisk = overallRisk === 'low' ? 'medium' : 'high';
    }
  }

  return {
    overallRisk,
    riskFactors,
    recommendations: generateRiskRecommendations(overallRisk, riskFactors)
  };
};

const generateRiskRecommendations = (riskLevel, riskFactors) => {
  const recommendations = [];

  if (riskLevel === 'high') {
    recommendations.push('Schedule regular health check-ups');
    recommendations.push('Consider preventive health screenings');
    recommendations.push('Develop a comprehensive health management plan');
  } else if (riskLevel === 'medium') {
    recommendations.push('Schedule annual health check-ups');
    recommendations.push('Monitor key health indicators');
  } else {
    recommendations.push('Maintain regular health check-ups');
    recommendations.push('Focus on preventive care');
  }

  // Specific recommendations based on risk factors
  if (riskFactors.some(factor => factor.toLowerCase().includes('smoking'))) {
    recommendations.push('Consider smoking cessation programs');
  }
  if (riskFactors.some(factor => factor.toLowerCase().includes('obesity'))) {
    recommendations.push('Consult with a nutritionist');
    recommendations.push('Develop an exercise plan');
  }

  return recommendations;
};

// Predict health trends
const predictHealthTrends = async (patientHistory) => {
  // This is a simplified prediction model
  // In a real implementation, this would use machine learning models

  const trends = {
    riskProgression: 'stable',
    predictedConditions: [],
    recommendations: []
  };

  // Analyze symptom patterns
  if (patientHistory.symptoms) {
    const recentSymptoms = patientHistory.symptoms.slice(-5);
    const symptomFrequency = {};

    recentSymptoms.forEach(symptomCheck => {
      symptomCheck.symptoms.forEach(symptom => {
        symptomFrequency[symptom] = (symptomFrequency[symptom] || 0) + 1;
      });
    });

    // Identify recurring symptoms
    const recurringSymptoms = Object.keys(symptomFrequency).filter(
      symptom => symptomFrequency[symptom] > 2
    );

    if (recurringSymptoms.length > 0) {
      trends.recommendations.push(`Monitor recurring symptoms: ${recurringSymptoms.join(', ')}`);
    }
  }

  return trends;
};

// Generate SRH recommendations
const generateSRHRecommendations = async (type, context = {}) => {
  try {
    logger.info('Generating SRH recommendations for type:', type);
    
    const recommendations = [];
    
    switch (type) {
      case 'contraception':
        recommendations.push('Consult with a healthcare provider to discuss the best option for you');
        recommendations.push('Consider your lifestyle, health conditions, and preferences');
        if (context.age && parseInt(context.age) > 35) {
          recommendations.push('Age-appropriate options should be considered');
        }
        if (context.medicalHistory && context.medicalHistory.includes('smoking')) {
          recommendations.push('Smoking may affect contraceptive options - discuss with your provider');
        }
        break;
        
      case 'menstrual-health':
        recommendations.push('Track your menstrual cycle to understand your patterns');
        recommendations.push('Maintain good menstrual hygiene');
        recommendations.push('Consult a healthcare provider if you experience irregular or painful periods');
        break;
        
      case 'pregnancy':
        recommendations.push('Start prenatal care as early as possible');
        recommendations.push('Take folic acid supplements as recommended');
        recommendations.push('Maintain a healthy diet and avoid harmful substances');
        break;
        
      case 'sti-prevention':
        recommendations.push('Use barrier protection consistently');
        recommendations.push('Get tested regularly if sexually active');
        recommendations.push('Communicate openly with partners about sexual health');
        break;
        
      default:
        recommendations.push('Consult with a healthcare provider for personalized advice');
        recommendations.push('Stay informed about your sexual and reproductive health');
    }
    
    return recommendations;
  } catch (error) {
    logger.error('Error generating SRH recommendations:', error);
    return ['Consult with a healthcare provider for personalized advice'];
  }
};

module.exports = {
  analyzeSymptoms,
  getLumaResponse,
  assessHealthRisk,
  predictHealthTrends,
  mockSymptomAnalysis,
  realAIAnalysis,
  generateSRHRecommendations
};
