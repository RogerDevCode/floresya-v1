/**
 * Architecture Enforcement Script
 *
 * Enforces the following rules:
 * 1. Controllers must NOT import Repositories directly.
 * 2. Controllers must NOT import supabaseClient directly.
 * 3. Services should be the primary layer importing Repositories.
 */
// @ts-nocheck

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CONTROLLERS_DIR = path.join(__dirname, '../../api/controllers')
const SERVICES_DIR = path.join(__dirname, '../../api/services')

let violations = []

function scanDirectory(dir, fileCallback) {
  if (!fs.existsSync(dir)) return

  const files = fs.readdirSync(dir)
  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      scanDirectory(filePath, fileCallback)
    } else if (file.endsWith('.js')) {
      fileCallback(filePath)
    }
  })
}

function checkController(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split('\n')

  lines.forEach((line, index) => {
    // Rule 1: No Repository imports in Controllers
    if (
      line.match(/import.*from.*['"].*Repository.*['"]/i) ||
      line.match(/require\(.*['"].*Repository.*['"]\)/i)
    ) {
      violations.push({
        file: filePath,
        line: index + 1,
        rule: 'Controllers must NOT import Repositories directly. Use a Service instead.',
        code: line.trim()
      })
    }

    // Rule 2: No direct Supabase client imports in Controllers
    if (
      line.match(/import.*from.*['"].*supabaseClient.*['"]/i) ||
      line.match(/require\(.*['"].*supabaseClient.*['"]\)/i)
    ) {
      violations.push({
        file: filePath,
        line: index + 1,
        rule: 'Controllers must NOT import supabaseClient directly. Use a Service or Repository.',
        code: line.trim()
      })
    }
  })
}

console.log('🔍 Starting Architecture Enforcement Scan...')

// Scan Controllers
scanDirectory(CONTROLLERS_DIR, checkController)

if (violations.length > 0) {
  console.error('❌ Architecture Violations Found:')
  violations.forEach(v => {
    console.error(`  [${path.relative(process.cwd(), v.file)}:${v.line}] ${v.rule}`)
    console.error(`    Code: ${v.code}`)
  })
  process.exit(1)
} else {
  console.log('✅ Architecture Check Passed: No violations found.')
  process.exit(0)
}
