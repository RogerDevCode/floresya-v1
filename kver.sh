#!/bin/bash
# kver.sh - KISS: Kill port 3000, build CSS, start server
# Usage: ./kver.sh

echo "🔪 Killing processes on port 3000..."
lsof -ti:3000 | xargs -r kill -9 2>/dev/null || true

echo "🎨 Building Tailwind CSS..."
npm run build:css

echo "🚀 Starting server on http://localhost:3000..."
npm run start
