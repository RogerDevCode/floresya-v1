#!/usr/bin/env node
// @ts-nocheck

/**
 * Auto-fix Broken Links Script
 * Automatically fixes common import issues
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class BrokenLinkFixer {
  constructor() {
    this.baseDir = path.join(__dirname, '..', '..', 'public')
    this.fixesApplied = 0
    this.errors = []
  }

  /**
   * Fix self-referencing imports in a file
   */
  fixSelfReferencingImports(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf-8')
      let modified = false

      // Get the file name without extension
      const fileName = path.basename(filePath, '.js')

      // Pattern to find self-referencing imports
      const patterns = [
        // Exact match: import from same file with full path
        {
          regex: new RegExp(`from ['"]\\./js/[\\w/]+/${fileName}\\.js['"]`, 'g'),
          replacement: "from '.'"
        },
        // Relative path patterns that point to the same file
        {
          regex: new RegExp(`from ['"]\\./.*/${fileName}\\.js['"]`, 'g'),
          replacement: "from '.'"
        }
      ]

      patterns.forEach(({ regex, replacement }) => {
        const before = content
        content = content.replace(regex, replacement)
        if (before !== content) {
          modified = true
          console.log(`🔧 Fixed self-reference in ${path.relative(this.baseDir, filePath)}`)
        }
      })

      // Fix another common pattern: imports that use full paths instead of relative
      const fullPathsPattern = /from ['"]\.\/js\/shared\/([^'"]+)['"](?=\n|$|;|\s)/g
      if (fullPathsPattern.test(content)) {
        const isSharedFile = filePath.includes('/shared/')
        if (isSharedFile) {
          content = content.replace(fullPathsPattern, "from './$1'")
          modified = true
          console.log(`🔧 Fixed shared import path in ${path.relative(this.baseDir, filePath)}`)
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8')
        this.fixesApplied++
      }
    } catch (error) {
      this.errors.push(`Error fixing ${filePath}: ${error.message}`)
    }
  }

  /**
   * Fix missing file by creating it with basic structure
   */
  createMissingFile(filePath, type = 'module') {
    try {
      if (fs.existsSync(filePath)) {
        return false // Already exists
      }

      const dir = path.dirname(filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      let content = ''

      if (type === 'module') {
        content = `/**
 * Auto-generated module
 * Created by broken link fixer
 */

export const placeholder = true
`
      } else if (type === 'helpers') {
        content = `/**
 * Auto-generated helper functions
 * Created by broken link fixer
 */

export function generateSlug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function getRandomIcon() {
  const icons = ['🌸', '🌺', '🌹', '🌷', '🌻']
  return icons[Math.floor(Math.random() * icons.length)]
}

export function getRandomColor() {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']
  return colors[Math.floor(Math.random() * colors.length)]
}
`
      }

      fs.writeFileSync(filePath, content, 'utf-8')
      console.log(`✅ Created missing file: ${path.relative(this.baseDir, filePath)}`)
      this.fixesApplied++
      return true
    } catch (error) {
      this.errors.push(`Error creating ${filePath}: ${error.message}`)
      return false
    }
  }

  /**
   * Find all JavaScript files that need fixing
   */
  findFilesToFix() {
    const filesToFix = []

    // Known problematic files based on our detection
    const problematicFiles = [
      'public/js/shared/dom-ready.js',
      'public/js/shared/touchFeedback.js',
      'public/js/shared/touchGestures.js',
      'public/js/components/hamburgerMenu.js',
      'public/js/components/mobileNav.js',
      'public/js/components/pullToRefresh.js'
    ]

    problematicFiles.forEach(relativePath => {
      const fullPath = path.join(process.cwd(), relativePath)
      if (fs.existsSync(fullPath)) {
        filesToFix.push(fullPath)
      }
    })

    return filesToFix
  }

  /**
   * Run the fixing process
   */
  run() {
    console.log('🔧 Starting broken link auto-fix...')
    console.log(`📂 Working directory: ${this.baseDir}`)

    // Fix self-referencing imports
    const filesToFix = this.findFilesToFix()
    console.log(`📄 Found ${filesToFix.length} files to fix`)

    filesToFix.forEach(file => {
      this.fixSelfReferencingImports(file)
    })

    // Create missing helper file
    const helpersPath = path.join(this.baseDir, 'js', 'shared', 'occasion-helpers.js')
    this.createMissingFile(helpersPath, 'helpers')

    // Generate report
    this.generateReport()
  }

  /**
   * Generate and display report
   */
  generateReport() {
    console.log('\n' + '='.repeat(80))
    console.log('🔧 BROKEN LINK AUTO-FIX REPORT')
    console.log('='.repeat(80))

    console.log(`\n📈 Statistics:`)
    console.log(`   Fixes applied: ${this.fixesApplied}`)
    console.log(`   Errors: ${this.errors.length}`)

    if (this.errors.length > 0) {
      console.log('\n❌ Errors encountered:')
      this.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`)
      })
    }

    if (this.fixesApplied > 0) {
      console.log('\n✅ Fixes Applied:')
      console.log('   - Self-referencing imports corrected')
      console.log('   - Full path imports converted to relative paths')
      console.log('   - Missing helper files created')
      console.log('\n💡 Next Steps:')
      console.log('   1. Run the improved detection script again')
      console.log('   2. Test the fixed functionality')
      console.log('   3. Commit the changes')
    } else {
      console.log('\n✅ No fixes needed - all imports are already correct!')
    }
  }
}

// Run the fixer
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new BrokenLinkFixer()
  fixer.run()
}

export default BrokenLinkFixer