#!/usr/bin/env bash

# =====================================================================
#    🚀 Local RAG Workstation (Production RAG Platform)
#    منظومة استنطاق المستندات واسترجاع المعرفة المحلية والإنتاجية
# =====================================================================

set -e

echo "=== Starting Local RAG Workstation ==="

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "[!] python3 could not be found. Please install Python 3.10+."
    exit 1
fi

# Check Node
if ! command -v node &> /dev/null; then
    echo "[!] node could not be found. Please install Node.js 18+."
    exit 1
fi

# Env Setup
if [ ! -f .env ]; then
    echo "[*] Creating .env from .env.example..."
    cp .env.example .env
fi

if [ ! -f backend/.env ]; then
    echo "[*] Creating backend/.env from backend/.env.example..."
    cp backend/.env.example backend/.env
fi

echo "[*] Starting Backend (FastAPI)..."
(cd backend && python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000) &
BACKEND_PID=$!

echo "[*] Starting Frontend (Next.js)..."
npm run dev &
FRONTEND_PID=$!

cleanup() {
    echo ""
    echo "Shutting down Local RAG Workstation services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}

trap cleanup INT TERM

echo ""
echo "[✓] Local RAG Workstation running:"
echo "    - Frontend: http://localhost:3000"
echo "    - Backend:  http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services."

wait
