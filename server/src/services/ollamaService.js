const axios = require('axios');
const { ai: logger } = require('./logger');

// Ollama configuration
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';

class OllamaService {
  constructor() {
    this.baseURL = OLLAMA_BASE_URL;
    this.model = OLLAMA_MODEL;
    logger.info(`Using model ${OLLAMA_MODEL} for Luma responses`);
    this.isAvailable = false;
    this.initializeService();
  }

  async initializeService() {
    try {
      await this.checkAvailability();
      logger.info('Ollama service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Ollama service:', error);
    }
  }

  async checkAvailability() {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`, {
        timeout: 5000
      });
      
      const availableModels = response.data.models || [];
      this.isAvailable = availableModels.some(model => 
        model.name.includes('llama3.2') || model.name.includes('llama3.3')
      );
      
      if (this.isAvailable) {
        logger.info(`Ollama is available with model: ${this.model}`);
      } else {
        logger.warn('Llama 3.2/3.3 model not found in Ollama');
      }
      
      return this.isAvailable;
    } catch (error) {
      logger.error('Ollama service unavailable:', error.message);
      this.isAvailable = false;
      return false;
    }
  }

  async generateResponse(prompt, options = {}) {
    if (!this.isAvailable) {
      await this.checkAvailability();
      if (!this.isAvailable) {
        throw new Error('Ollama service is not available');
      }
    }

    try {
      const response = await axios.post(`${this.baseURL}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: options.temperature || 0.3,
          top_p: options.top_p || 0.9,
          max_tokens: options.max_tokens || 1000,
          ...options
        }
      }, {
        timeout: 60000, // 60 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.response) {
        logger.info('Ollama response generated successfully');
        return response.data.response.trim();
      } else {
        throw new Error('Invalid response from Ollama');
      }
    } catch (error) {
      logger.error('Error generating Ollama response:', error.message);
      throw error;
    }
  }

  async chatCompletion(messages, options = {}) {
    if (!this.isAvailable) {
      await this.checkAvailability();
      if (!this.isAvailable) {
        throw new Error('Ollama service is not available');
      }
    }

    try {
      // Convert OpenAI-style messages to Ollama prompt format
      const prompt = this.convertMessagesToPrompt(messages);
      
      const response = await axios.post(`${this.baseURL}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: options.temperature || 0.3,
          top_p: options.top_p || 0.9,
          max_tokens: options.max_tokens || 1000,
          ...options
        }
      }, {
        timeout: 60000, // 60 second timeout for complex queries
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.response) {
        logger.info('Ollama chat completion generated successfully');
        return {
          choices: [{
            message: {
              role: 'assistant',
              content: response.data.response.trim()
            }
          }]
        };
      } else {
        throw new Error('Invalid response from Ollama');
      }
    } catch (error) {
      logger.error('Error in Ollama chat completion:', error.message);
      throw error;
    }
  }

  convertMessagesToPrompt(messages) {
    let prompt = '';
    
    messages.forEach(message => {
      switch (message.role) {
        case 'system':
          prompt += `System: ${message.content}\n\n`;
          break;
        case 'user':
          prompt += `Human: ${message.content}\n\n`;
          break;
        case 'assistant':
          prompt += `Assistant: ${message.content}\n\n`;
          break;
      }
    });

    prompt += 'Assistant: ';
    return prompt;
  }

  // Enhanced Medical symptom analysis using Llama 3.2 with multi-modal approach
  async analyzeSymptoms(symptoms, patientContext = {}, additionalData = {}) {
    const { vitals, labResults, recentSymptoms, environmentalFactors } = additionalData;
    
    const prompt = `You are an advanced medical AI assistant specializing in comprehensive symptom analysis and early disease detection.

Patient Context:
- Age: ${patientContext.age || 'Unknown'}
- Gender: ${patientContext.gender || 'Unknown'}
- Medical History: ${JSON.stringify(patientContext.medicalHistory || [])}
- Chronic Conditions: ${JSON.stringify(patientContext.chronicConditions || [])}
- Current Medications: ${JSON.stringify(patientContext.medications || [])}
- Allergies: ${JSON.stringify(patientContext.allergies || [])}
- Risk Factors: ${JSON.stringify(patientContext.riskFactors || [])}

Current Symptoms: ${symptoms}

${vitals ? `Recent Vital Signs:\n${JSON.stringify(vitals, null, 2)}\n` : ''}
${labResults ? `Latest Lab Results:\n${JSON.stringify(labResults, null, 2)}\n` : ''}
${recentSymptoms ? `Recent Symptom History:\n${JSON.stringify(recentSymptoms, null, 2)}\n` : ''}
${environmentalFactors ? `Environmental Context:\n${JSON.stringify(environmentalFactors, null, 2)}\n` : ''}

Please provide a comprehensive analysis in JSON format:
{
  "primaryDiagnosis": "Most likely condition based on all available data",
  "confidence": 0-100,
  "severity": "low|medium|high|critical",
  "urgency": "low|moderate|high|critical",
  "possibleConditions": [
    {
      "condition": "condition name",
      "probability": 0-100,
      "supportingEvidence": ["evidence1", "evidence2"]
    }
  ],
  "differentialDiagnosis": ["alternative conditions to consider"],
  "redFlags": ["serious warning signs present"],
  "recommendations": {
    "immediate": ["urgent actions needed"],
    "shortTerm": ["actions needed within 24-48 hours"],
    "longTerm": ["ongoing management recommendations"]
  },
  "requiredTests": ["specific diagnostic tests recommended"],
  "followUpRecommendations": ["follow-up care suggestions"],
  "riskFactorAnalysis": {
    "modifiable": ["risk factors that can be changed"],
    "nonModifiable": ["risk factors that cannot be changed"]
  },
  "preventiveActions": ["actions to prevent progression"],
  "monitoringParameters": ["symptoms/vitals to monitor"]
}

Analyze patterns, consider seasonal factors, and provide evidence-based recommendations. Always prioritize patient safety. Respond only with valid JSON.`;

    try {
      const response = await this.generateResponse(prompt, {
        temperature: 0.3,
        max_tokens: 1000
      });

      // Try to parse JSON response
      let analysis;
      try {
        analysis = JSON.parse(response);
      } catch (parseError) {
        logger.warn('Failed to parse JSON response, extracting relevant information');
        analysis = this.extractAnalysisFromText(response, symptoms);
      }

      // Validate and ensure required fields
      return this.validateAnalysis(analysis);
    } catch (error) {
      logger.error('Error in Ollama symptom analysis:', error.message);
      throw error;
    }
  }

  // Health risk assessment using Llama 3.2
  async assessHealthRisk(patientData) {
    const prompt = `You are a healthcare AI assistant. Assess the health risk for this patient:

Patient Data:
${JSON.stringify(patientData, null, 2)}

Please provide a comprehensive health risk assessment in JSON format:
{
  "overallRisk": "low|medium|high|critical",
  "riskFactors": ["factor1", "factor2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...],
  "preventiveMeasures": ["measure1", "measure2", ...],
  "monitoringRequired": ["item1", "item2", ...]
}

Focus on preventive care and early intervention. Respond only with valid JSON.`;

    try {
      const response = await this.generateResponse(prompt, {
        temperature: 0.2,
        max_tokens: 800
      });

      let assessment;
      try {
        assessment = JSON.parse(response);
      } catch (parseError) {
        logger.warn('Failed to parse risk assessment JSON');
        assessment = {
          overallRisk: 'medium',
          riskFactors: ['Assessment requires manual review'],
          recommendations: ['Consult with healthcare provider'],
          preventiveMeasures: ['Regular health check-ups'],
          monitoringRequired: ['General health monitoring']
        };
      }

      return assessment;
    } catch (error) {
      logger.error('Error in Ollama health risk assessment:', error.message);
      throw error;
    }
  }

  // Luma chatbot responses using Llama 3.2
  async getLumaResponse(query, context = {}) {
    const prompt = `You are Luma, a healthcare AI assistant. You provide helpful, accurate medical guidance while always recommending professional medical consultation for serious issues.

User asked: "${query}"

Please provide a helpful, clear response that:
- Is medically accurate and evidence-based
- Uses simple, understandable language
- Recommends professional care for serious symptoms
- If emergency symptoms (chest pain, difficulty breathing, severe bleeding), start with "🚨 URGENT: Seek immediate medical attention."

Response:`;

    try {
      const response = await this.generateResponse(prompt, {
        temperature: 0.2, // more deterministic
        max_tokens: 800 // allowance for deeper perspective
      });

      // Clean up the response
      let cleanedResponse = response.trim();
      
      // Remove any unwanted prefixes that might be generated
      cleanedResponse = cleanedResponse.replace(/^(Response:|Assistant:|Luma:)\s*/i, '');
      
      // Ensure the response ends with a professional disclaimer if it's medical advice
      const medicalKeywords = ['symptom', 'diagnosis', 'treatment', 'medication', 'condition', 'disease', 'pain', 'illness'];
      const containsMedicalAdvice = medicalKeywords.some(keyword => 
        query.toLowerCase().includes(keyword) || cleanedResponse.toLowerCase().includes(keyword)
      );
      
      if (containsMedicalAdvice && !cleanedResponse.toLowerCase().includes('healthcare provider') && !cleanedResponse.toLowerCase().includes('medical professional')) {
        cleanedResponse += '\n\nPlease remember to consult with a healthcare provider for proper medical evaluation and treatment.';
      }

      return {
        response: cleanedResponse,
        type: 'general',
        source: 'llama3.2'
      };
    } catch (error) {
      logger.error('Error in Luma response generation:', error.message);
      throw error;
    }
  }

  // Predict health trends using Llama 3.2
  async predictHealthTrends(patientHistory) {
    const prompt = `You are a predictive health AI. Analyze this patient's health history and predict potential trends:

Patient History:
${JSON.stringify(patientHistory, null, 2)}

Provide predictions in JSON format:
{
  "riskProgression": "improving|stable|declining|critical",
  "predictedConditions": ["condition1", "condition2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...],
  "timeframe": "short-term|medium-term|long-term",
  "confidence": 0-100,
  "keyIndicators": ["indicator1", "indicator2", ...]
}

Focus on preventive care and early intervention opportunities. Respond only with valid JSON.`;

    try {
      const response = await this.generateResponse(prompt, {
        temperature: 0.3,
        max_tokens: 800
      });

      let trends;
      try {
        trends = JSON.parse(response);
      } catch (parseError) {
        logger.warn('Failed to parse trends JSON');
        trends = {
          riskProgression: 'stable',
          predictedConditions: [],
          recommendations: ['Regular health monitoring recommended'],
          timeframe: 'medium-term',
          confidence: 50,
          keyIndicators: ['Overall health status']
        };
      }

      return trends;
    } catch (error) {
      logger.error('Error in health trend prediction:', error.message);
      throw error;
    }
  }

  extractAnalysisFromText(text, symptoms) {
    // Fallback method to extract key information if JSON parsing fails
    return {
      primaryDiagnosis: 'Symptoms require medical evaluation',
      severity: 'medium',
      confidence: 60,
      possibleConditions: [symptoms.split(' ')[0] + ' related condition'],
      recommendations: ['Consult with healthcare provider', 'Monitor symptoms'],
      urgency: 'moderate',
      redFlags: [],
      followUpRecommendations: ['Follow up if symptoms persist']
    };
  }

  validateAnalysis(analysis) {
    // Ensure all required fields are present
    return {
      primaryDiagnosis: analysis.primaryDiagnosis || 'Symptoms require evaluation',
      severity: analysis.severity || 'medium',
      confidence: Math.min(100, Math.max(0, analysis.confidence || 60)),
      possibleConditions: Array.isArray(analysis.possibleConditions) ? analysis.possibleConditions : [],
      recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : ['Consult healthcare provider'],
      urgency: analysis.urgency || 'moderate',
      redFlags: Array.isArray(analysis.redFlags) ? analysis.redFlags : [],
      followUpRecommendations: Array.isArray(analysis.followUpRecommendations) ? analysis.followUpRecommendations : []
    };
  }
}

module.exports = new OllamaService();
