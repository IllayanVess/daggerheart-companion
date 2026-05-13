#!/bin/bash

# Daggerheart Companion - Launch Script (Opens backend and frontend terminals)

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
echo -e "${CYAN}Daggerheart Companion - Launch${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Check if setup has been run
if [ ! -d "$SCRIPT_DIR/backend/.venv" ]; then
    echo -e "${RED}ERROR: Backend virtual environment not found!${NC}"
    echo "Please run ./setup.sh first."
    exit 1
fi

if [ ! -d "$SCRIPT_DIR/frontend/node_modules" ]; then
    echo -e "${RED}ERROR: Frontend dependencies not found!${NC}"
    echo "Please run ./setup.sh first."
    exit 1
fi

# Verify .env.local has the correct URL
cd "$SCRIPT_DIR/frontend"
if [ -f ".env.local" ]; then
    if ! grep -q "VITE_API_BASE_URL=http://localhost:8000/api" .env.local; then
        echo -e "${YELLOW}WARNING: .env.local has incorrect API URL! Fixing...${NC}"
        cat > .env.local << EOF
VITE_API_BASE_URL=http://localhost:8000/api
EOF
        echo -e "${GREEN}✓ Fixed .env.local${NC}"
    fi
else
    echo -e "${YELLOW}Creating .env.local...${NC}"
    cat > .env.local << EOF
VITE_API_BASE_URL=http://localhost:8000/api
EOF
    echo -e "${GREEN}✓ Created .env.local${NC}"
fi

# Option to recreate database
RECREATE_DB=false
if [ "$1" == "--recreate-db" ]; then
    RECREATE_DB=true
fi

if [ "$RECREATE_DB" == true ]; then
    echo ""
    echo -e "${YELLOW}WARNING: Recreating database will wipe all existing data!${NC}"
    echo ""
    read -p "Type YES to continue: " confirm
    if [ "$confirm" != "YES" ]; then
        echo "Database recreation cancelled."
        RECREATE_DB=false
    else
        echo "Recreating database..."
        cd "$SCRIPT_DIR/backend"
        source .venv/bin/activate 2>/dev/null || true
        if [ -f "database/recreate_db.py" ]; then
            python database/recreate_db.py
            echo -e "${GREEN}✓ Database recreation complete${NC}"
        else
            echo -e "${YELLOW}WARNING: database/recreate_db.py not found${NC}"
            python -c "from db import initialize_app_tables; initialize_app_tables()"
            echo -e "${GREEN}✓ Database initialization complete${NC}"
        fi
        echo ""
    fi
fi

# Kill any existing processes on ports 8000 and 5173
echo "Checking for existing processes..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

echo ""
echo "Opening terminals..."

# Detect OS and open appropriate terminal
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - Open Terminal.app windows
    
    # Backend terminal
    osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR/backend' && source .venv/bin/activate && echo '========================================' && echo 'Daggerheart Backend Server' && echo '========================================' && echo '' && echo 'Starting backend on http://localhost:8000' && echo 'API: http://localhost:8000/api' && echo '' && echo 'Press Ctrl+C to stop the server' && echo '========================================' && echo '' && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000\""
    
    # Small delay
    sleep 2
    
    # Frontend terminal
    osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR/frontend' && echo '========================================' && echo 'Daggerheart Frontend Server' && echo '========================================' && echo '' && echo 'Starting frontend on http://localhost:5173' && echo '' && echo 'Press Ctrl+C to stop the server' && echo '========================================' && echo '' && npm run dev\""
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux - try different terminal emulators
    
    BACKEND_CMD="cd '$SCRIPT_DIR/backend' && source .venv/bin/activate && echo '========================================' && echo 'Daggerheart Backend Server' && echo '========================================' && echo '' && echo 'Starting backend on http://localhost:8000' && echo 'API: http://localhost:8000/api' && echo '' && echo 'Press Ctrl+C to stop the server' && echo '========================================' && echo '' && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
    
    FRONTEND_CMD="cd '$SCRIPT_DIR/frontend' && echo '========================================' && echo 'Daggerheart Frontend Server' && echo '========================================' && echo '' && echo 'Starting frontend on http://localhost:5173' && echo '' && echo 'Press Ctrl+C to stop the server' && echo '========================================' && echo '' && npm run dev"
    
    # Try gnome-terminal
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "$BACKEND_CMD; exec bash"
        sleep 2
        gnome-terminal -- bash -c "$FRONTEND_CMD; exec bash"
    # Try xterm
    elif command -v xterm &> /dev/null; then
        xterm -e bash -c "$BACKEND_CMD; exec bash" &
        sleep 2
        xterm -e bash -c "$FRONTEND_CMD; exec bash" &
    else
        echo -e "${YELLOW}Could not detect terminal emulator. Please start manually:${NC}"
        echo ""
        echo "Backend:"
        echo "  cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000"
        echo ""
        echo "Frontend:"
        echo "  cd frontend && npm run dev"
        exit 0
    fi
else
    echo -e "${YELLOW}Unsupported OS. Please start manually:${NC}"
    echo ""
    echo "Backend:"
    echo "  cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000"
    echo ""
    echo "Frontend:"
    echo "  cd frontend && npm run dev"
    exit 0
fi

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${GREEN}Daggerheart Companion is starting!${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo -e "${GREEN}Backend:  http://localhost:8000${NC}"
echo -e "${GREEN}Frontend: http://localhost:5173${NC}"
echo -e "${GREEN}API:      http://localhost:8000/api${NC}"
echo ""
echo "Two terminal windows have been opened."
echo "Close them to stop the servers."
echo ""
echo "To wipe and reseed the database next time:"
echo "  ./launch.sh --recreate-db"
echo ""
