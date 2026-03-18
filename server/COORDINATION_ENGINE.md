# BioVerse Coordination Engine

## Overview

The Coordination Engine integrates DHIS2 (District Health Information System 2) with BioVerse to provide real-time supply chain intelligence, outbreak detection, and facility resource coordination across Zambia's health system.

## Features

- **DHIS2 Integration**: Automatic ingestion of stock data from public hospitals
- **Pharmacy Portal**: Private pharmacies can push stock updates via API
- **Intelligent Status Computation**: Calculates CRITICAL/HEALTHY/SURPLUS based on days-of-supply
- **Spatial Matchmaking**: Matches critical stockouts with nearest surplus facilities
- **Transfer Alerts**: Generates actionable transfer recommendations
- **Ministry Dashboard**: Real-time visibility for decision makers

## Architecture

```
DHIS2 API → Coordination Service → PostgreSQL
                ↓
         Status Computation
                ↓
         Spatial Matching
                ↓
         Transfer Alerts → Ministry Dashboard
```

## Setup

### 1. Environment Variables

Add to your `.env` file:

```bash
# DHIS2 Configuration
DHIS2_API_URL=https://play.dhis2.org/2.40.0
DHIS2_USERNAME=admin
DHIS2_PASSWORD=district
DHIS2_STOCK_DATASET_ID=your_dataset_id
DHIS2_ORG_UNIT_ID=ImspTQPwCqd
```

### 2. Run Migrations

```bash
cd server
psql -U bioverse_admin -d bioverse_zambia_db -f migrations/001_coordination_engine.sql
psql -U bioverse_admin -d bioverse_zambia_db -f migrations/002_coordination_seed_data.sql
```

### 3. Start Server

The coordination scheduler starts automatically when the server starts:

```bash
npm start
```

The engine runs every 6 hours automatically.

## API Endpoints

### GET /api/v1/coordination/status-map

Returns facility status map for visualization.

**Auth**: Required (roles: admin, moh, health_worker)

**Response**:
```json
[
  {
    "facility_id": 1,
    "name": "Lusaka General Hospital",
    "type": "PUBLIC_HOSPITAL",
    "latitude": -15.4167,
    "longitude": 28.2833,
    "district": "Lusaka",
    "province": "Lusaka",
    "status": "HEALTHY",
    "critical_items_count": 1
  }
]
```

### GET /api/v1/coordination/critical-transfers

Returns open transfer alerts.

**Auth**: Required (roles: admin, moh)

**Response**:
```json
[
  {
    "alert_id": "TRN-992",
    "item": "Coartem 20/120mg",
    "item_category": "MEDICATION",
    "action": "TRANSFER_REQUIRED",
    "from_facility": {
      "name": "PillBox Pharmacy Lusaka",
      "type": "PRIVATE_PHARMACY",
      "district": "Lusaka",
      "surplus_amount": 1000,
      "distance_km": 12.5
    },
    "to_facility": {
      "name": "Chongwe Rural Health Centre",
      "type": "RURAL_CLINIC",
      "district": "Chongwe",
      "shortage_timeframe": "48 Hours",
      "location": {
        "latitude": -15.3300,
        "longitude": 28.6800
      }
    },
    "created_at": "2025-01-15T10:30:00Z",
    "status": "OPEN"
  }
]
```

### PATCH /api/v1/coordination/alerts/:alertId

Update alert status.

**Auth**: Required (roles: admin, moh)

**Request**:
```json
{
  "status": "ACKNOWLEDGED",
  "notes": "Transfer scheduled for tomorrow"
}
```

**Response**:
```json
{
  "success": true,
  "alert": { ... }
}
```

### POST /api/v1/pharmacy/update-stock

Pharmacy stock update endpoint.

**Auth**: Required (roles: pharmacy, admin)

**Request**:
```json
{
  "facility_id": 6,
  "item_id": 1,
  "current_stock": 1200,
  "daily_burn_rate": 25
}
```

**Response**:
```json
{
  "success": true,
  "updated": {
    "facility_id": 6,
    "item_id": 1,
    "current_stock": 1200,
    "daily_burn_rate": 25,
    "status": "SURPLUS",
    "last_updated": "2025-01-15T14:22:00Z"
  }
}
```

## Status Computation

Stock status is computed based on days of supply:

```
Days of Supply = Current Stock / Daily Burn Rate

CRITICAL: < 3 days
HEALTHY: 3-30 days
SURPLUS: > 30 days
```

## Spatial Matching Algorithm

For each CRITICAL facility:
1. Find all SURPLUS facilities with the same item
2. Calculate Haversine distance to each
3. Select nearest facility
4. Generate transfer alert with:
   - Distance in km
   - Surplus amount available
   - Shortage timeframe (hours until stockout)

## Testing

### Manual Trigger

You can manually trigger a coordination cycle:

```javascript
const { runCoordinationCycle } = require('./src/services/coordinationService');
runCoordinationCycle();
```

### Test with Sample Data

The seed data includes:
- 10 facilities across Zambia
- 10 inventory items
- Mix of CRITICAL, HEALTHY, and SURPLUS stock levels

Run the cycle and check:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/coordination/critical-transfers
```

## DHIS2 Integration

### Data Mapping

The engine maps DHIS2 concepts to BioVerse:

| DHIS2 | BioVerse |
|-------|----------|
| Organisation Unit | Facility |
| Data Element | Inventory Item |
| Data Value | Stock Level |

### Sync Process

1. Fetch data value sets from DHIS2 API
2. Map org units to facilities via `dhis2_org_unit_id`
3. Map data elements to items via `dhis2_data_element_id`
4. Upsert stock levels
5. Log sync results to `dhis2_sync_log`

### Error Handling

- DHIS2 API failures are logged but don't crash the cycle
- Unmapped org units/data elements are skipped with warnings
- Sync status tracked in `dhis2_sync_log` table

## Monitoring

Check sync logs:
```sql
SELECT * FROM dhis2_sync_log ORDER BY started_at DESC LIMIT 10;
```

Check current alerts:
```sql
SELECT COUNT(*) FROM transfer_alerts WHERE status = 'OPEN';
```

Check facility status distribution:
```sql
SELECT status, COUNT(*) 
FROM facility_stock_levels 
GROUP BY status;
```

## Production Deployment

### Scheduler Configuration

The default interval is 6 hours. To change:

```javascript
// server/src/services/coordinationScheduler.js
const COORDINATION_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours
```

### Performance Considerations

- For 100s of facilities: Current implementation is sufficient
- For 1000s of facilities: Consider batch updates and PostGIS for spatial queries
- For 10000s of facilities: Implement pagination and async processing

### Security

- All endpoints require JWT authentication
- Role-based access control enforced
- DHIS2 credentials stored in environment variables
- Parameterized queries prevent SQL injection

## Troubleshooting

### DHIS2 Connection Issues

Check logs for:
```
Error: DHIS2 ingestion failed: connect ETIMEDOUT
```

Solutions:
- Verify `DHIS2_API_URL` is accessible
- Check username/password
- Increase timeout in `coordinationService.js`

### No Transfer Alerts Generated

Possible causes:
- No CRITICAL facilities
- No SURPLUS facilities with matching items
- Check status computation: `SELECT * FROM facility_stock_levels WHERE status = 'CRITICAL';`

### Scheduler Not Running

Check server logs for:
```
Starting Coordination Scheduler (6-hour interval)
```

If missing, verify `startCoordinationScheduler()` is called in `server/src/index.js`.

## Future Enhancements

- [ ] SMS notifications for critical alerts
- [ ] Automated transfer order generation
- [ ] Integration with logistics/transport systems
- [ ] Predictive stockout forecasting
- [ ] Mobile app for field workers
- [ ] Real-time dashboard with WebSockets
- [ ] Multi-country support
- [ ] Blockchain-based supply chain tracking
