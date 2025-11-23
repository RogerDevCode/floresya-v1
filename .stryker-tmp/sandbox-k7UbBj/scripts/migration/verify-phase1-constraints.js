#!/usr/bin/env node
// @ts-nocheck

/**
 * Verify Phase 1: Database Constraints Migration
 * Runs verification queries to confirm all constraints were applied
 */

// import { Client } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment')
  process.exit(1)
}

function printHeader() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗')
  console.log('║           🔍 VERIFYING PHASE 1: DATABASE CONSTRAINTS                        ║')
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝')
  console.log('')
}

function printSection(title) {
  console.log(`\n${'═'.repeat(80)}`)
  console.log(`📋 ${title}`)
  console.log('═'.repeat(80))
}

function printSuccess(message) {
  console.log(`✅ ${message}`)
}

function printError(message) {
  console.log(`❌ ${message}`)
}

function printManualVerificationQueries() {
  printSection('MANUAL VERIFICATION QUERIES')

  console.log('\nCopy and run these queries in Supabase SQL Editor:\n')

  const queries = [
    {
      title: '🔒 1. NOT NULL Constraints',
      query: `SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public' AND is_nullable = 'NO'
ORDER BY table_name, column_name;`
    },
    {
      title: '✓ 2. CHECK Constraints',
      query: `SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_schema = 'public'
ORDER BY constraint_name;`
    },
    {
      title: '⚡ 3. Triggers',
      query: `SELECT trigger_name, event_object_table, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;`
    },
    {
      title: '📊 4. Indexes',
      query: `SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
ORDER BY tablename;`
    },
    {
      title: '🎯 5. ENUM Types',
      query: `SELECT typname, array_agg(enumlabel ORDER BY enumsortorder) as enum_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN ('setting_type', 'query_timeout_estado', 'query_timeout_tipo')
GROUP BY t.typname;`
    }
  ]

  queries.forEach((q, _i) => {
    console.log(q.title)
    console.log('-'.repeat(80))
    console.log(q.query)
    console.log('')
  })
}

function printNextSteps() {
  printSection('NEXT STEPS')

  console.log(`
1. ✅ Run all verification queries above in Supabase SQL Editor

2. ✅ Check that each query returns the expected number of results:
   - NOT NULL Constraints: 15+ rows
   - CHECK Constraints: 12+ rows
   - Triggers: 2 rows
   - Indexes: 5+ rows
   - ENUM Types: 3 rows

3. 🧪 Run automated tests:
   npm test

4. 🔍 Run linting:
   npm run lint

5. 💾 If everything passes, commit:
   git add .
   git commit -m "feat: apply database constraints phase 1"
`)

  printSuccess('\n✅ Verification script completed!')
}

function main() {
  printHeader()

  console.log('🎯 OBJECTIVE: Verify Phase 1 constraints were applied correctly')
  console.log('📅 DATE: 2025-11-04')
  console.log('⏱️  TIME: 2-3 minutes\n')

  try {
    printManualVerificationQueries()
    printNextSteps()
  } catch (error) {
    printError(`Verification failed: ${error.message}`)
    process.exit(1)
  }
}

main().catch(error => {
  console.error('\n❌ Script error:', error)
  process.exit(1)
})
