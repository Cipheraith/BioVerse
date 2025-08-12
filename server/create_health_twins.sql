-- Create Health Twins for Test Patients with Real Data

-- Clear existing health twins for test patients
DELETE FROM health_twins WHERE patient_id IN (SELECT id FROM users WHERE username IN ('patient', 'patient2'));

-- Health Twin for Patient 1 (Mary Chanda - Diabetes Patient)
INSERT INTO health_twins (
    patient_id, 
    current_health_score, 
    cellular_age, 
    biological_age, 
    health_trajectory, 
    risk_predictions, 
    molecular_insights, 
    intervention_recommendations, 
    confidence_score
) VALUES (
    (SELECT id FROM users WHERE username = 'patient'),
    72.5,
    32.0,
    30.5,
    '{
        "trend": "improving",
        "last_6_months": [68.2, 69.8, 71.1, 72.0, 72.3, 72.5],
        "projected_12_months": [73.2, 74.1, 75.0, 75.8, 76.2, 76.8],
        "key_factors": ["medication_adherence", "diet_compliance", "exercise_routine"]
    }',
    '{
        "diabetes_complications": {
            "retinopathy": {"risk": 15, "timeframe": "5_years"},
            "neuropathy": {"risk": 12, "timeframe": "5_years"},
            "nephropathy": {"risk": 8, "timeframe": "5_years"}
        },
        "cardiovascular": {
            "heart_attack": {"risk": 18, "timeframe": "10_years"},
            "stroke": {"risk": 12, "timeframe": "10_years"}
        },
        "overall_mortality": {"risk": 5, "timeframe": "10_years"}
    }',
    '{
        "glucose_metabolism": {
            "insulin_sensitivity": "moderate",
            "beta_cell_function": "good",
            "glucose_variability": "controlled"
        },
        "inflammatory_markers": {
            "crp": "normal",
            "il6": "slightly_elevated",
            "tnf_alpha": "normal"
        },
        "oxidative_stress": "moderate",
        "cellular_repair": "active"
    }',
    '{
        "immediate": [
            "Continue Metformin 500mg twice daily",
            "Monitor blood glucose 3x daily",
            "Maintain current exercise routine (150min/week)",
            "Follow Mediterranean diet pattern"
        ],
        "short_term": [
            "HbA1c target <7.0% in next 3 months",
            "Weight reduction goal: 5kg in 6 months",
            "Annual eye examination scheduled",
            "Foot care education and daily inspection"
        ],
        "long_term": [
            "Prevent diabetes complications",
            "Maintain healthy weight (BMI 22-25)",
            "Regular cardiovascular screening",
            "Consider CGM for better glucose management"
        ]
    }',
    0.87
);

-- Health Twin for Patient 2 (Joseph Mulenga - Hypertension Patient)
INSERT INTO health_twins (
    patient_id, 
    current_health_score, 
    cellular_age, 
    biological_age, 
    health_trajectory, 
    risk_predictions, 
    molecular_insights, 
    intervention_recommendations, 
    confidence_score
) VALUES (
    (SELECT id FROM users WHERE username = 'patient2'),
    68.3,
    62.0,
    58.5,
    '{
        "trend": "declining",
        "last_6_months": [71.2, 70.8, 69.9, 69.1, 68.7, 68.3],
        "projected_12_months": [67.8, 67.2, 66.9, 66.5, 66.1, 65.8],
        "key_factors": ["blood_pressure_control", "smoking_cessation", "medication_adherence"]
    }',
    '{
        "cardiovascular": {
            "heart_attack": {"risk": 35, "timeframe": "10_years"},
            "stroke": {"risk": 28, "timeframe": "10_years"},
            "heart_failure": {"risk": 22, "timeframe": "10_years"}
        },
        "kidney_disease": {
            "chronic_kidney_disease": {"risk": 25, "timeframe": "10_years"},
            "end_stage_renal": {"risk": 8, "timeframe": "15_years"}
        },
        "overall_mortality": {"risk": 18, "timeframe": "10_years"}
    }',
    '{
        "vascular_health": {
            "endothelial_function": "impaired",
            "arterial_stiffness": "elevated",
            "inflammation": "high"
        },
        "metabolic_markers": {
            "lipid_profile": "dyslipidemic",
            "insulin_resistance": "present",
            "oxidative_stress": "high"
        },
        "cardiac_markers": {
            "bnp": "slightly_elevated",
            "troponin": "normal",
            "ecg_changes": "lvh_present"
        }
    }',
    '{
        "immediate": [
            "Optimize BP medications (target <130/80)",
            "Smoking cessation program enrollment",
            "Daily BP monitoring",
            "Reduce sodium intake to <2g/day"
        ],
        "short_term": [
            "BP control <130/80 in next 8 weeks",
            "Complete smoking cessation in 3 months",
            "Weight loss goal: 10kg in 6 months",
            "Lipid management with statin therapy"
        ],
        "long_term": [
            "Prevent cardiovascular events",
            "Maintain healthy lifestyle",
            "Regular cardiac screening",
            "Kidney function monitoring"
        ]
    }',
    0.82
);

-- Display created health twins
SELECT 
    ht.id,
    u.name as patient_name,
    ht.current_health_score,
    ht.cellular_age,
    ht.biological_age,
    ht.confidence_score
FROM health_twins ht
JOIN users u ON ht.patient_id = u.id
WHERE u.username IN ('patient', 'patient2')
ORDER BY u.username;