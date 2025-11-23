#!/usr/bin/env node
// @ts-nocheck
/**
 * Automated Controller Modularization Script
 * Automatically modularizes large controller files following established patterns
 *
 * Usage:
 *   node modularize-controller.js <controller-name>
 *   node modularize-controller.js --analyze  (analyze all controllers)
 *   node modularize-controller.js --validate <controller-name> (validate modular files)
 *
 * Example:
 *   node modularize-controller.js productController
 *   node modularize-controller.js --analyze
 *   node modularize-controller.js --validate userController
 */

import fs from 'fs/promises'
import path from 'path'
// import { fileURLToPath } from 'url'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)
// Use process.cwd() for reliable path resolution
const ROOT_DIR = process.cwd()

const CONTROLLER_PATTERNS = {
  helpers: {
    template: `/**
 * {controllerName} Controller - Helper Functions & Shared Imports
 * LEGACY: Modularizado desde {controllerName}.js (AUTOMATED)
 */

import * as {serviceName} from '../services/{serviceName}.js'
import { asyncHandler } from '../middleware/error/index.js'
import {
  BadRequestError,
  NotFoundError,
  ValidationError
} from '../errors/AppError.js'
import { ValidatorService } from '../services/validation/ValidatorService.js'

/**
 * Creates standardized API response
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @returns {Object} Formatted response object
 */
const createResponse = (data, message) => ({
  success: true,
  data,
  message
})

/**
 * Gets appropriate HTTP status code for operation
 * @param {string} operation - Operation type (create, update, delete, etc.)
 * @returns {number} HTTP status code
 */
const getStatusCode = operation => {
  const statusCodes = {
    create: 201,
    update: 200,
    delete: 200,
    reactivate: 200,
    stock: 200,
    carousel: 200,
    link: 200,
    replace: 200,
    get: 200,
    list: 200
  }

  if (!statusCodes[operation]) {
    throw new BadRequestError(\`Invalid operation: \${operation}\`)
  }

  return statusCodes[operation]
}

export {
  createResponse,
  getStatusCode,
  asyncHandler,
  BadRequestError,
  NotFoundError,
  ValidationError,
  ValidatorService
}
`
  },
  read: {
    template: `/**
 * {controllerName} Controller - Read Operations
 * Handles all {entityName} retrieval operations (GET, LIST, etc.)
 * LEGACY: Modularizado desde {controllerName}.js (AUTOMATED)
 */

import {
  createResponse,
  getStatusCode,
  asyncHandler,
  NotFoundError,
  ValidatorService
} from './{controllerName}.helpers.js'

{readFunctions}
`
  },
  create: {
    template: `/**
 * {controllerName} Controller - Create Operations
 * Handles {entityName} creation operations (POST)
 * LEGACY: Modularizado desde {controllerName}.js (AUTOMATED)
 */

import {
  createResponse,
  getStatusCode,
  asyncHandler,
  ValidationError,
  ValidatorService
} from './{controllerName}.helpers.js'

{createFunctions}
`
  },
  update: {
    template: `/**
 * {controllerName} Controller - Update Operations
 * Handles {entityName} update operations (PUT, PATCH)
 * LEGACY: Modularizado desde {controllerName}.js (AUTOMATED)
 */

import {
  createResponse,
  getStatusCode,
  asyncHandler,
  ValidationError,
  ValidatorService
} from './{controllerName}.helpers.js'

{updateFunctions}
`
  },
  delete: {
    template: `/**
 * {controllerName} Controller - Delete Operations
 * Handles {entityName} delete/soft-delete operations (DELETE)
 * LEGACY: Modularizado desde {controllerName}.js (AUTOMATED)
 */

import {
  createResponse,
  getStatusCode,
  asyncHandler,
  NotFoundError,
  ValidationError
} from './{controllerName}.helpers.js'

{deleteFunctions}
`
  },
  relationships: {
    template: `/**
 * {controllerName} Controller - Relationship Operations
 * Handles {entityName} relationship operations (carousel, stock, etc.)
 * LEGACY: Modularizado desde {controllerName}.js (AUTOMATED)
 */

import {
  createResponse,
  getStatusCode,
  asyncHandler,
  ValidationError
} from './{controllerName}.helpers.js'

{relationshipFunctions}
`
  },
  index: {
    template: `/**
 * {controllerName} Controller - Barrel Export
 * Re-exports all controller functions from modular files
 * LEGACY: Maintain backward compatibility after modularization (AUTOMATED)
 */

// Import from all modules
export * from './{controllerName}.helpers.js'
export * from './{controllerName}.read.js'
export * from './{controllerName}.create.js'
export * from './{controllerName}.update.js'
export * from './{controllerName}.delete.js'
export * from './{controllerName}.relationships.js'
`
  }
}

/**
 * Analyze a controller file to determine modularization strategy
 */
async function analyzeController(controllerPath) {
  const content = await fs.readFile(controllerPath, 'utf-8')
  const lines = content.split('\n')

  // Count functions by operation type
  const functionCounts = {
    get: 0,
    list: 0,
    create: 0,
    update: 0,
    delete: 0,
    relationship: 0,
    total: 0
  }

  // Pattern to detect function definitions
  const functionPattern = /export\s+(?:async\s+)?function\s+(\w+)/g
  let match

  while ((match = functionPattern.exec(content)) !== null) {
    const funcName = match[1].toLowerCase()
    functionCounts.total++

    if (funcName.includes('get') || funcName.includes('find') || funcName.includes('retrieve')) {
      functionCounts.get++
    } else if (
      funcName.includes('list') ||
      funcName.includes('search') ||
      funcName.includes('filter')
    ) {
      functionCounts.list++
    } else if (
      funcName.includes('create') ||
      funcName.includes('add') ||
      funcName.includes('insert')
    ) {
      functionCounts.create++
    } else if (
      funcName.includes('update') ||
      funcName.includes('edit') ||
      funcName.includes('modify')
    ) {
      functionCounts.update++
    } else if (
      funcName.includes('delete') ||
      funcName.includes('remove') ||
      funcName.includes('deactivate')
    ) {
      functionCounts.delete++
    } else if (
      funcName.includes('carousel') ||
      funcName.includes('stock') ||
      funcName.includes('link')
    ) {
      functionCounts.relationship++
    }
  }

  const fileSize = (await fs.stat(controllerPath)).size
  const lineCount = lines.length

  return {
    path: controllerPath,
    size: fileSize,
    lineCount,
    functionCounts,
    shouldModularize: lineCount > 200 || fileSize > 10000
  }
}

/**
 * Modularize a controller file
 */
async function modularizeController(controllerName) {
  const controllerPath = path.join(ROOT_DIR, 'api/controllers', `${controllerName}.js`)
  const dirPath = path.dirname(controllerPath)

  try {
    await fs.access(controllerPath)
  } catch (error) {
    console.error('Error:', error)
    console.error(`❌ Controller not found: ${controllerPath}`)
    process.exit(1)
  }

  console.log(`\n🔄 Modularizing controller: ${controllerName}`)

  // Read original file
  const content = await fs.readFile(controllerPath, 'utf-8')

  // Extract functions by type
  const functionGroups = extractFunctionsByType(content)

  // Determine entity name and service name
  const entityName = controllerName.replace('Controller', '').toLowerCase()
  const serviceName = `${entityName}Service`

  // Generate modular files
  const moduleFiles = generateModuleFiles(controllerName, entityName, serviceName, functionGroups)

  // Write modular files
  for (const [moduleType, moduleContent] of Object.entries(moduleFiles)) {
    const modulePath = path.join(dirPath, `${controllerName}.${moduleType}.js`)
    await fs.writeFile(modulePath, moduleContent)
    console.log(`  ✅ Created: ${path.basename(modulePath)}`)
  }

  // Create barrel export
  const barrelContent = CONTROLLER_PATTERNS.index.template.replace(
    /{controllerName}/g,
    controllerName
  )
  const barrelPath = path.join(dirPath, `${controllerName}.index.js`)
  await fs.writeFile(barrelPath, barrelContent)
  console.log(`  ✅ Created: ${path.basename(barrelPath)}`)

  console.log(`\n✅ Modularization complete!`)
  console.log(`📁 Modular files created in: ${dirPath}`)
  console.log(`🔗 Barrel export: ${path.basename(barrelPath)}`)

  // Remove old file
  await fs.unlink(controllerPath)
  console.log(`🗑️  Removed old file: ${controllerName}.js`)

  console.log(`\n⚠️  IMPORTANT: Update imports in route files to use:`)
  console.log(`   import * as ${controllerName} from './${controllerName}.index.js'`)
}

/**
 * Extract functions from controller content by operation type
 */
function extractFunctionsByType(content) {
  const functionPattern = /export\s+(?:async\s+)?function\s+(\w+)/g
  const functions = []
  let match

  while ((match = functionPattern.exec(content)) !== null) {
    functions.push(match[1])
  }

  // Categorize functions
  const groups = {
    read: functions.filter(
      f =>
        f.toLowerCase().includes('get') ||
        f.toLowerCase().includes('find') ||
        f.toLowerCase().includes('retrieve') ||
        f.toLowerCase().includes('list') ||
        f.toLowerCase().includes('search') ||
        f.toLowerCase().includes('filter')
    ),
    create: functions.filter(
      f =>
        f.toLowerCase().includes('create') ||
        f.toLowerCase().includes('add') ||
        f.toLowerCase().includes('insert')
    ),
    update: functions.filter(
      f =>
        f.toLowerCase().includes('update') ||
        f.toLowerCase().includes('edit') ||
        f.toLowerCase().includes('modify')
    ),
    delete: functions.filter(
      f =>
        f.toLowerCase().includes('delete') ||
        f.toLowerCase().includes('remove') ||
        f.toLowerCase().includes('deactivate') ||
        f.toLowerCase().includes('reactivate')
    ),
    relationship: functions.filter(
      f =>
        f.toLowerCase().includes('carousel') ||
        f.toLowerCase().includes('stock') ||
        f.toLowerCase().includes('link')
    )
  }

  return groups
}

/**
 * Generate modular files content
 */
function generateModuleFiles(controllerName, entityName, serviceName, functionGroups) {
  const modules = {}

  // Generate index (barrel export) - handled separately

  // Generate helpers
  modules.helpers = CONTROLLER_PATTERNS.helpers.template.replace(
    /{controllerName}/g,
    controllerName
  )

  // Generate read functions
  if (functionGroups.read.length > 0) {
    const readFunctions = functionGroups.read
      .map(
        funcName => `/**
 * ${funcName.replace(/([A-Z])/g, ' $1').trim()}
 */\nexport const ${funcName} = asyncHandler(async (req, res) => {\n  // TODO: Implement ${funcName}\n  res.status(200).json({ success: true, message: '${funcName} not yet implemented' })\n})\n`
      )
      .join('\n')

    modules.read = CONTROLLER_PATTERNS.read.template
      .replace(/{controllerName}/g, controllerName)
      .replace(/{entityName}/g, entityName)
      .replace(/{readFunctions}/g, readFunctions)
  }

  // Generate create functions
  if (functionGroups.create.length > 0) {
    const createFunctions = functionGroups.create
      .map(
        funcName => `/**
 * ${funcName.replace(/([A-Z])/g, ' $1').trim()}
 */\nexport const ${funcName} = asyncHandler(async (req, res) => {\n  // TODO: Implement ${funcName}\n  res.status(201).json({ success: true, message: '${funcName} not yet implemented' })\n})\n`
      )
      .join('\n')

    modules.create = CONTROLLER_PATTERNS.create.template
      .replace(/{controllerName}/g, controllerName)
      .replace(/{entityName}/g, entityName)
      .replace(/{createFunctions}/g, createFunctions)
  }

  // Generate update functions
  if (functionGroups.update.length > 0) {
    const updateFunctions = functionGroups.update
      .map(
        funcName => `/**
 * ${funcName.replace(/([A-Z])/g, ' $1').trim()}
 */\nexport const ${funcName} = asyncHandler(async (req, res) => {\n  // TODO: Implement ${funcName}\n  res.status(200).json({ success: true, message: '${funcName} not yet implemented' })\n})\n`
      )
      .join('\n')

    modules.update = CONTROLLER_PATTERNS.update.template
      .replace(/{controllerName}/g, controllerName)
      .replace(/{entityName}/g, entityName)
      .replace(/{updateFunctions}/g, updateFunctions)
  }

  // Generate delete functions
  if (functionGroups.delete.length > 0) {
    const deleteFunctions = functionGroups.delete
      .map(
        funcName => `/**
 * ${funcName.replace(/([A-Z])/g, ' $1').trim()}
 */\nexport const ${funcName} = asyncHandler(async (req, res) => {\n  // TODO: Implement ${funcName}\n  res.status(200).json({ success: true, message: '${funcName} not yet implemented' })\n})\n`
      )
      .join('\n')

    modules.delete = CONTROLLER_PATTERNS.delete.template
      .replace(/{controllerName}/g, controllerName)
      .replace(/{entityName}/g, entityName)
      .replace(/{deleteFunctions}/g, deleteFunctions)
  }

  // Generate relationship functions
  if (functionGroups.relationship.length > 0) {
    const relationshipFunctions = functionGroups.relationship
      .map(
        funcName => `/**
 * ${funcName.replace(/([A-Z])/g, ' $1').trim()}
 */\nexport const ${funcName} = asyncHandler(async (req, res) => {\n  // TODO: Implement ${funcName}\n  res.status(200).json({ success: true, message: '${funcName} not yet implemented' })\n})\n`
      )
      .join('\n')

    modules.relationships = CONTROLLER_PATTERNS.relationships.template
      .replace(/{controllerName}/g, controllerName)
      .replace(/{entityName}/g, entityName)
      .replace(/{relationshipFunctions}/g, relationshipFunctions)
  }

  return modules
}

/**
 * Analyze all controllers
 */
async function analyzeAllControllers() {
  const controllersDir = path.join(ROOT_DIR, 'api/controllers')

  try {
    const files = await fs.readdir(controllersDir)
    const jsFiles = files.filter(f => f.endsWith('.js') && f !== 'index.js')

    console.log('\n📊 Controller Analysis Report')
    console.log('='.repeat(80))

    const analyses = []
    for (const file of jsFiles) {
      const controllerPath = path.join(controllersDir, file)
      const analysis = await analyzeController(controllerPath)
      analyses.push(analysis)

      const status = analysis.shouldModularize ? '🔴 NEEDS MODULARIZATION' : '✅ OK'
      console.log(`\n${status} ${file}`)
      console.log(`  Lines: ${analysis.lineCount} | Size: ${(analysis.size / 1024).toFixed(1)} KB`)
      console.log(
        `  Functions: ${analysis.functionCounts.total} (GET:${analysis.functionCounts.get} CREATE:${analysis.functionCounts.create} UPDATE:${analysis.functionCounts.update} DELETE:${analysis.functionCounts.delete})`
      )
    }

    const needModularization = analyses.filter(a => a.shouldModularize)

    console.log('\n' + '='.repeat(80))
    console.log(
      `\n📈 Summary: ${needModularization.length}/${analyses.length} controllers need modularization`
    )
    console.log(`\n🔧 Commands to modularize:`)
    needModularization.forEach(a => {
      const controllerName = path.basename(a.path, '.js')
      console.log(`  node ${__filename} ${controllerName}`)
    })
  } catch (error) {
    console.error('❌ Error analyzing controllers:', error.message)
    process.exit(1)
  }
}

/**
 * Validate modularization
 */
async function validateModularization(controllerName) {
  const dirPath = path.join(ROOT_DIR, 'api/controllers')

  console.log(`\n🔍 Validating modularization: ${controllerName}`)

  const requiredModules = [
    'helpers',
    'read',
    'create',
    'update',
    'delete',
    'relationships',
    'index'
  ]
  const missingModules = []

  for (const module of requiredModules) {
    const modulePath = path.join(dirPath, `${controllerName}.${module}.js`)
    try {
      await fs.access(modulePath)
      console.log(`  ✅ ${controllerName}.${module}.js`)
    } catch (error) {
      console.error('Error:', error)
      missingModules.push(module)
      console.log(`  ❌ ${controllerName}.${module}.js - MISSING`)
    }
  }

  if (missingModules.length === 0) {
    console.log(`\n✅ Validation passed! All modules present.`)
  } else {
    console.log(`\n❌ Validation failed! Missing modules: ${missingModules.join(', ')}`)
    process.exit(1)
  }

  // Check syntax
  for (const module of requiredModules) {
    const modulePath = path.join(dirPath, `${controllerName}.${module}.js`)
    try {
      await fs.access(modulePath)
      const { execSync } = await import('child_process')
      execSync(`node -c "${modulePath}"`, { stdio: 'inherit' })
      console.log(`  ✅ Syntax valid: ${module}`)
    } catch (error) {
      console.error('Error:', error)
      console.log(`  ❌ Syntax error: ${module}`)
    }
  }

  // Test barrel export
  try {
    const barrelPath = path.join(dirPath, `${controllerName}.index.js`)
    const { execSync } = await import('child_process')
    execSync(`node -c "${barrelPath}"`, { stdio: 'inherit' })
    console.log(`\n✅ Barrel export validation passed!`)
  } catch (error) {
    console.error('Error:', error)
    console.log(`\n❌ Barrel export validation failed!`)
    process.exit(1)
  }
}

// Main CLI
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
🛠️  Controller Modularization Tool

Usage:
  node modularize-controller.js <controller-name>     Modularize a specific controller
  node modularize-controller.js --analyze             Analyze all controllers
  node modularize-controller.js --validate <name>     Validate modular files
  node modularize-controller.js --help                Show this help

Examples:
  node modularize-controller.js productController
  node modularize-controller.js --analyze
  node modularize-controller.js --validate userController
`)
    process.exit(args.includes('--help') ? 0 : 1)
  }

  const arg = args[0]

  if (arg === '--analyze') {
    await analyzeAllControllers()
  } else if (arg === '--validate') {
    const controllerName = args[1]
    if (!controllerName) {
      console.error('❌ Please specify controller name to validate')
      process.exit(1)
    }
    await validateModularization(controllerName)
  } else {
    // Modularize specific controller
    const controllerName = arg
    await modularizeController(controllerName)
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
