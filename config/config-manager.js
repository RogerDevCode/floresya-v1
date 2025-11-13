/**
 * Centralized Configuration Manager
 * Following Silicon Valley Best Practices
 *
 * Features:
 * - Environment-based config loading
 * - Type validation
 * - Default values
 * - Centralized access pattern
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const CONFIG_DIR = path.join(__dirname, '.')
const NODE_ENV = process.env.NODE_ENV || 'development'

/**
 * Load configuration from file based on environment
 */
function loadConfig(env = NODE_ENV) {
  try {
    const configPath = path.join(CONFIG_DIR, `${env}.json`)
    const defaultPath = path.join(CONFIG_DIR, 'default.json')

    // Load default first
    const defaultConfig = JSON.parse(fs.readFileSync(defaultPath, 'utf-8'))

    // Load environment-specific config (if exists)
    let envConfig = {}
    if (fs.existsSync(configPath)) {
      envConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    }

    // Merge: env config overrides default
    return { ...defaultConfig, ...envConfig }
  } catch (error) {
    console.error(`Failed to load config for ${env}:`, error)
    throw error
  }
}

/**
 * Validate required configuration values
 */
function validateConfig(config) {
  const required = [
    'database.url',
    'logger.level',
    'api.port',
    'orderGenerator.minDaily',
    'orderGenerator.maxDaily'
  ]

  const missing = required.filter(key => {
    const value = getNestedValue(config, key)
    return value === undefined || value === null
  })

  if (missing.length > 0) {
    throw new Error(`Missing required config: ${missing.join(', ')}`)
  }

  return true
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current?.[key]
  }, obj)
}

/**
 * Create configuration object with validation and defaults
 */
function createConfig() {
  const config = loadConfig()

  // Apply defaults for missing values
  const finalConfig = {
    database: {
      url:
        process.env.DATABASE_URL || config.database?.url || 'postgresql://localhost:5432/floresya',
      maxConnections: config.database?.maxConnections || 20,
      timeout: config.database?.timeout || 10000
    },
    logger: {
      level: process.env.LOG_LEVEL || config.logger?.level || 'INFO',
      colors: process.env.LOG_COLORS !== 'false' && config.logger?.colors !== false,
      timestamp: config.logger?.timestamp !== false,
      file: process.env.LOG_FILE || config.logger?.file
    },
    api: {
      port: parseInt(process.env.PORT) || config.api?.port || 3000,
      host: process.env.HOST || config.api?.host || 'localhost',
      timeout: config.api?.timeout || 30000
    },
    orderGenerator: {
      minDaily:
        parseInt(process.env.ORDER_GENERATOR_MIN_DAILY) || config.orderGenerator?.minDaily || 100,
      maxDaily:
        parseInt(process.env.ORDER_GENERATOR_MAX_DAILY) || config.orderGenerator?.maxDaily || 300,
      minItems: config.orderGenerator?.minItems || 1,
      maxItems: config.orderGenerator?.maxItems || 5,
      verbose:
        process.env.ORDER_GENERATOR_VERBOSE === 'true' || config.orderGenerator?.verbose || false,
      logFile: process.env.ORDER_GENERATOR_LOG_FILE || config.orderGenerator?.logFile
    },
    bcv: {
      rate: parseFloat(process.env.BCV_RATE) || config.bcv?.rate || 36.5,
      updateInterval: config.bcv?.updateInterval || 3600000 // 1 hour
    },
    testing: {
      timeout: config.testing?.timeout || 5000,
      retries: config.testing?.retries || 3,
      headless: process.env.HEADLESS !== 'false' && config.testing?.headless !== false
    }
  }

  // Validate the final configuration
  validateConfig(finalConfig)

  return finalConfig
}

/**
 * Singleton pattern for config instance
 */
let configInstance = null

function getConfig() {
  if (!configInstance) {
    configInstance = createConfig()
  }
  return configInstance
}

/**
 * Export configuration manager
 */
export default {
  getConfig,
  loadConfig,
  validateConfig,
  getNestedValue
}
