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
    const sqlQueryPattern =
      /\.from\(['"](\w+)['"]\)\s*\.select\(['"]\*['"]\)\s*\.eq\(['"]is_active['"],\s*(\w+)\)/g
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
