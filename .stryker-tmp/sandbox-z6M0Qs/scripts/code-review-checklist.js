#!/usr/bin/env node
// @ts-nocheck

/**
 * Automated Code Review Checklist Generator
 * Generates comprehensive quality metrics and checklists for code reviews
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

class CodeReviewChecklist {
  constructor() {
    this.checklist = {
      codeQuality: [],
      security: [],
      performance: [],
      testing: [],
      documentation: [],
      architecture: []
    }
    this.metrics = {}
  }

  async run() {
    console.log('🔍 Generating Code Review Checklist...\n')

    try {
      await this.checkCodeQuality()
      await this.checkSecurity()
      await this.checkPerformance()
      await this.checkTesting()
      await this.checkDocumentation()
      await this.checkArchitecture()

      this.generateReport()
      this.saveReport()
    } catch (error) {
      console.error('❌ Error generating checklist:', error.message)
      process.exit(1)
    }
  }

  async checkCodeQuality() {
    console.log('📏 Checking code quality...')

    // ESLint check
    try {
      const eslintOutput = execSync('npm run lint --silent', { encoding: 'utf8' })
      this.checklist.codeQuality.push({
        item: 'ESLint violations',
        status: eslintOutput.includes('error') ? '❌' : '✅',
        details: eslintOutput.split('\n').slice(0, 5).join('\n')
      })
    } catch {
      this.checklist.codeQuality.push({
        item: 'ESLint violations',
        status: '❌',
        details: 'ESLint check failed'
      })
    }

    // Prettier check
    try {
      execSync('npm run format:check --silent')
      this.checklist.codeQuality.push({
        item: 'Code formatting (Prettier)',
        status: '✅',
        details: 'All files properly formatted'
      })
    } catch {
      this.checklist.codeQuality.push({
        item: 'Code formatting (Prettier)',
        status: '❌',
        details: 'Some files need formatting'
      })
    }

    // Code complexity (basic check using file sizes and function counts)
    const jsFiles = this.getJSFiles()
    const avgFileSize =
      jsFiles.reduce((sum, file) => sum + fs.statSync(file).size, 0) / jsFiles.length
    this.checklist.codeQuality.push({
      item: 'File size complexity',
      status: avgFileSize > 50000 ? '⚠️' : '✅',
      details: `Average file size: ${(avgFileSize / 1024).toFixed(1)}KB`
    })
  }

  async checkSecurity() {
    console.log('🔒 Checking security...')

    // NPM audit
    try {
      const auditResult = JSON.parse(execSync('npm audit --json', { encoding: 'utf8' }))
      const vulnerabilities = auditResult.metadata?.vulnerabilities || {}
      const totalVulns = Object.values(vulnerabilities).reduce((sum, count) => sum + count, 0)

      this.checklist.security.push({
        item: 'Security vulnerabilities',
        status: totalVulns > 0 ? '❌' : '✅',
        details: `Total vulnerabilities: ${totalVulns} (${vulnerabilities.critical || 0} critical, ${vulnerabilities.high || 0} high)`
      })
    } catch {
      this.checklist.security.push({
        item: 'Security vulnerabilities',
        status: '⚠️',
        details: 'Could not check vulnerabilities'
      })
    }

    // Check for hardcoded secrets (basic pattern matching)
    const secretPatterns = [
      /password\s*[:=]\s*['"][^'"]*['"]/i,
      /secret\s*[:=]\s*['"][^'"]*['"]/i,
      /api[_-]?key\s*[:=]\s*['"][^'"]*['"]/i
    ]

    let secretIssues = 0
    const jsFiles = this.getJSFiles()

    for (const file of jsFiles) {
      const content = fs.readFileSync(file, 'utf8')
      for (const pattern of secretPatterns) {
        if (pattern.test(content)) {
          secretIssues++
          break
        }
      }
    }

    this.checklist.security.push({
      item: 'Hardcoded secrets detection',
      status: secretIssues > 0 ? '❌' : '✅',
      details:
        secretIssues > 0
          ? `${secretIssues} files may contain hardcoded secrets`
          : 'No hardcoded secrets detected'
    })
  }

  async checkPerformance() {
    console.log('⚡ Checking performance...')

    // Check for console.log statements in production code
    const jsFiles = this.getJSFiles()
    let consoleLogs = 0

    for (const file of jsFiles) {
      if (!file.includes('test') && !file.includes('__tests__')) {
        const content = fs.readFileSync(file, 'utf8')
        const matches = content.match(/console\.(log|warn|error|debug)/g)
        consoleLogs += matches ? matches.length : 0
      }
    }

    this.checklist.performance.push({
      item: 'Console statements in production',
      status: consoleLogs > 0 ? '⚠️' : '✅',
      details: `${consoleLogs} console statements found in production code`
    })

    // Check bundle size (if build exists)
    try {
      const stats = fs.statSync('public/css/tailwind.css')
      this.checklist.performance.push({
        item: 'CSS bundle size',
        status: stats.size > 100000 ? '⚠️' : '✅',
        details: `CSS bundle: ${(stats.size / 1024).toFixed(1)}KB`
      })
    } catch {
      this.checklist.performance.push({
        item: 'CSS bundle size',
        status: '⚠️',
        details: 'Could not check bundle size'
      })
    }
  }

  async checkTesting() {
    console.log('🧪 Checking testing...')

    // Check test coverage
    try {
      execSync('npm run test:coverage --silent')
      const coveragePath = 'coverage/coverage-summary.json'

      if (fs.existsSync(coveragePath)) {
        const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'))
        const linesPct = coverage.total.lines.pct

        this.checklist.testing.push({
          item: 'Test coverage',
          status: linesPct >= 80 ? '✅' : linesPct >= 60 ? '⚠️' : '❌',
          details: `Line coverage: ${linesPct}% (target: 80%)`
        })

        this.metrics.coverage = coverage.total
      }
    } catch {
      this.checklist.testing.push({
        item: 'Test coverage',
        status: '❌',
        details: 'Could not generate coverage report'
      })
    }

    // Check test file count
    const testFiles = this.getTestFiles()
    this.checklist.testing.push({
      item: 'Test file coverage',
      status: testFiles.length > 10 ? '✅' : testFiles.length > 5 ? '⚠️' : '❌',
      details: `${testFiles.length} test files found`
    })
  }

  async checkDocumentation() {
    console.log('📚 Checking documentation...')

    // Check for README files
    const hasReadme = fs.existsSync('README.md')
    this.checklist.documentation.push({
      item: 'README.md presence',
      status: hasReadme ? '✅' : '❌',
      details: hasReadme ? 'README.md found' : 'README.md missing'
    })

    // Check API documentation
    const hasApiDocs = fs.existsSync('api/docs/openapi-spec.json')
    this.checklist.documentation.push({
      item: 'API documentation',
      status: hasApiDocs ? '✅' : '❌',
      details: hasApiDocs ? 'OpenAPI spec found' : 'OpenAPI spec missing'
    })

    // Check JSDoc coverage (basic)
    const jsFiles = this.getJSFiles()
    let documentedFunctions = 0
    let totalFunctions = 0

    for (const file of jsFiles) {
      const content = fs.readFileSync(file, 'utf8')
      const functions = content.match(/function\s+\w+\s*\(|const\s+\w+\s*=\s*\(|class\s+\w+/g) || []
      const docs = content.match(/\/\*\*\s*\n.*?\*\//gs) || []

      totalFunctions += functions.length
      documentedFunctions += docs.length
    }

    const docCoverage = totalFunctions > 0 ? (documentedFunctions / totalFunctions) * 100 : 0
    this.checklist.documentation.push({
      item: 'JSDoc coverage',
      status: docCoverage >= 70 ? '✅' : docCoverage >= 40 ? '⚠️' : '❌',
      details: `${docCoverage.toFixed(1)}% of functions documented`
    })
  }

  async checkArchitecture() {
    console.log('🏗️  Checking architecture...')

    // Check for proper separation of concerns
    const hasControllers = fs.existsSync('api/controllers')
    const hasServices = fs.existsSync('api/services')
    const hasRepositories = fs.existsSync('api/repositories')

    this.checklist.architecture.push({
      item: 'Layer separation (MVC)',
      status: hasControllers && hasServices && hasRepositories ? '✅' : '⚠️',
      details: `Controllers: ${hasControllers}, Services: ${hasServices}, Repositories: ${hasRepositories}`
    })

    // Check for error handling
    const hasErrorHandler = fs.existsSync('api/middleware/error/errorHandler.js')
    this.checklist.architecture.push({
      item: 'Global error handling',
      status: hasErrorHandler ? '✅' : '❌',
      details: hasErrorHandler
        ? 'Error handler middleware found'
        : 'Error handler middleware missing'
    })

    // Check for validation middleware
    const hasValidation = fs.existsSync('api/middleware/validation')
    this.checklist.architecture.push({
      item: 'Input validation',
      status: hasValidation ? '✅' : '❌',
      details: hasValidation ? 'Validation middleware found' : 'Validation middleware missing'
    })
  }

  getJSFiles() {
    const walk = dir => {
      let results = []
      const list = fs.readdirSync(dir)
      for (const file of list) {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)
        if (stat && stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          results = results.concat(walk(filePath))
        } else if (file.endsWith('.js')) {
          results.push(filePath)
        }
      }
      return results
    }
    return walk('.')
  }

  getTestFiles() {
    return this.getJSFiles().filter(
      file => file.includes('test') || file.includes('__tests__') || file.includes('spec')
    )
  }

  generateReport() {
    console.log('\n📋 CODE REVIEW CHECKLIST\n')

    const categories = Object.keys(this.checklist)
    let totalChecks = 0
    let passedChecks = 0

    for (const category of categories) {
      console.log(`\n${category.toUpperCase()}:`)
      console.log('='.repeat(category.length + 1))

      for (const item of this.checklist[category]) {
        console.log(`${item.status} ${item.item}`)
        if (item.details) {
          console.log(`   ${item.details}`)
        }
        totalChecks++
        if (item.status === '✅') {
          passedChecks++
        }
      }
    }

    const score = Math.round((passedChecks / totalChecks) * 100)
    console.log(`\n📊 OVERALL SCORE: ${score}% (${passedChecks}/${totalChecks} checks passed)`)

    if (score >= 80) {
      console.log('🎉 Excellent! Code is ready for review.')
    } else if (score >= 60) {
      console.log('⚠️  Good, but address the issues before merging.')
    } else {
      console.log('❌ Critical issues found. Do not merge until resolved.')
    }

    this.metrics.score = score
    this.metrics.totalChecks = totalChecks
    this.metrics.passedChecks = passedChecks
  }

  saveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      checklist: this.checklist,
      metrics: this.metrics
    }

    const reportPath = 'code-review-report.json'
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n💾 Report saved to: ${reportPath}`)
  }
}

// Run the checklist generator
const checklist = new CodeReviewChecklist()
checklist.run().catch(console.error)
