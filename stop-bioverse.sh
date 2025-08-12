#!/bin/bash

# BioVerse Full Stack Stop Script
# Stops all BioVerse services

echo "🛑 Stopping BioVerse Full Stack Platform..."
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to kill process on port (Fedora compatible)
kill_port() {
    local port=$1
    local service_name=$2
    local pid=$(ss -tulpn | grep ":$port " | awk '{print $7}' | cut -d',' -f2 | cut -d'=' -f2 | head -1)
    
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}🔄 Stopping $service_name (PID: $pid, Port: $port)${NC}"
        kill -9 $pid 2>/dev/null
        sleep 2
        
        # Verify process is killed
        if ! ss -tuln | grep -q ":$port " ; then
            echo -e "${GREEN}✅ $service_name stopped successfully${NC}"
        else
            echo -e "${RED}❌ Failed to stop $service_name${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  $service_name not running on port $port${NC}"
    fi
}

# Stop all services
echo -e "${YELLOW}🧹 Cleaning up all BioVerse processes...${NC}"

# Stop React Client (Vite dev server)
kill_port 5173 "React Client"
kill_port 5174 "React Client (Alt Port)"

# Stop Node.js Server
kill_port 3000 "Node.js Server"

# Stop Python AI Backend
kill_port 8000 "Python AI Backend"

# Kill any remaining node processes related to BioVerse
echo -e "${YELLOW}🔄 Cleaning up remaining Node.js processes...${NC}"
pkill -f "vite"
pkill -f "node.*bioverse"
pkill -f "npm.*dev"
pkill -f "npm.*start"

# Kill any remaining Python processes
echo -e "${YELLOW}🔄 Cleaning up remaining Python processes...${NC}"
pkill -f "python.*main.py"
pkill -f "uvicorn"

# Clean up log files if they exist
if [ -d "logs" ]; then
    echo -e "${YELLOW}📝 Archiving log files...${NC}"
    timestamp=$(date +"%Y%m%d_%H%M%S")
    mkdir -p logs/archive
    if [ -f "logs/python-ai.log" ]; then
        mv logs/python-ai.log logs/archive/python-ai_$timestamp.log
    fi
    if [ -f "logs/server.log" ]; then
        mv logs/server.log logs/archive/server_$timestamp.log
    fi
    if [ -f "logs/client.log" ]; then
        mv logs/client.log logs/archive/client_$timestamp.log
    fi
    echo -e "${GREEN}✅ Log files archived${NC}"
fi

# Final verification (Fedora compatible)
echo ""
echo -e "${YELLOW}🔍 Verifying all services are stopped...${NC}"

services_stopped=true

if ss -tuln | grep -q ":3000 " ; then
    echo -e "${RED}❌ Node.js Server still running on port 3000${NC}"
    services_stopped=false
fi

if ss -tuln | grep -q ":8000 " ; then
    echo -e "${RED}❌ Python AI Backend still running on port 8000${NC}"
    services_stopped=false
fi

if ss -tuln | grep -q ":5173 " ; then
    echo -e "${RED}❌ React Client still running on port 5173${NC}"
    services_stopped=false
fi

if ss -tuln | grep -q ":5174 " ; then
    echo -e "${RED}❌ React Client still running on port 5174${NC}"
    services_stopped=false
fi

if [ "$services_stopped" = true ]; then
    echo -e "${GREEN}✅ All BioVerse services stopped successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Some services may still be running. You may need to restart your terminal.${NC}"
fi

echo ""
echo -e "${GREEN}🎉 BioVerse Full Stack Platform Stopped${NC}"
echo "============================================"
echo -e "${CYAN}💡 To start BioVerse again, run: ./start-bioverse-full.sh${NC}"
echo ""