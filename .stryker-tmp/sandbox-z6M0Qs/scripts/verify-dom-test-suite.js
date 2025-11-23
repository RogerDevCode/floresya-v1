#!/usr/bin/env node
// @ts-nocheck

/**
 * Script para verificar que la DOM Validation Test Suite está correctamente configurada
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
}

console.log('\n' + '='.repeat(80))
console.log(`${COLORS.cyan}🔍 VERIFICACIÓN DE DOM VALIDATION TEST SUITE${COLORS.reset}`)
console.log('='.repeat(80) + '\n')

const requiredFiles = [
  'tests/e2e/pages-loading-comprehensive.test.js',
  'tests/e2e/resources-loading.test.js',
  'tests/e2e/homepage-dom.test.js',
  'tests/e2e/cart-dom.test.js',
  'tests/e2e/product-detail-dom.test.js',
  'tests/e2e/admin-pages-dom.test.js',
  'tests/e2e/other-pages-dom.test.js',
  'tests/e2e/static-html-validation.test.js',
  'tests/e2e/README-DOM-VALIDATION.md',
  'scripts/run-dom-validation-tests.js'
]

let allGood = true

console.log('📁 Verificando archivos de test...\n')

for (const file of requiredFiles) {
  const fullPath = path.join(__dirname, '..', file)

  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath)
    const sizeKB = (stats.size / 1024).toFixed(1)
    console.log(`${COLORS.green}✅${COLORS.reset} ${file} (${sizeKB} KB)`)
  } else {
    console.log(`${COLORS.red}❌${COLORS.reset} ${file} - NO ENCONTRADO`)
    allGood = false
  }
}

console.log('\n📋 Verificando configuración...\n')

// Verificar playwright.config.js
const playwrightConfigPath = path.join(__dirname, '..', 'playwright.config.js')
if (fs.existsSync(playwrightConfigPath)) {
  console.log(`${COLORS.green}✅${COLORS.reset} playwright.config.js existe`)
} else {
  console.log(
    `${COLORS.yellow}⚠️${COLORS.reset} playwright.config.js no encontrado (se creará automáticamente)`
  )
}

// Verificar package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json')
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
  const hasPlaywright =
    packageJson.devDependencies && packageJson.devDependencies['@playwright/test']
  if (hasPlaywright) {
    console.log(`${COLORS.green}✅${COLORS.reset} @playwright/test instalado`)
  } else {
    console.log(`${COLORS.yellow}⚠️${COLORS.reset} @playwright/test no instalado`)
  }
}

console.log('\n📄 Páginas HTML a testear:\n')

const publicDir = path.join(__dirname, '..', 'public')
if (fs.existsSync(publicDir)) {
  const htmlFiles = getHtmlFiles(publicDir).slice(0, 10) // Mostrar solo 10
  htmlFiles.forEach(file => {
    console.log(`${COLORS.green}  📄${COLORS.reset} ${file}`)
  })

  const totalHtml = getHtmlFiles(publicDir).length
  console.log(`\n${COLORS.cyan}Total: ${totalHtml} páginas HTML${COLORS.reset}`)
}

console.log('\n' + '='.repeat(80))
if (allGood) {
  console.log(
    `${COLORS.green}✅ TODO LISTO - DOM VALIDATION TEST SUITE CONFIGURADA CORRECTAMENTE${COLORS.reset}`
  )
  console.log('='.repeat(80))
  console.log('\n🚀 Para ejecutar los tests:')
  console.log('  $ node scripts/run-dom-validation-tests.js')
  console.log('\n📖 Para más información:')
  console.log('  $ cat tests/e2e/README-DOM-VALIDATION.md')
  console.log('')
} else {
  console.log(`${COLORS.red}❌ FALTAN ARCHIVOS - Verifique la instalación${COLORS.reset}`)
  console.log('='.repeat(80) + '\n')
  process.exit(1)
}

function getHtmlFiles(dir) {
  const files = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relativePath = path.relative(dir, fullPath)

    if (entry.isDirectory()) {
      files.push(...getHtmlFiles(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(relativePath)
    }
  }

  return files.sort()
}
