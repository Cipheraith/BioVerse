-- Migration: 002_create_prescriptions_table.sql
-- Description: Create tables for managing prescriptions
-- Created: 2025-08-20

-- Create a prescription status enum type
CREATE TYPE prescription_status AS ENUM ('pending', 'filled', 'delivered', 'cancelled');

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    pharmacy_id UUID,
    medication TEXT NOT NULL,
    dosage TEXT NOT NULL,
    instructions TEXT,
    status prescription_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_pharmacy_id ON prescriptions(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);

