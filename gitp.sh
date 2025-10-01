#!/bin/bash
# Git Push Script - KISS Principle
# Usage: ./gitp.sh "commit message"

# Check if message was provided
if [ -z "$1" ]; then
  echo "❌ Error: Commit message required"
  echo "Usage: ./gitp.sh \"your commit message\""
  exit 1
fi

# Store commit message
COMMIT_MESSAGE="$1"

# Execute: add, commit, push
echo "📦 Adding changes..."
git add . || { echo "❌ Error: git add failed"; exit 1; }

echo "💾 Committing..."
git commit -m "$COMMIT_MESSAGE" || { echo "❌ Error: git commit failed"; exit 1; }

echo "🚀 Pushing to remote..."
git push || { echo "❌ Error: git push failed"; exit 1; }

echo "✅ Done!"
