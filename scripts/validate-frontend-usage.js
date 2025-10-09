#!/usr/bin/env node

/**
 * Frontend API Client Usage Validator
 * Validates that frontend code uses api-client correctly and detects:
 * - Invalid method references (methods that don't exist in api-client)
 * - Hardcoded API URLs
 * - Direct fetch/axios calls to API endpoints
 * - Usage of legacy api.js references
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Extract all available methods from api-client.js
 */
async function extractAvailableMethods() {
  try {
    const clientPath = path.join(__dirname, '../public/js/shared/api-client.js')
    const content = await fs.readFile(clientPath, 'utf-8')

    const methods = new Set()

    // Extract from convenience exports: api = { method: ... }
    const apiExportMatch = content.match(/export const api = \{([^}]+)\}/s)
    if (apiExportMatch) {
      const apiExportContent = apiExportMatch[1]
      const methodMatches = apiExportContent.matchAll(/(\w+):/g)
      for (const match of methodMatches) {
        methods.add(match[1])
      }
    }

    // Extract from class methods: async methodName(
    const classMethodMatches = content.matchAll(/async\s+(\w+)\s*\(/g)
    for (const match of classMethodMatches) {
      if (match[1] !== 'request') {
        methods.add(match[1])
      }
    }

    return Array.from(methods).sort()
  } catch (error) {
    console.error('Failed to extract methods from api-client:', error)
    return []
  }
}

/**
 * Scan frontend files for API usage
 */
async function scanFrontendFiles() {
  const publicDir = path.join(__dirname, '../public')
  const files = []

  async function scanDir(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        // Skip node_modules, vendor files, etc.
        if (!['node_modules', '.git', 'assets', 'images'].includes(entry.name)) {
          await scanDir(fullPath)
        }
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        // Skip excluded files
        if (
          !entry.name.includes('.test.') &&
          !entry.name.includes('.min.') &&
          !entry.name.includes('lucide-icons') &&
          !entry.name.includes('chart.') &&
          entry.name !== 'api-client.js' &&
          entry.name !== 'api-types.js'
        ) {
          files.push(fullPath)
        }
      }
    }
  }

  await scanDir(publicDir)
  return files
}

/**
 * Validate a single file
 */
async function validateFile(filePath, availableMethods) {
  const content = await fs.readFile(filePath, 'utf-8')
  const relativePath = path.relative(process.cwd(), filePath)
  const issues = []

  // Check 1: Detect api.method() calls
  const apiCallPattern = /\bapi\.(\w+)\s*\(/g
  let match
  while ((match = apiCallPattern.exec(content)) !== null) {
    const methodName = match[1]
    const lineNumber = content.substring(0, match.index).split('\n').length

    if (!availableMethods.includes(methodName)) {
      issues.push({
        type: 'invalid_method',
        severity: 'error',
        file: relativePath,
        line: lineNumber,
        method: methodName,
        message: `Method 'api.${methodName}()' does not exist in api-client`
      })
    }
  }

  // Check 2: Detect apiClient.method() calls
  const apiClientCallPattern = /\bapiClient\.(\w+)\s*\(/g
  while ((match = apiClientCallPattern.exec(content)) !== null) {
    const methodName = match[1]
    const lineNumber = content.substring(0, match.index).split('\n').length

    if (!availableMethods.includes(methodName)) {
      issues.push({
        type: 'invalid_method',
        severity: 'error',
        file: relativePath,
        line: lineNumber,
        method: methodName,
        message: `Method 'apiClient.${methodName}()' does not exist in api-client`
      })
    }
  }

  // Check 3: Detect hardcoded API URLs
  const hardcodedUrlPattern = /['"`](\/api\/[^'"`]+)['"`]/g
  while ((match = hardcodedUrlPattern.exec(content)) !== null) {
    const url = match[1]
    const lineNumber = content.substring(0, match.index).split('\n').length

    // Skip if it's in a comment or JSDoc
    const lineStart = content.lastIndexOf('\n', match.index) + 1
    const lineContent = content.substring(lineStart, match.index + match[0].length)
    if (lineContent.trim().startsWith('//') || lineContent.trim().startsWith('*')) {
      continue
    }

    // Skip if it's in the endpoint constant inside api-client itself
    if (content.substring(Math.max(0, match.index - 30), match.index).includes('endpoint =')) {
      continue
    }

    issues.push({
      type: 'hardcoded_url',
      severity: 'warning',
      file: relativePath,
      line: lineNumber,
      url: url,
      message: `Hardcoded API URL found: '${url}' - Use api-client instead`
    })
  }

  // Check 4: Detect direct fetch calls to /api/
  const fetchApiPattern = /fetch\s*\(\s*['"`][^'"`]*\/api\/[^'"`]*['"`]/g
  while ((match = fetchApiPattern.exec(content)) !== null) {
    const lineNumber = content.substring(0, match.index).split('\n').length

    issues.push({
      type: 'direct_fetch',
      severity: 'error',
      file: relativePath,
      line: lineNumber,
      message: 'Direct fetch() call to /api/ endpoint - Use api-client instead'
    })
  }

  // Check 5: Detect legacy api.js imports
  const legacyImportPattern = /from\s+['"].*\/api\.js['"]/g
  while ((match = legacyImportPattern.exec(content)) !== null) {
    const lineNumber = content.substring(0, match.index).split('\n').length

    issues.push({
      type: 'legacy_import',
      severity: 'error',
      file: relativePath,
      line: lineNumber,
      message: "Legacy import from 'api.js' - Update to 'api-client.js'"
    })
  }

  return issues
}

/**
 * Main validation function
 */
async function validateFrontendUsage() {
  try {
    console.log('🔍 Validating frontend API client usage...\n')

    // Step 1: Extract available methods
    console.log('📋 Step 1: Extracting available methods from api-client...')
    const availableMethods = await extractAvailableMethods()
    console.log(`✅ Found ${availableMethods.length} available methods\n`)

    // Step 2: Scan frontend files
    console.log('📂 Step 2: Scanning frontend files...')
    const files = await scanFrontendFiles()
    console.log(`✅ Found ${files.length} files to validate\n`)

    // Step 3: Validate each file
    console.log('🔍 Step 3: Validating files...')
    let allIssues = []
    for (const file of files) {
      const issues = await validateFile(file, availableMethods)
      allIssues = allIssues.concat(issues)
    }

    // Group issues by type
    const errors = allIssues.filter(i => i.severity === 'error')
    const warnings = allIssues.filter(i => i.severity === 'warning')

    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      valid: errors.length === 0,
      summary: {
        filesScanned: files.length,
        availableMethods: availableMethods.length,
        totalIssues: allIssues.length,
        errors: errors.length,
        warnings: warnings.length
      },
      issues: allIssues,
      availableMethods: availableMethods
    }

    // Save report
    const reportPath = path.join(__dirname, '../api/docs/frontend-usage-report.json')
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n📊 Report saved to: ${reportPath}`)

    // Print summary
    console.log('\n' + '='.repeat(80))
    console.log('📊 Validation Summary')
    console.log('='.repeat(80))
    console.log(`Files scanned: ${files.length}`)
    console.log(`Available methods: ${availableMethods.length}`)
    console.log(`Total issues: ${allIssues.length}`)
    console.log(`  Errors: ${errors.length}`)
    console.log(`  Warnings: ${warnings.length}`)

    // Print issues by category
    if (allIssues.length > 0) {
      console.log('\n' + '='.repeat(80))
      console.log('🔍 Issues Found')
      console.log('='.repeat(80))

      const issuesByType = {}
      for (const issue of allIssues) {
        if (!issuesByType[issue.type]) {
          issuesByType[issue.type] = []
        }
        issuesByType[issue.type].push(issue)
      }

      for (const [type, issues] of Object.entries(issuesByType)) {
        console.log(`\n${type.toUpperCase()} (${issues.length} issues):`)
        for (const issue of issues.slice(0, 10)) {
          // Show first 10
          console.log(`  ${issue.severity === 'error' ? '❌' : '⚠️ '} ${issue.file}:${issue.line}`)
          console.log(`     ${issue.message}`)
        }
        if (issues.length > 10) {
          console.log(`  ... and ${issues.length - 10} more`)
        }
      }
    }

    console.log('\n' + '='.repeat(80))

    if (errors.length === 0 && warnings.length === 0) {
      console.log('✅ All frontend files use api-client correctly!')
      console.log('='.repeat(80))
      process.exit(0)
    } else if (errors.length === 0) {
      console.log(`⚠️  Frontend validation completed with ${warnings.length} warnings`)
      console.log('='.repeat(80))
      process.exit(0)
    } else {
      console.log(`❌ Frontend validation failed with ${errors.length} errors`)
      console.log('='.repeat(80))
      console.log('\n💡 Recommendations:')
      console.log('  1. Fix invalid method references')
      console.log('  2. Replace hardcoded URLs with api-client methods')
      console.log('  3. Replace direct fetch() calls with api-client methods')
      console.log('  4. Update legacy api.js imports to api-client.js')
      console.log('\n📖 See report for details: api/docs/frontend-usage-report.json\n')
      process.exit(1)
    }
  } catch (error) {
    console.error('\n💥 Validation failed:', error)
    process.exit(1)
  }
}

// Run validation
validateFrontendUsage()
