#!/bin/bash

# migrate-workflow.sh
# Script to safely migrate from old CI/CD workflow to new one

set -e  # Exit on error

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         🚀 GitHub Actions Workflow Migration Tool            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo "📁 Current directory: $(pwd)"
echo ""

# Check if old workflow exists
if [ ! -f ".github/workflows/ci-cd.yml" ]; then
    echo -e "${RED}❌ Error: .github/workflows/ci-cd.yml not found${NC}"
    exit 1
fi

# Check if new workflow exists
if [ ! -f ".github/workflows/ci-cd-fixed.yml" ]; then
    echo -e "${RED}❌ Error: .github/workflows/ci-cd-fixed.yml not found${NC}"
    echo "Please ensure the fixed workflow file exists"
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 WORKFLOW COMPARISON"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Old workflow issues:"
echo "  ❌ npm run build (doesn't exist)"
echo "  ❌ Missing environment variables"
echo "  ❌ npm audit blocks CI"
echo "  ❌ Unreliable server startup"
echo ""
echo "New workflow fixes:"
echo "  ✅ Removed non-existent build script"
echo "  ✅ Added environment variables from secrets"
echo "  ✅ npm audit with continue-on-error"
echo "  ✅ Proper wait-on for server startup"
echo "  ✅ Parallel jobs for faster execution"
echo "  ✅ Conditional integration tests"
echo ""

# Check if wait-on is installed
echo "🔍 Checking dependencies..."
if ! grep -q '"wait-on"' package.json; then
    echo -e "${YELLOW}⚠️  wait-on not found in package.json${NC}"
    echo "Installing wait-on..."
    npm install --save-dev wait-on
    echo -e "${GREEN}✅ wait-on installed${NC}"
else
    echo -e "${GREEN}✅ wait-on already installed${NC}"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  MIGRATION OPTIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Choose an option:"
echo ""
echo "  1) Backup old workflow and use new one (RECOMMENDED)"
echo "     → ci-cd.yml → ci-cd.old.yml"
echo "     → ci-cd-fixed.yml → ci-cd.yml"
echo ""
echo "  2) Replace old workflow (no backup)"
echo "     → ci-cd-fixed.yml → ci-cd.yml (overwrites old)"
echo ""
echo "  3) Cancel migration"
echo ""

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "📦 Creating backup..."
        cp .github/workflows/ci-cd.yml .github/workflows/ci-cd.old.yml
        echo -e "${GREEN}✅ Backup created: .github/workflows/ci-cd.old.yml${NC}"
        
        echo ""
        echo "📝 Installing new workflow..."
        mv .github/workflows/ci-cd-fixed.yml .github/workflows/ci-cd.yml
        echo -e "${GREEN}✅ New workflow installed: .github/workflows/ci-cd.yml${NC}"
        
        BACKUP_CREATED=true
        ;;
    2)
        echo ""
        echo -e "${YELLOW}⚠️  No backup will be created${NC}"
        read -p "Are you sure? (y/n): " confirm
        if [ "$confirm" != "y" ]; then
            echo "Migration cancelled"
            exit 0
        fi
        
        echo ""
        echo "📝 Installing new workflow..."
        mv .github/workflows/ci-cd-fixed.yml .github/workflows/ci-cd.yml
        echo -e "${GREEN}✅ New workflow installed: .github/workflows/ci-cd.yml${NC}"
        
        BACKUP_CREATED=false
        ;;
    3)
        echo "Migration cancelled"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ MIGRATION COMPLETED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show git status
echo "📊 Git status:"
git status --short .github/workflows/ package.json package-lock.json 2>/dev/null || true
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 REQUIRED: Configure GitHub Secrets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Before pushing, configure these secrets in GitHub:"
echo ""
echo "  1. Go to: Settings → Secrets and variables → Actions"
echo "  2. Add the following secrets:"
echo ""
echo "     📌 SUPABASE_URL (required)"
echo "        → Your Supabase project URL"
echo ""
echo "     📌 SUPABASE_KEY (required)"
echo "        → Your Supabase anon key"
echo ""
echo "     📌 CODECOV_TOKEN (optional)"
echo "        → Token from codecov.io"
echo ""
echo "     📌 VERCEL_TOKEN (optional)"
echo "        → Token for Vercel deployment"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 NEXT STEPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Test locally:"
echo "   npm run lint"
echo "   npm run test:coverage"
echo "   npm run build:css"
echo ""
echo "2. Review changes:"
echo "   git diff .github/workflows/ci-cd.yml"
echo ""
echo "3. Commit and push:"
echo "   git add .github/workflows/"
echo "   git add package.json package-lock.json"
echo "   git commit -m \"fix(ci): update CI/CD workflow with fixes\""
echo "   git push"
echo ""
echo "4. Monitor GitHub Actions:"
echo "   → Check the Actions tab in your repository"
echo "   → Verify all jobs complete successfully"
echo ""

if [ "$BACKUP_CREATED" = true ]; then
    echo "5. If everything works, you can remove the backup:"
    echo "   git rm .github/workflows/ci-cd.old.yml"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 DOCUMENTATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Read these files for more information:"
echo "  • .github/GITHUB_ACTIONS_SETUP.md - Setup guide"
echo "  • .github/WORKFLOW_COMPARISON.md - Detailed comparison"
echo ""

echo -e "${GREEN}✅ Migration completed successfully!${NC}"
echo ""
