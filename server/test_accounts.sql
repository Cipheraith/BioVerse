-- BioVerse Test Accounts with Health Twins
-- Creates 2 accounts for each role with comprehensive health data

-- Clear existing test data first
DELETE FROM health_twins WHERE patient_id IN (SELECT id FROM users WHERE username IN ('admin', 'admin2', 'doctor', 'doctor2', 'patient', 'patient2', 'ambulance', 'ambulance2', 'moh', 'moh2', 'pharmacy', 'pharmacy2'));
DELETE FROM vitals WHERE patient_id IN (SELECT id FROM users WHERE username IN ('admin', 'admin2', 'doctor', 'doctor2', 'patient', 'patient2', 'ambulance', 'ambulance2', 'moh', 'moh2', 'pharmacy', 'pharmacy2'));
DELETE FROM medical_history WHERE patient_id IN (SELECT id FROM users WHERE username IN ('admin', 'admin2', 'doctor', 'doctor2', 'patient', 'patient2', 'ambulance', 'ambulance2', 'moh', 'moh2', 'pharmacy', 'pharmacy2'));
DELETE FROM medications WHERE patient_id IN (SELECT id FROM users WHERE username IN ('admin', 'admin2', 'doctor', 'doctor2', 'patient', 'patient2', 'ambulance', 'ambulance2', 'moh', 'moh2', 'pharmacy', 'pharmacy2'));
DELETE FROM appointments WHERE patient_id IN (SELECT id FROM users WHERE username IN ('admin', 'admin2', 'doctor', 'doctor2', 'patient', 'patient2', 'ambulance', 'ambulance2', 'moh', 'moh2', 'pharmacy', 'pharmacy2'));
DELETE FROM users WHERE username IN ('admin', 'admin2', 'doctor', 'doctor2', 'patient', 'patient2', 'ambulance', 'ambulance2', 'moh', 'moh2', 'pharmacy', 'pharmacy2');

-- ==================== ADMIN ACCOUNTS ====================
INSERT INTO users (username, email, password, role, first_name, last_name, phone, date_of_birth, gender, address) VALUES
('admin', 'admin@bioverse.zm', 'admin123', 'admin', 'Sarah', 'Mwanza', '+260-97-123-4567', '1985-03-15', 'female', 'Plot 123, Independence Avenue, Lusaka'),
('admin2', 'admin2@bioverse.zm', 'admin123', 'admin', 'James', 'Banda', '+260-97-234-5678', '1982-07-22', 'male', 'Plot 456, Cairo Road, Lusaka');

-- ==================== HEALTH WORKER ACCOUNTS ====================
INSERT INTO users (username, email, password, role, first_name, last_name, phone, date_of_birth, gender, address) VALUES
('doctor', 'doctor@bioverse.zm', 'doctor123', 'health_worker', 'Dr. Grace', 'Phiri', '+260-97-345-6789', '1978-11-08', 'female', 'University Teaching Hospital, Lusaka'),
('doctor2', 'doctor2@bioverse.zm', 'doctor123', 'health_worker', 'Dr. Michael', 'Tembo', '+260-97-456-7890', '1975-05-12', 'male', 'Levy Mwanawasa Hospital, Lusaka');

-- ==================== PATIENT ACCOUNTS ====================
INSERT INTO users (username, email, password, role, first_name, last_name, phone, date_of_birth, gender, address) VALUES
('patient', 'patient@bioverse.zm', 'patient123', 'patient', 'Mary', 'Chanda', '+260-97-567-8901', '1995-09-20', 'female', 'Compound 15, Kanyama, Lusaka'),
('patient2', 'patient2@bioverse.zm', 'patient123', 'patient', 'Joseph', 'Mulenga', '+260-97-678-9012', '1968-02-14', 'male', 'Plot 789, Chilenje, Lusaka');

-- ==================== AMBULANCE DRIVER ACCOUNTS ====================
INSERT INTO users (username, email, password, role, first_name, last_name, phone, date_of_birth, gender, address) VALUES
('ambulance', 'ambulance@bioverse.zm', 'ambulance123', 'ambulance_driver', 'Peter', 'Sakala', '+260-97-789-0123', '1988-12-03', 'male', 'Emergency Services, UTH, Lusaka'),
('ambulance2', 'ambulance2@bioverse.zm', 'ambulance123', 'ambulance_driver', 'Ruth', 'Zulu', '+260-97-890-1234', '1992-06-18', 'female', 'Medical Transport Unit, Lusaka');

-- ==================== MINISTRY OF HEALTH ACCOUNTS ====================
INSERT INTO users (username, email, password, role, first_name, last_name, phone, date_of_birth, gender, address) VALUES
('moh', 'moh@bioverse.zm', 'moh123', 'moh', 'Dr. Elizabeth', 'Mwale', '+260-97-901-2345', '1973-04-25', 'female', 'Ministry of Health, Ndeke House, Lusaka'),
('moh2', 'moh2@bioverse.zm', 'moh123', 'moh', 'Dr. Francis', 'Kasonde', '+260-97-012-3456', '1970-10-30', 'male', 'Public Health Institute, Lusaka');

-- ==================== PHARMACY ACCOUNTS ====================
INSERT INTO users (username, email, password, role, first_name, last_name, phone, date_of_birth, gender, address) VALUES
('pharmacy', 'pharmacy@bioverse.zm', 'pharmacy123', 'pharmacy', 'Agnes', 'Mutale', '+260-97-123-4567', '1980-08-17', 'female', 'UTH Pharmacy, Lusaka'),
('pharmacy2', 'pharmacy2@bioverse.zm', 'pharmacy123', 'pharmacy', 'David', 'Nyirenda', '+260-97-234-5678', '1983-01-09', 'male', 'Link Pharmacy, Cairo Road, Lusaka');