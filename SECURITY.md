# BioVerse Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability, please report it responsibly:

- **Email**: security@bioverse.org (or the project maintainer directly)
- **Do NOT** open a public GitHub issue for security vulnerabilities
- Include steps to reproduce, impact assessment, and suggested fix if possible
- We aim to acknowledge reports within 48 hours and provide a fix within 7 days for critical issues

---

## Architecture Overview

BioVerse is a health supply-chain coordination platform with these components:

| Component | Technology | Port |
|-----------|-----------|------|
| Backend API | Node.js + Express 5 | 3000 |
| Frontend SPA | React + Vite | 5173 |
| Database | PostgreSQL | 5432 |
| Real-time | Socket.io (WebSocket) | 3000 |
| External | DHIS2 API (HTTPS) | 443 |

---

## Authentication & Authorization

### JWT-Based Authentication

- All authenticated API routes require a `Bearer` token in the `Authorization` header
- Tokens are signed with `JWT_SECRET` (env variable, **required** — server refuses to start without it)
- Passwords are hashed with **bcryptjs** (salt rounds: 10) before storage
- Token verification middleware: `server/src/middleware/auth.js`

### Role-Based Access Control (RBAC)

Six roles are enforced via `authorizeRoles()` middleware:

| Role | Access Level |
|------|-------------|
| `admin` | Full system access, user management, DHIS2 sync triggers |
| `moh` | Ministry of Health — national dashboards, sync history, read-only DHIS2 status |
| `health_worker` | Patient records, consultations, maternal health |
| `patient` | Own records, telemedicine, symptom checks |
| `pharmacy` | Inventory management, prescription fulfillment |
| `ambulance_driver` | Dispatch map, emergency response |

### DHIS2 Integration Authentication

- DHIS2 API calls use **HTTP Basic Auth** (`DHIS2_USERNAME` / `DHIS2_PASSWORD`)
- Credentials are stored in environment variables, never in source code
- The DHIS2 client is created per-request with `axios.create()` — no credential caching in memory
- All DHIS2 sync operations require `admin` role

---

## Transport Security

### HTTPS

- Production deployments must use TLS termination (reverse proxy: nginx, Caddy, or cloud LB)
- DHIS2 API communication is always over HTTPS
- `Strict-Transport-Security` header is set via Helmet in production

### Security Headers (Helmet)

The server applies these headers via `helmet()`:

- `Content-Security-Policy` — restricts script/style/connect sources to `'self'`
- `X-Frame-Options` — prevents clickjacking (`frameSrc: 'none'`)
- `X-Content-Type-Options` — prevents MIME sniffing
- `Cross-Origin-Embedder-Policy` — enabled in production

### CORS

- Origin restricted to `CORS_ORIGIN` env variable (default: `http://localhost:5173`)
- Credentials enabled, methods limited to `GET, POST, PUT, DELETE, OPTIONS`
- Only `Content-Type` and `Authorization` headers allowed

---

## Rate Limiting

- Express rate limiter: 1,000 requests per 15 minutes per IP (configurable via `API_RATE_LIMIT`)
- Enabled when `ENABLE_RATE_LIMITING=true`
- Returns `429 Too Many Requests` with descriptive message
- Standard rate-limit headers (`RateLimit-*`) included in responses

---

## Input Validation & Injection Prevention

- Request body size limited to **10 MB** (`express.json({ limit: '10mb' })`)
- All database queries use **parameterized queries** (`$1, $2...`) — no string concatenation in SQL
- DHIS2 UIDs are validated by the DHIS2 API itself (11-character alphanumeric)
- JSON parsing is handled by Express built-in middleware

---

## Data Protection

### Database Security

- PostgreSQL connection uses credentials from environment variables
- Connection pooling via `pg.Pool` with configurable limits
- Warning emitted if `DB_PASSWORD` is unset (dev convenience, not for production)
- Sensitive tables: `users` (hashed passwords), `dhis2_sync_log` (audit trail)

### Environment Variables

All secrets are stored in `.env` (gitignored) and loaded via `dotenv`:

| Variable | Purpose | Required |
|----------|---------|----------|
| `JWT_SECRET` | Token signing key | **Yes** (fatal error if missing) |
| `DB_PASSWORD` | PostgreSQL password | Yes |
| `DHIS2_USERNAME` | DHIS2 API auth | Yes (for sync features) |
| `DHIS2_PASSWORD` | DHIS2 API auth | Yes (for sync features) |
| `SESSION_SECRET` | Express session (if used) | Recommended |

### What We Do NOT Store

- Raw passwords (only bcrypt hashes)
- DHIS2 credentials in the database
- JWT tokens server-side (stateless verification)

---

## Audit & Logging

### Request Logging

- Enabled via `ENABLE_REQUEST_LOGGING=true`
- Logs: HTTP method, path, client IP
- Structured JSON logging via Winston (`server/src/services/logger.js`)
- Module-specific loggers: `auth`, `api`, `database`, `socket`, `scheduler`

### DHIS2 Sync Audit Trail

- Every sync operation is logged in the `dhis2_sync_log` table:
  - Sync type (org units, data elements, data values)
  - Status (RUNNING, SUCCESS, FAILED, SKIPPED)
  - Records processed / failed
  - Error messages
  - Start and completion timestamps
- Accessible via `GET /api/v1/dhis2/sync/history` (admin/moh only)

### User Audit Logs

- Accessible via `GET /api/users/audit/logs` (admin/moh only)

---

## Socket.io Security

- WebSocket connections require JWT authentication (`authenticateSocket` middleware)
- Token extracted from `auth.token` in handshake
- Invalid/missing tokens are rejected with `Authentication error`
- CORS origin enforced on WebSocket connections

---

## Dependency Security

### Current Stack

- **Express 5** with built-in security middleware
- **bcryptjs** for password hashing (pure JS, no native compile issues)
- **jsonwebtoken** for stateless auth tokens
- **helmet** for HTTP security headers
- **express-rate-limit** for DDoS mitigation
- **axios** for outbound HTTP (DHIS2 integration)
- **pg** for PostgreSQL (parameterized queries)

### Recommendations

- Run `npm audit` regularly and patch critical/high vulnerabilities
- Pin dependency versions in production
- Use `npm ci` (not `npm install`) in CI/CD pipelines

---

## Production Hardening Checklist

- [ ] Set strong, unique `JWT_SECRET` (min 32 characters, random)
- [ ] Set strong `DB_PASSWORD`
- [ ] Enable `ENABLE_RATE_LIMITING=true`
- [ ] Set `NODE_ENV=production`
- [ ] Configure `CORS_ORIGIN` to your actual frontend domain
- [ ] Use TLS termination (nginx/Caddy/cloud LB) — never expose HTTP
- [ ] Rotate DHIS2 credentials periodically
- [ ] Enable `ENABLE_REQUEST_LOGGING=true` for audit compliance
- [ ] Restrict PostgreSQL to localhost or VPN only
- [ ] Review and remove any test/seed accounts before go-live
- [ ] Set up monitoring for failed auth attempts and sync errors