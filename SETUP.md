# BioVerse Setup Guide

Complete guide for setting up the BioVerse AI-Powered Predictive Health Twin Network for local development.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js**: v20.x or higher ([Download](https://nodejs.org/))
- **npm**: v10.x or higher (comes with Node.js)
- **Docker**: v24.x or higher ([Download](https://www.docker.com/get-started))
- **Docker Compose**: v2.x or higher (comes with Docker Desktop)
- **Python**: v3.11 ([Download](https://www.python.org/downloads/))
- **Git**: v2.x or higher ([Download](https://git-scm.com/))

### Recommended Software
- **PostgreSQL Client**: For database management (optional, Docker provides postgres)
- **Postman** or **Insomnia**: For API testing
- **VS Code**: With extensions for JavaScript, TypeScript, Python, Docker

### System Requirements
- **RAM**: 8GB minimum, 16GB recommended
- **Disk Space**: 10GB free space
- **OS**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)

---

## Quick Start

For those who want to get up and running quickly:

```bash
# 1. Clone the repository
git clone https://github.com/Cipheraith/BioVerse.git
cd BioVerse

# 2. Install all dependencies
npm run install:all

# 3. Start Docker services (PostgreSQL, Redis, etc.)
docker compose -f docker-compose.dev.yml up -d

# 4. Copy environment files
cp server/.env.example server/.env
cp client/.env.development client/.env
cp python-ai/.env.example python-ai/.env

# 5. Configure JWT secret (IMPORTANT!)
# Edit server/.env and set a strong JWT_SECRET
echo "JWT_SECRET=$(openssl rand -base64 32)" >> server/.env

# 6. Start the application
npm run dev

# 7. Access the application
# Client: http://localhost:5173
# Server API: http://localhost:3000
# Python AI API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

## Detailed Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/Cipheraith/BioVerse.git
cd BioVerse
```

### Step 2: Install Dependencies

#### Root Dependencies
```bash
npm install
```

#### Client Dependencies (React + Vite + TypeScript)
```bash
cd client
npm install
cd ..
```

#### Server Dependencies (Node.js + Express)
```bash
cd server
npm install
cd ..
```

#### Python AI Dependencies
```bash
cd python-ai
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

**Or use the convenience script:**
```bash
npm run install:all
```

### Step 3: Set Up Docker Services

BioVerse requires PostgreSQL and Redis. Start them with Docker:

```bash
docker compose -f docker-compose.dev.yml up -d postgres redis
```

Verify services are running:
```bash
docker compose -f docker-compose.dev.yml ps
```

You should see:
- `postgres` - Running on port 5432
- `redis` - Running on port 6379

### Step 4: Configure Environment Variables

#### Server Configuration

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
# Database Configuration
PGHOST=localhost
PGPORT=5432
PGUSER=bioverse_user
PGPASSWORD=your_secure_password_here
PGDATABASE=bioverse_db

# Authentication (CRITICAL - Must be set!)
JWT_SECRET=your_generated_secret_here  # Use: openssl rand -base64 32
GOOGLE_CLIENT_ID=your_google_client_id  # Optional

# Server Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# API Configuration
API_RATE_LIMIT=1000
ENABLE_RATE_LIMITING=true
ENABLE_REQUEST_LOGGING=true

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

**Generate a secure JWT secret:**
```bash
openssl rand -base64 32
```

#### Client Configuration

```bash
cp client/.env.development client/.env
```

Edit `client/.env`:
```env
VITE_API_URL=http://localhost:3000
VITE_PYTHON_AI_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Python AI Configuration

```bash
cp python-ai/.env.example python-ai/.env
```

Edit `python-ai/.env`:
```env
# Environment
ENVIRONMENT=development

# API Configuration
NODE_SERVER_API_KEY=your_api_key_here  # Generate a secure key
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Database
DATABASE_URL=postgresql://bioverse_user:your_password@localhost:5432/bioverse_db

# AI/ML Configuration
MODEL_CACHE_DIR=./models
OLLAMA_BASE_URL=http://localhost:11434  # If using Ollama
```

### Step 5: Initialize the Database

```bash
cd server
npm run migrate  # Run database migrations
npm run seed     # (Optional) Seed with test data
cd ..
```

### Step 6: Verify Installation

Check that everything is installed correctly:

```bash
# Check Node.js version
node --version  # Should be v20.x or higher

# Check Python version
python --version  # Should be 3.11

# Check Docker
docker --version
docker compose version

# Check database connection
docker compose -f docker-compose.dev.yml exec postgres psql -U bioverse_user -d bioverse_db -c "SELECT version();"
```

---

## Running the Application

### Option 1: Run Everything Together (Recommended)

```bash
npm run dev
```

This starts:
- Client (Vite dev server) on port 5173
- Server (Node.js/Express) on port 3000
- Python AI service on port 8000

### Option 2: Run Services Individually

#### Terminal 1 - Client
```bash
cd client
npm run dev
```

#### Terminal 2 - Server
```bash
cd server
npm run dev
```

#### Terminal 3 - Python AI Service
```bash
cd python-ai
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

### Access the Application

Once running, access:
- **Client UI**: http://localhost:5173
- **Server API**: http://localhost:3000
- **Server Health**: http://localhost:3000/health
- **Python AI API**: http://localhost:8000
- **Python AI Docs**: http://localhost:8000/docs (Interactive Swagger UI)
- **Python AI ReDoc**: http://localhost:8000/redoc

---

## Testing

### Run All Tests

```bash
npm test
```

### Run Specific Test Suites

#### Server Tests
```bash
cd server
npm test                 # Run all tests
npm run test:watch       # Run in watch mode
npm run test:coverage    # Run with coverage report
```

#### Client Tests
```bash
cd client
npm test
```

#### Python AI Tests
```bash
cd python-ai
source venv/bin/activate
pytest
pytest -v                # Verbose output
pytest --cov             # With coverage
```

### Linting

#### Lint All
```bash
npm run lint
```

#### Lint Specific Services
```bash
cd client && npm run lint
cd server && npm run lint
cd python-ai && black . && flake8 .
```

---

## Configuration

### Database Configuration

#### Access PostgreSQL directly
```bash
docker compose -f docker-compose.dev.yml exec postgres psql -U bioverse_user -d bioverse_db
```

#### Reset Database
```bash
cd server
npm run migrate:reset  # Drop and recreate database
npm run seed           # Reseed with test data
```

### Redis Configuration

#### Access Redis CLI
```bash
docker compose -f docker-compose.dev.yml exec redis redis-cli
```

#### Clear Redis cache
```bash
docker compose -f docker-compose.dev.yml exec redis redis-cli FLUSHALL
```

### Environment-Specific Configuration

#### Development
- Use `.env.development` files
- Debug mode enabled
- Hot reloading enabled
- CORS allows localhost

#### Production
- Use `.env.production` files
- Debug mode disabled
- Optimized builds
- Restricted CORS

---

## Troubleshooting

### Common Issues

#### Issue: "JWT_SECRET is not set"
**Solution**: 
```bash
# Generate a secret and add to server/.env
echo "JWT_SECRET=$(openssl rand -base64 32)" >> server/.env
```

#### Issue: "Cannot connect to PostgreSQL"
**Solution**:
```bash
# Check if PostgreSQL is running
docker compose -f docker-compose.dev.yml ps

# Restart PostgreSQL
docker compose -f docker-compose.dev.yml restart postgres

# Check logs
docker compose -f docker-compose.dev.yml logs postgres
```

#### Issue: "Port already in use"
**Solution**:
```bash
# Find process using port 3000
lsof -i :3000  # On macOS/Linux
netstat -ano | findstr :3000  # On Windows

# Kill the process or change the port in .env
PORT=3001
```

#### Issue: "Python module not found"
**Solution**:
```bash
# Ensure virtual environment is activated
cd python-ai
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt
```

#### Issue: "Docker services won't start"
**Solution**:
```bash
# Stop all services
docker compose -f docker-compose.dev.yml down

# Remove volumes and restart
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d
```

#### Issue: "npm install fails"
**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use the reset script
npm run reset
```

### Debugging

#### Enable Debug Logging

**Server:**
```env
# In server/.env
NODE_ENV=development
ENABLE_REQUEST_LOGGING=true
LOG_LEVEL=debug
```

**Python AI:**
```env
# In python-ai/.env
LOG_LEVEL=DEBUG
```

#### View Logs

```bash
# Server logs
npm run logs:server

# Client logs
npm run logs:client

# All logs
npm run logs:all

# Docker logs
docker compose -f docker-compose.dev.yml logs -f
```

### Performance Issues

#### Issue: Slow build times
**Solution**:
```bash
# Client: Clear Vite cache
cd client
rm -rf node_modules/.vite
npm run dev

# Server: Disable source maps in development
NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

#### Issue: High memory usage
**Solution**:
```bash
# Increase Node.js memory limit
cd server
npm run start:optimized  # Uses --max-old-space-size=1024
```

---

## Development Workflow

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow existing code style
   - Add tests for new features
   - Update documentation

3. **Test your changes**
   ```bash
   npm run lint
   npm test
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Go to GitHub
   - Create PR from your branch
   - Wait for CI checks to pass

### Code Style

- **JavaScript/TypeScript**: Follow ESLint configuration
- **Python**: Follow PEP 8, use Black for formatting
- **Imports**: Sort with isort (Python) or organized imports (JS/TS)
- **Comments**: Use JSDoc for JavaScript, docstrings for Python

---

## Additional Resources

### Documentation
- [API Documentation](http://localhost:8000/docs) - When Python AI is running
- [Architecture Overview](./docs/architecture.md)
- [Security Policy](./SECURITY.md)
- [Contributing Guide](./CONTRIBUTING.md)

### External Links
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Support
- **Issues**: https://github.com/Cipheraith/BioVerse/issues
- **Discussions**: https://github.com/Cipheraith/BioVerse/discussions
- **Email**: support@bioverse.com

---

## Next Steps

After setup:
1. ✅ Explore the client at http://localhost:5173
2. ✅ Test the API at http://localhost:8000/docs
3. ✅ Read the [Contributing Guide](./CONTRIBUTING.md)
4. ✅ Join our community discussions
5. ✅ Start building your first health twin!

---

**Last Updated**: January 2026  
**Version**: 1.0  
**Maintained By**: BioVerse Development Team
