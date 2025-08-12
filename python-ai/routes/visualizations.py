"""
Visualizations API Routes
"""

from fastapi import APIRouter, HTTPException, Depends, Response
from pydantic import BaseModel
from typing import Dict, List, Any, Optional

from services.visualization_service import VisualizationService

router = APIRouter()

class Create3DHealthTwinRequest(BaseModel):
    patient_id: str
    patient_data: Dict[str, Any]

class CreateHealthDashboardRequest(BaseModel):
    patient_data: Dict[str, Any]

@router.post("/3d-health-twin")
async def create_3d_health_twin(
    request: Create3DHealthTwinRequest,
    viz_service: VisualizationService = Depends(lambda: router.app.state.viz)
):
    """Create 3D digital health twin visualization"""
    try:
        if not viz_service.is_ready:
            raise HTTPException(status_code=503, detail="Visualization service not ready")
        
        # Add patient_id to patient_data
        patient_data = request.patient_data.copy()
        patient_data['patient_id'] = request.patient_id
        
        health_twin_viz = await viz_service.create_3d_health_twin(patient_data)
        
        return {
            "success": True,
            "visualization": health_twin_viz
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/health-dashboard")
async def create_health_dashboard(
    request: CreateHealthDashboardRequest,
    viz_service: VisualizationService = Depends(lambda: router.app.state.viz)
):
    """Create comprehensive health dashboard"""
    try:
        if not viz_service.is_ready:
            raise HTTPException(status_code=503, detail="Visualization service not ready")
        
        dashboard = await viz_service.create_health_dashboard(request.patient_data)
        
        return {
            "success": True,
            "dashboard": dashboard
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/3d-twin/{patient_id}")
async def get_3d_twin_model(
    patient_id: str,
    viz_service: VisualizationService = Depends(lambda: router.app.state.viz)
):
    """Get 3D twin model for patient"""
    try:
        if not viz_service.is_ready:
            raise HTTPException(status_code=503, detail="Visualization service not ready")
        
        # This would typically load patient data from database
        # For now, return a placeholder
        patient_data = {
            'patient_id': patient_id,
            'health_score': 75,
            'head_health': 80,
            'torso_health': 70,
            'arm_health': 85,
            'leg_health': 65
        }
        
        health_twin_viz = await viz_service.create_3d_health_twin(patient_data)
        
        return {
            "success": True,
            "patient_id": patient_id,
            "visualization": health_twin_viz
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/export/{format}")
async def export_visualization(
    format: str,
    visualization_data: Dict[str, Any],
    viz_service: VisualizationService = Depends(lambda: router.app.state.viz)
):
    """Export visualization to specified format"""
    try:
        if not viz_service.is_ready:
            raise HTTPException(status_code=503, detail="Visualization service not ready")
        
        if format.lower() not in ['png', 'svg', 'html']:
            raise HTTPException(status_code=400, detail="Unsupported format. Use png, svg, or html")
        
        exported_data = await viz_service.export_visualization(visualization_data, format)
        
        # Set appropriate content type
        content_types = {
            'png': 'image/png',
            'svg': 'image/svg+xml',
            'html': 'text/html'
        }
        
        return Response(
            content=exported_data,
            media_type=content_types[format.lower()],
            headers={"Content-Disposition": f"attachment; filename=visualization.{format.lower()}"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))