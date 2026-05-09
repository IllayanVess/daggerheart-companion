#!/bin/bash
cd "$(dirname "$0")"

echo "Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python not found. Install it from https://python.org/downloads"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found. Install it from https://nodejs.org"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "ERROR: npm not found. Reinstall Node.js from https://nodejs.org"
    exit 1
fi

echo "All prerequisites found."

echo "Setting up backend..."
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..

echo "Setting up frontend..."
cd frontend
if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo "Created .env.local from .env.example"
fi
npm install
cd ..

echo ""
echo "Setup complete!"
echo "To start the app, open two terminal windows and run:"
echo "  Terminal 1: ./start-backend.sh"
echo "  Terminal 2: ./start-frontend.sh"