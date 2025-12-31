#!/bin/bash

# SprintFlow - Clean Docker environment
# This script removes all containers, volumes, and images

set -e

echo "🧹 Cleaning SprintFlow Docker environment..."
echo ""
echo "⚠️  This will remove all containers, volumes, and rebuild from scratch!"
read -p "Are you sure? (y/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo ""
  echo "🗑️  Stopping and removing containers..."
  docker compose down -v

  echo ""
  echo "🗑️  Removing images..."
  docker compose down --rmi local

  echo ""
  echo "✅ Docker environment cleaned!"
  echo ""
  echo "💡 Run 'npm run docker:start' to rebuild and start services"
  echo ""
else
  echo ""
  echo "❌ Operation cancelled"
  echo ""
fi
