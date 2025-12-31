#!/bin/bash

# SprintFlow - Start PostgreSQL for development
# This script starts a PostgreSQL container for local development

set -e

# Check if PostgreSQL container already exists
if docker ps -a | grep -q postgres; then
  if docker ps | grep -q postgres; then
    echo "✅ PostgreSQL is already running!"
    echo "📍 Connection: postgresql://postgres:postgres@localhost:5432/sprintflow"
  else
    echo "🔄 Starting existing PostgreSQL container..."
    docker start postgres
    echo "✅ PostgreSQL started!"
    echo "📍 Connection: postgresql://postgres:postgres@localhost:5432/sprintflow"
  fi
else
  echo "🐘 Creating and starting PostgreSQL container..."
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
  echo "📍 Connection: postgresql://postgres:postgres@localhost:5432/sprintflow"
fi

echo ""
echo "💡 Useful commands:"
echo "  - Stop:    docker stop postgres"
echo "  - Remove:  docker rm postgres"
echo "  - Logs:    docker logs -f postgres"
echo ""
