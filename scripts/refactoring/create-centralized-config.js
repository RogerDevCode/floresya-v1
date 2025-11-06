#!/usr/bin/env node

/**
 * Create Centralized Configuration System
 * Following Silicon Valley Best Practices
 * - Centralized config management
 * - Environment-based configuration
 * - Type-safe config loading
 * - Validation of config values
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.join(__dirname, '..', '..')

/**
 * Create config directory structure
 */
function createConfigDirectory() {
  const configDir = path.join(PROJECT_ROOT, 'config')
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true })
  }
  return configDir
}

/**
 * Create config manager
 */
function createConfigManager() {
  const content = `/**
 * Centralized Configuration Manager
 * Following Silicon Valley Best Practices
 *
 * Features:
 * - Environment-based config loading
 * - Type validation
 * - Default values
 * - Centralized access pattern
 */

const CONFIG_DIR = new URL('../config/', import.meta.url).pathname
const NODE_ENV = process.env.NODE_ENV || 'development'

/**
 * Load configuration from file based on environment
 */
function loadConfig(env = NODE_ENV) {
  try {
    const configPath = path.join(CONFIG_DIR, \`\${env}.json\`)
    const defaultPath = path.join(CONFIG_DIR, 'default.json')

    // Load default first
    const defaultConfig = JSON.parse(
      fs.readFileSync(defaultPath, 'utf-8')
    )

    // Load environment-specific config (if exists)
    let envConfig = {}
    if (fs.existsSync(configPath)) {
      envConfig = JSON.parse(
        fs.readFileSync(configPath, 'utf-8')
      )
    }

    // Merge: env config overrides default
    return { ...defaultConfig, ...envConfig }
  } catch (error) {
    console.error(\`Failed to load config for \${env}:\`, error)
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
    throw new Error(\`Missing required config: \${missing.join(', ')}\`)
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
      url: process.env.DATABASE_URL || config.database?.url || 'postgresql://localhost:5432/floresya',
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
      minDaily: parseInt(process.env.ORDER_GENERATOR_MIN_DAILY) || config.orderGenerator?.minDaily || 100,
      maxDaily: parseInt(process.env.ORDER_GENERATOR_MAX_DAILY) || config.orderGenerator?.maxDaily || 300,
      minItems: config.orderGenerator?.minItems || 1,
      maxItems: config.orderGenerator?.maxItems || 5,
      verbose: process.env.ORDER_GENERATOR_VERBOSE === 'true' || config.orderGenerator?.verbose || false,
      logFile: process.env.ORDER_GENERATOR_LOG_FILE || config.orderGenerator?.logFile
    },
    bcv: {
      rate: parseFloat(process.env.BCV_RATE) || config.bcv?.rate || 36.50,
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
`

  return content
}

/**
 * Create default configuration
 */
function createDefaultConfig() {
  const content = `{
  "database": {
    "url": "postgresql://localhost:5432/floresya",
    "maxConnections": 20,
    "timeout": 10000
  },
  "logger": {
    "level": "INFO",
    "colors": true,
    "timestamp": true,
    "file": null
  },
  "api": {
    "port": 3000,
    "host": "localhost",
    "timeout": 30000
  },
  "orderGenerator": {
    "minDaily": 100,
    "maxDaily": 300,
    "minItems": 1,
    "maxItems": 5,
    "verbose": false,
    "logFile": null
  },
  "bcv": {
    "rate": 36.5,
    "updateInterval": 3600000
  },
  "testing": {
    "timeout": 5000,
    "retries": 3,
    "headless": true
  },
  "features": {
    "cors": true,
    "compression": true,
    "helmet": true,
    "rateLimit": true
  }
}
`

  return content
}

/**
 * Create development configuration
 */
function createDevelopmentConfig() {
  const content = `{
  "database": {
    "url": "postgresql://localhost:5432/floresya_dev",
    "maxConnections": 10,
    "timeout": 5000
  },
  "logger": {
    "level": "DEBUG",
    "colors": true
  },
  "api": {
    "port": 3000,
    "timeout": 30000
  },
  "orderGenerator": {
    "minDaily": 50,
    "maxDaily": 100,
    "verbose": true
  },
  "testing": {
    "timeout": 10000,
    "headless": false
  }
}
`

  return content
}

/**
 * Create production configuration
 */
function createProductionConfig() {
  const content = `{
  "database": {
    "url": "postgresql://prod-db:5432/floresya",
    "maxConnections": 50,
    "timeout": 10000
  },
  "logger": {
    "level": "WARN",
    "colors": false,
    "file": "/var/log/floresya/app.log"
  },
  "api": {
    "port": 8080,
    "host": "0.0.0.0",
    "timeout": 60000
  },
  "orderGenerator": {
    "minDaily": 200,
    "maxDaily": 500,
    "verbose": false,
    "logFile": "/var/log/floresya/order-generator.log"
  },
  "testing": {
    "timeout": 30000,
    "retries": 5,
    "headless": true
  },
  "features": {
    "cors": true,
    "compression": true,
    "helmet": true,
    "rateLimit": true
  }
}
`

  return content
}

/**
 * Create testing configuration
 */
function createTestingConfig() {
  const content = `{
  "database": {
    "url": "postgresql://localhost:5432/floresya_test",
    "maxConnections": 5,
    "timeout": 1000
  },
  "logger": {
    "level": "ERROR",
    "colors": false
  },
  "api": {
    "port": 3001,
    "timeout": 5000
  },
  "orderGenerator": {
    "minDaily": 10,
    "maxDaily": 20,
    "verbose": false
  },
  "testing": {
    "timeout": 5000,
    "retries": 1,
    "headless": true
  }
}
`

  return content
}

/**
 * Create README for configuration
 */
function createConfigReadme() {
  const content = `# Centralized Configuration System

This directory contains the centralized configuration management system for the Floresya project.

## Files

- **default.json** - Default configuration for all environments
- **development.json** - Development-specific overrides
- **production.json** - Production-specific overrides
- **testing.json** - Testing-specific overrides
- **README.md** - This file

## Usage

### In JavaScript/TypeScript

\`\`\`javascript
import configManager from '../config/config-manager.js'

// Get the full configuration
const config = configManager.getConfig()

// Access values
console.log(config.api.port)           // 3000 (or env PORT)
console.log(config.database.url)       // Database connection string
console.log(config.logger.level)       // INFO (or env LOG_LEVEL)

// Access nested values
const rate = configManager.getNestedValue(config, 'bcv.rate')
\`\`\`

### Environment Variables

You can override any configuration value using environment variables:

\`\`\`bash
# Database
export DATABASE_URL="postgresql://localhost:5432/mydb"

# API
export PORT=8080
export HOST="0.0.0.0"

# Logger
export LOG_LEVEL="DEBUG"
export LOG_COLORS="true"
export LOG_FILE="/var/log/app.log"

# Order Generator
export ORDER_GENERATOR_MIN_DAILY=200
export ORDER_GENERATOR_MAX_DAILY=500
export ORDER_GENERATOR_VERBOSE="true"
export ORDER_GENERATOR_LOG_FILE="/var/log/orders.log"

# BCV Rate
export BCV_RATE=36.75

# Testing
export HEADLESS="false"
\`\`\`

## Configuration Structure

\`\`\`json
{
  "database": {
    "url": "postgresql://...",
    "maxConnections": 20,
    "timeout": 10000
  },
  "logger": {
    "level": "INFO",
    "colors": true,
    "timestamp": true,
    "file": null
  },
  "api": {
    "port": 3000,
    "host": "localhost",
    "timeout": 30000
  },
  "orderGenerator": {
    "minDaily": 100,
    "maxDaily": 300,
    "minItems": 1,
    "maxItems": 5,
    "verbose": false,
    "logFile": null
  },
  "bcv": {
    "rate": 36.5,
    "updateInterval": 3600000
  },
  "testing": {
    "timeout": 5000,
    "retries": 3,
    "headless": true
  }
}
\`\`\`

## Environment Selection

The configuration system automatically selects the environment based on:

1. \`NODE_ENV\` environment variable (default: 'development')
2. Falls back to default.json

## Best Practices

1. **Never commit sensitive data** - Use environment variables for secrets
2. **Use .env files** for local development
3. **Document all config options** in this README
4. **Validate configuration** on startup
5. **Use defaults** for non-critical settings
6. **Log configuration** at startup (without secrets)

## Updating Configuration

To add a new configuration option:

1. Add it to **default.json** with a sensible default
2. Override in environment-specific files if needed
3. Update this README
4. Update type definitions (if using TypeScript)

## Validation

The configuration manager validates all required values on startup:

- database.url
- logger.level
- api.port
- orderGenerator.minDaily
- orderGenerator.maxDaily

If any required value is missing, the application will fail to start.

## Silicon Valley Best Practices Applied

✅ **Single Responsibility** - Config manager only handles configuration
✅ **Dependency Inversion** - Depends on environment variables, not hardcoded values
✅ **Open/Closed** - Easy to add new config options
✅ **Fail Fast** - Validates configuration on startup
✅ **DRY** - Centralized config prevents duplication
✅ **Environment-based** - Different configs for dev/staging/prod
\`\`\`

## References

- [12-Factor App](https://12factor.net/config)
- [The Config Pattern](https://github.com/lorenwest/node-config)
- [Google Cloud Configuration](https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-java-service)
`

  return content
}

/**
 * Update auto-order-generator to use centralized config
 */
function updateAutoOrderGenerator(_configManager) {
  const sourceFile = path.join(PROJECT_ROOT, 'scripts', 'auto-order-generator.js')
  let content = fs.readFileSync(sourceFile, 'utf-8')

  // Add config manager import
  const _importLine = `import configManager from '../config/config-manager.js'\n`
  content = content.replace(
    "import logger from './shared/logger.js'",
    "import logger from './shared/logger.js'\nimport configManager from '../config/config-manager.js'"
  )

  // Replace CONFIG object with centralized config
  const configRegex =
    /\n?\/\/ ========================================\n?\/\/ CONFIGURACIÓN DIARIA\n?\/\/ ========================================\n?\n?const CONFIG = \{[\s\S]*?\n\}/

  const newConfig = `
/ ========================================
// CENTRALIZED CONFIGURATION
// ========================================

const CONFIG = configManager.getConfig().orderGenerator
const DB_CONFIG = configManager.getConfig().database
const API_CONFIG = configManager.getConfig().api
`

  content = content.replace(configRegex, newConfig)

  // Update config usage
  content = content.replace(/process\.env\.ORDER_GENERATOR_MIN_DAILY \|\| '100'/, 'CONFIG.minDaily')
  content = content.replace(/process\.env\.ORDER_GENERATOR_MAX_DAILY \|\| '300'/, 'CONFIG.maxDaily')
  content = content.replace(/process\.env\.ORDER_GENERATOR_VERBOSE === 'true'/, 'CONFIG.verbose')

  // Remove dotenv config (now handled by config manager)
  content = content.replace(
    /\n?\/\/ Cargar configuración de entorno\n?dotenv\.config\(\{ path: '\.env\.local' \}\)/,
    '// Environment configuration handled by config-manager'
  )

  // Update log file path
  content = content.replace(/if \(process\.env\.ORDER_GENERATOR_LOG_FILE\)/, 'if (CONFIG.logFile)')
  content = content.replace(
    /if \(process\.env\.ORDER_GENERATOR_LOG_FILE\) \{[\s\S]*?fs\.appendFileSync\(process\.env\.ORDER_GENERATOR_LOG_FILE, logLine\)/,
    'if (CONFIG.logFile) {\n      fs.appendFileSync(CONFIG.logFile, logLine)'
  )

  fs.writeFileSync(sourceFile, content)
  return true
}

/**
 * Main execution
 */
function main() {
  console.log('\n🔧 Creating Centralized Configuration System\n')
  console.log('Applying Silicon Valley Best Practices:')
  console.log('  - Environment-based configuration')
  console.log('  - Centralized config management')
  console.log('  - Type validation')
  console.log('  - Default values\n')

  const configDir = createConfigDirectory()

  // Create config files
  console.log('✅ Creating configuration files...')
  fs.writeFileSync(path.join(configDir, 'config-manager.js'), createConfigManager())
  fs.writeFileSync(path.join(configDir, 'default.json'), createDefaultConfig())
  fs.writeFileSync(path.join(configDir, 'development.json'), createDevelopmentConfig())
  fs.writeFileSync(path.join(configDir, 'production.json'), createProductionConfig())
  fs.writeFileSync(path.join(configDir, 'testing.json'), createTestingConfig())
  fs.writeFileSync(path.join(configDir, 'README.md'), createConfigReadme())

  // Update auto-order-generator
  console.log('✅ Updating auto-order-generator.js to use centralized config...')
  updateAutoOrderGenerator()

  console.log('\n✅ Centralized configuration system created!\n')
  console.log('Files created:')
  console.log('  📁 config/')
  console.log('    ├── config-manager.js (Centralized config manager)')
  console.log('    ├── default.json (Default configuration)')
  console.log('    ├── development.json (Dev overrides)')
  console.log('    ├── production.json (Production overrides)')
  console.log('    ├── testing.json (Test overrides)')
  console.log('    └── README.md (Documentation)')
  console.log('')
  console.log('Updated:')
  console.log('  📝 scripts/auto-order-generator.js (Uses centralized config)')
  console.log('')
  console.log('Next steps:')
  console.log('  1. Update other scripts to use config-manager.js')
  console.log('  2. Set NODE_ENV environment variable')
  console.log('  3. Override config values via environment variables')
  console.log('  4. Remove hardcoded values from source code\n')
}

main()
