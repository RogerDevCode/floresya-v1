#!/usr/bin/env node
// @ts-nocheck

/**
 * Execute Phase 1: Database Constraints Migration
 * Directly runs the SQL migration file against Supabase
 */

import { readFileSync } from 'fs'
import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MIGRATION_FILE = path.join(
  __dirname,
  '../../migrations/20251104_database_phase1_constraints.sql'
)

function printHeader() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗')
  console.log('║            🚀 EJECUTANDO FASE 1: DATABASE CONSTRAINTS                       ║')
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝')
  console.log('')
}

function printStep(message) {
  console.log(`⏳ ${message}`)
}

function printSuccess(message) {
  console.log(`✅ ${message}`)
}

function printError(message) {
  console.log(`❌ ${message}`)
}

function printNotice(message) {
  console.log(`📢 ${message}`)
}

async function executeMigration() {
  let client

  try {
    printHeader()

    printStep('Leyendo archivo de migración...')
    const migrationSQL = readFileSync(MIGRATION_FILE, 'utf8')
    printSuccess(`Archivo leído: ${(migrationSQL.length / 1024).toFixed(2)} KB`)

    printStep('Conectando a Supabase PostgreSQL...')
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })

    await client.connect()
    printSuccess('Conexión establecida')

    printStep('Ejecutando migración SQL...')
    console.log('─'.repeat(80))

    const result = await client.query(migrationSQL)

    console.log('─'.repeat(80))
    printSuccess('✅ Migración ejecutada completamente')
    printSuccess(`Duración: ${result.duration}ms`)

    return true
  } catch (error) {
    printError(`Error durante la migración: ${error.message}`)
    console.error('\n📋 Error completo:')
    console.error(error)

    if (error.code) {
      printError(`Código de error PostgreSQL: ${error.code}`)
    }

    if (error.message.includes('already exists')) {
      printNotice('ℹ Algunos elementos pueden ya existir (idempotente)')
    }

    return false
  } finally {
    if (client) {
      await client.end()
      printSuccess('Conexión cerrada')
    }
  }
}

async function verifyMigration() {
  let client

  try {
    printStep('\n🔍 Verificando que la migración se aplicó...')

    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })

    await client.connect()

    // Check for triggers
    const triggersResult = await client.query(`
      SELECT trigger_name
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      AND trigger_name IN ('trigger_validate_order_total', 'trigger_sync_payment_method_name')
    `)

    if (triggersResult.rows.length >= 1) {
      printSuccess(`Triggers encontrados: ${triggersResult.rows.length}/2`)
    } else {
      printError('No se encontraron triggers esperados')
    }

    // Check for ENUMs
    const enumsResult = await client.query(`
      SELECT typname
      FROM pg_type
      WHERE typname IN ('setting_type', 'query_timeout_estado', 'query_timeout_tipo')
    `)

    if (enumsResult.rows.length >= 2) {
      printSuccess(`ENUMs encontrados: ${enumsResult.rows.length}/3`)
    } else {
      printWarning(`Solo ${enumsResult.rows.length}/3 ENUMs encontrados`)
    }

    return true
  } catch (error) {
    printError(`Error durante la verificación: ${error.message}`)
    return false
  } finally {
    if (client) {
      await client.end()
    }
  }
}

async function main() {
  console.log('🎯 Objetivo: Aplicar constraints críticos de base de datos')
  console.log('📅 Fecha: 2025-11-04')
  console.log('💾 Base de datos:', process.env.SUPABASE_URL || 'No configurada')
  console.log('')

  const executed = await executeMigration()

  if (!executed) {
    printError('\n❌ La migración falló. Revisa los errores arriba.')
    process.exit(1)
  }

  const verified = await verifyMigration()

  if (verified) {
    console.log('\n' + '═'.repeat(80))
    printSuccess('✅ MIGRACIÓN FASE 1 COMPLETADA EXITOSAMENTE')
    console.log('═'.repeat(80))
    console.log('\n📋 Próximos pasos:')
    console.log('  1. npm test')
    console.log('  2. npm run lint')
    console.log('  3. git add . && git commit -m "feat: apply database constraints phase 1"')
    console.log('')
  } else {
    printWarning('\n⚠️  Migración ejecutada, pero verificación incompleta')
    printNotice('Revisa manualmente en Supabase Dashboard')
  }
}

main().catch(error => {
  printError(`Error crítico: ${error.message}`)
  console.error(error)
  process.exit(1)
})
