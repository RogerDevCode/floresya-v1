/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Enhanced OpenAPI Contract Validator
 * Enforces frontend/backend contract compliance
 * Provides automatic divergence detection
 *
 * Uses centralized configuration from configLoader
 */

import OpenApiValidator from 'express-openapi-validator'
import config from '../../config/configLoader.js'
import { swaggerSpec } from '../../config/swagger.js'
import { ValidationError } from '../../errors/AppError.js'

/**
 * Contract Compliance Analyzer
 * Detects and reports contract divergences
 */
export class ContractComplianceAnalyzer {
  constructor(spec) {
    this.spec = spec
  }

  /**
   * Analyze request for contract compliance
   */
  analyzeRequest(req) {
    const violations = []

    // Find matching operation
    const pathItem = this.findOperation(req.path, req.method)
    if (!pathItem) {
      violations.push({
        type: 'PATH_NOT_FOUND',
        message: `Path ${req.path} not defined in OpenAPI spec`,
        severity: 'HIGH'
      })
      return violations
    }

    // Validate request body
    if (pathItem.requestBody && req.body) {
      violations.push(...this.validateRequestBody(pathItem.requestBody, req.body))
    }

    return violations
  }

  /**
   * Find operation in OpenAPI spec
   */
  findOperation(path, method) {
    // Try exact match first
    if (this.spec.paths[path]) {
      return this.spec.paths[path][method.toLowerCase()]
    }

    // Try parameterized paths
    for (const [specPath, pathItem] of Object.entries(this.spec.paths)) {
      const regex = new RegExp('^' + specPath.replace(/{[^}]+}/g, '[^/]+') + '$')
      if (regex.test(path) && pathItem[method.toLowerCase()]) {
        return pathItem[method.toLowerCase()]
      }
    }

    return null
  }

  /**
   * Validate request body against schema
   */
  validateRequestBody(requestBody, body) {
    const violations = []

    const content = requestBody.content?.['application/json']
    if (!content?.schema) {
      return violations
    }

    const schema = content.schema

    // Check required fields
    if (schema.required && Array.isArray(schema.required)) {
      for (const field of schema.required) {
        if (body[field] === undefined || body[field] === null) {
          violations.push({
            type: 'MISSING_REQUIRED_FIELD',
            message: `Required field '${field}' is missing`,
            field: field,
            severity: 'HIGH'
          })
        }
      }
    }

    return violations
  }
}

/**
 * Enhanced OpenAPI Validator Setup
 */
export function createOpenApiValidator(options = {}) {
  const validatorConfig = {
    apiSpec: swaggerSpec,
    validateRequests: true,
    validateResponses: config.IS_DEVELOPMENT,
    validateSecurity: false, // Handled separately
    ...options
  }

  return OpenApiValidator.middleware(validatorConfig)
}

/**
 * Contract Divergence Detector
 * Monitors API traffic for contract violations
 */
export function contractDivergenceDetector(req, res, next) {
  // Analyze request for contract compliance
  const analyzer = new ContractComplianceAnalyzer(swaggerSpec)
  const violations = analyzer.analyzeRequest(req)

  if (violations.length > 0) {
    // Log contract violation
    console.warn('🚨 CONTRACT DIVERGENCE DETECTED:', {
      path: req.path,
      method: req.method,
      violations: violations.map(v => v.message),
      timestamp: new Date().toISOString()
    })

    // Attach violations to request for error handling
    req._contractViolations = violations
  }

  next()
}

/**
 * OpenAPI Validation Error Handler
 * Converts validation errors to standardized format
 */
export function openApiErrorHandler(err, req, res, next) {
  if (err.status && err.errors) {
    // OpenAPI validation error
    const validationErrors = err.errors.map(error => {
      const path = error.path.replace(/^\//, '').replace(/\//g, '.')
      return `${path}: ${error.message}`
    })

    const appError = new ValidationError(
      'Request validation failed against API contract',
      validationErrors
    )

    // Set proper status code for validation errors
    appError.statusCode = 400

    // Add context for debugging
    appError.context = {
      openApiValidation: true,
      requestPath: req.path,
      requestMethod: req.method,
      validationErrors: err.errors
    }

    return next(appError)
  }

  next(err)
}

/**
 * Real-time Contract Monitoring
 * Alerts on contract violations
 */
export function realTimeContractMonitor(req, res, next) {
  const startTime = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - startTime

    // Report contract compliance metrics
    if (req._contractViolations && req._contractViolations.length > 0) {
      console.info('📊 CONTRACT VIOLATION METRICS:', {
        path: req.path,
        method: req.method,
        duration: `${duration}ms`,
        violations: req._contractViolations.length,
        timestamp: new Date().toISOString()
      })
    }
  })

  next()
}
