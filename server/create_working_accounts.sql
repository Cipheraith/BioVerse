-- Create working test accounts with correct schema
-- Clear existing test accounts first
DELETE FROM users WHERE username IN ('admin', 'admin2', 'doctor', 'doctor2', 'patient', 'patient2', 'ambulance', 'ambulance2', 'moh', 'moh2', 'pharmacy', 'pharmacy2');

-- ==================== ADMIN ACCOUNTS ====================
INSERT INTO users (username, password, name, role, phonenumber, dob, nationalid) VALUES
('admin', 'admin123', 'Sarah Mwanza', 'admin', '+260-97-123-4567', '1985-03-15', 'NRC123456789'),
('admin2', 'admin2123', 'James Banda', 'admin', '+260-97-234-5678', '1982-07-22', 'NRC234567890');

-- ==================== HEALTH WORKER ACCOUNTS ====================
INSERT INTO users (username, password, name, role, phonenumber, dob, nationalid) VALUES
('doctor', 'doctor123', 'Dr. Grace Phiri', 'health_worker', '+260-97-345-6789', '1978-11-08', 'NRC345678901'),
('doctor2', 'doctor2123', 'Dr. Michael Tembo', 'health_worker', '+260-97-456-7890', '1975-05-12', 'NRC456789012');

-- ==================== PATIENT ACCOUNTS ====================
INSERT INTO users (username, password, name, role, phonenumber, dob, nationalid) VALUES
('patient', 'patient123', 'Mary Chanda', 'patient', '+260-97-567-8901', '1995-09-20', 'NRC567890123'),
('patient2', 'patient2123', 'Joseph Mulenga', 'patient', '+260-97-678-9012', '1968-02-14', 'NRC678901234');

-- ==================== AMBULANCE DRIVER ACCOUNTS ====================
INSERT INTO users (username, password, name, role, phonenumber, dob, nationalid) VALUES
('ambulance', 'ambulance123', 'Peter Sakala', 'ambulance_driver', '+260-97-789-0123', '1988-12-03', 'NRC789012345'),
('ambulance2', 'ambulance2123', 'Ruth Zulu', 'ambulance_driver', '+260-97-890-1234', '1992-06-18', 'NRC890123456');

-- ==================== MINISTRY OF HEALTH ACCOUNTS ====================
INSERT INTO users (username, password, name, role, phonenumber, dob, nationalid) VALUES
('moh', 'moh123', 'Dr. Elizabeth Mwale', 'moh', '+260-97-901-2345', '1973-04-25', 'NRC901234567'),
('moh2', 'moh2123', 'Dr. Francis Kasonde', 'moh', '+260-97-012-3456', '1970-10-30', 'NRC012345678');

-- ==================== PHARMACY ACCOUNTS ====================
INSERT INTO users (username, password, name, role, phonenumber, dob, nationalid) VALUES
('pharmacy', 'pharmacy123', 'Agnes Mutale', 'pharmacy', '+260-97-111-2222', '1980-08-17', 'NRC123456780'),
('pharmacy2', 'pharmacy2123', 'David Nyirenda', 'pharmacy', '+260-97-333-4444', '1983-01-09', 'NRC234567801');