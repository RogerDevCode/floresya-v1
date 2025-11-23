#!/bin/bash

# =====================================================
# Refactoring Script: is_active → active
# Date: 2025-11-04
# Author: Claude Code
# Description: Rename all is_active references to active
#              in the codebase
# =====================================================

set -e

echo "========================================="
echo "  REFACTORING: is_active → active"
echo "========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
total_files=0
modified_files=0
changes_count=0

# Function to log with color
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if backup should be created
log_info "Creating backup of current code..."
BACKUP_DIR="backup/refactoring/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Find all JavaScript/TypeScript files
log_info "Scanning for JavaScript/TypeScript files..."
JS_FILES=$(find /home/manager/Sync/floresya-v1/api -type f \( -name "*.js" -o -name "*.test.js" \) 2>/dev/null | grep -v node_modules | head -100)

if [ -z "$JS_FILES" ]; then
    log_error "No JavaScript files found in /home/manager/Sync/floresya-v1/api"
    exit 1
fi

log_success "Found $(echo "$JS_FILES" | wc -l) JavaScript files"
echo ""

# Create refactoring log
REFACTOR_LOG="$BACKUP_DIR/refactoring.log"
echo "Refactoring Log - $(date)" > "$REFACTOR_LOG"
echo "======================================" >> "$REFACTOR_LOG"
echo "" >> "$REFACTOR_LOG"

# Define patterns to replace
declare -a patterns=(
    # Property names in objects
    "s/\bis_active:/active:/g"
    # SQL queries
    "s/\bis_active\b/active/g"
    # Variable names in queries
    "s/\(\s*is_active\s*,\s*/(active, /g"
    "s/,\s*is_active\s*,/, active, /g"
    "s/,\s*is_active\s*)/, active)/g"
    # Function parameters
    "s/\(\s*is_active\s*\)/(active)/g"
    # In WHERE clauses
    "s/\.eq(\s*['\"]is_active['\"]\s*,/\.eq('active',/g"
    "s/\.eq(\s*'is_active'\s*,/\.eq('active',/g"
    # In SELECT clauses
    "s/select:\s*['\"]is_active['\"]/select: 'active'/g"
    # In UPDATE clauses
    "s/update:\s*is_active\b/update: active/g"
)

# Process each file
for file in $JS_FILES; do
    total_files=$((total_files + 1))
    filename=$(basename "$file")
    relative_path="${file#/home/manager/Sync/floresya-v1/}"

    # Check if file contains is_active
    if grep -q "is_active" "$file" 2>/dev/null; then
        # Create backup
        cp "$file" "$BACKUP_DIR/$(echo "$relative_path" | tr '/' '_')"

        modified=true
        file_changes=0

        # Apply each pattern
        for pattern in "${patterns[@]}"; do
            before_count=$(grep -o "is_active" "$file" | wc -l)
            sed -i "$pattern" "$file"
            after_count=$(grep -o "active" "$file" | wc -l)

            if [ $before_count -gt 0 ]; then
                file_changes=$((file_changes + 1))
            fi
        done

        if [ $file_changes -gt 0 ]; then
            modified_files=$((modified_files + 1))
            log_success "Modified: $relative_path"
            echo "  $relative_path - $file_changes changes" >> "$REFACTOR_LOG"
        else
            log_warning "No changes applied: $relative_path"
        fi
    fi
done

echo ""
log_info "Creating JavaScript refactoring helper..."

# Create a Node.js helper script for complex replacements
cat > "$BACKUP_DIR/advanced_refactor.js" << 'EOF'
#!/usr/bin/env node
/**
 * Advanced refactoring for is_active → active
 * Handles complex cases that sed cannot
 */

import fs from 'fs'
import path from 'path'

const PROJECT_ROOT = '/home/manager/Sync/floresya-v1'

function refactorFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8')
    let changes = 0

    // Pattern 1: Object destructuring
    const destructuringPattern = /const\s*{([^}]+)}\s*=\s*await\s+(\w+)/g
    content = content.replace(destructuringPattern, (match, props, service) => {
      if (props.includes('is_active')) {
        changes++
        return match.replace(/is_active/g, 'active')
      }
      return match
    })

    // Pattern 2: SQL query building
    const sqlQueryPattern = /\.from\(['"](\w+)['"]\)\s*\.select\(['"]\*['"]\)\s*\.eq\(['"]is_active['"],\s*(\w+)\)/g
    content = content.replace(sqlQueryPattern, (match, table, value) => {
      changes++
      return match.replace(/is_active/g, 'active')
    })

    // Pattern 3: Supabase filters
    const supabaseFilterPattern = /(\w+)\.eq\(\s*['"]is_active['"]\s*,\s*(\w+)\s*\)/g
    content = content.replace(supabaseFilterPattern, (match, obj, value) => {
      changes++
      return `${obj}.eq('active', ${value})`
    })

    // Pattern 4: Map functions
    const mapPattern = /\.map\(\s*\(\s*(\w+)\s*\)\s*=>\s*{[^}]*is_active[^}]*}/g
    content = content.replace(mapPattern, (match, item) => {
      changes++
      return match.replace(/is_active/g, 'active')
    })

    if (changes > 0) {
      fs.writeFileSync(filePath, content)
      console.log(`✅ Refactored: ${filePath} (${changes} changes)`)
      return changes
    }

    return 0
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message)
    return 0
  }
}

// Main execution
const apiDir = path.join(PROJECT_ROOT, 'api')
const jsFiles = []

function findJsFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      findJsFiles(fullPath)
    } else if (entry.name.endsWith('.js') && !entry.name.includes('.test.js')) {
      jsFiles.push(fullPath)
    }
  }
}

findJsFiles(apiDir)

let totalChanges = 0
for (const file of jsFiles) {
  if (fs.readFileSync(file, 'utf8').includes('is_active')) {
    totalChanges += refactorFile(file)
  }
}

console.log(`\n🎉 Refactoring complete! ${totalChanges} changes applied.`)
EOF

chmod +x "$BACKUP_DIR/advanced_refactor.js"

# Summary
echo ""
echo "========================================="
echo "  REFACTORING SUMMARY"
echo "========================================="
echo "Total files scanned: $total_files"
echo "Files modified: $modified_files"
echo "Backup location: $BACKUP_DIR"
echo "Refactoring log: $REFACTOR_LOG"
echo ""
log_success "Refactoring completed!"
echo ""
log_info "Next steps:"
echo "  1. Review changes in: $BACKUP_DIR"
echo "  2. Run ESLint: npm run lint"
echo "  3. Run tests: npm test"
echo "  4. If everything looks good, commit changes"
echo ""

# Create a rollback script
cat > "$BACKUP_DIR/rollback.sh" << EOF
#!/bin/bash
# Rollback script to restore original files
echo "Rolling back changes from: $BACKUP_DIR"
for file in "$BACKUP_DIR"/*.js; do
  if [ -f "\$file" ]; then
    original="\${file#$BACKUP_DIR/}"
    echo "Restoring: \$original"
    cp "\$file" "/home/manager/Sync/floresya-v1/\$original"
  fi
done
echo "Rollback complete!"
EOF

chmod +x "$BACKUP_DIR/rollback.sh"

log_info "Rollback script created: $BACKUP_DIR/rollback.sh"
