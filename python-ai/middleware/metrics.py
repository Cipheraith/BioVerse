"""
Metrics middleware for BioVerse Python AI Service
"""

from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from fastapi import Request, Response
from fastapi.responses import Response as FastAPIResponse
import time
import os

# Metrics
REQUEST_COUNT = Counter('bioverse_ai_requests_total', 'Total requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('bioverse_ai_request_duration_seconds', 'Request duration', ['method', 'endpoint'])
HEALTH_TWIN_OPERATIONS = Counter('bioverse_ai_health_twin_operations_total', 'Health twin operations', ['operation'])
ML_PREDICTIONS = Counter('bioverse_ai_ml_predictions_total', 'ML predictions', ['model_type'])

def setup_metrics(app):
    """Set up metrics collection"""
    
    @app.middleware("http")
    async def metrics_middleware(request: Request, call_next):
        """Collect metrics for each request"""
        start_time = time.time()
        
        response = await call_next(request)
        
        # Record metrics
        duration = time.time() - start_time
        REQUEST_DURATION.labels(
            method=request.method,
            endpoint=request.url.path
        ).observe(duration)
        
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=request.url.path,
            status=response.status_code
        ).inc()
        
        return response
    
    @app.get("/metrics")
    async def get_metrics():
        """Prometheus metrics endpoint"""
        if not os.getenv("ENABLE_METRICS", "false").lower() == "true":
            return {"error": "Metrics not enabled"}
        
        return FastAPIResponse(
            content=generate_latest(),
            media_type=CONTENT_TYPE_LATEST
        )

def record_health_twin_operation(operation: str):
    """Record health twin operation"""
    HEALTH_TWIN_OPERATIONS.labels(operation=operation).inc()

def record_ml_prediction(model_type: str):
    """Record ML prediction"""
    ML_PREDICTIONS.labels(model_type=model_type).inc()