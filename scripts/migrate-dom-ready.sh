#!/bin/bash
# Script to migrate all frontend JS files to use the safe dom-ready pattern
# Usage: bash scripts/migrate-dom-ready.sh

set -e

echo "🔄 Migrating frontend JS files to safe DOM-ready pattern..."

# Counter
updated=0

# Find all JS files in public/pages (excluding node_modules, tests, and already migrated)
find public/pages -name "*.js" -type f ! -path "*/node_modules/*" ! -path "*/__tests__/*" | while read -r file; do
  echo "📝 Processing: $file"

  # Check if file already imports dom-ready
  if grep -q "from.*dom-ready.js" "$file"; then
    echo "   ✅ Already migrated, skipping..."
    continue
  fi

  # Check if file uses document.addEventListener('DOMContentLoaded'
  if ! grep -q "document.addEventListener('DOMContentLoaded'" "$file"; then
    echo "   ⏭️  No DOMContentLoaded found, skipping..."
    continue
  fi

  # Create backup
  cp "$file" "$file.bak"

  # Add import at the top (after existing imports)
  # Find the line number of the last import statement
  last_import_line=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)

  if [ -n "$last_import_line" ]; then
    # Insert after last import
    sed -i "${last_import_line}a\\import { onDOMReady } from '/js/shared/dom-ready.js'" "$file"
  else
    # No imports found, add at top after comments/docstrings
    sed -i "1a\\import { onDOMReady } from '/js/shared/dom-ready.js'" "$file"
  fi

  # Replace document.addEventListener('DOMContentLoaded', with onDOMReady(
  sed -i "s/document\.addEventListener('DOMContentLoaded',\s*\(.*\))/onDOMReady(\1)/g" "$file"
  sed -i 's/document\.addEventListener("DOMContentLoaded",\s*\(.*\))/onDOMReady(\1)/g' "$file"

  echo "   ✅ Updated successfully"
  ((updated++))
done

echo ""
echo "✅ Migration complete! Updated $updated files."
echo "💾 Backups saved with .bak extension"
echo ""
echo "🧪 Test the changes and remove backups with:"
echo "   find public/pages -name '*.bak' -delete"
