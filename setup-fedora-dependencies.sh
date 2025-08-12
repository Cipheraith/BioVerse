#!/bin/bash

# BioVerse Fedora Dependencies Setup Script
# Installs all required dependencies for BioVerse on Fedora Linux

echo "🐧 Setting up BioVerse dependencies on Fedora Linux..."
echo "====================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}❌ Please don't run this script as root${NC}"
    echo -e "${YELLOW}💡 Run as regular user, sudo will be used when needed${NC}"
    exit 1
fi

# Update system packages
echo -e "${BLUE}📦 Updating Fedora packages...${NC}"
sudo dnf update -y

# Install Node.js and npm
echo -e "${BLUE}🟢 Installing Node.js and npm...${NC}"
if ! command -v node &> /dev/null; then
    sudo dnf install -y nodejs npm
    echo -e "${GREEN}✅ Node.js and npm installed${NC}"
else
    echo -e "${GREEN}✅ Node.js already installed: $(node --version)${NC}"
fi

# Install Python 3 and pip
echo -e "${PURPLE}🐍 Installing Python 3 and pip...${NC}"
if ! command -v python3 &> /dev/null; then
    sudo dnf install -y python3 python3-pip python3-venv python3-devel
    echo -e "${GREEN}✅ Python 3 and pip installed${NC}"
else
    echo -e "${GREEN}✅ Python 3 already installed: $(python3 --version)${NC}"
fi

# Install development tools
echo -e "${YELLOW}🔧 Installing development tools...${NC}"
sudo dnf groupinstall -y "Development Tools"
sudo dnf install -y gcc gcc-c++ make cmake git curl wget

# Install PostgreSQL (for database)
echo -e "${BLUE}🗄️  Installing PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
    sudo dnf install -y postgresql postgresql-server postgresql-contrib postgresql-devel
    
    # Initialize PostgreSQL database
    sudo postgresql-setup --initdb
    
    # Enable and start PostgreSQL service
    sudo systemctl enable postgresql
    sudo systemctl start postgresql
    
    echo -e "${GREEN}✅ PostgreSQL installed and started${NC}"
else
    echo -e "${GREEN}✅ PostgreSQL already installed${NC}"
fi

# Install system utilities
echo -e "${CYAN}🛠️  Installing system utilities...${NC}"
sudo dnf install -y iproute2 net-tools lsof htop tree jq

# Install Python system dependencies for AI/ML
echo -e "${PURPLE}🧠 Installing Python AI/ML system dependencies...${NC}"
sudo dnf install -y \
    python3-numpy \
    python3-scipy \
    python3-matplotlib \
    python3-pandas \
    python3-scikit-learn \
    python3-opencv \
    python3-pillow \
    blas-devel \
    lapack-devel \
    atlas-devel \
    openblas-devel \
    hdf5-devel \
    libffi-devel \
    openssl-devel \
    sqlite-devel

# Install Ollama (for local AI)
echo -e "${CYAN}🤖 Installing Ollama for local AI...${NC}"
if ! command -v ollama &> /dev/null; then
    curl -fsSL https://ollama.ai/install.sh | sh
    
    # Start Ollama service
    sudo systemctl enable ollama
    sudo systemctl start ollama
    
    echo -e "${GREEN}✅ Ollama installed and started${NC}"
    
    # Pull the required model
    echo -e "${YELLOW}📥 Pulling DeepSeek R1 model (this may take a while)...${NC}"
    ollama pull deepseek-r1:1.5b
    
    echo -e "${GREEN}✅ DeepSeek R1 model downloaded${NC}"
else
    echo -e "${GREEN}✅ Ollama already installed${NC}"
fi

# Install Redis (for caching)
echo -e "${RED}📦 Installing Redis for caching...${NC}"
if ! command -v redis-server &> /dev/null; then
    sudo dnf install -y redis
    
    # Enable and start Redis service
    sudo systemctl enable redis
    sudo systemctl start redis
    
    echo -e "${GREEN}✅ Redis installed and started${NC}"
else
    echo -e "${GREEN}✅ Redis already installed${NC}"
fi

# Setup PostgreSQL database for BioVerse
echo -e "${BLUE}🗄️  Setting up BioVerse database...${NC}"
sudo -u postgres psql -c "CREATE USER bioverse_admin WITH PASSWORD '2002Fred??';" 2>/dev/null || echo "User already exists"
sudo -u postgres psql -c "CREATE DATABASE bioverse_zambia_db OWNER bioverse_admin;" 2>/dev/null || echo "Database already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE bioverse_zambia_db TO bioverse_admin;" 2>/dev/null

echo -e "${GREEN}✅ BioVerse database setup complete${NC}"

# Install global npm packages
echo -e "${YELLOW}📦 Installing global npm packages...${NC}"
npm install -g typescript ts-node nodemon concurrently

# Create Python virtual environment for the project
echo -e "${PURPLE}🐍 Setting up Python virtual environment...${NC}"
cd python-ai
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✅ Python virtual environment created${NC}"
else
    echo -e "${GREEN}✅ Python virtual environment already exists${NC}"
fi

# Activate virtual environment and install Python dependencies
source venv/bin/activate
echo -e "${YELLOW}📦 Installing Python AI dependencies...${NC}"
pip install --upgrade pip
pip install -r requirements.txt

echo -e "${GREEN}✅ Python dependencies installed${NC}"
deactivate
cd ..

# Install Node.js dependencies
echo -e "${YELLOW}📦 Installing Node.js server dependencies...${NC}"
cd server
npm install
echo -e "${GREEN}✅ Server dependencies installed${NC}"
cd ..

echo -e "${CYAN}📦 Installing React client dependencies...${NC}"
cd client
npm install
echo -e "${GREEN}✅ Client dependencies installed${NC}"
cd ..

# Set up firewall rules (if firewalld is active)
if systemctl is-active --quiet firewalld; then
    echo -e "${YELLOW}🔥 Configuring firewall rules...${NC}"
    sudo firewall-cmd --permanent --add-port=3000/tcp  # Node.js server
    sudo firewall-cmd --permanent --add-port=8000/tcp  # Python AI backend
    sudo firewall-cmd --permanent --add-port=5173/tcp  # React dev server
    sudo firewall-cmd --permanent --add-port=5174/tcp  # React dev server alt
    sudo firewall-cmd --permanent --add-port=11434/tcp # Ollama
    sudo firewall-cmd --reload
    echo -e "${GREEN}✅ Firewall rules configured${NC}"
fi

# Display system information
echo ""
echo -e "${GREEN}🎉 BioVerse Fedora setup complete!${NC}"
echo "============================================"
echo -e "${YELLOW}📋 Installed versions:${NC}"
echo -e "  Node.js: $(node --version)"
echo -e "  npm: $(npm --version)"
echo -e "  Python: $(python3 --version)"
echo -e "  pip: $(pip3 --version)"
echo -e "  PostgreSQL: $(psql --version | head -1)"
echo -e "  Redis: $(redis-server --version)"
if command -v ollama &> /dev/null; then
    echo -e "  Ollama: $(ollama --version)"
fi

echo ""
echo -e "${YELLOW}🔧 Services status:${NC}"
echo -e "  PostgreSQL: $(systemctl is-active postgresql)"
echo -e "  Redis: $(systemctl is-active redis)"
if systemctl list-units --type=service | grep -q ollama; then
    echo -e "  Ollama: $(systemctl is-active ollama)"
fi

echo ""
echo -e "${CYAN}🚀 Ready to start BioVerse!${NC}"
echo -e "${YELLOW}💡 Run: ./start-bioverse-full.sh${NC}"
echo ""
echo -e "${BLUE}📚 Useful commands:${NC}"
echo -e "  Check services: sudo systemctl status postgresql redis ollama"
echo -e "  View logs: journalctl -u postgresql -f"
echo -e "  Database access: sudo -u postgres psql bioverse_zambia_db"
echo -e "  Ollama models: ollama list"
echo ""