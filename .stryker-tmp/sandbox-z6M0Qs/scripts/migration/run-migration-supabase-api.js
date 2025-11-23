#!/usr/bin/env node
// @ts-nocheck

/**
 * Execute Phase 1: Database Constraints Migration
 * Uses Supabase Management API to execute SQL
 */

/* eslint-disable no-restricted-globals */

import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MIGRATION_FILE = path.join(
  __dirname,
  '../../migrations/20251104_database_phase1_constraints.sql'
)

const SUPABASE_URL = 'https://dcbavpdlkcjdtjdkntde.supabase.co'
const SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjYmF2cGRsa2NqZHRqZGtudGRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njc2Nzg5OSwiZXhwIjoyMDcyMzQzODk5fQ.MwbJfs2vXZJMDXT5bcdYjt0_pZ1OD7V7b_v0q_3tK2Q'

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

async function executeMigrationViaAPI() {
  try {
    printHeader()

    printStep('Leyendo archivo de migración...')
    const migrationSQL = readFileSync(MIGRATION_FILE, 'utf8')
    printSuccess(
      `Archivo leído: ${(migrationSQL.length / 1024).toFixed(2)} KB (${migrationSQL.split('\n').length} líneas)`
    )

    printStep('Conectando a Supabase API...')
    printNotice('🔐 Usando Service Role Key para ejecutar SQL...')

    console.log('─'.repeat(80))
    printStep('Ejecutando migración SQL (esto puede tomar 30-60 segundos)...')
    console.log('─'.repeat(80))

    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        apikey: SERVICE_KEY
      },
      body: JSON.stringify({
        query: migrationSQL
      })
    })

    if (!response.ok) {
      // Try alternative endpoint
      printStep('Probando endpoint alternativo...')

      const altResponse = await fetch(`${SUPABASE_URL}/sql`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/sql',
          apikey: SERVICE_KEY
        },
        body: migrationSQL
      })

      if (!altResponse.ok) {
        const errorText = await altResponse.text()
        throw new Error(`HTTP ${altResponse.status}: ${errorText}`)
      }

      const result = await altResponse.text()
      console.log('─'.repeat(80))
      printSuccess('✅ Migración ejecutada exitosamente')
      console.log('─'.repeat(80))
      console.log(result)

      return true
    }

    const result = await response.json()
    console.log('─'.repeat(80))
    printSuccess('✅ Migración ejecutada exitosamente')
    console.log('─'.repeat(80))
    console.log(JSON.stringify(result, null, 2))

    return true
  } catch (error) {
    console.error('─'.repeat(80))
    printError(`Error durante la migración: ${error.message}`)
    console.error('─'.repeat(80))

    if (error.message.includes('already exists')) {
      printNotice('ℹ Algunos elementos pueden ya existir (idempotente)')
    }

    if (error.message.includes('network') || error.message.includes('fetch')) {
      printNotice('\n💡 Si hay error de red, puedes ejecutar manualmente:')
      printNotice('   1. Abre https://supabase.com/dashboard')
      printNotice('   2. Ve a SQL Editor')
      printNotice('   3. Copia el contenido de migrations/20251104_database_phase1_constraints.sql')
      printNotice('   4. Ejecuta')
    }

    return false
  }
}

function printManualInstructions() {
  printNotice('\n' + '═'.repeat(80))
  printNotice('📋 INSTRUCCIONES PARA EJECUCIÓN MANUAL')
  printNotice('═'.repeat(80))
  printNotice('\nSi prefieres ejecutar manualmente:\n')
  printNotice('1. 🌐 Abre tu navegador')
  printNotice('2. 📍 Ve a: https://supabase.com/dashboard')
  printNotice('3. 🔑 Login con tu cuenta')
  printNotice('4. 📦 Selecciona proyecto: FloresYa')
  printNotice('5. 📝 Click "SQL Editor" en el sidebar')
  printNotice('6. ➕ Click "New Query"')
  printNotice('7. 📄 Abre archivo: migrations/20251104_database_phase1_constraints.sql')
  printNotice('8. 📋 Copia TODO el contenido (Ctrl+A, Ctrl+C)')
  printNotice('9. 📝 Pega en SQL Editor (Ctrl+V)')
  printNotice('10. ▶️ Click "RUN" o Ctrl+Enter')
  printNotice('11. ⏳ Espera 30-60 segundos')
  printNotice('12. ✅ Busca mensaje: "=== MIGRACIÓN FASE 1 COMPLETADA ==="')
  printNotice('\n' + '═'.repeat(80))
}

async function main() {
  console.log('🎯 Objetivo: Aplicar constraints críticos de base de datos')
  console.log('📅 Fecha: 2025-11-04')
  console.log('🗄️  Base de datos:', SUPABASE_URL)
  console.log('')

  const executed = await executeMigrationViaAPI()

  if (!executed) {
    console.log('\n')
    printManualInstructions()

    // Still try to show verification queries
    printNotice('\n📋 Después de ejecutar manualmente, usa este script para verificar:')
    printNotice('   node scripts/migration/verify-phase1-constraints.js')
    printNotice('\n')
  } else {
    console.log('\n' + '═'.repeat(80))
    printSuccess('✅ MIGRACIÓN FASE 1 COMPLETADA EXITOSAMENTE')
    console.log('═'.repeat(80))
    printNotice('\n📋 Próximos pasos:')
    printNotice('  1. node scripts/migration/verify-phase1-constraints.js')
    printNotice('  2. npm test')
    printNotice('  3. npm run lint')
    printNotice('  4. git add . && git commit -m "feat: apply database constraints phase 1"')
    printNotice('\n')
  }
}

main().catch(error => {
  printError(`Error crítico: ${error.message}`)
  console.error(error)
  printManualInstructions()
  process.exit(1)
})
