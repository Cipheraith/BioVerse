-- Migration: 001_create_health_analysis_tables.sql
-- Description: Create tables for voice analysis and computer vision health screening
-- Created: 2024-01-16

-- Create voice_analyses table
CREATE TABLE IF NOT EXISTS voice_analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    analysis_result TEXT NOT NULL,
    audio_file_path TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    overall_score REAL,
    depression_risk REAL,
    anxiety_level REAL,
    stress_level REAL,
    energy_level REAL,
    voice_stability REAL,
    speech_clarity REAL,
    confidence REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create cv_analyses table for computer vision health screening
CREATE TABLE IF NOT EXISTS cv_analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    analysis_type TEXT NOT NULL,
    analysis_result TEXT NOT NULL,
    image_path TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    confidence REAL,
    risk_score REAL,
    primary_finding TEXT,
    malignancy_risk REAL,
    vision_threat BOOLEAN DEFAULT FALSE,
    urgency_level TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create health_recommendations table
CREATE TABLE IF NOT EXISTS health_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    analysis_type TEXT NOT NULL,
    analysis_id INTEGER,
    recommendation_type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_required TEXT,
    priority TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create user_health_profiles table for comprehensive health overview
CREATE TABLE IF NOT EXISTS user_health_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL UNIQUE,
    overall_health_score REAL DEFAULT 0.5,
    voice_health_score REAL DEFAULT 0.5,
    mental_health_score REAL DEFAULT 0.5,
    physical_health_score REAL DEFAULT 0.5,
    last_voice_analysis DATETIME,
    last_cv_analysis DATETIME,
    total_voice_analyses INTEGER DEFAULT 0,
    total_cv_analyses INTEGER DEFAULT 0,
    high_priority_alerts INTEGER DEFAULT 0,
    pending_recommendations INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create analysis_sessions table for tracking user analysis sessions
CREATE TABLE IF NOT EXISTS analysis_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    session_type TEXT NOT NULL,
    session_start DATETIME DEFAULT CURRENT_TIMESTAMP,
    session_end DATETIME,
    analyses_completed INTEGER DEFAULT 0,
    session_status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_voice_analyses_user_id ON voice_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_analyses_timestamp ON voice_analyses(timestamp);
CREATE INDEX IF NOT EXISTS idx_cv_analyses_user_id ON cv_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_analyses_timestamp ON cv_analyses(timestamp);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON health_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_health_profiles_user_id ON user_health_profiles(user_id);

-- Insert initial test data
INSERT OR IGNORE INTO user_health_profiles (user_id, overall_health_score, voice_health_score, mental_health_score, physical_health_score)
VALUES ('demo-user', 0.75, 0.8, 0.7, 0.75);
