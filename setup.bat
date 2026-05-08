@echo off
echo Checking prerequisites...

python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found. Install it from https://python.org/downloads
    pause
    exit /b 1
)

node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found. Install it from https://nodejs.org
    pause
    exit /b 1
)

echo Setting up backend...
cd /d "%~dp0backend"
python -m venv .venv
call .venv\Scripts\activate
pip install -r requirements.txt
cd /d "%~dp0"

echo Setting up frontend...
cd /d "%~dp0frontend"
if not exist ".env.local" (
    copy ".env.example" ".env.local"
    echo Created .env.local from .env.example
)
npm install
cd /d "%~dp0"

echo.
echo Setup complete!
echo.
echo To start the app open two Command Prompt or PowerShell windows and run:
echo   Terminal 1: start-backend.bat
echo   Terminal 2: start-frontend.bat
pause
