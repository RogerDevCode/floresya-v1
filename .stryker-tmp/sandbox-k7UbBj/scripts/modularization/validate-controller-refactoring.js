#!/usr/bin/env node
// @ts-nocheck
/**
 * Controller Refactoring Validation Script
 * Comprehensive validation for modularized controllers
 *
 * Usage:
 *   node validate-controller-refactoring.js <controller-name>
 *   node validate-controller-refactoring.js --all
 *   node validate-controller-refactoring.js --syntax
 */

import fs from 'fs/promises'
import path from 'path'
// import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)
// Use process.cwd() for reliable path resolution
const ROOT_DIR = process.cwd()

/**
 * Validate a single controller modularization
 */
async function validateController(controllerName) {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`🔍 Validating Controller: ${controllerName}`)
  console.log('='.repeat(80))

  const controllerPath = path.join(ROOT_DIR, 'api/controllers', `${controllerName}.js`)
  const modularDir = path.dirname(controllerPath)
  const oldFilePath = path.join(modularDir, `${controllerName}.js`)

  const checks = {
    oldFileRemoved: false,
    modularFilesExist: [],
    modularFilesValid: [],
    barrelExportValid: false,
    syntaxValid: [],
    syntaxErrors: []
  }

  // Check 1: Old monolithic file should NOT exist
  try {
    await fs.access(oldFilePath)
    console.log(`\n❌ CHECK 1: Old file still exists: ${oldFilePath}`)
    console.log(`   Please remove: rm ${oldFilePath}`)
  } catch (error) {
    console.error('Error:', error)
    checks.oldFileRemoved = true
    console.log(`\n✅ CHECK 1: Old file correctly removed`)
  }

  // Check 2: Modular files should exist
  const requiredModules = [
    'helpers',
    'read',
    'create',
    'update',
    'delete',
    'relationships',
    'index'
  ]

  console.log(`\n📁 CHECK 2: Modular files existence`)
  for (const module of requiredModules) {
    const modulePath = path.join(modularDir, `${controllerName}.${module}.js`)
    try {
      await fs.access(modulePath)
      checks.modularFilesExist.push(module)
      console.log(`   ✅ ${controllerName}.${module}.js`)
    } catch (error) {
      console.error('Error:', error)
      console.log(`   ⚠️  ${controllerName}.${module}.js - MISSING (optional)`)
    }
  }

  // Check 3: Syntax validation
  console.log(`\n🔧 CHECK 3: Syntax validation`)
  for (const module of [...requiredModules, '']) {
    const modulePath = module
      ? path.join(modularDir, `${controllerName}.${module}.js`)
      : path.join(modularDir, `${controllerName}.index.js`)

    try {
      await fs.access(modulePath)
      execSync(`node -c "${modulePath}"`, { stdio: 'pipe' })
      checks.syntaxValid.push(module || 'index')
      const displayName = module || 'index'
      console.log(`   ✅ ${displayName}.js - Syntax OK`)
    } catch (error) {
      checks.syntaxErrors.push({ module, error: error.message })
      const displayName = module || 'index'
      console.log(`   ❌ ${displayName}.js - Syntax ERROR`)
    }
  }

  // Check 4: Barrel export functionality
  console.log(`\n🔗 CHECK 4: Barrel export validation`)
  const barrelPath = path.join(modularDir, `${controllerName}.index.js`)
  try {
    const barrelContent = await fs.readFile(barrelPath, 'utf-8')

    // Check for required exports
    const requiredExports = [
      './helpers.js',
      './read.js',
      './create.js',
      './update.js',
      './delete.js',
      './relationships.js'
    ]

    let exportsOK = true
    for (const exportLine of requiredExports) {
      if (!barrelContent.includes(exportLine)) {
        exportsOK = false
        console.log(`   ⚠️  Missing export: ${exportLine}`)
      }
    }

    if (exportsOK) {
      checks.barrelExportValid = true
      console.log(`   ✅ Barrel export structure valid`)
      console.log(`   ✅ All required exports present`)
    } else {
      console.log(`   ⚠️  Barrel export may be incomplete`)
    }
  } catch (error) {
    console.log(`   ❌ Cannot read barrel export: ${error.message}`)
  }

  // Check 5: Export compatibility test
  console.log(`\n🧪 CHECK 5: Export compatibility test`)
  try {
    const barrelPath = path.join(modularDir, `${controllerName}.index.js`)
    const testCode = `
      import * as controller from '${barrelPath}'
      console.log('Exports:', Object.keys(controller).length)
    `
    const testFile = path.join(ROOT_DIR, 'tmp-export-test.js')
    await fs.writeFile(testFile, testCode)

    try {
      execSync(`node "${testFile}"`, { stdio: 'pipe' })
      console.log(`   ✅ Barrel export can be imported successfully`)
      await fs.unlink(testFile)
    } catch (error) {
      console.log(`   ❌ Export test failed: ${error.message}`)
      await fs.unlink(testFile).catch(() => {})
    }
  } catch (error) {
    console.log(`   ⚠️  Cannot run export test: ${error.message}`)
  }

  // Summary
  console.log(`\n${'='.repeat(80)}`)
  console.log(`📊 VALIDATION SUMMARY`)
  console.log('='.repeat(80))

  const totalChecks = 5
  let passedChecks = 0

  if (checks.oldFileRemoved) {
    passedChecks++
  }
  if (checks.modularFilesExist.length > 0) {
    passedChecks++
  }
  if (checks.syntaxErrors.length === 0) {
    passedChecks++
  }
  if (checks.barrelExportValid) {
    passedChecks++
  }

  console.log(`\n✅ Passed: ${passedChecks}/${totalChecks} checks`)
  console.log(`📦 Modular files: ${checks.modularFilesExist.length}/${requiredModules.length}`)
  console.log(`🔧 Syntax valid: ${checks.syntaxValid.length} files`)
  console.log(`❌ Syntax errors: ${checks.syntaxErrors.length} files`)

  if (passedChecks === totalChecks) {
    console.log(`\n🎉 CONTROLLER VALIDATION PASSED!`)
    return true
  } else {
    console.log(`\n⚠️  CONTROLLER VALIDATION COMPLETED WITH WARNINGS`)
    if (checks.syntaxErrors.length > 0) {
      console.log(`\n❌ Syntax Errors:`)
      checks.syntaxErrors.forEach(err => {
        console.log(`   - ${err.module || 'index'}.js: ${err.error}`)
      })
    }
    return false
  }
}

/**
 * Validate all modularized controllers
 */
async function validateAllControllers() {
  console.log(`\n🔍 Validating ALL Modularized Controllers`)
  console.log('='.repeat(80))

  const controllersDir = path.join(ROOT_DIR, 'api/controllers')
  const files = await fs.readdir(controllersDir)

  // Find controllers with .index.js (modularized)
  const modularControllers = files
    .filter(f => f.endsWith('.index.js'))
    .map(f => f.replace('.index.js', ''))

  if (modularControllers.length === 0) {
    console.log(`\n⚠️  No modularized controllers found`)
    return
  }

  console.log(`\n📋 Found ${modularControllers.length} modularized controllers:`)
  modularControllers.forEach(name => console.log(`   - ${name}`))

  let allPassed = true
  for (const controllerName of modularControllers) {
    const passed = await validateController(controllerName)
    if (!passed) {
      allPassed = false
    }
  }

  console.log(`\n${'='.repeat(80)}`)
  if (allPassed) {
    console.log(`🎉 ALL CONTROLLERS VALIDATED SUCCESSFULLY!`)
  } else {
    console.log(`⚠️  Some controllers have issues. Please review above.`)
  }
  console.log('='.repeat(80))
}

/**
 * Check syntax for all controllers
 */
async function checkAllSyntax() {
  console.log(`\n🔧 Checking Syntax for ALL Controllers`)
  console.log('='.repeat(80))

  const controllersDir = path.join(ROOT_DIR, 'api/controllers')
  const files = await fs.readdir(controllersDir)
  const jsFiles = files.filter(f => f.endsWith('.js'))

  let validCount = 0
  let errorCount = 0

  for (const file of jsFiles) {
    const filePath = path.join(controllersDir, file)
    try {
      execSync(`node -c "${filePath}"`, { stdio: 'pipe' })
      console.log(`   ✅ ${file}`)
      validCount++
    } catch (error) {
      console.error('Error:', error)
      console.log(`   ❌ ${file}`)
      errorCount++
    }
  }

  console.log(`\n${'='.repeat(80)}`)
  console.log(`📊 Syntax Check Summary: ${validCount} valid, ${errorCount} errors`)
  console.log('='.repeat(80))
}

// Main CLI
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
🔍 Controller Refactoring Validation Tool

Usage:
  node validate-controller-refactoring.js <controller-name>  Validate specific controller
  node validate-controller-refactoring.js --all             Validate all modularized controllers
  node validate-controller-refactoring.js --syntax          Check syntax for all controllers
  node validate-controller-refactoring.js --help            Show this help

Examples:
  node validate-controller-refactoring.js productController
  node validate-controller-refactoring.js --all
  node validate-controller-refactoring.js --syntax
`)
    process.exit(args.includes('--help') ? 0 : 1)
  }

  const arg = args[0]

  if (arg === '--all') {
    await validateAllControllers()
  } else if (arg === '--syntax') {
    await checkAllSyntax()
  } else {
    // Validate specific controller
    const controllerName = arg
    await validateController(controllerName)
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
