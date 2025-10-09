#!/bin/bash

# qs.sh - Quick Start Script for FloresYa Development
# Q&S: Format, Validate, Start Dev Server (kills port 3000 if needed)

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  FloresYa Q&S - Quick Start Script${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 1: Kill any process using port 3000
echo -e "${YELLOW}[1/4] Checking port 3000...${NC}"
PORT_PID=$(lsof -ti:3000 2>/dev/null || true)

if [ -n "$PORT_PID" ]; then
    echo -e "${YELLOW}      Port 3000 is in use by PID: $PORT_PID${NC}"
    echo -e "${YELLOW}      Killing process...${NC}"
    kill -9 $PORT_PID 2>/dev/null || true
    sleep 1
    echo -e "${GREEN}      ✓ Port 3000 is now free${NC}"
else
    echo -e "${GREEN}      ✓ Port 3000 is available${NC}"
fi
echo ""

# Step 2: Format code
echo -e "${YELLOW}[2/4] Running prettier format...${NC}"
npm run format
echo -e "${GREEN}      ✓ Code formatted${NC}"
echo ""

# Step 3: Full validation
echo -e "${YELLOW}[3/4] Running full validation (lint + OpenAPI)...${NC}"
npm run validate:full
echo -e "${GREEN}      ✓ Validation passed${NC}"
echo ""

# Step 4: Start dev server
echo -e "${YELLOW}[4/4] Starting dev server...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}      Server starting on http://localhost:3000${NC}"
echo -e "${GREEN}      Press Ctrl+C to stop${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

npm run dev
