@echo off
setlocal enabledelayedexpansion

REM Daggerheart Companion - Setup Script (Run once after cloning)

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo ========================================
echo Daggerheart Companion - Setup
echo ========================================
echo.

REM Check prerequisites
echo Step 1: Checking prerequisites...

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found. Install it from https://python.org/downloads
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('python --version 2^>^&1') do echo Python found (%%i)

REM Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found. Install it from https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do echo Node.js found (%%i)

echo.

REM Setup Backend
echo Step 2: Setting up backend...
cd /d "%SCRIPT_DIR%backend"

if not exist ".venv" (
    echo Creating Python virtual environment...
    python -m venv .venv
)

echo Installing Python dependencies...
call .venv\Scripts\activate.bat
pip install -r requirements.txt

echo Backend setup complete
echo.

REM Setup Frontend
echo Step 3: Setting up frontend...
cd /d "%SCRIPT_DIR%frontend"

if not exist ".env.local" (
    if exist ".env.example" (
        copy ".env.example" ".env.local" >nul
        echo Created .env.local from .env.example
    ) else (
        echo VITE_API_BASE_URL=http://localhost:8000/api > .env.local
        echo Created .env.local with default configuration
    )
) else (
    findstr /c:"VITE_API_BASE_URL" .env.local >nul
    if errorlevel 1 (
        echo VITE_API_BASE_URL=http://localhost:8000/api >> .env.local
        echo Added VITE_API_BASE_URL to .env.local
    )
)

echo Installing npm dependencies...
call npm install

echo Frontend setup complete
echo.

echo ========================================
echo Setup complete!
echo ========================================
echo.
echo You can now run launch.bat to start the app
echo.
pause
