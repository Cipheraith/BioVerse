# Environment Variables Documentation

This document provides comprehensive documentation for all environment variables used in the BioVerse server.

## Table of Contents

- [Core Server Configuration](#core-server-configuration)
- [Security & Authentication](#security--authentication)
- [Database Configuration](#database-configuration)
- [AI Services Integration](#ai-services-integration)
- [Logging & Monitoring](#logging--monitoring)
- [Performance & Caching](#performance--caching)
- [External Services](#external-services)

---

## Core Server Configuration

### `PORT`
- **Type**: Number
- **Default**: `3000`
- **Description**: Port number the server will listen on
- **Required**: No
- **Example**: `PORT=3000`

### `NODE_ENV`
- **Type**: String
- **Default**: `development`
- **Options**: `development`, `production`, `test`
- **Description**: Environment mode that affects logging, error handling, and security features
- **Required**: No
- **Example**: `NODE_ENV=production`

### `CORS_ORIGIN`
- **Type**: String
- **Default**: `http://localhost:5173`
- **Description**: Allowed CORS origin(s). Use comma-separated list for multiple origins
- **Required**: No
- **Example**: `CORS_ORIGIN=https://app.bioverse.health,https://staging.bioverse.health`

### `API_RATE_LIMIT`
- **Type**: Number
- **Default**: `100`
- **Description**: Maximum number of requests per 15-minute window per IP
- **Required**: No
- **Example**: `API_RATE_LIMIT=1000`

### `ENABLE_RATE_LIMITING`
- **Type**: Boolean
- **Default**: `true`
- **Description**: Enable/disable API rate limiting
- **Required**: No
- **Example**: `ENABLE_RATE_LIMITING=true`

### `ENABLE_REQUEST_LOGGING`
- **Type**: Boolean
- **Default**: `true`
- **Description**: Enable/disable request logging
- **Required**: No
- **Example**: `ENABLE_REQUEST_LOGGING=true`

---

## Security & Authentication

### `JWT_SECRET`
- **Type**: String
- **Default**: None
- **Description**: Secret key for signing JWT tokens. **CRITICAL: Must be set in production**
- **Required**: **YES** (Server will not start without it)
- **Security**: Use a strong, random string (min 32 characters)
- **Generation**: `openssl rand -base64 32`
- **Example**: `JWT_SECRET=your_secure_random_string_here`

### `JWT_EXPIRY`
- **Type**: String
- **Default**: `1h`
- **Description**: JWT token expiration time (now standardized to 1h for all auth methods)
- **Required**: No
- **Format**: Uses [zeit/ms](https://github.com/vercel/ms) format: `1h`, `30m`, `7d`
- **Example**: `JWT_EXPIRY=1h`
- **Note**: Current implementation uses hardcoded 1h for security

### `GOOGLE_CLIENT_ID`
- **Type**: String
- **Default**: None
- **Description**: Google OAuth 2.0 Client ID for Google Sign-In
- **Required**: No (only if using Google authentication)
- **Example**: `GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com`

### `GOOGLE_CLIENT_SECRET`
- **Type**: String
- **Default**: None
- **Description**: Google OAuth 2.0 Client Secret
- **Required**: No (only if using Google authentication)
- **Security**: Keep this secret and never commit to version control
- **Example**: `GOOGLE_CLIENT_SECRET=your_google_client_secret`

### `GOOGLE_CALLBACK_URL`
- **Type**: String
- **Default**: `http://localhost:3000/auth/google/callback`
- **Description**: Callback URL for Google OAuth
- **Required**: No (only if using Google authentication)
- **Example**: `GOOGLE_CALLBACK_URL=https://api.bioverse.health/auth/google/callback`

---

## Database Configuration

### `DB_HOST`
- **Type**: String
- **Default**: `localhost`
- **Description**: PostgreSQL database host
- **Required**: Yes
- **Example**: `DB_HOST=postgres.bioverse.internal`

### `DB_PORT`
- **Type**: Number
- **Default**: `5432`
- **Description**: PostgreSQL database port
- **Required**: No
- **Example**: `DB_PORT=5432`

### `DB_NAME`
- **Type**: String
- **Default**: `bioverse_zambia_db`
- **Description**: Database name
- **Required**: Yes
- **Example**: `DB_NAME=bioverse_production`

### `DB_USER`
- **Type**: String
- **Default**: `bioverse_admin`
- **Description**: Database username
- **Required**: Yes
- **Example**: `DB_USER=bioverse_admin`

### `DB_PASSWORD`
- **Type**: String
- **Default**: None
- **Description**: Database password
- **Required**: Yes
- **Security**: Use strong password and never commit to version control
- **Example**: `DB_PASSWORD=your_secure_db_password`

---

## AI Services Integration

### `PYTHON_AI_URL`
- **Type**: String
- **Default**: `http://localhost:8000`
- **Description**: URL of the Python AI service
- **Required**: Yes (if using AI features)
- **Example**: `PYTHON_AI_URL=https://ai.bioverse.health`

### `PYTHON_AI_API_KEY`
- **Type**: String
- **Default**: `bioverse-ai-key`
- **Description**: API key for authenticating with Python AI service
- **Required**: Yes (if using AI features in production)
- **Security**: Use a strong, unique key in production
- **Example**: `PYTHON_AI_API_KEY=your_secure_ai_api_key`

### `PYTHON_AI_TIMEOUT`
- **Type**: Number
- **Default**: `30000`
- **Description**: Timeout for AI service requests in milliseconds
- **Required**: No
- **Example**: `PYTHON_AI_TIMEOUT=60000`

### `PYTHON_AI_RETRY_ATTEMPTS`
- **Type**: Number
- **Default**: `3`
- **Description**: Number of retry attempts for failed AI service requests
- **Required**: No
- **Example**: `PYTHON_AI_RETRY_ATTEMPTS=5`

### `OPENAI_API_KEY`
- **Type**: String
- **Default**: None
- **Description**: OpenAI API key (if using OpenAI services directly)
- **Required**: No (optional, for direct OpenAI integration)
- **Security**: Never commit to version control
- **Example**: `OPENAI_API_KEY=sk-...`

### `AI_MODEL_ENDPOINT`
- **Type**: String
- **Default**: `https://api.openai.com/v1/chat/completions`
- **Description**: AI model endpoint URL
- **Required**: No
- **Example**: `AI_MODEL_ENDPOINT=https://api.openai.com/v1/chat/completions`

---

## Logging & Monitoring

### `LOG_LEVEL`
- **Type**: String
- **Default**: `info`
- **Options**: `error`, `warn`, `info`, `debug`
- **Description**: Minimum log level to record
- **Required**: No
- **Production Recommendation**: `warn` or `error`
- **Example**: `LOG_LEVEL=warn`

### `LOG_TO_FILE`
- **Type**: Boolean
- **Default**: `true`
- **Description**: Enable/disable file-based logging
- **Required**: No
- **Example**: `LOG_TO_FILE=true`

---

## Performance & Caching

### `CACHE_TTL`
- **Type**: Number
- **Default**: `300`
- **Description**: Cache time-to-live in seconds
- **Required**: No
- **Example**: `CACHE_TTL=600`

### `ENABLE_MEMORY_CACHE`
- **Type**: Boolean
- **Default**: `true`
- **Description**: Enable/disable in-memory caching
- **Required**: No
- **Example**: `ENABLE_MEMORY_CACHE=true`

### `ENABLE_PERFORMANCE_MONITORING`
- **Type**: Boolean
- **Default**: `true`
- **Description**: Enable/disable performance monitoring
- **Required**: No
- **Example**: `ENABLE_PERFORMANCE_MONITORING=true`

### `GC_THRESHOLD`
- **Type**: Number
- **Default**: `80`
- **Description**: Memory usage percentage threshold for garbage collection warnings
- **Required**: No
- **Example**: `GC_THRESHOLD=85`

---

## External Services

### `EMAIL_SERVICE`
- **Type**: String
- **Default**: `gmail`
- **Description**: Email service provider
- **Required**: No (only if using email notifications)
- **Example**: `EMAIL_SERVICE=gmail`

### `EMAIL_USER`
- **Type**: String
- **Default**: None
- **Description**: Email account username
- **Required**: No (only if using email notifications)
- **Example**: `EMAIL_USER=notifications@bioverse.health`

### `EMAIL_PASSWORD`
- **Type**: String
- **Default**: None
- **Description**: Email account password or app-specific password
- **Required**: No (only if using email notifications)
- **Security**: Use app-specific passwords for Gmail
- **Example**: `EMAIL_PASSWORD=your_app_password`

---

## Environment Setup Guide

### Development Environment

```bash
cp .env.example .env
# Generate a JWT secret
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
# Edit .env and set other required values
```

### Production Environment

**Security Checklist:**
1. ✅ Use strong, randomly generated `JWT_SECRET`
2. ✅ Set `NODE_ENV=production`
3. ✅ Use HTTPS URLs for all external services
4. ✅ Set appropriate `LOG_LEVEL` (warn or error)
5. ✅ Enable rate limiting
6. ✅ Use environment-specific database credentials
7. ✅ Never commit .env files to version control
8. ✅ Use secrets management system (AWS Secrets Manager, HashiCorp Vault, etc.)

### Testing Environment

```bash
# Use test-specific values
NODE_ENV=test
JWT_SECRET=test_jwt_secret_for_ci_only
DB_NAME=bioverse_test_db
LOG_LEVEL=error
```

---

## Best Practices

1. **Never commit .env files** - Use `.env.example` as template
2. **Use strong secrets** - Generate with `openssl rand -base64 32`
3. **Rotate credentials regularly** - Especially `JWT_SECRET` and database passwords
4. **Use environment-specific values** - Different configs for dev/staging/production
5. **Validate required variables** - Server checks for `JWT_SECRET` on startup
6. **Use secrets management** - AWS Secrets Manager, Vault, etc. for production
7. **Document changes** - Update this file when adding new environment variables

---

## Troubleshooting

### Server won't start

**Error**: `FATAL ERROR: JWT_SECRET is not set`
- **Solution**: Set `JWT_SECRET` in your `.env` file
- **Command**: `echo "JWT_SECRET=$(openssl rand -base64 32)" >> server/.env`

### Database connection fails

**Error**: `Connection refused` or `Authentication failed`
- **Solution**: Check `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- **Verify**: Database is running and credentials are correct

### AI service integration fails

**Error**: `AI service unavailable` or `Authentication failed`
- **Solution**: Check `PYTHON_AI_URL` and `PYTHON_AI_API_KEY`
- **Verify**: Python AI service is running and accessible

---

**Last Updated**: January 31, 2026  
**Version**: 1.0  
**Maintained By**: BioVerse DevOps Team
