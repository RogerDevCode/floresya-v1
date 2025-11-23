#!/usr/bin/env node
// @ts-nocheck

/**
 * Fix Error Logging Script
 * Aplicando Google Engineering Practices
 * Convierte console.error(error) a console.error(error)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.join(__dirname, '..', '..')

// Patterns to fix
const FIXES = [
  {
    // console.log(error?.message) -> console.error(error)
    pattern: /console\.log\(`([^`]*)\$\{error\?\.message\}`\)/g,
    replacement: 'console.error(error)'
  },
  {
    // console.error(error) -> console.error(error)
    pattern: /console\.log\(`Error: \$\{error\.message\}`\)/g,
    replacement: 'console.error(error)'
  },
  {
    // console.error(error) -> console.error(error)
    pattern: /console\.log\(error\)/g,
    replacement: 'console.error(error)'
  },
  {
    // console.error(err) -> console.error(err)
    pattern: /console\.log\(err\)/g,
    replacement: 'console.error(err)'
  },
  {
    // console.error(error) -> console.error(error)
    pattern: /console\.log\(`Stack trace: \$\{error\.stack\}`\)/g,
    replacement: 'console.error(error)'
  }
]

/**
 * Find JavaScript files in directory
 */
function findJsFiles(dir, exclude = []) {
  const files = []
  const items = fs.readdirSync(dir)

  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      if (!item.startsWith('.') && !item.startsWith('node_modules')) {
        files.push(...findJsFiles(fullPath, exclude))
      }
    } else if (item.endsWith('.js') && !item.endsWith('.test.js')) {
      files.push(fullPath)
    }
  }

  return files
}

/**
 * Fix error logging in file
 */
function fixFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  let modified = false
  let newContent = content

  for (const fix of FIXES) {
    if (fix.pattern.test(newContent)) {
      modified = true
      newContent = newContent.replace(fix.pattern, fix.replacement)
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, newContent)
    return true
  }

  return false
}

/**
 * Main execution
 */
function main() {
  console.log('\n🔧 Fixing Error Logging Patterns\n')
  console.log('Applying Google Engineering Practices:')
  console.log('  - console.error() for errors')
  console.log('  - console.log() for info only\n')

  const scriptsDir = path.join(PROJECT_ROOT, 'scripts')
  const files = findJsFiles(scriptsDir)

  let fixedCount = 0

  for (const file of files) {
    const relPath = path.relative(PROJECT_ROOT, file)
    if (fixFile(file)) {
      console.log(`  ✅ Fixed: ${relPath}`)
      fixedCount++
    }
  }

  console.log(`\n📊 Summary: ${fixedCount} files fixed\n`)
}

main()
