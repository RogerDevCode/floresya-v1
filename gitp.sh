#!/bin/bash
# Git Push Script - Enhanced version with HTTPS support
# Usage: ./gitp.sh "commit message"

# Check if message was provided
if [ -z "$1" ]; then
  echo "❌ Error: Commit message required"
  echo "Usage: ./gitp.sh \"your commit message\""
  exit 1
fi

# Store commit message
COMMIT_MESSAGE="$1"

# Check Git status
echo "📊 Checking Git status..."
STATUS=$(git status --porcelain)
if [ -z "$STATUS" ]; then
  echo "✅ No changes to commit"
  exit 0
fi

# Show what changes will be committed
echo "📝 Files to be committed:"
git status --short

# Execute: add, commit, push
echo "📦 Adding changes..."
git add . || { echo "❌ Error: git add failed"; exit 1; }

echo "💾 Committing with message: $COMMIT_MESSAGE"
git commit -m "$COMMIT_MESSAGE" || { echo "❌ Error: git commit failed"; exit 1; }

echo "🔄 Pulling latest changes from remote (rebase)..."
git pull --rebase || { echo "❌ Warning: git pull failed - you may need to resolve conflicts"; }

echo "🚀 Pushing to remote..."
git push || { echo "❌ Error: git push failed"; exit 1; }

echo "✅ Done! Commit and push completed successfully."