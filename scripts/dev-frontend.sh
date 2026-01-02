#!/bin/bash

# SprintFlow - Run frontend in development/watch mode
# This script starts the Next.js frontend with hot-reload enabled

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Get the project root (parent of scripts directory)
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🎨 Starting SprintFlow Frontend in development mode..."
echo ""
echo "📍 Frontend will be available at: http://localhost:3001"
echo ""
echo "⚠️  Make sure the backend is running at http://localhost:3000"
echo ""
echo "🔄 Hot-reload enabled - changes will update automatically"
echo ""

cd "$PROJECT_ROOT/apps/frontend"
npm run dev
