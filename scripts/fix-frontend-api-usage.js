#!/usr/bin/env node

/**
 * Auto-fix Frontend API Usage
 * Automatically fixes common API client usage errors:
 * - Renames incorrect method names to correct ones
 * - Removes non-existent methods and suggests alternatives
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Mapping of incorrect method names to correct ones
const METHOD_FIXES = {
  // Products
  getProducts: 'getAllProducts',
  getProduct: 'getProductsById',
  getCarouselProducts: 'getAllCarouselProducts',

  // Orders
  getOrders: 'getAllOrders',
  getOrder: 'getOrdersById',
  createOrder: 'createOrders',
  updateOrder: 'updateOrders',
  updateOrderStatus: 'updateOrdersStatus',
  getOrderStatusHistory: 'getOrdersStatusHistory',

  // Users
  getUsers: 'getAllUsers',
  getUser: 'getUsersById',
  createUser: 'createUsers',
  updateUser: 'updateUsers',
  deleteUser: 'deleteUsers',

  // Occasions
  getOccasions: 'getAllOccasions',
  getOccasion: 'getOccasionsById',
  createOccasion: 'createOccasions',
  updateOccasion: 'updateOccasions',
  deleteOccasion: 'deleteOccasions',

  // Settings
  getSettings: 'getAllSettings',
  getSetting: 'getSettingsByKey',
  getSettingValue: 'getValue',
  getPublicSettings: 'getAllPublic',
  getSettingsMap: 'getAllMap',
  updateSetting: 'updateSettings',

  // Payments
  getPayments: 'getAllPayments',

  // BCV
  updateBcvPrice: 'createBcvprice'
}

// Methods that don't exist and should be removed/commented
const NON_EXISTENT_METHODS = [
  'setAuthToken', // This should be handled differently
  'request', // This is internal
  'validateOrder' // This should use createOrders
]

/**
 * Fix a single file
 */
async function fixFile(filePath, dryRun = false) {
  let content = await fs.readFile(filePath, 'utf-8')
  const _relativePath = path.relative(process.cwd(), filePath)
  let modified = false
  const changes = []

  // Fix method name replacements
  for (const [incorrect, correct] of Object.entries(METHOD_FIXES)) {
    const pattern = new RegExp(`\\bapi\\.${incorrect}\\s*\\(`, 'g')
    if (pattern.test(content)) {
      const count = (content.match(pattern) || []).length
      content = content.replace(pattern, `api.${correct}(`)
      modified = true
      changes.push(`  ✓ Renamed api.${incorrect}() → api.${correct}() (${count}x)`)
    }
  }

  // Warn about non-existent methods (don't auto-fix these)
  for (const method of NON_EXISTENT_METHODS) {
    const pattern = new RegExp(`\\bapi\\.${method}\\s*\\(`, 'g')
    if (pattern.test(content)) {
      const count = (content.match(pattern) || []).length
      changes.push(
        `  ⚠️  Found api.${method}() (${count}x) - Manual fix required (method doesn't exist)`
      )
    }
  }

  // Save file if modified
  if (modified && !dryRun) {
    await fs.writeFile(filePath, content, 'utf-8')
  }

  return { modified, changes }
}

/**
 * Scan and fix all frontend files
 */
async function fixFrontendFiles(dryRun = false) {
  const publicDir = path.join(__dirname, '../public')
  const files = []

  async function scanDir(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        if (!['node_modules', '.git', 'assets', 'images'].includes(entry.name)) {
          await scanDir(fullPath)
        }
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        if (
          !entry.name.includes('.test.') &&
          !entry.name.includes('.min.') &&
          !entry.name.includes('lucide-icons') &&
          !entry.name.includes('chart.') &&
          entry.name !== 'api-client.js' &&
          entry.name !== 'api-types.js'
        ) {
          files.push(fullPath)
        }
      }
    }
  }

  await scanDir(publicDir)

  console.log(`🔍 Scanning ${files.length} files...\n`)

  let totalModified = 0
  let totalChanges = 0

  for (const file of files) {
    const result = await fixFile(file, dryRun)
    if (result.changes.length > 0) {
      const relativePath = path.relative(process.cwd(), file)
      console.log(`📝 ${relativePath}`)
      for (const change of result.changes) {
        console.log(change)
        totalChanges++
      }
      console.log()
      if (result.modified) {
        totalModified++
      }
    }
  }

  return { totalModified, totalChanges, totalFiles: files.length }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run') || args.includes('-d')

  console.log('🔧 Frontend API Usage Auto-Fixer')
  console.log('='.repeat(80))
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified')
  } else {
    console.log('✏️  FIX MODE - Files will be modified')
  }
  console.log('='.repeat(80))
  console.log()

  const result = await fixFrontendFiles(dryRun)

  console.log('='.repeat(80))
  console.log('📊 Summary')
  console.log('='.repeat(80))
  console.log(`Files scanned: ${result.totalFiles}`)
  console.log(`Files modified: ${result.totalModified}`)
  console.log(`Total changes: ${result.totalChanges}`)
  console.log('='.repeat(80))

  if (dryRun) {
    console.log('\n💡 Run without --dry-run to apply fixes')
  } else if (result.totalModified > 0) {
    console.log('\n✅ Files fixed! Run npm run validate:frontend:usage to verify')
  } else {
    console.log('\n✅ No fixes needed!')
  }
}

main().catch(console.error)
