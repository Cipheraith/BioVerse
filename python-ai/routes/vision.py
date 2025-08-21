"""
Vision API Routes for Medical Image Analysis
"""

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from typing import Optional
import logging

# It's better to import the class and instantiate it once,
# but for a quick start, we can instantiate it here.
# In a production app, this would be managed by a dependency injection system.
from services.medical_vision_ai import MedicalVisionAI, ImagingModality

logger = logging.getLogger(__name__)
router = APIRouter()

# This is a simplified instantiation. In a real scenario, this service would
# be initialized once during the application's lifespan and injected.
vision_ai = MedicalVisionAI()

class VisionAnalysisRequest(BaseModel):
    modality: ImagingModality
    clinical_context: Optional[Dict[str, Any]] = None

@router.post("/analyze")
async def analyze_medical_image(
    modality: ImagingModality = Form(...),
    clinical_context_json: Optional[str] = Form("{{}}"), # Receive context as JSON string
    image: UploadFile = File(...)
):
    """
    Analyzes an uploaded medical image.

    - **modality**: The type of medical image (e.g., 'xray', 'dermatology').
    - **clinical_context_json**: A JSON string with clinical details.
    - **image**: The image file to analyze.
    """
    try:
        image_data = await image.read()
        
        # Parse the clinical context from the JSON string
        import json
        try:
            clinical_context = json.loads(clinical_context_json)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON in clinical_context_json.")

        logger.info(f"Received image for analysis. Modality: {modality.value}, Size: {len(image_data)} bytes")

        analysis_result = await vision_ai.analyze_medical_image(
            image_data=image_data,
            modality=modality,
            clinical_context=clinical_context
        )
        
        logger.info(f"Successfully analyzed image. Urgency: {analysis_result.urgency_level}")

        return analysis_result

    except HTTPException:
        # Re-raise HTTP exceptions to let FastAPI handle them
        raise
    except Exception as e:
        logger.error(f"Error during image analysis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during image analysis: {e}")

