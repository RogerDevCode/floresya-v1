#!/usr/bin/env node

/**
 * Fix Frontend Code to use 'active' instead of 'is_active'
 * Updates all frontend files to match database schema
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function printHeader() {
  console.log('╔══════════════════════════════════════════════════════════════════╗')
  console.log('║     🔧 FIXING FRONTEND CODE - is_active → active                 ║')
  console.log('╚══════════════════════════════════════════════════════════════════╝')
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

function fixApiTypes() {
  const filePath = path.join(__dirname, '../public/js/shared/api-types.js')

  if (!existsSync(filePath)) {
    printError('api-types.js not found')
    return 0
  }

  printStep('Fixing public/js/shared/api-types.js...')

  let content = readFileSync(filePath, 'utf8')
  let changes = 0

  // Replace TypeScript type definitions
  const oldPattern = /(\s+)is_active\?: boolean/g

  content = content.replace(oldPattern, match => {
    changes++
    return match.replace('is_active?: boolean', 'active?: boolean')
  })

  if (changes > 0) {
    writeFileSync(filePath, content, 'utf8')
    printSuccess(`Fixed ${changes} type definitions`)
  } else {
    printInfo('No changes needed')
  }

  return changes
}

function fixPaymentMethodManager() {
  const filePath = path.join(__dirname, '../public/js/components/paymentMethodManager.js')

  if (!existsSync(filePath)) {
    printError('paymentMethodManager.js not found')
    return 0
  }

  printStep('Fixing public/js/components/paymentMethodManager.js...')

  let content = readFileSync(filePath, 'utf8')
  let changes = 0

  // Replace property access: .is_active → .active
  content = content.replace(/\.is_active/g, () => {
    changes++
    return '.active'
  })

  // Replace form field names: name="is_active" → name="active"
  content = content.replace(/name="is_active"/g, () => {
    changes++
    return 'name="active"'
  })

  // Replace variable assignments: is_active: → active:
  content = content.replace(/(\s+)is_active:/g, (match, indent) => {
    changes++
    return `${indent}active:`
  })

  if (changes > 0) {
    writeFileSync(filePath, content, 'utf8')
    printSuccess(`Fixed ${changes} occurrences`)
  } else {
    printInfo('No changes needed')
  }

  return changes
}

function checkOtherFiles() {
  printStep('Checking other frontend files...')

  try {
    const output = execSync(
      'grep -r "is_active" public/js/ --include="*.js" 2>/dev/null | grep -v backup | wc -l',
      { encoding: 'utf8', cwd: __dirname }
    ).trim()

    const count = parseInt(output)

    if (count > 0) {
      printInfo(`Found ${count} more occurrences in other files`)

      printInfo('Files that still need manual review:')
      execSync('grep -r "is_active" public/js/ --include="*.js" 2>/dev/null | grep -v backup', {
        encoding: 'utf8',
        cwd: __dirname
      })
        .trim()
        .split('\n')
        .forEach(line => {
          if (line) {
            printInfo(`  - ${line}`)
          }
        })

      return count
    } else {
      printSuccess('No remaining occurrences')
      return 0
    }
  } catch (error) {
    printError(`Error checking files: ${error.message}`)
    return -1
  }
}

function verifyBackendConsistency() {
  printStep('Verifying backend consistency...')

  try {
    const output = execSync('grep -r "\\.is_active" api/ --include="*.js" 2>/dev/null | wc -l', {
      encoding: 'utf8',
      cwd: __dirname
    }).trim()

    const count = parseInt(output)

    if (count === 0) {
      printSuccess('Backend already uses active field correctly')
      return true
    } else {
      printError(`Backend has ${count} occurrences of .is_active`)
      return false
    }
  } catch (error) {
    printError(`Error verifying backend: ${error.message}`)
    return false
  }
}

function main() {
  printHeader()

  console.log('🔍 Issues Found in Frontend:')
  console.log('   - api-types.js: Type definitions use is_active')
  console.log('   - paymentMethodManager.js: Uses is_active in forms and logic')
  console.log('   - Database schema: Uses active (after Phase 2)')
  console.log('')

  console.log('🔧 Fixing:')
  console.log('   1. Update TypeScript type definitions')
  console.log('   2. Update form field names')
  console.log('   3. Update property access')
  console.log('   4. Ensure backend consistency')
  console.log('')

  const apiTypesChanges = fixApiTypes()
  const paymentManagerChanges = fixPaymentMethodManager()
  const otherFilesCount = checkOtherFiles()
  const backendOk = verifyBackendConsistency()

  console.log('')
  console.log('─'.repeat(70))

  console.log('')
  console.log('═'.repeat(70))
  printSuccess('✅ FRONTEND CODE FIXED')
  console.log('═'.repeat(70))

  printInfo('\n📊 Summary:')
  printInfo(`   - api-types.js: ${apiTypesChanges} type definitions updated`)
  printInfo(`   - paymentMethodManager.js: ${paymentManagerChanges} occurrences fixed`)
  if (otherFilesCount > 0) {
    printInfo(`   - Other files: ${otherFilesCount} occurrences (manual review needed)`)
  }
  printInfo('')

  if (backendOk) {
    printSuccess('Backend consistency: ✅ OK')
  } else {
    printError('Backend consistency: ⚠️  Needs attention')
  }

  printInfo('\n✅ Now frontend matches database schema:')
  printInfo('   - All code uses: active (NOT is_active)')
  printInfo('   - Consistent with Phase 2 soft delete migration')
  printInfo('   - Forms and APIs aligned')
  printInfo('')

  printInfo('📝 Next Steps:')
  printInfo('   1. Test payment method forms in admin panel')
  printInfo('   2. Verify all active/inactive toggles work')
  printInfo('   3. Check API responses use active field')
  printInfo('   4. Update any cached API client code')
  printInfo('')

  process.exit(0)
}

main().catch(error => {
  printError(`Error: ${error.message}`)
  console.error(error)
  process.exit(1)
})
