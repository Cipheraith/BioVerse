"""
BioVerse Python AI Service - Simple Version
Basic FastAPI application for testing
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="BioVerse AI Service",
    description="AI-Powered Health Twin and Machine Learning Service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "BioVerse Python AI",
        "version": "1.0.0",
        "services": {
            "api": True,
            "database": False,
            "ollama": False,
            "ml": True,
            "visualization": True
        }
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "🏥 BioVerse Python AI Service",
        "description": "AI-Powered Health Twin and Machine Learning Service",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

# Basic AI endpoints
@app.post("/api/v1/health-twins/create")
async def create_health_twin(data: dict):
    """Create a health twin"""
    return {
        "success": True,
        "twin_id": f"twin_{data.get('patient_id', 'unknown')}",
        "message": "Health twin created successfully"
    }

@app.get("/api/v1/health-twins/{twin_id}")
async def get_health_twin(twin_id: str):
    """Get health twin"""
    return {
        "success": True,
        "data": {
            "twin_id": twin_id,
            "status": "active",
            "health_score": 75.0
        }
    }

@app.post("/api/v1/ml/analyze-symptoms")
async def analyze_symptoms(data: dict):
    """Analyze symptoms"""
    return {
        "success": True,
        "analysis": {
            "symptoms": data.get('symptoms', []),
            "risk_level": "moderate",
            "confidence": 0.85
        }
    }

if __name__ == "__main__":
    port = int(os.getenv("PYTHON_AI_PORT", 8000))
    host = os.getenv("PYTHON_AI_HOST", "0.0.0.0")
    
    print(f"🚀 Starting BioVerse Python AI Service on {host}:{port}")
    
    uvicorn.run(
        "main_simple:app",
        host=host,
        port=port,
        reload=True
    )