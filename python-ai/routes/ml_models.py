"""
Machine Learning Models API Routes
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import numpy as np

from services.ml_service import MLService

router = APIRouter()

class PredictHealthScoreRequest(BaseModel):
    features: List[float]

class PredictDiseaseRiskRequest(BaseModel):
    features: List[float]

class AnalyzeHealthPatternsRequest(BaseModel):
    patient_data: List[Dict[str, Any]]

@router.post("/predict/health-score")
async def predict_health_score(
    request: PredictHealthScoreRequest,
    ml_service: MLService = Depends(lambda: router.app.state.ml)
):
    """Predict health score using ML model"""
    try:
        if not ml_service.is_ready:
            raise HTTPException(status_code=503, detail="ML service not ready")
        
        features = np.array(request.features)
        health_score = await ml_service.predict_health_score(features)
        
        return {
            "success": True,
            "health_score": health_score,
            "category": _get_health_category(health_score)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/disease-risks")
async def predict_disease_risks(
    request: PredictDiseaseRiskRequest,
    ml_service: MLService = Depends(lambda: router.app.state.ml)
):
    """Predict disease risks using ML models"""
    try:
        if not ml_service.is_ready:
            raise HTTPException(status_code=503, detail="ML service not ready")
        
        features = np.array(request.features)
        disease_risks = await ml_service.predict_disease_risks(features)
        
        return {
            "success": True,
            "disease_risks": disease_risks
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze/health-patterns")
async def analyze_health_patterns(
    request: AnalyzeHealthPatternsRequest,
    ml_service: MLService = Depends(lambda: router.app.state.ml)
):
    """Analyze health patterns from historical data"""
    try:
        if not ml_service.is_ready:
            raise HTTPException(status_code=503, detail="ML service not ready")
        
        analysis = await ml_service.analyze_health_patterns(request.patient_data)
        
        return {
            "success": True,
            "analysis": analysis
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models/info")
async def get_models_info(
    ml_service: MLService = Depends(lambda: router.app.state.ml)
):
    """Get information about loaded ML models"""
    try:
        model_info = ml_service.get_model_info()
        
        return {
            "success": True,
            "model_info": model_info
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def _get_health_category(score: float) -> str:
    """Get health category based on score"""
    if score >= 90:
        return 'Excellent'
    elif score >= 80:
        return 'Very Good'
    elif score >= 70:
        return 'Good'
    elif score >= 60:
        return 'Fair'
    elif score >= 40:
        return 'Poor'
    else:
        return 'Critical'