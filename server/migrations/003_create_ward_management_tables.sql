-- Migration: 003_create_ward_management_tables.sql
-- Description: Create tables for managing wards, rooms, and beds
-- Created: 2025-08-20

-- Create a bed status enum type
CREATE TYPE bed_status AS ENUM ('available', 'occupied', 'maintenance');

-- Create wards table
CREATE TABLE IF NOT EXISTS wards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ward_id UUID NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
    room_number TEXT NOT NULL,
    type TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create beds table
CREATE TABLE IF NOT EXISTS beds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    bed_number TEXT NOT NULL,
    status bed_status NOT NULL DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rooms_ward_id ON rooms(ward_id);
CREATE INDEX IF NOT EXISTS idx_beds_room_id ON beds(room_id);
CREATE INDEX IF NOT EXISTS idx_beds_status ON beds(status);

