#!/bin/bash

# BioVerse Docker Stop Script for Fedora Linux
# Stops all BioVerse Docker containers and cleans up

echo "🐳 Stopping BioVerse Docker Stack..."
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if user is in docker group
if ! groups $USER | grep -q docker; then
    echo -e "${YELLOW}⚠️  User $USER is not in docker group, using sudo${NC}"
    COMPOSE_CMD="sudo docker-compose"
    DOCKER_CMD="sudo docker"
else
    COMPOSE_CMD="docker-compose"
    DOCKER_CMD="docker"
fi

# Use docker compose if available
if docker compose version &> /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
fi

# Stop and remove containers
echo -e "${YELLOW}🛑 Stopping BioVerse containers...${NC}"
$COMPOSE_CMD down --remove-orphans

# Show stopped containers
echo -e "${BLUE}📊 Container status:${NC}"
$COMPOSE_CMD ps -a

# Optional cleanup
echo ""
read -p "🗑️  Do you want to remove volumes (this will delete database data)? [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🗑️  Removing volumes...${NC}"
    $COMPOSE_CMD down -v
    echo -e "${GREEN}✅ Volumes removed${NC}"
fi

echo ""
read -p "🧹 Do you want to remove unused Docker images? [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🧹 Cleaning up unused Docker images...${NC}"
    $DOCKER_CMD image prune -f
    echo -e "${GREEN}✅ Unused images removed${NC}"
fi

echo ""
read -p "🔥 Do you want to remove BioVerse images for rebuild? [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🔥 Removing BioVerse images...${NC}"
    $DOCKER_CMD rmi bioverse-python-ai bioverse-node-server 2>/dev/null || true
    echo -e "${GREEN}✅ BioVerse images removed${NC}"
fi

# Show final Docker status
echo ""
echo -e "${BLUE}📊 Final Docker status:${NC}"
echo -e "${YELLOW}Running containers:${NC}"
$DOCKER_CMD ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo -e "${YELLOW}Docker images:${NC}"
$DOCKER_CMD images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

echo ""
echo -e "${GREEN}🎉 BioVerse Docker stack stopped${NC}"
echo -e "${CYAN}💡 To start again: ./start-bioverse-docker.sh${NC}"
echo ""