CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    googleId VARCHAR(255) UNIQUE,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    name VARCHAR(255),
    dob VARCHAR(255),
    nationalId VARCHAR(255) UNIQUE,
    phoneNumber VARCHAR(255) UNIQUE,
    role VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW(),
    last_login_timestamp BIGINT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    dateOfBirth VARCHAR(255) NOT NULL,
    age INTEGER,
    gender VARCHAR(255) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    medicalHistory JSONB,
    bloodType VARCHAR(255),
    allergies JSONB,
    chronicConditions JSONB,
    medications JSONB,
    lastCheckupDate VARCHAR(255),
    riskFactors JSONB,
    isPregnant BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patientId INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    patientName VARCHAR(255) NOT NULL,
    date VARCHAR(255) NOT NULL,
    time VARCHAR(255) NOT NULL,
    appointmentDate BIGINT NOT NULL,
    type VARCHAR(255) NOT NULL,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS pregnancies (
    id SERIAL PRIMARY KEY,
    patientId INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    estimatedDueDate VARCHAR(255) NOT NULL,
    healthStatus VARCHAR(255),
    alerts JSONB,
    transportBooked BOOLEAN DEFAULT FALSE,
    deliveryDetails JSONB
);

CREATE TABLE IF NOT EXISTS symptomChecks (
    id SERIAL PRIMARY KEY,
    patientId INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    symptoms JSONB,
    timestamp BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender VARCHAR(255) NOT NULL,
    receiver VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    timestamp BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS otps (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL,
    otp VARCHAR(255) NOT NULL,
    expiresAt BIGINT NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY(userId) REFERENCES users(id)
);


CREATE TABLE IF NOT EXISTS labResults (
    id SERIAL PRIMARY KEY,
    patientId INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    testName VARCHAR(255) NOT NULL,
    value NUMERIC NOT NULL,
    unit VARCHAR(255) NOT NULL,
    timestamp BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    position JSONB,
    bedsAvailable INTEGER,
    medicationStock JSONB
);

-- Telemedicine and Remote Monitoring Tables
CREATE TABLE IF NOT EXISTS virtual_consultations (
    id SERIAL PRIMARY KEY,
    patientId INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctorId INTEGER REFERENCES users(id) ON DELETE SET NULL,
    scheduledDateTime TIMESTAMP NOT NULL,
    actualStartTime TIMESTAMP,
    actualEndTime TIMESTAMP,
    consultationType VARCHAR(100) DEFAULT 'video',
    status VARCHAR(50) DEFAULT 'scheduled',
    symptoms JSONB,
    diagnosis TEXT,
    prescription JSONB,
    notes TEXT,
    outcome TEXT,
    preferredLanguage VARCHAR(10) DEFAULT 'en',
    sessionFeatures JSONB,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS remote_monitoring_sessions (
    id SERIAL PRIMARY KEY,
    patientId INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctorId INTEGER REFERENCES users(id) ON DELETE SET NULL,
    monitoringType VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    startTime TIMESTAMP DEFAULT NOW(),
    endTime TIMESTAMP,
    dataStreams JSONB DEFAULT '[]',
    alerts JSONB DEFAULT '[]',
    vitalSigns JSONB,
    environmentalData JSONB,
    wearableDevices JSONB DEFAULT '[]',
    thresholds JSONB,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS immersive_medical_training (
    id SERIAL PRIMARY KEY,
    traineeId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    instructorId INTEGER REFERENCES users(id) ON DELETE SET NULL,
    trainingType VARCHAR(100) NOT NULL,
    scenario VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'beginner',
    status VARCHAR(50) DEFAULT 'not_started',
    startTime TIMESTAMP DEFAULT NOW(),
    endTime TIMESTAMP,
    score INTEGER,
    feedback TEXT,
    virtualEnvironment JSONB,
    simulationData JSONB,
    achievements JSONB DEFAULT '[]',
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_diagnostic_sessions (
    id SERIAL PRIMARY KEY,
    consultationId INTEGER REFERENCES virtual_consultations(id) ON DELETE CASCADE,
    patientSymptoms JSONB NOT NULL,
    aiPredictions JSONB,
    confidenceScores JSONB,
    recommendedTests JSONB DEFAULT '[]',
    suggestedDiagnoses JSONB DEFAULT '[]',
    riskAssessment JSONB,
    createdAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telemedicine_analytics (
    id SERIAL PRIMARY KEY,
    sessionType VARCHAR(100) NOT NULL,
    sessionId INTEGER,
    patientId INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    doctorId INTEGER REFERENCES users(id) ON DELETE SET NULL,
    duration INTEGER, -- in minutes
    quality_score DECIMAL(3,2),
    patient_satisfaction INTEGER, -- 1-5 scale
    technical_issues JSONB DEFAULT '[]',
    outcomes JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Additional tables for real API functionality
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    start_date TIMESTAMP DEFAULT NOW(),
    next_billing_date TIMESTAMP,
    price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mobile_devices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    device_type VARCHAR(20) NOT NULL, -- 'ios', 'android', 'web'
    device_token VARCHAR(500) NOT NULL,
    platform VARCHAR(50),
    app_version VARCHAR(20),
    device_info JSONB,
    registered_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS user_feedback (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    user_role VARCHAR(50),
    category VARCHAR(50) NOT NULL, -- 'bug', 'feature_request', 'improvement', 'general'
    type VARCHAR(50), -- 'ui_ux', 'performance', 'functionality', 'content'
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    feature VARCHAR(100),
    metadata JSONB,
    status VARCHAR(20) DEFAULT 'open',
    priority VARCHAR(20),
    tags JSONB DEFAULT '[]',
    votes_up INTEGER DEFAULT 0,
    votes_down INTEGER DEFAULT 0,
    admin_response TEXT,
    responded_by VARCHAR(255),
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback_votes (
    id SERIAL PRIMARY KEY,
    feedback_id INTEGER REFERENCES user_feedback(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) CHECK (vote_type IN ('upvote', 'downvote')),
    voted_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(feedback_id, user_id)
);

CREATE TABLE IF NOT EXISTS push_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    device_id INTEGER REFERENCES mobile_devices(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    priority VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(20) DEFAULT 'queued',
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    opened_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_mobile_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    settings JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crash_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    crash_details JSONB NOT NULL,
    device_info JSONB,
    stack_trace TEXT,
    status VARCHAR(20) DEFAULT 'reported',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS data_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL, -- 'access', 'portability', 'erasure', 'rectification', 'restriction'
    reason TEXT,
    additional_info TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT NOW(),
    estimated_completion TIMESTAMP,
    processed_by INTEGER REFERENCES users(id),
    completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS security_incidents (
    id SERIAL PRIMARY KEY,
    incident_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    affected_users INTEGER DEFAULT 0,
    discovered_at TIMESTAMP,
    reported_at TIMESTAMP DEFAULT NOW(),
    reported_by INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'investigating',
    notifications JSONB,
    timeline JSONB,
    compliance_requirements JSONB
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    resource_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    outcome VARCHAR(20),
    details JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_devices_user_id ON mobile_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON user_feedback(status);
CREATE INDEX IF NOT EXISTS idx_push_notifications_user_id ON push_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_data_requests_user_id ON data_requests(user_id);
