-- BioVerse Database Updates for Business Features
-- Run these commands to add new tables for billing, feedback, compliance, and mobile features

-- Subscriptions and Billing
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

-- User Feedback System
CREATE TABLE IF NOT EXISTS user_feedback (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    user_role VARCHAR(50),
    category VARCHAR(50), -- 'bug', 'feature_request', 'improvement', 'general'
    type VARCHAR(50), -- 'ui_ux', 'performance', 'functionality', 'content'
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    feature VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'open',
    priority VARCHAR(20),
    submitted_at TIMESTAMP DEFAULT NOW(),
    votes_up INTEGER DEFAULT 0,
    votes_down INTEGER DEFAULT 0,
    tags JSONB DEFAULT '[]',
    admin_response TEXT,
    admin_response_at TIMESTAMP,
    implementation_status VARCHAR(20) DEFAULT 'pending'
);

-- Mobile Device Management
CREATE TABLE IF NOT EXISTS mobile_devices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    device_type VARCHAR(20) NOT NULL, -- 'ios', 'android', 'web'
    device_token VARCHAR(500) UNIQUE,
    platform VARCHAR(50),
    app_version VARCHAR(20),
    device_info JSONB DEFAULT '{}',
    registered_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active',
    push_enabled BOOLEAN DEFAULT true
);

-- Push Notifications
CREATE TABLE IF NOT EXISTS push_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    device_id INTEGER REFERENCES mobile_devices(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    priority VARCHAR(20) DEFAULT 'normal',
    sent_at TIMESTAMP DEFAULT NOW(),
    delivery_status VARCHAR(20) DEFAULT 'sent',
    opened_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending'
);

-- API Integration Management
CREATE TABLE IF NOT EXISTS api_integrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    integration_id VARCHAR(100) NOT NULL,
    integration_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    configuration JSONB DEFAULT '{}',
    api_key VARCHAR(255),
    webhook_url VARCHAR(500),
    installed_at TIMESTAMP DEFAULT NOW(),
    last_sync TIMESTAMP,
    data_points INTEGER DEFAULT 0,
    monthly_usage INTEGER DEFAULT 0
);

-- Compliance and Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    resource_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    outcome VARCHAR(20) DEFAULT 'success',
    details JSONB DEFAULT '{}',
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Data Privacy Requests (GDPR compliance)
CREATE TABLE IF NOT EXISTS data_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL, -- 'access', 'portability', 'erasure', 'rectification'
    reason TEXT,
    additional_info TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT NOW(),
    estimated_completion TIMESTAMP,
    processed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    completed_at TIMESTAMP,
    response_data JSONB DEFAULT '{}'
);

-- Security Incidents
CREATE TABLE IF NOT EXISTS security_incidents (
    id SERIAL PRIMARY KEY,
    incident_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    affected_users INTEGER DEFAULT 0,
    discovered_at TIMESTAMP DEFAULT NOW(),
    reported_at TIMESTAMP DEFAULT NOW(),
    reported_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'investigating',
    timeline JSONB DEFAULT '{}',
    notifications JSONB DEFAULT '{}',
    compliance_requirements JSONB DEFAULT '{}'
);

-- User Consent Management
CREATE TABLE IF NOT EXISTS user_consent (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    consent_type VARCHAR(50) NOT NULL, -- 'data_processing', 'marketing', 'analytics', 'third_party'
    granted BOOLEAN DEFAULT false,
    granted_at TIMESTAMP,
    revoked_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Revenue Analytics
CREATE TABLE IF NOT EXISTS revenue_analytics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2),
    metric_type VARCHAR(50), -- 'revenue', 'users', 'subscriptions', 'api_calls'
    period_start DATE,
    period_end DATE,
    metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Satisfaction Surveys
CREATE TABLE IF NOT EXISTS satisfaction_surveys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    overall_satisfaction INTEGER CHECK (overall_satisfaction >= 1 AND overall_satisfaction <= 5),
    ease_of_use INTEGER CHECK (ease_of_use >= 1 AND ease_of_use <= 5),
    feature_completeness INTEGER CHECK (feature_completeness >= 1 AND feature_completeness <= 5),
    performance INTEGER CHECK (performance >= 1 AND performance <= 5),
    support INTEGER CHECK (support >= 1 AND support <= 5),
    recommendation INTEGER CHECK (recommendation >= 1 AND recommendation <= 10), -- NPS score
    most_used_features JSONB DEFAULT '[]',
    least_used_features JSONB DEFAULT '[]',
    improvements TEXT,
    additional_comments TEXT,
    submitted_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON user_feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON user_feedback(category);
CREATE INDEX IF NOT EXISTS idx_mobile_devices_user_id ON mobile_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Insert some sample data for demo purposes
INSERT INTO subscriptions (user_id, plan_id, price, currency) 
SELECT 1, 'premium', 29.99, 'USD' 
WHERE NOT EXISTS (SELECT 1 FROM subscriptions WHERE user_id = 1);

INSERT INTO user_feedback (user_id, user_role, category, type, rating, title, description, feature)
VALUES 
  (1, 'patient', 'feature_request', 'functionality', 5, 'Add medication reminder notifications', 'Would love to have customizable medication reminders with different alert sounds', 'medication_management'),
  (1, 'patient', 'improvement', 'ui_ux', 4, 'Better mobile navigation', 'The mobile app navigation could be more intuitive, especially for elderly users', 'mobile_app')
ON CONFLICT DO NOTHING;

-- Add sample mobile device
INSERT INTO mobile_devices (user_id, device_type, device_token, platform, app_version)
SELECT 1, 'android', 'sample_device_token_123', 'Android 12', '2.1.0'
WHERE NOT EXISTS (SELECT 1 FROM mobile_devices WHERE user_id = 1);
