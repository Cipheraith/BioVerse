# Backend API (Node.js)

Express server with PostgreSQL and Redis integration. Swagger available at `/api/docs`.

## Entry point
- `server/src/index.js`: sets security (Helmet), compression, optional rate limiting, CORS, health, Swagger, Socket.IO.
- Database auto-initialized via `server/src/config/database.js` which runs schema and seeds.

## Health
- `GET /health` -> service status
- `GET /api/healthcheck` -> router-level status

## Key Environment Variables
- `PORT` (default 3000)
- `DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD`
- `CORS_ORIGIN`
- `ENABLE_RATE_LIMITING` ("true" to enable)
- `ENABLE_REQUEST_LOGGING` ("true" to log)
- `PYTHON_AI_URL` (default `http://python-ai:8000` in Docker)
- `JWT_SECRET`, `JWT_EXPIRY`

## Routes (mounted under `/api`)
- `auth` -> `server/src/routes/auth.js`
- `patients` -> patient CRUD and queries
- `appointments` -> schedule and list
- `pregnancies`, `srh`, `labs`, `locations`
- `health-twin` and `health-twins` (alias)
- `telemedicine` -> virtual consultations and video call support
- `predictive`, `dashboard`, `reports`, `policies`, `performance`
- `notifications`, `messages`, `users`, `me`, `billing`, `marketplace`, `mobile`, `ai`, `luma`
- `health/voiceAnalysis`

Consult Swagger at `/api/docs` for details and schemas.

## Database
- Initialized by `schema.sql` with tables for patients, users, messages, locations, telemedicine (e.g., `virtual_consultations`).
- Seeding performed on first run in `initializeDatabase()`.

## Testing
```bash
cd server
npm test            # Jest tests
npm run test:watch
npm run test:coverage
```

## Performance & Observability
- Compression, connection pooling, query and statement timeouts
- `performanceMonitor` middleware (request timings)
- Logs via `winston`; API doc generation via `swagger-jsdoc`
