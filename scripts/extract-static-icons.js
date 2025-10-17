#!/usr/bin/env node

/**
 * Script to extract Lucide icons from lucide-icons.js to individual SVG files
 * This converts the runtime icon system to a static asset system
 */

import fs from 'fs/promises'
import path from 'path'

// Read the lucide-icons.js file
const lucideIconsPath = path.join(process.cwd(), 'public', 'js', 'lucide-icons.js')
const outputPath = path.join(process.cwd(), 'public', 'images', 'lucide')

// Function to extract icons from the lucide-icons.js file
async function extractIcons() {
  try {
    const content = await fs.readFile(lucideIconsPath, 'utf8')

    // Find the ICONS object section
    const lines = content.split('\n')
    let inIconsObject = false
    const icons = []
    let currentIconName = ''

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Look for the start of the ICONS object
      if (line.startsWith('const ICONS = {')) {
        inIconsObject = true
        continue
      }

      // If we're in the ICONS object, parse it
      if (inIconsObject) {
        // Check if we've reached the end of the ICONS object
        if (line === '};') {
          break
        }

        // Look for icon definitions
        const simpleIconMatch = /^(['"`]?)([\w-]+)(['"`]?)\s*:\s*(['"`])(.*)\4\s*,?$/.exec(line)
        if (simpleIconMatch) {
          const iconName = simpleIconMatch[2]
          const svgContent = simpleIconMatch[5]

          // Add the icon if it's valid
          if (svgContent && svgContent.includes('<svg')) {
            icons.push({
              name: iconName,
              svg: svgContent.replace(/\\"/g, '"')
            })
          }
          continue
        }

        // Look for multiline SVG definitions (those that span multiple lines)
        const multilineStartMatch = /^(['"`]?)([\w-]+)(['"`]?)\s*:\s*$/.exec(line)
        if (multilineStartMatch) {
          currentIconName = multilineStartMatch[2]
          continue
        }

        // If we're collecting a multiline value
        if (currentIconName) {
          // Check if this line contains the start of an SVG string
          const svgStartMatch = /(['"`])(.*)\1\s*,?$/.exec(line)
          if (svgStartMatch) {
            const svgContent = svgStartMatch[2]

            // Add the icon if it's valid
            if (svgContent && svgContent.includes('<svg')) {
              icons.push({
                name: currentIconName,
                svg: svgContent.replace(/\\"/g, '"')
              })
            }

            // Reset for next icon
            currentIconName = ''
            currentIconValue = ''
            continue
          }

          // Check for continuation of multiline SVG
          const multilineContinueMatch = /(['"`])(.*)\1\s*,?$/.exec(line)
          if (multilineContinueMatch) {
            const svgContent = multilineContinueMatch[2]

            // Add the icon if it's valid
            if (svgContent && svgContent.includes('<svg')) {
              icons.push({
                name: currentIconName,
                svg: svgContent.replace(/\\"/g, '"')
              })
            }

            // Reset for next icon
            currentIconName = ''
            currentIconValue = ''
          }
        }
      }
    }

    console.log(`Found ${icons.length} icons. Extracting to ${outputPath}...`)

    // Create the output directory if it doesn't exist
    await fs.mkdir(outputPath, { recursive: true })

    // Write each icon to a separate file
    let count = 0
    for (const icon of icons) {
      try {
        // Decode the SVG content
        const decodedSvg = icon.svg.replace(/\\"/g, '"')

        // Validate that it's actually an SVG
        if (decodedSvg.trim().startsWith('<svg')) {
          const fileName = `${icon.name}.svg`
          const filePath = path.join(outputPath, fileName)

          await fs.writeFile(filePath, decodedSvg, 'utf8')
          count++
          console.log(`✅ Extracted: ${fileName}`)
        } else {
          console.warn(`⚠️ Skipping invalid SVG for icon: ${icon.name}`)
        }
      } catch (error) {
        console.error(`❌ Failed to extract icon ${icon.name}:`, error.message)
      }
    }

    console.log(`\n🎉 Successfully extracted ${count} icons to ${outputPath}`)

    // Create a manifest file for easy reference
    const manifest = {}
    icons.forEach(icon => {
      manifest[icon.name] = {
        file: `${icon.name}.svg`,
        categories: [],
        keywords: []
      }
    })

    const manifestPath = path.join(outputPath, 'manifest.json')
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')
    console.log(`📋 Created manifest file: ${manifestPath}`)
  } catch (error) {
    console.error('❌ Error extracting icons:', error.message)
    process.exit(1)
  }
}

// Run the extraction
extractIcons()
