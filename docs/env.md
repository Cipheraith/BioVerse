# Environment Variables

## Root
- No required root-level envs. Use per-service `.env` files.

## server (Node API)
- `PORT` (default 3000)
- `CORS_ORIGIN` (e.g., http://localhost:5173)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET`, `JWT_EXPIRY`
- `ENABLE_RATE_LIMITING` ("true" to enable)
- `ENABLE_REQUEST_LOGGING` ("true" to enable)
- `PYTHON_AI_URL` (e.g., http://localhost:8000)
- `REDIS_URL` (e.g., redis://localhost:6379)

## python-ai (FastAPI)
- `PYTHON_AI_PORT` (default 8000), `PYTHON_AI_HOST` (default 0.0.0.0)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (optional)
- `NODE_SERVER_URL`, `NODE_SERVER_API_KEY`
- `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `ENABLE_OLLAMA`
- `REDIS_URL`, `ENABLE_REDIS_CACHE`
- `LOG_LEVEL`, `WORKER_PROCESSES`, `DEBUG`

## client (React)
- `VITE_API_BASE_URL` (e.g., http://localhost:3000/api)
- `VITE_FIREBASE_*` (API key, domain, project, storage, sender ID, app ID)

## docker-compose.yml overrides
- `POSTGRES_*` for DB container
- `DB_*` and `REDIS_URL` for services
- `JWT_SECRET`, `PYTHON_AI_API_KEY` for inter-service auth
- `OLLAMA_BASE_URL`, `OLLAMA_MODEL`
