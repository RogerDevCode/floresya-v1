#!/usr/bin/env node
// @ts-nocheck

/**
 * Broken Link Detection System
 * Scans JavaScript files for broken imports and file references
 * Early detection before runtime errors
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class BrokenLinkDetector {
  constructor() {
    this.brokenLinks = []
    this.scannedFiles = 0
    this.baseDir = path.join(__dirname, '..', '..', 'public')
  }

  /**
   * Extract import statements from JavaScript file
   */
  extractImports(filePath, content) {
    const imports = []
    const lines = content.split('\n')

    lines.forEach((line, index) => {
      // Match various import patterns
      const importPatterns = [
        /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g,
        /import\s*\(['"`]([^'"`]+)['"`]\)/g,
        /import\s*\(['"`]([^'"`]+)['"`]\)/g
      ]

      importPatterns.forEach(pattern => {
        let match
        while ((match = pattern.exec(line)) !== null) {
          const importPath = match[1]
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

    let resolvedPath

    if (importPath.startsWith('/')) {
      // Absolute path - resolve from public directory
      resolvedPath = path.join(this.baseDir, importPath)
    } else {
      // Relative path - resolve from source file directory
      resolvedPath = path.resolve(path.dirname(sourceFile), importPath)
    }

    // Try different extensions if not specified
    const extensions = ['.js', '/index.js', '.json', '/index.json']

    for (const ext of extensions) {
      const testPath = resolvedPath + ext
      if (fs.existsSync(testPath)) {
        return testPath
      }
    }

    // If path already has extension, return as-is
    if (path.extname(resolvedPath)) {
      return resolvedPath
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
      const content = fs.readFileSync(filePath, 'utf-8')
      const imports = this.extractImports(filePath, content)

      imports.forEach(importInfo => {
        const resolvedPath = this.resolveImportPath(importInfo.path, filePath)

        if (resolvedPath && !this.fileExists(resolvedPath)) {
          this.brokenLinks.push({
            sourceFile: path.relative(this.baseDir, filePath),
            importPath: importInfo.path,
            resolvedPath: path.relative(process.cwd(), resolvedPath),
            line: importInfo.line,
            rawLine: importInfo.rawLine,
            type: importInfo.type
          })
        }
      })

      this.scannedFiles++
    } catch (error) {
      console.error(`❌ Error scanning ${filePath}:`, error.message)
    }
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
        // Skip node_modules and other common directories
        if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
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
    console.log('🔍 Starting broken link detection...')
    console.log(`📂 Scanning directory: ${this.baseDir}`)

    const jsFiles = this.findJavaScriptFiles(this.baseDir)
    console.log(`📄 Found ${jsFiles.length} JavaScript files to scan`)

    // Scan each file
    jsFiles.forEach(file => this.scanFile(file))

    // Report results
    this.generateReport()
  }

  /**
   * Generate and display report
   */
  generateReport() {
    console.log('\n' + '='.repeat(80))
    console.log('📊 BROKEN LINK DETECTION REPORT')
    console.log('='.repeat(80))

    console.log(`\n📈 Statistics:`)
    console.log(`   Files scanned: ${this.scannedFiles}`)
    console.log(`   Broken links: ${this.brokenLinks.length}`)

    if (this.brokenLinks.length === 0) {
      console.log('\n✅ No broken links found! All imports are valid.')
      return
    }

    console.log('\n🚨 Broken Links Found:')
    console.log('-'.repeat(80))

    this.brokenLinks.forEach((link, index) => {
      console.log(`\n${index + 1}. ${link.sourceFile}:${link.line}`)
      console.log(`   Type: ${link.type}`)
      console.log(`   Import: ${link.importPath}`)
      console.log(`   Expected: ${link.resolvedPath}`)
      console.log(`   Code: ${link.rawLine}`)
    })

    // Group by type for better analysis
    const grouped = this.brokenLinks.reduce((acc, link) => {
      acc[link.type] = (acc[link.type] || 0) + 1
      return acc
    }, {})

    console.log('\n📋 Breakdown by Type:')
    Object.entries(grouped).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`)
    })

    // Suggest fixes
    console.log('\n💡 Suggested Actions:')
    console.log('   1. Check file paths and spelling')
    console.log('   2. Verify files exist in expected locations')
    console.log('   3. Update imports to use correct paths')
    console.log('   4. Create missing files if needed')

    // Exit with error code if broken links found
    process.exit(1)
  }
}

// Run the detector
if (import.meta.url === `file://${process.argv[1]}`) {
  const detector = new BrokenLinkDetector()
  detector.run()
}

export default BrokenLinkDetector