/**
 * Python AI Service Integration
 * Handles communication between Node.js server and Python AI backend
 */

const axios = require('axios');
const { logger } = require('./logger');

class PythonAIService {
  constructor() {
    this.baseURL = process.env.PYTHON_AI_URL || 'http://localhost:8000';
    this.apiKey = process.env.PYTHON_AI_API_KEY || 'bioverse-ai-key';
    this.timeout = parseInt(process.env.PYTHON_AI_TIMEOUT) || 30000;
    this.retryAttempts = parseInt(process.env.PYTHON_AI_RETRY_ATTEMPTS) || 3;
    this.isConnected = false;
    
    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        'User-Agent': 'BioVerse-NodeJS-Server/1.0.0'
      }
    });

    // Setup request/response interceptors
    this.setupInterceptors();
    
    // Initialize connection
    this.initialize();
  }

  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`🐍 Python AI Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('🐍 Python AI Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`🐍 Python AI Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error(`🐍 Python AI Response Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  async initialize() {
    try {
      logger.info('🐍 Initializing Python AI Service connection...');
      await this.checkHealth();
      this.isConnected = true;
      logger.info('✅ Python AI Service connected successfully');
    } catch (error) {
      logger.warn('⚠️ Python AI Service not available on startup:', error.message);
      this.isConnected = false;
      // Start retry mechanism
      this.startHealthCheckInterval();
    }
  }

  startHealthCheckInterval() {
    // Check health every 30 seconds if not connected
    const interval = setInterval(async () => {
      if (!this.isConnected) {
        try {
          await this.checkHealth();
          this.isConnected = true;
          logger.info('✅ Python AI Service reconnected');
          clearInterval(interval);
        } catch (error) {
          logger.debug('🔄 Python AI Service still not available');
        }
      } else {
        clearInterval(interval);
      }
    }, 30000);
  }

  async checkHealth() {
    const response = await this.client.get('/health');
    return response.data;
  }

  async retryRequest(requestFn, attempts = this.retryAttempts) {
    for (let i = 0; i < attempts; i++) {
      try {
        return await requestFn();
      } catch (error) {
        if (i === attempts - 1) throw error;
        
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        logger.warn(`🔄 Retrying Python AI request in ${delay}ms (attempt ${i + 1}/${attempts})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Health Twin Services
  async createHealthTwin(patientData) {
    return this.retryRequest(async () => {
      const response = await this.client.post('/api/v1/health-twins/create', patientData);
      return response.data;
    });
  }

  async updateHealthTwin(twinId, updateData) {
    return this.retryRequest(async () => {
      const response = await this.client.put(`/api/v1/health-twins/${twinId}`, updateData);
      return response.data;
    });
  }

  async getHealthTwin(twinId) {
    return this.retryRequest(async () => {
      const response = await this.client.get(`/api/v1/health-twins/${twinId}`);
      return response.data;
    });
  }

  async getHealthTwinPredictions(twinId, timeframe = '30d') {
    return this.retryRequest(async () => {
      const response = await this.client.get(`/api/v1/health-twins/${twinId}/predictions`, {
        params: { timeframe }
      });
      return response.data;
    });
  }

  async getHealthTwinVisualization(twinId, visualizationType = '3d') {
    return this.retryRequest(async () => {
      const response = await this.client.get(`/api/v1/health-twins/${twinId}/visualization`, {
        params: { type: visualizationType }
      });
      return response.data;
    });
  }

  // Machine Learning Services
  async analyzeSymptoms(symptoms, patientHistory = {}) {
    return this.retryRequest(async () => {
      const response = await this.client.post('/api/v1/ml/analyze-symptoms', {
        symptoms,
        patient_history: patientHistory
      });
      return response.data;
    });
  }

  async predictHealthRisks(patientData) {
    return this.retryRequest(async () => {
      const response = await this.client.post('/api/v1/ml/predict-risks', patientData);
      return response.data;
    });
  }

  async generateHealthInsights(patientId, dataPoints) {
    return this.retryRequest(async () => {
      const response = await this.client.post('/api/v1/ml/health-insights', {
        patient_id: patientId,
        data_points: dataPoints
      });
      return response.data;
    });
  }

  async runDiagnosticModel(modelName, inputData) {
    return this.retryRequest(async () => {
      const response = await this.client.post(`/api/v1/ml/models/${modelName}/predict`, inputData);
      return response.data;
    });
  }

  // Analytics Services
  async getPopulationHealthAnalytics(region, timeframe = '1y') {
    return this.retryRequest(async () => {
      const response = await this.client.get('/api/v1/analytics/population-health', {
        params: { region, timeframe }
      });
      return response.data;
    });
  }

  async getDiseaseSurveillanceData(disease, region, timeframe = '6m') {
    return this.retryRequest(async () => {
      const response = await this.client.get('/api/v1/analytics/disease-surveillance', {
        params: { disease, region, timeframe }
      });
      return response.data;
    });
  }

  async generateHealthReport(reportType, parameters) {
    return this.retryRequest(async () => {
      const response = await this.client.post('/api/v1/analytics/reports', {
        report_type: reportType,
        parameters
      });
      return response.data;
    });
  }

  // Visualization Services
  async generateVisualization(visualizationType, data, options = {}) {
    return this.retryRequest(async () => {
      const response = await this.client.post('/api/v1/viz/generate', {
        type: visualizationType,
        data,
        options
      });
      return response.data;
    });
  }

  async getInteractiveChart(chartType, data, config = {}) {
    return this.retryRequest(async () => {
      const response = await this.client.post('/api/v1/viz/interactive-chart', {
        chart_type: chartType,
        data,
        config
      });
      return response.data;
    });
  }

  // Ollama AI Services
  async chatWithAI(message, context = {}, model = 'deepseek-r1:1.5b') {
    return this.retryRequest(async () => {
      const response = await this.client.post('/api/v1/ai/chat', {
        message,
        context,
        model
      });
      return response.data;
    });
  }

  async analyzeWithAI(analysisType, data, instructions = '') {
    return this.retryRequest(async () => {
      const response = await this.client.post('/api/v1/ai/analyze', {
        analysis_type: analysisType,
        data,
        instructions
      });
      return response.data;
    });
  }

  // Utility Methods
  isAvailable() {
    return this.isConnected;
  }

  async getServiceStatus() {
    try {
      const health = await this.checkHealth();
      return {
        connected: true,
        status: health.status,
        services: health.services,
        version: health.version,
        timestamp: health.timestamp
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Batch operations
  async batchHealthTwinUpdates(updates) {
    return this.retryRequest(async () => {
      const response = await this.client.post('/api/v1/health-twins/batch-update', {
        updates
      });
      return response.data;
    });
  }

  async batchAnalyzePatients(patientIds, analysisType) {
    return this.retryRequest(async () => {
      const response = await this.client.post('/api/v1/ml/batch-analyze', {
        patient_ids: patientIds,
        analysis_type: analysisType
      });
      return response.data;
    });
  }
}

// Create singleton instance
const pythonAIService = new PythonAIService();

module.exports = {
  pythonAIService,
  PythonAIService
};