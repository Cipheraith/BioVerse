# DHIS2 Integration Quick Start

## Overview

BioVerse integrates with DHIS2 (District Health Information System 2) to provide real-time supply chain intelligence and facility coordination.

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- DHIS2 instance (or use play.dhis2.org for testing)

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bioverse_zambia_db
DB_USER=bioverse_admin
DB_PASSWORD=your_password

# DHIS2 Configuration
DHIS2_API_URL=https://play.dhis2.org/2.40.0
DHIS2_USERNAME=admin
DHIS2_PASSWORD=district
DHIS2_STOCK_DATASET_ID=your_dataset_id
DHIS2_ORG_UNIT_ID=ImspTQPwCqd
```

### 3. Run Migrations

```bash
npm run migrate:coordination
```

This creates:
- `facilities` table
- `inventory_catalog` table
- `facility_stock_levels` table
- `transfer_alerts` table
- `dhis2_sync_log` table

And seeds sample data for testing.

### 4. Test the Integration

```bash
npm run test:coordination
```

Expected output:
```
=== Testing Coordination Engine ===

1. Checking database connection...
✓ Database connected: 2025-01-15T...

2. Checking facilities...
✓ Found 10 facilities

3. Checking inventory catalog...
✓ Found 10 inventory items

4. Checking stock levels...
Stock status distribution:
  CRITICAL: 8
  HEALTHY: 15
  SURPLUS: 7

5. Running coordination cycle...
=== Starting Coordination Cycle ===
...
=== Coordination Cycle Complete (1234ms) ===

6. Checking generated alerts...
Transfer alerts:
  OPEN: 5

Sample alert:
  Alert ID: TRN-1
  Item: Coartem 20/120mg
  From: PillBox Pharmacy Lusaka
  To: Chongwe Rural Health Centre
  Distance: 42.15 km
  Timeframe: 48 Hours

✓ Coordination engine test completed successfully
```

### 5. Start Server

```bash
npm start
```

The coordination scheduler runs automatically every 6 hours.

## API Usage

### Get Facility Status Map

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/coordination/status-map
```

### Get Critical Transfer Alerts

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/coordination/critical-transfers
```

### Update Pharmacy Stock

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "facility_id": 6,
    "item_id": 1,
    "current_stock": 1200,
    "daily_burn_rate": 25
  }' \
  http://localhost:3000/api/v1/pharmacy/update-stock
```

## DHIS2 Data Mapping

### Organization Units → Facilities

Map DHIS2 org units to facilities using `dhis2_org_unit_id`:

```sql
UPDATE facilities 
SET dhis2_org_unit_id = 'YOUR_ORG_UNIT_ID' 
WHERE id = 1;
```

### Data Elements → Inventory Items

Map DHIS2 data elements to inventory items using `dhis2_data_element_id`:

```sql
UPDATE inventory_catalog 
SET dhis2_data_element_id = 'YOUR_DATA_ELEMENT_ID' 
WHERE id = 1;
```

## Architecture

```
┌─────────────┐
│   DHIS2     │
│   API       │
└──────┬──────┘
       │ HTTP GET /api/dataValueSets
       │ (every 6 hours)
       ▼
┌─────────────────────────────┐
│  Coordination Service       │
│  - ingestDHIS2StockLevels() │
│  - computeStockStatuses()   │
│  - generateTransferAlerts() │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────┐
│   PostgreSQL    │
│  - facilities   │
│  - stock_levels │
│  - alerts       │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│  REST API       │
│  /status-map    │
│  /critical-     │
│   transfers     │
└─────────────────┘
```

## Status Computation

```javascript
Days of Supply = Current Stock / Daily Burn Rate

if (daysOfSupply < 3)  → CRITICAL
if (daysOfSupply <= 30) → HEALTHY
if (daysOfSupply > 30)  → SURPLUS
```

## Spatial Matching

For each CRITICAL facility:
1. Find all SURPLUS facilities with same item
2. Calculate Haversine distance
3. Select nearest facility
4. Generate transfer alert

## Monitoring

### Check Sync Logs

```sql
SELECT * FROM dhis2_sync_log 
ORDER BY started_at DESC 
LIMIT 10;
```

### Check Alert Status

```sql
SELECT status, COUNT(*) 
FROM transfer_alerts 
GROUP BY status;
```

### Check Stock Distribution

```sql
SELECT 
  f.name,
  ic.item_name,
  fsl.current_stock,
  fsl.daily_burn_rate,
  fsl.status
FROM facility_stock_levels fsl
JOIN facilities f ON fsl.facility_id = f.id
JOIN inventory_catalog ic ON fsl.item_id = ic.id
WHERE fsl.status = 'CRITICAL'
ORDER BY fsl.current_stock / fsl.daily_burn_rate;
```

## Troubleshooting

### DHIS2 Connection Failed

Check:
- `DHIS2_API_URL` is accessible
- Username/password are correct
- Network allows outbound HTTPS

### No Alerts Generated

Check:
- Are there CRITICAL facilities? `SELECT * FROM facility_stock_levels WHERE status = 'CRITICAL';`
- Are there SURPLUS facilities? `SELECT * FROM facility_stock_levels WHERE status = 'SURPLUS';`
- Do they have matching items?

### Scheduler Not Running

Check server logs for:
```
Starting Coordination Scheduler (6-hour interval)
```

Verify `startCoordinationScheduler()` is called in `server/src/index.js`.

## Production Deployment

### Environment Variables

Set in production:
```bash
DHIS2_API_URL=https://your-dhis2-instance.org
DHIS2_USERNAME=your_username
DHIS2_PASSWORD=your_secure_password
DHIS2_STOCK_DATASET_ID=your_dataset_id
DHIS2_ORG_UNIT_ID=your_org_unit_id
```

### Scheduler Interval

Default: 6 hours

To change, edit `server/src/services/coordinationScheduler.js`:
```javascript
const COORDINATION_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours
```

### Performance

- Current implementation handles 100s of facilities efficiently
- For 1000s of facilities: Add database indexes and batch processing
- For 10000s of facilities: Consider PostGIS for spatial queries

## Next Steps

1. Map your DHIS2 org units to facilities
2. Map your DHIS2 data elements to inventory items
3. Configure sync schedule
4. Set up monitoring and alerts
5. Integrate with frontend dashboard
6. Add SMS notifications for critical alerts
