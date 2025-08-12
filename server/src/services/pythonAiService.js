const axios = require('axios');
const logger = require('./logger')('PythonAiService');

class PythonAiService {
    constructor() {
        this.baseUrl = process.env.PYTHON_AI_URL || 'http://localhost:8000';
        this.apiKey = process.env.PYTHON_AI_API_KEY || 'bioverse_ai_integration_key';
        this.isAvailable = false;
        this.client = axios.create({
            baseURL: this.baseUrl,
            timeout: 30000,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        this.initialize();
    }

    async initialize() {
        try {
            // Check if Python AI service is available
            await this.healthCheck();
            this.isAvailable = true;
            logger.info('Python AI service initialized successfully');
        } catch (error) {
            logger.warn('Python AI service not available:', error.message);
            this.isAvailable = false;
        }
    }

    async healthCheck() {
        try {
            const response = await this.client.get('/health');
            return response.data;
        } catch (error) {
            throw new Error(`Python AI service health check failed: ${error.message}`);
        }
    }

    // Health Twin Operations
    async createHealthTwin(patientData) {
        try {
            if (!this.isAvailable) {
                throw new Error('Python AI service not available');
            }

            const response = await this.client.post('/api/v1/health-twins/create', {
                patient_id: patientData.patient_id,
                vitals: patientData.vitals || {},
                medical_history: patientData.medical_history || [],
                medications: patientData.medications || [],
                lifestyle: patientData.lifestyle || {},
                symptoms: patientData.symptoms || [],
                lab_results: patientData.lab_results || {}
            });

            logger.info(`Health twin created for patient ${patientData.patient_id}`);
            return response.data;
        } catch (error) {
            logger.error('Error creating health twin:', error.message);
            throw error;
        }
    }

    async getHealthTwin(twinId) {
        try {
            if (!this.isAvailable) {
                throw new Error('Python AI service not available');
            }

            const response = await this.client.get(`/api/v1/health-twins/${twinId}`);
            return response.data;
        } catch (error) {
            logger.error('Error getting health twin:', error.message);
            throw error;
        }
    }

    async updateHealthTwin(twinId, updateData) {
        try {
            if (!this.isAvailable) {
                throw new Error('Python AI service not available');
            }

            const response = await this.client.put(`/api/v1/health-twins/${twinId}`, updateData);
            return response.data;
        } catch (error) {
            logger.error('Error updating health twin:', error.message);
            throw error;
        }
    }

    // ML Predictions
    async predictHealthScore(features) {
        try {
            if (!this.isAvailable) {
                throw new Error('Python AI service not available');
            }

            const response = await this.client.post('/api/v1/ml/predict/health-score', {
                features: features
            });

            return response.data;
        } catch (error) {
            logger.error('Error predicting health score:', error.message);
            throw error;
        }
    }

    async predictDiseaseRisks(features) {
        try {
            if (!this.isAvailable) {
                throw new Error('Python AI service not available');
            }

            const response = await this.client.post('/api/v1/ml/predict/disease-risks', {
                features: features
            });

            return response.data;
        } catch (error) {
            logger.error('Error predicting disease risks:', error.message);
            throw error;
        }
    }

    // Visualizations
    async create3DHealthTwin(patientId, patientData) {
        try {
            if (!this.isAvailable) {
                throw new Error('Python AI service not available');
            }

            const response = await this.client.post('/api/v1/viz/3d-health-twin', {
                patient_id: patientId,
                patient_data: patientData
            });

            return response.data;
        } catch (error) {
            logger.error('Error creating 3D health twin:', error.message);
            throw error;
        }
    }

    async createHealthDashboard(patientData) {
        try {
            if (!this.isAvailable) {
                throw new Error('Python AI service not available');
            }

            const response = await this.client.post('/api/v1/viz/health-dashboard', {
                patient_data: patientData
            });

            return response.data;
        } catch (error) {
            logger.error('Error creating health dashboard:', error.message);
            throw error;
        }
    }

    // Analytics
    async analyzeSymptoms(symptoms) {
        try {
            if (!this.isAvailable) {
                throw new Error('Python AI service not available');
            }

            const response = await this.client.post('/api/v1/analytics/analyze-symptoms', {
                symptoms: symptoms
            });

            return response.data;
        } catch (error) {
            logger.error('Error analyzing symptoms:', error.message);
            throw error;
        }
    }

    async generateHealthRecommendations(healthProfile) {
        try {
            if (!this.isAvailable) {
                throw new Error('Python AI service not available');
            }

            const response = await this.client.post('/api/v1/analytics/generate-recommendations', {
                health_profile: healthProfile
            });

            return response.data;
        } catch (error) {
            logger.error('Error generating recommendations:', error.message);
            throw error;
        }
    }

    async performHealthAnalysis(patientData) {
        try {
            if (!this.isAvailable) {
                throw new Error('Python AI service not available');
            }

            const response = await this.client.post('/api/v1/analytics/health-analysis', {
                patient_data: patientData
            });

            return response.data;
        } catch (error) {
            logger.error('Error performing health analysis:', error.message);
            throw error;
        }
    }

    // Utility methods
    getStatus() {
        return {
            available: this.isAvailable,
            baseUrl: this.baseUrl,
            lastChecked: new Date().toISOString()
        };
    }

    async reconnect() {
        try {
            await this.initialize();
            return this.isAvailable;
        } catch (error) {
            logger.error('Error reconnecting to Python AI service:', error.message);
            return false;
        }
    }
}

// Export singleton instance
module.exports = new PythonAiService();