#!/bin/bash

# SprintFlow - Start all services in Docker
# This script builds and starts all containers in detached mode

set -e

echo "🚀 Starting SprintFlow in Docker..."
echo ""

# Build images if needed
echo "📦 Building Docker images..."
docker compose build

echo ""
echo "🔄 Starting containers..."
docker compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 3

echo ""
echo "✅ SprintFlow is running!"
echo ""
echo "📍 Services:"
echo "  - Frontend:  http://localhost:3001"
echo "  - Backend:   http://localhost:3000"
echo "  - Swagger:   http://localhost:3000/api"
echo "  - PostgreSQL: localhost:5432"
echo ""
echo "💡 Useful commands:"
echo "  - View logs:       npm run docker:logs"
echo "  - Stop services:   npm run docker:stop"
echo "  - Restart:         npm run docker:restart"
echo ""
