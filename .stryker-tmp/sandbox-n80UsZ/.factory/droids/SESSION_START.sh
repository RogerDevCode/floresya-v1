#!/bin/bash

# SESSION_START.sh
# Script to be run at the beginning of every coding session
# This ensures all mandatory rules are fresh in context

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              🤖 FLORESYA DROID SESSION START                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Display mandatory rules
cat .factory/droids/MANDATORY_RULES.md

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    📊 PROJECT STATUS                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Show current git status
echo "📁 Git Status:"
git status --short | head -20

echo ""
echo "🌿 Current Branch:"
git branch --show-current

echo ""
echo "📝 Recent Commits:"
git log --oneline -5

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                ✅ ESLINT CONFIGURATION                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Show ESLint version
npm list eslint 2>/dev/null | grep eslint || echo "⚠️ ESLint not found"

echo ""
echo "📋 Critical Rules Active:"
echo "  • curly: ['error', 'all'] - ALWAYS use braces"
echo "  • prefer-const: 'error' - Use const by default"
echo "  • require-await: 'warn' - No async without await"
echo "  • no-unused-vars: 'error' - Unused vars must start with _"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              🎯 SESSION READY - AWAITING TASK                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Mandatory rules loaded"
echo "✅ ESLint compliance mode active"
echo "✅ MVC architecture guidelines loaded"
echo "✅ Ready to code"
echo ""
