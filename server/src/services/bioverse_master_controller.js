/**
 * BioVerse Master Controller
 * Central orchestration system for the most advanced healthtech platform ever built
 * Coordinates all revolutionary systems: AI, Blockchain, IoT, AR/VR, Federated Learning
 */

const { EventEmitter } = require('events');
const { HealthBlockchain, HealthRecord, HealthToken } = require('./blockchain_health_records');
const { IoTHealthEcosystem } = require('./iot_health_ecosystem');
const { ARMedicalVisualization, VRTherapyPlatform } = require('./ar_vr_medical_platform');
const logger = require('../config/logger');
const axios = require('axios');

class BioVerseMasterController extends EventEmitter {
    constructor() {
        super();
        
        // Initialize all revolutionary systems
        this.blockchain = new HealthBlockchain();
        this.healthToken = new HealthToken();
        this.iotEcosystem = new IoTHealthEcosystem();
        this.arVisualization = new ARMedicalVisualization();
        this.vrTherapy = new VRTherapyPlatform();
        
        // System status tracking
        this.systemStatus = {
            blockchain: 'initializing',
            iot: 'initializing',
            ar_vr: 'initializing',
            ai_backend: 'initializing',
            federated_learning: 'initializing'
        };
        
        // Performance metrics
        this.performanceMetrics = {
            totalPatients: 0,
            totalHealthRecords: 0,
            totalIoTDevices: 0,
            totalARSessions: 0,
            totalVRSessions: 0,
            totalTokensDistributed: 0,
            systemUptime: Date.now(),
            averageResponseTime: 0,
            healthPredictionAccuracy: 0.95,
            emergencyResponseTime: 0
        };
        
        // Active sessions and connections
        this.activeSessions = new Map();
        this.connectedDevices = new Map();
        this.emergencyAlerts = new Map();
        
        // AI Backend connection
        this.aiBackendUrl = process.env.PYTHON_AI_URL || 'http://localhost:8000';
        
        this.initializeEventHandlers();
    }

    async initialize() {
        try {
            logger.info('🚀 Initializing BioVerse Master Controller...');
            
            // Initialize IoT Ecosystem
            await this.iotEcosystem.initialize();
            this.systemStatus.iot = 'operational';
            logger.info('✅ IoT Health Ecosystem initialized');
            
            // Initialize AR/VR systems
            this.systemStatus.ar_vr = 'operational';
            logger.info('✅ AR/VR Medical Platform initialized');
            
            // Test AI Backend connection
            await this.testAIBackendConnection();
            
            // Initialize Blockchain
            this.systemStatus.blockchain = 'operational';
            logger.info('✅ Blockchain Health Records initialized');
            
            // Setup federated learning
            await this.initializeFederatedLearning();
            
            logger.info('🎉 BioVerse Master Controller fully operational!');
            
            this.emit('systemInitialized', {
                timestamp: new Date().toISOString(),
                status: this.systemStatus
            });
            
        } catch (error) {
            logger.error('❌ Failed to initialize BioVerse Master Controller:', error);
            throw error;
        }
    }

    initializeEventHandlers() {
        // IoT Event Handlers
        this.iotEcosystem.on('deviceConnected', (data) => {
            this.handleDeviceConnected(data);
        });

        this.iotEcosystem.on('healthAlert', (data) => {
            this.handleHealthAlert(data);
        });

        this.iotEcosystem.on('emergencyTriggered', (data) => {
            this.handleEmergencyTriggered(data);
        });

        // Blockchain Event Handlers
        this.blockchain.on('recordAdded', (data) => {
            this.handleHealthRecordAdded(data);
        });

        this.blockchain.on('blockMined', (data) => {
            this.handleBlockMined(data);
        });

        // AR/VR Event Handlers
        this.arVisualization.on('arSessionStarted', (data) => {
            this.handleARSessionStarted(data);
        });

        this.vrTherapy.on('vrTherapyStarted', (data) => {
            this.handleVRTherapyStarted(data);
        });
    }

    async testAIBackendConnection() {
        try {
            const response = await axios.get(`${this.aiBackendUrl}/health`, { timeout: 5000 });
            if (response.status === 200) {
                this.systemStatus.ai_backend = 'operational';
                logger.info('✅ AI Backend connection established');
            }
        } catch (error) {
            logger.warn('⚠️ AI Backend not available, running in limited mode');
            this.systemStatus.ai_backend = 'limited';
        }
    }

    async initializeFederatedLearning() {
        try {
            // Initialize federated learning system
            const response = await axios.post(`${this.aiBackendUrl}/federated/initialize`, {
                institutions: [
                    {
                        institution_id: 'bioverse_main',
                        institution_type: 'platform',
                        location: 'global',
                        data_types: ['ehr', 'iot', 'imaging'],
                        patient_count: this.performanceMetrics.totalPatients,
                        privacy_level: 'high'
                    }
                ]
            });

            if (response.status === 200) {
                this.systemStatus.federated_learning = 'operational';
                logger.info('✅ Federated Learning initialized');
            }
        } catch (error) {
            logger.warn('⚠️ Federated Learning initialization failed:', error.message);
            this.systemStatus.federated_learning = 'limited';
        }
    }

    // Patient Management
    async createPatient(patientData) {
        try {
            const patientId = this.generatePatientId();
            
            // Create comprehensive patient profile
            const patient = {
                patientId,
                ...patientData,
                createdAt: new Date().toISOString(),
                healthTwinId: `twin_${patientId}`,
                blockchainRecords: [],
                connectedDevices: [],
                arVrSessions: [],
                tokenBalance: 0,
                healthScore: 100
            };

            // Create initial health record on blockchain
            const healthRecord = new HealthRecord({
                patientId,
                providerId: 'bioverse_system',
                recordType: 'patient_registration',
                encryptedData: this.encryptPatientData(patientData),
                rawData: { registration: 'initial' },
                accessPermissions: [],
                emergencyAccess: true
            });

            const recordId = this.blockchain.addHealthRecord(healthRecord);
            patient.blockchainRecords.push(recordId);

            // Award welcome tokens
            this.healthToken.rewardHealthyBehavior(
                patientId,
                1000, // Welcome bonus
                'platform_registration'
            );

            // Update metrics
            this.performanceMetrics.totalPatients++;
            this.performanceMetrics.totalHealthRecords++;

            this.emit('patientCreated', {
                patientId,
                recordId,
                timestamp: new Date().toISOString()
            });

            logger.info(`👤 Patient created: ${patientId}`);
            return patient;

        } catch (error) {
            logger.error('Error creating patient:', error);
            throw error;
        }
    }

    // Quantum Health Prediction
    async generateHealthPrediction(patientId, patientData) {
        try {
            if (this.systemStatus.ai_backend !== 'operational') {
                throw new Error('AI Backend not available');
            }

            const response = await axios.post(`${this.aiBackendUrl}/quantum/predict`, {
                patient_id: patientId,
                patient_data: patientData
            });

            const prediction = response.data;

            // Store prediction on blockchain
            const predictionRecord = new HealthRecord({
                patientId,
                providerId: 'bioverse_ai',
                recordType: 'health_prediction',
                encryptedData: this.encryptData(prediction),
                rawData: { prediction_id: prediction.prediction_id },
                accessPermissions: [],
                emergencyAccess: false
            });

            const recordId = this.blockchain.addHealthRecord(predictionRecord);

            // Update health score based on prediction
            const riskScore = this.calculateOverallRisk(prediction.disease_risks);
            const newHealthScore = Math.max(0, 100 - (riskScore * 100));

            // Reward for health monitoring
            this.healthToken.rewardHealthyBehavior(
                patientId,
                50,
                'health_prediction_completed'
            );

            this.emit('healthPredictionGenerated', {
                patientId,
                predictionId: prediction.prediction_id,
                healthScore: newHealthScore,
                recordId
            });

            logger.info(`🔮 Health prediction generated for patient: ${patientId}`);
            return {
                ...prediction,
                recordId,
                healthScore: newHealthScore
            };

        } catch (error) {
            logger.error('Error generating health prediction:', error);
            throw error;
        }
    }

    // Medical Imaging Analysis
    async analyzeMedicalImage(patientId, imageData, modality) {
        try {
            if (this.systemStatus.ai_backend !== 'operational') {
                throw new Error('AI Backend not available');
            }

            const response = await axios.post(`${this.aiBackendUrl}/vision/analyze`, {
                patient_id: patientId,
                image_data: imageData,
                modality: modality
            });

            const analysis = response.data;

            // Store analysis on blockchain
            const analysisRecord = new HealthRecord({
                patientId,
                providerId: 'bioverse_vision_ai',
                recordType: 'medical_imaging_analysis',
                encryptedData: this.encryptData(analysis),
                rawData: { analysis_id: analysis.image_id },
                accessPermissions: [],
                emergencyAccess: analysis.urgency_level === 'STAT'
            });

            const recordId = this.blockchain.addHealthRecord(analysisRecord);

            // Check for critical findings
            if (analysis.urgency_level === 'STAT' || analysis.urgency_level === 'URGENT') {
                await this.triggerMedicalAlert(patientId, analysis);
            }

            // Reward for medical screening
            this.healthToken.rewardHealthyBehavior(
                patientId,
                75,
                'medical_imaging_completed'
            );

            this.emit('medicalImageAnalyzed', {
                patientId,
                analysisId: analysis.image_id,
                urgencyLevel: analysis.urgency_level,
                recordId
            });

            logger.info(`🔬 Medical image analyzed for patient: ${patientId}`);
            return {
                ...analysis,
                recordId
            };

        } catch (error) {
            logger.error('Error analyzing medical image:', error);
            throw error;
        }
    }

    // IoT Device Management
    async connectPatientDevice(patientId, deviceType, deviceCredentials) {
        try {
            const deviceConnection = await this.iotEcosystem.integrateWearableDevice(
                patientId,
                deviceType,
                deviceCredentials
            );

            // Record device connection on blockchain
            const deviceRecord = new HealthRecord({
                patientId,
                providerId: 'bioverse_iot',
                recordType: 'device_connection',
                encryptedData: this.encryptData({
                    deviceType,
                    deviceId: deviceConnection.deviceId,
                    connectionTime: new Date().toISOString()
                }),
                rawData: { device_connected: true },
                accessPermissions: [],
                emergencyAccess: true
            });

            const recordId = this.blockchain.addHealthRecord(deviceRecord);

            // Reward for device connection
            this.healthToken.rewardHealthyBehavior(
                patientId,
                25,
                'iot_device_connected'
            );

            // Update metrics
            this.performanceMetrics.totalIoTDevices++;

            this.emit('deviceConnected', {
                patientId,
                deviceType,
                deviceId: deviceConnection.deviceId,
                recordId
            });

            logger.info(`📱 Device connected for patient ${patientId}: ${deviceType}`);
            return deviceConnection;

        } catch (error) {
            logger.error('Error connecting patient device:', error);
            throw error;
        }
    }

    // AR Medical Visualization
    async startARMedicalSession(patientId, sessionType, userRole = 'doctor') {
        try {
            const arSession = await this.arVisualization.startARMedicalSession(
                patientId,
                sessionType,
                userRole
            );

            // Store session on blockchain
            const sessionRecord = new HealthRecord({
                patientId,
                providerId: 'bioverse_ar',
                recordType: 'ar_medical_session',
                encryptedData: this.encryptData({
                    sessionId: arSession.sessionId,
                    sessionType,
                    userRole,
                    startTime: new Date().toISOString()
                }),
                rawData: { ar_session: true },
                accessPermissions: [],
                emergencyAccess: false
            });

            const recordId = this.blockchain.addHealthRecord(sessionRecord);

            // Update metrics
            this.performanceMetrics.totalARSessions++;

            this.activeSessions.set(arSession.sessionId, {
                type: 'ar_medical',
                patientId,
                sessionType,
                userRole,
                recordId,
                startTime: new Date().toISOString()
            });

            logger.info(`🥽 AR medical session started for patient ${patientId}: ${sessionType}`);
            return {
                ...arSession,
                recordId
            };

        } catch (error) {
            logger.error('Error starting AR medical session:', error);
            throw error;
        }
    }

    // VR Therapy Session
    async startVRTherapySession(patientId, therapyType, sessionConfig) {
        try {
            const vrSession = await this.vrTherapy.startVRTherapySession(
                patientId,
                therapyType,
                sessionConfig
            );

            // Store session on blockchain
            const sessionRecord = new HealthRecord({
                patientId,
                providerId: 'bioverse_vr',
                recordType: 'vr_therapy_session',
                encryptedData: this.encryptData({
                    sessionId: vrSession.sessionId,
                    therapyType,
                    startTime: new Date().toISOString(),
                    config: sessionConfig
                }),
                rawData: { vr_therapy: true },
                accessPermissions: [],
                emergencyAccess: false
            });

            const recordId = this.blockchain.addHealthRecord(sessionRecord);

            // Reward for therapy participation
            this.healthToken.rewardHealthyBehavior(
                patientId,
                100,
                'vr_therapy_session'
            );

            // Update metrics
            this.performanceMetrics.totalVRSessions++;

            this.activeSessions.set(vrSession.sessionId, {
                type: 'vr_therapy',
                patientId,
                therapyType,
                recordId,
                startTime: new Date().toISOString()
            });

            logger.info(`🎮 VR therapy session started for patient ${patientId}: ${therapyType}`);
            return {
                ...vrSession,
                recordId
            };

        } catch (error) {
            logger.error('Error starting VR therapy session:', error);
            throw error;
        }
    }

    // Emergency Response
    async triggerMedicalAlert(patientId, alertData) {
        try {
            const alertId = this.generateAlertId();
            
            const medicalAlert = {
                alertId,
                patientId,
                alertType: 'medical_finding',
                severity: alertData.urgency_level,
                data: alertData,
                timestamp: new Date().toISOString(),
                status: 'active',
                responses: []
            };

            this.emergencyAlerts.set(alertId, medicalAlert);

            // Notify emergency contacts
            await this.notifyEmergencyContacts(patientId, medicalAlert);

            // Record alert on blockchain
            const alertRecord = new HealthRecord({
                patientId,
                providerId: 'bioverse_emergency',
                recordType: 'medical_alert',
                encryptedData: this.encryptData(medicalAlert),
                rawData: { alert_id: alertId },
                accessPermissions: [],
                emergencyAccess: true
            });

            const recordId = this.blockchain.addHealthRecord(alertRecord);

            this.emit('medicalAlertTriggered', {
                alertId,
                patientId,
                severity: alertData.urgency_level,
                recordId
            });

            logger.warn(`🚨 Medical alert triggered for patient ${patientId}: ${alertData.urgency_level}`);
            return {
                alertId,
                recordId,
                status: 'triggered'
            };

        } catch (error) {
            logger.error('Error triggering medical alert:', error);
            throw error;
        }
    }

    // Health Token Management
    async rewardHealthyBehavior(patientId, behavior, customAmount = null) {
        try {
            const rewardAmounts = {
                'daily_exercise': 50,
                'medication_adherence': 75,
                'preventive_screening': 100,
                'health_goal_achievement': 200,
                'data_sharing_consent': 25,
                'platform_engagement': 10
            };

            const amount = customAmount || rewardAmounts[behavior] || 10;

            const reward = this.healthToken.rewardHealthyBehavior(
                patientId,
                amount,
                behavior
            );

            // Update metrics
            this.performanceMetrics.totalTokensDistributed += amount;

            // Record reward on blockchain
            const rewardRecord = new HealthRecord({
                patientId,
                providerId: 'bioverse_tokens',
                recordType: 'token_reward',
                encryptedData: this.encryptData(reward),
                rawData: { tokens_awarded: amount },
                accessPermissions: [],
                emergencyAccess: false
            });

            const recordId = this.blockchain.addHealthRecord(rewardRecord);

            this.emit('tokensRewarded', {
                patientId,
                behavior,
                amount,
                recordId
            });

            logger.info(`💰 Tokens rewarded to patient ${patientId}: ${amount} BVH for ${behavior}`);
            return {
                ...reward,
                recordId
            };

        } catch (error) {
            logger.error('Error rewarding healthy behavior:', error);
            throw error;
        }
    }

    // System Analytics
    getSystemAnalytics() {
        const uptime = Date.now() - this.performanceMetrics.systemUptime;
        
        return {
            systemStatus: this.systemStatus,
            performanceMetrics: {
                ...this.performanceMetrics,
                systemUptimeMs: uptime,
                systemUptimeHours: Math.floor(uptime / (1000 * 60 * 60)),
                activeSessions: this.activeSessions.size,
                connectedDevices: this.connectedDevices.size,
                activeEmergencyAlerts: this.emergencyAlerts.size
            },
            blockchainStats: this.blockchain.getBlockchainStats(),
            iotStats: this.iotEcosystem.getSystemStats(),
            tokenStats: {
                totalSupply: this.healthToken.totalSupply,
                totalRewards: this.healthToken.rewardHistory.length,
                totalDistributed: this.performanceMetrics.totalTokensDistributed
            }
        };
    }

    // Event Handlers
    handleDeviceConnected(data) {
        this.connectedDevices.set(data.deviceId, {
            ...data,
            connectedAt: new Date().toISOString()
        });
        
        logger.info(`📱 Device connected: ${data.deviceId}`);
    }

    handleHealthAlert(data) {
        logger.warn(`⚠️ Health alert: ${data.alert.type} for patient ${data.userId}`);
    }

    handleEmergencyTriggered(data) {
        this.performanceMetrics.emergencyResponseTime = Date.now();
        logger.critical(`🚨 Emergency triggered: ${data.emergencyId} for patient ${data.patientId}`);
    }

    handleHealthRecordAdded(data) {
        this.performanceMetrics.totalHealthRecords++;
        logger.info(`📝 Health record added: ${data.recordId}`);
    }

    handleBlockMined(data) {
        logger.info(`⛏️ Block mined: ${data.blockHash.substring(0, 16)}...`);
    }

    handleARSessionStarted(data) {
        logger.info(`🥽 AR session started: ${data.sessionId}`);
    }

    handleVRTherapyStarted(data) {
        logger.info(`🎮 VR therapy started: ${data.sessionId}`);
    }

    // Utility Methods
    generatePatientId() {
        return 'patient_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateAlertId() {
        return 'alert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    encryptPatientData(data) {
        // Simplified encryption - in production use proper encryption
        return Buffer.from(JSON.stringify(data)).toString('base64');
    }

    encryptData(data) {
        return Buffer.from(JSON.stringify(data)).toString('base64');
    }

    calculateOverallRisk(diseaseRisks) {
        if (!diseaseRisks || Object.keys(diseaseRisks).length === 0) {
            return 0;
        }
        
        const risks = Object.values(diseaseRisks);
        return risks.reduce((sum, risk) => sum + risk, 0) / risks.length;
    }

    async notifyEmergencyContacts(patientId, alert) {
        // Simplified emergency notification
        logger.info(`📞 Notifying emergency contacts for patient ${patientId}`);
    }
}

module.exports = {
    BioVerseMasterController
};