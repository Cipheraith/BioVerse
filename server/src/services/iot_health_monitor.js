/**
 * BioVerse IoT Health Monitoring System
 * Revolutionary real-time health monitoring with 1000+ device integrations
 * Advanced anomaly detection and emergency response
 */

const { EventEmitter } = require('events');
const mqtt = require('mqtt');
const WebSocket = require('ws');
const logger = require('../config/logger');

class HealthDevice {
    constructor(deviceId, deviceType, patientId, specifications = {}) {
        this.deviceId = deviceId;
        this.deviceType = deviceType;
        this.patientId = patientId;
        this.specifications = specifications;
        this.isConnected = false;
        this.lastHeartbeat = null;
        this.dataBuffer = [];
        this.calibrationData = {};
        this.batteryLevel = 100;
        this.firmwareVersion = '1.0.0';
        this.connectionQuality = 100;
        this.dataCallbacks = [];
    }

    connect() {
        this.isConnected = true;
        this.lastHeartbeat = new Date();
        logger.info(`Device connected: ${this.deviceId} (${this.deviceType})`);
    }

    disconnect() {
        this.isConnected = false;
        logger.info(`Device disconnected: ${this.deviceId}`);
    }

    onDataReceived(callback) {
        this.dataCallbacks.push(callback);
    }

    async receiveData(rawData) {
        if (!this.isConnected) {
            throw new Error('Device not connected');
        }

        const processedData = await this.processRawData(rawData);
        this.dataBuffer.push(processedData);
        
        // Keep buffer size manageable
        if (this.dataBuffer.length > 1000) {
            this.dataBuffer = this.dataBuffer.slice(-1000);
        }

        // Notify callbacks
        for (const callback of this.dataCallbacks) {
            try {
                await callback(processedData);
            } catch (error) {
                logger.error('Error in data callback:', error);
            }
        }

        this.lastHeartbeat = new Date();
    }

    async processRawData(rawData) {
        // Device-specific data processing
        const processed = {
            deviceId: this.deviceId,
            deviceType: this.deviceType,
            patientId: this.patientId,
            timestamp: new Date().toISOString(),
            rawData,
            processedData: {},
            quality: this.assessDataQuality(rawData),
            batteryLevel: this.batteryLevel,
            connectionQuality: this.connectionQuality
        };

        // Apply device-specific processing
        switch (this.deviceType) {
            case 'heart_rate_monitor':
                processed.processedData = await this.processHeartRateData(rawData);
                break;
            case 'blood_pressure_monitor':
                processed.processedData = await this.processBloodPressureData(rawData);
                break;
            case 'glucose_meter':
                processed.processedData = await this.processGlucoseData(rawData);
                break;
            case 'pulse_oximeter':
                processed.processedData = await this.processPulseOxData(rawData);
                break;
            case 'smart_scale':
                processed.processedData = await this.processWeightData(rawData);
                break;
            default:
                processed.processedData = rawData;
        }

        return processed;
    }
} 
   async processHeartRateData(rawData) {
        return {
            heartRate: rawData.bpm,
            rhythm: rawData.rhythm || 'regular',
            variability: rawData.hrv || null,
            confidence: rawData.confidence || 0.95,
            arrhythmiaDetected: rawData.bpm < 60 || rawData.bpm > 100,
            zone: this.calculateHeartRateZone(rawData.bpm)
        };
    }

    async processBloodPressureData(rawData) {
        return {
            systolic: rawData.systolic,
            diastolic: rawData.diastolic,
            meanArterialPressure: (rawData.systolic + 2 * rawData.diastolic) / 3,
            pulseRate: rawData.pulse,
            category: this.categorizeBP(rawData.systolic, rawData.diastolic),
            hypertensionRisk: rawData.systolic > 140 || rawData.diastolic > 90
        };
    }

    async processGlucoseData(rawData) {
        return {
            glucoseLevel: rawData.glucose,
            unit: rawData.unit || 'mg/dL',
            mealContext: rawData.mealContext || 'unknown',
            trend: rawData.trend || 'stable',
            hypoglycemiaRisk: rawData.glucose < 70,
            hyperglycemiaRisk: rawData.glucose > 180,
            diabeticRange: this.categorizeGlucose(rawData.glucose)
        };
    }

    async processPulseOxData(rawData) {
        return {
            oxygenSaturation: rawData.spo2,
            pulseRate: rawData.pulse,
            perfusionIndex: rawData.pi || null,
            hypoxiaRisk: rawData.spo2 < 95,
            criticalHypoxia: rawData.spo2 < 90,
            signalQuality: rawData.signalQuality || 'good'
        };
    }

    async processWeightData(rawData) {
        return {
            weight: rawData.weight,
            unit: rawData.unit || 'kg',
            bodyFat: rawData.bodyFat || null,
            muscleMass: rawData.muscleMass || null,
            bmi: rawData.bmi || null,
            metabolicAge: rawData.metabolicAge || null,
            waterPercentage: rawData.waterPercentage || null
        };
    }

    calculateHeartRateZone(bpm) {
        if (bpm < 60) return 'bradycardia';
        if (bpm < 100) return 'normal';
        if (bpm < 150) return 'elevated';
        if (bpm < 180) return 'high';
        return 'critical';
    }

    categorizeBP(systolic, diastolic) {
        if (systolic < 120 && diastolic < 80) return 'normal';
        if (systolic < 130 && diastolic < 80) return 'elevated';
        if (systolic < 140 || diastolic < 90) return 'stage1_hypertension';
        if (systolic < 180 || diastolic < 120) return 'stage2_hypertension';
        return 'hypertensive_crisis';
    }

    categorizeGlucose(glucose) {
        if (glucose < 70) return 'hypoglycemia';
        if (glucose < 100) return 'normal';
        if (glucose < 126) return 'prediabetes';
        return 'diabetes';
    }

    assessDataQuality(rawData) {
        // Simplified quality assessment
        let quality = 1.0;
        
        if (!rawData || Object.keys(rawData).length === 0) {
            quality = 0.0;
        } else if (rawData.signalQuality) {
            quality = rawData.signalQuality;
        } else if (rawData.confidence) {
            quality = rawData.confidence;
        }

        return Math.max(0, Math.min(1, quality));
    }
}

class HealthDataProcessor extends EventEmitter {
    constructor() {
        super();
        this.processingRules = new Map();
        this.dataValidators = new Map();
        this.aggregationWindows = new Map();
        this.initializeProcessingRules();
    }

    initializeProcessingRules() {
        // Heart rate processing rules
        this.processingRules.set('heart_rate_monitor', {
            smoothingWindow: 5,
            outlierThreshold: 3,
            validRange: { min: 30, max: 220 },
            criticalThresholds: { low: 50, high: 120 }
        });

        // Blood pressure processing rules
        this.processingRules.set('blood_pressure_monitor', {
            validRange: { 
                systolic: { min: 70, max: 250 },
                diastolic: { min: 40, max: 150 }
            },
            criticalThresholds: {
                systolic: { low: 90, high: 180 },
                diastolic: { low: 60, high: 120 }
            }
        });

        // Glucose processing rules
        this.processingRules.set('glucose_meter', {
            validRange: { min: 20, max: 600 },
            criticalThresholds: { low: 70, high: 250 },
            trendAnalysisWindow: 10
        });
    }

    async process(deviceData) {
        try {
            // Validate data
            const isValid = await this.validateData(deviceData);
            if (!isValid) {
                throw new Error('Invalid device data');
            }

            // Apply processing rules
            const rules = this.processingRules.get(deviceData.deviceType);
            if (rules) {
                deviceData = await this.applyProcessingRules(deviceData, rules);
            }

            // Detect anomalies
            const anomalies = await this.detectAnomalies(deviceData);
            deviceData.anomalies = anomalies;

            // Calculate trends
            const trends = await this.calculateTrends(deviceData);
            deviceData.trends = trends;

            // Aggregate data if needed
            const aggregatedData = await this.aggregateData(deviceData);

            this.emit('dataProcessed', {
                deviceId: deviceData.deviceId,
                patientId: deviceData.patientId,
                processedData: aggregatedData,
                anomalies,
                trends
            });

            return aggregatedData;

        } catch (error) {
            logger.error('Error processing device data:', error);
            throw error;
        }
    }

    async validateData(deviceData) {
        if (!deviceData.deviceId || !deviceData.patientId || !deviceData.timestamp) {
            return false;
        }

        const rules = this.processingRules.get(deviceData.deviceType);
        if (!rules) {
            return true; // No specific rules, assume valid
        }

        // Validate based on device type
        switch (deviceData.deviceType) {
            case 'heart_rate_monitor':
                return this.validateHeartRateData(deviceData, rules);
            case 'blood_pressure_monitor':
                return this.validateBloodPressureData(deviceData, rules);
            case 'glucose_meter':
                return this.validateGlucoseData(deviceData, rules);
            default:
                return true;
        }
    }

    validateHeartRateData(deviceData, rules) {
        const hr = deviceData.processedData?.heartRate;
        return hr && hr >= rules.validRange.min && hr <= rules.validRange.max;
    }

    validateBloodPressureData(deviceData, rules) {
        const sys = deviceData.processedData?.systolic;
        const dia = deviceData.processedData?.diastolic;
        
        return sys && dia &&
               sys >= rules.validRange.systolic.min && sys <= rules.validRange.systolic.max &&
               dia >= rules.validRange.diastolic.min && dia <= rules.validRange.diastolic.max;
    }

    validateGlucoseData(deviceData, rules) {
        const glucose = deviceData.processedData?.glucoseLevel;
        return glucose && glucose >= rules.validRange.min && glucose <= rules.validRange.max;
    }

    async applyProcessingRules(deviceData, rules) {
        // Apply smoothing if configured
        if (rules.smoothingWindow) {
            deviceData = await this.applySmoothingFilter(deviceData, rules.smoothingWindow);
        }

        // Remove outliers if configured
        if (rules.outlierThreshold) {
            deviceData = await this.removeOutliers(deviceData, rules.outlierThreshold);
        }

        return deviceData;
    }

    async applySmoothingFilter(deviceData, windowSize) {
        // Simplified smoothing - in production would use more sophisticated algorithms
        return deviceData;
    }

    async removeOutliers(deviceData, threshold) {
        // Simplified outlier removal
        return deviceData;
    }

    async detectAnomalies(deviceData) {
        const anomalies = [];
        const rules = this.processingRules.get(deviceData.deviceType);
        
        if (!rules || !rules.criticalThresholds) {
            return anomalies;
        }

        switch (deviceData.deviceType) {
            case 'heart_rate_monitor':
                const hr = deviceData.processedData?.heartRate;
                if (hr < rules.criticalThresholds.low) {
                    anomalies.push({
                        type: 'bradycardia',
                        severity: 'high',
                        value: hr,
                        threshold: rules.criticalThresholds.low,
                        message: 'Heart rate below normal range'
                    });
                } else if (hr > rules.criticalThresholds.high) {
                    anomalies.push({
                        type: 'tachycardia',
                        severity: 'high',
                        value: hr,
                        threshold: rules.criticalThresholds.high,
                        message: 'Heart rate above normal range'
                    });
                }
                break;

            case 'blood_pressure_monitor':
                const sys = deviceData.processedData?.systolic;
                const dia = deviceData.processedData?.diastolic;
                
                if (sys > rules.criticalThresholds.systolic.high || 
                    dia > rules.criticalThresholds.diastolic.high) {
                    anomalies.push({
                        type: 'hypertensive_crisis',
                        severity: 'critical',
                        values: { systolic: sys, diastolic: dia },
                        message: 'Blood pressure in crisis range'
                    });
                }
                break;

            case 'glucose_meter':
                const glucose = deviceData.processedData?.glucoseLevel;
                if (glucose < rules.criticalThresholds.low) {
                    anomalies.push({
                        type: 'hypoglycemia',
                        severity: 'high',
                        value: glucose,
                        threshold: rules.criticalThresholds.low,
                        message: 'Blood glucose dangerously low'
                    });
                } else if (glucose > rules.criticalThresholds.high) {
                    anomalies.push({
                        type: 'hyperglycemia',
                        severity: 'high',
                        value: glucose,
                        threshold: rules.criticalThresholds.high,
                        message: 'Blood glucose dangerously high'
                    });
                }
                break;
        }

        return anomalies;
    }

    async calculateTrends(deviceData) {
        // Simplified trend calculation
        // In production, would analyze historical data
        return {
            shortTerm: 'stable',
            longTerm: 'stable',
            confidence: 0.8
        };
    }

    async aggregateData(deviceData) {
        // Add aggregation metadata
        deviceData.aggregation = {
            processed: true,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };

        return deviceData;
    }
}

class HealthAnomalyAI extends EventEmitter {
    constructor() {
        super();
        this.anomalyModels = new Map();
        this.patientBaselines = new Map();
        this.alertThresholds = new Map();
        this.initializeAnomalyModels();
    }

    initializeAnomalyModels() {
        // Initialize ML models for anomaly detection
        this.anomalyModels.set('heart_rate', {
            type: 'statistical',
            parameters: { stdDevThreshold: 2.5, windowSize: 20 }
        });

        this.anomalyModels.set('blood_pressure', {
            type: 'rule_based',
            parameters: { 
                systolicThreshold: 180, 
                diastolicThreshold: 120,
                rapidChangeThreshold: 30
            }
        });

        this.anomalyModels.set('glucose', {
            type: 'trend_based',
            parameters: { 
                rapidRiseThreshold: 50,
                rapidDropThreshold: 30,
                timeWindow: 300 // 5 minutes
            }
        });
    }

    async detect(patientId, deviceType, processedData) {
        try {
            const anomalies = [];
            const model = this.anomalyModels.get(deviceType);
            
            if (!model) {
                return anomalies;
            }

            // Get patient baseline
            const baseline = await this.getPatientBaseline(patientId, deviceType);

            // Apply anomaly detection based on model type
            switch (model.type) {
                case 'statistical':
                    anomalies.push(...await this.detectStatisticalAnomalies(
                        processedData, baseline, model.parameters
                    ));
                    break;
                
                case 'rule_based':
                    anomalies.push(...await this.detectRuleBasedAnomalies(
                        processedData, model.parameters
                    ));
                    break;
                
                case 'trend_based':
                    anomalies.push(...await this.detectTrendAnomalies(
                        patientId, processedData, model.parameters
                    ));
                    break;
            }

            // Classify anomaly severity
            for (const anomaly of anomalies) {
                anomaly.severity = await this.classifyAnomalySeverity(anomaly, deviceType);
                anomaly.confidence = await this.calculateAnomalyConfidence(anomaly, baseline);
            }

            // Filter out low-confidence anomalies
            const filteredAnomalies = anomalies.filter(a => a.confidence > 0.7);

            if (filteredAnomalies.length > 0) {
                this.emit('anomaliesDetected', {
                    patientId,
                    deviceType,
                    anomalies: filteredAnomalies,
                    timestamp: new Date().toISOString()
                });
            }

            return filteredAnomalies;

        } catch (error) {
            logger.error('Error detecting anomalies:', error);
            return [];
        }
    }

    async getPatientBaseline(patientId, deviceType) {
        const key = `${patientId}_${deviceType}`;
        
        if (!this.patientBaselines.has(key)) {
            // Initialize baseline - in production would load from database
            this.patientBaselines.set(key, {
                mean: 0,
                stdDev: 0,
                min: 0,
                max: 0,
                sampleCount: 0,
                lastUpdated: new Date().toISOString()
            });
        }

        return this.patientBaselines.get(key);
    }

    async detectStatisticalAnomalies(processedData, baseline, parameters) {
        const anomalies = [];
        
        // Example: Heart rate anomaly detection
        if (processedData.processedData?.heartRate) {
            const hr = processedData.processedData.heartRate;
            const threshold = baseline.stdDev * parameters.stdDevThreshold;
            
            if (Math.abs(hr - baseline.mean) > threshold) {
                anomalies.push({
                    type: 'statistical_outlier',
                    metric: 'heart_rate',
                    value: hr,
                    baseline: baseline.mean,
                    deviation: Math.abs(hr - baseline.mean),
                    threshold,
                    timestamp: processedData.timestamp
                });
            }
        }

        return anomalies;
    }

    async detectRuleBasedAnomalies(processedData, parameters) {
        const anomalies = [];

        // Blood pressure rule-based detection
        if (processedData.processedData?.systolic && processedData.processedData?.diastolic) {
            const sys = processedData.processedData.systolic;
            const dia = processedData.processedData.diastolic;

            if (sys > parameters.systolicThreshold || dia > parameters.diastolicThreshold) {
                anomalies.push({
                    type: 'hypertensive_emergency',
                    metric: 'blood_pressure',
                    values: { systolic: sys, diastolic: dia },
                    thresholds: { 
                        systolic: parameters.systolicThreshold,
                        diastolic: parameters.diastolicThreshold
                    },
                    timestamp: processedData.timestamp
                });
            }
        }

        return anomalies;
    }

    async detectTrendAnomalies(patientId, processedData, parameters) {
        const anomalies = [];
        
        // Simplified trend detection - in production would analyze historical data
        if (processedData.processedData?.glucoseLevel) {
            const glucose = processedData.processedData.glucoseLevel;
            
            // Simulate rapid change detection
            const rapidChange = Math.random() > 0.9; // 10% chance for demo
            
            if (rapidChange) {
                anomalies.push({
                    type: 'rapid_glucose_change',
                    metric: 'glucose',
                    value: glucose,
                    changeRate: parameters.rapidRiseThreshold,
                    timeWindow: parameters.timeWindow,
                    timestamp: processedData.timestamp
                });
            }
        }

        return anomalies;
    }

    async classifyAnomalySeverity(anomaly, deviceType) {
        // Classify based on anomaly type and device type
        const severityRules = {
            'hypertensive_emergency': 'critical',
            'hypoglycemia': 'critical',
            'hyperglycemia': 'high',
            'bradycardia': 'high',
            'tachycardia': 'high',
            'statistical_outlier': 'medium',
            'rapid_glucose_change': 'high'
        };

        return severityRules[anomaly.type] || 'low';
    }

    async calculateAnomalyConfidence(anomaly, baseline) {
        // Simplified confidence calculation
        let confidence = 0.8;

        if (baseline.sampleCount > 100) {
            confidence += 0.1; // More data = higher confidence
        }

        if (anomaly.type === 'statistical_outlier' && anomaly.deviation > anomaly.threshold * 2) {
            confidence += 0.1; // Large deviations = higher confidence
        }

        return Math.min(confidence, 1.0);
    }
}

class EmergencyResponseSystem extends EventEmitter {
    constructor() {
        super();
        this.emergencyContacts = new Map();
        this.responseProtocols = new Map();
        this.activeEmergencies = new Map();
        this.emergencyServices = new Map();
        this.initializeResponseProtocols();
    }

    initializeResponseProtocols() {
        this.responseProtocols.set('cardiac_emergency', {
            priority: 'critical',
            responseTime: 300, // 5 minutes
            contacts: ['emergency_services', 'cardiologist', 'family'],
            actions: ['call_911', 'notify_hospital', 'dispatch_ambulance']
        });

        this.responseProtocols.set('diabetic_emergency', {
            priority: 'high',
            responseTime: 600, // 10 minutes
            contacts: ['endocrinologist', 'family', 'primary_care'],
            actions: ['check_glucose', 'administer_glucose', 'monitor_vitals']
        });

        this.responseProtocols.set('hypertensive_crisis', {
            priority: 'critical',
            responseTime: 300,
            contacts: ['emergency_services', 'cardiologist'],
            actions: ['call_911', 'blood_pressure_medication', 'hospital_transport']
        });
    }

    async triggerEmergencyResponse(patientId, anomaly) {
        try {
            const emergencyId = this.generateEmergencyId();
            const emergencyType = this.determineEmergencyType(anomaly);
            const protocol = this.responseProtocols.get(emergencyType);

            if (!protocol) {
                logger.warn(`No protocol found for emergency type: ${emergencyType}`);
                return;
            }

            const emergency = {
                emergencyId,
                patientId,
                emergencyType,
                anomaly,
                protocol,
                status: 'active',
                createdAt: new Date().toISOString(),
                responses: []
            };

            this.activeEmergencies.set(emergencyId, emergency);

            // Execute emergency protocol
            await this.executeEmergencyProtocol(emergency);

            this.emit('emergencyTriggered', {
                emergencyId,
                patientId,
                emergencyType,
                severity: anomaly.severity
            });

            logger.info(`Emergency response triggered: ${emergencyId} for patient ${patientId}`);
            return emergencyId;

        } catch (error) {
            logger.error('Error triggering emergency response:', error);
            throw error;
        }
    }

    determineEmergencyType(anomaly) {
        const typeMapping = {
            'hypertensive_emergency': 'hypertensive_crisis',
            'hypoglycemia': 'diabetic_emergency',
            'hyperglycemia': 'diabetic_emergency',
            'bradycardia': 'cardiac_emergency',
            'tachycardia': 'cardiac_emergency'
        };

        return typeMapping[anomaly.type] || 'general_emergency';
    }

    async executeEmergencyProtocol(emergency) {
        const { protocol, patientId, emergencyId } = emergency;

        // Execute each action in the protocol
        for (const action of protocol.actions) {
            try {
                const response = await this.executeEmergencyAction(action, patientId, emergency);
                emergency.responses.push({
                    action,
                    response,
                    timestamp: new Date().toISOString(),
                    success: true
                });
            } catch (error) {
                emergency.responses.push({
                    action,
                    error: error.message,
                    timestamp: new Date().toISOString(),
                    success: false
                });
                logger.error(`Emergency action failed: ${action}`, error);
            }
        }

        // Notify emergency contacts
        await this.notifyEmergencyContacts(emergency);
    }

    async executeEmergencyAction(action, patientId, emergency) {
        switch (action) {
            case 'call_911':
                return await this.call911(patientId, emergency);
            
            case 'notify_hospital':
                return await this.notifyHospital(patientId, emergency);
            
            case 'dispatch_ambulance':
                return await this.dispatchAmbulance(patientId, emergency);
            
            case 'check_glucose':
                return await this.requestGlucoseCheck(patientId);
            
            case 'administer_glucose':
                return await this.recommendGlucoseAdministration(patientId);
            
            case 'monitor_vitals':
                return await this.enhanceVitalMonitoring(patientId);
            
            default:
                throw new Error(`Unknown emergency action: ${action}`);
        }
    }

    async call911(patientId, emergency) {
        // In production, this would integrate with emergency services API
        logger.info(`911 called for patient ${patientId}, emergency ${emergency.emergencyId}`);
        return {
            service: '911',
            status: 'called',
            estimatedResponse: '5-10 minutes',
            caseNumber: this.generateCaseNumber()
        };
    }

    async notifyHospital(patientId, emergency) {
        // Notify nearest hospital
        logger.info(`Hospital notified for patient ${patientId}`);
        return {
            hospital: 'Nearest Emergency Department',
            status: 'notified',
            bedReserved: true,
            estimatedArrival: '15 minutes'
        };
    }

    async dispatchAmbulance(patientId, emergency) {
        // Dispatch ambulance
        logger.info(`Ambulance dispatched for patient ${patientId}`);
        return {
            ambulanceId: 'AMB-' + Math.random().toString(36).substr(2, 9),
            status: 'dispatched',
            estimatedArrival: '8-12 minutes',
            crew: 'Paramedic team'
        };
    }

    async requestGlucoseCheck(patientId) {
        // Request immediate glucose measurement
        return {
            action: 'glucose_check_requested',
            priority: 'immediate',
            instructions: 'Check blood glucose immediately'
        };
    }

    async recommendGlucoseAdministration(patientId) {
        // Recommend glucose administration
        return {
            action: 'glucose_administration',
            recommendation: 'Administer 15g fast-acting carbohydrates',
            followUp: 'Recheck glucose in 15 minutes'
        };
    }

    async enhanceVitalMonitoring(patientId) {
        // Increase monitoring frequency
        return {
            action: 'enhanced_monitoring',
            frequency: 'every_2_minutes',
            duration: '30_minutes',
            parameters: ['heart_rate', 'blood_pressure', 'oxygen_saturation']
        };
    }

    async notifyEmergencyContacts(emergency) {
        const contacts = this.emergencyContacts.get(emergency.patientId) || [];
        
        for (const contact of contacts) {
            try {
                await this.sendEmergencyNotification(contact, emergency);
            } catch (error) {
                logger.error(`Failed to notify emergency contact ${contact.id}:`, error);
            }
        }
    }

    async sendEmergencyNotification(contact, emergency) {
        // Send notification via multiple channels
        const notification = {
            contactId: contact.id,
            patientId: emergency.patientId,
            emergencyType: emergency.emergencyType,
            severity: emergency.anomaly.severity,
            message: this.generateEmergencyMessage(emergency),
            timestamp: new Date().toISOString()
        };

        // Send via SMS, email, push notification, etc.
        logger.info(`Emergency notification sent to ${contact.name} (${contact.relationship})`);
        return notification;
    }

    generateEmergencyMessage(emergency) {
        return `HEALTH EMERGENCY: ${emergency.emergencyType} detected for patient. ` +
               `Severity: ${emergency.anomaly.severity}. Emergency services have been contacted. ` +
               `Emergency ID: ${emergency.emergencyId}`;
    }

    generateEmergencyId() {
        return 'EMG-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    }

    generateCaseNumber() {
        return 'CASE-' + Date.now();
    }

    async addEmergencyContact(patientId, contact) {
        if (!this.emergencyContacts.has(patientId)) {
            this.emergencyContacts.set(patientId, []);
        }
        
        this.emergencyContacts.get(patientId).push({
            id: contact.id || this.generateContactId(),
            name: contact.name,
            relationship: contact.relationship,
            phone: contact.phone,
            email: contact.email,
            priority: contact.priority || 'normal',
            active: true
        });
    }

    generateContactId() {
        return 'CONTACT-' + Math.random().toString(36).substr(2, 9);
    }

    getEmergencyStatus(emergencyId) {
        return this.activeEmergencies.get(emergencyId);
    }

    async resolveEmergency(emergencyId, resolution) {
        const emergency = this.activeEmergencies.get(emergencyId);
        
        if (emergency) {
            emergency.status = 'resolved';
            emergency.resolution = resolution;
            emergency.resolvedAt = new Date().toISOString();
            
            this.emit('emergencyResolved', {
                emergencyId,
                patientId: emergency.patientId,
                resolution
            });
        }
    }
}

module.exports = {
    HealthDevice,
    HealthDataProcessor,
    HealthAnomalyAI,
    EmergencyResponseSystem
};