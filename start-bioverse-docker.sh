#!/bin/bash

# BioVerse Docker Startup Script for Fedora Linux
# Starts the complete BioVerse stack using Docker Compose

echo "🐳 Starting BioVerse with Docker on Fedora..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if Docker is installed and running
echo -e "${BLUE}🐳 Checking Docker installation...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo -e "${YELLOW}💡 Install with: sudo dnf install docker docker-compose${NC}"
    echo -e "${YELLOW}💡 Or use the official Docker installation script${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo -e "${YELLOW}💡 Install with: sudo dnf install docker-compose${NC}"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker daemon is not running${NC}"
    echo -e "${YELLOW}💡 Start with: sudo systemctl start docker${NC}"
    echo -e "${YELLOW}💡 Enable on boot: sudo systemctl enable docker${NC}"
    exit 1
fi

# Check if user is in docker group
if ! groups $USER | grep -q docker; then
    echo -e "${YELLOW}⚠️  User $USER is not in docker group${NC}"
    echo -e "${YELLOW}💡 Add user to docker group: sudo usermod -aG docker $USER${NC}"
    echo -e "${YELLOW}💡 Then logout and login again${NC}"
    echo -e "${YELLOW}🔄 Continuing with sudo for now...${NC}"
    DOCKER_CMD="sudo docker"
    COMPOSE_CMD="sudo docker-compose"
else
    DOCKER_CMD="docker"
    COMPOSE_CMD="docker-compose"
fi

# Use docker compose if available, fallback to docker-compose
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
fi

echo -e "${GREEN}✅ Docker is ready${NC}"

# Create necessary directories
echo -e "${YELLOW}📁 Creating necessary directories...${NC}"
mkdir -p logs python-ai/models python-ai/data

# Check if Ollama is running (for local AI)
echo -e "${PURPLE}🤖 Checking Ollama service...${NC}"
if ! curl -s http://localhost:11434/api/version > /dev/null; then
    echo -e "${YELLOW}⚠️  Ollama is not running locally${NC}"
    echo -e "${YELLOW}💡 Start Ollama: systemctl start ollama${NC}"
    echo -e "${YELLOW}💡 Or install: curl -fsSL https://ollama.ai/install.sh | sh${NC}"
    echo -e "${YELLOW}🔄 Continuing without local AI (will use OpenAI fallback)${NC}"
else
    echo -e "${GREEN}✅ Ollama is running${NC}"
fi

# Stop any existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
$COMPOSE_CMD down --remove-orphans 2>/dev/null || true

# Pull latest images
echo -e "${BLUE}📥 Pulling latest base images...${NC}"
$DOCKER_CMD pull postgres:15-alpine
$DOCKER_CMD pull redis:7-alpine
$DOCKER_CMD pull node:18-alpine
$DOCKER_CMD pull python:3.11-slim

# Build and start services
echo -e "${GREEN}🚀 Building and starting BioVerse services...${NC}"
$COMPOSE_CMD up --build -d

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"

# Function to check service health
check_service_health() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if $COMPOSE_CMD ps $service | grep -q "healthy"; then
            echo -e "${GREEN}✅ $service is healthy${NC}"
            return 0
        elif $COMPOSE_CMD ps $service | grep -q "unhealthy"; then
            echo -e "${RED}❌ $service is unhealthy${NC}"
            return 1
        fi
        
        echo -e "${YELLOW}⏳ Waiting for $service... (attempt $attempt/$max_attempts)${NC}"
        sleep 5
        ((attempt++))
    done
    
    echo -e "${RED}❌ $service health check timeout${NC}"
    return 1
}

# Check each service
echo -e "${BLUE}🔍 Checking service health...${NC}"
check_service_health "postgres"
check_service_health "redis"
check_service_health "python-ai"
check_service_health "node-server"

# Display service status
echo ""
echo -e "${GREEN}🎉 BioVerse Docker Stack Started!${NC}"
echo "=================================="

# Show running containers
echo -e "${YELLOW}📊 Running containers:${NC}"
$COMPOSE_CMD ps

echo ""
echo -e "${YELLOW}🌐 Available services:${NC}"
echo -e "  🐍 Python AI Backend:  http://localhost:8000"
echo -e "  🟢 Node.js API Server: http://localhost:3000"
echo -e "  🗄️  PostgreSQL Database: localhost:5432"
echo -e "  📦 Redis Cache:        localhost:6379"

echo ""
echo -e "${YELLOW}📋 API Endpoints:${NC}"
echo -e "  🔗 API Health:         http://localhost:3000/health"
echo -e "  🤖 AI Health:          http://localhost:8000/health"
echo -e "  📚 AI Documentation:   http://localhost:8000/docs"
echo -e "  🧠 Health Twins API:   http://localhost:3000/api/ai/health-twins"
echo -e "  🔬 ML Analysis API:     http://localhost:3000/api/ai/ml"
echo -e "  📊 Analytics API:       http://localhost:3000/api/ai/analytics"

echo ""
echo -e "${YELLOW}📝 Useful commands:${NC}"
echo -e "  View logs:           $COMPOSE_CMD logs -f"
echo -e "  View specific logs:  $COMPOSE_CMD logs -f python-ai"
echo -e "  Stop services:       $COMPOSE_CMD down"
echo -e "  Restart service:     $COMPOSE_CMD restart python-ai"
echo -e "  Shell into container: $COMPOSE_CMD exec python-ai bash"

# Test API endpoints
echo ""
echo -e "${YELLOW}🧪 Testing API endpoints...${NC}"

# Wait a bit more for services to fully start
sleep 10

# Test Node.js API
if curl -s http://localhost:3000/health > /dev/null; then
    echo -e "${GREEN}✅ Node.js API responding${NC}"
else
    echo -e "${RED}❌ Node.js API not responding${NC}"
    echo -e "${YELLOW}💡 Check logs: $COMPOSE_CMD logs node-server${NC}"
fi

# Test Python AI API
if curl -s http://localhost:8000/health > /dev/null; then
    echo -e "${GREEN}✅ Python AI API responding${NC}"
else
    echo -e "${RED}❌ Python AI API not responding${NC}"
    echo -e "${YELLOW}💡 Check logs: $COMPOSE_CMD logs python-ai${NC}"
fi

# Test AI integration
if curl -s http://localhost:3000/api/ai/health > /dev/null; then
    echo -e "${GREEN}✅ AI integration working${NC}"
else
    echo -e "${YELLOW}⚠️  AI integration may need more time to initialize${NC}"
fi

echo ""
echo -e "${CYAN}🚀 Now start the React client separately:${NC}"
echo -e "${YELLOW}💡 cd client && npm install && npm run dev${NC}"

echo ""
echo -e "${GREEN}🎉 BioVerse Docker backend is ready!${NC}"
echo -e "${CYAN}💡 Frontend will be available at: http://localhost:5173${NC}"

# Show container resource usage
echo ""
echo -e "${YELLOW}📊 Container resource usage:${NC}"
$DOCKER_CMD stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"