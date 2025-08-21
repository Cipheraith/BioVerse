"""
BioVerse Python AI Service
Main FastAPI application for AI/ML and Digital Twin services
"""

import os
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import our services
from services.ollama_service import OllamaService
from services.health_twin_service import HealthTwinService
from services.ml_service import MLService
from services.visualization_service import VisualizationService
from services.database_service import DatabaseService
from services.generative_quantum_state_service import GenerativeQuantumStateService
from services.advanced_prediction_service import AdvancedPredictionService
from routes import health_twins, ml_models, visualizations, analytics, vision, federated
from middleware.auth import verify_api_key
from middleware.logging import setup_logging
from middleware.metrics import setup_metrics

# Setup logging
logger = setup_logging()

# Global services
ollama_service = None
health_twin_service = None
ml_service = None
viz_service = None
db_service = None
generative_quantum_state_service = None
advanced_prediction_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global ollama_service, health_twin_service, ml_service, viz_service, db_service, advanced_prediction_service
    
    logger.info("🚀 Starting BioVerse Python AI Service...")
    
    try:
        # Initialize database service (optional - can work without it)
        db_service = DatabaseService()
        try:
            await db_service.initialize()
            logger.info("✅ Database service initialized")
        except Exception as e:
            logger.warn(f"Database service initialization failed, continuing without database: {e}")
            db_service = None
        
        # Initialize Ollama service (optional - can work without it)
        ollama_service = OllamaService()
        try:
            await ollama_service.initialize()
            logger.info("✅ Ollama service initialized")
        except Exception as e:
            logger.warn(f"Ollama service initialization failed, continuing without Ollama: {e}")
            ollama_service = None
        
        # Initialize ML service
        ml_service = MLService()
        await ml_service.initialize()
        logger.info("✅ ML service initialized")
        
        # Initialize Advanced Prediction service
        advanced_prediction_service = AdvancedPredictionService()
        await advanced_prediction_service.initialize()
        logger.info("✅ Advanced Prediction service initialized")
        
        # Initialize Health Twin service
        health_twin_service = HealthTwinService(ollama_service, ml_service, db_service, advanced_prediction_service)
        await health_twin_service.initialize()
        logger.info("✅ Health Twin service initialized")
        
        # Initialize Visualization service
        viz_service = VisualizationService()
        await viz_service.initialize()
        logger.info("✅ Visualization service initialized")
        
        # Initialize Generative Quantum State service
        generative_quantum_state_service = GenerativeQuantumStateService()
        # No async initialize method for now, but good to keep consistent pattern
        logger.info("✅ Generative Quantum State service initialized")
        
        # Store services in app state
        app.state.ollama = ollama_service
        app.state.health_twins = health_twin_service
        app.state.ml = ml_service
        app.state.viz = viz_service
        app.state.db = db_service
        app.state.generative_quantum_state = generative_quantum_state_service
        app.state.advanced_prediction = advanced_prediction_service
        
        logger.info("🎉 All services initialized successfully!")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize services: {e}")
        raise
    
    yield
    
    # Cleanup
    logger.info("🛑 Shutting down BioVerse Python AI Service...")
    if db_service:
        await db_service.close()
    logger.info("✅ Cleanup completed")

# Create FastAPI app
app = FastAPI(
    title="BioVerse AI Service",
    description="AI-Powered Health Twin and Machine Learning Service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Setup metrics
setup_metrics(app)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "BioVerse Python AI",
        "version": "1.0.0",
        "timestamp": asyncio.get_event_loop().time(),
        "services": {
            "ollama": ollama_service.is_available if ollama_service else False,
            "ml": ml_service.is_ready if ml_service else False,
            "database": db_service.is_connected if db_service else False,
            "visualization": viz_service.is_ready if viz_service else False
        }
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "message": "🏥 BioVerse Python AI Service",
        "description": "AI-Powered Health Twin and Machine Learning Service",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "health_twins": "/api/v1/health-twins",
            "ml_models": "/api/v1/ml",
            "visualizations": "/api/v1/viz",
            "analytics": "/api/v1/analytics"
        }
    }

# Include routers
app.include_router(health_twins.router, prefix="/api/v1/health-twins", tags=["Health Twins"])
app.include_router(ml_models.router, prefix="/api/v1/ml", tags=["Machine Learning"])
app.include_router(visualizations.router, prefix="/api/v1/viz", tags=["Visualizations"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(vision.router, prefix="/api/v1/vision", tags=["Medical Vision"])
app.include_router(federated.router, prefix="/api/v1/federated", tags=["Federated Learning"])

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": asyncio.get_event_loop().time()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500,
            "timestamp": asyncio.get_event_loop().time()
        }
    )

if __name__ == "__main__":
    port = int(os.getenv("PYTHON_AI_PORT", 8000))
    host = os.getenv("PYTHON_AI_HOST", "0.0.0.0")
    
    logger.info(f"🚀 Starting BioVerse Python AI Service on {host}:{port}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=os.getenv("DEBUG", "false").lower() == "true",
        workers=1 if os.getenv("DEBUG", "false").lower() == "true" else int(os.getenv("WORKER_PROCESSES", 4))
    )