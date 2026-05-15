#!/bin/bash
# Stop NeuroCred backend and frontend services

echo "🛑 Stopping NeuroCred Services"
echo "=============================="
echo ""

# Stop backend
if pkill -f 'uvicorn app:app' 2>/dev/null; then
    echo "✓ Backend stopped"
else
    echo "  Backend not running"
fi

# Stop frontend
if pkill -f 'next dev' 2>/dev/null; then
    echo "✓ Frontend stopped"
else
    echo "  Frontend not running"
fi

echo ""
echo "✅ Services stopped"

