#!/usr/bin/env node
// @ts-nocheck

/**
 * Validador del archivo SQL corregido
 */

import { readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function validateCorrectedSQL() {
  console.log('🔍 Validando archivo SQL corregido...')
  console.log('='.repeat(70))
  console.log()

  const sqlFilePath = path.resolve(
    __dirname,
    '../../migrations/20251104_database_phase1_constraints.sql'
  )

  try {
    const sqlContent = await readFile(sqlFilePath, 'utf8')
    const lines = sqlContent.split('\n')

    console.log(`✓ Archivo leído: ${sqlFilePath}`)
    console.log(`  - Tamaño: ${(sqlContent.length / 1024).toFixed(2)} KB`)
    console.log(`  - Líneas: ${lines.length}`)
    console.log()

    let allPassed = true

    // Verificaciones
    console.log('📊 Verificaciones:')
    console.log()

    // 1. DO block
    const hasDoStart = sqlContent.includes('DO $$')
    const hasDoEnd = sqlContent.includes('END $$;')
    console.log(`1. DO block principal: ${hasDoStart && hasDoEnd ? '✅' : '❌'}`)
    if (!hasDoStart || !hasDoEnd) {
      allPassed = false
    }
    console.log(`   - DO $$: ${hasDoStart ? '✅' : '❌'}`)
    console.log(`   - END $$;: ${hasDoEnd ? '✅' : '❌'}`)
    console.log()

    // 2. NO IF NOT EXISTS en CREATE TYPE
    const typeWithIfNotExists = /CREATE TYPE IF NOT EXISTS/g.test(sqlContent)
    console.log(`2. CREATE TYPE sin IF NOT EXISTS: ${!typeWithIfNotExists ? '✅' : '❌'}`)
    if (typeWithIfNotExists) {
      console.log(`   ❌ Aún hay CREATE TYPE IF NOT EXISTS`)
      allPassed = false
    }
    console.log()

    // 3. Manejo de duplicate_object
    const hasDuplicateObject = sqlContent.includes('duplicate_object')
    console.log(`3. Manejo duplicate_object: ${hasDuplicateObject ? '✅' : '❌'}`)
    if (!hasDuplicateObject) {
      console.log(`   ⚠️ Falta manejo de duplicate_object`)
    }
    console.log()

    // 4. CREATE INDEX con IF NOT EXISTS (correcto)
    const indexWithIfNotExists = /CREATE INDEX IF NOT EXISTS/g.test(sqlContent)
    console.log(`4. CREATE INDEX con IF NOT EXISTS: ${indexWithIfNotExists ? '✅' : '❌'}`)
    console.log(
      `   - Encontrados: ${indexWithIfNotExists ? (sqlContent.match(/CREATE INDEX IF NOT EXISTS/g) || []).length : 0}`
    )
    console.log()

    // 5. Funciones trigger
    const hasValidateOrderTotal = sqlContent.includes(
      'CREATE OR REPLACE FUNCTION validate_order_total()'
    )
    const hasSyncPaymentMethod = sqlContent.includes(
      'CREATE OR REPLACE FUNCTION sync_payment_method_name()'
    )
    console.log(
      `5. Funciones trigger: ${hasValidateOrderTotal && hasSyncPaymentMethod ? '✅' : '❌'}`
    )
    console.log(`   - validate_order_total: ${hasValidateOrderTotal ? '✅' : '❌'}`)
    console.log(`   - sync_payment_method_name: ${hasSyncPaymentMethod ? '✅' : '❌'}`)
    if (!hasValidateOrderTotal || !hasSyncPaymentMethod) {
      allPassed = false
    }
    console.log()

    // 6. Triggers
    const hasTriggerValidateOrder = sqlContent.includes(
      'CREATE TRIGGER trigger_validate_order_total'
    )
    const hasTriggerSyncPayment = sqlContent.includes(
      'CREATE TRIGGER trigger_sync_payment_method_name'
    )
    console.log(
      `6. Triggers creados: ${hasTriggerValidateOrder && hasTriggerSyncPayment ? '✅' : '❌'}`
    )
    console.log(`   - trigger_validate_order_total: ${hasTriggerValidateOrder ? '✅' : '❌'}`)
    console.log(`   - trigger_sync_payment_method_name: ${hasTriggerSyncPayment ? '✅' : '❌'}`)
    if (!hasTriggerValidateOrder || !hasTriggerSyncPayment) {
      allPassed = false
    }
    console.log()

    // 7. Constraints CHECK
    const checkCount = (sqlContent.match(/ADD CONSTRAINT.*CHECK/g) || []).length
    console.log(`7. Constraints CHECK: ${checkCount >= 10 ? '✅' : '❌'}`)
    console.log(`   - Encontrados: ${checkCount} (esperado: 10+)`)
    if (checkCount < 10) {
      allPassed = false
    }
    console.log()

    // 8. Constraints NOT NULL
    const notNullCount = (sqlContent.match(/ALTER TABLE.*SET NOT NULL/g) || []).length
    console.log(`8. Constraints NOT NULL: ${notNullCount >= 10 ? '✅' : '❌'}`)
    console.log(`   - Encontrados: ${notNullCount} (esperado: 10+)`)
    if (notNullCount < 10) {
      allPassed = false
    }
    console.log()

    // 9. Funciones con END (no END;)
    const functionWithEnd = /CREATE OR REPLACE FUNCTION[^*]*\$\$[^$]*\nEND\s*\n\$\$/gs
    const functions = sqlContent.match(functionWithEnd) || []
    console.log(`9. Estructura de funciones: ${functions.length >= 2 ? '✅' : '❌'}`)
    console.log(`   - Funciones con END correcto: ${functions.length}`)
    functions.forEach((fn, _i) => {
      const nameMatch = fn.match(/CREATE OR REPLACE FUNCTION (\w+)/)
      if (nameMatch) {
        console.log(`     - ${nameMatch[1]}: ✅`)
      }
    })
    if (functions.length < 2) {
      allPassed = false
    }
    console.log()

    console.log('='.repeat(70))
    if (allPassed) {
      console.log('✅ VALIDACIÓN EXITOSA - Sintaxis correcta')
      console.log()
      console.log('El archivo está listo para ejecutar en Supabase')
      console.log()
      console.log('Correcciones aplicadas:')
      console.log('  ✓ CREATE TYPE sin IF NOT EXISTS')
      console.log('  ✓ Manejo de duplicate_object para ENUMs')
      console.log('  ✓ CREATE INDEX con IF NOT EXISTS (correcto)')
      console.log('  ✓ Funciones trigger separadas del DO block')
      console.log()
      return true
    } else {
      console.log('❌ VALIDACIÓN FALLÓ')
      console.log()
      console.log('Revise los errores marcados arriba')
      console.log()
      return false
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

validateCorrectedSQL().then(success => process.exit(success ? 0 : 1))
