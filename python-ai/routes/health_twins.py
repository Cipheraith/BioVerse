"""
Health Twins API Routes
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import uuid

from services.health_twin_service import HealthTwinService, HealthTwinData
from middleware.auth import verify_api_key

router = APIRouter()

class CreateHealthTwinRequest(BaseModel):
    patient_id: str
    vitals: Dict[str, float]
    medical_history: List[str] = []
    medications: List[str] = []
    lifestyle: Dict[str, Any] = {}
    symptoms: List[str] = []
    lab_results: Dict[str, float] = {}

class UpdateHealthTwinRequest(BaseModel):
    vitals: Optional[Dict[str, float]] = None
    medical_history: Optional[List[str]] = None
    medications: Optional[List[str]] = None
    lifestyle: Optional[Dict[str, Any]] = None
    symptoms: Optional[List[str]] = None
    lab_results: Optional[Dict[str, float]] = None

@router.post("/create")
async def create_health_twin(
    request: CreateHealthTwinRequest,
    background_tasks: BackgroundTasks,
    health_twin_service: HealthTwinService = Depends(lambda: router.app.state.health_twins)
):
    """Create a new digital health twin"""
    try:
        # Convert request to HealthTwinData
        twin_data = HealthTwinData(
            patient_id=request.patient_id,
            vitals=request.vitals,
            medical_history=request.medical_history,
            medications=request.medications,
            lifestyle=request.lifestyle,
            symptoms=request.symptoms,
            lab_results=request.lab_results
        )
        
        # Create health twin
        health_twin = await health_twin_service.create_health_twin(twin_data)
        
        return {
            "success": True,
            "health_twin_id": health_twin.id,
            "health_twin": health_twin.dict(),
            "message": "Health twin created successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{twin_id}")
async def get_health_twin(
    twin_id: str,
    health_twin_service: HealthTwinService = Depends(lambda: router.app.state.health_twins)
):
    """Get health twin by ID"""
    try:
        health_twin = await health_twin_service.get_health_twin(twin_id)
        
        if not health_twin:
            raise HTTPException(status_code=404, detail="Health twin not found")
        
        return {
            "success": True,
            "health_twin": health_twin.dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{twin_id}")
async def update_health_twin(
    twin_id: str,
    request: UpdateHealthTwinRequest,
    health_twin_service: HealthTwinService = Depends(lambda: router.app.state.health_twins)
):
    """Update existing health twin"""
    try:
        # Get existing twin
        existing_twin = await health_twin_service.get_health_twin(twin_id)
        if not existing_twin:
            raise HTTPException(status_code=404, detail="Health twin not found")
        
        # Merge updates with existing data
        updated_data = HealthTwinData(
            patient_id=existing_twin.patient_id,
            vitals=request.vitals or existing_twin.visualization_data.get('vitals_radar', {}),
            medical_history=request.medical_history or [],
            medications=request.medications or [],
            lifestyle=request.lifestyle or {},
            symptoms=request.symptoms or [],
            lab_results=request.lab_results or {},
            genetic_markers=request.genetic_markers,
            environmental_data=request.environmental_data,
            social_determinants=request.social_determinants
        )
        
        # Update health twin
        updated_twin = await health_twin_service.update_health_twin(twin_id, updated_data)
        
        return {
            "success": True,
            "health_twin": updated_twin.dict(),
            "message": "Health twin updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/patient/{patient_id}")
async def get_patient_health_twins(
    patient_id: str,
    health_twin_service: HealthTwinService = Depends(lambda: router.app.state.health_twins)
):
    """Get all health twins for a patient"""
    try:
        health_twins = await health_twin_service.get_patient_twins(patient_id)
        
        return {
            "success": True,
            "patient_id": patient_id,
            "health_twins": [twin.dict() for twin in health_twins],
            "count": len(health_twins)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{twin_id}/analyze")
async def analyze_health_twin(
    twin_id: str,
    health_twin_service: HealthTwinService = Depends(lambda: router.app.state.health_twins)
):
    """Perform detailed analysis of health twin"""
    try:
        health_twin = await health_twin_service.get_health_twin(twin_id)
        
        if not health_twin:
            raise HTTPException(status_code=404, detail="Health twin not found")
        
        # Perform additional analysis
        analysis = {
            "health_score_analysis": {
                "current_score": health_twin.health_score,
                "category": _get_health_category(health_twin.health_score),
                "improvement_potential": max(0, 100 - health_twin.health_score)
            },
            "risk_analysis": {
                "total_risk_factors": len(health_twin.risk_factors),
                "high_risk_factors": len([rf for rf in health_twin.risk_factors if rf.get("risk_level") == "high"]),
                "primary_concerns": [rf["factor"] for rf in health_twin.risk_factors[:3]]
            },
            "recommendations_summary": {
                "total_recommendations": len(health_twin.recommendations),
                "priority_actions": health_twin.recommendations[:3]
            },
            "ai_insights_summary": health_twin.ai_insights
        }
        
        return {
            "success": True,
            "twin_id": twin_id,
            "analysis": analysis
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{twin_id}")
async def delete_health_twin(
    twin_id: str,
    health_twin_service: HealthTwinService = Depends(lambda: router.app.state.health_twins)
):
    """Delete health twin"""
    try:
        # Check if twin exists
        health_twin = await health_twin_service.get_health_twin(twin_id)
        if not health_twin:
            raise HTTPException(status_code=404, detail="Health twin not found")
        
        # Remove from cache (in a real implementation, also remove from database)
        if twin_id in health_twin_service.twins_cache:
            del health_twin_service.twins_cache[twin_id]
        
        return {
            "success": True,
            "message": "Health twin deleted successfully"
        }
        
    except HTTPException:
        raise
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