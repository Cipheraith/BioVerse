-- Health Twins and Medical Data for Test Patients

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS health_twins (
    id VARCHAR(255) PRIMARY KEY,
    patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    health_score DECIMAL(5,2) DEFAULT 0.0,
    risk_factors JSONB DEFAULT '{}',
    predictions JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '{}',
    ai_insights JSONB DEFAULT '{}',
    visualization_data JSONB DEFAULT '{}',
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vitals (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    heart_rate INTEGER,
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    temperature DECIMAL(4,1),
    oxygen_saturation INTEGER,
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    bmi DECIMAL(4,1),
    recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medical_history (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    condition VARCHAR(255) NOT NULL,
    diagnosed_date DATE,
    severity VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medications (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    prescribed_date DATE,
    prescribed_by VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==================== HEALTH TWINS ====================

-- Health Twin for Patient 1 (Mary Chanda - Diabetes)
INSERT INTO health_twins (id, patient_id, health_score, risk_factors, predictions, recommendations, ai_insights, visualization_data) VALUES
('twin_patient1', 
 (SELECT id FROM users WHERE username = 'patient'),
 72.5,
 '{"diabetes": {"level": "moderate", "hba1c": 7.2}, "cardiovascular": {"risk": "low-moderate"}, "kidney": {"function": "normal"}}',
 '{"blood_sugar_trend": "improving", "next_6_months": {"hba1c_target": 6.8, "weight_loss_goal": "5kg"}, "complications_risk": {"retinopathy": 15, "neuropathy": 12, "nephropathy": 8}}',
 '["Monitor blood glucose 3x daily", "Increase physical activity to 150min/week", "Follow low-carb diet plan", "Regular eye examinations every 6 months", "Foot care routine daily"]',
 '{"ai_risk_assessment": "Patient shows good diabetes management with recent improvements in glucose control. AI recommends continued current medication regimen with lifestyle modifications.", "behavioral_insights": "High medication adherence (94%), moderate exercise compliance (68%)", "trend_analysis": "HbA1c decreased from 8.1 to 7.2 over 3 months"}',
 '{"3d_model": {"organs": ["pancreas", "heart", "kidneys", "eyes"], "risk_zones": ["moderate_pancreas", "low_cardiovascular"]}, "charts": {"glucose_trend": "improving", "weight_trend": "stable", "bp_trend": "normal"}, "dashboard_widgets": ["glucose_monitor", "medication_tracker", "exercise_log", "diet_planner"]}'
);

-- Health Twin for Patient 2 (Joseph Mulenga - Hypertension)
INSERT INTO health_twins (id, patient_id, health_score, risk_factors, predictions, recommendations, ai_insights, visualization_data) VALUES
('twin_patient2', 
 (SELECT id FROM users WHERE username = 'patient2'),
 68.3,
 '{"hypertension": {"stage": "stage_2", "systolic": 165, "diastolic": 98}, "cardiovascular": {"risk": "high"}, "stroke": {"risk": "moderate-high"}, "lifestyle": {"smoking": true, "alcohol": "moderate"}}',
 '{"bp_control_timeline": "6-8_weeks", "cardiovascular_events": {"next_5_years": 28}, "medication_response": "good", "lifestyle_impact": {"smoking_cessation": "35%_risk_reduction"}}',
 '["Take BP medication as prescribed (Amlodipine 10mg daily)", "Reduce sodium intake to <2g/day", "Quit smoking immediately", "Limit alcohol to 2 units/week", "Daily 30-minute walks", "Weight reduction target: 10kg in 6 months", "Stress management techniques"]',
 '{"ai_risk_assessment": "High cardiovascular risk patient requiring intensive management. AI suggests medication optimization and aggressive lifestyle intervention.", "behavioral_insights": "Medication adherence needs improvement (76%), high stress levels detected", "trend_analysis": "BP readings show high variability, suggesting need for 24-hour monitoring"}',
 '{"3d_model": {"organs": ["heart", "brain", "kidneys", "arteries"], "risk_zones": ["high_cardiovascular", "moderate_stroke_risk"]}, "charts": {"bp_trend": "elevated", "weight_trend": "increasing", "medication_adherence": "suboptimal"}, "dashboard_widgets": ["bp_monitor", "medication_reminder", "weight_tracker", "smoking_cessation_support"]}'
);

-- ==================== MEDICAL HISTORY ====================

-- Medical History for Patient 1 (Mary - Diabetes)
INSERT INTO medical_history (patient_id, condition, diagnosed_date, severity, status, notes) VALUES
((SELECT id FROM users WHERE username = 'patient'), 'Type 2 Diabetes Mellitus', '2020-03-15', 'moderate', 'active', 'Diagnosed during routine screening. Initially managed with lifestyle modifications, now on Metformin.'),
((SELECT id FROM users WHERE username = 'patient'), 'Diabetic Retinopathy', '2022-08-20', 'mild', 'active', 'Early-stage retinopathy detected during annual eye exam. Regular monitoring required.');

-- Medical History for Patient 2 (Joseph - Hypertension)
INSERT INTO medical_history (patient_id, condition, diagnosed_date, severity, status, notes) VALUES
((SELECT id FROM users WHERE username = 'patient2'), 'Essential Hypertension', '2015-11-22', 'severe', 'active', 'Stage 2 hypertension diagnosed after multiple elevated readings. Family history positive.'),
((SELECT id FROM users WHERE username = 'patient2'), 'Hyperlipidemia', '2018-07-14', 'moderate', 'active', 'Elevated cholesterol levels. LDL 180mg/dL, HDL 35mg/dL. On statin therapy.');

-- ==================== MEDICATIONS ====================

-- Medications for Patient 1 (Mary - Diabetes)
INSERT INTO medications (patient_id, name, dosage, frequency, prescribed_date, prescribed_by, status, notes) VALUES
((SELECT id FROM users WHERE username = 'patient'), 'Metformin', '500mg', 'Twice daily with meals', '2020-03-15', 'Dr. Grace Phiri', 'active', 'Start with 500mg daily, increased to BID after 2 weeks. Good tolerance.'),
((SELECT id FROM users WHERE username = 'patient'), 'Glimepiride', '2mg', 'Once daily before breakfast', '2022-01-10', 'Dr. Grace Phiri', 'active', 'Added when HbA1c remained >7% on Metformin alone.');

-- Medications for Patient 2 (Joseph - Hypertension)
INSERT INTO medications (patient_id, name, dosage, frequency, prescribed_date, prescribed_by, status, notes) VALUES
((SELECT id FROM users WHERE username = 'patient2'), 'Amlodipine', '10mg', 'Once daily in morning', '2015-11-22', 'Dr. Michael Tembo', 'active', 'Calcium channel blocker. Dose increased from 5mg due to inadequate BP control.'),
((SELECT id FROM users WHERE username = 'patient2'), 'Lisinopril', '20mg', 'Once daily', '2017-03-08', 'Dr. Michael Tembo', 'active', 'ACE inhibitor added for better BP control and renal protection.');

-- ==================== VITAL SIGNS ====================

-- Recent Vitals for Patient 1 (Mary - Diabetes)
INSERT INTO vitals (patient_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature, oxygen_saturation, weight, height, bmi, recorded_at) VALUES
((SELECT id FROM users WHERE username = 'patient'), 78, 128, 82, 36.7, 98, 68.5, 162.0, 26.1, NOW() - INTERVAL '1 day'),
((SELECT id FROM users WHERE username = 'patient'), 82, 132, 85, 36.8, 97, 68.3, 162.0, 26.0, NOW() - INTERVAL '3 days'),
((SELECT id FROM users WHERE username = 'patient'), 75, 125, 80, 36.6, 99, 68.7, 162.0, 26.2, NOW() - INTERVAL '7 days');

-- Recent Vitals for Patient 2 (Joseph - Hypertension)
INSERT INTO vitals (patient_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature, oxygen_saturation, weight, height, bmi, recorded_at) VALUES
((SELECT id FROM users WHERE username = 'patient2'), 88, 165, 98, 36.5, 96, 85.2, 175.0, 27.8, NOW() - INTERVAL '1 day'),
((SELECT id FROM users WHERE username = 'patient2'), 92, 170, 102, 36.7, 95, 85.5, 175.0, 27.9, NOW() - INTERVAL '3 days'),
((SELECT id FROM users WHERE username = 'patient2'), 85, 158, 95, 36.6, 97, 85.0, 175.0, 27.8, NOW() - INTERVAL '7 days');