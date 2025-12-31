#!/bin/bash

# SprintFlow - Run backend in development/watch mode
# This script starts the NestJS backend with hot-reload enabled

set -e

echo "🔧 Starting SprintFlow Backend in development mode..."
echo ""
echo "📍 Backend will be available at: http://localhost:3000"
echo "📍 Swagger docs at: http://localhost:3000/api"
echo ""
echo "⚠️  Make sure PostgreSQL is running!"
echo "   Quick start: docker run -d --name postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=sprintflow -p 5432:5432 postgres:16-alpine"
echo ""
echo "🔄 Hot-reload enabled - changes will restart the server automatically"
echo ""

cd apps/backend
npm run start:dev
