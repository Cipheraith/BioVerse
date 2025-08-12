"""
Analytics API Routes
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta

from services.ollama_service import OllamaService
from services.ml_service import MLService

router = APIRouter()

class AnalyzeSymptomsRequest(BaseModel):
    symptoms: List[str]

class GenerateRecommendationsRequest(BaseModel):
    health_profile: Dict[str, Any]

class HealthAnalysisRequest(BaseModel):
    patient_data: Dict[str, Any]

@router.post("/analyze-symptoms")
async def analyze_symptoms(
    request: AnalyzeSymptomsRequest,
    ollama_service: OllamaService = Depends(lambda: router.app.state.ollama)
):
    """Analyze symptoms using AI"""
    try:
        if not ollama_service.is_available:
            raise HTTPException(status_code=503, detail="AI service not available")
        
        analysis = await ollama_service.analyze_symptoms(request.symptoms)
        
        return {
            "success": True,
            "symptoms": request.symptoms,
            "analysis": analysis
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-recommendations")
async def generate_recommendations(
    request: GenerateRecommendationsRequest,
    ollama_service: OllamaService = Depends(lambda: router.app.state.ollama)
):
    """Generate health recommendations using AI"""
    try:
        if not ollama_service.is_available:
            raise HTTPException(status_code=503, detail="AI service not available")
        
        recommendations = await ollama_service.generate_health_recommendations(request.health_profile)
        
        return {
            "success": True,
            "recommendations": recommendations
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/health-analysis")
async def perform_health_analysis(
    request: HealthAnalysisRequest,
    ollama_service: OllamaService = Depends(lambda: router.app.state.ollama)
):
    """Perform comprehensive health analysis using AI"""
    try:
        if not ollama_service.is_available:
            raise HTTPException(status_code=503, detail="AI service not available")
        
        analysis = await ollama_service.generate_health_analysis(request.patient_data)
        
        return {
            "success": True,
            "analysis": analysis
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/population-health")
async def get_population_health_analytics():
    """Get population health analytics"""
    try:
        # This would typically query the database for population-level data
        # For now, return mock data
        
        analytics = {
            "total_patients": 2847,
            "average_health_score": 73.2,
            "health_distribution": {
                "excellent": 15.2,
                "very_good": 28.5,
                "good": 31.8,
                "fair": 18.3,
                "poor": 6.2
            },
            "top_risk_factors": [
                {"factor": "Hypertension", "prevalence": 34.2},
                {"factor": "Diabetes", "prevalence": 18.7},
                {"factor": "Obesity", "prevalence": 25.1},
                {"factor": "Smoking", "prevalence": 12.3}
            ],
            "trends": {
                "health_score_trend": "improving",
                "monthly_change": 2.3,
                "year_over_year": 8.7
            },
            "geographic_distribution": {
                "lusaka": {"patients": 1247, "avg_health_score": 75.1},
                "copperbelt": {"patients": 892, "avg_health_score": 71.8},
                "southern": {"patients": 708, "avg_health_score": 74.3}
            }
        }
        
        return {
            "success": True,
            "analytics": analytics,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health-trends")
async def get_health_trends(
    days: int = 30,
    ml_service: MLService = Depends(lambda: router.app.state.ml)
):
    """Get health trends analysis"""
    try:
        # Generate sample trend data
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # This would typically query real data from the database
        trends = {
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days": days
            },
            "health_score_trends": {
                "average_score": 73.2,
                "trend_direction": "improving",
                "change_percentage": 3.4,
                "daily_averages": [
                    {"date": (end_date - timedelta(days=i)).strftime("%Y-%m-%d"), 
                     "score": 73.2 + (i * 0.1)} 
                    for i in range(days, 0, -1)
                ]
            },
            "disease_risk_trends": {
                "diabetes": {"current": 18.7, "change": -1.2},
                "hypertension": {"current": 34.2, "change": -0.8},
                "heart_disease": {"current": 12.3, "change": -0.5}
            },
            "intervention_effectiveness": {
                "preventive_care": {"impact": 15.2, "patients_affected": 1247},
                "lifestyle_changes": {"impact": 8.7, "patients_affected": 892},
                "medication_adherence": {"impact": 12.1, "patients_affected": 1456}
            }
        }
        
        return {
            "success": True,
            "trends": trends
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))