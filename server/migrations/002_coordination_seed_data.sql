-- Seed data for BioVerse Coordination Engine
-- Sample facilities and inventory for testing

-- Insert sample facilities across Zambia
INSERT INTO facilities (name, type, latitude, longitude, dhis2_org_unit_id, district, province) VALUES
('Lusaka General Hospital', 'PUBLIC_HOSPITAL', -15.4167, 28.2833, 'LGH001', 'Lusaka', 'Lusaka'),
('University Teaching Hospital', 'PUBLIC_HOSPITAL', -15.3875, 28.3228, 'UTH001', 'Lusaka', 'Lusaka'),
('Chongwe Rural Health Centre', 'RURAL_CLINIC', -15.3300, 28.6800, 'CRHC001', 'Chongwe', 'Lusaka'),
('Kafue District Hospital', 'PUBLIC_HOSPITAL', -15.7689, 28.1814, 'KDH001', 'Kafue', 'Lusaka'),
('Chilanga Health Post', 'RURAL_CLINIC', -15.5500, 28.2700, 'CHP001', 'Chilanga', 'Lusaka'),
('PillBox Pharmacy Lusaka', 'PRIVATE_PHARMACY', -15.4200, 28.2900, NULL, 'Lusaka', 'Lusaka'),
('Link Pharmacy Arcades', 'PRIVATE_PHARMACY', -15.3950, 28.3100, NULL, 'Lusaka', 'Lusaka'),
('Ndola Central Hospital', 'PUBLIC_HOSPITAL', -12.9587, 28.6366, 'NCH001', 'Ndola', 'Copperbelt'),
('Kitwe Teaching Hospital', 'PUBLIC_HOSPITAL', -12.8024, 28.2132, 'KTH001', 'Kitwe', 'Copperbelt'),
('Livingstone General Hospital', 'PUBLIC_HOSPITAL', -17.8419, 25.8544, 'LGH002', 'Livingstone', 'Southern')
ON CONFLICT DO NOTHING;

-- Insert sample inventory items
INSERT INTO inventory_catalog (item_name, category, dhis2_data_element_id, unit_of_measure, description) VALUES
('Coartem 20/120mg', 'MEDICATION', 'DE_COARTEM', 'tablets', 'Artemether-Lumefantrine antimalarial'),
('Paracetamol 500mg', 'MEDICATION', 'DE_PARACETAMOL', 'tablets', 'Pain relief and fever reducer'),
('Amoxicillin 250mg', 'MEDICATION', 'DE_AMOXICILLIN', 'capsules', 'Antibiotic'),
('ORS Sachets', 'MEDICATION', 'DE_ORS', 'sachets', 'Oral Rehydration Salts'),
('Malaria RDT Kits', 'HARDWARE', 'DE_MALARIA_RDT', 'kits', 'Rapid Diagnostic Test for Malaria'),
('Blood Pressure Monitor', 'HARDWARE', 'DE_BP_MONITOR', 'units', 'Digital BP monitoring device'),
('Surgical Gloves', 'SUPPLIES', 'DE_GLOVES', 'boxes', 'Sterile surgical gloves'),
('Syringes 5ml', 'SUPPLIES', 'DE_SYRINGE_5ML', 'units', 'Disposable syringes'),
('Blood Type O+', 'BLOOD', 'DE_BLOOD_O_POS', 'units', 'O Positive blood units'),
('Blood Type A+', 'BLOOD', 'DE_BLOOD_A_POS', 'units', 'A Positive blood units')
ON CONFLICT DO NOTHING;

-- Insert sample stock levels (mix of CRITICAL, HEALTHY, SURPLUS)
INSERT INTO facility_stock_levels (facility_id, item_id, current_stock, daily_burn_rate, status) VALUES
-- Lusaka General Hospital - mostly healthy
(1, 1, 500, 20, 'HEALTHY'),
(1, 2, 1000, 30, 'HEALTHY'),
(1, 3, 50, 25, 'CRITICAL'),  -- Only 2 days supply
(1, 4, 200, 15, 'HEALTHY'),
(1, 5, 100, 10, 'HEALTHY'),

-- University Teaching Hospital - surplus on some items
(2, 1, 800, 15, 'SURPLUS'),  -- 53 days supply
(2, 2, 1500, 25, 'SURPLUS'),
(2, 3, 600, 20, 'HEALTHY'),
(2, 6, 20, 2, 'HEALTHY'),

-- Chongwe Rural Health Centre - critical on multiple items
(3, 1, 30, 15, 'CRITICAL'),  -- Only 2 days supply
(3, 2, 40, 20, 'CRITICAL'),  -- Only 2 days supply
(3, 4, 100, 10, 'HEALTHY'),
(3, 5, 5, 3, 'CRITICAL'),    -- Less than 2 days

-- Kafue District Hospital - mixed status
(4, 1, 200, 12, 'HEALTHY'),
(4, 2, 500, 18, 'SURPLUS'),
(4, 3, 150, 15, 'HEALTHY'),
(4, 7, 50, 5, 'HEALTHY'),

-- Chilanga Health Post - critical situation
(5, 1, 20, 10, 'CRITICAL'),
(5, 2, 30, 15, 'CRITICAL'),
(5, 4, 15, 8, 'CRITICAL'),

-- PillBox Pharmacy - surplus stock
(6, 1, 1000, 25, 'SURPLUS'),
(6, 2, 1500, 30, 'SURPLUS'),
(6, 3, 800, 20, 'SURPLUS'),

-- Link Pharmacy - surplus stock
(7, 1, 900, 20, 'SURPLUS'),
(7, 2, 1200, 25, 'SURPLUS'),
(7, 5, 300, 8, 'SURPLUS'),

-- Ndola Central Hospital
(8, 1, 400, 18, 'HEALTHY'),
(8, 2, 600, 22, 'HEALTHY'),
(8, 9, 15, 1, 'HEALTHY'),

-- Kitwe Teaching Hospital
(9, 1, 700, 20, 'SURPLUS'),
(9, 2, 900, 28, 'HEALTHY'),
(9, 10, 12, 1, 'HEALTHY'),

-- Livingstone General Hospital
(10, 1, 300, 15, 'HEALTHY'),
(10, 2, 450, 20, 'HEALTHY'),
(10, 3, 25, 12, 'CRITICAL')
ON CONFLICT (facility_id, item_id) DO NOTHING;
