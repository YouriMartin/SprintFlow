#!/bin/bash

# SprintFlow - Restart all Docker services
# This script stops and restarts all containers

set -e

echo "🔄 Restarting SprintFlow Docker services..."
echo ""

docker compose down
echo ""
docker compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 3

echo ""
echo "✅ SprintFlow restarted successfully!"
echo ""
echo "📍 Services:"
echo "  - Frontend:  http://localhost:3001"
echo "  - Backend:   http://localhost:3000"
echo "  - Swagger:   http://localhost:3000/api"
echo ""
