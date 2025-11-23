#!/usr/bin/env node
// @ts-nocheck
/**
 * Automated Refactoring Validation Script
 * Validates all modular files for syntax, ESLint compliance, and functionality
 *
 * Usage:
 *   node validate-refactoring.js                    (validate all)
 *   node validate-refactoring.js --syntax           (syntax check only)
 *   node validate-refactoring.js --eslint           (ESLint only)
 *   node validate-refactoring.js --exports          (export check only)
 *   node validate-refactoring.js <service-name>     (validate specific service)
 */

import { execSync } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
// import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.join(__dirname, '../../..')

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

const ICONS = {
  success: '✓',
  error: '✗',
  warning: '⚠',
  info: 'ℹ'
}

/**
 * Validate syntax of all modular files
 */
async function validateSyntax() {
  console.log(`${COLORS.cyan}🔍 Validating syntax of all modular files...${COLORS.reset}\n`)

  const modularFiles = await findModularFiles()
  let allValid = true

  for (const file of modularFiles) {
    try {
      execSync(`node -c "${file.path}"`, { stdio: 'pipe' })
      console.log(`${COLORS.green}${ICONS.success}${COLORS.reset} ${file.name}`)
    } catch (error) {
      console.error('Error:', error)
      console.log(`${COLORS.red}${ICONS.error}${COLORS.reset} ${file.name} - Syntax error`)
      allValid = false
    }
  }

  console.log(
    `\n${allValid ? COLORS.green : COLORS.red}${allValid ? 'All files passed syntax check' : 'Some files have syntax errors'}${COLORS.reset}\n`
  )
  return allValid
}

/**
 * Run ESLint on all modular files
 */
async function validateESLint() {
  console.log(`${COLORS.cyan}🔍 Running ESLint on all modular files...${COLORS.reset}\n`)

  const modularFiles = await findModularFiles()
  const fileList = modularFiles.map(f => f.path).join(' ')

  try {
    execSync(`npx eslint ${fileList} --format=compact`, {
      encoding: 'utf-8',
      stdio: 'pipe'
    })
    console.log(`${COLORS.green}${ICONS.success}${COLORS.reset} No ESLint errors found\n`)
    return true
  } catch (error) {
    const lines = error.stdout.split('\n').filter(l => l.trim())
    console.log(`${COLORS.red}${ICONS.error}${COLORS.reset} ESLint errors found:\n`)
    lines.forEach(line => console.log(line))
    console.log()
    return false
  }
}

/**
 * Validate barrel exports
 */
async function validateExports() {
  console.log(`${COLORS.cyan}🔍 Validating barrel exports...${COLORS.reset}\n`)

  const services = await findModularizedServices()

  for (const service of services) {
    console.log(`📦 ${service.name}:`)

    try {
      // Test import
      const testCode = `
        import * as module from '${service.path}'
        const exports = Object.keys(module)
        console.log(exports.length)
      `

      const output = execSync(`node -e "${testCode}"`, {
        encoding: 'utf-8',
        cwd: ROOT_DIR
      })

      const exportCount = parseInt(output.trim())
      console.log(`   ${COLORS.green}${ICONS.success}${COLORS.reset} ${exportCount} exports`)

      if (exportCount === 0) {
        console.log(`   ${COLORS.yellow}${ICONS.warning}${COLORS.reset} No exports found`)
      }
    } catch (error) {
      console.error('Error:', error)
      console.log(`   ${COLORS.red}${ICONS.error}${COLORS.reset} Export validation failed`)
    }
  }

  console.log()
}

/**
 * Generate validation report
 */
async function generateReport() {
  console.log(`${COLORS.cyan}📊 Generating validation report...${COLORS.reset}\n`)

  const services = await findModularizedServices()
  const stats = {
    totalServices: services.length,
    totalModularFiles: 0,
    totalLines: 0,
    originalLines: 0
  }

  for (const service of services) {
    const files = await fs.readdir(service.dir)
    const modularFiles = files.filter(f => f.startsWith(service.name) && f.includes('.'))

    stats.totalModularFiles += modularFiles.length

    for (const file of modularFiles) {
      const filePath = path.join(service.dir, file)
      const content = await fs.readFile(filePath, 'utf-8')
      const lines = content.split('\n').length
      stats.totalLines += lines
    }

    // Try to find original file
    const originalPath = path.join(service.dir, `${service.name}.js`)
    try {
      const originalContent = await fs.readFile(originalPath, 'utf-8')
      stats.originalLines += originalContent.split('\n').length
    } catch (error) {
      // Original file might not exist if already replaced
      void error // Silence unused variable warning
    }
  }

  console.log('📈 Refactoring Statistics:')
  console.log(`   Services modularized: ${stats.totalServices}`)
  console.log(`   Modular files created: ${stats.totalModularFiles}`)
  console.log(`   Total lines (modular): ${stats.totalLines}`)
  console.log(`   Total lines (original): ${stats.originalLines}`)
  console.log(
    `   Lines per modular file: ${Math.round(stats.totalLines / stats.totalModularFiles)}`
  )
  console.log()
}

/**
 * Find all modular files
 */
async function findModularFiles() {
  const servicesDir = path.join(ROOT_DIR, 'api/services')
  const files = []

  const entries = await fs.readdir(servicesDir)

  for (const entry of entries) {
    if (!entry.endsWith('.js')) {
      continue
    }
    if (!entry.includes('.')) {
      continue
    } // Skip files without dots (original files)

    files.push({
      name: entry,
      path: path.join(servicesDir, entry)
    })
  }

  return files
}

/**
 * Find all modularized services
 */
async function findModularizedServices() {
  const servicesDir = path.join(ROOT_DIR, 'api/services')
  const entries = await fs.readdir(servicesDir)

  const services = new Map()

  for (const entry of entries) {
    if (!entry.endsWith('.js')) {
      continue
    }

    const parts = entry.split('.')
    if (parts.length >= 3) {
      const serviceName = parts[0]
      if (!services.has(serviceName)) {
        services.set(serviceName, {
          name: serviceName,
          dir: servicesDir,
          path: path.join(servicesDir, entry)
        })
      }
    }
  }

  return Array.from(services.values())
}

/**
 * Run comprehensive validation
 */
async function runComprehensiveValidation() {
  console.log(`${COLORS.cyan}╔══════════════════════════════════════════════╗${COLORS.reset}`)
  console.log(`${COLORS.cyan}║   COMPREHENSIVE REFACTORING VALIDATION       ║${COLORS.reset}`)
  console.log(`${COLORS.cyan}╚══════════════════════════════════════════════╝${COLORS.reset}\n`)

  const results = {
    syntax: false,
    eslint: false,
    exports: false
  }

  results.syntax = await validateSyntax()
  results.eslint = await validateESLint()
  results.exports = await validateExports()

  await generateReport()

  console.log(`${COLORS.cyan}╔══════════════════════════════════════════════╗${COLORS.reset}`)
  console.log(`${COLORS.cyan}║              VALIDATION SUMMARY              ║${COLORS.reset}`)
  console.log(`${COLORS.cyan}╚══════════════════════════════════════════════╝${COLORS.reset}\n`)

  console.log(
    `Syntax Check:  ${results.syntax ? COLORS.green : COLORS.red}${results.syntax ? ICONS.success : ICONS.error}${COLORS.reset}`
  )
  console.log(
    `ESLint Check:  ${results.eslint ? COLORS.green : COLORS.red}${results.eslint ? ICONS.success : ICONS.error}${COLORS.reset}`
  )
  console.log(
    `Export Check:  ${results.exports ? COLORS.green : COLORS.red}${results.exports ? ICONS.success : ICONS.error}${COLORS.reset}`
  )

  const allPassed = results.syntax && results.eslint && results.exports

  console.log(
    `\n${allPassed ? COLORS.green : COLORS.red}${allPassed ? '✅ All validations passed!' : '❌ Some validations failed'}${COLORS.reset}\n`
  )

  return allPassed ? 0 : 1
}

// Main CLI handler
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    const exitCode = await runComprehensiveValidation()
    process.exit(exitCode)
  }

  if (args[0] === '--syntax') {
    await validateSyntax()
  } else if (args[0] === '--eslint') {
    await validateESLint()
  } else if (args[0] === '--exports') {
    await validateExports()
  } else if (args[0] === '--report') {
    await generateReport()
  } else {
    console.log('Usage:')
    console.log('  node validate-refactoring.js                    (comprehensive validation)')
    console.log('  node validate-refactoring.js --syntax           (syntax check only)')
    console.log('  node validate-refactoring.js --eslint           (ESLint only)')
    console.log('  node validate-refactoring.js --exports          (export check only)')
    console.log('  node validate-refactoring.js --report           (generate report only)')
  }
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
