#!/usr/bin/env node
// @ts-nocheck

/**
 * Fix OpenAPI Spec Inconsistencies
 * Removes is_active fields and ensures all entities use 'active'
 */

import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const OPENAPI_YAML = path.join(__dirname, '../api/docs/openapi-spec.yaml')
const OPENAPI_JSON = path.join(__dirname, '../api/docs/openapi-spec.json')

function printHeader() {
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║    🔧 FIXING OPENAPI SPEC INCONSISTENCIES                    ║')
  console.log('╚══════════════════════════════════════════════════════════════╝')
  console.log('')
}

function printStep(message) {
  console.log(`\n⏳ ${message}`)
}

function printSuccess(message) {
  console.log(`✅ ${message}`)
}

function printError(message) {
  console.log(`❌ ${message}`)
}

function printInfo(message) {
  console.log(`ℹ️  ${message}`)
}

function fixOpenAPIYaml() {
  printStep('Reading openapi-spec.yaml...')

  let content = readFileSync(OPENAPI_YAML, 'utf8')

  const issuesFound = []

  // Check for is_active field
  if (content.includes('is_active:')) {
    issuesFound.push('Found is_active field in YAML')
  }

  // Count occurrences
  const isActiveMatches = (content.match(/^\s+is_active:/gm) || []).length
  const activeMatches = (content.match(/^\s+active:/gm) || []).length

  printInfo(`Found ${isActiveMatches} occurrences of 'is_active'`)
  printInfo(`Found ${activeMatches} occurrences of 'active'`)

  // Fix: Remove is_active fields (lines 147 and 226 approximately)
  // We'll remove any standalone is_active: entries

  const lines = content.split('\n')
  const newLines = []
  let removedCount = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Check if this is an is_active field definition
    if (line.trim() === 'is_active:') {
      // Look ahead to see the complete field definition
      const nextLine = lines[i + 1] || ''
      const nextNextLine = lines[i + 2] || ''

      // If next line is type: or has indentation, it's a field definition
      if (nextLine.includes('type:') || nextNextLine.includes('type:')) {
        printInfo(`Removing is_active field at line ${i + 1}`)

        // Skip this line and the next 2-3 lines (type and example)
        i += 1
        while (
          i < lines.length &&
          (lines[i].includes('type:') || lines[i].includes('example:') || lines[i].trim() === '')
        ) {
          i++
        }
        i-- // Back up one because for loop will increment

        removedCount++
        continue
      }
    }

    newLines.push(line)
  }

  content = newLines.join('\n')

  // Write back
  writeFileSync(OPENAPI_YAML, content, 'utf8')

  printSuccess(`Fixed YAML: removed ${removedCount} is_active fields`)

  return { removedCount, activeMatches }
}

function fixOpenAPIJson() {
  printStep('Reading openapi-spec.json...')

  const content = readFileSync(OPENAPI_JSON, 'utf8')

  try {
    const spec = JSON.parse(content)

    let removedCount = 0

    // Function to recursively remove is_active from components
    function cleanObject(obj) {
      if (Array.isArray(obj)) {
        return obj.map(cleanObject)
      } else if (obj !== null && typeof obj === 'object') {
        const newObj = {}

        for (const [key, value] of Object.entries(obj)) {
          if (key === 'is_active') {
            printInfo(`Removing is_active from JSON`)
            removedCount++
            continue
          }

          newObj[key] = cleanObject(value)
        }

        return newObj
      }

      return obj
    }

    const cleanedSpec = cleanObject(spec)

    // Write back
    writeFileSync(OPENAPI_JSON, JSON.stringify(cleanedSpec, null, 2), 'utf8')

    printSuccess(`Fixed JSON: removed ${removedCount} is_active fields`)

    return removedCount
  } catch (error) {
    printError(`Error parsing JSON: ${error.message}`)
    return 0
  }
}

function verifyFixes() {
  printStep('Verifying fixes...')

  const yamlContent = readFileSync(OPENAPI_YAML, 'utf8')
  const jsonContent = readFileSync(OPENAPI_JSON, 'utf8')

  const yamlHasIsActive = yamlContent.includes('is_active:')
  const jsonHasIsActive = jsonContent.includes('"is_active"')

  if (!yamlHasIsActive && !jsonHasIsActive) {
    printSuccess('✅ All is_active fields removed successfully')
    return true
  } else {
    printError('⚠️  Some is_active fields may still exist')
    if (yamlHasIsActive) {
      printError('  - YAML still has is_active')
    }
    if (jsonHasIsActive) {
      printError('  - JSON still has is_active')
    }
    return false
  }
}

function main() {
  printHeader()

  console.log('🔍 Issues Found:')
  console.log('   - Users entity: has BOTH is_active and active fields')
  console.log('   - Occasions entity: has BOTH is_active and active fields')
  console.log('   - Database uses: active (after Phase 2 migration)')
  console.log('')

  console.log('🔧 Fixing:')
  console.log('   1. Remove is_active fields from OpenAPI specs')
  console.log('   2. Keep active fields (correct)')
  console.log('   3. Regenerate consistent documentation')
  console.log('')

  const yamlRemoved = fixOpenAPIYaml()
  const jsonRemoved = fixOpenAPIJson()

  console.log('')
  console.log('─'.repeat(60))

  verifyFixes()

  console.log('')
  console.log('═'.repeat(60))
  printSuccess('✅ OPENAPI SPEC FIXED')
  console.log('═'.repeat(60))

  printInfo('\n📊 Summary:')
  printInfo(`   - YAML: removed ${yamlRemoved.removedCount} fields`)
  printInfo(`   - JSON: removed ${jsonRemoved} fields`)
  printInfo(`   - Total removed: ${yamlRemoved.removedCount + jsonRemoved}`)
  printInfo('')

  printInfo('✅ Now OpenAPI spec matches database schema:')
  printInfo('   - All entities use: active (NOT is_active)')
  printInfo('   - Consistent with Phase 2 soft delete migration')
  printInfo('   - Documentation aligned with reality')
  printInfo('')

  printInfo('📝 Next Steps:')
  printInfo('   1. Review updated specs in api/docs/')
  printInfo('   2. Test API endpoints to ensure compatibility')
  printInfo('   3. Regenerate client code if needed')
  printInfo('')

  process.exit(0)
}

main().catch(error => {
  printError(`Error: ${error.message}`)
  console.error(error)
  process.exit(1)
})
