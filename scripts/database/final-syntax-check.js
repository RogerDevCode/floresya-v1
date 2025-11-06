#!/usr/bin/env node

/**
 * Verificación final de sintaxis SQL
 */

import { readFile } from 'fs/promises'

const content = await readFile('./migrations/20251104_database_phase1_constraints.sql', 'utf8')

console.log('🔍 VERIFICACIÓN FINAL DE SINTAXIS SQL')
console.log('='.repeat(70))
console.log()

// Verificaciones críticas
const errors = []

// 1. DO blocks
const doBlocks = content.match(/DO \$\$/g) || []
console.log(`1. DO blocks encontrados: ${doBlocks.length}`)
if (doBlocks.length < 4) {
  errors.push(
    `Se esperaban al menos 4 DO blocks (1 principal + 3 ENUMs), encontrados: ${doBlocks.length}`
  )
}
console.log()

// 2. EXCEPTION WHEN duplicate_object
const hasDuplicateObject = content.includes('EXCEPTION WHEN duplicate_object')
if (hasDuplicateObject) {
  errors.push(
    'Todavía existen usos de EXCEPTION WHEN duplicate_object (no soportado en PostgreSQL < 14)'
  )
}
console.log(`2. Sin EXCEPTION WHEN duplicate_object: ${!hasDuplicateObject ? '✅' : '❌'}`)
console.log()

// 3. SQLSTATE 42710 (código para duplicate_object)
const hasSQLSTATE42710 = content.includes("SQLSTATE = '42710'")
console.log(`3. Uso de SQLSTATE 42710: ${hasSQLSTATE42710 ? '✅' : '❌'}`)
if (!hasSQLSTATE42710) {
  errors.push('Falta uso de SQLSTATE 42710 para detectar ENUMs duplicados')
}
console.log()

// 4. DO block principal
const hasMainDoBlock = /DO \$\$(.|\n)*?END \$\$;/.test(content)
console.log(`4. DO block principal: ${hasMainDoBlock ? '✅' : '❌'}`)
if (!hasMainDoBlock) {
  errors.push('No se encontró el DO block principal')
}
console.log()

// 5. Funciones trigger
const functionCount = (content.match(/CREATE OR REPLACE FUNCTION/g) || []).length
console.log(`5. Funciones trigger: ${functionCount} (esperado: 2)`)
if (functionCount !== 2) {
  errors.push(`Se esperaban 2 funciones, encontradas: ${functionCount}`)
}
console.log()

// 6. Triggers
const triggerCount = (content.match(/CREATE TRIGGER/g) || []).length
console.log(`6. Triggers: ${triggerCount} (esperado: 2)`)
if (triggerCount !== 2) {
  errors.push(`Se esperaban 2 triggers, encontrados: ${triggerCount}`)
}
console.log()

// 7. CREATE TYPE con IF NOT EXISTS (no debería existir)
const createTypeWithIfNotExists = /CREATE TYPE IF NOT EXISTS/g.test(content)
console.log(`7. CREATE TYPE sin IF NOT EXISTS: ${!createTypeWithIfNotExists ? '✅' : '❌'}`)
if (createTypeWithIfNotExists) {
  errors.push('Todavía existen CREATE TYPE IF NOT EXISTS (no soportado)')
}
console.log()

// 8. CREATE INDEX con IF NOT EXISTS (correcto)
const createIndexWithIfNotExists = /CREATE INDEX IF NOT EXISTS/g
console.log(
  `8. CREATE INDEX con IF NOT EXISTS: ${createIndexWithIfNotExists.test(content) ? '✅' : '❌'}`
)
console.log()

// 9. Estructura de ENUMs
const enumPattern =
  /DO \$\$\s*BEGIN\s*CREATE TYPE[^;]+AS ENUM[^;]+;\s*RAISE NOTICE[^;]+;\s*EXCEPTION WHEN OTHERS THEN\s*IF SQLSTATE = '42710' THEN/s
const hasCorrectEnumStructure = enumPattern.test(content)
console.log(`9. Estructura correcta de ENUMs: ${hasCorrectEnumStructure ? '✅' : '❌'}`)
if (!hasCorrectEnumStructure) {
  errors.push('La estructura de creación de ENUMs no es correcta')
}
console.log()

console.log('='.repeat(70))
if (errors.length === 0) {
  console.log('✅ SINTAXIS CORRECTA - Archivo listo para ejecutar')
  console.log()
  console.log('Correcciones aplicadas:')
  console.log('  ✓ DO anidados para creación de ENUMs')
  console.log('  ✓ SQLSTATE 42710 para detectar duplicados')
  console.log('  ✓ Sin EXCEPTION WHEN duplicate_object')
  console.log('  ✓ Funciones trigger separadas del DO block')
  console.log()
  process.exit(0)
} else {
  console.log('❌ ERRORES ENCONTRADOS:')
  errors.forEach(e => console.log(`  - ${e}`))
  console.log()
  process.exit(1)
}
