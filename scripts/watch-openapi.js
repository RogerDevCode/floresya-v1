#!/usr/bin/env node

/**
 * OpenAPI Documentation Watcher
 * Watches for changes in API files and automatically regenerates OpenAPI specification
 * Provides real-time feedback on contract compliance
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import chokidar from 'chokidar'
import { generateOpenApiSpec, validateContractCompliance } from './generate-openapi-spec.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * File patterns to watch for OpenAPI-related changes
 */
const WATCH_PATTERNS = [
  'api/controllers/**/*.js',
  'api/routes/**/*.js',
  'api/docs/openapi-annotations.js',
  'api/services/**/*.js',
  'api/middleware/**/*.js'
]

/**
 * Files to ignore during watching
 */
const IGNORE_PATTERNS = [
  '**/*.test.js',
  '**/*.spec.js',
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/coverage/**'
]

/**
 * Start watching for file changes
 */
async function startWatcher() {
  try {
    console.log('👀 Starting OpenAPI documentation watcher...')
    console.log('📁 Watching patterns:', WATCH_PATTERNS.join(', '))
    console.log('⏱️  Will regenerate OpenAPI spec on file changes\n')

    // Generate initial specification
    console.log('🔄 Generating initial OpenAPI specification...')
    await generateOpenApiSpec()

    // Validate initial contract
    const validation = await validateContractCompliance()
    if (validation.valid) {
      console.log('✅ Initial contract validation passed')
    } else {
      console.warn('⚠️  Initial contract validation found issues:', validation.error)
    }

    // Setup file watcher
    const watcher = chokidar.watch(WATCH_PATTERNS, {
      ignored: IGNORE_PATTERNS,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100
      }
    })

    // Handle file changes
    watcher.on('change', async filePath => {
      console.log(`📝 File changed: ${filePath}`)
      await handleFileChange(filePath)
    })

    watcher.on('add', async filePath => {
      console.log(`➕ File added: ${filePath}`)
      await handleFileChange(filePath)
    })

    watcher.on('unlink', async filePath => {
      console.log(`➖ File removed: ${filePath}`)
      await handleFileChange(filePath)
    })

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping OpenAPI watcher...')
      watcher.close().then(() => {
        console.log('✅ Watcher stopped')
        process.exit(0)
      })
    })

    process.on('SIGTERM', () => {
      console.log('\n🛑 Stopping OpenAPI watcher...')
      watcher.close().then(() => {
        console.log('✅ Watcher stopped')
        process.exit(0)
      })
    })

    console.log('🚀 OpenAPI watcher is now active!')
    console.log('💡 Press Ctrl+C to stop watching\n')
  } catch (error) {
    console.error('❌ Failed to start OpenAPI watcher:', error)
    process.exit(1)
  }
}

/**
 * Handle file change events
 */
async function handleFileChange(filePath) {
  try {
    const startTime = Date.now()

    console.log(`🔄 Regenerating OpenAPI specification due to: ${path.basename(filePath)}`)

    // Regenerate OpenAPI specification
    await generateOpenApiSpec()

    // Validate contract compliance
    const validation = await validateContractCompliance()

    const duration = Date.now() - startTime

    if (validation.valid) {
      console.log(`✅ OpenAPI specification regenerated successfully in ${duration}ms`)
    } else {
      console.warn(
        `⚠️  OpenAPI specification regenerated with issues in ${duration}ms:`,
        validation.error
      )
    }

    // Show summary
    await showGenerationSummary()
  } catch (error) {
    console.error(`❌ Failed to regenerate OpenAPI specification:`, error)
  }
}

/**
 * Show generation summary
 */
async function showGenerationSummary() {
  try {
    const summaryPath = path.join(__dirname, '../api/docs/generation-summary.json')

    try {
      const summaryContent = await fs.readFile(summaryPath, 'utf8')
      const summary = JSON.parse(summaryContent)

      console.log(
        `📊 Summary: ${summary.endpoints} endpoints, ${summary.schemas} schemas, ${summary.tags} tags`
      )
    } catch (_error) {
      // Summary file might not exist yet
    }
  } catch (_error) {
    // Ignore summary errors
  }
}

/**
 * Main execution function
 */
async function main() {
  // Check if chokidar is available
  try {
    await import('chokidar')
  } catch (_error) {
    console.error(
      '❌ chokidar is required for file watching. Install with: npm install --save-dev chokidar'
    )
    process.exit(1)
  }

  await startWatcher()
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { startWatcher, handleFileChange }
