@echo off
setlocal enabledelayedexpansion

REM Daggerheart Companion - Launch Script (Opens backend and frontend terminals)

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

REM Option to recreate database (optional)
set "RECREATE_DB=false"
if "%1"=="--recreate-db" set "RECREATE_DB=true"

if "%RECREATE_DB%"=="true" (
    echo WARNING: Recreating database will wipe all existing data!
    echo.
    set /p confirm="Type YES to continue: "
    if not "!confirm!"=="YES" (
        echo Database recreation cancelled.
        set "RECREATE_DB=false"
    ) else (
        echo Recreating database...
        cd /d "%SCRIPT_DIR%backend"
        call .venv\Scripts\activate.bat 2>nul
        if exist "database\recreate_db.py" (
            python database\recreate_db.py
        ) else (
            python -c "from db import initialize_app_tables; initialize_app_tables()"
        )
        echo Database recreation complete
        echo.
    )
)

REM Kill any existing processes on ports 8000 and 5173
echo Checking for existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do (
    echo Stopping existing backend process: %%a
    taskkill /F /PID %%a >nul 2>&1
) 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do (
    echo Stopping existing frontend process: %%a
    taskkill /F /PID %%a >nul 2>&1
) 2>nul

echo.
echo Opening terminals...

REM Create and start backend in a new window
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
echo echo Press Ctrl+C to stop the server
echo echo ========================================
echo echo.
echo uvicorn main:app --reload --host 127.0.0.1 --port 8000
echo pause
) > "%BACKEND_SCRIPT%"

start "Daggerheart Backend" cmd /k ""%BACKEND_SCRIPT%""

REM Small delay to ensure backend starts first
timeout /t 2 /nobreak >nul

REM Create and start frontend in a new window
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
echo echo Press Ctrl+C to stop the server
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
echo To wipe and reseed the database next time:
echo   launch.bat --recreate-db
echo.
timeout /t 3 /nobreak >nul
