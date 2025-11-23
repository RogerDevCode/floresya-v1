#!/usr/bin/env node
// @ts-nocheck

/**
 * Refactor Auto Order Generator
 * Applying Silicon Valley Best Practices
 * - Google Engineering Practices
 * - Clean Code (Robert C. Martin)
 * - Martin Fowler Refactoring
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.join(__dirname, '..', '..')

/**
 * Create Constants File
 */
function createConstantsFile() {
  const constantsContent = `// Constants for Auto Order Generator
// Following Google Engineering Practices

export const STATUS = {
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  PENDING: 'PENDING'
}

export const DELIVERY_SLOTS = [
  '09:00-12:00',
  '12:00-15:00',
  '15:00-18:00'
]

export const DELIVERY_NOTES = [
  'Llamar al llegar',
  'Dejar con portero',
  'Torre A, piso 5',
  'Apartamento 12B',
  'Timbre 3',
  ''
]

export const CUSTOMER_NOTES = [
  'Regalo de cumpleaños',
  'Aniversario de bodas',
  'Ocasión especial',
  'Día de la madre',
  'San Valentín',
  ''
]

export const ADDRESSES = [
  'Av. Francisco de Miranda, Chacao, Caracas',
  'Calle Principal de Los Palos Grandes, Caracas',
  'Av. Libertador, Altamira, Caracas',
  'Urbanización Las Mercedes, Caracas',
  'Centro Comercial San Ignacio, Caracas',
  'Calle Paris, Las Mercedes, Caracas',
  'Av. Principal de La Castellana, Caracas',
  'Calle Madrid, Las Mercedes, Caracas',
  'Av. Luis Roche, Altamira, Caracas',
  'Urbanización La Florida, Caracas',
  'Residencias El Rosal, Caracas',
  'Av. Orinoco, Las Mercedes, Caracas',
  'Calle Los Samanes, Los Palos Grandes, Caracas',
  'Centro Comercial Sambil, Chacao, Caracas',
  'Av. Abraham Lincoln, Sabana Grande, Caracas',
  'Parque Cristal, Los Palos Grandes, Caracas',
  'Av. Andrés Bello, Los Palos Grandes, Caracas',
  'Urbanización Colinas de Bello Monte, Caracas',
  'Los Dos Caminos, Caracas',
  'La California Norte, Caracas'
]

export const PHONE_PREFIXES = ['412', '414', '424', '416', '426']

export const EMAIL_DOMAINS = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com']
`

  const dataDir = path.join(PROJECT_ROOT, 'scripts', 'data')
  fs.writeFileSync(path.join(dataDir, 'order-generator-constants.js'), constantsContent)

  console.log('✅ Created data/order-generator-constants.js')
}

/**
 * Update auto-order-generator.js
 */
function updateAutoOrderGenerator() {
  const sourceFile = path.join(PROJECT_ROOT, 'scripts', 'auto-order-generator.js')
  let content = fs.readFileSync(sourceFile, 'utf-8')

  // 1. Import JSON data files and constants
  const newImports = `import { createOrderWithItems, updateOrderStatus } from '../api/services/orderService.js'
import { confirmPayment, getPaymentMethods, getBCVRate } from '../api/services/paymentService.js'
import { getAllProducts, decrementStock } from '../api/services/productService.js'
import { initializeDIContainer } from '../api/architecture/di-container.js'
import dotenv from 'dotenv'
import logger from './shared/logger.js'

// Import data from JSON files
import firstNamesData from './data/first-names.es.json' assert { type: 'json' }
import lastNamesData from './data/last-names.es.json' assert { type: 'json' }

// Import constants
import {
  DELIVERY_SLOTS,
  DELIVERY_NOTES,
  CUSTOMER_NOTES,
  ADDRESSES,
  PHONE_PREFIXES,
  EMAIL_DOMAINS,
  STATUS
} from './data/order-generator-constants.js'

// Extract name arrays from JSON data
const FIRST_NAMES = firstNamesData.map(item => item.name)
const LAST_NAMES = lastNamesData.map(item => item.name)
`

  // Replace imports section
  content = content.replace(
    /import \{ createOrderWithItems, updateOrderStatus \} from ['"]\.\.\/api\/services\/orderService\.js['"]\nimport \{ confirmPayment, getPaymentMethods, getBCVRate \} from ['"]\.\.\/api\/services\/paymentService\.js['"]\nimport \{ getAllProducts, decrementStock \} from ['"]\.\.\/api\/services\/productService\.js['"]\nimport \{ initializeDIContainer \} from ['"]\.\.\/api\/architecture\/di-container\.js['"]\nimport dotenv from ['"]dotenv['"]/,
    newImports
  )

  // 2. Remove hardcoded arrays
  content = content.replace(
    /\n?\n?const FIRST_NAMES = \[(.|[\r\n])*?\]\n\n?/,
    '\n\n// Data loaded from JSON files\n\n'
  )

  content = content.replace(/\n?\n?const LAST_NAMES = \[(.|[\r\n])*?\]\n\n?/, '')

  content = content.replace(
    /\n?\n?const ADDRESSES = \[(.|[\r\n])*?\]\n\n?/,
    '\n// ADDRESSES loaded from constants\n\n'
  )

  content = content.replace(/\n?\n?const DELIVERY_SLOTS = \[(.|[\r\n])*?\]\n\n?/, '')

  content = content.replace(/\n?\n?const DELIVERY_NOTES = \[(.|[\r\n])*?\]\n\n?/, '')

  content = content.replace(/\n?\n?const CUSTOMER_NOTES = \[(.|[\r\n])*?\]\n\n?/, '')

  // 3. Replace custom log() function with logger calls
  const logFunctionRegex =
    /\n?\n?\/\*\*\n \* Logs con timestamp\n \*\/\nfunction log\(message, type = 'info'\) \{[\s\S]*?^}\n\n/
  content = content.replace(
    logFunctionRegex,
    '\n// Using unified logger from scripts/shared/logger.js\n\n'
  )

  // 4. Replace log() calls with appropriate logger methods
  content = content.replace(/log\(`([^`]+)\${([^}]+)}`\), 'warning'\)/g, 'logger.warn(`$1${$2}`)')
  content = content.replace(/log\(`([^`]+)\${([^}]+)}`\), 'success'\)/g, 'logger.info(`$1${$2}`)')
  content = content.replace(/log\(`([^`]+)\${([^}]+)}`\), 'error'\)/g, 'logger.error(`$1${$2}`)')
  content = content.replace(/log\(`([^`]+)\${([^}]+)}`\)/g, 'logger.info(`$1${$2}`)')

  // 5. Replace direct log() calls
  content = content.replace(/log\(([^,]+), '([^']+)'\)/g, (match, message, type) => {
    if (type === 'info') {
      return `logger.info(${message})`
    }
    if (type === 'warning') {
      return `logger.warn(${message})`
    }
    if (type === 'error') {
      return `logger.error(${message})`
    }
    if (type === 'success') {
      return `logger.info(${message})`
    }
    return match
  })

  content = content.replace(/log\(([^)]+)\)/g, 'logger.info($1)')

  // 6. Replace inline arrays with constants/variables
  content = content.replace(
    /const prefixes = \['412', '414', '424', '416', '426'\]/,
    'const prefixes = PHONE_PREFIXES'
  )

  content = content.replace(
    /const domains = \['gmail\.com', 'hotmail\.com', 'yahoo\.com', 'outlook\.com'\]/,
    'const domains = EMAIL_DOMAINS'
  )

  // 7. Fix console.log patterns to use logger
  // Find console.log in catch blocks
  content = content.replace(
    /} catch \(([^)]+)\) \{\n\s+log\([^)]+\)\n\s+throw/,
    '} catch (err) {\n    logger.error(err)\n    throw'
  )

  // 8. Translate Spanish comments to English (replace first 35 lines header)
  const headerComment = `/**
 * Auto Order Generator Service
 * Generates random purchase orders continuously as a service
 *
 * Features:
 * - Generates between 100-300 orders per day (random)
 * - Distributes orders uniformly across 24 hours
 * - Each order has 1-5 randomly selected products
 * - Automatically updates product stock
 * - Automatically confirms payments
 * - Follows Repository/Service Layer pattern
 *
 * Usage as service on Linux (systemd):
 * 1. Install as systemd service:
 *    sudo cp scripts/auto-order-generator.service /etc/systemd/system/
 *    sudo systemctl daemon-reload
 *    sudo systemctl enable auto-order-generator
 *    sudo systemctl start auto-order-generator
 *
 * 2. To view logs:
 *    journalctl -u auto-order-generator -f
 *
 * 3. To stop:
 *    sudo systemctl stop auto-order-generator
 *
 * Manual usage:
 * node scripts/auto-order-generator.js
 *
 * Configuration (in .env.local):
 * ORDER_GENERATOR_MIN_DAILY=100
 * ORDER_GENERATOR_MAX_DAILY=300
 * ORDER_GENERATOR_VERBOSE=true
 * ORDER_GENERATOR_LOG_FILE=/var/log/auto-order-generator.log
 */
`

  // Replace the old header with the new one
  const headerRegex = /\/\*\*\n \* Auto Order Generator Service[\s\S]*?\*\//
  content = content.replace(headerRegex, headerComment.trim())

  // 9. Replace Spanish inline comments
  const commentReplacements = [
    { from: '// Cargar configuración de entorno', to: '// Load environment configuration' },
    {
      from: '// INICIALIZAR DICONTAINER - IMPORTANTE!',
      to: '// Initialize DI Container - IMPORTANT!'
    },
    { from: '// CONFIGURACIÓN DIARIA', to: '// DAILY CONFIGURATION' },
    { from: '// Objetivos diarios (órdenes por día)', to: '// Daily targets (orders per day)' },
    { from: '// Número de items por orden', to: '// Number of items per order' },
    {
      from: '// Stock mínimo para evitar agotarse',
      to: '// Minimum stock threshold to avoid depletion'
    },
    { from: '// Reintentos en caso de error', to: '// Retries in case of error' },
    {
      from: '// Inicio y fin del día (hora en formato 24h)',
      to: '// Start and end of day (24h format)'
    },
    { from: '// Intervalos calculados dinámicamente', to: '// Intervals calculated dynamically' },
    { from: '// DATOS PARA GENERACIÓN ALEATORIA', to: '// DATA FOR RANDOM GENERATION' },
    { from: '// Data loaded from JSON files', to: '// Data loaded from JSON files' }
  ]

  for (const { from, to } of commentReplacements) {
    content = content.replace(new RegExp(from.replace(/[/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), to)
  }

  // Write the updated file
  fs.writeFileSync(sourceFile, content)

  console.log('✅ Updated scripts/auto-order-generator.js')
}

/**
 * Main execution
 */
function main() {
  console.log('\n🔄 Refactoring Auto Order Generator\n')
  console.log('Applying Silicon Valley Best Practices:')
  console.log('  - Extract hardcoded data to JSON')
  console.log('  - Use unified logger')
  console.log('  - Replace console.log with appropriate methods')
  console.log('  - Translate comments to English')
  console.log('  - Create constants for magic strings\n')

  createConstantsFile()
  updateAutoOrderGenerator()

  console.log('\n✅ Refactoring complete!\n')
  console.log('Improvements applied:')
  console.log('  1. ✅ Hardcoded data extracted to JSON files')
  console.log('  2. ✅ Constants created for magic strings')
  console.log('  3. ✅ Unified logger integrated')
  console.log('  4. ✅ Error logging standardized')
  console.log('  5. ✅ Comments translated to English\n')
}

main()
