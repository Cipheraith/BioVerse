-- ====================================
-- TELEMEDICINE DATABASE SCHEMA
-- ====================================

-- Virtual Consultations Table
CREATE TABLE IF NOT EXISTS virtual_consultations (
    id SERIAL PRIMARY KEY,
    patientId INTEGER NOT NULL,
    doctorId INTEGER NOT NULL,
    scheduledDateTime TIMESTAMP WITH TIME ZONE NOT NULL,
    consultationType VARCHAR(100) NOT NULL DEFAULT 'general',
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    symptoms JSONB DEFAULT '[]',
    vitalSigns JSONB DEFAULT '{}',
    environmentalData JSONB DEFAULT '{}',
    preferredLanguage VARCHAR(10) DEFAULT 'en',
    accessibilityNeeds JSONB DEFAULT '[]',
    deviceCapabilities JSONB DEFAULT '{}',
    preConsultationAnalysis JSONB DEFAULT '{}',
    immersiveEnvironment JSONB DEFAULT '{}',
    aiInsights JSONB DEFAULT '[]',
    realTimeAnalytics JSONB DEFAULT '{}',
    sessionRecording TEXT,
    holographicEnabled BOOLEAN DEFAULT FALSE,
    voiceCommandsEnabled BOOLEAN DEFAULT FALSE,
    hapticFeedbackEnabled BOOLEAN DEFAULT FALSE,
    sessionFeatures JSONB DEFAULT '{}',
    sessionStartTime TIMESTAMP WITH TIME ZONE,
    sessionEndTime TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    outcome TEXT,
    followUpRequired BOOLEAN DEFAULT FALSE,
    followUpDate TIMESTAMP WITH TIME ZONE,
    prescription JSONB DEFAULT '{}',
    referrals JSONB DEFAULT '[]',
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Remote Monitoring Sessions Table
CREATE TABLE IF NOT EXISTS remote_monitoring_sessions (
    id SERIAL PRIMARY KEY,
    patientId INTEGER NOT NULL,
    monitoringType VARCHAR(100) NOT NULL,
    deviceInfo JSONB DEFAULT '{}',
    alertThresholds JSONB DEFAULT '{}',
    monitoringSystem JSONB DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    startTime TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    endTime TIMESTAMP WITH TIME ZONE,
    dataStreams JSONB DEFAULT '[]',
    alerts JSONB DEFAULT '[]',
    insights JSONB DEFAULT '[]',
    emergencyAlerts INTEGER DEFAULT 0,
    dataQuality VARCHAR(50) DEFAULT 'good',
    batteryStatus JSONB DEFAULT '{}',
    connectionStatus VARCHAR(50) DEFAULT 'connected',
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Real-time Health Data Table
CREATE TABLE IF NOT EXISTS realtime_health_data (
    id SERIAL PRIMARY KEY,
    sessionId INTEGER REFERENCES remote_monitoring_sessions(id),
    patientId INTEGER NOT NULL,
    deviceId VARCHAR(100) NOT NULL,
    dataType VARCHAR(100) NOT NULL,
    dataPoint JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    anomalyScore DECIMAL(5,4) DEFAULT 0.0,
    riskLevel VARCHAR(20) DEFAULT 'low',
    flags JSONB DEFAULT '[]',
    predictiveScore DECIMAL(5,4) DEFAULT 0.0,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Immersive Medical Training Table
CREATE TABLE IF NOT EXISTS immersive_medical_training (
    id SERIAL PRIMARY KEY,
    traineeId INTEGER NOT NULL,
    trainingType VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) NOT NULL DEFAULT 'beginner',
    specialization VARCHAR(100),
    scenario JSONB NOT NULL,
    immersiveFeatures JSONB DEFAULT '{}',
    trainingEnvironment JSONB DEFAULT '{}',
    virtualPatients JSONB DEFAULT '[]',
    trainingCurriculum JSONB DEFAULT '{}',
    progress JSONB DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    startTime TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    endTime TIMESTAMP WITH TIME ZONE,
    completionRate DECIMAL(5,2) DEFAULT 0.0,
    finalScore DECIMAL(5,2) DEFAULT 0.0,
    skillsAssessed JSONB DEFAULT '[]',
    feedback JSONB DEFAULT '{}',
    certification JSONB DEFAULT '{}',
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Video Call Sessions Table
CREATE TABLE IF NOT EXISTS video_call_sessions (
    id SERIAL PRIMARY KEY,
    consultationId INTEGER REFERENCES virtual_consultations(id),
    channelName VARCHAR(200) NOT NULL,
    participants JSONB DEFAULT '[]',
    startTime TIMESTAMP WITH TIME ZONE,
    endTime TIMESTAMP WITH TIME ZONE,
    duration INTEGER DEFAULT 0, -- in seconds
    recordingUrl TEXT,
    recordingStatus VARCHAR(50) DEFAULT 'not_recorded',
    quality VARCHAR(50) DEFAULT 'hd',
    features JSONB DEFAULT '{}', -- screen sharing, recording, etc.
    networkStats JSONB DEFAULT '{}',
    troubleshootingLog JSONB DEFAULT '[]',
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Diagnostic Sessions Table
CREATE TABLE IF NOT EXISTS ai_diagnostic_sessions (
    id SERIAL PRIMARY KEY,
    consultationId INTEGER REFERENCES virtual_consultations(id),
    patientId INTEGER NOT NULL,
    symptoms JSONB NOT NULL,
    vitalSigns JSONB DEFAULT '{}',
    environmentalFactors JSONB DEFAULT '{}',
    geneticMarkers JSONB DEFAULT '{}',
    socialDeterminants JSONB DEFAULT '{}',
    biometricData JSONB DEFAULT '{}',
    wearableData JSONB DEFAULT '{}',
    primaryDiagnosis JSONB DEFAULT '{}',
    differentialDiagnosis JSONB DEFAULT '[]',
    confidenceScore DECIMAL(5,4) DEFAULT 0.0,
    treatmentRecommendations JSONB DEFAULT '[]',
    riskAssessment JSONB DEFAULT '{}',
    followUpPlanning JSONB DEFAULT '{}',
    preventiveCare JSONB DEFAULT '[]',
    aiModelVersion VARCHAR(50) DEFAULT '1.0',
    processingTime INTEGER DEFAULT 0, -- in milliseconds
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Telemedicine Prescriptions Table
CREATE TABLE IF NOT EXISTS telemedicine_prescriptions (
    id SERIAL PRIMARY KEY,
    consultationId INTEGER REFERENCES virtual_consultations(id),
    patientId INTEGER NOT NULL,
    doctorId INTEGER NOT NULL,
    medications JSONB NOT NULL,
    dosage JSONB NOT NULL,
    duration JSONB NOT NULL,
    instructions TEXT,
    warnings JSONB DEFAULT '[]',
    drugInteractions JSONB DEFAULT '[]',
    allergicReactions JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'pending',
    electronicSignature TEXT,
    verificationCode VARCHAR(20),
    pharmacyId INTEGER,
    dispensedAt TIMESTAMP WITH TIME ZONE,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Health Device Registry Table
CREATE TABLE IF NOT EXISTS health_device_registry (
    id SERIAL PRIMARY KEY,
    patientId INTEGER NOT NULL,
    deviceId VARCHAR(200) NOT NULL UNIQUE,
    deviceType VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    capabilities JSONB DEFAULT '{}',
    calibrationDate TIMESTAMP WITH TIME ZONE,
    lastSync TIMESTAMP WITH TIME ZONE,
    batteryLevel INTEGER DEFAULT 100,
    firmwareVersion VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    accuracy DECIMAL(5,4) DEFAULT 0.95,
    reliability DECIMAL(5,4) DEFAULT 0.95,
    certifications JSONB DEFAULT '[]',
    maintenanceSchedule JSONB DEFAULT '{}',
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Telemedicine Analytics Table
CREATE TABLE IF NOT EXISTS telemedicine_analytics (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    total_consultations INTEGER DEFAULT 0,
    successful_consultations INTEGER DEFAULT 0,
    cancelled_consultations INTEGER DEFAULT 0,
    technical_issues INTEGER DEFAULT 0,
    average_session_duration INTEGER DEFAULT 0, -- in minutes
    patient_satisfaction_score DECIMAL(3,2) DEFAULT 0.0,
    doctor_satisfaction_score DECIMAL(3,2) DEFAULT 0.0,
    diagnostic_accuracy DECIMAL(5,4) DEFAULT 0.0,
    treatment_effectiveness DECIMAL(5,4) DEFAULT 0.0,
    cost_savings DECIMAL(10,2) DEFAULT 0.0,
    accessibility_improvements JSONB DEFAULT '{}',
    technology_performance JSONB DEFAULT '{}',
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_virtual_consultations_patient ON virtual_consultations(patientId);
CREATE INDEX IF NOT EXISTS idx_virtual_consultations_doctor ON virtual_consultations(doctorId);
CREATE INDEX IF NOT EXISTS idx_virtual_consultations_status ON virtual_consultations(status);
CREATE INDEX IF NOT EXISTS idx_virtual_consultations_datetime ON virtual_consultations(scheduledDateTime);

CREATE INDEX IF NOT EXISTS idx_remote_monitoring_patient ON remote_monitoring_sessions(patientId);
CREATE INDEX IF NOT EXISTS idx_remote_monitoring_status ON remote_monitoring_sessions(status);
CREATE INDEX IF NOT EXISTS idx_remote_monitoring_start ON remote_monitoring_sessions(startTime);

CREATE INDEX IF NOT EXISTS idx_realtime_health_data_session ON realtime_health_data(sessionId);
CREATE INDEX IF NOT EXISTS idx_realtime_health_data_patient ON realtime_health_data(patientId);
CREATE INDEX IF NOT EXISTS idx_realtime_health_data_timestamp ON realtime_health_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_realtime_health_data_type ON realtime_health_data(dataType);

CREATE INDEX IF NOT EXISTS idx_medical_training_trainee ON immersive_medical_training(traineeId);
CREATE INDEX IF NOT EXISTS idx_medical_training_type ON immersive_medical_training(trainingType);
CREATE INDEX IF NOT EXISTS idx_medical_training_status ON immersive_medical_training(status);

CREATE INDEX IF NOT EXISTS idx_video_sessions_consultation ON video_call_sessions(consultationId);
CREATE INDEX IF NOT EXISTS idx_ai_diagnostic_consultation ON ai_diagnostic_sessions(consultationId);
CREATE INDEX IF NOT EXISTS idx_prescriptions_consultation ON telemedicine_prescriptions(consultationId);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON telemedicine_prescriptions(patientId);

CREATE INDEX IF NOT EXISTS idx_device_registry_patient ON health_device_registry(patientId);
CREATE INDEX IF NOT EXISTS idx_device_registry_device ON health_device_registry(deviceId);
CREATE INDEX IF NOT EXISTS idx_device_registry_type ON health_device_registry(deviceType);

CREATE INDEX IF NOT EXISTS idx_telemedicine_analytics_date ON telemedicine_analytics(date);

-- Insert sample data for development
INSERT INTO virtual_consultations (
    patientId, doctorId, scheduledDateTime, consultationType, status, symptoms, preferredLanguage
) VALUES 
(1, 2, CURRENT_TIMESTAMP + INTERVAL '2 hours', 'general', 'scheduled', '["headache", "fever"]', 'en'),
(3, 2, CURRENT_TIMESTAMP + INTERVAL '4 hours', 'cardiology', 'scheduled', '["chest pain", "shortness of breath"]', 'en'),
(1, 4, CURRENT_TIMESTAMP + INTERVAL '1 day', 'dermatology', 'scheduled', '["rash", "itching"]', 'en')
ON CONFLICT DO NOTHING;
