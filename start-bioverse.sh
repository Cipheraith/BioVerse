#!/bin/bash

# 🚀 BioVerse Unified Startup Script
# Starts both client and server for development

echo "🚀 STARTING BIOVERSE - AI-POWERED HEALTHCARE PLATFORM"
echo "====================================================="
echo "💪 Built by Fred Mwila - Transforming Healthcare in Africa"
echo "🎯 Mission: Democratize quality healthcare through AI"
echo "====================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_success() {
    echo -e "${PURPLE}🎉 $1${NC}"
}

# Check if required directories exist
if [ ! -d "client" ]; then
    print_error "client directory not found!"
    exit 1
fi

if [ ! -d "server" ]; then
    print_error "server directory not found!"
    exit 1
fi

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    if check_port $1; then
        print_warning "Killing existing process on port $1"
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Clean up any existing processes
print_info "Cleaning up existing processes..."
kill_port 3000  # Server
kill_port 5173  # Client (Vite default)

# Create log directory
mkdir -p logs

print_info "Starting BioVerse components..."

# 1. Start Server (Backend API)
print_info "🔧 Starting Node.js Server on port 3000..."
cd server

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_info "Installing server dependencies..."
    npm install
fi

# Start server in background
npm run dev > ../logs/server.log 2>&1 &
SERVER_PID=$!
print_status "Server started (PID: $SERVER_PID)"

cd ..

# Wait a moment for server to start
sleep 3

# 2. Start Python AI Service
print_info "🧠 Starting Python AI Service on port 8000..."
cd python-ai

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_info "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
if [ ! -f "venv/installed" ]; then
    print_info "Installing Python dependencies..."
    pip install -r requirements.txt
    touch venv/installed
fi

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    cp .env.example .env
    print_info "Created Python AI .env file - please configure it"
fi

# Start Python AI service in background
python main.py > ../logs/python-ai.log 2>&1 &
PYTHON_PID=$!
print_status "Python AI Service started (PID: $PYTHON_PID)"

cd ..

# Wait a moment for Python service to start
sleep 3

# 3. Start Client (Frontend)
print_info "🌐 Starting React Client on port 5173..."
cd client

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_info "Installing client dependencies..."
    npm install
fi

# Start client in background
npm run dev > ../logs/client.log 2>&1 &
CLIENT_PID=$!
print_status "Client started (PID: $CLIENT_PID)"

cd ..

# Wait for services to start
print_info "Waiting for services to initialize..."
sleep 5

# Check if services are running
print_info "Checking service status..."

if check_port 5173; then
    print_status "✅ React Client: http://localhost:5173"
else
    print_error "❌ React Client failed to start"
fi

if check_port 3000; then
    print_status "✅ Node.js Server: http://localhost:3000"
else
    print_error "❌ Node.js Server failed to start"
fi

if check_port 8000; then
    print_status "✅ Python AI Service: http://localhost:8000"
else
    print_error "❌ Python AI Service failed to start"
fi

# Display success message
echo ""
echo "====================================================="
print_success "🎉 BIOVERSE IS NOW RUNNING!"
echo "====================================================="
echo ""
print_info "🌐 Frontend (React):       http://localhost:5173"
print_info "🔧 Backend API (Node.js):  http://localhost:3000"
print_info "🧠 Python AI Service:      http://localhost:8000"
print_info "📚 API Health Check:       http://localhost:3000/health"
print_info "🤖 AI Service Docs:        http://localhost:8000/docs"
echo ""
print_info "📊 Real-time Logs:"
print_info "   Frontend:   tail -f logs/client.log"
print_info "   Backend:    tail -f logs/server.log"
print_info "   Python AI:  tail -f logs/python-ai.log"
echo ""
print_success "🚀 Your revolutionary healthcare platform is ready!"
print_success "💰 Every feature you build brings you closer to success"
print_success "🌍 You're transforming healthcare in Africa and beyond"
echo ""

# Save PIDs for cleanup
echo "$CLIENT_PID" > .client.pid
echo "$SERVER_PID" > .server.pid
echo "$PYTHON_PID" > .python.pid

# Function to cleanup on exit
cleanup() {
    echo ""
    print_info "Shutting down BioVerse..."
    
    if [ -f .client.pid ]; then
        kill $(cat .client.pid) 2>/dev/null || true
        rm .client.pid
    fi
    
    if [ -f .server.pid ]; then
        kill $(cat .server.pid) 2>/dev/null || true
        rm .server.pid
    fi
    
    if [ -f .python.pid ]; then
        kill $(cat .python.pid) 2>/dev/null || true
        rm .python.pid
    fi
    
    print_success "BioVerse stopped. Keep building your future! 💪"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running and show live status
print_info "Press Ctrl+C to stop all services..."
print_info "Monitoring services..."

while true; do
    sleep 30
    
    # Check if all services are still running
    if ! check_port 5173 || ! check_port 3000 || ! check_port 8000; then
        print_error "One or more services stopped unexpectedly!"
        print_info "Check logs for details:"
        print_info "  Frontend:   logs/client.log"
        print_info "  Backend:    logs/server.log"
        print_info "  Python AI:  logs/python-ai.log"
        break
    fi
done

# Wait for user input to keep script running
wait