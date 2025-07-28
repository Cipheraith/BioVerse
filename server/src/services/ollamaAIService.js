/**
 * Ollama Local AI Service
 * Advanced AI capabilities using local models for privacy and performance
 */

const axios = require('axios');
const { logger } = require('./logger');

class OllamaAIService {
  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.defaultModel = process.env.OLLAMA_DEFAULT_MODEL || 'llama3.1:8b';
    this.medicalModel = process.env.OLLAMA_MEDICAL_MODEL || 'meditron:7b';
    this.codeModel = process.env.OLLAMA_CODE_MODEL || 'codellama:7b';
    this.embeddingModel = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';
    
    this.modelCache = new Map();
    this.conversationHistory = new Map();
    this.maxHistoryLength = 10;
    
    this.initializeModels();
  }

  /**
   * Initialize and pull required models
   */
  async initializeModels() {
    try {
      const requiredModels = [
        this.defaultModel,
        this.medicalModel,
        this.embeddingModel,
        'llama3.1:70b', // For complex medical reasoning
        'mistral:7b',   // For general health queries
        'neural-chat:7b', // For patient communication
        'deepseek-coder:6.7b' // For health data analysis
      ];

      logger.info('Initializing Ollama models...');
      
      for (const model of requiredModels) {
        try {
          await this.ensureModelAvailable(model);
          logger.info(`Model ${model} is ready`);
        } catch (error) {
          logger.warn(`Failed to initialize model ${model}: ${error.message}`);
        }
      }
      
      logger.info('Ollama AI Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Ollama models:', error);
    }
  }

  /**
   * Ensure model is available, pull if necessary
   */
  async ensureModelAvailable(modelName) {
    try {
      // Check if model exists
      const response = await axios.get(`${this.baseUrl}/api/tags`);
      const availableModels = response.data.models || [];
      
      const modelExists = availableModels.some(model => 
        model.name === modelName || model.name.startsWith(modelName.split(':')[0])
      );
      
      if (!modelExists) {
        logger.info(`Pulling model ${modelName}...`);
        await this.pullModel(modelName);
      }
      
      return true;
    } catch (error) {
      logger.error(`Error checking model availability: ${error.message}`);
      throw error;
    }
  }

  /**
   * Pull a model from Ollama
   */
  async pullModel(modelName) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/pull`, {
        name: modelName
      }, {
        timeout: 300000 // 5 minutes timeout for model pulling
      });
      
      return response.data;
    } catch (error) {
      logger.error(`Failed to pull model ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Generate medical diagnosis and recommendations
   */
  async generateMedicalDiagnosis(patientData, symptoms, medicalHistory = []) {
    try {
      const prompt = this.buildMedicalDiagnosisPrompt(patientData, symptoms, medicalHistory);
      
      const response = await this.generateCompletion(prompt, {
        model: this.medicalModel,
        temperature: 0.3, // Lower temperature for medical accuracy
        max_tokens: 1000,
        system: `You are an expert medical AI assistant specializing in diagnostic support. 
                 Provide evidence-based medical insights while emphasizing the need for professional medical consultation.
                 Always include confidence levels and recommend appropriate next steps.`
      });

      return this.parseMedicalResponse(response);
    } catch (error) {
      logger.error('Error generating medical diagnosis:', error);
      throw error;
    }
  }

  /**
   * Analyze health trends and predict future risks
   */
  async analyzeHealthTrends(healthTwinData, timeframe = '6m') {
    try {
      const prompt = this.buildHealthTrendsPrompt(healthTwinData, timeframe);
      
      const response = await this.generateCompletion(prompt, {
        model: 'llama3.1:70b', // Use larger model for complex analysis
        temperature: 0.2,
        max_tokens: 1500,
        system: `You are a specialized health analytics AI that analyzes patient data trends and predicts future health risks.
                 Provide detailed trend analysis, risk predictions, and personalized recommendations based on the data patterns.`
      });

      return this.parseHealthTrendsResponse(response);
    } catch (error) {
      logger.error('Error analyzing health trends:', error);
      throw error;
    }
  }

  /**
   * Generate personalized health recommendations
   */
  async generateHealthRecommendations(patientProfile, currentHealth, goals = []) {
    try {
      const prompt = this.buildRecommendationsPrompt(patientProfile, currentHealth, goals);
      
      const response = await this.generateCompletion(prompt, {
        model: this.medicalModel,
        temperature: 0.4,
        max_tokens: 1200,
        system: `You are a personalized health coach AI that provides evidence-based lifestyle and health recommendations.
                 Consider the patient's unique profile, current health status, and goals to provide actionable advice.`
      });

      return this.parseRecommendationsResponse(response);
    } catch (error) {
      logger.error('Error generating health recommendations:', error);
      throw error;
    }
  }

  /**
   * Process natural language health queries (Luma chatbot)
   */
  async processHealthQuery(query, patientId, conversationContext = []) {
    try {
      // Get or create conversation history
      const history = this.conversationHistory.get(patientId) || [];
      
      const prompt = this.buildChatPrompt(query, history, conversationContext);
      
      const response = await this.generateCompletion(prompt, {
        model: 'neural-chat:7b',
        temperature: 0.6,
        max_tokens: 800,
        system: `You are Luma, BioVerse's friendly and knowledgeable health AI assistant.
                 Provide helpful, accurate health information while being empathetic and encouraging.
                 Always remind users to consult healthcare professionals for serious concerns.`
      });

      // Update conversation history
      history.push({ role: 'user', content: query });
      history.push({ role: 'assistant', content: response });
      
      // Keep history manageable
      if (history.length > this.maxHistoryLength * 2) {
        history.splice(0, 2);
      }
      
      this.conversationHistory.set(patientId, history);

      return {
        response,
        conversationId: patientId,
        timestamp: new Date().toISOString(),
        model: 'neural-chat:7b'
      };
    } catch (error) {
      logger.error('Error processing health query:', error);
      throw error;
    }
  }

  /**
   * Analyze medical documents and extract insights
   */
  async analyzeHealthDocument(documentText, documentType = 'general') {
    try {
      const prompt = this.buildDocumentAnalysisPrompt(documentText, documentType);
      
      const response = await this.generateCompletion(prompt, {
        model: this.medicalModel,
        temperature: 0.2,
        max_tokens: 1000,
        system: `You are a medical document analysis AI that extracts key information, identifies important findings,
                 and summarizes medical documents in an accessible format.`
      });

      return this.parseDocumentAnalysisResponse(response);
    } catch (error) {
      logger.error('Error analyzing health document:', error);
      throw error;
    }
  }

  /**
   * Generate health education content
   */
  async generateHealthEducation(topic, patientProfile, complexity = 'intermediate') {
    try {
      const prompt = this.buildEducationPrompt(topic, patientProfile, complexity);
      
      const response = await this.generateCompletion(prompt, {
        model: this.defaultModel,
        temperature: 0.5,
        max_tokens: 1500,
        system: `You are a health education AI that creates personalized, easy-to-understand educational content
                 about health topics. Adapt the complexity and examples to the patient's profile and needs.`
      });

      return this.parseEducationResponse(response);
    } catch (error) {
      logger.error('Error generating health education:', error);
      throw error;
    }
  }

  /**
   * Analyze health data patterns using code generation
   */
  async analyzeHealthDataPatterns(healthData, analysisType = 'trends') {
    try {
      const prompt = this.buildDataAnalysisPrompt(healthData, analysisType);
      
      const response = await this.generateCompletion(prompt, {
        model: 'deepseek-coder:6.7b',
        temperature: 0.3,
        max_tokens: 1200,
        system: `You are a health data analysis AI that generates Python code to analyze health patterns,
                 identify trends, and create visualizations. Provide both code and interpretation of results.`
      });

      return this.parseDataAnalysisResponse(response);
    } catch (error) {
      logger.error('Error analyzing health data patterns:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for semantic search
   */
  async generateEmbeddings(texts) {
    try {
      const embeddings = [];
      
      for (const text of texts) {
        const response = await axios.post(`${this.baseUrl}/api/embeddings`, {
          model: this.embeddingModel,
          prompt: text
        });
        
        embeddings.push(response.data.embedding);
      }
      
      return embeddings;
    } catch (error) {
      logger.error('Error generating embeddings:', error);
      throw error;
    }
  }

  /**
   * Core completion generation method
   */
  async generateCompletion(prompt, options = {}) {
    try {
      const requestData = {
        model: options.model || this.defaultModel,
        prompt: prompt,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          top_p: options.top_p || 0.9,
          max_tokens: options.max_tokens || 500,
          stop: options.stop || []
        }
      };

      if (options.system) {
        requestData.system = options.system;
      }

      const response = await axios.post(`${this.baseUrl}/api/generate`, requestData, {
        timeout: 60000 // 1 minute timeout
      });

      return response.data.response;
    } catch (error) {
      logger.error('Error generating completion:', error);
      throw error;
    }
  }

  /**
   * Build medical diagnosis prompt
   */
  buildMedicalDiagnosisPrompt(patientData, symptoms, medicalHistory) {
    return `
Patient Profile:
- Age: ${patientData.age}
- Gender: ${patientData.gender}
- Medical History: ${medicalHistory.join(', ') || 'None reported'}
- Current Medications: ${patientData.medications?.join(', ') || 'None'}
- Allergies: ${patientData.allergies?.join(', ') || 'None'}

Current Symptoms:
${symptoms.map(s => `- ${s.symptom}: ${s.severity} (${s.duration})`).join('\n')}

Please provide:
1. Possible differential diagnoses (ranked by likelihood)
2. Recommended diagnostic tests or examinations
3. Immediate care recommendations
4. Red flags or warning signs to watch for
5. Confidence level for each diagnosis (1-10 scale)

Format your response as structured JSON with clear sections for each recommendation.
`;
  }

  /**
   * Build health trends analysis prompt
   */
  buildHealthTrendsPrompt(healthTwinData, timeframe) {
    return `
Analyze the following health data trends for a ${timeframe} prediction:

Vital Signs History:
${JSON.stringify(healthTwinData.vitals, null, 2)}

Symptom Patterns:
${JSON.stringify(healthTwinData.symptoms, null, 2)}

Lab Results:
${JSON.stringify(healthTwinData.labResults, null, 2)}

Lifestyle Factors:
${JSON.stringify(healthTwinData.lifestyle, null, 2)}

Please provide:
1. Trend analysis for each health metric
2. Risk predictions for the next ${timeframe}
3. Early warning indicators
4. Recommended interventions
5. Confidence levels for predictions

Format as structured analysis with specific metrics and actionable insights.
`;
  }

  /**
   * Parse medical response into structured format
   */
  parseMedicalResponse(response) {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(response);
      return parsed;
    } catch (error) {
      // If not JSON, parse as structured text
      return {
        diagnoses: this.extractDiagnoses(response),
        recommendations: this.extractRecommendations(response),
        tests: this.extractTests(response),
        warnings: this.extractWarnings(response),
        confidence: this.extractConfidence(response),
        rawResponse: response
      };
    }
  }

  /**
   * Parse health trends response
   */
  parseHealthTrendsResponse(response) {
    return {
      trends: this.extractTrends(response),
      predictions: this.extractPredictions(response),
      risks: this.extractRisks(response),
      interventions: this.extractInterventions(response),
      confidence: this.extractConfidence(response),
      rawResponse: response,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Extract diagnoses from text response
   */
  extractDiagnoses(text) {
    const diagnoses = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('diagnosis') || line.match(/^\d+\./)) {
        const match = line.match(/([^:]+):\s*(.+)/);
        if (match) {
          diagnoses.push({
            condition: match[1].trim(),
            description: match[2].trim(),
            likelihood: this.extractLikelihood(line)
          });
        }
      }
    }
    
    return diagnoses;
  }

  /**
   * Extract recommendations from text
   */
  extractRecommendations(text) {
    const recommendations = [];
    const sections = text.split(/(?:recommendations?|suggest|advise)/i);
    
    if (sections.length > 1) {
      const recSection = sections[1];
      const lines = recSection.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        if (line.match(/^[-•*]\s*/) || line.match(/^\d+\./)) {
          recommendations.push({
            text: line.replace(/^[-•*\d.]\s*/, '').trim(),
            priority: this.extractPriority(line),
            category: this.categorizeRecommendation(line)
          });
        }
      }
    }
    
    return recommendations;
  }

  /**
   * Extract likelihood from text
   */
  extractLikelihood(text) {
    const percentMatch = text.match(/(\d+)%/);
    if (percentMatch) return parseInt(percentMatch[1]);
    
    const scaleMatch = text.match(/(\d+)\/10/);
    if (scaleMatch) return parseInt(scaleMatch[1]) * 10;
    
    // Default likelihood based on keywords
    if (text.toLowerCase().includes('likely')) return 70;
    if (text.toLowerCase().includes('possible')) return 50;
    if (text.toLowerCase().includes('unlikely')) return 20;
    
    return 50; // Default
  }

  /**
   * Get available models
   */
  async getAvailableModels() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`);
      return response.data.models || [];
    } catch (error) {
      logger.error('Error getting available models:', error);
      return [];
    }
  }

  /**
   * Health check for Ollama service
   */
  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: 5000
      });
      
      return {
        status: 'healthy',
        modelsAvailable: response.data.models?.length || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Clear conversation history for a patient
   */
  clearConversationHistory(patientId) {
    this.conversationHistory.delete(patientId);
  }

  /**
   * Get model performance stats
   */
  getModelStats() {
    return {
      activeConversations: this.conversationHistory.size,
      cacheSize: this.modelCache.size,
      defaultModel: this.defaultModel,
      medicalModel: this.medicalModel,
      embeddingModel: this.embeddingModel
    };
  }

  // Helper methods for text parsing
  extractTrends(text) { /* Implementation */ return []; }
  extractPredictions(text) { /* Implementation */ return []; }
  extractRisks(text) { /* Implementation */ return []; }
  extractInterventions(text) { /* Implementation */ return []; }
  extractConfidence(text) { /* Implementation */ return 0.8; }
  extractTests(text) { /* Implementation */ return []; }
  extractWarnings(text) { /* Implementation */ return []; }
  extractPriority(text) { /* Implementation */ return 'medium'; }
  categorizeRecommendation(text) { /* Implementation */ return 'general'; }
  
  // Additional prompt builders
  buildRecommendationsPrompt(profile, health, goals) { /* Implementation */ return ''; }
  buildChatPrompt(query, history, context) { /* Implementation */ return ''; }
  buildDocumentAnalysisPrompt(text, type) { /* Implementation */ return ''; }
  buildEducationPrompt(topic, profile, complexity) { /* Implementation */ return ''; }
  buildDataAnalysisPrompt(data, type) { /* Implementation */ return ''; }
  
  // Response parsers
  parseRecommendationsResponse(response) { /* Implementation */ return {}; }
  parseDocumentAnalysisResponse(response) { /* Implementation */ return {}; }
  parseEducationResponse(response) { /* Implementation */ return {}; }
  parseDataAnalysisResponse(response) { /* Implementation */ return {}; }
}

module.exports = new OllamaAIService();