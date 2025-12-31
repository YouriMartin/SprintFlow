#!/bin/bash

# SprintFlow - Stop all Docker services
# This script stops all running containers

set -e

echo "🛑 Stopping SprintFlow Docker services..."
docker compose down

echo ""
echo "✅ All services stopped!"
echo ""
