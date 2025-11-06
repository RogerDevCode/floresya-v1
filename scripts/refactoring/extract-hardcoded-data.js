#!/usr/bin/env node

/**
 * Extract Hardcoded Data
 * Aplicando Clean Code principles (Martin Fowler)
 * Mueve datos hardcodeados a archivos JSON separados
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.join(__dirname, '..', '..')

/**
 * Extract names from auto-order-generator.js
 */
function extractNames() {
  const sourceFile = path.join(PROJECT_ROOT, 'scripts', 'auto-order-generator.js')
  const content = fs.readFileSync(sourceFile, 'utf-8')

  // Extract FIRST_NAMES array
  const firstNamesMatch = content.match(/const FIRST_NAMES = \[([\s\S]*?)\]/m)

  if (firstNamesMatch) {
    const namesStr = firstNamesMatch[1]
    const names = namesStr
      .split('\n')
      .map(line => line.trim().replace(/['",]/g, ''))
      .filter(line => line && !line.startsWith('//'))
      .map(name => ({ name, locale: 'es' }))

    const dataDir = path.join(PROJECT_ROOT, 'scripts', 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    fs.writeFileSync(path.join(dataDir, 'first-names.es.json'), JSON.stringify(names, null, 2))

    console.log(`✅ Extracted ${names.length} first names to data/first-names.es.json`)
  }

  // Extract LAST_NAMES array
  const lastNamesMatch = content.match(/const LAST_NAMES = \[([\s\S]*?)\]/m)

  if (lastNamesMatch) {
    const namesStr = lastNamesMatch[1]
    const names = namesStr
      .split('\n')
      .map(line => line.trim().replace(/['",]/g, ''))
      .filter(line => line && !line.startsWith('//'))
      .map(name => ({ name, locale: 'es' }))

    const dataDir = path.join(PROJECT_ROOT, 'scripts', 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    fs.writeFileSync(path.join(dataDir, 'last-names.es.json'), JSON.stringify(names, null, 2))

    console.log(`✅ Extracted ${names.length} last names to data/last-names.es.json`)
  }
}

/**
 * Extract Spanish cities from soft-delete-migration.js
 */
function extractCities() {
  const sourceFile = path.join(PROJECT_ROOT, 'scripts', 'soft-delete-migration.js')
  const content = fs.readFileSync(sourceFile, 'utf-8')

  const citiesMatch = content.match(/const SPANISH_CITIES = \[([\s\S]*?)\]/m)

  if (citiesMatch) {
    const namesStr = citiesMatch[1]
    const cities = namesStr
      .split('\n')
      .map(line => line.trim().replace(/['",]/g, ''))
      .filter(line => line && !line.startsWith('//'))

    const dataDir = path.join(PROJECT_ROOT, 'scripts', 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    fs.writeFileSync(path.join(dataDir, 'cities.es.json'), JSON.stringify(cities, null, 2))

    console.log(`✅ Extracted ${cities.length} cities to data/cities.es.json`)
  }
}

/**
 * Generate import statements for extracted data
 */
function generateImportTemplate() {
  const template = `// Import examples for extracted data

// Option 1: Direct import (ES6 modules)
import firstNames from './data/first-names.es.json'
import lastNames from './data/last-names.es.json'

// Usage:
const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]

// Option 2: Dynamic import
const data = await import('./data/first-names.es.json')
const firstNames = data.default

// Option 3: Fetch from file system
import fs from 'fs'
const firstNamesData = JSON.parse(
  fs.readFileSync('./scripts/data/first-names.es.json', 'utf-8')
)
`

  const dataDir = path.join(PROJECT_ROOT, 'scripts', 'data')
  fs.writeFileSync(path.join(dataDir, 'IMPORT-EXAMPLES.js'), template)
  console.log(`✅ Created import examples at data/IMPORT-EXAMPLES.js`)
}

/**
 * Main execution
 */
function main() {
  console.log('\n📦 Extracting Hardcoded Data\n')
  console.log('Applying Clean Code principles (Martin Fowler):')
  console.log('  - Separate data from logic')
  console.log('  - Configurable data')
  console.log('  - Easier maintenance\n')

  extractNames()
  extractCities()
  generateImportTemplate()

  console.log('\n✅ Extraction complete!\n')
  console.log('Next steps:')
  console.log('  1. Update auto-order-generator.js to import from JSON files')
  console.log('  2. Remove hardcoded arrays from source files')
  console.log('  3. Add data files to .gitignore if they contain PII\n')
}

main()
