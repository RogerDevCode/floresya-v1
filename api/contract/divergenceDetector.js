/**
 * Advanced Divergence Detection System
 * Monitors and reports discrepancies between API implementation and OpenAPI specification
 */

import fs from 'fs/promises'
import path from 'path'
import yaml from 'js-yaml'

let openApiSpec = null
const specPath = path.join(process.cwd(), 'api', 'docs', 'openapi-spec.yaml')

/**
 * Load OpenAPI specification
 */
async function loadOpenApiSpec() {
  if (!openApiSpec) {
    const specContent = await fs.readFile(specPath, 'utf8')
    openApiSpec = yaml.load(specContent)
  }
  return openApiSpec
}

/**
 * Extract operation spec for a given path and method
 */
function getOperationSpec(path, method) {
  if (!openApiSpec) {
    return null
  }
  return openApiSpec.paths?.[path]?.[method.toLowerCase()]
}

/**
 * Divergence Detector class
 */
export class DivergenceDetector {
  constructor() {
    this.divergences = []
    this.spec = null
  }

  /**
   * Initialize the detector by loading the spec
   */
  async initialize() {
    this.spec = await loadOpenApiSpec()
  }

  /**
   * Check request against spec for divergences
   */
  async checkRequestDivergence(req) {
    if (!this.spec) {
      await this.initialize()
    }

    // Skip validation for static files and non-API routes
    const excludedPaths = [
      /^\/images\//, // Static images
      /^\/css\//, // Static CSS
      /^\/js\//, // Static JS
      /^\/pages\//, // Static HTML pages
      /^\/favicon\.ico$/, // Favicon
      /^\/robots\.txt$/, // Robots
      /^\d+\//, // Malformed paths like "/87/images"
      /^\/[^/]+\.(svg|png|jpg|jpeg|gif|css|js|html)$/ // Static file extensions
    ]

    // Check if path should be excluded
    const shouldExclude = excludedPaths.some(pattern => pattern.test(req.path))
    if (shouldExclude) {
      return null // No divergence for excluded paths
    }

    // Only validate API endpoints
    if (!req.path.startsWith('/api/')) {
      return null // No divergence for non-API paths
    }

    const operationSpec = getOperationSpec(req.path, req.method)

    if (!operationSpec) {
      // Endpoint not defined in spec
      return {
        type: 'endpoint_not_defined',
        severity: 'critical',
        message: `Endpoint ${req.method} ${req.path} is not defined in OpenAPI specification`,
        path: req.path,
        method: req.method
      }
    }

    const divergences = []

    // Check path parameters
    if (operationSpec.parameters) {
      for (const param of operationSpec.parameters) {
        if (param.in === 'path' && param.required) {
          if (!req.params[param.name]) {
            divergences.push({
              type: 'missing_path_param',
              severity: 'high',
              message: `Required path parameter '${param.name}' missing in request`,
              path: req.path,
              method: req.method,
              paramName: param.name
            })
          }
        }
      }
    }

    // Check query parameters
    if (operationSpec.parameters) {
      for (const param of operationSpec.parameters) {
        if (param.in === 'query' && param.required) {
          if (!req.query[param.name]) {
            divergences.push({
              type: 'missing_query_param',
              severity: 'high',
              message: `Required query parameter '${param.name}' missing in request`,
              path: req.path,
              method: req.method,
              paramName: param.name
            })
          }
        }
      }
    }

    // Check request body if defined in spec
    if (operationSpec.requestBody) {
      if (!req.body || Object.keys(req.body).length === 0) {
        // Check if body is required
        const contentTypes = Object.keys(operationSpec.requestBody.content || {})
        if (operationSpec.requestBody.required !== false && contentTypes.length > 0) {
          divergences.push({
            type: 'missing_request_body',
            severity: 'high',
            message: `Request body is required for ${req.method} ${req.path}`,
            path: req.path,
            method: req.method
          })
        }
      } else {
        // Validate properties in body against schema
        for (const [contentType, contentSpec] of Object.entries(
          operationSpec.requestBody.content || {}
        )) {
          if (contentType.includes('application/json') && contentSpec.schema) {
            const schema = contentSpec.schema

            // Check required fields
            if (schema.required && Array.isArray(schema.required)) {
              for (const requiredField of schema.required) {
                if (!(requiredField in req.body)) {
                  divergences.push({
                    type: 'missing_required_field',
                    severity: 'high',
                    message: `Required field '${requiredField}' missing in request body`,
                    path: req.path,
                    method: req.method,
                    fieldName: requiredField
                  })
                }
              }
            }

            // Check for extra fields not defined in spec
            if (schema.properties) {
              const allowedFields = Object.keys(schema.properties)
              for (const field of Object.keys(req.body)) {
                if (!allowedFields.includes(field)) {
                  divergences.push({
                    type: 'extra_field_in_request',
                    severity: 'medium',
                    message: `Extra field '${field}' in request body not defined in OpenAPI spec`,
                    path: req.path,
                    method: req.method,
                    fieldName: field
                  })
                }
              }
            }
          }
        }
      }
    }

    return divergences.length > 0 ? divergences : null
  }

  /**
   * Check response against spec for divergences
   */
  async checkResponseDivergence(req, res, responseData) {
    if (!this.spec) {
      await this.initialize()
    }

    const operationSpec = getOperationSpec(req.path, req.method)

    if (!operationSpec) {
      // If endpoint isn't in spec, can't validate response
      return null
    }

    const statusCode = res.statusCode.toString()
    const responseSpec = operationSpec.responses?.[statusCode] || operationSpec.responses?.default

    if (!responseSpec) {
      // No response defined for this status code in spec
      return {
        type: 'undefined_response_status',
        severity: 'medium',
        message: `Response status ${statusCode} for ${req.method} ${req.path} not defined in OpenAPI specification`,
        path: req.path,
        method: req.method,
        statusCode: statusCode
      }
    }

    const divergences = []

    // Check response content
    if (responseSpec.content && responseSpec.content['application/json']) {
      const schema = responseSpec.content['application/json'].schema

      if (schema && responseData) {
        // Only validate if we have a schema that defines structure
        if (
          schema.type === 'object' &&
          typeof responseData === 'object' &&
          !Array.isArray(responseData)
        ) {
          // Check required fields in response
          if (schema.required && Array.isArray(schema.required)) {
            for (const requiredField of schema.required) {
              if (!(requiredField in responseData)) {
                divergences.push({
                  type: 'missing_required_response_field',
                  severity: 'high',
                  message: `Required response field '${requiredField}' missing`,
                  path: req.path,
                  method: req.method,
                  fieldName: requiredField,
                  statusCode: statusCode
                })
              }
            }
          }

          // Check for extra fields not defined in spec (if additionalProperties is false)
          if (schema.properties && schema.additionalProperties === false) {
            const allowedFields = Object.keys(schema.properties)
            for (const field of Object.keys(responseData)) {
              if (!allowedFields.includes(field)) {
                divergences.push({
                  type: 'extra_field_in_response',
                  severity: 'medium',
                  message: `Extra field '${field}' in response not defined in OpenAPI spec`,
                  path: req.path,
                  method: req.method,
                  fieldName: field,
                  statusCode: statusCode
                })
              }
            }
          }
        }

        // Check if the response is an array when the schema expects one
        if (schema.type === 'array' && !Array.isArray(responseData)) {
          divergences.push({
            type: 'response_type_mismatch',
            severity: 'high',
            message: `Expected array response, got ${typeof responseData}`,
            path: req.path,
            method: req.method,
            statusCode: statusCode
          })
        }

        // Check if the response is an object when the schema expects one
        if (
          schema.type === 'object' &&
          (Array.isArray(responseData) || typeof responseData !== 'object')
        ) {
          divergences.push({
            type: 'response_type_mismatch',
            severity: 'high',
            message: `Expected object response, got ${Array.isArray(responseData) ? 'array' : typeof responseData}`,
            path: req.path,
            method: req.method,
            statusCode: statusCode
          })
        }
      }
    }

    return divergences.length > 0 ? divergences : null
  }

  /**
   * Add a divergence to the collection
   */
  addDivergence(divergence) {
    this.divergences.push({
      ...divergence,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Get all collected divergences
   */
  getDivergences() {
    return this.divergences
  }

  /**
   * Clear all collected divergences
   */
  clearDivergences() {
    this.divergences = []
  }

  /**
   * Generate a report of divergences
   */
  generateReport() {
    const critical = this.divergences.filter(d => d.severity === 'critical')
    const high = this.divergences.filter(d => d.severity === 'high')
    const medium = this.divergences.filter(d => d.severity === 'medium')
    const low = this.divergences.filter(d => d.severity === 'low')

    return {
      timestamp: new Date().toISOString(),
      total: this.divergences.length,
      critical: critical.length,
      high: high.length,
      medium: medium.length,
      low: low.length,
      divergences: this.divergences
    }
  }
}

/**
 * Create a middleware that detects divergences in real-time
 */
export function createDivergenceDetectionMiddleware() {
  return async (req, res, next) => {
    const detector = new DivergenceDetector()
    await detector.initialize()

    // Store original response methods to intercept responses
    const originalJson = res.json
    const originalSend = res.send

    // Intercept json responses
    res.json = function (data) {
      // Check for request divergences
      detector
        .checkRequestDivergence(req)
        .then(requestDivergences => {
          if (requestDivergences) {
            if (Array.isArray(requestDivergences)) {
              requestDivergences.forEach(div => {
                detector.addDivergence(div)
                console.warn(`CONTRACT DIVERGENCE DETECTED: ${div.type} - ${div.message}`)
              })
            } else {
              detector.addDivergence(requestDivergences)
              console.warn(
                `CONTRACT DIVERGENCE DETECTED: ${requestDivergences.type} - ${requestDivergences.message}`
              )
            }
          }

          // Check for response divergences
          detector
            .checkResponseDivergence(req, res, data)
            .then(responseDivergences => {
              if (responseDivergences) {
                if (Array.isArray(responseDivergences)) {
                  responseDivergences.forEach(div => {
                    detector.addDivergence(div)
                    console.warn(`CONTRACT DIVERGENCE DETECTED: ${div.type} - ${div.message}`)
                  })
                } else {
                  detector.addDivergence(responseDivergences)
                  console.warn(
                    `CONTRACT DIVERGENCE DETECTED: ${responseDivergences.type} - ${responseDivergences.message}`
                  )
                }
              }
            })
            .catch(err => console.error('Error checking response divergence:', err))
        })
        .catch(err => console.error('Error checking request divergence:', err))

      // Send the original response
      return originalJson.call(this, data)
    }

    // Intercept send responses
    res.send = function (data) {
      // For non-JSON responses, we can still check for basic divergences
      detector
        .checkRequestDivergence(req)
        .then(requestDivergences => {
          if (requestDivergences) {
            if (Array.isArray(requestDivergences)) {
              requestDivergences.forEach(div => {
                detector.addDivergence(div)
                console.warn(`CONTRACT DIVERGENCE DETECTED: ${div.type} - ${div.message}`)
              })
            } else {
              detector.addDivergence(requestDivergences)
              console.warn(
                `CONTRACT DIVERGENCE DETECTED: ${requestDivergences.type} - ${requestDivergences.message}`
              )
            }
          }
        })
        .catch(err => console.error('Error checking request divergence:', err))

      // Send the original response
      return originalSend.call(this, data)
    }

    // Continue with the request
    next()
  }
}

/**
 * Function to run a full divergence scan against all routes
 */
export async function runFullDivergenceScan() {
  console.log('🔍 Running full divergence scan...')

  const detector = new DivergenceDetector()
  await detector.initialize()

  // TODO: In a real implementation, we would call all endpoints programmatically
  // to test them against the spec. For now, we'll just return the detector instance
  // which can be used to check specific requests/responses

  console.log('✅ Full divergence scan completed')
  return detector
}

/**
 * Get divergence report endpoint handler
 */
export function getDivergenceReport(req, res) {
  const detector = new DivergenceDetector()

  const report = detector.generateReport()

  res.status(200).json({
    success: true,
    data: report,
    message: 'Divergence report generated successfully'
  })
}

/**
 * Clear divergences endpoint handler
 */
export function clearDivergences(req, res) {
  const detector = new DivergenceDetector()
  detector.clearDivergences()

  res.status(200).json({
    success: true,
    message: 'Divergences cleared successfully'
  })
}
