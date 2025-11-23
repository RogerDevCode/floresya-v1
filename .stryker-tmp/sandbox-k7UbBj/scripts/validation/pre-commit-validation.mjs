#!/usr/bin/env node
// @ts-nocheck

/**
 * Pre-commit Validation Script
 * Runs broken link detection before commits
 * Can be integrated with Git hooks
 */

import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class PreCommitValidator {
  constructor() {
    this.projectRoot = path.join(__dirname, '..', '..')
    this.errors = []
    this.warnings = []
  }

  /**
   * Run a command and return result
   */
  runCommand(command, description) {
    try {
      console.log(`🔍 Running: ${description}...`)
      const result = execSync(command, {
        cwd: this.projectRoot,
        encoding: 'utf-8',
        stdio: 'pipe'
      })
      return { success: true, output: result }
    } catch (error) {
      return {
        success: false,
        output: error.stdout || error.message,
        exitCode: error.status
      }
    }
  }

  /**
   * Check if there are staged JavaScript files
   */
  hasStagedChanges() {
    try {
      const result = execSync('git diff --cached --name-only --diff-filter=ACM | grep -E "\\.(js|mjs)$"', {
        cwd: this.projectRoot,
        encoding: 'utf-8'
      }).trim()

      return result.length > 0
    } catch {
      return false
    }
  }

  /**
   * Run JavaScript syntax validation
   */
  validateJSSyntax() {
    const files = [
      'public/index.js',
      'public/pages/product-detail.js'
    ]

    files.forEach(file => {
      const result = this.runCommand(`node -c ${file}`, `Syntax check for ${file}`)
      if (!result.success) {
        this.errors.push(`❌ Syntax error in ${file}: ${result.output}`)
      } else {
        console.log(`✅ Syntax OK: ${file}`)
      }
    })
  }

  /**
   * Run broken link detection
   */
  validateBrokenLinks() {
    const detectorPath = path.join(__dirname, 'detect-broken-links-improved.mjs')
    const result = this.runCommand(`node ${detectorPath}`, 'Broken link detection')

    if (!result.success && result.exitCode === 1) {
      if (result.output.includes('critical')) {
        this.errors.push('❌ Critical broken links found:\n' + result.output)
      } else {
        this.warnings.push('⚠️ Minor broken links found (non-blocking):\n' + result.output)
      }
    } else {
      console.log('✅ No broken links detected')
    }
  }

  /**
   * Run frontend API client validation
   */
  validateAPIClientUsage() {
    const result = this.runCommand('node scripts/validation/validate-frontend-usage.js', 'API client usage validation')

    if (!result.success) {
      this.errors.push('❌ Frontend API client validation failed:\n' + result.output)
    } else if (result.output.includes('Total issues: 0')) {
      console.log('✅ API client usage validation passed')
    } else {
      this.warnings.push('⚠️ API client usage has minor issues:\n' + result.output)
    }
  }

  /**
   * Generate final report
   */
  generateReport() {
    console.log('\n' + '='.repeat(80))
    console.log('🚀 PRE-COMMIT VALIDATION REPORT')
    console.log('='.repeat(80))

    console.log(`\n📊 Summary:`)
    console.log(`   Errors: ${this.errors.length}`)
    console.log(`   Warnings: ${this.warnings.length}`)

    if (this.errors.length > 0) {
      console.log('\n❌ BLOCKING ERRORS (Must be fixed before commit):')
      this.errors.forEach((error, index) => {
        console.log(`\n${index + 1}. ${error}`)
      })
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS (Recommended to fix):')
      this.warnings.forEach((warning, index) => {
        console.log(`\n${index + 1}. ${warning}`)
      })
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n✅ All validations passed! Ready to commit.')
    } else if (this.errors.length === 0) {
      console.log('\n⚠️ Ready to commit, but consider fixing warnings.')
    } else {
      console.log('\n🚫 Cannot commit with blocking errors. Please fix the issues above.')
    }

    return this.errors.length === 0
  }

  /**
   * Run all validations
   */
  run(skipStagedCheck = false) {
    console.log('🔒 Starting pre-commit validation...')
    console.log(`📂 Project root: ${this.projectRoot}`)

    // Check if we should run (only if there are staged changes, unless forced)
    if (!skipStagedCheck && !this.hasStagedChanges()) {
      console.log('ℹ️ No staged JavaScript changes, skipping validation.')
      return true
    }

    // Run validations
    this.validateJSSyntax()
    this.validateBrokenLinks()
    this.validateAPIClientUsage()

    // Generate and return report
    return this.generateReport()
  }
}

// Run the validator
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new PreCommitValidator()
  const success = validator.run()
  process.exit(success ? 0 : 1)
}

export default PreCommitValidator