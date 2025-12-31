#!/bin/bash

# SprintFlow - Run all services in development mode
# This script starts PostgreSQL, backend, and frontend in watch mode

set -e

echo "🚀 Starting SprintFlow in full development mode..."
echo ""

# Check if PostgreSQL container is running
if ! docker ps | grep -q postgres; then
  echo "🐘 Starting PostgreSQL..."
  docker run -d \
    --name postgres \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_DB=sprintflow \
    -p 5432:5432 \
    postgres:16-alpine

  echo "⏳ Waiting for PostgreSQL to be ready..."
  sleep 3
  echo "✅ PostgreSQL is ready!"
else
  echo "✅ PostgreSQL is already running"
fi

echo ""
echo "📍 Services:"
echo "  - Frontend:  http://localhost:3001"
echo "  - Backend:   http://localhost:3000"
echo "  - Swagger:   http://localhost:3000/api"
echo "  - PostgreSQL: localhost:5432"
echo ""
echo "🔄 Starting backend and frontend in watch mode..."
echo "   This will open in two separate terminal windows/tabs"
echo ""

# Detect terminal emulator and open new windows
if command -v gnome-terminal &> /dev/null; then
  # GNOME Terminal
  gnome-terminal --tab --title="SprintFlow Backend" -- bash -c "cd $(pwd) && ./scripts/dev-backend.sh; exec bash"
  gnome-terminal --tab --title="SprintFlow Frontend" -- bash -c "cd $(pwd) && ./scripts/dev-frontend.sh; exec bash"
elif command -v konsole &> /dev/null; then
  # KDE Konsole
  konsole --new-tab -e bash -c "cd $(pwd) && ./scripts/dev-backend.sh; exec bash" &
  konsole --new-tab -e bash -c "cd $(pwd) && ./scripts/dev-frontend.sh; exec bash" &
elif command -v xterm &> /dev/null; then
  # xterm
  xterm -e bash -c "cd $(pwd) && ./scripts/dev-backend.sh; exec bash" &
  xterm -e bash -c "cd $(pwd) && ./scripts/dev-frontend.sh; exec bash" &
else
  # Fallback: run sequentially with message
  echo "⚠️  Could not detect terminal emulator for split windows"
  echo "   Please run these commands in separate terminals:"
  echo "   1. npm run dev:backend"
  echo "   2. npm run dev:frontend"
  echo ""
  echo "   Starting backend first..."
  ./scripts/dev-backend.sh
fi
