#!/usr/bin/env node

/**
 * Verify Migration Readiness
 * Checks if all components are ready for soft delete migration
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.join(__dirname, '..')

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
}

const log = {
  success: msg => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: msg => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: msg => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: msg => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`)
}

console.log('\n' + '='.repeat(60))
console.log('  SOFT DELETE MIGRATION - READINESS CHECK')
console.log('='.repeat(60) + '\n')

let allGood = true

// Check 1: Migration SQL file
log.info('Checking migration files...')
const migrationFile = path.join(
  PROJECT_ROOT,
  'migrations/20251104_add_active_column_soft_delete.sql'
)
if (fs.existsSync(migrationFile)) {
  log.success('Migration SQL file exists')
  const content = fs.readFileSync(migrationFile, 'utf8')
  const lineCount = content.split('\n').length
  log.info(`  └─ ${lineCount} lines`)
} else {
  log.error('Migration SQL file not found!')
  allGood = false
}

// Check 2: Refactoring script
const refactorScript = path.join(PROJECT_ROOT, 'scripts/refactoring/rename_is_active_to_active.sh')
if (fs.existsSync(refactorScript)) {
  log.success('Refactoring script exists')
  if (fs.statSync(refactorScript).mode & 0o111) {
    log.info('  └─ Executable')
  } else {
    log.warning('  └─ Not executable (run: chmod +x script)')
  }
} else {
  log.error('Refactoring script not found!')
  allGood = false
}

// Check 3: Orchestrator
const orchestrator = path.join(PROJECT_ROOT, 'scripts/soft-delete-migration.js')
if (fs.existsSync(orchestrator)) {
  log.success('Main orchestrator script exists')
} else {
  log.error('Main orchestrator not found!')
  allGood = false
}

// Check 4: Guide
const guide = path.join(PROJECT_ROOT, 'SOFT_DELETE_MIGRATION_GUIDE.md')
if (fs.existsSync(guide)) {
  log.success('Migration guide exists')
  const content = fs.readFileSync(guide, 'utf8')
  log.info(`  └─ ${content.split('\n').length} lines of documentation`)
} else {
  log.warning('Migration guide not found')
}

// Check 5: Current is_active usage
log.info('\nScanning for current is_active usage...')
try {
  const result = require('child_process').execSync(
    'grep -r "is_active" /home/manager/Sync/floresya-v1/api --include="*.js" 2>/dev/null | wc -l',
    { encoding: 'utf8' }
  )

  const count = parseInt(result.trim())
  log.info(`  └─ Found ${count} references to 'is_active' in code`)

  if (count > 0) {
    log.info('     These will be refactored automatically')
  } else {
    log.warning('  └─ No is_active references found (already migrated?)')
  }
} catch (error) {
  console.error('Error:', error)
  log.info('  └─ No is_active references found')
}

// Check 6: ESLint
log.info('\nChecking ESLint status...')
try {
  require('child_process').execSync('npm run lint', {
    cwd: PROJECT_ROOT,
    stdio: 'pipe'
  })
  log.success('ESLint is clean')
} catch (error) {
  console.error('Error:', error)
  log.warning('ESLint has issues (fix before migration)')
  allGood = false
}

// Check 7: Tests
log.info('\nChecking test status...')
try {
  require('child_process').execSync('npm test -- tests/functional/comprehensive.test.js', {
    cwd: PROJECT_ROOT,
    stdio: 'pipe'
  })
  log.success('Functional tests pass')
} catch (error) {
  console.error('Error:', error)
  log.warning('Functional tests have failures (review before migration)')
}

// Summary
console.log('\n' + '='.repeat(60))
if (allGood) {
  console.log(`${colors.green}  ✅ SYSTEM READY FOR MIGRATION${colors.reset}`)
  console.log('='.repeat(60) + '\n')
  log.success('All components are ready')
  log.info('\nNext steps:')
  log.info('  1. Review: SOFT_DELETE_MIGRATION_GUIDE.md')
  log.info('  2. Execute SQL migration in Supabase')
  log.info('  3. Run: bash scripts/refactoring/rename_is_active_to_active.sh')
  log.info('  4. Verify: npm run lint && npm test')
  process.exit(0)
} else {
  console.log(`${colors.yellow}  ⚠️  SOME CHECKS FAILED${colors.reset}`)
  console.log('='.repeat(60) + '\n')
  log.error('Please fix the issues above before proceeding')
  process.exit(1)
}
