if "%RECREATE_DB%"=="true" (
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
        set "RECREATE_DB=false"
        timeout /t 2 /nobreak >nul
        goto :skip_recreate
    ) else (
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
    )
)
:skip_recreate
