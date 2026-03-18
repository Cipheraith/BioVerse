# AI Service (FastAPI)

## Overview

The BioVerse AI service is a FastAPI application that provides machine learning predictions and analytics for the health supply chain platform. It runs on `localhost:8000`.

## Architecture

- **Entry Point**: `python-ai/main.py`
- **Middleware**: CORS, GZip compression, API key authentication, structured logging
- **Documentation**: Swagger UI at `/docs`, ReDoc at `/redoc`
- **Health Check**: `/health`

## Services

| Service | File | Purpose |
|---|---|---|
| ML Service | `services/ml_service.py` | RandomForest + GradientBoosting models for stock demand prediction |
| Advanced Prediction | `services/advanced_prediction_service.py` | Extended prediction models |
| Ollama Service | `services/ollama_service.py` | Local LLM integration (optional, requires Ollama running) |
| Visualization | `services/visualization_service.py` | Chart and report generation |
| Database | `services/database_service.py` | Direct PostgreSQL access for ML data |

## Routes

| Route Module | Purpose |
|---|---|
| `routes/ml_models.py` | Train models, get predictions, model status |
| `routes/analytics.py` | Aggregated analytics and trend analysis |
| `routes/visualizations.py` | Generate visual reports |

## Dependencies

```
fastapi
uvicorn
scikit-learn
numpy
pandas
python-dotenv
asyncpg
httpx
```

## Running

```bash
cd python-ai
pip install -r requirements.txt
python main.py  # starts on port 8000
```

Ollama is optional. The service starts without it and logs a warning. ML prediction endpoints work independently.