# Setup Guide

## Prerequisites
- Node.js 20+, npm 10+
- Python 3.10/3.11
- Docker and Docker Compose

## Monorepo install
```bash
npm run install:all
```

## Local development (without Docker)
- Backend API
```bash
cd server
cp .env.example .env    # create and fill secrets if available
npm run dev
# API at http://localhost:3000, docs at http://localhost:3000/api/docs
```

- Python AI Service
```bash
cd python-ai
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export PYTHON_AI_PORT=8000 PYTHON_AI_HOST=0.0.0.0
python main.py
# Swagger at http://localhost:8000/docs
```

- Web Frontend
```bash
cd client
cp .env.example .env
npm run dev
# App at http://localhost:5173
```

## Local with Docker
```bash
docker compose -f docker-compose.dev.yml up -d --build
# Web: http://localhost:5173
# API: http://localhost:3000 (Swagger: /api/docs)
# Postgres: 5432, Redis: 6379, Mongo: 27017
```

## Full stack Docker (with AI service)
```bash
docker compose up -d --build
# API: http://localhost:3000/health
# AI:  http://localhost:8000/health (Swagger: /docs)
```

## Seeding and migrations (server)
```bash
cd server
npm run migrate
npm run seed
```

## Useful scripts
```bash
npm run logs:all      # tail all logs
npm run clean         # clean node_modules and logs
npm run reset         # reinstall deps after clean
```
