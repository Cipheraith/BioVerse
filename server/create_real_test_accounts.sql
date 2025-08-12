-- BioVerse Real Test Accounts - Based on Actual Database Schema
-- Creates 2 accounts for each role with proper column names

-- Clear existing test data
DELETE FROM users WHERE username IN ('admin', 'admin2', 'doctor', 'doctor2', 'patient', 'patient2', 'ambulance', 'ambulance2', 'moh', 'moh2', 'pharmacy', 'pharmacy2');

-- ==================== ADMIN ACCOUNTS ====================
INSERT INTO users (username, password, name, dob, nationalid, phonenumber, role) VALUES
('admin', 'admin123', 'Sarah Mwanza', '1985-03-15', 'NRC123456789', '+260-97-123-4567', 'admin'),
('admin2', 'admin2123', 'James Banda', '1982-07-22', 'NRC234567890', '+260-97-234-5678', 'admin');

-- ==================== HEALTH WORKER ACCOUNTS ====================
INSERT INTO users (username, password, name, dob, nationalid, phonenumber, role) VALUES
('doctor', 'doctor123', 'Dr. Grace Phiri', '1978-11-08', 'NRC345678901', '+260-97-345-6789', 'health_worker'),
('doctor2', 'doctor2123', 'Dr. Michael Tembo', '1975-05-12', 'NRC456789012', '+260-97-456-7890', 'health_worker');

-- ==================== PATIENT ACCOUNTS ====================
INSERT INTO users (username, password, name, dob, nationalid, phonenumber, role) VALUES
('patient', 'patient123', 'Mary Chanda', '1995-09-20', 'NRC567890123', '+260-97-567-8901', 'patient'),
('patient2', 'patient2123', 'Joseph Mulenga', '1968-02-14', 'NRC678901234', '+260-97-678-9012', 'patient');

-- ==================== AMBULANCE DRIVER ACCOUNTS ====================
INSERT INTO users (username, password, name, dob, nationalid, phonenumber, role) VALUES
('ambulance', 'ambulance123', 'Peter Sakala', '1988-12-03', 'NRC789012345', '+260-97-789-0123', 'ambulance_driver'),
('ambulance2', 'ambulance2123', 'Ruth Zulu', '1992-06-18', 'NRC890123456', '+260-97-890-1234', 'ambulance_driver');

-- ==================== MINISTRY OF HEALTH ACCOUNTS ====================
INSERT INTO users (username, password, name, dob, nationalid, phonenumber, role) VALUES
('moh', 'moh123', 'Dr. Elizabeth Mwale', '1973-04-25', 'NRC901234567', '+260-97-901-2345', 'moh'),
('moh2', 'moh2123', 'Dr. Francis Kasonde', '1970-10-30', 'NRC012345678', '+260-97-012-3456', 'moh');

-- ==================== PHARMACY ACCOUNTS ====================
INSERT INTO users (username, password, name, dob, nationalid, phonenumber, role) VALUES
('pharmacy', 'pharmacy123', 'Agnes Mutale', '1980-08-17', 'NRC123456780', '+260-97-123-4567', 'pharmacy'),
('pharmacy2', 'pharmacy2123', 'David Nyirenda', '1983-01-09', 'NRC234567801', '+260-97-234-5678', 'pharmacy');

-- Display created accounts
SELECT id, username, name, role, phonenumber FROM users WHERE username IN ('admin', 'admin2', 'doctor', 'doctor2', 'patient', 'patient2', 'ambulance', 'ambulance2', 'moh', 'moh2', 'pharmacy', 'pharmacy2') ORDER BY role, username;