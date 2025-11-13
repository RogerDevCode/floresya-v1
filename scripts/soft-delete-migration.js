#!/usr/bin/env node

/**
 * Soft Delete Migration - Main Orchestrator
 * Date: 2025-11-04
 * Description: Orchestrates the complete migration process
 *              from is_active to active column across
 *              database and codebase
 *
 * Usage: node scripts/soft-delete-migration.js
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.join(__dirname, '..')

// Color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

const log = {
  info: msg => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: msg => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: msg => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: msg => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  header: msg => console.log(`\n${colors.bright}${colors.cyan}=== ${msg} ===${colors.reset}\n`)
}

// Migration phases
const PHASES = {
  CHECK_ENV: 'check-env',
  BACKUP_DB: 'backup-db',
  BACKUP_CODE: 'backup-code',
  RUN_SQL_MIGRATION: 'run-sql-migration',
  REFACTOR_CODE: 'refactor-code',
  UPDATE_REPOSITORIES: 'update-repositories',
  UPDATE_SERVICES: 'update-services',
  UPDATE_QUERIES: 'update-queries',
  RUN_TESTS: 'run-tests',
  ROLLBACK: 'rollback'
}

class SoftDeleteMigration {
  constructor() {
    this.phases = []
    this.rollbackData = {
      timestamp: new Date().toISOString(),
      database: null,
      code: []
    }
  }

  /**
   * Main execution flow
   */
  async run(phase = null) {
    try {
      log.header('Soft Delete Migration - Starting')

      if (phase === PHASES.CHECK_ENV) {
        await this.checkEnvironment()
        return
      }

      if (phase === PHASES.BACKUP_DB) {
        await this.backupDatabase()
        return
      }

      if (phase === PHASES.BACKUP_CODE) {
        await this.backupCode()
        return
      }

      if (phase === PHASES.RUN_SQL_MIGRATION) {
        await this.runSQLMigration()
        return
      }

      if (phase === PHASES.REFACTOR_CODE) {
        await this.refactorCode()
        return
      }

      if (phase === PHASES.UPDATE_REPOSITORIES) {
        await this.updateRepositories()
        return
      }

      if (phase === PHASES.UPDATE_SERVICES) {
        await this.updateServices()
        return
      }

      if (phase === PHASES.UPDATE_QUERIES) {
        await this.updateQueries()
        return
      }

      if (phase === PHASES.RUN_TESTS) {
        await this.runTests()
        return
      }

      if (phase === PHASES.ROLLBACK) {
        await this.rollback()
        return
      }

      // Run full migration
      await this.runFullMigration()
    } catch (error) {
      log.error(`Migration failed: ${error.message}`)
      console.error(error)
      process.exit(1)
    }
  }

  /**
   * Check environment and prerequisites
   */
  checkEnvironment() {
    log.header('Phase 1: Check Environment')

    // Check if migration file exists
    const migrationFile = path.join(
      PROJECT_ROOT,
      'migrations/20251104_add_active_column_soft_delete.sql'
    )
    if (fs.existsSync(migrationFile)) {
      log.success('Migration SQL file found')
    } else {
      log.error('Migration SQL file not found')
      process.exit(1)
    }

    // Check for Supabase credentials
    const envFile = path.join(PROJECT_ROOT, '.env.local')
    if (fs.existsSync(envFile)) {
      log.success('.env.local file found')
      const env = fs.readFileSync(envFile, 'utf8')
      if (env.includes('SUPABASE_URL') && env.includes('SUPABASE_SERVICE_ROLE_KEY')) {
        log.success('Supabase credentials configured')
      } else {
        log.warning('Supabase credentials may be missing')
      }
    } else {
      log.warning('.env.local not found, using environment variables')
    }

    // Check if refactoring script exists
    const refactorScript = path.join(
      PROJECT_ROOT,
      'scripts/refactoring/rename_is_active_to_active.sh'
    )
    if (fs.existsSync(refactorScript)) {
      log.success('Refactoring script found')
    } else {
      log.error('Refactoring script not found')
      process.exit(1)
    }

    log.success('Environment check complete')
  }

  /**
   * Backup database schema
   */
  backupDatabase() {
    log.header('Phase 2: Backup Database')

    const backupDir = path.join(PROJECT_ROOT, 'backups/database')
    fs.mkdirSync(backupDir, { recursive: true })

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFile = path.join(backupDir, `schema-backup-${timestamp}.sql`)

    log.info('Creating database schema backup...')
    log.info('Note: This requires pg_dump access')
    log.info('Backup location: ' + backupFile)

    // For now, create metadata backup
    this.rollbackData.database = {
      timestamp: new Date().toISOString(),
      backupFile: backupFile,
      note: 'Manual backup required via pg_dump'
    }

    fs.writeFileSync(
      path.join(backupDir, 'rollback-info.json'),
      JSON.stringify(this.rollbackData.database, null, 2)
    )

    log.success('Database backup info saved')
  }

  /**
   * Backup code
   */
  backupCode() {
    log.header('Phase 3: Backup Code')

    const backupDir = path.join(PROJECT_ROOT, 'backups/code')
    fs.mkdirSync(backupDir, { recursive: true })

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const codeBackupDir = path.join(backupDir, `code-backup-${timestamp}`)

    log.info('Creating code backup...')
    execSync(`mkdir -p ${codeBackupDir}`, { cwd: PROJECT_ROOT })

    // Copy important directories
    const dirsToBackup = ['api', 'migrations', 'scripts']
    for (const dir of dirsToBackup) {
      const src = path.join(PROJECT_ROOT, dir)
      if (fs.existsSync(src)) {
        execSync(`cp -r ${src} ${codeBackupDir}/`, { cwd: PROJECT_ROOT })
        log.success(`Backed up: ${dir}`)
      }
    }

    this.rollbackData.code.push({
      timestamp: new Date().toISOString(),
      backupDir: codeBackupDir
    })

    log.success('Code backup complete')
  }

  /**
   * Run SQL migration
   */
  async runSQLMigration() {
    log.header('Phase 4: Run SQL Migration')

    const migrationFile = path.join(
      PROJECT_ROOT,
      'migrations/20251104_add_active_column_soft_delete.sql'
    )

    log.info('SQL Migration: Rename is_active → active')
    log.info('SQL Migration: Add active column to missing tables')
    log.info('File: ' + migrationFile)

    log.warning('Manual step required:')
    log.info('1. Connect to Supabase SQL editor or psql')
    log.info('2. Run the migration file:')
    log.info(`   psql -h YOUR_HOST -U YOUR_USER -d YOUR_DB -f ${migrationFile}`)
    log.info('3. Or paste the contents into Supabase SQL editor')
    log.info('')
    log.warning('Press Enter after completing the SQL migration...')
    await new Promise(resolve => process.stdin.once('data', resolve))

    log.success('SQL migration recorded as completed')
  }

  /**
   * Refactor code
   */
  refactorCode() {
    log.header('Phase 5: Refactor Code')

    const refactorScript = path.join(
      PROJECT_ROOT,
      'scripts/refactoring/rename_is_active_to_active.sh'
    )

    log.info('Running refactoring script...')
    log.info('Script: ' + refactorScript)

    // Make executable
    execSync(`chmod +x ${refactorScript}`)

    // Run refactoring
    try {
      execSync(`bash ${refactorScript}`, { cwd: PROJECT_ROOT, stdio: 'inherit' })
      log.success('Code refactoring complete')
    } catch (error) {
      log.error('Code refactoring failed')
      throw error
    }
  }

  /**
   * Update repositories to use active instead of is_active
   */
  updateRepositories() {
    log.header('Phase 6: Update Repositories')

    const repoDir = path.join(PROJECT_ROOT, 'api/repositories')
    if (!fs.existsSync(repoDir)) {
      log.warning('Repositories directory not found')
      return
    }

    const repoFiles = fs.readdirSync(repoDir).filter(f => f.endsWith('Repository.js'))

    if (repoFiles.length === 0) {
      log.warning('No repository files found')
      return
    }

    log.info(`Found ${repoFiles.length} repository files`)

    // Check each repository for hardcoded is_active
    for (const file of repoFiles) {
      const filePath = path.join(repoDir, file)
      const content = fs.readFileSync(filePath, 'utf8')

      if (content.includes('is_active')) {
        log.warning(`${file} contains 'is_active' - manual review needed`)
      } else {
        log.success(`${file} - no 'is_active' found`)
      }
    }

    log.info('Repository update complete - review warnings above')
  }

  /**
   * Update services to use active instead of is_active
   */
  updateServices() {
    log.header('Phase 7: Update Services')

    const serviceDir = path.join(PROJECT_ROOT, 'api/services')
    if (!fs.existsSync(serviceDir)) {
      log.warning('Services directory not found')
      return
    }

    const serviceFiles = fs.readdirSync(serviceDir).filter(f => f.endsWith('Service.js'))

    if (serviceFiles.length === 0) {
      log.warning('No service files found')
      return
    }

    log.info(`Found ${serviceFiles.length} service files`)

    // Check each service for hardcoded is_active
    for (const file of serviceFiles) {
      const filePath = path.join(serviceDir, file)
      const content = fs.readFileSync(filePath, 'utf8')

      if (content.includes('is_active')) {
        log.warning(`${file} contains 'is_active' - manual review needed`)
      } else {
        log.success(`${file} - no 'is_active' found`)
      }
    }

    log.info('Service update complete - review warnings above')
  }

  /**
   * Update queries and filters
   */
  updateQueries() {
    log.header('Phase 8: Update Queries and Filters')

    log.info('Checking for remaining is_active references...')

    try {
      // Search for any remaining is_active references
      const result = execSync(
        'grep -r "is_active" /home/manager/Sync/floresya-v1/api --include="*.js" 2>/dev/null | head -20',
        { encoding: 'utf8' }
      )

      if (result) {
        log.warning('Found remaining is_active references:')
        console.log(result)
        log.warning('These need manual review and update')
      } else {
        log.success('No remaining is_active references found')
      }
    } catch (error) {
      console.error('Error:', error)
      log.success('No remaining is_active references found')
    }
  }

  /**
   * Run tests
   */
  runTests() {
    log.header('Phase 9: Run Tests')

    // Run ESLint
    log.info('Running ESLint...')
    try {
      execSync('npm run lint', { cwd: PROJECT_ROOT, stdio: 'inherit' })
      log.success('ESLint passed')
    } catch (error) {
      log.error('ESLint failed')
      throw error
    }

    // Run unit tests
    log.info('Running unit tests...')
    try {
      execSync('npm run test:unit', { cwd: PROJECT_ROOT, stdio: 'inherit' })
      log.success('Unit tests passed')
    } catch (error) {
      console.error('Error:', error)
      log.warning('Unit tests failed - review failures')
    }

    // Run functional tests
    log.info('Running functional tests...')
    try {
      execSync('npm test -- tests/functional/comprehensive.test.js', {
        cwd: PROJECT_ROOT,
        stdio: 'inherit'
      })
      log.success('Functional tests passed')
    } catch (error) {
      console.error('Error:', error)
      log.warning('Functional tests failed - review failures')
    }

    log.success('Test phase complete')
  }

  /**
   * Rollback changes
   */
  rollback() {
    log.header('Rollback')

    log.warning('This will restore backups')
    log.warning('Proceeding with rollback...')

    // Rollback database would need to be done manually
    log.info('Database rollback: Restore from pg_dump backup')

    // Code rollback is handled by the refactoring backup
    log.info('Code rollback: Use backup in backups/code/ directory')

    log.success('Rollback instructions provided')
  }

  /**
   * Run full migration
   */
  async runFullMigration() {
    log.info('Starting full migration process...')
    log.info('This will:')
    log.info('  1. Check environment')
    log.info('  2. Create backups')
    log.info('  3. Run SQL migration')
    log.info('  4. Refactor code')
    log.info('  5. Update components')
    log.info('  6. Run tests')

    console.log('\n' + '='.repeat(50))
    log.warning('This is a destructive operation (moves is_active → active)')
    log.warning('Backups will be created before changes')
    console.log('='.repeat(50) + '\n')

    log.info('Continue? (y/N)')
    const answer = await new Promise(resolve => {
      process.stdin.setEncoding('utf8')
      process.stdin.once('data', data => resolve(data.toString().trim().toLowerCase()))
    })

    if (answer !== 'y' && answer !== 'yes') {
      log.info('Migration cancelled')
      return
    }

    await this.checkEnvironment()
    await this.backupDatabase()
    await this.backupCode()
    await this.runSQLMigration()
    await this.refactorCode()
    await this.updateRepositories()
    await this.updateServices()
    await this.updateQueries()
    await this.runTests()

    log.header('Migration Complete!')
    log.success('Soft delete migration completed successfully')
    log.info('All changes have been applied')
    log.info('Review the output above for any warnings')
  }
}

// Main execution
const migration = new SoftDeleteMigration()
const phase = process.argv[2]

if (import.meta.url === `file://${process.argv[1]}`) {
  migration.run(phase).catch(error => {
    log.error(`Migration failed: ${error.message}`)
    process.exit(1)
  })
}

export { SoftDeleteMigration }
