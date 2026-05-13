@echo off
setlocal enabledelayedexpansion

REM Daggerheart Companion - Launch Script

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo ========================================
echo Daggerheart Companion - Launch
echo ========================================
echo.

REM Check if setup has been run
if not exist "%SCRIPT_DIR%backend\.venv" (
    echo ERROR: Backend virtual environment not found!
    echo Please run setup.bat first.
    pause
    exit /b 1
)

if not exist "%SCRIPT_DIR%frontend\node_modules" (
    echo ERROR: Frontend dependencies not found!
    echo Please run setup.bat first.
    pause
    exit /b 1
)

REM Check for --recreate-db flag
set "RECREATE_DB=0"
if "%1"=="--recreate-db" set "RECREATE_DB=1"
if "%1"=="-r" set "RECREATE_DB=1"

REM Only show warning and recreate if flag is present
if "%RECREATE_DB%"=="1" (
    echo.
    echo ========================================
    echo WARNING: This will DELETE ALL YOUR DATA!
    echo ========================================
    echo.
    echo This action will:
    echo   - Delete all characters
    echo   - Delete all NPCs and adversaries
    echo   - Reset the database to factory defaults
    echo.
    echo This CANNOT be undone!
    echo.
    set /p confirm="Type 'YES' (all caps) to continue: "
    if not "!confirm!"=="YES" (
        echo.
        echo Database recreation cancelled. No data was lost.
        echo.
        pause
        exit /b 0
    )
    echo.
    echo Recreating database...
    cd /d "%SCRIPT_DIR%backend"
    call .venv\Scripts\activate.bat 2>nul
    if exist "database\recreate_db.py" (
        python database\recreate_db.py
        echo Database recreation complete
    ) else (
        echo WARNING: database\recreate_db.py not found
        python -c "from db import initialize_app_tables; initialize_app_tables()"
        echo Database initialization complete
    )
    echo.
    cd /d "%SCRIPT_DIR%"
)

REM Verify .env.local has the correct URL
cd /d "%SCRIPT_DIR%frontend"
if exist ".env.local" (
    findstr /c:"VITE_API_BASE_URL=http://localhost:8000/api" .env.local >nul
    if errorlevel 1 (
        echo Fixing .env.local...
        (echo VITE_API_BASE_URL=http://localhost:8000/api) > .env.local
    )
) else (
    echo Creating .env.local...
    (echo VITE_API_BASE_URL=http://localhost:8000/api) > .env.local
)

REM Kill any existing processes on ports 8000 and 5173
echo.
echo Stopping existing servers...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
) 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
) 2>nul

echo.
echo Opening terminal windows...

REM Create backend launcher
set "BACKEND_SCRIPT=%TEMP%\daggerheart_backend.bat"
(
echo @echo off
echo cd /d "%SCRIPT_DIR%backend"
echo call .venv\Scripts\activate.bat
echo echo ========================================
echo echo Daggerheart Backend Server
echo echo ========================================
echo echo.
echo echo Starting backend on http://localhost:8000
echo echo API: http://localhost:8000/api
echo echo.
echo echo Press Ctrl+C to stop
echo echo ========================================
echo echo.
echo uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
echo pause
) > "%BACKEND_SCRIPT%"

start "Daggerheart Backend" cmd /k ""%BACKEND_SCRIPT%""

timeout /t 2 /nobreak >nul

REM Create frontend launcher
set "FRONTEND_SCRIPT=%TEMP%\daggerheart_frontend.bat"
(
echo @echo off
echo cd /d "%SCRIPT_DIR%frontend"
echo echo ========================================
echo echo Daggerheart Frontend Server
echo echo ========================================
echo echo.
echo echo Starting frontend on http://localhost:5173
echo echo.
echo echo Press Ctrl+C to stop
echo echo ========================================
echo echo.
echo npm run dev
echo pause
) > "%FRONTEND_SCRIPT%"

start "Daggerheart Frontend" cmd /k ""%FRONTEND_SCRIPT%""

echo.
echo ========================================
echo Daggerheart Companion is starting!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo API:      http://localhost:8000/api
echo.
echo Two terminal windows have been opened.
echo Close them to stop the servers.
echo.
echo To reset the database next time, run:
echo   launch.bat --recreate-db
echo.
timeout /t 3 /nobreak >nul
