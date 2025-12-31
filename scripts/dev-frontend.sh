#!/bin/bash

# SprintFlow - Run frontend in development/watch mode
# This script starts the Next.js frontend with hot-reload enabled

set -e

echo "🎨 Starting SprintFlow Frontend in development mode..."
echo ""
echo "📍 Frontend will be available at: http://localhost:3001"
echo ""
echo "⚠️  Make sure the backend is running at http://localhost:3000"
echo ""
echo "🔄 Hot-reload enabled - changes will update automatically"
echo ""

cd apps/frontend
npm run dev
