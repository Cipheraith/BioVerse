# Troubleshooting

## API cannot connect to Postgres
- Ensure `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` are set
- Check container health: `docker ps` and logs for `postgres`
- Verify port 5432 is not blocked or in use

## AI service not available
- Check `docker compose ps` and logs for `python-ai`
- Hit `http://localhost:8000/health` for status
- Disable Ollama temporarily by setting `ENABLE_OLLAMA=false` if model server is down

## CORS errors in frontend
- Set `CORS_ORIGIN` to `http://localhost:5173` in server `.env`
- Restart server

## Swagger not loading
- Ensure server started without errors
- Visit `http://localhost:3000/api/docs`

## Seed data missing
- Run `npm run seed` in `server`
- Confirm `schema.sql` applied (check server logs on start)

## Ports in use
- Kill conflicting processes or change ports
- API: 3000, Web: 5173, AI: 8000, DB: 5432, Redis: 6379

## Docker healthchecks failing
- `docker compose logs <service>`
- Increase `start_period`/`retries` if service cold-starts slowly
