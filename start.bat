@echo off
echo ========================================
echo    Writer Agent Launcher
echo ========================================
echo.

REM Check if WSL is available
where wsl >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] WSL not found, please install WSL2
    pause
    exit /b 1
)

REM Get script directory (no "writer" suffix)
set "SCRIPT_DIR=%~dp0"

REM Remove trailing backslash
if "%SCRIPT_DIR:~-1%"=="\" set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

REM Check project directory
if not exist "%SCRIPT_DIR%\backend" (
    echo [ERROR] Project directory not found: %SCRIPT_DIR%
    pause
    exit /b 1
)

REM Start backend
echo [1/2] Starting backend...
start "Writer Backend" wsl -d Ubuntu -e bash -c "cd /mnt/e/AI_agent/writer/backend && source venv/bin/activate && python -m uvicorn app.main:app --reload --port 8000"

REM Start frontend
echo [2/2] Starting frontend...
start "Writer Frontend" wsl -d Ubuntu -e bash -c "cd /mnt/e/AI_agent/writer/frontend && npm run dev"

echo.
echo ========================================
echo    Services starting...
echo    Backend: http://localhost:8000
echo    Frontend: http://localhost:5173
echo ========================================
echo.
echo Please open http://localhost:5173 in your browser
echo.
echo First time? Go to Settings to configure your API Key
echo.
pause