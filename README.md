# BioVerse - Health System Coordination Platform

BioVerse is a health system coordination platform that integrates DHIS2, facility management, supply chain intelligence, and emergency response coordination.

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

### Local Development

```bash
# 1. Clone and install
git clone <repository>
cd bioverse
npm install

# 2. Setup database
cd server
cp .env.example .env
# Edit .env with your database credentials

# 3. Run migrations
npm run migrate:coordination

# 4. Test coordination engine
npm run test:coordination

# 5. Start server
npm start
```

### Docker Deployment

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f node-server

# Run migrations
docker-compose exec node-server npm run migrate:coordination
```

## Features

- **DHIS2 Integration**: Automatic stock data ingestion from public health facilities
- **Supply Chain Intelligence**: Real-time stock status tracking (CRITICAL/HEALTHY/SURPLUS)
- **Spatial Matching**: Pairs critical stockouts with nearest surplus facilities
- **Transfer Alerts**: Automated recommendations for resource redistribution
- **Pharmacy Portal**: API for private pharmacies to update stock levels
- **Ministry Dashboard**: Real-time facility status visualization

## Documentation

- [DHIS2 Integration Guide](./DHIS2_INTEGRATION.md)
- [Coordination Engine Details](./server/COORDINATION_ENGINE.md)
- [Architecture Overview](./docs/architecture.md)
- [API Documentation](./docs/backend.md)
- [AI Service](./docs/ai-service.md)

---

# BioVerse Backend Documentation: Core Coordination Engine

### **System Architecture Overview**

BioVerse operates on a **Hub and Spoke** middleware architecture. It acts as the central intelligence hub, continuously ingesting data from external spokes (DHIS2, public clinics, private pharmacies), normalizing that data into a single PostgreSQL database, and running a calculation engine to pair supply surpluses with critical stockouts.

---

### **1. The Data Layer (PostgreSQL Schema)**

To coordinate the system, BioVerse needs to know *who* has *what*, and *where* they are. We use three core relational tables to build this map.

**Table 1: `facilities**`
Tracks both public hospitals (from DHIS2) and private pharmacies.

* `id` (Primary Key)
* `name` (e.g., "Lusaka General" or "PillBox Pharmacy")
* `type` (Enum: 'PUBLIC_HOSPITAL', 'RURAL_CLINIC', 'PRIVATE_PHARMACY')
* `latitude` / `longitude` (For the emergency routing and heat maps)

**Table 2: `inventory_catalog**`
The master list of medications and equipment we are tracking.

* `id` (Primary Key)
* `item_name` (e.g., "Coartem 20/120mg")
* `category` (Enum: 'MEDICATION', 'HARDWARE', 'BLOOD')

**Table 3: `facility_stock_levels**`
The constantly updating ledger of exactly how much of an item is at a specific facility.

* `id` (Primary Key)
* `facility_id` (Foreign Key -> facilities.id)
* `item_id` (Foreign Key -> inventory_catalog.id)
* `current_stock` (Integer: The actual box count)
* `daily_burn_rate` (Float: How many boxes they use per day on average)
* `last_updated` (Timestamp)

---

### **2. The Coordination Engine (The Logic Loop)**

This is the "Brain" of BioVerse. It runs automatically on the Node.js or Python backend using a CRON job (a scheduled task).

**Phase A: Data Ingestion (Every 6 Hours)**

1. The backend fires a `GET` request to the DHIS2 API to pull public hospital stock levels.
2. The backend receives `POST` requests from private pharmacy portals pushing their latest counts.
3. The database updates the `current_stock` in the `facility_stock_levels` table.

**Phase B: The Burn Rate & Status Algorithm**
The engine calculates the status of every single facility based on this math:
`Days_of_Supply = current_stock / daily_burn_rate`

* **CRITICAL:** If `Days_of_Supply < 3` ➔ Flag facility Red.
* **HEALTHY:** If `Days_of_Supply >= 3 AND <= 30` ➔ Flag facility Green.
* **SURPLUS:** If `Days_of_Supply > 30` ➔ Flag facility Blue.

**Phase C: The Matchmaker (The Solution)**
When the engine detects a **CRITICAL** facility, it runs a spatial query (using the latitude/longitude) to find the nearest facility that holds a **SURPLUS** of that exact same `item_id`. It then generates a "Suggested Transfer Route" for the dashboard.

---

### **3. The REST API Endpoints (How the Dashboard talks to the Backend)**

When the Minister of Health logs into your React dashboard, the frontend calls these exact backend routes to display the data.

**Endpoint 1: Fetching the Heat Map Data**

* **Route:** `GET /api/v1/coordination/status-map`
* **What it does:** Returns a JSON array of all facilities and their current Red/Green/Blue status.
* **React Use Case:** Your frontend `.map()` function loops over this array and plots the colored dots on the Zambian map.

**Endpoint 2: The Emergency Transfer Alert**

* **Route:** `GET /api/v1/coordination/critical-transfers`
* **What it does:** Returns a JSON object pairing a starving clinic with a surplus hospital.
* **Response Example:**

```json
{
  "alert_id": "TRN-992",
  "item": "Coartem 20/120mg",
  "action": "TRANSFER_REQUIRED",
  "from_facility": {
    "name": "Lusaka General Hospital",
    "surplus_amount": 450,
    "distance_km": 42
  },
  "to_facility": {
    "name": "Chongwe Rural Health Centre",
    "shortage_timeframe": "48 Hours"
  }
}

```

**Endpoint 3: The Private Pharmacy Sync**

* **Route:** `POST /api/v1/pharmacy/update-stock`
* **What it does:** Allows the lightweight React portal used by private pharmacists to push their daily stock numbers directly into the BioVerse database, bypassing DHIS2 entirely.

---

### **The Architect's Reality**

By structuring the backend this way, you have completely separated the *data collection* from the *data presentation*. The React frontend is stupid—it just draws boxes and maps. The Node.js/Python backend is the genius that does all the matchmaking and math.

Now that you have the architectural blueprint for the backend, which piece of this engine do you want to actually build first? Do you want to map out the exact SQL code to create those database tables, or do you want to write the Node.js Express route for the `GET /api/v1/coordination/status-map` endpoint?