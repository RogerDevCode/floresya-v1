#!/usr/bin/env node

/**
 * Build script to replace data-lucide placeholders with static SVG icons
 * This converts runtime icon conversion to build-time static embedding
 */

import fs from 'fs/promises'
import path from 'path'

// Configuration
const ICONS_DIR = path.join(process.cwd(), 'public', 'images', 'lucide')
const PUBLIC_DIR = path.join(process.cwd(), 'public')
const MANIFEST_FILE = path.join(ICONS_DIR, 'manifest.json')

// Function to walk directory recursively and find files
async function walkDirectory(dir, ext) {
  const files = []
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        // Skip node_modules and other ignored directories
        if (!['node_modules', '.git', 'dist'].includes(entry.name)) {
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

// Function to read manifest file
async function readManifest() {
  try {
    const manifestContent = await fs.readFile(MANIFEST_FILE, 'utf8')
    return JSON.parse(manifestContent)
  } catch (error) {
    console.error('❌ Could not read manifest file:', error.message)
    return {}
  }
}

// Function to get static SVG content for an icon
async function getStaticSvg(iconName) {
  try {
    const svgPath = path.join(ICONS_DIR, `${iconName}.svg`)
    const svgContent = await fs.readFile(svgPath, 'utf8')
    return svgContent.trim()
  } catch (_error) {
    // Try to find similar icons (without dashes)
    try {
      const altIconName = iconName.replace(/-/g, '')
      const svgPath = path.join(ICONS_DIR, `${altIconName}.svg`)
      const svgContent = await fs.readFile(svgPath, 'utf8')
      return svgContent.trim()
    } catch (_altError) {
      console.warn(`⚠️  Icon file not found: ${iconName}.svg`)
      return null
    }
  }
}

// Function to embed SVG in HTML while preserving attributes
function embedSvgInHtml(svgContent, attributesString, _originalTagName = 'i') {
  // Parse attributes from the original element
  const attrs = {}
  const attrRegex = /([\w-]+)=(["'])([^"']*)\2/g
  let match

  while ((match = attrRegex.exec(attributesString)) !== null) {
    const [, key, , value] = match
    attrs[key] = value
  }

  // Remove data-lucide attribute since it's no longer needed
  delete attrs['data-lucide']

  // Add preserved attributes to the SVG element
  let modifiedSvg = svgContent

  // Handle class attribute
  const classAttr = attrs.class || ''
  if (classAttr) {
    modifiedSvg = modifiedSvg.replace(/<svg([^>]*)>/, (match, svgAttrs) => {
      if (svgAttrs.includes('class=')) {
        // Append to existing class attribute
        return match.replace(/class=(["'])([^"']*)\1/, (classMatch, quote, existingClasses) => {
          return `class=${quote}${existingClasses} ${classAttr}${quote}`
        })
      } else {
        // Add new class attribute
        return `<svg${svgAttrs} class="${classAttr}">`
      }
    })
  }

  // Handle ID attribute
  const idAttr = attrs.id || ''
  if (idAttr && !modifiedSvg.includes('id=')) {
    modifiedSvg = modifiedSvg.replace(/<svg/, `<svg id="${idAttr}"`)
  }

  // Handle style attribute
  const styleAttr = attrs.style || ''
  if (styleAttr && !modifiedSvg.includes('style=')) {
    modifiedSvg = modifiedSvg.replace(/<svg/, `<svg style="${styleAttr}"`)
  }

  return modifiedSvg
}

// Function to process a single HTML file
async function processHtmlFile(filePath) {
  try {
    console.log(`Processing: ${filePath}`)

    const content = await fs.readFile(filePath, 'utf8')

    // Find all data-lucide elements and replace them with static SVGs
    const dataLucideRegex = /<([^\s>]+)([^>]*)data-lucide=(["'])([^"']+)\3([^>]*)>(.*?)<\/\1>/gs
    let modifiedContent = content

    // Collect all matches first to avoid issues with replacing during iteration
    const matches = []
    let match

    while ((match = dataLucideRegex.exec(content)) !== null) {
      matches.push({
        fullMatch: match[0],
        tagName: match[1],
        beforeAttrs: match[2],
        iconName: match[4],
        afterAttrs: match[5],
        innerContent: match[6]
      })
    }

    // Process each match
    let replacements = 0
    for (const match of matches) {
      const iconName = match.iconName
      const fullElement = match.fullMatch

      // Get the static SVG content
      const svgContent = await getStaticSvg(iconName)

      if (svgContent) {
        // Combine all attributes
        const allAttributes = (match.beforeAttrs || '') + (match.afterAttrs || '')

        // Embed the SVG with preserved attributes
        const embeddedSvg = embedSvgInHtml(svgContent, allAttributes, match.tagName)

        // Replace the entire element
        modifiedContent = modifiedContent.replace(fullElement, embeddedSvg)
        replacements++
        console.log(`  ✅ Replaced: ${iconName}`)
      } else {
        console.warn(`  ⚠️  Could not replace: ${iconName} (icon not found)`)
      }
    }

    // Write the modified content back to the file
    if (replacements > 0) {
      await fs.writeFile(filePath, modifiedContent, 'utf8')
      console.log(`  📝 Updated: ${filePath} (${replacements} replacements)`)
    } else {
      console.log(`  ℹ️  No changes needed: ${filePath}`)
    }

    return replacements
  } catch (_error) {
    console.error(`❌ Error processing ${filePath}:`, _error.message)
    return 0
  }
}

// Function to find and process all HTML files
async function processAllHtmlFiles() {
  try {
    // Find all HTML files in the public directory
    const htmlFiles = await walkDirectory(PUBLIC_DIR, '.html')

    console.log(`Found ${htmlFiles.length} HTML files to process.`)

    let totalReplacements = 0

    // Process each HTML file
    for (const htmlFile of htmlFiles) {
      const replacements = await processHtmlFile(htmlFile)
      totalReplacements += replacements
    }

    console.log(
      `\n🎉 Processing complete! ${totalReplacements} icons replaced across ${htmlFiles.length} files.`
    )

    return totalReplacements
  } catch (_error) {
    console.error('❌ Error finding HTML files:', _error.message)
    process.exit(1)
  }
}

// Function to validate that used icons exist
async function validateIcons() {
  try {
    // Read the manifest
    const manifest = await readManifest()

    // Find all HTML files and check for used icons
    const htmlFiles = await walkDirectory(PUBLIC_DIR, '.html')

    const usedIcons = new Set()

    // Scan all HTML files for data-lucide attributes
    for (const htmlFile of htmlFiles) {
      try {
        const content = await fs.readFile(htmlFile, 'utf8')

        const dataLucideRegex = /data-lucide=(["'])([^"']+)\1/g
        let match

        while ((match = dataLucideRegex.exec(content)) !== null) {
          usedIcons.add(match[2])
        }
      } catch (_error) {
        console.warn(`⚠️  Could not read file: ${htmlFile}`)
      }
    }

    console.log(`Found ${usedIcons.size} unique icons used in HTML files.`)

    // Check which icons are missing
    const missingIcons = []
    const availableIcons = Object.keys(manifest)

    for (const iconName of usedIcons) {
      if (!availableIcons.includes(iconName)) {
        // Try alternative name (without dashes)
        const altIconName = iconName.replace(/-/g, '')
        if (!availableIcons.includes(altIconName)) {
          missingIcons.push(iconName)
        }
      }
    }

    if (missingIcons.length > 0) {
      console.warn(`⚠️  Missing icons (will be skipped): ${missingIcons.join(', ')}`)
      // Don't fail, just warn
    }

    console.log('✅ Icon validation completed.')
    return true
  } catch (error) {
    console.error('❌ Error validating icons:', error.message)
    return false
  }
}

// Main function
async function main() {
  try {
    console.log('🏗️  Building static icons...')

    // Validate that icons exist (but don't fail on missing ones)
    await validateIcons()

    // Process all HTML files
    const replacements = await processAllHtmlFiles()

    console.log(
      `\n✅ Static icon build completed successfully! (${replacements} replacements made)`
    )
  } catch (error) {
    console.error('❌ Build failed:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith('build-static-icons.js')) {
  main()
}

export { processHtmlFile, processAllHtmlFiles, validateIcons }
