#!/bin/bash
# Mutation Testing Wrapper Script
# Moves .trunk directory outside project to avoid Stryker EISDIR error

set -e  # Exit on error

TRUNK_DIR=".trunk"
TRUNK_BACKUP="/tmp/floresya-trunk-backup-$$"  # Use PID for unique temp dir

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔬 Starting Mutation Testing Wrapper${NC}"

# Function to restore .trunk on exit
cleanup() {
  if [ -d "$TRUNK_BACKUP" ]; then
    echo -e "${YELLOW}🔄 Restoring .trunk directory...${NC}"
    rm -rf "$TRUNK_DIR" 2>/dev/null || true
    mv "$TRUNK_BACKUP" "$TRUNK_DIR"
    echo -e "${GREEN}✅ .trunk directory restored${NC}"
  fi
}

# Register cleanup function to run on exit
trap cleanup EXIT INT TERM

# Check if .trunk exists
if [ -d "$TRUNK_DIR" ]; then
  echo -e "${YELLOW}📦 Moving .trunk directory to /tmp...${NC}"
  mv "$TRUNK_DIR" "$TRUNK_BACKUP"
  echo -e "${GREEN}✅ .trunk moved to $TRUNK_BACKUP${NC}"
else
  echo -e "${YELLOW}ℹ️  No .trunk directory found, proceeding...${NC}"
fi

# Run Stryker with provided arguments
echo -e "${YELLOW}🧬 Running Stryker mutation tests...${NC}"
echo ""

npx stryker run "$@"
STRYKER_EXIT_CODE=$?

echo ""
if [ $STRYKER_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✅ Mutation testing completed successfully${NC}"
else
  echo -e "${RED}❌ Mutation testing failed with exit code: $STRYKER_EXIT_CODE${NC}"
fi

# Cleanup will run automatically via trap
exit $STRYKER_EXIT_CODE
