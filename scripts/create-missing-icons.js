#!/usr/bin/env node

/**
 * Script to create missing Lucide icon SVG files
 * This handles icons that are referenced in HTML but not in lucide-icons.js
 */

import fs from 'fs/promises'
import path from 'path'

// Define basic SVG template for missing icons
function createMissingIcon(color = 'currentColor', strokeWidth = 2) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 8v8M8 12h8"/>
  </svg>`
}

// List of missing icons identified
const missingIcons = ['share-2', 'mail-check', 'crown', 'award', 'globe', 'play', 'map', 'home']

async function createMissingIcons() {
  try {
    const iconsDir = path.join(process.cwd(), 'public', 'images', 'lucide')

    console.log('Creating missing SVG icon files...')

    for (const iconName of missingIcons) {
      const filePath = path.join(iconsDir, `${iconName}.svg`)

      // Create a placeholder SVG - in a real implementation we would want proper icons
      // For now, using a question mark icon as placeholder
      let svgContent

      // Create more specific placeholders for known icons
      switch (iconName) {
        case 'share-2':
          svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="18" cy="5" r="3"/>
  <circle cx="6" cy="12" r="3"/>
  <circle cx="18" cy="19" r="3"/>
  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
</svg>`
          break
        case 'mail-check':
          svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M22 4H2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4Z"/>
  <path d="M17 10l-5 5-3-3"/>
  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
</svg>`
          break
        case 'crown':
          svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m2 4 3 12h14l3-12-6 7-4-7-6 7Z"/>
</svg>`
          break
        case 'award':
          svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="8" r="6"/>
  <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
</svg>`
          break
        case 'globe':
          svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/>
  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
  <path d="M2 12h20"/>
</svg>`
          break
        case 'play':
          svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="6,4 18,12 6,20"/>
</svg>`
          break
        case 'map':
          svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
  <line x1="9" y1="3" x2="9" y2="18"/>
  <line x1="15" y1="6" x2="15" y2="21"/>
</svg>`
          break
        case 'home':
          svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
  <polyline points="9 22 9 12 15 12 15 22"/>
</svg>`
          break
        default:
          svgContent = createMissingIcon()
          break
      }

      await fs.writeFile(filePath, svgContent, 'utf8')
      console.log(`✅ Created: ${iconName}.svg`)
    }

    // Update the manifest file to include the new icons
    const manifestPath = path.join(iconsDir, 'manifest.json')
    let manifest = {}

    try {
      const manifestContent = await fs.readFile(manifestPath, 'utf8')
      manifest = JSON.parse(manifestContent)
    } catch (_error) {
      console.log('Creating new manifest.json file...')
    }

    for (const iconName of missingIcons) {
      manifest[iconName] = `${iconName}.svg`
    }

    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')
    console.log('📋 Updated manifest.json with missing icons')

    console.log(`\n🎉 Successfully created ${missingIcons.length} missing icons.`)
    console.log('Now you can run the build script again to process all icons.')
  } catch (error) {
    console.error('❌ Error creating missing icons:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith('create-missing-icons.js')) {
  createMissingIcons()
}
