#!/usr/bin/env node
/**
 * Automated Service Modularization Script
 * Automatically modularizes large service files following established patterns
 *
 * Usage:
 *   node modularize-service.js <service-name>
 *   node modularize-service.js --analyze  (analyze all services)
 *   node modularize-service.js --validate <service-name> (validate modular files)
 *
 * Example:
 *   node modularize-service.js productService
 *   node modularize-service.js --analyze
 *   node modularize-service.js --validate paymentService
 */

import fs from 'fs/promises'
import path from 'path'
// import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.join(__dirname, '../../..')

const SERVICE_PATTERNS = {
  helpers: {
    template: `/**
 * {serviceName} Service - Helper Functions & Shared Imports
 * LEGACY: Modularizado desde {serviceName}.js (AUTOMATED)
 */

import DIContainer from '../architecture/di-container.js'
import {
  ValidationError,
  NotFoundError,
  BadRequestError,
  DatabaseError,
  InternalServerError
} from '../errors/AppError.js'
import { withErrorMapping } from '../middleware/error/index.js'

/**
 * Get {entityName}Repository instance from DI Container
 * @returns {{{entityName}Repository}} Repository instance
 */
function get{entityName}Repository() {
  return DIContainer.resolve('{entityName}Repository')
}

export {
  get{entityName}Repository,
  ValidationError,
  NotFoundError,
  BadRequestError,
  DatabaseError,
  InternalServerError,
  withErrorMapping
}
`
  },
  read: {
    template: `/**
 * {serviceName} Service - Read Operations
 * Handles all {entityName} retrieval operations
 * LEGACY: Modularizado desde {serviceName}.js (AUTOMATED)
 */

import {
  get{entityName}Repository,
  NotFoundError,
  BadRequestError,
  withErrorMapping
} from './{serviceName}.helpers.js'

{readFunctions}
`
  },
  create: {
    template: `/**
 * {serviceName} Service - Create Operations
 * Handles {entityName} creation operations
 * LEGACY: Modularizado desde {serviceName}.js (AUTOMATED)
 */

import {
  get{entityName}Repository,
  ValidationError
} from './{serviceName}.helpers.js'

{createFunctions}
`
  },
  update: {
    template: `/**
 * {serviceName} Service - Update Operations
 * Handles {entityName} update operations
 * LEGACY: Modularizado desde {serviceName}.js (AUTOMATED)
 */

import {
  get{entityName}Repository,
  ValidationError,
  BadRequestError,
  NotFoundError
} from './{serviceName}.helpers.js'

{updateFunctions}
`
  },
  delete: {
    template: `/**
 * {serviceName} Service - Delete Operations
 * Handles {entityName} soft-delete and reactivation operations
 * LEGACY: Modularizado desde {serviceName}.js (AUTOMATED)
 */

import {
  get{entityName}Repository,
  BadRequestError
} from './{serviceName}.helpers.js'

{deleteFunctions}
`
  },
  index: {
    template: `/**
 * {serviceName} Service - Barrel Export
 * Re-exports all functions from modular services
 * LEGACY: Maintain backward compatibility after modularization (AUTOMATED)
 *
 * This file ensures that existing imports like:
 *   import {{ get{entityName}ById }} from '../services/{serviceName}.js'
 * Continue to work without changes.
 */

// Import from all modules
export * from './{serviceName}.helpers.js'
export * from './{serviceName}.read.js'
export * from './{serviceName}.create.js'
export * from './{serviceName}.update.js'
export * from './{serviceName}.delete.js'
`
  }
}

/**
 * Analyze all service files and identify candidates for modularization
 */
async function analyzeServices() {
  console.log('🔍 Analyzing services for modularization...\n')

  const servicesDir = path.join(ROOT_DIR, 'api/services')
  const files = await fs.readdir(servicesDir)

  const candidates = []
  for (const file of files) {
    if (!file.endsWith('.js')) {
      continue
    }
    if (file.includes('.')) {
      continue // Skip modular files
    }

    const filePath = path.join(servicesDir, file)
    const content = await fs.readFile(filePath, 'utf-8')
    const lines = content.split('\n').length

    if (lines > 200) {
      const functions = extractExportedFunctions(content)
      candidates.push({
        name: file.replace('.js', ''),
        path: filePath,
        lines,
        functions
      })
    }
  }

  console.log(`Found ${candidates.length} service(s) with >200 lines:\n`)

  candidates.forEach(c => {
    console.log(`📦 ${c.name}`)
    console.log(`   Lines: ${c.lines}`)
    console.log(`   Functions: ${c.functions.length}`)
    console.log(`   Path: ${c.path}\n`)
  })

  return candidates
}

/**
 * Extract exported functions from service file
 */
function extractExportedFunctions(content) {
  const functions = []
  const regex = /export\s+(?:async\s+)?function\s+(\w+)/g
  let match

  while ((match = regex.exec(content)) !== null) {
    functions.push(match[1])
  }

  return functions
}

/**
 * Categorize functions by operation type
 */
function categorizeFunctions(functions) {
  const categories = {
    read: [],
    create: [],
    update: [],
    delete: []
  }

  functions.forEach(func => {
    const lower = func.toLowerCase()
    if (lower.includes('get') || lower.includes('find') || lower.includes('search')) {
      categories.read.push(func)
    } else if (lower.includes('create') || lower.includes('add')) {
      categories.create.push(func)
    } else if (lower.includes('update') || lower.includes('edit') || lower.includes('patch')) {
      categories.update.push(func)
    } else if (
      lower.includes('delete') ||
      lower.includes('remove') ||
      lower.includes('deactivate') ||
      lower.includes('reactivate')
    ) {
      categories.delete.push(func)
    } else {
      // Default to read if unclear
      categories.read.push(func)
    }
  })

  return categories
}

/**
 * Generate function code from template
 */
function generateFunctionCode(functionName, serviceName) {
  const lower = functionName.toLowerCase()
  let async = ''

  if (
    lower.includes('get') ||
    lower.includes('find') ||
    lower.includes('search') ||
    lower.includes('create')
  ) {
    async = 'async '
  }

  return `export ${async}function ${functionName}(...) {
  try {
    // TODO: Implement ${functionName}
    throw new Error('Not implemented yet')
  } catch (error) {
    console.error(\`${functionName} failed:\`, error)
    throw error
  }
}`
}

/**
 * Modularize a service
 */
async function modularizeService(serviceName) {
  console.log(`🚀 Starting modularization of ${serviceName}...\n`)

  const servicePath = path.join(ROOT_DIR, 'api/services', `${serviceName}.js`)
  const outputDir = path.join(ROOT_DIR, 'api/services')

  try {
    const content = await fs.readFile(servicePath, 'utf-8')
    const functions = extractExportedFunctions(content)

    if (functions.length === 0) {
      console.log('❌ No exported functions found')
      return
    }

    const categories = categorizeFunctions(functions)
    const entityName = serviceName.replace('Service', '')

    console.log(`📋 Found ${functions.length} functions:`)
    console.log(`   Read: ${categories.read.length}`)
    console.log(`   Create: ${categories.create.length}`)
    console.log(`   Update: ${categories.update.length}`)
    console.log(`   Delete: ${categories.delete.length}\n`)

    // Generate all modular files
    const files = []

    // 1. Helpers
    files.push({
      name: `${serviceName}.helpers.js`,
      content: SERVICE_PATTERNS.helpers.template
        .replace(/{serviceName}/g, serviceName)
        .replace(/{entityName}/g, entityName)
    })

    // 2. Read functions
    if (categories.read.length > 0) {
      const funcCode = categories.read.map(f => generateFunctionCode(f, serviceName)).join('\n\n')
      files.push({
        name: `${serviceName}.read.js`,
        content: SERVICE_PATTERNS.read.template
          .replace(/{serviceName}/g, serviceName)
          .replace(/{entityName}/g, entityName)
          .replace(/{readFunctions}/g, funcCode)
      })
    }

    // 3. Create functions
    if (categories.create.length > 0) {
      const funcCode = categories.create.map(f => generateFunctionCode(f, serviceName)).join('\n\n')
      files.push({
        name: `${serviceName}.create.js`,
        content: SERVICE_PATTERNS.create.template
          .replace(/{serviceName}/g, serviceName)
          .replace(/{createFunctions}/g, funcCode)
      })
    }

    // 4. Update functions
    if (categories.update.length > 0) {
      const funcCode = categories.update.map(f => generateFunctionCode(f, serviceName)).join('\n\n')
      files.push({
        name: `${serviceName}.update.js`,
        content: SERVICE_PATTERNS.update.template
          .replace(/{serviceName}/g, serviceName)
          .replace(/{updateFunctions}/g, funcCode)
      })
    }

    // 5. Delete functions
    if (categories.delete.length > 0) {
      const funcCode = categories.delete.map(f => generateFunctionCode(f, serviceName)).join('\n\n')
      files.push({
        name: `${serviceName}.delete.js`,
        content: SERVICE_PATTERNS.delete.template
          .replace(/{serviceName}/g, serviceName)
          .replace(/{deleteFunctions}/g, funcCode)
      })
    }

    // 6. Index (barrel export)
    files.push({
      name: `${serviceName}.index.js`,
      content: SERVICE_PATTERNS.index.template
        .replace(/{serviceName}/g, serviceName)
        .replace(/{entityName}/g, entityName)
    })

    // Write all files
    console.log('📝 Generating modular files:\n')
    for (const file of files) {
      const filePath = path.join(outputDir, file.name)
      await fs.writeFile(filePath, file.content, 'utf-8')
      console.log(`✓ Created: ${file.name}`)
    }

    console.log(`\n✅ Modularization complete! Created ${files.length} files\n`)
    console.log('⚠️  Note: Function bodies need to be manually copied from original service\n')
    console.log('📋 Next steps:')
    console.log(`   1. Copy function implementations from ${serviceName}.js`)
    console.log(`   2. Update imports and exports as needed`)
    console.log(`   3. Run validation: node modularize-service.js --validate ${serviceName}`)
  } catch (error) {
    console.error('❌ Modularization failed:', error.message)
  }
}

/**
 * Validate modular files
 */
async function validateService(serviceName) {
  console.log(`🔍 Validating ${serviceName} modular files...\n`)

  const files = [
    `${serviceName}.helpers.js`,
    `${serviceName}.read.js`,
    `${serviceName}.create.js`,
    `${serviceName}.update.js`,
    `${serviceName}.delete.js`,
    `${serviceName}.index.js`
  ]

  const servicesDir = path.join(ROOT_DIR, 'api/services')
  let allValid = true

  for (const file of files) {
    const filePath = path.join(servicesDir, file)
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      // Basic syntax check could be added here
      console.log(`✓ ${file}`)
      void content // Silence unused variable warning
    } catch (error) {
      console.log(`❌ ${file} - Not found`)
      allValid = false
      void error // Silence unused variable warning
    }
  }

  if (allValid) {
    console.log('\n✅ All modular files exist and are readable\n')
  } else {
    console.log('\n❌ Some modular files are missing\n')
  }
}

// Main CLI handler
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('Usage:')
    console.log('  node modularize-service.js <service-name>')
    console.log('  node modularize-service.js --analyze')
    console.log('  node modularize-service.js --validate <service-name>')
    process.exit(1)
  }

  if (args[0] === '--analyze') {
    await analyzeServices()
  } else if (args[0] === '--validate') {
    if (!args[1]) {
      console.log('❌ Please specify service name')
      process.exit(1)
    }
    await validateService(args[1])
  } else {
    await modularizeService(args[0])
  }
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
