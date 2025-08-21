"""
API Routes for Federated Learning Management
"""

from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List, Dict, Any

from services.federated_learning_service import FederatedLearningService

# In a real app, this service would be a singleton managed by the app's lifespan
# and injected, but for simplicity, we instantiate it here.
# This should be improved to use app.state for a shared instance.
federated_service = FederatedLearningService()

router = APIRouter()

@router.post("/participants/register", status_code=201)
async def register_participant(institution_data: Dict[str, Any] = Body(...)):
    """Register a new healthcare institution as a participant."""
    try:
        participant = await federated_service.register_participant(institution_data)
        return {"message": "Participant registered successfully", "participant": participant}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/participants", response_model=List[Dict[str, Any]])
async def list_participants():
    """List all registered participants."""
    return federated_service.list_participants()

@router.post("/models/initialize", status_code=201)
async def initialize_model(model_config: Dict[str, str] = Body(...)):
    """Initialize a new global model for training."""
    model_type = model_config.get("model_type")
    model_id = model_config.get("model_id")
    if not model_type or not model_id:
        raise HTTPException(status_code=400, detail="'model_type' and 'model_id' are required.")
    
    try:
        model = federated_service.initialize_global_model(model_type, model_id)
        return {"message": "Global model initialized successfully", "model_id": model.model_id}
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

@router.get("/models", response_model=List[Dict[str, Any]])
async def list_models():
    """List all available global models."""
    return federated_service.list_models()

@router.get("/models/{model_id}")
async def get_model_status(model_id: str):
    """Get the status of a specific global model."""
    status = federated_service.get_model_status(model_id)
    if not status:
        raise HTTPException(status_code=404, detail="Model not found.")
    return status

@router.post("/training/start_round")
async def start_training_round(training_request: Dict[str, Any] = Body(...)):
    """Start a new federated training round."""
    model_id = training_request.get("model_id")
    participant_ids = training_request.get("participant_ids")

    if not model_id or not participant_ids:
        raise HTTPException(status_code=400, detail="'model_id' and 'participant_ids' are required.")

    try:
        result = await federated_service.start_training_round(model_id, participant_ids)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")
