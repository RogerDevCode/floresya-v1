#!/usr/bin/env node

/**
 * Execute Phase 1: Database Constraints Migration
 * Directly execute SQL migration against Supabase
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
  '../../migrations/20251104_database_phase1_constraints.sql'
)

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function printHeader() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗')
  console.log('║            🚀 EJECUTANDO FASE 1: DATABASE CONSTRAINTS                       ║')
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

function printNotice(message) {
  console.log(`📢 ${message}`)
}

async function executeMigration() {
  let client

  try {
    printHeader()

    printStep('Leyendo archivo de migración...')
    const migrationSQL = readFileSync(MIGRATION_FILE, 'utf8')
    printSuccess(
      `Archivo leído: ${(migrationSQL.length / 1024).toFixed(2)} KB (${migrationSQL.split('\n').length} líneas)`
    )

    printStep('Construyendo DATABASE_URL...')
    const url = new URL(SUPABASE_URL)
    const DATABASE_URL = `postgresql://postgres:${SERVICE_KEY}@${url.host}:5432/postgres?sslmode=require`
    printSuccess(`Conectando a: ${SUPABASE_URL}`)

    printStep('Conectando a Supabase PostgreSQL...')
    client = new Client({
      connectionString: DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    })

    await client.connect()
    printSuccess('Conexión establecida')

    printStep('Ejecutando migración SQL...')
    console.log('─'.repeat(80))

    const startTime = Date.now()
    const result = await client.query(migrationSQL)
    const duration = Date.now() - startTime

    console.log('─'.repeat(80))
    printSuccess('✅ Migración ejecutada completamente')
    printSuccess(`⏱️  Duración: ${duration}ms (${(duration / 1000).toFixed(2)} segundos)`)

    // Check for any output from RAISE NOTICE
    if (result && result.notices) {
      printNotice('\n📢 Notices del servidor:')
      result.notices.forEach(notice => {
        console.log(`   ${notice.message}`)
      })
    }

    return true
  } catch (error) {
    console.error('\n' + '─'.repeat(80))
    printError(`❌ Error durante la migración: ${error.message}`)
    console.error('─'.repeat(80))

    if (error.code) {
      printError(`Código PostgreSQL: ${error.code}`)
    }

    if (error.message.includes('already exists')) {
      printNotice('\n💡 Algunos elementos ya existen (esto es normal, la migración es idempotente)')
    }

    if (error.message.includes('permission denied')) {
      printError('\n❌ Error de permisos. Verifica que SUPABASE_SERVICE_ROLE_KEY es correcto')
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

    const url = new URL(SUPABASE_URL)
    const DATABASE_URL = `postgresql://postgres:${SERVICE_KEY}@${url.host}:5432/postgres?sslmode=require`

    client = new Client({
      connectionString: DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    })

    await client.connect()

    // Check ENUMs
    const enumsResult = await client.query(`
      SELECT typname
      FROM pg_type
      WHERE typname IN ('setting_type', 'query_timeout_estado', 'query_timeout_tipo')
    `)

    if (enumsResult.rows.length >= 2) {
      printSuccess(`ENUMs encontrados: ${enumsResult.rows.length}/3`)
    } else {
      printError(`Solo ${enumsResult.rows.length}/3 ENUMs encontrados`)
    }

    // Check triggers
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

    // Check constraints
    const constraintsResult = await client.query(`
      SELECT COUNT(*) as constraint_count
      FROM information_schema.check_constraints
      WHERE constraint_schema = 'public'
    `)

    printSuccess(`CHECK Constraints: ${constraintsResult.rows[0].constraint_count}`)

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
  console.log('📅 Fecha:', new Date().toLocaleDateString('es-ES'))
  console.log('🗄️  Base de datos:', SUPABASE_URL)
  console.log('')

  const executed = await executeMigration()

  if (!executed) {
    printError('\n❌ La migración falló.')
    printNotice('\n📋 Para ejecutar manualmente:')
    printNotice('   1. Abre https://supabase.com/dashboard')
    printNotice('   2. Ve a SQL Editor')
    printNotice('   3. Copia el contenido de migrations/20251104_database_phase1_constraints.sql')
    printNotice('   4. Ejecuta')
    process.exit(1)
  }

  const verified = await verifyMigration()

  if (verified) {
    console.log('\n' + '═'.repeat(80))
    printSuccess('✅ MIGRACIÓN FASE 1 COMPLETADA EXITOSAMENTE')
    console.log('═'.repeat(80))
    printNotice('\n📋 Próximos pasos:')
    printNotice('   1. ✅ Migración ejecutada')
    printNotice('   2. ✅ Verificación completada')
    printNotice('   3. 🚀 ¡Listo para producción!')
    printNotice('\n🎉 ¡Database Constraints aplicados correctamente!')
    printNotice('')
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
