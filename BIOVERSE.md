# BioVerse — Health System Coordination Platform

## What Is BioVerse?

BioVerse is an open-source health system coordination platform that connects clinics, pharmacies, district health offices, and ministries of health into a single real-time operational picture. It ingests facility and supply chain data from **DHIS2** (the world's largest health management information system), applies burn-rate analytics and spatial intelligence, and surfaces actionable decisions — from emergency stock transfers to outbreak alerts — directly to the people who need them.

Built for resource-constrained health systems in sub-Saharan Africa (starting with Zambia), BioVerse replaces guesswork with live visibility. A district health officer no longer discovers a clinic ran out of antimalarials two weeks after the fact; she sees the stockout developing in real time and approves a transfer from a surplus facility 12 km away — before a single patient goes without treatment.

---

## The Problem

Health systems in low- and middle-income countries suffer from a common set of failures:

- **Medication stockouts** at the point of care — while surplus stock expires in a warehouse 30 km away.
- **Fragmented data** locked in paper registers, disconnected DHIS2 instances, and siloed Excel sheets.
- **No real-time visibility** — ministries learn about crises weeks or months after they happen.
- **Manual coordination** — health workers phone and WhatsApp each other to move supplies, with no audit trail.
- **Outbreak detection lag** — disease spikes are identified from aggregated monthly reports instead of live intake data.

These aren't technology problems in isolation. They're coordination failures. The data exists — it's just not connected, not timely, and not actionable.

---

## How BioVerse Solves It

### The Coordination Engine

At the heart of BioVerse is a **supply chain intelligence engine** that continuously answers three questions:

1. **Who is running out?** — Every facility's stock level is divided by its daily burn rate to produce a `Days of Supply` metric. Facilities with fewer than 3 days of supply are flagged **CRITICAL**.

2. **Who has surplus?** — Facilities with more than 30 days of supply are flagged **SURPLUS**. Between 3 and 30 is **HEALTHY**.

3. **Who is closest?** — A spatial query matches each critical facility to the nearest surplus facility for the same item, calculates the distance, and generates an automated **transfer alert** with the recommended quantity.

This runs across **1,341 facilities**, **41 tracked medical commodities**, and **5,459 stock-level records** — producing a live national supply map and prioritized emergency transfer list.

### Four Role-Based Dashboards

BioVerse serves four distinct user personas, each with a purpose-built interface:

| Persona | Dashboard | What They See |
|---|---|---|
| **Ministry of Health** | National Dashboard | National health score, district-by-district breakdown, critical facility list, stock distribution, transfer activity feed |
| **District Health Officer** | District Dashboard | Facility status within their district, stock breakdown by item with stacked bars, transfer alerts, search and filter |
| **Facility Manager** | Facility Console | Ward/bed management with occupancy bars, pharmacy inventory with days-of-supply, incoming/outgoing transfers, patient intake logs, care referrals |
| **Health Worker** | Health Worker Portal | Quick-action forms (patient intake, care referral, stock update), low stock alerts, recent patients, pending referrals |

Access is controlled by role — a health worker cannot see the national dashboard, and a ministry official doesn't need to update stock. The sidebar navigation adapts automatically based on who is logged in.

### Live Facility Map

An interactive **Leaflet map** plots all 1,341 facilities on OpenStreetMap tiles, color-coded by supply status (red = critical, green = healthy, blue = surplus). Click any marker to see facility details, filter by status category, and fly to selected facilities.

### DHIS2 Integration

BioVerse connects to DHIS2 via its Web API and pulls:
- **Organisation units** → `facilities` table (name, type, coordinates, district, province)
- **Data values** → stock levels mapped to the internal inventory catalog

This is a middleware pattern — BioVerse acts as a "hub" between DHIS2, public clinics, and private pharmacies, normalizing everything into PostgreSQL for fast querying and coordination logic.

---

## Architecture

BioVerse is a **monorepo** with four services:

```
┌─────────────────────────────────────────────────────┐
│                     BioVerse                        │
├──────────┬──────────┬──────────┬───────────────────-┤
│  client/ │  server/ │python-ai/│  bioverse_mobile/  │
│  React   │  Express │  FastAPI │  Flutter / Dart    │
│  Vite    │  Node.js │  ML/AI   │  iOS + Android     │
│  TypeScript│ PostgreSQL│ sklearn │                   │
│  Tailwind│  Redis   │  Ollama  │                   │
└──────────┴──────────┴──────────┴───────────────────-┘
```

### Frontend (`client/`)
- **React 19** + **TypeScript** + **Vite 7** — fast builds, hot module replacement
- **Tailwind CSS** + **Framer Motion** — consistent design system with smooth animations
- **React-Leaflet** — interactive facility maps with live status markers
- **React Router 7** — role-based protected routes with `ProtectedRoute` wrappers
- **Socket.IO** — real-time updates for alerts and coordination events
- Runs on `localhost:5173`

### Backend (`server/`)
- **Express 5** on **Node.js** — RESTful API with 20+ route groups
- **PostgreSQL** — primary datastore for facilities, stock, users, transfers, intake logs, referrals
- **Redis** — caching layer for session management and frequently accessed data
- **JWT + bcrypt** — authentication with 6 RBAC roles (admin, moh, health_worker, facility_manager, logistics_coordinator, dhis2_admin)
- **Helmet + rate limiting + parameterized queries** — security hardened
- **Swagger** — auto-generated API docs at `/api/docs`
- **Winston** — structured logging with audit trail
- Runs on `localhost:3000`

### AI/ML Service (`python-ai/`)
- **FastAPI** — high-performance Python API for machine learning inference
- **Stock demand prediction** — classical ML (RandomForest, GradientBoosting) trained on facility stock data
- **Ollama integration** — optional local LLM for natural language queries (degrades gracefully if unavailable)
- **Visualization service** — chart and report generation
- Runs on `localhost:8000`

### Mobile (`bioverse_mobile/`)
- **Flutter / Dart** — cross-platform mobile app for iOS and Android
- Offline-first design with SMS/USSD fallbacks for low-connectivity environments
- Emergency button with hold-to-activate safety mechanism

### Infrastructure (`terraform/`)
- **AWS** — VPC, ALB, ECS Fargate, RDS PostgreSQL, ElastiCache Redis, S3, WAF
- **CloudWatch** — monitoring, alarms, log aggregation
- Full IaC with security groups, KMS encryption, and auto-scaling

---

## Key API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/login` | POST | Authenticate user, receive JWT |
| `/api/v1/coordination/status-map` | GET | All facilities with supply status + coordinates |
| `/api/v1/coordination/critical-transfers` | GET | Emergency transfer recommendations |
| `/api/v1/dashboard/national` | GET | Ministry-level national statistics |
| `/api/v1/dashboard/district` | GET | District-filtered facility and stock data |
| `/api/v1/dashboard/facility` | GET | Single-facility ward, stock, transfer detail |
| `/api/v1/dashboard/health-worker` | GET | Health worker intake, referrals, alerts |
| `/api/v1/dashboard/patient-intake` | POST | Record a patient visit |
| `/api/v1/dashboard/referrals` | POST | Submit a care referral |
| `/api/v1/dashboard/stock-update` | POST | Update facility stock level |
| `/api/v1/dhis2/sync` | POST | Trigger DHIS2 data synchronization |
| `/api/v1/pharmacy/update-stock` | POST | Pharmacy stock sync |

---

## Security

BioVerse is designed for healthcare data and takes security seriously:

- **Authentication**: JWT tokens with bcrypt-hashed passwords. Server refuses to start without `JWT_SECRET`.
- **Authorization**: 6 roles with granular route-level access control via `authorizeRoles()` middleware.
- **Transport**: Helmet security headers, CORS restrictions, TLS 1.3 in production, Content Security Policy.
- **Data**: All SQL queries use parameterized placeholders (`$1, $2…`) — no string concatenation.
- **Rate Limiting**: 1,000 requests per 15 minutes per IP (configurable).
- **Audit**: Every DHIS2 sync, stock update, and authentication event is logged with timestamps and user IDs.

---

## Database

PostgreSQL with the following core tables:

| Table | Records | Purpose |
|---|---|---|
| `facilities` | 1,341 | Health facilities synced from DHIS2 with name, type, GPS coordinates, district, province |
| `inventory_catalog` | 41 | Master list of tracked medical commodities |
| `facility_stock_levels` | 5,459 | Current stock per facility per item with daily burn rates |
| `transfer_alerts` | ~51 | Auto-generated emergency transfer recommendations |
| `facility_wards` | ~20 | Ward definitions for facility bed management |
| `facility_ward_beds` | ~60 | Individual bed records with occupancy status |
| `patient_intake_logs` | 15+ | Patient visit records logged by health workers |
| `care_referrals` | 10+ | Inter-facility patient referrals |
| `users` | 6 | Platform users with hashed passwords and roles |

---

## Getting Started

### Prerequisites
- Node.js 20+, npm 10+
- PostgreSQL 15+
- Redis 7+ (optional, for caching)
- Python 3.11 (for AI service)
- Docker (recommended)

### Quick Start

```bash
# Clone
git clone https://github.com/Cipheraith/BioVerse.git
cd BioVerse

# Install all workspaces
npm run install:all

# Start PostgreSQL + Redis via Docker
docker compose up -d

# Configure environment
cp server/.env.example server/.env   # edit DB creds, JWT_SECRET

# Run DHIS2 migration to populate facilities + stock
cd server && node scripts/migrate-persona-tables.js

# Start backend
cd server && node src/index.js        # localhost:3000

# Start frontend
cd client && npm run dev             # localhost:5173
```

### Test Accounts

| Username | Password | Role |
|---|---|---|
| `admin` | `password123` | Admin (full access) |
| `moh.director` | `password123` | Ministry of Health |
| `h.worker` | `password123` | Health Worker |
| `facility.mgr` | `password123` | Facility Manager |
| `logistics` | `password123` | Logistics Coordinator |
| `dhis2.admin` | `password123` | DHIS2 Administrator |

---

## Who Built This

**Fred Solami** — [fredsolami@bioverse.com](mailto:fredsolami@bioverse.com)

**Organization**: Cipheraith

**Repository**: [github.com/Cipheraith/BioVerse](https://github.com/Cipheraith/BioVerse)

**License**: MIT

---

## Why It Matters

Every day, patients in sub-Saharan Africa die from treatable conditions — not because treatments don't exist, but because the right medicine isn't at the right facility at the right time. BioVerse exists to close that gap: connecting the data that already exists in DHIS2, making it visible in real time, and turning it into coordinated action before stockouts become patient outcomes.
