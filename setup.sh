#!/bin/bash

# Daggerheart Companion - Setup Script (Run once after cloning)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Daggerheart Companion - Setup${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}ERROR: Python 3 not found.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python found ($(python3 --version))${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js not found.${NC}"
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

# Seed Database (with safety check)
echo -e "${YELLOW}Step 2.5: Setting up database...${NC}"

# Check if database already has data
DB_HAS_DATA=false
if [ -f "database/daggerheart.db" ]; then
    python -c "from db import get_connection; conn = get_connection(); equip = conn.execute('SELECT COUNT(*) FROM Equipment').fetchone()[0]; cards = conn.execute('SELECT COUNT(*) FROM DomainCards').fetchone()[0]; exit(0 if equip > 0 and cards > 0 else 1)" 2>/dev/null && DB_HAS_DATA=true
fi

if [ "$DB_HAS_DATA" = true ]; then
    echo -e "${YELLOW}Database already has data. Skipping seed to preserve your existing data.${NC}"
    echo "If you want to reset the database, run: ./launch.sh --recreate-db"
else
    if [ -f "database/recreate_db.py" ]; then
        echo "Seeding database with initial data..."
        python database/recreate_db.py
        echo -e "${GREEN}✓ Database seeded successfully!${NC}"
    else
        echo -e "${YELLOW}WARNING: recreate_db.py not found. Database may be empty.${NC}"
    fi
fi
echo ""

# Setup Frontend
echo -e "${YELLOW}Step 3: Setting up frontend...${NC}"
cd "$SCRIPT_DIR/frontend"

echo "Creating .env.local with correct API URL..."
cat > .env.local << EOF
VITE_API_BASE_URL=http://localhost:8000/api
EOF
echo -e "${GREEN}✓ Created .env.local${NC}"

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
