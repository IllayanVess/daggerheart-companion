#!/bin/bash

# Daggerheart Companion - Complete Setup and Launch Script
# For Mac/Linux

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

# Parse arguments
SKIP_SETUP=false
SKIP_RECREATE_DB=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-setup)
            SKIP_SETUP=true
            shift
            ;;
        --skip-recreate-db)
            SKIP_RECREATE_DB=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: ./setup-and-start.sh [--skip-setup] [--skip-recreate-db]"
            exit 1
            ;;
    esac
done

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Daggerheart Companion - Setup & Launch${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Check prerequisites (skip if --skip-setup used)
if [ "$SKIP_SETUP" = false ]; then
    echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"
    
    # Check Python
    if ! command_exists python3; then
        echo -e "${RED}ERROR: Python 3 not found. Install it from https://python.org/downloads${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Python found ($(python3 --version))${NC}"
    
    # Check Node
    if ! command_exists node; then
        echo -e "${RED}ERROR: Node.js not found. Install it from https://nodejs.org${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Node.js found ($(node --version))${NC}"
    
    echo ""
    
    # Step 2: Setup Backend
    echo -e "${YELLOW}Step 2: Setting up backend...${NC}"
    cd "$SCRIPT_DIR/backend"
    
    # Create virtual environment if it doesn't exist
    if [ ! -d ".venv" ]; then
        echo "Creating Python virtual environment..."
        python3 -m venv .venv
    fi
    
    # Activate venv and install requirements
    echo "Installing Python dependencies..."
    source .venv/bin/activate
    pip install -r requirements.txt
    
    echo -e "${GREEN}✓ Backend setup complete${NC}"
    echo ""
    
    # Step 3: Setup Frontend
    echo -e "${YELLOW}Step 3: Setting up frontend...${NC}"
    cd "$SCRIPT_DIR/frontend"
    
    # Create .env.local if it doesn't exist
    if [ ! -f ".env.local" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env.local
            echo -e "${GREEN}Created .env.local from .env.example${NC}"
        else
            # Create .env.local with default configuration
            cat > .env.local << EOF
VITE_API_BASE_URL=http://localhost:8000/api
EOF
            echo -e "${GREEN}Created .env.local with default configuration${NC}"
        fi
    else
        # Verify VITE_API_BASE_URL is set correctly
        if ! grep -q "VITE_API_BASE_URL" .env.local; then
            echo "" >> .env.local
            echo "VITE_API_BASE_URL=http://localhost:8000/api" >> .env.local
            echo -e "${GREEN}Added VITE_API_BASE_URL to .env.local${NC}"
        fi
    fi
    
    # Install npm dependencies
    echo "Installing npm dependencies..."
    npm install
    
    echo -e "${GREEN}✓ Frontend setup complete${NC}"
    echo ""
else
    echo -e "${YELLOW}Skipping setup (--skip-setup flag used)${NC}"
    echo ""
fi

# Step 4: Recreate Database (skip if --skip-recreate-db used)
if [ "$SKIP_RECREATE_DB" = false ]; then
    echo -e "${YELLOW}Step 4: Recreating database...${NC}"
    cd "$SCRIPT_DIR/backend"
    source .venv/bin/activate 2>/dev/null || true
    
    if [ -f "database/recreate_db.py" ]; then
        python database/recreate_db.py
        echo -e "${GREEN}✓ Database recreation complete${NC}"
    else
        echo -e "${YELLOW}Warning: recreate_db.py not found in backend/database/${NC}"
        echo "Running initialize_app_tables() via Python instead..."
        python -c "from db import initialize_app_tables; initialize_app_tables()"
        echo -e "${GREEN}✓ Database initialization complete${NC}"
    fi
    echo ""
else
    echo -e "${YELLOW}Skipping database recreation (--skip-recreate-db flag used)${NC}"
    echo ""
fi

# Step 5: Start services
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Starting Daggerheart Companion${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Kill any existing processes on ports 8000 and 5173
echo "Checking for existing processes..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Open new terminal windows for backend and frontend
echo "Opening new terminal windows..."

# Detect terminal emulator
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    BACKEND_CMD="cd '$SCRIPT_DIR/backend'; source .venv/bin/activate; echo 'Starting backend on http://localhost:8000...'; uvicorn main:app --reload --host 0.0.0.0 --port 8000"
    FRONTEND_CMD="cd '$SCRIPT_DIR/frontend'; echo 'Starting frontend on http://localhost:5173...'; npm run dev"
    
    # Open new Terminal.app windows
    osascript -e "tell application \"Terminal\" to do script \"$BACKEND_CMD\""
    osascript -e "tell application \"Terminal\" to do script \"$FRONTEND_CMD\""
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux - try different terminal emulators
    BACKEND_CMD="cd '$SCRIPT_DIR/backend'; source .venv/bin/activate; uvicorn main:app --reload --host 0.0.0.0 --port 8000"
    FRONTEND_CMD="cd '$SCRIPT_DIR/frontend'; npm run dev"
    
    # Try gnome-terminal
    if command_exists gnome-terminal; then
        gnome-terminal -- bash -c "$BACKEND_CMD; exec bash"
        gnome-terminal -- bash -c "$FRONTEND_CMD; exec bash"
    # Try xterm
    elif command_exists xterm; then
        xterm -e bash -c "$BACKEND_CMD; exec bash" &
        xterm -e bash -c "$FRONTEND_CMD; exec bash" &
    else
        echo -e "${YELLOW}Could not detect terminal emulator. Please start manually:${NC}"
        echo "Backend: cd backend && source .venv/bin/activate && uvicorn main:app --reload --port 8000"
        echo "Frontend: cd frontend && npm run dev"
        exit 0
    fi
else
    echo -e "${YELLOW}Unsupported OS. Please start manually:${NC}"
    echo "Backend: cd backend && source .venv/bin/activate && uvicorn main:app --reload --port 8000"
    echo "Frontend: cd frontend && npm run dev"
    exit 0
fi

echo ""
echo -e "${GREEN}✓ Services started!${NC}"
echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${GREEN}Backend:  http://localhost:8000${NC}"
echo -e "${GREEN}Frontend: http://localhost:5173${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo "API endpoints available at: http://localhost:8000/api"
echo ""
echo "Press Ctrl+C in each terminal window to stop the services"
echo ""
