# BioVerse Architecture

## System Overview

BioVerse is a cloud-native, microservices-based health coordination platform built as a monorepo with four core services.

### Architectural Principles

1. **Unified Platform**: Single API surface for health system coordination
2. **DHIS2 Integration**: Real-time sync with national HMIS via DHIS2 API
3. **Scalable Design**: Horizontal scaling for population-level deployments
4. **Offline-First**: Works with intermittent connectivity via SMS/USSD fallbacks
5. **Supply Chain Focus**: Stock-level coordination across facilities with automated transfer alerts
6. **Real-Time Processing**: Sub-second response times for critical operations

The system uses a microservices architecture with shared PostgreSQL, Redis, and optional Cassandra for time-series data.

## Use Cases

BioVerse addresses healthcare coordination challenges in resource-constrained environments:

1.  **Rural Healthcare Access:** Remote patient monitoring with automated emergency dispatch when health deterioration is detected. Coordination engine tracks stock levels at rural facilities to prevent stockouts.

2.  **Supply Chain Coordination:** DHIS2 data ingestion syncs organisation units and stock data elements. Burn-rate analysis identifies shortage risks and generates transfer alerts from surplus facilities.

3.  **Medical Records Access:** Centralized digital health records accessible across facilities. Eliminates lost documents and ensures continuity of care.

4.  **Resource Optimization:** Real-time facility capacity and stock-level tracking. Intelligent routing to facilities with required supplies.

## High-level Components
Web Frontend (`client/`): Vite + React + TypeScript + Tailwind
Backend API (`server/`): Node.js + Express + PostgreSQL + Redis
AI/ML Service (`python-ai/`): FastAPI + ML/LLM + Vision + Federated
Mobile (`bioverse-mobile/`): Expo React Native
Infra (`terraform/`): AWS VPC, ALB, ECS, RDS, ElastiCache, S3, WAF, CloudWatch

## Data Flow
1. Users interact via web PWA or mobile app
2. Web/mobile call Backend API (`server`) under `/api/*`
3. Backend persists to PostgreSQL and uses Redis
4. Coordination engine syncs from DHIS2 (org units, data elements, data values)
5. Stock statuses computed, transfer alerts generated for critical/surplus pairs
6. Frontend displays coordination dashboard with real-time stock map

## Inter-service Contracts
- Backend -> DHIS2: `DHIS2_API_URL` (default `https://play.im.dhis2.org/dev`)
- Coordination API: `/api/v1/coordination/*` (status-map, critical-transfers, alerts)
- DHIS2 Sync API: `/api/v1/dhis2/*` (test-connection, sync/org-units, sync/data-elements, sync/data-values, sync/full, sync/history)
- Pharmacy API: `/api/v1/pharmacy/update-stock`

## Observability
- Node: `/health` and Swagger at `/api/docs`
- FastAPI: `/health`, Swagger `/docs`, ReDoc `/redoc`
- CloudWatch logs and alarms (Terraform), Prometheus client in AI

## Security
- Helmet, rate limiting (server)
- JWT auth (server), API key middleware (AI)
- WAF, KMS encryption, TLS via ACM (Terraform)

## Storage
- PostgreSQL primary DB
- Redis cache/session
- S3 for static assets/logs/backups (Terraform)

## Networking
- Docker Compose network for local dev
- AWS VPC with public/private/database subnets and NATs in production
