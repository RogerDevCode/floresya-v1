#!/usr/bin/env node
// @ts-nocheck

/**
 * Frontend Contract Validator
 * Validates that frontend code uses the generated API client
 * Prevents direct fetch calls and ensures contract compliance
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Validate frontend contract compliance
 */
async function validateFrontendContract() {
  try {
    console.log('🔍 Validating frontend contract compliance...')

    const issues = []
    const warnings = []

    // Check if API client exists
    const apiClientPath = path.resolve(__dirname, '../../public/js/shared/api-client.js')

    try {
      await fs.access(apiClientPath)
      console.log('✅ Generated API client found')
    } catch (error) {
      console.error('Error:', error)
      throw new Error('Generated API client not found. Run: npm run generate:client')
    }

    // Get all frontend JavaScript files
    const frontendFiles = await getFrontendFiles()

    // Check each file for contract violations
    for (const file of frontendFiles) {
      const content = await fs.readFile(file, 'utf8')
      const fileIssues = await analyzeFileForContractViolations(file, content)
      issues.push(...fileIssues)
    }

    // Report results
    if (issues.length > 0) {
      console.error('\n❌ Frontend Contract Violations Found:')
      issues.forEach((issue, index) => {
        console.error(`${index + 1}. ${issue.file}:${issue.line} - ${issue.message}`)
        if (issue.code) {
          console.error(`   Code: ${issue.code}`)
        }
      })
    }

    if (warnings.length > 0) {
      console.warn('\n⚠️  Frontend Contract Warnings:')
      warnings.forEach((warning, index) => {
        console.warn(`${index + 1}. ${warning.file}:${warning.line} - ${warning.message}`)
      })
    }

    if (issues.length === 0) {
      console.log('✅ Frontend contract compliance validated successfully!')
    }

    return {
      valid: issues.length === 0,
      issues,
      warnings,
      filesChecked: frontendFiles.length
    }
  } catch (error) {
    console.error('❌ Frontend contract validation failed:', error.message)
    throw error
  }
}

/**
 * Get all frontend JavaScript files
 */
async function getFrontendFiles() {
  const frontendDir = path.resolve(__dirname, '../../public')
  const files = []

  async function scanDirectory(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        await scanDirectory(fullPath)
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        files.push(fullPath)
      }
    }
  }

  await scanDirectory(frontendDir)
  return files
}

/**
 * Analyze file for contract violations
 */
function analyzeFileForContractViolations(filePath, content) {
  const issues = []
  const lines = content.split('\n')

  // Define exclusions to avoid false positives
  const EXCLUDED_FILES = [
    'chart.min.js',
    '',
    '.test.js',
    '__tests__',
    'shared/api.js', // Legacy API client (allowed until full migration)
    'sw.js' // Service workers have different requirements and can use self.fetch()
  ]
  const isExcludedFile = EXCLUDED_FILES.some(pattern => filePath.includes(pattern))

  // Skip excluded files entirely
  if (isExcludedFile) {
    return issues
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNumber = i + 1
    const trimmedLine = line.trim()

    // Skip comments
    if (trimmedLine.startsWith('//') || trimmedLine.startsWith('*')) {
      continue
    }

    // Check for direct fetch calls (PROHIBITED)
    if (line.includes('fetch(') && !trimmedLine.startsWith('//')) {
      // Allow fetch only in api-client.js
      if (!filePath.includes('api-client.js')) {
        issues.push({
          file: path.relative(process.cwd(), filePath),
          line: lineNumber,
          message: 'Direct fetch() calls are prohibited. Use the generated API client instead.',
          code: trimmedLine,
          severity: 'error',
          type: 'direct-fetch'
        })
      }
    }

    // Check for XMLHttpRequest (PROHIBITED)
    if (line.includes('XMLHttpRequest') && !trimmedLine.startsWith('//')) {
      issues.push({
        file: path.relative(process.cwd(), filePath),
        line: lineNumber,
        message: 'XMLHttpRequest is prohibited. Use the generated API client instead.',
        code: trimmedLine,
        severity: 'error',
        type: 'xmlhttprequest'
      })
    }

    // Check for axios (PROHIBITED)
    if (line.includes('axios') && !trimmedLine.startsWith('//')) {
      issues.push({
        file: path.relative(process.cwd(), filePath),
        line: lineNumber,
        message: 'External HTTP libraries are prohibited. Use the generated API client instead.',
        code: trimmedLine,
        severity: 'error',
        type: 'external-library'
      })
    }

    // Check for missing API client imports
    if (line.includes('import') && line.includes('api') && !line.includes('api-client')) {
      // Check if it's importing from shared/api.js (old pattern)
      if (line.includes('./shared/api.js') || line.includes('../shared/api.js')) {
        issues.push({
          file: path.relative(process.cwd(), filePath),
          line: lineNumber,
          message:
            'Importing from old api.js is deprecated. Use the generated api-client.js instead.',
          code: trimmedLine,
          severity: 'warning',
          type: 'deprecated-import'
        })
      }
    }

    // Check for hardcoded API URLs (FIXED: exclude false positives)
    if (line.includes('http://') || line.includes('https://')) {
      // Skip if file is excluded (vendor, tests, etc)
      if (isExcludedFile) {
        continue
      }

      // Skip SVG xmlns declarations
      const isSVGNamespace = line.includes('xmlns="http://www.w3.org')

      // Skip allowed files and patterns
      const isAllowedFile =
        filePath.includes('api-client.js') ||
        filePath.includes('api-types.js') ||
        filePath.includes('API_USAGE.md') ||
        filePath.includes('MIGRATION_GUIDE.md') ||
        filePath.includes('README.md')

      // Skip allowed URLs
      const isAllowedURL =
        line.includes('localhost:3000/api-docs') ||
        line.includes('example.com') ||
        line.includes('floresya.vercel.app') ||
        line.includes('supabase.co')

      if (!isSVGNamespace && !isAllowedFile && !isAllowedURL) {
        // Only flag if it's an actual API URL pattern
        if (line.includes('/api/')) {
          issues.push({
            file: path.relative(process.cwd(), filePath),
            line: lineNumber,
            message: 'Hardcoded API URLs are prohibited. Use the generated API client instead.',
            code: trimmedLine,
            severity: 'error',
            type: 'hardcoded-url'
          })
        }
      }
    }

    // Check for direct API calls without using the client (FIXED: more precise detection)
    if (line.includes('/api/') && !trimmedLine.startsWith('//')) {
      // Skip excluded files
      if (isExcludedFile) {
        continue
      }

      // Skip if it's part of api-client.js or uses api. prefix
      if (
        !filePath.includes('api-client.js') &&
        !line.includes('api.') &&
        !line.includes('apiClient.')
      ) {
        // Skip if it's in a comment, markdown, or documentation
        const isDocumentation =
          filePath.includes('.md') ||
          filePath.includes('API_USAGE') ||
          filePath.includes('MIGRATION') ||
          trimmedLine.startsWith('*') ||
          trimmedLine.includes('Example:') ||
          trimmedLine.includes('endpoint =')

        if (!isDocumentation) {
          issues.push({
            file: path.relative(process.cwd(), filePath),
            line: lineNumber,
            message:
              'Direct API path references are prohibited. Use the generated API client methods.',
            code: trimmedLine,
            severity: 'error',
            type: 'direct-api-path'
          })
        }
      }
    }
  }

  return issues
}

/**
 * Generate contract compliance report
 */
async function generateComplianceReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      filesChecked: results.filesChecked,
      violations: results.issues.filter(i => i.severity === 'error').length,
      warnings: results.warnings.length,
      compliance: results.valid ? 'COMPLIANT' : 'NON_COMPLIANT'
    },
    violations: results.issues,
    warnings: results.warnings,
    recommendations: generateRecommendations(results)
  }

  const reportPath = path.join(__dirname, '../frontend-contract-report.json')
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2))

  console.log(`📊 Contract compliance report saved to: ${reportPath}`)

  return report
}

/**
 * Generate recommendations based on violations
 */
function generateRecommendations(results) {
  const recommendations = []

  const violationTypes = results.issues.reduce((acc, issue) => {
    acc[issue.type] = (acc[issue.type] || 0) + 1
    return acc
  }, {})

  if (violationTypes['direct-fetch']) {
    recommendations.push({
      type: 'CRITICAL',
      message: 'Replace all direct fetch() calls with api.clientName() methods',
      example: 'Replace: fetch("/api/products") with: api.getProducts()'
    })
  }

  if (violationTypes['deprecated-import']) {
    recommendations.push({
      type: 'IMPROVEMENT',
      message: 'Update imports to use the generated API client',
      example:
        'Replace: import { api } from "./shared/api.js" with: import { api } from "./shared/api-client.js"'
    })
  }

  if (violationTypes['hardcoded-url']) {
    recommendations.push({
      type: 'CRITICAL',
      message: 'Remove all hardcoded API URLs and use the API client instead',
      example: 'Remove hardcoded URLs and use api.getProducts() etc.'
    })
  }

  if (results.issues.length === 0) {
    recommendations.push({
      type: 'SUCCESS',
      message: 'Frontend is fully compliant with API contract!'
    })
  }

  return recommendations
}

/**
 * Main execution function
 */
async function main() {
  try {
    const results = await validateFrontendContract()
    const report = await generateComplianceReport(results)

    // Exit with appropriate code
    if (results.valid) {
      console.log('\n🎯 Frontend contract validation completed successfully!')
      process.exit(0)
    } else {
      console.error('\n❌ Frontend contract validation completed with violations')
      console.log('\n💡 Recommendations:')
      report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. [${rec.type}] ${rec.message}`)
        if (rec.example) {
          console.log(`   Example: ${rec.example}`)
        }
      })
      process.exit(1)
    }
  } catch (error) {
    console.error('\n💥 Frontend contract validation failed:', error.message)
    process.exit(1)
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { validateFrontendContract, generateComplianceReport }
