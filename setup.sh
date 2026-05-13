#!/bin/bash

# Daggerheart Companion - Setup Script (Run once after cloning)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get the script's directory (root of the project)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Daggerheart Companion - Setup${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}ERROR: Python 3 not found. Install it from https://python.org/downloads${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python found ($(python3 --version))${NC}"

# Check Node
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js not found. Install it from https://nodejs.org${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found ($(node --version))${NC}"

echo ""

# Setup Backend
echo -e "${YELLOW}Step 2: Setting up backend...${NC}"
cd "$SCRIPT_DIR/backend"

if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
fi

echo "Installing Python dependencies..."
source .venv/bin/activate
pip install -r requirements.txt

echo -e "${GREEN}✓ Backend setup complete${NC}"
echo ""

# Setup Frontend
echo -e "${YELLOW}Step 3: Setting up frontend...${NC}"
cd "$SCRIPT_DIR/frontend"

# Always create .env.local with the correct URL
echo "Creating .env.local with correct API URL..."
cat > .env.local << EOF
VITE_API_BASE_URL=http://localhost:8000/api
EOF
echo -e "${GREEN}✓ Created .env.local with VITE_API_BASE_URL=http://localhost:8000/api${NC}"

echo "Installing npm dependencies..."
npm install

echo -e "${GREEN}✓ Frontend setup complete${NC}"
echo ""

echo -e "${CYAN}========================================${NC}"
echo -e "${GREEN}Setup complete!${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo "You can now run ./launch.sh to start the app"
echo ""
