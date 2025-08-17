# Local Docker Development

This repository includes Dockerfiles for the `server` and `client`, plus a `docker-compose.dev.yml` to bring up Postgres, Redis, the server, and the client for local development.

Quick start

```bash
# from repo root
docker compose -f docker-compose.dev.yml up --build
```

Services
- postgres: Postgres 15 (db)
- redis: Redis 7 (cache/queue)
- server: Node.js backend (mounted to allow code edits)
- client: Vite web client served via Nginx (development build served)

Environment variables
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` are set in `docker-compose.dev.yml` for local dev.

Security notes
- This compose file is for local development only. Do not use in production.
- Ensure secrets are stored in a proper secrets manager for production.

## Security note about .env

If you have a `server/.env` in the repository with real secrets, remove it from the repository history and replace it with `server/.env.example` before sharing the repo. The `server/.env` file should never contain production secrets. Use a secrets manager (Vault, cloud KMS) in production.

To start locally, copy the example and fill values:

```bash
cp server/.env.example server/.env
# Edit server/.env and fill secrets
```

