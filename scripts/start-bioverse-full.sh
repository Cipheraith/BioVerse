#!/bin/bash

# BioVerse Full Stack Startup Script for Fedora Linux
# Starts Node.js server, Python AI backend, and React client

echo "🚀 Starting BioVerse Full Stack Platform on Fedora..."
echo "===================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to check if a port is in use (Fedora compatible)
check_port() {
    local port=$1
    if ss -tuln | grep -q ":$port " ; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port (Fedora compatible)
kill_port() {
    local port=$1
    local pid=$(ss -tulpn | grep ":$port " | awk '{print $7}' | cut -d',' -f2 | cut -d'=' -f2)
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}Killing process on port $port (PID: $pid)${NC}"
        kill -9 $pid 2>/dev/null
        sleep 2
    fi
}

# Check for required dependencies
echo -e "${BLUE}📋 Checking dependencies on Fedora...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo -e "${YELLOW}💡 Install with: sudo dnf install nodejs npm${NC}"
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    echo -e "${YELLOW}💡 Install with: sudo dnf install python3 python3-pip python3-venv${NC}"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    echo -e "${YELLOW}💡 Install with: sudo dnf install npm${NC}"
    exit 1
fi

# Check pip
if ! command -v pip3 &> /dev/null; then
    echo -e "${YELLOW}⚠️  pip3 not found, installing...${NC}"
    sudo dnf install -y python3-pip
fi

# Check if ss command is available (replacement for netstat on modern Linux)
if ! command -v ss &> /dev/null; then
    echo -e "${YELLOW}⚠️  ss command not found, installing iproute2...${NC}"
    sudo dnf install -y iproute2
fi

echo -e "${GREEN}✅ All dependencies found on Fedora${NC}"

# Clean up existing processes
echo -e "${YELLOW}🧹 Cleaning up existing processes...${NC}"
kill_port 3000  # Node.js server
kill_port 8000  # Python AI backend
kill_port 5173  # Vite dev server
kill_port 5174  # Alternative Vite port

# Create logs directory
mkdir -p logs

# Start Python AI Backend
echo -e "${PURPLE}🐍 Starting Python AI Backend...${NC}"
cd python-ai

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}📦 Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo -e "${YELLOW}📦 Installing Python dependencies...${NC}"
pip install -r requirements.txt > ../logs/python-install.log 2>&1

# Start Python AI service in background
echo -e "${PURPLE}🚀 Launching Python AI Service on port 8000...${NC}"
python main.py > ../logs/python-ai.log 2>&1 &
PYTHON_PID=$!

# Wait for Python service to start
echo -e "${YELLOW}⏳ Waiting for Python AI service to initialize...${NC}"
sleep 10

# Check if Python service is running
if check_port 8000; then
    echo -e "${GREEN}✅ Python AI Backend running on http://localhost:8000${NC}"
else
    echo -e "${RED}❌ Failed to start Python AI Backend${NC}"
    echo -e "${YELLOW}Check logs/python-ai.log for details${NC}"
fi

cd ..

# Start Node.js Server
echo -e "${BLUE}🟢 Starting Node.js Server...${NC}"
cd server

# Install Node.js dependencies
echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
npm install > ../logs/server-install.log 2>&1

# Start Node.js server in background
echo -e "${BLUE}🚀 Launching Node.js Server on port 3000...${NC}"
npm start > ../logs/server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
echo -e "${YELLOW}⏳ Waiting for Node.js server to initialize...${NC}"
sleep 8

# Check if server is running
if check_port 3000; then
    echo -e "${GREEN}✅ Node.js Server running on http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Failed to start Node.js Server${NC}"
    echo -e "${YELLOW}Check logs/server.log for details${NC}"
fi

cd ..

# Start React Client
echo -e "${CYAN}⚛️  Starting React Client...${NC}"
cd client

# Install client dependencies
echo -e "${YELLOW}📦 Installing React dependencies...${NC}"
npm install > ../logs/client-install.log 2>&1

# Start React client in background
echo -e "${CYAN}🚀 Launching React Client...${NC}"
npm run dev > ../logs/client.log 2>&1 &
CLIENT_PID=$!

# Wait for client to start
echo -e "${YELLOW}⏳ Waiting for React client to initialize...${NC}"
sleep 8

# Check if client is running
if check_port 5173 || check_port 5174; then
    if check_port 5173; then
        CLIENT_PORT=5173
    else
        CLIENT_PORT=5174
    fi
    echo -e "${GREEN}✅ React Client running on http://localhost:$CLIENT_PORT${NC}"
else
    echo -e "${RED}❌ Failed to start React Client${NC}"
    echo -e "${YELLOW}Check logs/client.log for details${NC}"
fi

cd ..

# Display status
echo ""
echo -e "${GREEN}🎉 BioVerse Full Stack Platform Started Successfully!${NC}"
echo "=============================================="
echo -e "${PURPLE}🐍 Python AI Backend:${NC} http://localhost:8000"
echo -e "${BLUE}🟢 Node.js API Server:${NC} http://localhost:3000"
echo -e "${CYAN}⚛️  React Frontend:${NC} http://localhost:$CLIENT_PORT"
echo ""
echo -e "${YELLOW}📊 Service Status:${NC}"
echo -e "  Python AI: $(check_port 8000 && echo -e "${GREEN}✅ Running${NC}" || echo -e "${RED}❌ Stopped${NC}")"
echo -e "  Node.js:   $(check_port 3000 && echo -e "${GREEN}✅ Running${NC}" || echo -e "${RED}❌ Stopped${NC}")"
echo -e "  React:     $(check_port $CLIENT_PORT && echo -e "${GREEN}✅ Running${NC}" || echo -e "${RED}❌ Stopped${NC}")"
echo ""
echo -e "${YELLOW}📋 Available Endpoints:${NC}"
echo -e "  🏥 Frontend:           http://localhost:$CLIENT_PORT"
echo -e "  🔗 API Health:         http://localhost:3000/health"
echo -e "  🤖 AI Health:          http://localhost:8000/health"
echo -e "  📚 AI Documentation:   http://localhost:8000/docs"
echo -e "  🧠 Health Twins API:   http://localhost:3000/api/ai/health-twins"
echo -e "  🔬 ML Analysis API:     http://localhost:3000/api/ai/ml"
echo -e "  📊 Analytics API:       http://localhost:3000/api/ai/analytics"
echo ""
echo -e "${YELLOW}📝 Log Files:${NC}"
echo -e "  Python AI: logs/python-ai.log"
echo -e "  Node.js:   logs/server.log"
echo -e "  React:     logs/client.log"
echo ""
echo -e "${CYAN}🛑 To stop all services, run:${NC} ./stop-bioverse.sh"
echo -e "${CYAN}📊 To monitor logs, run:${NC} tail -f logs/*.log"
echo ""

# Test API connections
echo -e "${YELLOW}🧪 Testing API connections...${NC}"

# Test Node.js server
if curl -s http://localhost:3000/health > /dev/null; then
    echo -e "${GREEN}✅ Node.js API responding${NC}"
else
    echo -e "${RED}❌ Node.js API not responding${NC}"
fi

# Test Python AI backend
if curl -s http://localhost:8000/health > /dev/null; then
    echo -e "${GREEN}✅ Python AI API responding${NC}"
else
    echo -e "${RED}❌ Python AI API not responding${NC}"
fi

# Test AI integration
if curl -s http://localhost:3000/api/ai/health > /dev/null; then
    echo -e "${GREEN}✅ AI integration working${NC}"
else
    echo -e "${YELLOW}⚠️  AI integration may need time to initialize${NC}"
fi

echo ""
echo -e "${GREEN}🚀 BioVerse is ready for development and testing!${NC}"
echo -e "${CYAN}💡 Open http://localhost:$CLIENT_PORT in your browser to get started${NC}"

# Keep script running and show process IDs
echo ""
echo -e "${YELLOW}📋 Process IDs:${NC}"
echo -e "  Python AI: $PYTHON_PID"
echo -e "  Node.js:   $SERVER_PID"
echo -e "  React:     $CLIENT_PID"
echo ""
echo -e "${CYAN}Press Ctrl+C to stop all services${NC}"

# Wait for user interrupt
trap 'echo -e "\n${YELLOW}🛑 Stopping all services...${NC}"; kill $PYTHON_PID $SERVER_PID $CLIENT_PID 2>/dev/null; exit 0' INT

# Keep script alive
while true; do
    sleep 1
done