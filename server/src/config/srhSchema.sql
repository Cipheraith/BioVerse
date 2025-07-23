-- Enhanced SRH Database Schema
-- This file contains additional tables for comprehensive SRH functionality

-- =======================
-- MENSTRUAL CYCLE TRACKING
-- =======================

CREATE TABLE IF NOT EXISTS menstrual_cycles (
    id SERIAL PRIMARY KEY,
    patientId INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    cycleStartDate DATE NOT NULL,
    cycleLength INTEGER DEFAULT 28,
    periodLength INTEGER DEFAULT 5,
    symptoms JSONB DEFAULT '[]',
    flow VARCHAR(20) DEFAULT 'medium', -- light, medium, heavy
    mood JSONB DEFAULT '[]',
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =======================
-- CONTRACEPTION MANAGEMENT
-- =======================

CREATE TABLE IF NOT EXISTS contraception_plans (
    id SERIAL PRIMARY KEY,
    patientId INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    contraceptionMethod VARCHAR(255) NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE,
    duration VARCHAR(100),
    reminders JSONB DEFAULT '[]',
    sideEffects JSONB DEFAULT '[]',
    effectiveness VARCHAR(10),
    notes TEXT,
    active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =======================
-- SRH ASSESSMENTS
-- =======================

CREATE TABLE IF NOT EXISTS srh_assessments (
    id SERIAL PRIMARY KEY,
    patientId INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    assessmentType VARCHAR(100) NOT NULL, -- contraception, sti_risk, pregnancy_risk, etc.
    responses JSONB NOT NULL,
    riskFactors JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    score INTEGER DEFAULT 0,
    completedBy INTEGER REFERENCES users(id) ON DELETE SET NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =======================
-- STI TESTING & RESULTS
-- =======================

CREATE TABLE IF NOT EXISTS sti_tests (
    id SERIAL PRIMARY KEY,
    patientId INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    testType VARCHAR(100) NOT NULL, -- chlamydia, gonorrhea, hiv, syphilis, etc.
    testDate DATE NOT NULL,
    result VARCHAR(20), -- positive, negative, pending
    notes TEXT,
    followUpRequired BOOLEAN DEFAULT FALSE,
    followUpDate DATE,
    labId INTEGER REFERENCES labResults(id) ON DELETE SET NULL,
    createdBy INTEGER REFERENCES users(id) ON DELETE SET NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =======================
-- ENHANCED PREGNANCIES TABLE
-- =======================

-- Add additional columns to existing pregnancies table
DO $$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='pregnancies' AND column_name='lastmenstrualperiod') THEN
        ALTER TABLE pregnancies ADD COLUMN lastMenstrualPeriod DATE;
    END IF;
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='pregnancies' AND column_name='gestationalage') THEN
        ALTER TABLE pregnancies ADD COLUMN gestationalAge INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='pregnancies' AND column_name='isfirstpregnancy') THEN
        ALTER TABLE pregnancies ADD COLUMN isFirstPregnancy BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='pregnancies' AND column_name='previouspregnancies') THEN
        ALTER TABLE pregnancies ADD COLUMN previousPregnancies INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='pregnancies' AND column_name='riskfactors') THEN
        ALTER TABLE pregnancies ADD COLUMN riskFactors JSONB DEFAULT '[]';
    END IF;
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='pregnancies' AND column_name='currentsymptoms') THEN
        ALTER TABLE pregnancies ADD COLUMN currentSymptoms JSONB DEFAULT '[]';
    END IF;
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='pregnancies' AND column_name='antenatalvisits') THEN
        ALTER TABLE pregnancies ADD COLUMN antenatalVisits JSONB DEFAULT '[]';
    END IF;
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='pregnancies' AND column_name='vaccinations') THEN
        ALTER TABLE pregnancies ADD COLUMN vaccinations JSONB DEFAULT '[]';
    END IF;
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='pregnancies' AND column_name='labresults') THEN
        ALTER TABLE pregnancies ADD COLUMN labResults JSONB DEFAULT '[]';
    END IF;
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='pregnancies' AND column_name='createdat') THEN
        ALTER TABLE pregnancies ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Fix patientId type in pregnancies table if it exists and is incorrect
DO $$
BEGIN
    IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='pregnancies' AND column_name='patientid' AND data_type='character varying') THEN
        ALTER TABLE pregnancies ALTER COLUMN patientId TYPE INTEGER USING patientId::integer;
    END IF;
END $$;


-- =======================
-- FAMILY PLANNING
-- =======================

CREATE TABLE IF NOT EXISTS family_planning (
    id SERIAL PRIMARY KEY,
    patientId INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    planType VARCHAR(100) NOT NULL, -- prevent, delay, space, achieve
    desiredChildren INTEGER,
    timeframe VARCHAR(100),
    contraceptionPreferences JSONB DEFAULT '[]',
    partnerInvolvement BOOLEAN DEFAULT FALSE,
    counselingNotes TEXT,
    nextReviewDate DATE,
    active BOOLEAN DEFAULT TRUE,
    createdBy INTEGER REFERENCES users(id) ON DELETE SET NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =======================
-- SEXUAL HEALTH EDUCATION
-- =======================

CREATE TABLE IF NOT EXISTS education_content (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- pregnancy, contraception, sti, reproductive-health
    ageGroup VARCHAR(100) NOT NULL, -- teens, adults, all
    language VARCHAR(10) DEFAULT 'en',
    content JSONB NOT NULL,
    resources JSONB DEFAULT '[]',
    viewCount INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS education_views (
    id SERIAL PRIMARY KEY,
    patientId INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    contentId INTEGER REFERENCES education_content(id) ON DELETE CASCADE,
    viewDuration INTEGER, -- in seconds
    completed BOOLEAN DEFAULT FALSE,
    viewedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =======================
-- SRH COUNSELING SESSIONS
-- =======================

CREATE TABLE IF NOT EXISTS srh_counseling (
    id SERIAL PRIMARY KEY,
    patientId INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    counselorId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sessionType VARCHAR(100) NOT NULL, -- contraception, pregnancy, sti, general
    sessionDate DATE NOT NULL,
    duration INTEGER, -- in minutes
    topics JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    followUpNeeded BOOLEAN DEFAULT FALSE,
    followUpDate DATE,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =======================
-- PARTNER INFORMATION
-- =======================

CREATE TABLE IF NOT EXISTS partner_info (
    id SERIAL PRIMARY KEY,
    patientId INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    partnerName VARCHAR(255),
    partnerAge INTEGER,
    relationshipStatus VARCHAR(100),
    stiTestingStatus VARCHAR(100),
    contraceptionSharing BOOLEAN DEFAULT FALSE,
    communicationNotes TEXT,
    consentGiven BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =======================
-- FERTILITY TRACKING
-- =======================

CREATE TABLE IF NOT EXISTS fertility_tracking (
    id SERIAL PRIMARY KEY,
    patientId INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    trackingDate DATE NOT NULL,
    basalBodyTemp DECIMAL(4,2),
    cervicalMucus VARCHAR(100),
    cervicalPosition VARCHAR(100),
    ovulationTest VARCHAR(20), -- positive, negative
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =======================
-- SRH NOTIFICATIONS
-- =======================

CREATE TABLE IF NOT EXISTS srh_notifications (
    id SERIAL PRIMARY KEY,
    patientId INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    notificationType VARCHAR(100) NOT NULL, -- period_reminder, contraception_reminder, appointment_reminder
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    scheduledFor TIMESTAMP NOT NULL,
    sent BOOLEAN DEFAULT FALSE,
    sentAt TIMESTAMP,
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    metadata JSONB DEFAULT '{}',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =======================
-- INDEXES FOR PERFORMANCE
-- =======================

-- Menstrual cycles indexes
CREATE INDEX IF NOT EXISTS idx_menstrual_cycles_patient_date ON menstrual_cycles(patientId, cycleStartDate);
CREATE INDEX IF NOT EXISTS idx_menstrual_cycles_patient ON menstrual_cycles(patientId);

-- Contraception plans indexes
CREATE INDEX IF NOT EXISTS idx_contraception_plans_patient ON contraception_plans(patientId);
CREATE INDEX IF NOT EXISTS idx_contraception_plans_active ON contraception_plans(active);

-- SRH assessments indexes
CREATE INDEX IF NOT EXISTS idx_srh_assessments_patient ON srh_assessments(patientId);
CREATE INDEX IF NOT EXISTS idx_srh_assessments_type ON srh_assessments(assessmentType);

-- STI tests indexes
CREATE INDEX IF NOT EXISTS idx_sti_tests_patient ON sti_tests(patientId);
CREATE INDEX IF NOT EXISTS idx_sti_tests_date ON sti_tests(testDate);

-- Enhanced pregnancies indexes
CREATE INDEX IF NOT EXISTS idx_pregnancies_patient_due ON pregnancies(patientId, estimatedDueDate);
CREATE INDEX IF NOT EXISTS idx_pregnancies_transport ON pregnancies(transportBooked);

-- Family planning indexes
CREATE INDEX IF NOT EXISTS idx_family_planning_patient ON family_planning(patientId);
CREATE INDEX IF NOT EXISTS idx_family_planning_active ON family_planning(active);

-- Education content indexes
CREATE INDEX IF NOT EXISTS idx_education_content_category ON education_content(category);
CREATE INDEX IF NOT EXISTS idx_education_content_age_group ON education_content(ageGroup);

-- SRH counseling indexes
CREATE INDEX IF NOT EXISTS idx_srh_counseling_patient ON srh_counseling(patientId);
CREATE INDEX IF NOT EXISTS idx_srh_counseling_date ON srh_counseling(sessionDate);

-- Partner info indexes
CREATE INDEX IF NOT EXISTS idx_partner_info_patient ON partner_info(patientId);

-- Fertility tracking indexes
CREATE INDEX IF NOT EXISTS idx_fertility_tracking_patient_date ON fertility_tracking(patientId, trackingDate);

-- SRH notifications indexes
CREATE INDEX IF NOT EXISTS idx_srh_notifications_patient ON srh_notifications(patientId);
CREATE INDEX IF NOT EXISTS idx_srh_notifications_scheduled ON srh_notifications(scheduledFor);
CREATE INDEX IF NOT EXISTS idx_srh_notifications_sent ON srh_notifications(sent);

-- =======================
-- VIEWS FOR COMMON QUERIES
-- =======================

-- View for comprehensive patient SRH overview
CREATE OR REPLACE VIEW patient_srh_overview AS
SELECT 
    p.id as patient_id,
    p.name,
    p.age,
    p.gender,
    p.isPregnant,
    COUNT(DISTINCT mc.id) as menstrual_cycles_tracked,
    COUNT(DISTINCT cp.id) as contraception_plans,
    COUNT(DISTINCT sa.id) as assessments_completed,
    COUNT(DISTINCT st.id) as sti_tests_done,
    COUNT(DISTINCT fp.id) as family_planning_sessions,
    MAX(mc.cycleStartDate) as last_period_date,
    MAX(cp.createdAt) as last_contraception_update,
    MAX(sa.createdAt) as last_assessment_date
FROM patients p
LEFT JOIN menstrual_cycles mc ON p.id = mc.patientId
LEFT JOIN contraception_plans cp ON p.id = cp.patientId
LEFT JOIN srh_assessments sa ON p.id = sa.patientId
LEFT JOIN sti_tests st ON p.id = st.patientId
LEFT JOIN family_planning fp ON p.id = fp.patientId
GROUP BY p.id, p.name, p.age, p.gender, p.isPregnant;

-- View for active SRH services
CREATE OR REPLACE VIEW active_srh_services AS
SELECT 
    'contraception' as service_type,
    COUNT(*) as active_count
FROM contraception_plans 
WHERE active = TRUE
UNION ALL
SELECT 
    'family_planning' as service_type,
    COUNT(*) as active_count
FROM family_planning 
WHERE active = TRUE
UNION ALL
SELECT 
    'pregnancy' as service_type,
    COUNT(*) as active_count
FROM pregnancies 
WHERE deliveryDetails IS NULL;

-- =======================
-- TRIGGER FUNCTIONS
-- =======================

-- Function to update timestamp on record update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE OR REPLACE TRIGGER update_menstrual_cycles_updated_at 
    BEFORE UPDATE ON menstrual_cycles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_contraception_plans_updated_at 
    BEFORE UPDATE ON contraception_plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_family_planning_updated_at 
    BEFORE UPDATE ON family_planning 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_partner_info_updated_at 
    BEFORE UPDATE ON partner_info 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_education_content_updated_at 
    BEFORE UPDATE ON education_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =======================
-- SAMPLE DATA INSERTS
-- =======================

-- Sample education content
-- Ensure education_content is clean before inserting
DELETE FROM education_content;
INSERT INTO education_content (title, category, ageGroup, language, content, resources) VALUES
('Introduction to Contraception', 'contraception', 'teens-adults', 'en', 
 '{"overview": "Learn about different contraception methods and how they work", "keyPoints": ["Types of contraception", "Effectiveness rates", "Side effects", "Choosing the right method"]}',
 '[{"type": "video", "url": "/videos/contraception-basics.mp4", "duration": "10 minutes"}]'),
('Menstrual Health Basics', 'reproductive-health', 'teens-adults', 'en',
 '{"overview": "Understanding your menstrual cycle and maintaining good menstrual health", "keyPoints": ["Normal cycle length", "Menstrual hygiene", "When to seek help", "Tracking your cycle"]}',
 '[{"type": "article", "url": "/articles/menstrual-health.html", "readTime": "5 minutes"}]'),
('STI Prevention', 'prevention', 'teens-adults', 'en',
 '{"overview": "How to prevent sexually transmitted infections", "keyPoints": ["Safe sex practices", "Regular testing", "Partner communication", "Treatment options"]}',
 '[{"type": "infographic", "url": "/images/sti-prevention.png"}, {"type": "video", "url": "/videos/sti-prevention.mp4", "duration": "8 minutes"}]');

-- Sample notification types
-- Ensure srh_notifications is clean before inserting
DELETE FROM srh_notifications;
INSERT INTO srh_notifications (patientId, notificationType, title, message, scheduledFor, priority) VALUES
(1, 'period_reminder', 'Period Reminder', 'Your period is expected to start in 3 days', NOW() + INTERVAL '3 days', 'low'),
(2, 'contraception_reminder', 'Pill Reminder', 'Time to take your daily contraceptive pill', NOW() + INTERVAL '1 day', 'medium'),
(1, 'appointment_reminder', 'Antenatal Appointment', 'Your antenatal checkup is scheduled for tomorrow', NOW() + INTERVAL '1 day', 'high');

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO bioverse_admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO bioverse_admin;
