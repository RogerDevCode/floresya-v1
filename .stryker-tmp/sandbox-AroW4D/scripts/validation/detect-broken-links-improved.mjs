#!/usr/bin/env node
// @ts-nocheck

/**
 * Improved Broken Link Detection System
 * Ignores node_modules, test files, and common false positives
 * Focuses on real runtime issues
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class ImprovedBrokenLinkDetector {
  constructor() {
    this.brokenLinks = []
    this.scannedFiles = 0
    this.baseDir = path.join(__dirname, '..', '..', 'public')

    // Patterns to ignore (false positives)
    this.ignorePatterns = [
      // Node modules and packages
      /^(@[a-z0-9][\w-.]*\/)?[a-z0-9][\w-.]*/,  // npm packages like vitest, clsx, etc.
      // Test-related
      /__tests__/,
      /\.test\./,
      /\.spec\./,
      // Built-in modules and browser APIs
      /^node:/,
      /^https?:\/\//,
      // Common development dependencies
      /^vitest/,
      /^clsx/,
      /^tailwind-merge/,
      /^@modelcontextprotocol/
    ]
  }

  /**
   * Check if import should be ignored
   */
  shouldIgnoreImport(importPath) {
    return this.ignorePatterns.some(pattern => pattern.test(importPath))
  }

  /**
   * Extract import statements from JavaScript file
   */
  extractImports(filePath, content) {
    const imports = []
    const lines = content.split('\n')

    lines.forEach((line, index) => {
      // Skip commented lines
      if (line.trim().startsWith('//')) {return}

      // Match various import patterns
      const importPatterns = [
        // Regular imports
        /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g,
        // Dynamic imports
        /import\s*\(['"`]([^'"`]+)['"`]\)/g,
        // Await imports
        /const\s+.*?=\s*await\s+import\s*\(['"`]([^'"`]+)['"`]\)/g
      ]

      importPatterns.forEach(pattern => {
        let match
        while ((match = pattern.exec(line)) !== null) {
          const importPath = match[1]

          // Skip if this import should be ignored
          if (this.shouldIgnoreImport(importPath)) {return}

          imports.push({
            path: importPath,
            line: index + 1,
            rawLine: line.trim(),
            type: this.getImportType(importPath)
          })
        }
      })
    })

    return imports
  }

  /**
   * Determine import type for better categorization
   */
  getImportType(importPath) {
    if (importPath.startsWith('http://') || importPath.startsWith('https://')) {
      return 'external'
    } else if (importPath.startsWith('/')) {
      return 'absolute'
    } else if (importPath.startsWith('./') || importPath.startsWith('../')) {
      return 'relative'
    } else {
      return 'module'
    }
  }

  /**
   * Resolve import path to actual file system path
   */
  resolveImportPath(importPath, sourceFile) {
    // Skip external URLs
    if (importPath.startsWith('http://') || importPath.startsWith('https://')) {
      return null
    }

    // Skip simple relative imports (these are usually internal references)
    if (importPath === '.' || importPath === './') {
      return null
    }

    let resolvedPath

    if (importPath.startsWith('/')) {
      // Absolute path - resolve from public directory
      resolvedPath = path.join(this.baseDir, importPath)
    } else {
      // Relative path - resolve from source file directory
      resolvedPath = path.resolve(path.dirname(sourceFile), importPath)
    }

    // Handle missing .js extension for modules
    if (!path.extname(resolvedPath)) {
      const jsPath = resolvedPath + '.js'
      if (fs.existsSync(jsPath)) {
        return jsPath
      }
    }

    // Handle index.js files
    const indexPath = path.join(resolvedPath, 'index.js')
    if (fs.existsSync(indexPath)) {
      return indexPath
    }

    // Try .json extension
    const jsonPath = resolvedPath + '.json'
    if (fs.existsSync(jsonPath)) {
      return jsonPath
    }

    return resolvedPath
  }

  /**
   * Check if file exists and is accessible
   */
  fileExists(filePath) {
    try {
      return fs.existsSync(filePath) && fs.statSync(filePath).isFile()
    } catch {
      return false
    }
  }

  /**
   * Scan a single JavaScript file for broken imports
   */
  scanFile(filePath) {
    try {
      // Skip test files and __tests__ directories
      if (filePath.includes('__tests__') || filePath.includes('.test.') || filePath.includes('.spec.')) {
        return
      }

      const content = fs.readFileSync(filePath, 'utf-8')
      const imports = this.extractImports(filePath, content)

      imports.forEach(importInfo => {
        const resolvedPath = this.resolveImportPath(importInfo.path, filePath)

        if (resolvedPath && !this.fileExists(resolvedPath)) {
          // Additional check: only report if it's a critical runtime import
          if (this.isCriticalImport(importInfo, filePath)) {
            this.brokenLinks.push({
              sourceFile: path.relative(this.baseDir, filePath),
              importPath: importInfo.path,
              resolvedPath: path.relative(process.cwd(), resolvedPath),
              line: importInfo.line,
              rawLine: importInfo.rawLine,
              type: importInfo.type,
              severity: this.getSeverity(importInfo, filePath)
            })
          }
        }
      })

      this.scannedFiles++
    } catch (error) {
      console.error(`❌ Error scanning ${filePath}:`, error.message)
    }
  }

  /**
   * Determine if this is a critical import that would break functionality
   */
  isCriticalImport(importInfo, sourceFile) {
    // Imports in production pages are critical
    if (sourceFile.includes('/pages/')) {return true}

    // Imports in shared modules are critical
    if (sourceFile.includes('/shared/')) {return true}

    // Components used in main index.html are critical
    if (sourceFile.includes('/components/') && this.isUsedInIndex(sourceFile)) {return true}

    // Commented out imports are not critical (development code)
    if (importInfo.rawLine.includes('//')) {return false}

    return true
  }

  /**
   * Check if a component is used in index.html
   */
  isUsedInIndex(componentPath) {
    try {
      const indexPath = path.join(this.baseDir, 'index.html')
      const indexContent = fs.readFileSync(indexPath, 'utf-8')
      const componentName = path.basename(componentPath, '.js')
      return indexContent.includes(componentName)
    } catch {
      return false
    }
  }

  /**
   * Determine severity of broken link
   */
  getSeverity(importInfo, sourceFile) {
    // Pages = critical (user-facing)
    if (sourceFile.includes('/pages/')) {return 'critical'}

    // Shared modules = high (affects multiple components)
    if (sourceFile.includes('/shared/')) {return 'high'}

    // Components = medium (affects specific features)
    if (sourceFile.includes('/components/')) {return 'medium'}

    return 'low'
  }

  /**
   * Find all JavaScript files to scan
   */
  findJavaScriptFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir)

    files.forEach(file => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory()) {
        // Skip common directories
        if (!['node_modules', '.git', 'dist', 'build', '__tests__', '.vscode'].includes(file)) {
          this.findJavaScriptFiles(filePath, fileList)
        }
      } else if (file.endsWith('.js') || file.endsWith('.mjs')) {
        fileList.push(filePath)
      }
    })

    return fileList
  }

  /**
   * Run the complete scan
   */
  run() {
    console.log('🔍 Starting improved broken link detection...')
    console.log(`📂 Scanning directory: ${this.baseDir}`)

    const jsFiles = this.findJavaScriptFiles(this.baseDir)
    const productionFiles = jsFiles.filter(file =>
      !file.includes('__tests__') &&
      !file.includes('.test.') &&
      !file.includes('.spec.')
    )

    console.log(`📄 Found ${productionFiles.length} production JavaScript files to scan`)
    console.log(`📄 Total files (including tests): ${jsFiles.length}`)

    // Scan each file
    productionFiles.forEach(file => this.scanFile(file))

    // Report results
    this.generateReport()
  }

  /**
   * Generate and display report
   */
  generateReport() {
    console.log('\n' + '='.repeat(80))
    console.log('📊 IMPROVED BROKEN LINK DETECTION REPORT')
    console.log('='.repeat(80))

    console.log(`\n📈 Statistics:`)
    console.log(`   Files scanned: ${this.scannedFiles}`)
    console.log(`   Critical broken links: ${this.brokenLinks.length}`)

    if (this.brokenLinks.length === 0) {
      console.log('\n✅ No critical broken links found! All production imports are valid.')
      return
    }

    // Group by severity
    const bySeverity = this.brokenLinks.reduce((acc, link) => {
      acc[link.severity] = (acc[link.severity] || 0) + 1
      return acc
    }, {})

    console.log('\n🚨 Critical Broken Links by Severity:')
    Object.entries(bySeverity).forEach(([severity, count]) => {
      const icon = severity === 'critical' ? '🔴' : severity === 'high' ? '🟠' : '🟡'
      console.log(`   ${icon} ${severity}: ${count}`)
    })

    // Show critical and high severity links
    const criticalLinks = this.brokenLinks.filter(link =>
      link.severity === 'critical' || link.severity === 'high'
    )

    if (criticalLinks.length > 0) {
      console.log('\n🔴 Critical & High Priority Issues:')
      console.log('-'.repeat(80))

      criticalLinks.forEach((link, index) => {
        console.log(`\n${index + 1}. ${link.sourceFile}:${link.line}`)
        console.log(`   Severity: ${link.severity}`)
        console.log(`   Import: ${link.importPath}`)
        console.log(`   Expected: ${link.resolvedPath}`)
        console.log(`   Code: ${link.rawLine}`)
      })
    }

    // Show medium/low issues
    const otherLinks = this.brokenLinks.filter(link =>
      link.severity === 'medium' || link.severity === 'low'
    )

    if (otherLinks.length > 0) {
      console.log('\n🟡 Medium/Low Priority Issues:')
      console.log('-'.repeat(80))

      otherLinks.forEach((link, index) => {
        console.log(`\n${index + 1}. ${link.sourceFile}:${link.line}`)
        console.log(`   Import: ${link.importPath}`)
        console.log(`   Code: ${link.rawLine}`)
      })
    }

    console.log('\n💡 Recommended Actions:')
    console.log('   1. Fix critical and high priority issues immediately')
    console.log('   2. Check file paths and spelling')
    console.log('   3. Verify files exist in expected locations')
    console.log('   4. Update imports to use correct paths')
    console.log('   5. Create missing files if needed')

    // Exit with error code if critical broken links found
    const criticalCount = (bySeverity.critical || 0) + (bySeverity.high || 0)
    if (criticalCount > 0) {
      console.log(`\n❌ Found ${criticalCount} critical issues that need immediate attention!`)
      process.exit(1)
    }
  }
}

// Run the detector
if (import.meta.url === `file://${process.argv[1]}`) {
  const detector = new ImprovedBrokenLinkDetector()
  detector.run()
}

export default ImprovedBrokenLinkDetector