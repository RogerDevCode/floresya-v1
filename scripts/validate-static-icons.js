#!/usr/bin/env node

/**
 * Validation script to ensure all data-lucide attributes have been replaced with static SVGs
 */

import fs from 'fs/promises'
import path from 'path'

// Configuration
const PUBLIC_DIR = path.join(process.cwd(), 'public')

// Function to walk directory recursively and find HTML files
async function walkDirectory(dir, ext) {
  const files = []
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        // Skip node_modules and other ignored directories
        if (!['node_modules', '.git', 'dist', 'coverage'].includes(entry.name)) {
          files.push(...(await walkDirectory(fullPath, ext)))
        }
      } else if (entry.isFile() && entry.name.endsWith(ext)) {
        files.push(fullPath)
      }
    }
  } catch (_error) {
    console.warn(`⚠️  Could not read directory: ${dir}`)
  }

  return files
}

// Main validation function
async function validateStaticIcons() {
  try {
    console.log('🔍 Validating static icon implementation...')

    // Find all HTML files
    const htmlFiles = await walkDirectory(PUBLIC_DIR, '.html')
    console.log(`Found ${htmlFiles.length} HTML files to validate.`)

    let totalFilesWithDataLucide = 0
    let totalDataLucideOccurrences = 0
    const filesWithRemainingDataLucide = []

    // Check each HTML file for remaining data-lucide attributes
    for (const htmlFile of htmlFiles) {
      const content = await fs.readFile(htmlFile, 'utf8')
      const dataLucideMatches = content.match(/data-lucide=/g)

      if (dataLucideMatches) {
        const count = dataLucideMatches.length
        console.log(`⚠️  ${htmlFile}: ${count} data-lucide occurrences`)

        totalFilesWithDataLucide++
        totalDataLucideOccurrences += count
        filesWithRemainingDataLucide.push({
          file: htmlFile,
          count: count
        })
      }
    }

    console.log('\n📊 Validation Results:')
    console.log(`- Files with remaining data-lucide: ${totalFilesWithDataLucide}`)
    console.log(`- Total data-lucide occurrences: ${totalDataLucideOccurrences}`)

    if (totalDataLucideOccurrences === 0) {
      console.log('\n✅ All data-lucide attributes have been successfully replaced!')
      console.log('The static icon implementation is complete.')
      return true
    } else {
      console.log('\n❌ Validation failed: Some data-lucide attributes remain.')
      console.log('The static icon implementation is incomplete.')

      // Show the files that still have data-lucide attributes
      console.log('\nFiles with remaining data-lucide attributes:')
      for (const file of filesWithRemainingDataLucide) {
        console.log(`  - ${file.file} (${file.count} occurrences)`)
      }

      return false
    }
  } catch (_error) {
    console.error('❌ Error during validation:', _error.message)
    return false
  }
}

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith('validate-static-icons.js')) {
  validateStaticIcons().then(success => {
    process.exit(success ? 0 : 1)
  })
}

export { validateStaticIcons }
