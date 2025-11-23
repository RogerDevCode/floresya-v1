#!/usr/bin/env node
// @ts-nocheck

/**
 * Execute Phase 1: Database Constraints Migration
 * Date: 2025-11-04
 *
 * This script prepares and guides the execution of the constraints migration
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MIGRATION_FILE = path.join(
  __dirname,
  '../../migrations/20251104_database_phase1_constraints.sql'
)

function printHeader() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗')
  console.log('║               🔧 FASE 1: DATABASE CONSTRAINTS MIGRATION                      ║')
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝')
  console.log('')
}

function printStep(stepNumber, title, description) {
  console.log(`\n📋 STEP ${stepNumber}: ${title}`)
  console.log('─'.repeat(80))
  console.log(description)
}

function printChecklistItem(text, indent = 0) {
  const spaces = '  '.repeat(indent)
  console.log(`${spaces}  ☐ ${text}`)
}

function validateMigrationFile() {
  console.log('\n🔍 VALIDATING MIGRATION FILE...')

  if (!fs.existsSync(MIGRATION_FILE)) {
    console.error('❌ Migration file not found:', MIGRATION_FILE)
    process.exit(1)
  }

  const content = fs.readFileSync(MIGRATION_FILE, 'utf8')
  const lines = content.split('\n')

  // Basic validations
  const validations = [
    { name: 'Has DO block', test: content.includes('DO $$') },
    { name: 'Has END block', test: content.includes('END $$') },
    { name: 'Has NOT NULL constraints', test: content.includes('SET NOT NULL') },
    { name: 'Has CHECK constraints', test: content.includes('ADD CONSTRAINT') },
    { name: 'Has triggers', test: content.includes('CREATE TRIGGER') },
    { name: 'Has indexes', test: content.includes('CREATE INDEX') },
    { name: 'Has ENUMs', test: content.includes('CREATE TYPE') }
  ]

  let allValid = true
  validations.forEach(v => {
    const status = v.test ? '✅' : '❌'
    console.log(`${status} ${v.name}`)
    if (!v.test) {
      allValid = false
    }
  })

  console.log(`\n📊 File size: ${(content.length / 1024).toFixed(2)} KB`)
  console.log(`📊 Total lines: ${lines.length}`)

  return allValid
}

function printDashboardInstructions() {
  printStep(
    2,
    'EXECUTE IN SUPABASE DASHBOARD',
    `
To apply the constraints to your database, follow these steps:

1. 🌐 Open your web browser and go to:
   https://supabase.com/dashboard

2. 🔑 Login to your Supabase account

3. 🗂️ Select your project: FloresYa

4. 📝 Navigate to the SQL Editor:
   - Click "SQL Editor" in the left sidebar
   - Click "New Query" button

5. 📋 Copy the migration file:
   - Open: migrations/20251104_database_phase1_constraints.sql
   - Copy ALL content (Ctrl+A, Ctrl+C)

6. 📌 Paste into the SQL Editor:
   - Paste the content into the query editor
   - Verify the content is complete

7. ▶️ Execute the migration:
   - Click "RUN" button (or Ctrl+Enter)
   - Wait for execution to complete

8. ✅ Verify success:
   Look for this message at the end:
   "=== MIGRACIÓN FASE 1 COMPLETADA ==="

`
  )

  console.log('⚠️  IMPORTANT NOTES:')
  printChecklistItem('This migration is IDEMPOTENT - safe to run multiple times', 1)
  printChecklistItem('May take 30-60 seconds to complete', 1)
  printChecklistItem('No downtime expected during execution', 1)
  printChecklistItem('Check for ERRORES and WARNINGS in the output', 1)
}

function printVerificationQueries() {
  printStep(
    3,
    'POST-MIGRATION VERIFICATION',
    `
After executing the migration, run these verification queries in the SQL Editor:

`
  )

  const queries = [
    {
      title: '1. Verify NOT NULL Constraints (should show 15+ fields):',
      query: `
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('users', 'products', 'orders', 'order_items', 'occasions',
                      'product_images', 'payment_methods', 'settings', 'busquedas_log',
                      'query_timeouts_log')
  AND is_nullable = 'NO'
ORDER BY table_name, column_name;`
    },
    {
      title: '2. Verify CHECK Constraints (should show 12+ constraints):',
      query: `
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_schema = 'public'
ORDER BY constraint_name;`
    },
    {
      title: '3. Verify Triggers (should show 2 triggers):',
      query: `
SELECT trigger_name, event_object_table, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;`
    },
    {
      title: '4. Verify Indexes (should show 5+ new indexes):',
      query: `
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename;`
    }
  ]

  queries.forEach(q => {
    console.log(q.title)
    console.log(q.query)
    console.log('')
  })
}

function printPostExecutionSteps() {
  printStep(
    4,
    'POST-EXECUTION STEPS',
    `
After the migration executes successfully:

1. 📊 Run verification queries (see STEP 3)

2. 🧪 Run automated tests:
   npm test

3. 🔍 Run linting:
   npm run lint

4. 💾 Commit the changes (if all tests pass):
   git add .
   git commit -m "feat: apply database constraints phase 1

   - 15 NOT NULL constraints
   - 12+ CHECK constraints
   - 2 critical triggers
   - 5 performance indexes
   - 3 ENUM types"

`
  )

  console.log('✅ If all verifications pass, Phase 1 is COMPLETE!')
}

function main() {
  printHeader()

  console.log('🎯 OBJECTIVE: Apply critical database constraints to ensure data integrity')
  console.log('📅 DATE: 2025-11-04')
  console.log('⏱️  ESTIMATED TIME: 5-10 minutes')
  console.log('💾 BACKUP STATUS: ✅ Database backup recommended before execution\n')

  // Step 1: Validate migration file
  printStep(1, 'FILE VALIDATION', 'Checking migration file integrity...')
  const isValid = validateMigrationFile()

  if (!isValid) {
    console.error('\n❌ Migration file validation failed. Please check the file.')
    process.exit(1)
  }

  console.log('\n✅ Migration file is valid and ready to execute')

  // Step 2: Dashboard instructions
  printDashboardInstructions()

  // Step 3: Verification
  printVerificationQueries()

  // Step 4: Post-execution
  printPostExecutionSteps()

  console.log('\n' + '═'.repeat(80))
  console.log('🚀 READY TO EXECUTE')
  console.log('═'.repeat(80))
  console.log('\n👉 Next: Open Supabase Dashboard → SQL Editor → Execute migration\n')
}

// Handle uncaught errors
process.on('uncaughtException', error => {
  console.error('\n❌ Uncaught Exception:', error.message)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n❌ Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Run
main().catch(error => {
  console.error('\n❌ Script error:', error)
  process.exit(1)
})
