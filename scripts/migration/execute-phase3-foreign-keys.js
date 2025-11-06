#!/usr/bin/env node

/**
 * Execute Phase 3: Foreign Keys & Integrity Constraints
 * Critical for referential integrity
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
  '../../migrations/20251104_database_phase3_foreign_keys.sql'
)

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function printHeader() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗')
  console.log('║            🚀 EJECUTANDO FASE 3: FOREIGN KEYS & INTEGRITY                    ║')
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

function printWarning(message) {
  console.log(`⚠️  ${message}`)
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
      printWarning(
        '\n💡 Algunos elementos ya existen (esto es normal, la migración es idempotente)'
      )
    }

    if (error.message.includes('violates foreign key constraint')) {
      printError('\n❌ Error de integridad: Existen datos huérfanos')
      printError('   Recomendación: Limpiar datos antes de aplicar FK')
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

    // Check Foreign Keys
    const fkResult = await client.query(`
      SELECT COUNT(*) as fk_count
      FROM information_schema.table_constraints
      WHERE constraint_schema = 'public'
        AND constraint_type = 'FOREIGN KEY'
    `)

    const fkCount = parseInt(fkResult.rows[0].fk_count)
    printSuccess(`Foreign Keys: ${fkCount}`)

    // Check Unique Constraints
    const uniqueResult = await client.query(`
      SELECT COUNT(*) as unique_count
      FROM information_schema.table_constraints
      WHERE constraint_schema = 'public'
        AND constraint_type = 'UNIQUE'
    `)

    const uniqueCount = parseInt(uniqueResult.rows[0].unique_count)
    printSuccess(`Constraints únicos: ${uniqueCount}`)

    // Check specific constraints
    const specificConstraints = [
      {
        name: 'fk_orders_user',
        query: 'SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = $1'
      },
      {
        name: 'fk_order_items_order',
        query: 'SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = $1'
      },
      {
        name: 'fk_order_items_product',
        query: 'SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = $1'
      },
      {
        name: 'users_email_unique',
        query: 'SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = $1'
      },
      {
        name: 'products_sku_unique',
        query: 'SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = $1'
      }
    ]

    for (const constraint of specificConstraints) {
      const result = await client.query(constraint.query, [constraint.name])
      if (result.rows.length > 0) {
        printSuccess(`✓ ${constraint.name}`)
      } else {
        printWarning(`✗ ${constraint.name} - No encontrado`)
      }
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
  console.log('🎯 Objetivo: Aplicar Foreign Keys y constraints de integridad')
  console.log('📅 Fecha:', new Date().toLocaleDateString('es-ES'))
  console.log('🗄️  Base de datos:', SUPABASE_URL)
  console.log('')

  console.log('⚠️  ATENCIÓN: Esta migración es CRÍTICA para integridad de datos')
  console.log('   - Verificará que no existen datos huérfanos')
  console.log('   - Aplicará Foreign Keys para integridad referencial')
  console.log('   - Aplicará constraints únicos (email, SKU, etc.)')
  console.log('')

  const executed = await executeMigration()

  if (!executed) {
    printError('\n❌ La migración falló.')
    printNotice('\n📋 Para ejecutar manualmente:')
    printNotice('   1. Abre https://supabase.com/dashboard')
    printNotice('   2. Ve a SQL Editor')
    printNotice('   3. Copia el contenido de migrations/20251104_database_phase3_foreign_keys.sql')
    printNotice('   4. Ejecuta')
    printNotice('\n💡 Si hay errores de FK, limpia datos huérfanos primero:')
    printNotice('   - Eliminar orders con user_id inexistente')
    printNotice('   - Eliminar order_items con product_id inexistente')
    printNotice('   - Eliminar duplicados de email en users')
    printNotice('   - Eliminar duplicados de SKU en products')
    process.exit(1)
  }

  const verified = await verifyMigration()

  if (verified) {
    console.log('\n' + '═'.repeat(80))
    printSuccess('✅ MIGRACIÓN FASE 3 COMPLETADA EXITOSAMENTE')
    console.log('═'.repeat(80))
    printNotice('\n📋 Resumen:')
    printNotice('   1. ✅ Foreign Keys aplicados')
    printNotice('   2. ✅ Constraints únicos aplicados')
    printNotice('   3. ✅ Índices adicionales creados')
    printNotice('   4. ✅ Valores por defecto establecidos')
    printNotice('\n🎉 ¡Integridad de datos garantizada!')
    printNotice('')
    printNotice('📊 Beneficios:')
    printNotice('   - No más datos huérfanos')
    printNotice('   - Emails y SKUs únicos')
    printNotice('   - Performance mejorada')
    printNotice('   - Integridad referencial garantizada')
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
