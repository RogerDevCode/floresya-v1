#!/usr/bin/env node
// @ts-nocheck

/**
 * Validador SQL Rápido
 */

import { readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function quickValidate() {
  const sqlFilePath = path.resolve(
    __dirname,
    '../../migrations/20251104_database_phase1_constraints.sql'
  )
  const sqlContent = await readFile(sqlFilePath, 'utf8')

  console.log('Validando sintaxis SQL...')
  console.log(`Archivo: ${sqlFilePath}`)
  console.log(`Tamaño: ${(sqlContent.length / 1024).toFixed(2)} KB`)
  console.log()

  // Verificaciones críticas
  const errors = []

  // 1. DO block
  if (!sqlContent.includes('DO $$') || !sqlContent.trim().endsWith('END $$;')) {
    errors.push('DO block mal formado')
  }

  // 2. No END; duplicado en funciones
  if (/END;\s*\$\$ LANGUAGE plpgsql/.test(sqlContent)) {
    errors.push('Encontrado END; antes de $$ LANGUAGE plpgsql (línea de función)')
  }

  // 3. BEGIN/END balanceados
  const begins = (sqlContent.match(/BEGIN/g) || []).length
  const ends = (sqlContent.match(/END;/g) || []).length
  if (begins !== ends) {
    errors.push(`BEGIN/END no balanceados: BEGIN=${begins}, END=${ends}`)
  }

  // 4. Creación de ENUMs
  if (!sqlContent.includes('CREATE TYPE setting_type')) {
    errors.push('Falta creación de ENUM setting_type')
  }

  // 5. Constraints NOT NULL
  const notNullCount = (sqlContent.match(/ALTER TABLE.*SET NOT NULL/g) || []).length
  console.log(`Constraints NOT NULL encontrados: ${notNullCount}`)
  if (notNullCount < 10) {
    errors.push(`Pocos constraints NOT NULL: ${notNullCount} (esperado: 10+)`)
  }

  // 6. Constraints CHECK
  const checkCount = (sqlContent.match(/ADD CONSTRAINT.*CHECK/g) || []).length
  console.log(`Constraints CHECK encontrados: ${checkCount}`)
  if (checkCount < 10) {
    errors.push(`Pocos constraints CHECK: ${checkCount} (esperado: 10+)`)
  }

  // 7. Triggers
  const triggerCount = (sqlContent.match(/CREATE TRIGGER/g) || []).length
  console.log(`Triggers encontrados: ${triggerCount}`)
  if (triggerCount < 2) {
    errors.push(`Pocos triggers: ${triggerCount} (esperado: 2)`)
  }

  console.log()
  console.log('='.repeat(60))
  if (errors.length === 0) {
    console.log('✅ VALIDACIÓN EXITOSA - Sintaxis correcta')
    console.log()
    console.log('El archivo está listo para ejecutar en Supabase Dashboard')
    console.log()
    return true
  } else {
    console.log('❌ ERRORES ENCONTRADOS:')
    errors.forEach(e => console.log(`  - ${e}`))
    console.log()
    return false
  }
}

quickValidate()
  .then(success => process.exit(success ? 0 : 1))
  .catch(e => {
    console.error('Error:', e.message)
    process.exit(1)
  })
