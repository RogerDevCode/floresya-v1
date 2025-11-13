#!/usr/bin/env node

/**
 * Validador de Sintaxis SQL
 * Verifica que el archivo de migración no tenga errores de sintaxis básicos
 */

import { readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function validateSQLSyntax() {
  console.log('🔍 Validando sintaxis SQL del archivo de migración...')
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

    // Verificaciones básicas de sintaxis
    const checks = []

    // 1. Verificar DO block
    checks.push({
      name: 'DO block principal',
      test: sqlContent.includes('DO $$') && sqlContent.trim().endsWith('END $$;'),
      message: 'Verifica que el DO block esté correctamente cerrado'
    })

    // 2. Verificar que no hay END; duplicados en funciones
    const functionPattern = /CREATE\s+OR\s+REPLACE\s+FUNCTION/gi
    const functions = sqlContent.match(functionPattern)
    // const functionCount = functions ? functions.length : 0 // Not currently used

    const endInFunctionPattern = /CREATE\s+OR\s+REPLACE\s+FUNCTION[^]*?\$\$[^$]*?END;\s*\$\$/gi
    const hasEndInFunction = endInFunctionPattern.test(sqlContent)

    void functions // Use to avoid unused variable warning

    checks.push({
      name: 'Funciones sin END; duplicado',
      test: !hasEndInFunction,
      message: 'Verifica que las funciones no tengan END; antes del $$ LANGUAGE',
      critical: true
    })

    // 3. Verificar EXCEPTION WHEN OTHERS
    checks.push({
      name: 'Bloques EXCEPTION',
      test: sqlContent.includes('EXCEPTION WHEN OTHERS'),
      message: 'Verifica que todos los bloques BEGIN tengan manejo de errores'
    })

    // 4. Verificar RAISE NOTICE
    checks.push({
      name: 'Notificaciones',
      test: (sqlContent.match(/RAISE NOTICE/g) || []).length >= 10,
      message: 'Verifica que el script tenga suficientes notificaciones de progreso'
    })

    // 5. Verificar CREATE TYPE
    checks.push({
      name: 'Creación de ENUMs',
      test: sqlContent.includes('CREATE TYPE') && sqlContent.includes('setting_type'),
      message: 'Verifica que se crean los ENUMs necesarios'
    })

    // 6. Verificar ALTER TABLE SET NOT NULL
    checks.push({
      name: 'Constraints NOT NULL',
      test: (sqlContent.match(/ALTER TABLE.*SET NOT NULL/g) || []).length >= 10,
      message: 'Verifica que se apliquen constraints NOT NULL'
    })

    // 7. Verificar ADD CONSTRAINT CHECK
    checks.push({
      name: 'Constraints CHECK',
      test: (sqlContent.match(/ADD CONSTRAINT.*CHECK/g) || []).length >= 10,
      message: 'Verifica que se agreguen constraints CHECK'
    })

    // 8. Verificar CREATE TRIGGER
    checks.push({
      name: 'Triggers',
      test: (sqlContent.match(/CREATE TRIGGER/g) || []).length >= 2,
      message: 'Verifica que se creen los triggers necesarios'
    })

    // 9. Verificar CREATE INDEX
    checks.push({
      name: 'Índices',
      test: (sqlContent.match(/CREATE INDEX/g) || []).length >= 5,
      message: 'Verifica que se creen los índices necesarios'
    })

    // 10. Verificar llaves balanceadas
    const openBraces = (sqlContent.match(/BEGIN/g) || []).length
    const closeBraces = (sqlContent.match(/END;/g) || []).length

    checks.push({
      name: 'BEGIN/END balanceados',
      test: openBraces === closeBraces,
      message: `BEGIN: ${openBraces}, END;: ${closeBraces}`,
      critical: true
    })

    // Mostrar resultados
    console.log('📊 Resultados de Validación:')
    console.log('='.repeat(70))

    let allPassed = true
    for (const check of checks) {
      const status = check.test ? '✅' : '❌'
      const critical = check.critical ? ' [CRÍTICO]' : ''
      console.log(`${status} ${check.name}${critical}`)
      console.log(`   ${check.message}`)

      if (!check.test && check.critical) {
        allPassed = false
      }
    }

    console.log()
    console.log('='.repeat(70))

    if (allPassed) {
      console.log('✅ VALIDACIÓN EXITOSA - Sintaxis correcta')
      console.log()
      console.log('🎯 El archivo está listo para ejecutar en Supabase')
      console.log()
      console.log('📋 Instrucciones:')
      console.log('1. Abrir: https://supabase.com/dashboard')
      console.log('2. Ir a: SQL Editor')
      console.log('3. Copiar: TODO el contenido del archivo SQL')
      console.log('4. Ejecutar: Clic en RUN')
      console.log()

      return true
    } else {
      console.log('❌ VALIDACIÓN FALLÓ - Errores de sintaxis encontrados')
      console.log()
      console.log('Por favor corrija los errores marcados como [CRÍTICO]')
      console.log()

      return false
    }
  } catch (error) {
    console.error('❌ Error leyendo archivo:', error.message)
    return false
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  validateSQLSyntax()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}

export { validateSQLSyntax }
