/**
 * Procesado por B
 */

/**
 * Configuration Index
 * Centralized exports for all configuration files
 *
 * Usage:
 * import config, { getConfig, isFeatureEnabled } from './config/index.js'
 */

export { default as config } from './configLoader.js'
export * from './configLoader.js'

// Re-export constants
export * from './constants.js'

// Re-export error codes
export * from './errorCodes.js'

// Re-export swagger config (if needed)
export { default as swaggerConfig } from './swagger.js'
