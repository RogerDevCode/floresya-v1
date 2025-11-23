/**
 * Error Handling Audit Script
 *
 * Enforces "Fail Fast" and proper logging:
 * 1. No empty catch blocks: catch (e) {}
 * 2. No console.log in API code (should use Logger or console.error)
 */
// @ts-nocheck

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const API_DIR = path.join(__dirname, '../../api')
const EXCLUDE_DIRS = ['docs', 'test', 'scripts'] // Exclude non-production code
const EXCLUDE_FILES = ['logger.js']

let violations = []

function scanDirectory(dir, fileCallback) {
  if (!fs.existsSync(dir)) return

  const files = fs.readdirSync(dir)
  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(file)) {
        scanDirectory(filePath, fileCallback)
      }
    } else if (file.endsWith('.js')) {
      if (!EXCLUDE_FILES.includes(file)) {
        fileCallback(filePath)
      }
    }
  })
}

function checkErrorHandling(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')

  // Check for empty catch blocks (basic regex, might miss multiline empty catches with comments)
  // Matches: catch (e) {} or catch(e){} with optional whitespace
  const emptyCatchRegex = /catch\s*\([^)]*\)\s*\{\s*\}/g
  let match
  while ((match = emptyCatchRegex.exec(content)) !== null) {
    const line = content.substring(0, match.index).split('\n').length
    violations.push({
      file: filePath,
      line: line,
      rule: 'Empty catch block detected. Errors must be handled or logged.',
      code: match[0]
    })
  }

  // Check for console.log usage
  const lines = content.split('\n')
  lines.forEach((line, index) => {
    if (line.includes('console.log(') && !line.trim().startsWith('//')) {
      violations.push({
        file: filePath,
        line: index + 1,
        rule: 'Avoid console.log in production code. Use Logger.info() or console.error() for errors.',
        code: line.trim()
      })
    }
  })
}

console.log('🔍 Starting Error Handling Audit...')

scanDirectory(API_DIR, checkErrorHandling)

if (violations.length > 0) {
  console.error(`❌ Found ${violations.length} Error Handling Violations:`)
  violations.forEach(v => {
    console.error(`  [${path.relative(process.cwd(), v.file)}:${v.line}] ${v.rule}`)
    console.error(`    Code: ${v.code}`)
  })
  process.exit(1)
} else {
  console.log('✅ Error Handling Audit Passed: No violations found.')
  process.exit(0)
}
