#!/usr/bin/env node

/**
 * Simple script to extract Lucide icons from lucide-icons.js to individual SVG files
 */

import fs from 'fs/promises'
import path from 'path'

async function extractIcons() {
  try {
    // Read the lucide-icons.js file
    const lucideIconsPath = path.join(process.cwd(), 'public', 'js', 'lucide-icons.js')
    const content = await fs.readFile(lucideIconsPath, 'utf8')

    // Split content into lines
    const lines = content.split('\n')

    // Find all icon definitions
    const icons = []
    let i = 0

    while (i < lines.length) {
      const line = lines[i].trim()

      // Match simple icon definitions like: icon-name: '<svg ...>'
      const simpleMatch = /^(['"`]?)([\w-]+)(['"`]?)\s*:\s*(['"`])(.*)\4\s*,?$/.exec(line)
      if (simpleMatch) {
        const iconName = simpleMatch[2]
        const svgContent = simpleMatch[5]

        if (svgContent && svgContent.includes('<svg')) {
          icons.push({
            name: iconName,
            svg: svgContent.replace(/\\"/g, '"')
          })
        }
        i++
        continue
      }

      // Match multiline icon definitions like:
      // icon-name:
      //   '<svg ...>'
      const multilineStartMatch = /^(['"`]?)([\w-]+)(['"`]?)\s*:\s*$/.exec(line)
      if (multilineStartMatch) {
        const iconName = multilineStartMatch[2]
        const nextLine = lines[i + 1]?.trim() || ''

        // Check if next line contains the SVG
        const svgMatch = /(['"`])(.*)\1\s*,?$/.exec(nextLine)
        if (svgMatch) {
          const svgContent = svgMatch[2]

          if (svgContent && svgContent.includes('<svg')) {
            icons.push({
              name: iconName,
              svg: svgContent.replace(/\\"/g, '"')
            })
          }
          i += 2 // Skip both lines
          continue
        }
      }

      i++
    }

    console.log(`Found ${icons.length} icons.`)

    // Create output directory
    const outputPath = path.join(process.cwd(), 'public', 'images', 'lucide')
    await fs.mkdir(outputPath, { recursive: true })

    // Write each icon to a file
    for (const icon of icons) {
      const fileName = `${icon.name}.svg`
      const filePath = path.join(outputPath, fileName)

      await fs.writeFile(filePath, icon.svg, 'utf8')
      console.log(`✅ ${fileName}`)
    }

    // Create manifest
    const manifest = {}
    icons.forEach(icon => {
      manifest[icon.name] = `${icon.name}.svg`
    })

    const manifestPath = path.join(outputPath, 'manifest.json')
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')

    console.log(`\n🎉 Extracted ${icons.length} icons to ${outputPath}`)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

extractIcons()
