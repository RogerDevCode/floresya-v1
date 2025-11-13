#!/usr/bin/env node

/**
 * Database Migration Runner
 * Executes database optimization migrations in proper order
 * Run with: node scripts/run-database-migrations.js
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const CONFIG = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  migrationsDir: path.join(__dirname, '../database/migrations'),
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose')
}

// Migration files in execution order
const MIGRATIONS = [
  '001_strategic_indexes.sql',
  '002_stored_functions.sql',
  '003_query_caching.sql',
  '004_connection_optimization.sql',
  '005_performance_monitoring.sql'
]

// Initialize Supabase client
const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey)

/**
 * Migration runner class
 */
class MigrationRunner {
  constructor() {
    this.executedMigrations = []
    this.errors = []
  }

  /**
   * Execute a single migration
   */
  async executeMigration(migrationFile) {
    const filePath = path.join(CONFIG.migrationsDir, migrationFile)

    if (CONFIG.verbose) {
      console.log(`📄 Reading migration: ${migrationFile}`)
    }

    // Read migration file
    const sql = fs.readFileSync(filePath, 'utf8')

    if (CONFIG.dryRun) {
      console.log(`🔍 DRY RUN: Would execute ${migrationFile}`)
      if (CONFIG.verbose) {
        console.log(`   SQL Preview: ${sql.substring(0, 200)}...`)
      }
      return { success: true, dryRun: true }
    }

    console.log(`⚡ Executing migration: ${migrationFile}`)

    try {
      // Split SQL into individual statements and execute
      const statements = this.splitSqlStatements(sql)

      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec_sql', { sql: statement })

          if (error) {
            throw new Error(
              `SQL Error: ${error.message}\nStatement: ${statement.substring(0, 100)}...`
            )
          }
        }
      }

      console.log(`✅ Migration completed: ${migrationFile}`)
      return { success: true, statements: statements.length }
    } catch (error) {
      console.error(`❌ Migration failed: ${migrationFile}`)
      console.error(`   Error: ${error.message}`)
      this.errors.push({
        migration: migrationFile,
        error: error.message,
        timestamp: new Date().toISOString()
      })
      return { success: false, error: error.message }
    }
  }

  /**
   * Split SQL into individual statements
   */
  splitSqlStatements(sql) {
    // Simple SQL splitter - handles basic cases
    const statements = []
    let currentStatement = ''
    let inString = false
    let stringChar = ''
    let inComment = false

    for (let i = 0; i < sql.length; i++) {
      const char = sql[i]
      const nextChar = sql[i + 1] || ''

      // Handle comments
      if (!inString && !inComment) {
        if (char === '-' && nextChar === '-') {
          inComment = true
          continue
        }
        if (char === '/' && nextChar === '*') {
          inComment = true
          i++ // Skip next char
          continue
        }
      }

      if (inComment) {
        if (char === '\n' && inComment === 'line') {
          inComment = false
        }
        if (char === '*' && nextChar === '/') {
          inComment = false
          i++ // Skip next char
        }
        continue
      }

      // Handle strings
      if (!inString && (char === '"' || char === "'")) {
        inString = true
        stringChar = char
      } else if (inString && char === stringChar && sql[i - 1] !== '\\') {
        inString = false
        stringChar = ''
      }

      // Add character to current statement
      currentStatement += char

      // Check for statement end
      if (!inString && char === ';') {
        statements.push(currentStatement.trim())
        currentStatement = ''
      }
    }

    // Add remaining statement if any
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim())
    }

    return statements
  }

  /**
   * Check if migration files exist
   */
  checkMigrationFiles() {
    const missing = []

    for (const migration of MIGRATIONS) {
      const filePath = path.join(CONFIG.migrationsDir, migration)
      if (!fs.existsSync(filePath)) {
        missing.push(migration)
      }
    }

    if (missing.length > 0) {
      console.error('❌ Missing migration files:')
      missing.forEach(file => console.error(`   - ${file}`))
      return false
    }

    return true
  }

  /**
   * Run all migrations
   */
  async runMigrations() {
    console.log('🚀 Starting Database Optimization Migrations')
    console.log('='.repeat(60))

    if (CONFIG.dryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be made')
    }

    // Check prerequisites
    if (!CONFIG.supabaseUrl || !CONFIG.supabaseKey) {
      console.error('❌ Missing required environment variables:')
      console.error('   SUPABASE_URL')
      console.error('   SUPABASE_SERVICE_ROLE_KEY')
      process.exit(1)
    }

    if (!this.checkMigrationFiles()) {
      process.exit(1)
    }

    // Test connection
    try {
      const { error } = await supabase.from('products').select('id').limit(1)
      if (error) {
        throw error
      }
      console.log('✅ Database connection successful')
    } catch (error) {
      console.error('❌ Database connection failed:', error.message)
      process.exit(1)
    }

    // Execute migrations in order
    const results = []
    for (const migration of MIGRATIONS) {
      const result = await this.executeMigration(migration)
      results.push({ migration, ...result })

      // Stop on first error unless in dry run
      if (!result.success && !CONFIG.dryRun) {
        console.error('🛑 Stopping migration execution due to error')
        break
      }
    }

    // Print summary
    this.printSummary(results)

    // Exit with appropriate code
    const hasErrors = this.errors.length > 0
    if (hasErrors && !CONFIG.dryRun) {
      console.error('❌ Migration execution completed with errors')
      process.exit(1)
    } else {
      console.log('🎉 Migration execution completed successfully!')
    }
  }

  /**
   * Print execution summary
   */
  printSummary(results) {
    console.log('\n' + '='.repeat(60))
    console.log('📊 MIGRATION EXECUTION SUMMARY')
    console.log('='.repeat(60))

    results.forEach(result => {
      const status = result.success ? '✅' : '❌'
      const mode = result.dryRun ? ' (DRY RUN)' : ''
      console.log(`${status} ${result.migration}${mode}`)

      if (result.statements) {
        console.log(`   Executed ${result.statements} SQL statements`)
      }
      if (result.error) {
        console.log(`   Error: ${result.error}`)
      }
    })

    if (this.errors.length > 0) {
      console.log(`\n❌ Errors encountered: ${this.errors.length}`)
      this.errors.forEach(err => {
        console.log(`   ${err.migration}: ${err.error}`)
      })
    }

    const successful = results.filter(r => r.success).length
    const total = results.length
    console.log(
      `\n📈 Success Rate: ${successful}/${total} (${Math.round((successful / total) * 100)}%)`
    )
  }
}

/**
 * Main execution
 */
async function main() {
  const runner = new MigrationRunner()
  await runner.runMigrations()
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('💥 Unexpected error:', error)
    process.exit(1)
  })
}

export { MigrationRunner }
