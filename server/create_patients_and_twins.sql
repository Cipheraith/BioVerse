-- Create patient records and health twins for test accounts

-- Create patient records for our test patients
INSERT INTO patients (name, dateofbirth, age, gender, contact, address, medicalhistory, bloodtype, allergies, chronicconditions, medications, riskfactors) VALUES
('Mary Chanda', '1995-09-20', 28, 'Female', '+260-97-567-8901', 'Compound 15, Kanyama, Lusaka', 
 '{"conditions": ["Type 2 Diabetes"], "surgeries": [], "hospitalizations": [{"date": "2020-03-15", "reason": "Diabetes diagnosis"}]}',
 'O+', '["None known"]', '["Type 2 Diabetes Mellitus"]', 
 '["Metformin 500mg BID", "Glimepiride 2mg daily"]', 
 '{"diabetes": "moderate", "cardiovascular": "low", "family_history": ["diabetes", "hypertension"]}'),

('Joseph Mulenga', '1968-02-14', 55, 'Male', '+260-97-678-9012', 'Plot 789, Chilenje, Lusaka',
 '{"conditions": ["Hypertension", "Hyperlipidemia"], "surgeries": [], "hospitalizations": []}',
 'A+', '["Penicillin"]', '["Essential Hypertension", "Hyperlipidemia"]',
 '["Amlodipine 10mg daily", "Lisinopril 20mg daily", "Atorvastatin 40mg daily"]',
 '{"hypertension": "severe", "cardiovascular": "high", "stroke": "moderate", "lifestyle": {"smoking": true, "alcohol": "moderate"}}');

-- Create health twins for the patients
INSERT INTO health_twins (patient_id, current_health_score, cellular_age, biological_age, health_trajectory, risk_predictions, molecular_insights, intervention_recommendations, confidence_score) VALUES
((SELECT id FROM patients WHERE name = 'Mary Chanda'), 72.5, 30.2, 29.8,
 '{"trend": "improving", "glucose_control": "good", "weight_management": "stable", "exercise_compliance": "moderate"}',
 '{"diabetes_complications": {"retinopathy": 15, "neuropathy": 12, "nephropathy": 8}, "cardiovascular_events": {"5_year_risk": 18}, "hba1c_projection": {"6_months": 6.8, "12_months": 6.5}}',
 '{"insulin_sensitivity": "improving", "beta_cell_function": "stable", "inflammatory_markers": "normal", "oxidative_stress": "low"}',
 '["Monitor blood glucose 3x daily", "Increase physical activity to 150min/week", "Follow low-carb diet plan", "Regular eye examinations every 6 months", "Foot care routine daily", "HbA1c target <7%"]',
 0.87),

((SELECT id FROM patients WHERE name = 'Joseph Mulenga'), 68.3, 62.5, 58.7,
 '{"trend": "concerning", "bp_control": "suboptimal", "weight_trend": "increasing", "medication_adherence": "variable"}',
 '{"cardiovascular_events": {"5_year_risk": 28, "10_year_risk": 45}, "stroke_risk": {"5_year": 22}, "heart_attack_risk": {"5_year": 25}, "kidney_disease_progression": "moderate"}',
 '{"arterial_stiffness": "elevated", "endothelial_function": "impaired", "inflammatory_markers": "high", "lipid_oxidation": "increased"}',
 '["Take BP medication as prescribed", "Reduce sodium intake to <2g/day", "Quit smoking immediately", "Limit alcohol to 2 units/week", "Daily 30-minute walks", "Weight reduction target: 10kg in 6 months", "Stress management techniques", "24-hour BP monitoring"]',
 0.91);