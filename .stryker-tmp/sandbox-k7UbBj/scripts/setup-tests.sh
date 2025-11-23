#!/bin/bash
# Setup Script for E2E Tests
# Prepares database and runs tests with optimal configuration
#
# Usage: bash scripts/setup-tests.sh
# Or: chmod +x scripts/setup-tests.sh && ./scripts/setup-tests.sh

set -e  # Exit on error

echo "=========================================="
echo "  🧪 E2E Tests Setup"
echo "=========================================="
echo ""

# Check if environment is loaded
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local not found"
    echo "Please ensure your environment variables are configured"
    exit 1
fi

echo "📦 Step 1: Cleaning test data..."
node scripts/setup/cleanup-test-data.js

echo ""
echo "🌱 Step 2: Seeding products..."
node scripts/setup/seed-products.js

echo ""
echo "🌼 Step 3: Seeding occasions..."
node scripts/setup/seed-occasions.js

echo ""
echo "🚀 Step 4: Starting server..."
# Check if server is already running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "   ✓ Server already running on port 3000"
else
    npm run dev > /tmp/server.log 2>&1 &
    SERVER_PID=$!
    echo "   ✓ Server started (PID: $SERVER_PID)"
    # Wait for server to be ready
    sleep 5
    # Check if server is responding
    for i in {1..10}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo "   ✓ Server is ready"
            break
        fi
        echo "   ⏳ Waiting for server to be ready... ($i/10)"
        sleep 2
    done
fi

echo ""
echo "🧪 Step 5: Running tests with optimized configuration..."
echo ""

# Run tests with optimized config
npx playwright test --config=playwright.config.optimized.cjs "$@"

echo ""
echo "=========================================="
echo "  ✅ Tests completed!"
echo "=========================================="
