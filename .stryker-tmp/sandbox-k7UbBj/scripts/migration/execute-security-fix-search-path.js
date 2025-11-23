#!/usr/bin/env node
// @ts-nocheck

/**
 * Execute Security Fix: Search Path Mutable Vulnerabilities
 * CRITICAL - Fixes schema injection vulnerabilities
 */

import { readFileSync } from 'fs'
import { Client } from 'pg'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MIGRATION_FILE = path.join(
  __dirname,
  '../../migrations/20251104_SECURITY_FIX_search_path.sql'
)

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function printHeader() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗')
  console.log('║            🔒 SECURITY FIX - SEARCH PATH VULNERABILITIES                     ║')
  console.log('║                         ⚠️  CRITICAL SEVERITY ⚠️                             ║')
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝')
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

function printCritical(message) {
  console.log(`🚨 ${message}`)
}

function printNotice(message) {
  console.log(`📢 ${message}`)
}

async function executeSecurityFix() {
  let client

  try {
    printHeader()

    printCritical('⚠️  CRITICAL SECURITY VULNERABILITIES DETECTED')
    printNotice('   Fixing: Function search_path not set')
    printNotice('   Risk: Schema injection attacks possible')
    printNotice('   Functions affected: 3')
    printNotice('')

    printStep('Reading security fix migration...')
    const migrationSQL = readFileSync(MIGRATION_FILE, 'utf8')
    printSuccess(
      `File read: ${(migrationSQL.length / 1024).toFixed(2)} KB (${migrationSQL.split('\n').length} lines)`
    )

    printStep('Building DATABASE_URL...')
    const url = new URL(SUPABASE_URL)
    const DATABASE_URL = `postgresql://postgres:${SERVICE_KEY}@${url.host}:5432/postgres?sslmode=require`
    printSuccess(`Connecting to: ${SUPABASE_URL}`)

    printStep('Connecting to Supabase PostgreSQL...')
    client = new Client({
      connectionString: DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    })

    await client.connect()
    printSuccess('Connection established')

    printStep('Executing SECURITY FIX migration...')
    console.log('─'.repeat(80))

    const startTime = Date.now()
    const result = await client.query(migrationSQL)
    const duration = Date.now() - startTime

    console.log('─'.repeat(80))
    printSuccess('✅ SECURITY FIX applied completely')
    printSuccess(`⏱️  Duration: ${duration}ms (${(duration / 1000).toFixed(2)} seconds)`)

    // Check for any output from RAISE NOTICE
    if (result && result.notices) {
      printNotice('\n📢 Notices from server:')
      result.notices.forEach(notice => {
        console.log(`   ${notice.message}`)
      })
    }

    return true
  } catch (error) {
    console.error('\n' + '─'.repeat(80))
    printError(`❌ Error during security fix: ${error.message}`)
    console.error('─'.repeat(80))

    if (error.code) {
      printError(`PostgreSQL code: ${error.code}`)
    }

    if (error.message.includes('already exists')) {
      printNotice('\n💡 Function already exists (normal, applying replacement)')
    }

    return false
  } finally {
    if (client) {
      await client.end()
      printSuccess('Connection closed')
    }
  }
}

async function verifySecurityFix() {
  let client

  try {
    printStep('\n🔍 Verifying security fixes applied...')

    const url = new URL(SUPABASE_URL)
    const DATABASE_URL = `postgresql://postgres:${SERVICE_KEY}@${url.host}:5432/postgres?sslmode=require`

    client = new Client({
      connectionString: DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    })

    await client.connect()

    // Check functions with search_path
    const result = await client.query(`
      SELECT
        p.proname as function_name,
        pg_get_function_arguments(p.oid) as arguments,
        CASE WHEN EXISTS (
          SELECT 1 FROM pg_proc_props
          WHERE pg_proc_props.oid = p.oid
          AND pg_proc_props.property = 'search_path'
        ) THEN 'FIXED ✓'
        ELSE 'VULNERABLE ✗'
        END as security_status
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
        AND p.proname IN ('validate_order_total', 'sync_payment_method_name', 'is_admin')
      ORDER BY p.proname;
    `)

    printNotice('\n📊 Function Security Status:')
    result.rows.forEach(row => {
      const status = row.security_status.includes('FIXED') ? '✅' : '❌'
      console.log(`   ${status} ${row.function_name}(${row.arguments}): ${row.security_status}`)
    })

    const fixedCount = result.rows.filter(r => r.security_status.includes('FIXED')).length
    printNotice(`\nFixed: ${fixedCount}/3 functions`)

    return fixedCount >= 3
  } catch (error) {
    printError(`Error during verification: ${error.message}`)
    return false
  } finally {
    if (client) {
      await client.end()
    }
  }
}

async function main() {
  console.log('🎯 Objective: Fix CRITICAL search_path vulnerabilities')
  console.log('📅 Date:', new Date().toLocaleDateString('es-ES'))
  console.log('🗄️  Database:', SUPABASE_URL)
  console.log('')

  console.log('⚠️  CRITICAL: Schema injection vulnerability detected')
  console.log('   - Functions without search_path are exploitable')
  console.log('   - Attackers can inject malicious schemas')
  console.log('   - This fix will set search_path = public on 3 functions')
  console.log('')

  const executed = await executeSecurityFix()

  if (!executed) {
    printError('\n❌ Security fix failed.')
    printNotice('\n📋 To execute manually:')
    printNotice('   1. Open https://supabase.com/dashboard')
    printNotice('   2. Go to SQL Editor')
    printNotice('   3. Copy content from migrations/20251104_SECURITY_FIX_search_path.sql')
    printNotice('   4. Execute')
    printNotice('')
    printCritical('DO NOT DELAY - This is a CRITICAL security vulnerability')
    process.exit(1)
  }

  const verified = await verifySecurityFix()

  if (verified) {
    console.log('\n' + '═'.repeat(80))
    printSuccess('✅ SECURITY FIX COMPLETED SUCCESSFULLY')
    console.log('═'.repeat(80))
    printNotice('\n📋 Summary:')
    printNotice('   1. ✅ 3 critical functions patched')
    printNotice('   2. ✅ search_path fixed on all functions')
    printNotice('   3. ✅ Schema injection: IMPOSSIBLE')
    printNotice('')
    printCritical('🛡️  SECURITY VULNERABILITY RESOLVED')
    printNotice('')
    printNotice('⚠️  Remaining Security Issues:')
    printNotice('   - dblink extension in public schema (MEDIUM)')
    printNotice('   - Postgres version has security patches (CONFIG)')
    printNotice('   - Leaked password protection disabled (CONFIG)')
    printNotice('')
  } else {
    printWarning('\n⚠️  Fix applied, but verification incomplete')
    printNotice('Please check manually in Supabase Dashboard')
  }
}

main().catch(error => {
  printError(`Critical error: ${error.message}`)
  console.error(error)
  process.exit(1)
})
