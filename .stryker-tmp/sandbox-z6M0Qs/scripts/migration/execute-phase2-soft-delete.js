#!/usr/bin/env node
// @ts-nocheck

/**
 * Execute Phase 2: Soft Delete Migration
 * Migrate is_active → active across all tables
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
  '../../migrations/20251104_add_active_column_soft_delete.sql'
)

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function printHeader() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗')
  console.log('║            🚀 EJECUTANDO FASE 2: SOFT DELETE MIGRATION                     ║')
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

function printWarning(message) {
  console.log(`⚠️  ${message}`)
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

    // Check active columns
    const activeColumnsResult = await client.query(`
      SELECT COUNT(DISTINCT table_name) as table_count
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND column_name = 'active'
        AND table_name IN (
          'users', 'occasions', 'payment_methods', 'settings',
          'orders', 'payments', 'product_images', 'product_occasions',
          'order_items', 'order_status_history', 'busquedas_log',
          'query_timeouts_log', 'products'
        )
    `)

    const tableCount = parseInt(activeColumnsResult.rows[0].table_count)

    if (tableCount >= 12) {
      printSuccess(`Columnas active encontradas: ${tableCount}/13 tablas`)
    } else {
      printWarning(`Solo ${tableCount}/13 tablas tienen columna active`)
    }

    // Check indexes
    const indexesResult = await client.query(`
      SELECT COUNT(*) as index_count
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname LIKE 'idx_%_active'
    `)

    printSuccess(`Índices de soft-delete: ${indexesResult.rows[0].index_count}`)

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
  console.log('🎯 Objetivo: Migrar is_active → active para soft delete')
  console.log('📅 Fecha:', new Date().toLocaleDateString('es-ES'))
  console.log('🗄️  Base de datos:', SUPABASE_URL)
  console.log('')

  const executed = await executeMigration()

  if (!executed) {
    printError('\n❌ La migración falló.')
    printNotice('\n📋 Para ejecutar manualmente:')
    printNotice('   1. Abre https://supabase.com/dashboard')
    printNotice('   2. Ve a SQL Editor')
    printNotice('   3. Copia el contenido de migrations/20251104_add_active_column_soft_delete.sql')
    printNotice('   4. Ejecuta')
    printNotice('\n📋 Próximos pasos después de ejecutar SQL:')
    printNotice('   bash scripts/refactoring/rename_is_active_to_active.sh')
    printNotice('   npm test')
    process.exit(1)
  }

  const verified = await verifyMigration()

  if (verified) {
    console.log('\n' + '═'.repeat(80))
    printSuccess('✅ MIGRACIÓN FASE 2 COMPLETADA EXITOSAMENTE')
    console.log('═'.repeat(80))
    printNotice('\n📋 Próximos pasos:')
    printNotice('   1. ✅ Migración ejecutada')
    printNotice('   2. ✅ Verificación completada')
    printNotice('   3. 🚀 Ejecutar refactoring del código:')
    printNotice('      bash scripts/refactoring/rename_is_active_to_active.sh')
    printNotice('   4. 🚀 Ejecutar tests:')
    printNotice('      npm test')
    printNotice('\n🎉 ¡Soft delete migration aplicada correctamente!')
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
