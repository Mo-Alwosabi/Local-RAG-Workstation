@echo off
chcp 65001 > nul
title Local RAG Workstation - Production RAG Platform
color 0f

echo =====================================================================
echo    🚀 Local RAG Workstation (Production RAG Platform)
echo    منظومة استنطاق المستندات واسترجاع المعرفة المحلية والإنتاجية
echo =====================================================================
echo.

:: 1. Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Python is not installed or not in PATH. Please install Python 3.10+.
    pause
    exit /b 1
)

:: 2. Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Node.js is not installed or not in PATH. Please install Node.js 18+.
    pause
    exit /b 1
)

:: 3. Setup Frontend .env if not exists
if not exist .env (
    echo [*] Creating .env from .env.example...
    copy .env.example .env > nul
)

:: 4. Setup Backend .env if not exists
if not exist backend\.env (
    echo [*] Creating backend\.env from backend\.env.example...
    copy backend\.env.example backend\.env > nul
)

echo.
echo [*] Starting Backend (FastAPI on http://localhost:8000)...
start "Local RAG Workstation - Backend (FastAPI)" cmd /k "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

echo [*] Starting Frontend (Next.js on http://localhost:3000)...
start "Local RAG Workstation - Frontend (Next.js)" cmd /k "npm run dev"

echo.
echo [✓] Systems are launching!
echo [✓] Frontend Workstation: http://localhost:3000
echo [✓] Backend API Docs: http://localhost:8000/docs
echo.
echo Opening browser in 5 seconds...
timeout /t 5 > nul
start http://localhost:3000

echo =====================================================================
echo    Local RAG Workstation is running. Press any key to close launcher.
echo    (Backend and Frontend will keep running in their own windows)
echo =====================================================================
pause > nul
