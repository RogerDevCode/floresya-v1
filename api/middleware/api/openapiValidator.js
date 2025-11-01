/**
 * Enhanced OpenAPI Validator Middleware
 * Validates requests and responses against OpenAPI specification
 * Provides automatic contract enforcement between frontend and backend
 * Detects and reports divergences between spec and implementation
 *
 * Uses centralized configuration from configLoader
 */

import { join as _join, dirname } from 'path'
import { fileURLToPath } from 'url'
import config from '../../config/configLoader.js'
import {
  DivergenceDetector,
  createDivergenceDetectionMiddleware
} from '../../contract/divergenceDetector.js'

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Safe OpenAPI Contract System
 * Uses custom validation instead of problematic express-openapi-validator
 */
export async function initializeOpenApiValidator(app) {
  try {
    console.log('🔧 Using custom contract validation system...')

    // Use our custom contract enforcement middleware instead
    const { contractEnforcementMiddleware } = await import('../../contract/contractEnforcement.js')

    // Apply contract enforcement middleware
    app.use(contractEnforcementMiddleware())

    console.log('✅ Custom contract validation system initialized successfully')
    console.log('📋 Contract validation available via: npm run validate:contract')
  } catch (error) {
    console.error('❌ Contract validation system failed:', error.message)
    console.error('🔧 Continuing without contract validation')
    console.error('💡 Manual validation available via: npm run validate:contract')
    // Don't throw error - allow server to start
  }
}
/**
 * Middleware to validate that OpenAPI spec matches implementation
 * Detects divergences between documentation and code
 */
export function detectOpenApiDivergences(req, res, next) {
  // Enhanced divergence detection will be implemented here
  // For now, ensure the spec matches the actual implementation
  next()
}

/**
 * Error handler for OpenAPI validation errors
 * Provides clear contract violation messages
 */
export function handleOpenApiValidationErrors(err, req, res, next) {
  // Check if this is an OpenAPI validation error
  if (err.status === 400 && err.type === 'request.openapi.validation') {
    // OpenAPI request validation error
    return res.status(400).json({
      success: false,
      error: 'API Contract Violation',
      message: 'Request does not conform to API specification',
      details: {
        path: req.path,
        method: req.method,
        validationErrors: err.errors.map(error => ({
          location: error.location,
          msg: error.message,
          param: error.params?.missingProperty || error.params?.additionalProperty || error.keyword,
          value: error.data,
          schemaPath: error.schemaPath
        }))
      },
      contract: 'See /api-docs for the official API specification'
    })
  }

  // Check if this is an OpenAPI response validation error
  if (err.status === 500 && err.message?.includes('response schema')) {
    console.error('❌ Response format does not match OpenAPI specification:', {
      path: req.path,
      method: req.method,
      body: req.body,
      originalError: err.message
    })

    // In production, we might still return a generic error, but log the details
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Response format validation failed - contact system administrator',
      details: config.IS_DEVELOPMENT ? err.message : undefined
    })
  }

  // Pass through non-validation errors
  next(err)
}

/**
 * Function to validate request against OpenAPI spec
 * This can be used in middleware or before processing requests
 */
export async function validateRequestAgainstSpec(req, res, next) {
  const detector = new DivergenceDetector()
  await detector.initialize()

  // Check for request divergences
  const divergences = await detector.checkRequestDivergence(req)
  if (divergences) {
    if (Array.isArray(divergences)) {
      divergences.forEach(div => detector.addDivergence(div))
    } else {
      detector.addDivergence(divergences)
    }
  }

  // If there are critical divergences, return error
  if (divergences && !Array.isArray(divergences) && divergences.type === 'endpoint_not_defined') {
    return res.status(404).json({
      success: false,
      error: 'Endpoint Not Found',
      message: divergences.message,
      contract: 'See /api-docs for the official API specification'
    })
  }

  next()
}

/**
 * Function to create a divergence detector middleware
 */
export function createDivergenceDetector() {
  return createDivergenceDetectionMiddleware()
}
