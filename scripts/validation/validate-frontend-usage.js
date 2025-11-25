#!/usr/bin/env node

/**
 * Frontend Usage Validation Script
 *
 * Validates that frontend properly uses documented APIs and follows best practices
 * Part of Phase 2: Automated OpenAPI Documentation Validation
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class FrontendUsageValidator {
  constructor() {
    this.rootDir = path.resolve(__dirname, '../..')
    this.frontendDir = path.join(this.rootDir, 'public')
    this.errors = []
    this.warnings = []
    this.stats = {
      files: 0,
      apiCalls: 0,
      errorHandlers: 0,
      validations: 0,
      securityIssues: 0
    }
  }

  /**
   * Run complete frontend usage validation
   */
  async validate() {
    console.log('🔍 Starting Frontend Usage Validation...')

    try {
      // Scan frontend files
      await this.scanFrontendFiles()

      // Validate API usage patterns
      await this.validateApiUsagePatterns()

      // Validate error handling
      await this.validateErrorHandling()

      // Validate security practices
      await this.validateSecurityPractices()

      // Validate accessibility
      await this.validateAccessibility()

      // Validate performance
      await this.validatePerformance()

      // Generate report
      this.generateReport()

      // Return exit code based on results
      return this.errors.length === 0 ? 0 : 1

    } catch (error) {
      console.error('❌ Frontend usage validation failed:', error.message)
      this.errors.push(`Validation system error: ${error.message}`)
      return 1
    }
  }

  /**
   * Scan all frontend files
   */
  async scanFrontendFiles() {
    console.log('📁 Scanning frontend files...')

    const extensions = ['.js', '.html', '.htm', '.css']
    this.frontendFiles = this.findFiles(this.frontendDir, extensions)

    this.stats.files = this.frontendFiles.length
    console.log(`✅ Found ${this.stats.files} frontend files`)

    // Scan each file for patterns
    this.frontendFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8')
        this.analyzeFile(content, file)
      } catch (error) {
        console.warn(`Warning: Could not read file ${file}: ${error.message}`)
      }
    })
  }

  /**
   * Find files with specific extensions
   */
  findFiles(dir, extensions) {
    const files = []

    function traverse(currentDir) {
      try {
        const items = fs.readdirSync(currentDir)

        items.forEach(item => {
          const fullPath = path.join(currentDir, item)
          const stat = fs.statSync(fullPath)

          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            traverse(fullPath)
          } else if (stat.isFile()) {
            const ext = path.extname(item).toLowerCase()
            if (extensions.includes(ext)) {
              files.push(fullPath)
            }
          }
        })
      } catch (error) {
        // Skip directories that can't be read
      }
    }

    traverse(dir)
    return files
  }

  /**
   * Analyze a single file for usage patterns
   */
  analyzeFile(content, filePath) {
    const ext = path.extname(filePath).toLowerCase()

    if (ext === '.js') {
      this.analyzeJavaScript(content, filePath)
    } else if (ext === '.html' || ext === '.htm') {
      this.analyzeHTML(content, filePath)
    } else if (ext === '.css') {
      this.analyzeCSS(content, filePath)
    }
  }

  /**
   * Analyze JavaScript file
   */
  analyzeJavaScript(content, filePath) {
    // Count API calls
    const apiCallPatterns = [
      /fetch\s*\(/gi,
      /axios\./gi,
      /\$\.ajax/gi,
      /XMLHttpRequest/gi
    ]

    apiCallPatterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) {
        this.stats.apiCalls += matches.length
      }
    })

    // Count error handlers
    const errorHandlerPatterns = [
      /\.catch\s*\(/gi,
      /try\s*{[\s\S]*?}\s*catch/gi,
      /onerror/gi,
      /addEventListener\s*\(\s*['"`]error['"`]/gi
    ]

    errorHandlerPatterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) {
        this.stats.errorHandlers += matches.length
      }
    })

    // Count validations
    const validationPatterns = [
      /required/gi,
      /validate/gi,
      /check/gi,
      /test/gi
    ]

    validationPatterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) {
        this.stats.validations += matches.length
      }
    })

    // Check for security issues
    this.checkJavaScriptSecurity(content, filePath)
  }

  /**
   * Analyze HTML file
   */
  analyzeHTML(content, filePath) {
    // Check for form elements without validation
    const formsWithoutValidation = content.match(/<form[^>]*>(?!.*required|.*pattern|.*minlength|.*maxlength)[\s\S]*?<\/form>/gi)
    if (formsWithoutValidation) {
      this.warnings.push(`${filePath}: Found forms without client-side validation`)
    }

    // Check for accessibility
    this.checkHTMLAccessibility(content, filePath)

    // Check for security
    this.checkHTMLSecurity(content, filePath)
  }

  /**
   * Analyze CSS file
   */
  analyzeCSS(content, filePath) {
    // Check for performance issues
    const expensiveSelectors = content.match(/[^,]+[>+~][^,]+/g) || []
    if (expensiveSelectors.length > 10) {
      this.warnings.push(`${filePath}: Many expensive CSS selectors found (${expensiveSelectors.length})`)
    }

    // Check for !important usage
    const importantCount = (content.match(/!important/g) || []).length
    if (importantCount > 5) {
      this.warnings.push(`${filePath}: High usage of !important (${importantCount} times)`)
    }
  }

  /**
   * Check JavaScript security practices
   */
  checkJavaScriptSecurity(content, filePath) {
    // Check for innerHTML usage (potential XSS)
    const innerHTMLMatches = content.match(/\.innerHTML\s*=/gi)
    if (innerHTMLMatches) {
      this.stats.securityIssues += innerHTMLMatches.length
      this.errors.push(`${filePath}: Direct innerHTML assignment found (${innerHTMLMatches.length} times) - XSS risk`)
    }

    // Check for eval usage
    const evalMatches = content.match(/eval\s*\(/gi)
    if (evalMatches) {
      this.stats.securityIssues += evalMatches.length
      this.errors.push(`${filePath}: eval() usage found (${evalMatches.length} times) - security risk`)
    }

    // Check for console.log in production code
    const consoleLogMatches = content.match(/console\.log/gi)
    if (consoleLogMatches && consoleLogMatches.length > 5) {
      this.warnings.push(`${filePath}: Many console.log statements found (${consoleLogMatches.length})`)
    }

    // Check for hardcoded secrets
    const secretPatterns = [
      /['"`][^'"`]*api[_-]?key[^'"`]*['"`]/gi,
      /['"`][^'"`]*password[^'"`]*['"`]/gi,
      /['"`][^'"`]*secret[^'"`]*['"`]/gi
    ]

    secretPatterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) {
        this.stats.securityIssues += matches.length
        this.errors.push(`${filePath}: Potential hardcoded secrets found`)
      }
    })
  }

  /**
   * Check HTML accessibility
   */
  checkHTMLAccessibility(content, filePath) {
    // Check for alt attributes on images
    const imagesWithoutAlt = content.match(/<img(?![^>]*alt\s*=)[^>]*>/gi)
    if (imagesWithoutAlt) {
      this.warnings.push(`${filePath}: Images without alt attributes found (${imagesWithoutAlt.length})`)
    }

    // Check for form labels
    const inputsWithoutLabels = content.match(/<input(?![^>]*id\s*=)[^>]*>/gi)
    if (inputsWithoutLabels) {
      this.warnings.push(`${filePath}: Input elements without id/label associations found`)
    }

    // Check for heading structure
    const headings = content.match(/<h[1-6][^>]*>/gi) || []
    if (headings.length === 0) {
      this.warnings.push(`${filePath}: No heading elements found - poor accessibility`)
    }
  }

  /**
   * Check HTML security
   */
  checkHTMLSecurity(content, filePath) {
    // Check for inline event handlers
    const inlineHandlers = content.match(/on\w+\s*=\s*['"`][^'"`]*['"`]/gi)
    if (inlineHandlers) {
      this.warnings.push(`${filePath}: Inline event handlers found (${inlineHandlers.length}) - security risk`)
    }

    // Check for javascript: URLs
    const jsUrls = content.match(/href\s*=\s*['"`]javascript:/gi)
    if (jsUrls) {
      this.stats.securityIssues += jsUrls.length
      this.errors.push(`${filePath}: JavaScript: URLs found (${jsUrls.length}) - XSS risk`)
    }
  }

  /**
   * Validate API usage patterns
   */
  async validateApiUsagePatterns() {
    console.log('🌐 Validating API usage patterns...')

    let properApiUsage = 0
    let improperApiUsage = 0

    this.frontendFiles.forEach(file => {
      if (!file.endsWith('.js')) return

      try {
        const content = fs.readFileSync(file, 'utf8')

        // Check for proper API usage patterns
        if (content.includes('fetch(') || content.includes('axios.')) {
          // Look for proper error handling
          if (content.includes('.catch(') || content.includes('try') || content.includes('catch')) {
            properApiUsage++
          } else {
            improperApiUsage++
            this.warnings.push(`${file}: API usage without proper error handling`)
          }

          // Look for content-type headers
          if (content.includes('application/json')) {
            console.log(`✅ Proper JSON content-type in ${file}`)
          }
        }
      } catch (error) {
        console.warn(`Warning: Could not analyze ${file}: ${error.message}`)
      }
    })

    console.log(`📊 API usage: ${properApiUsage} proper, ${improperApiUsage} needs improvement`)
  }

  /**
   * Validate error handling
   */
  async validateErrorHandling() {
    console.log('⚠️ Validating error handling...')

    let filesWithErrorHandling = 0
    let filesWithApiCalls = 0

    this.frontendFiles.forEach(file => {
      if (!file.endsWith('.js')) return

      try {
        const content = fs.readFileSync(file, 'utf8')
        const hasApiCalls = content.includes('fetch(') || content.includes('axios.') || content.includes('$.ajax')
        const hasErrorHandling = content.includes('.catch(') || content.includes('try') || content.includes('catch')

        if (hasApiCalls) {
          filesWithApiCalls++
          if (hasErrorHandling) {
            filesWithErrorHandling++
          } else {
            this.warnings.push(`${file}: API calls without error handling`)
          }
        }
      } catch (error) {
        console.warn(`Warning: Could not analyze ${file}: ${error.message}`)
      }
    })

    const errorHandlingRate = filesWithApiCalls > 0 ? (filesWithErrorHandling / filesWithApiCalls * 100).toFixed(1) : 0
    console.log(`📊 Error handling rate: ${errorHandlingRate}% (${filesWithErrorHandling}/${filesWithApiCalls})`)
  }

  /**
   * Validate security practices
   */
  async validateSecurityPractices() {
    console.log('🔒 Validating security practices...')

    if (this.stats.securityIssues > 0) {
      console.log(`⚠️ Found ${this.stats.securityIssues} security issues`)
    } else {
      console.log('✅ No major security issues found')
    }
  }

  /**
   * Validate accessibility
   */
  async validateAccessibility() {
    console.log('♿ Validating accessibility...')

    let accessibilityScore = 100

    this.frontendFiles.forEach(file => {
      if (!file.endsWith('.html') && !file.endsWith('.htm')) return

      try {
        const content = fs.readFileSync(file, 'utf8')

        // Deduct points for accessibility issues
        if (content.includes('<img') && !content.includes('alt=')) {
          accessibilityScore -= 5
        }
        if (content.includes('<input') && !content.includes('<label')) {
          accessibilityScore -= 5
        }
      } catch (error) {
        console.warn(`Warning: Could not analyze ${file}: ${error.message}`)
      }
    })

    console.log(`📊 Accessibility score: ${Math.max(0, accessibilityScore)}/100`)
  }

  /**
   * Validate performance
   */
  async validatePerformance() {
    console.log('⚡ Validating performance...')

    let totalFileSize = 0
    let jsFileSize = 0
    let cssFileSize = 0

    this.frontendFiles.forEach(file => {
      try {
        const stats = fs.statSync(file)
        const size = stats.size
        totalFileSize += size

        const ext = path.extname(file).toLowerCase()
        if (ext === '.js') jsFileSize += size
        if (ext === '.css') cssFileSize += size
      } catch (error) {
        console.warn(`Warning: Could not get size for ${file}: ${error.message}`)
      }
    })

    console.log(`📊 File sizes: Total ${(totalFileSize / 1024).toFixed(1)}KB, JS ${(jsFileSize / 1024).toFixed(1)}KB, CSS ${(cssFileSize / 1024).toFixed(1)}KB`)

    if (jsFileSize > 1024 * 1024) { // 1MB
      this.warnings.push(`Large JavaScript bundle size: ${(jsFileSize / 1024).toFixed(1)}KB`)
    }

    if (cssFileSize > 500 * 1024) { // 500KB
      this.warnings.push(`Large CSS bundle size: ${(cssFileSize / 1024).toFixed(1)}KB`)
    }
  }

  /**
   * Generate validation report
   */
  generateReport() {
    console.log('\n📊 FRONTEND USAGE VALIDATION REPORT')
    console.log('===================================')

    console.log(`📁 Files analyzed: ${this.stats.files}`)
    console.log(`🌐 API calls found: ${this.stats.apiCalls}`)
    console.log(`⚠️ Error handlers: ${this.stats.errorHandlers}`)
    console.log(`✅ Validations: ${this.stats.validations}`)
    console.log(`🔒 Security issues: ${this.stats.securityIssues}`)

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n✅ All frontend usage validations passed!')
      return
    }

    if (this.errors.length > 0) {
      console.log(`\n❌ USAGE ERRORS (${this.errors.length}):`)
      this.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`)
      })
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️ USAGE WARNINGS (${this.warnings.length}):`)
      this.warnings.slice(0, 10).forEach((warning, index) => { // Limit to first 10 warnings
        console.log(`  ${index + 1}. ${warning}`)
      })
      if (this.warnings.length > 10) {
        console.log(`  ... and ${this.warnings.length - 10} more warnings`)
      }
    }

    const score = Math.max(0, 100 - (this.errors.length * 10) - (this.warnings.length * 2))
    console.log(`\n📈 Frontend usage score: ${score}/100`)
    console.log(`Summary: ${this.errors.length} errors, ${this.warnings.length} warnings`)
  }
}

// Run validation
const validator = new FrontendUsageValidator()
validator.validate()
  .then(exitCode => {
    process.exit(exitCode)
  })
  .catch(error => {
    console.error('Frontend usage validation failed:', error)
    process.exit(1)
  })