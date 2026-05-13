@echo off
setlocal enabledelayedexpansion

REM Daggerheart Companion - Setup Script (Run once after cloning)

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo ========================================
echo Daggerheart Companion - Setup
echo ========================================
echo.

REM Step 1: Check prerequisites
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

REM Step 2: Setup Backend
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

REM Step 2.5: Seed Database (with safety check)
echo Step 2.5: Setting up database...

REM Check if database already has data
set "DB_HAS_DATA=0"
if exist "database\daggerheart.db" (
    python -c "from db import get_connection; conn = get_connection(); equip = conn.execute('SELECT COUNT(*) FROM Equipment').fetchone()[0]; cards = conn.execute('SELECT COUNT(*) FROM DomainCards').fetchone()[0]; exit(0 if equip > 0 and cards > 0 else 1)" >nul 2>&1
    if not errorlevel 1 (
        set "DB_HAS_DATA=1"
    )
)

if "%DB_HAS_DATA%"=="1" (
    echo Database already has data. Skipping seed to preserve your existing data.
    echo If you want to reset the database, run: launch.bat --recreate-db
) else (
    if exist "database\recreate_db.py" (
        echo Seeding database with initial data...
        python database\recreate_db.py
        echo Database seeded successfully!
    ) else (
        echo WARNING: recreate_db.py not found. Database may be empty.
    )
)
echo.

REM Step 3: Setup Frontend
echo Step 3: Setting up frontend...
cd /d "%SCRIPT_DIR%frontend"

REM Always create .env.local with the correct URL
echo Creating .env.local with correct API URL...
(
echo VITE_API_BASE_URL=http://localhost:8000/api
) > .env.local
echo Created .env.local

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
