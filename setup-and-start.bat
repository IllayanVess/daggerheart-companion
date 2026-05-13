@echo off
setlocal enabledelayedexpansion

REM Daggerheart Companion - Complete Setup and Launch Script for Windows
REM Place this file in the root directory of the project

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM Parse arguments
set "SKIP_SETUP=false"
set "SKIP_RECREATE_DB=false"

:parse_args
if "%1"=="" goto :args_done
if "%1"=="--skip-setup" set "SKIP_SETUP=true"
if "%1"=="--skip-recreate-db" set "SKIP_RECREATE_DB=true"
shift
goto :parse_args
:args_done

echo ========================================
echo Daggerheart Companion - Setup ^& Launch
echo ========================================
echo.

REM Step 1: Check prerequisites (skip if --skip-setup used)
if "%SKIP_SETUP%"=="false" (
    echo Step 1: Checking prerequisites...
    
    REM Check Python
    python --version >nul 2>&1
    if errorlevel 1 (
        echo ERROR: Python not found. Install it from https://python.org/downloads
        pause
        exit /b 1
    )
    for /f "tokens=*" %%i in ('python --version 2^>^&1') do echo ✓ Python found (%%i)
    
    REM Check Node
    node --version >nul 2>&1
    if errorlevel 1 (
        echo ERROR: Node.js not found. Install it from https://nodejs.org
        pause
        exit /b 1
    )
    for /f "tokens=*" %%i in ('node --version') do echo ✓ Node.js found (%%i)
    
    echo.
    
    REM Step 2: Setup Backend
    echo Step 2: Setting up backend...
    cd /d "%SCRIPT_DIR%backend"
    
    REM Create virtual environment if it doesn't exist
    if not exist ".venv" (
        echo Creating Python virtual environment...
        python -m venv .venv
    )
    
    REM Activate venv and install requirements
    echo Installing Python dependencies...
    call .venv\Scripts\activate.bat
    pip install -r requirements.txt
    
    echo ✓ Backend setup complete
    echo.
    
    REM Step 3: Setup Frontend
    echo Step 3: Setting up frontend...
    cd /d "%SCRIPT_DIR%frontend"
    
    REM Create .env.local if it doesn't exist
    if not exist ".env.local" (
        if exist ".env.example" (
            copy ".env.example" ".env.local" >nul
            echo ✓ Created .env.local from .env.example
        ) else (
            REM Create .env.local with default configuration
            echo VITE_API_BASE_URL=http://localhost:8000/api > .env.local
            echo ✓ Created .env.local with default configuration
        )
    ) else (
        REM Verify VITE_API_BASE_URL is set correctly
        findstr /c:"VITE_API_BASE_URL" .env.local >nul
        if errorlevel 1 (
            echo VITE_API_BASE_URL=http://localhost:8000/api >> .env.local
            echo ✓ Added VITE_API_BASE_URL to .env.local
        )
    )
    
    REM Install npm dependencies
    echo Installing npm dependencies...
    call npm install
    
    echo ✓ Frontend setup complete
    echo.
) else (
    echo Skipping setup (--skip-setup flag used)
    echo.
)

REM Step 4: Recreate Database (skip if --skip-recreate-db used)
if "%SKIP_RECREATE_DB%"=="false" (
    echo Step 4: Recreating database...
    cd /d "%SCRIPT_DIR%backend"
    call .venv\Scripts\activate.bat 2>nul
    
    if exist "database\recreate_db.py" (
        python database\recreate_db.py
        echo ✓ Database recreation complete
    ) else (
        echo Warning: recreate_db.py not found in backend\database\
        echo Running initialize_app_tables() via Python instead...
        python -c "from db import initialize_app_tables; initialize_app_tables()"
        echo ✓ Database initialization complete
    )
    echo.
) else (
    echo Skipping database recreation (--skip-recreate-db flag used)
    echo.
)

REM Step 5: Start services
echo ========================================
echo Starting Daggerheart Companion
echo ========================================
echo.

REM Kill any existing processes on ports 8000 and 5173
echo Checking for existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do (
    echo Killing process on port 8000: %%a
    taskkill /F /PID %%a >nul 2>&1
) 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do (
    echo Killing process on port 5173: %%a
    taskkill /F /PID %%a >nul 2>&1
) 2>nul

REM Open new windows for backend and frontend
echo Opening new terminal windows...

REM Start Backend
start "Daggerheart Backend" cmd /k "cd /d "%SCRIPT_DIR%backend" && call .venv\Scripts\activate.bat && echo Starting backend on http://localhost:8000... && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

REM Start Frontend
start "Daggerheart Frontend" cmd /k "cd /d "%SCRIPT_DIR%frontend" && echo Starting frontend on http://localhost:5173... && npm run dev"

echo.
echo ✓ Services started!
echo.
echo ========================================
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo ========================================
echo.
echo API endpoints available at: http://localhost:8000/api
echo.
echo Close the terminal windows to stop the services
echo.
pause
