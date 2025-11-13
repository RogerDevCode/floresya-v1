#!/usr/bin/env node

/**
 * Script para aplicar filtrado de errores a todos los tests E2E
 * Versión mejorada que maneja mejor la inserción
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const TEST_DIR = path.join(__dirname, '..', 'tests', 'e2e')

// Patrón de filtrado
const FILTERING_PATTERN = `    // Setup console error tracking with filtering for expected API errors
    const errors = []
    const expectedErrors = [
      'Too many requests',
      'database error occurred',
      'rate limit',
      '__cf_bm',
      'Cookie'
    ]

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text()

        // Check if this is an expected API error that we should filter out
        const isExpected = expectedErrors.some(expected =>
          text.toLowerCase().includes(expected.toLowerCase())
        )

        if (!isExpected) {
          errors.push(text)
        }
      }
    })

    page.testErrors = errors`

/**
 * Aplica mejoras a un archivo específico
 */
function improveFile(filePath) {
  try {
    // Verificar si ya tiene filtrado
    const content = fs.readFileSync(filePath, 'utf-8')
    if (content.includes('expectedErrors')) {
      return { success: true, skipped: true, reason: 'already has filtering' }
    }

    // Verificar si tiene console tracking
    if (!content.includes("page.on('console'")) {
      return { success: true, skipped: true, reason: 'no console tracking' }
    }

    // Verificar si ya tiene el patrón en beforeEach
    if (content.includes('Setup console error tracking with filtering')) {
      return { success: true, skipped: true, reason: 'already improved' }
    }

    let newContent = content

    // Buscar beforeEach y agregar filtrado después de la navegación
    const beforeEachMatch = newContent.match(
      /test\.beforeEach\(async \(\{ page \}\) => \{[\s\S]*?(?=\n {2}test\.|\n\})/
    )

    if (beforeEachMatch) {
      const beforeEachBlock = beforeEachMatch[0]

      // Buscar donde termina la navegación (waitForLoadState o waitForTimeout)
      const navEndMatch = beforeEachBlock.match(
        /(await page\.(?:goto|waitForLoadState|waitForTimeout)[^;]*;?)([\s\S]*?)(\n {2}test\.|\n\})/
      )

      if (navEndMatch) {
        // Insertar después de la navegación
        const insertionPoint = navEndMatch.index + navEndMatch[1].length
        newContent =
          newContent.slice(0, insertionPoint) +
          '\n\n' +
          FILTERING_PATTERN +
          '\n' +
          newContent.slice(insertionPoint)
      } else {
        // Si no se encuentra navegación específica, insertar al final del beforeEach
        const beforeEachEnd = newContent.indexOf('})', beforeEachMatch.index)
        newContent =
          newContent.slice(0, beforeEachEnd) +
          '\n' +
          FILTERING_PATTERN +
          '\n  ' +
          newContent.slice(beforeEachEnd)
      }
    } else {
      return {
        success: false,
        error: 'No beforeEach found'
      }
    }

    // Escribir archivo
    fs.writeFileSync(filePath, newContent, 'utf-8')

    // Verificar sintaxis
    try {
      const { execSync } = require('child_process')
      execSync(`node -c "${filePath}"`, { stdio: 'pipe' })
      return { success: true, improved: true }
    } catch (syntaxError) {
      // Restaurar backup
      fs.writeFileSync(filePath, content, 'utf-8')
      return { success: false, error: 'Syntax error: ' + syntaxError.message }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Función principal
 */
function main() {
  console.log('🚀 Aplicando mejoras de filtrado a todos los tests E2E\n')

  // Obtener todos los archivos .test.js
  const testFiles = fs
    .readdirSync(TEST_DIR)
    .filter(file => file.endsWith('.test.js'))
    .map(file => path.join(TEST_DIR, file))

  console.log(`📁 Encontrados ${testFiles.length} archivos de test\n`)

  // Aplicar mejoras
  const results = {
    total: testFiles.length,
    improved: 0,
    skipped: 0,
    failed: 0,
    details: []
  }

  for (const file of testFiles) {
    const fileName = path.basename(file)
    const result = improveFile(file)

    if (result.success) {
      if (result.improved) {
        console.log(`✅ ${fileName}: Mejorado`)
        results.improved++
        results.details.push({ file: fileName, status: 'improved' })
      } else {
        console.log(`⏭️  ${fileName}: Omitido (${result.reason})`)
        results.skipped++
        results.details.push({ file: fileName, status: 'skipped', reason: result.reason })
      }
    } else {
      console.log(`❌ ${fileName}: Error - ${result.error}`)
      results.failed++
      results.details.push({ file: fileName, status: 'failed', error: result.error })
    }
  }

  // Mostrar resumen
  console.log('\n' + '='.repeat(60))
  console.log('📊 RESUMEN DE MEJORAS')
  console.log('='.repeat(60))
  console.log(`Total archivos: ${results.total}`)
  console.log(`Mejorados: ${results.improved}`)
  console.log(`Omitidos: ${results.skipped}`)
  console.log(`Fallidos: ${results.failed}`)
  console.log('='.repeat(60) + '\n')

  if (results.failed === 0) {
    console.log('✨ ¡Completado exitosamente!\n')
  } else {
    console.log(`⚠️  ${results.failed} archivos fallaron\n`)
  }

  // Mostrar detalles de archivos mejorados
  const improvedFiles = results.details.filter(d => d.status === 'improved')
  if (improvedFiles.length > 0) {
    console.log('✅ Archivos mejorados:')
    improvedFiles.forEach(f => console.log(`  - ${f.file}`))
    console.log()
  }
}

// Ejecutar
main().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
})
