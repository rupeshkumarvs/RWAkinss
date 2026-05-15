#!/bin/bash
# Start NeuroCred backend and frontend services

set -e

cd "$(dirname "$0")/.."

echo "🚀 Starting NeuroCred Services"
echo "=============================="
echo ""

# Check if services are already running
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Backend already running on port 8000"
else
    echo "📦 Starting Backend..."
    cd backend
    python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
    echo "   Backend started (PID: $BACKEND_PID)"
    echo "   URL: http://localhost:8000"
    echo "   Health: http://localhost:8000/health"
    cd ..
fi

echo ""
sleep 2

# Check if frontend is already running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Frontend already running on port 3000"
else
    echo "🎨 Starting Frontend..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    echo "   Frontend started (PID: $FRONTEND_PID)"
    echo "   URL: http://localhost:3000"
    cd ..
fi

echo ""
echo "✅ Services started!"
echo ""
echo "To stop services:"
echo "  pkill -f 'uvicorn app:app'  # Stop backend"
echo "  pkill -f 'next dev'         # Stop frontend"
echo ""
echo "Or use: ./scripts/stop-services.sh"
echo ""

