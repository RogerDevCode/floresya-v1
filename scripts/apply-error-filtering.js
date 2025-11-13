#!/usr/bin/env node

/**
 * Script para aplicar filtrado de errores de consola a todos los tests E2E
 * Automatiza la aplicación del patrón de mejora a todos los tests
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const E2E_DIR = path.join(__dirname, '..', 'tests', 'e2e')

// Lista de tests ya mejorados
const IMPROVED_TESTS = [
  'test-filtros-ocasiones-perfecto.test.js',
  'filtros-ocasiones-flujos.test.js',
  'filtros-ocasiones-productos.test.js',
  'filters-comprehensive.test.js'
]

// Patrón de beforeEach mejorado
const IMPROVED_BEFOREEACH = `  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // Wait for filters to load

    // Setup console error tracking with filtering for expected API errors
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

    page.testErrors = errors
  })`

// Patrón de afterEach mejorado
const IMPROVED_AFTEREACH = `  test.afterEach(({ page }) => {
    // Log any console errors after each test
    if (page.testErrors && page.testErrors.length > 0) {
      console.log('Console errors detected:', page.testErrors.length)
    }
  })`

/**
 * Aplica mejoras a un archivo específico
 */
function applyImprovementsToFile(filePath) {
  const fileName = path.basename(filePath)

  // Saltar si ya está mejorado
  if (IMPROVED_TESTS.includes(fileName)) {
    console.log(`⏭️  Skipping ${fileName} (already improved)`)
    return { success: true, skipped: true }
  }

  try {
    let content = fs.readFileSync(filePath, 'utf-8')

    // Verificar si tiene console error tracking
    if (!content.includes("page.on('console'")) {
      console.log(`⚠️  ${fileName} doesn't have console error tracking`)
      return { success: true, skipped: true }
    }

    // Verificar si ya tiene filtrado
    if (content.includes('expectedErrors') && content.includes('isExpected')) {
      console.log(`✅ ${fileName} already has filtering`)
      return { success: true, skipped: true }
    }

    // Aplicar mejoras
    console.log(`🔧 Improving ${fileName}...`)

    // Patrón 1: Buscar y reemplazar beforeEach con console error tracking básico
    const beforeEachPattern =
      /test\.beforeEach\(async \(\{ page \}\) => \{[\s\S]*?page\.on\('console', msg => \{[\s\S]*?errors\.push\(msg\.text\(\)\)[\s\S]*?\)[\s\S]*?page\.testErrors = errors[\s\S]*?\}\)/

    if (beforeEachPattern.test(content)) {
      content = content.replace(beforeEachPattern, IMPROVED_BEFOREEACH)
      console.log(`  ✅ beforeEach updated`)
    }

    // Patrón 2: Buscar y reemplazar afterEach
    const afterEachPattern =
      /test\.afterEach\(\(\{ page \}\) => \{[\s\S]*?if \(page\.testErrors && page\.testErrors\.length > 0\) \{[\s\S]*?console\.log\('Console errors?[\s\S]*?\)[\s\S]*?\}\)/

    if (afterEachPattern.test(content)) {
      content =
        afterEachPattern.test(content) && content.replace(afterEachPattern, IMPROVED_AFTEREACH)
      console.log(`  ✅ afterEach updated`)
    }

    // Escribir archivo actualizado
    fs.writeFileSync(filePath, content, 'utf-8')

    console.log(`✅ Successfully improved ${fileName}`)
    return { success: true, improved: true }
  } catch (error) {
    console.error(`❌ Error improving ${fileName}:`, error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Verifica sintaxis de un archivo con node -c
 */
async function checkSyntax(filePath) {
  try {
    const { execSync } = await import('child_process')
    execSync(`node -c "${filePath}"`, { stdio: 'pipe' })
    return { success: true, file: path.basename(filePath) }
  } catch (error) {
    return { success: false, file: path.basename(filePath), error: error.message }
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Starting E2E Tests Error Filtering Application\n')

  // Obtener lista de archivos .test.js
  const testFiles = fs
    .readdirSync(E2E_DIR)
    .filter(file => file.endsWith('.test.js'))
    .map(file => path.join(E2E_DIR, file))

  console.log(`📁 Found ${testFiles.length} test files\n`)

  // Aplicar mejoras
  const results = {
    total: testFiles.length,
    improved: 0,
    skipped: 0,
    failed: 0,
    syntaxErrors: []
  }

  for (const file of testFiles) {
    const result = applyImprovementsToFile(file)

    if (result.success) {
      if (result.improved) {
        results.improved++
      }
      if (result.skipped) {
        results.skipped++
      }
    } else {
      results.failed++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 IMPROVEMENT SUMMARY')
  console.log('='.repeat(60))
  console.log(`Total files: ${results.total}`)
  console.log(`Improved: ${results.improved}`)
  console.log(`Skipped: ${results.skipped}`)
  console.log(`Failed: ${results.failed}`)
  console.log('='.repeat(60) + '\n')

  // Verificar sintaxis de archivos mejorados
  console.log('🔍 Checking syntax of improved files...\n')

  for (const file of testFiles) {
    const syntaxResult = await checkSyntax(file)
    if (syntaxResult.success) {
      console.log(`✅ ${syntaxResult.file}: Syntax OK`)
    } else {
      console.log(`❌ ${syntaxResult.file}: Syntax Error - ${syntaxResult.error}`)
      results.syntaxErrors.push(syntaxResult)
    }
  }

  console.log('\n' + '='.repeat(60))
  if (results.syntaxErrors.length === 0) {
    console.log('🎉 All improved files have correct syntax!')
  } else {
    console.log(`⚠️  ${results.syntaxErrors.length} files have syntax errors`)
  }
  console.log('='.repeat(60) + '\n')

  console.log('✨ Application complete!\n')
}

// Ejecutar
main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
