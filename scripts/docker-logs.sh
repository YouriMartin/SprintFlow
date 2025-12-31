#!/bin/bash

# SprintFlow - View Docker logs
# This script shows logs from all containers or a specific service

SERVICE=${1:-}

if [ -z "$SERVICE" ]; then
  echo "📋 Showing logs from all services..."
  echo "   Press Ctrl+C to exit"
  echo ""
  docker compose logs -f
else
  echo "📋 Showing logs for $SERVICE..."
  echo "   Press Ctrl+C to exit"
  echo ""
  docker compose logs -f "$SERVICE"
fi
