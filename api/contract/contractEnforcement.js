/**
 * Contract Enforcement System
 * Ensures API contract compliance between frontend and backend
 * Validates request/response formats against OpenAPI specification
 */

import fs from 'fs/promises'
import path from 'path'
import yaml from 'js-yaml'
import { BadRequestError } from '../errors/AppError.js'

let openApiSpec = null

/**
 * Load OpenAPI specification
 */
async function loadOpenApiSpec() {
  if (!openApiSpec) {
    const specPath = path.join(process.cwd(), 'api', 'docs', 'openapi-spec.yaml')
    const specContent = await fs.readFile(specPath, 'utf8')
    openApiSpec = yaml.load(specContent)
  }
  return openApiSpec
}

/**
 * Get operation definition from OpenAPI spec
 */
function getOperationSpec(path, method) {
  const spec = openApiSpec || {}
  return spec.paths?.[path]?.[method.toLowerCase()]
}

/**
 * Validate request parameters against OpenAPI spec
 */
function validateRequestParams(req, operationSpec) {
  const errors = []

  if (operationSpec?.parameters) {
    for (const param of operationSpec.parameters) {
      const paramIn = param.in
      const paramName = param.name

      let value
      switch (paramIn) {
        case 'path':
          value = req.params[paramName]
          break
        case 'query':
          value = req.query[paramName]
          break
        case 'header':
          value = req.headers[paramName.toLowerCase()]
          break
        case 'formData':
          value = req.body[paramName]
          break
      }

      if (param.required && (value === undefined || value === null || value === '')) {
        errors.push({
          location: paramIn,
          msg: `Parameter '${paramName}' is required`,
          param: paramName
        })
      }

      // Check type validation
      if (value !== undefined && param.schema?.type) {
        const expectedType = param.schema.type
        const actualType = typeof value

        if (expectedType === 'boolean') {
          // Handle string booleans (HTTP query params are always strings)
          if (actualType === 'string') {
            const normalizedValue = value.toLowerCase()
            if (normalizedValue === 'true' || normalizedValue === 'false') {
              // Convert to actual boolean for downstream processing
              if (paramIn === 'query') {
                req.query[paramName] = normalizedValue === 'true'
              }
            } else {
              errors.push({
                location: paramIn,
                msg: `Parameter '${paramName}' expected boolean ('true' or 'false'), got '${value}'`,
                param: paramName
              })
            }
          }
        } else if (expectedType === 'integer') {
          // Handle string numbers for integers
          if (actualType !== 'number' && isNaN(Number(value))) {
            errors.push({
              location: paramIn,
              msg: `Parameter '${paramName}' expected type '${expectedType}', got '${actualType}'`,
              param: paramName
            })
          }
        } else if (
          expectedType !== 'integer' &&
          expectedType !== 'boolean' &&
          actualType !== expectedType
        ) {
          errors.push({
            location: paramIn,
            msg: `Parameter '${paramName}' expected type '${expectedType}', got '${actualType}'`,
            param: paramName
          })
        }

        // Check minimum/maximum for numbers
        if ((expectedType === 'integer' || expectedType === 'number') && !isNaN(Number(value))) {
          const numValue = Number(value)
          if (param.schema.minimum !== undefined && numValue < param.schema.minimum) {
            errors.push({
              location: paramIn,
              msg: `Parameter '${paramName}' must be at least ${param.schema.minimum}`,
              param: paramName
            })
          }
          if (param.schema.maximum !== undefined && numValue > param.schema.maximum) {
            errors.push({
              location: paramIn,
              msg: `Parameter '${paramName}' must be at most ${param.schema.maximum}`,
              param: paramName
            })
          }
        }
      }
    }
  }

  return errors
}

/**
 * Validate request body against OpenAPI spec
 */
function validateRequestBody(req, operationSpec) {
  const errors = []

  if (operationSpec?.requestBody) {
    const contentType = req.get('Content-Type')

    // Check if content type is expected
    const expectedContentTypes = Object.keys(operationSpec.requestBody.content || {})
    if (
      expectedContentTypes.length > 0 &&
      !expectedContentTypes.some(type => contentType?.includes(type))
    ) {
      errors.push({
        location: 'headers',
        msg: `Expected content type ${expectedContentTypes.join(' or ')}, got ${contentType}`,
        param: 'Content-Type'
      })
    }

    // Validate body schema if application/json
    if (
      contentType?.includes('application/json') &&
      operationSpec.requestBody.content['application/json']?.schema
    ) {
      const schema = operationSpec.requestBody.content['application/json'].schema
      const body = req.body

      // For order creation, the schema supports both flat structure and nested structure
      // We need to handle both cases properly
      if (req.path === '/api/orders' && req.method === 'POST') {
        validateOrderRequestBody(body, schema, errors)
      } else if (req.path === '/api/products' && req.method === 'POST') {
        validateProductRequestBody(body, schema, errors)
      } else {
        // Use standard recursive validation for other endpoints
        validateSchemaRecursive(body, schema, errors, 'body')
      }
    }
  }

  return errors
}

/**
 * Special validation for order request body (supports both flat and nested structure)
 */
function validateOrderRequestBody(body, schema, errors) {
  // Check if body uses nested structure (order/items)
  if (body.order && body.items) {
    // Nested structure: validate order object and items array
    validateSchemaRecursive(
      body.order,
      {
        type: 'object',
        required: [
          'customer_email',
          'customer_name',
          'customer_phone',
          'delivery_address',
          'total_amount_usd'
        ],
        properties: {
          customer_email: { type: 'string', format: 'email' },
          customer_name: { type: 'string', minLength: 2, maxLength: 255 },
          customer_phone: { type: 'string', minLength: 7, maxLength: 20 },
          delivery_address: { type: 'string', minLength: 10, maxLength: 500 },
          delivery_date: { type: 'string', format: 'date' },
          delivery_time_slot: { type: 'string', maxLength: 100 },
          delivery_notes: { type: 'string', maxLength: 500 },
          total_amount_usd: { type: 'number', minimum: 0 },
          total_amount_ves: { type: 'number', minimum: 0 },
          currency_rate: { type: 'number', minimum: 0 },
          status: {
            type: 'string',
            enum: ['pending', 'verified', 'preparing', 'shipped', 'delivered', 'cancelled']
          },
          notes: { type: 'string', maxLength: 1000 }
        }
      },
      errors,
      'body',
      'order'
    )

    // Validate items array
    if (!Array.isArray(body.items) || body.items.length === 0) {
      errors.push({
        location: 'body',
        msg: 'Field items must be a non-empty array',
        param: 'items'
      })
    } else {
      for (let i = 0; i < body.items.length; i++) {
        const item = body.items[i]
        validateSchemaRecursive(
          item,
          {
            type: 'object',
            required: ['product_id', 'product_name', 'unit_price_usd', 'quantity'],
            properties: {
              product_id: { type: 'integer' },
              product_name: { type: 'string' },
              product_summary: { type: 'string' },
              unit_price_usd: { type: 'number' },
              unit_price_ves: { type: 'number' },
              quantity: { type: 'integer', minimum: 1 },
              subtotal_usd: { type: 'number' },
              subtotal_ves: { type: 'number' }
            }
          },
          errors,
          'body',
          `items[${i}]`
        )
      }
    }
  } else {
    // Flat structure: validate directly against schema
    validateSchemaRecursive(body, schema, errors, 'body')
  }
}

/**
 * Special validation for product request body
 */
function validateProductRequestBody(body, schema, errors) {
  // Check if body uses nested structure (product object)
  if (body.product) {
    // Nested structure: validate product object
    validateSchemaRecursive(
      body.product,
      {
        type: 'object',
        required: ['name', 'price_usd'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 255 },
          summary: { type: 'string' },
          description: { type: 'string' },
          price_usd: { type: 'number', minimum: 0 },
          price_ves: { type: 'number', minimum: 0 },
          stock: { type: 'integer', minimum: 0 },
          sku: { type: 'string', maxLength: 50 },
          featured: { type: 'boolean' },
          carousel_order: { type: 'integer', minimum: 0 }
        }
      },
      errors,
      'body',
      'product'
    )
  } else {
    // Flat structure: validate directly against schema
    validateSchemaRecursive(body, schema, errors, 'body')
  }
}

/**
 * Recursively validate schema structure
 */
function validateSchemaRecursive(data, schema, errors, location, parentPath = '') {
  // Check required fields
  if (schema.required && Array.isArray(schema.required)) {
    for (const requiredField of schema.required) {
      const fieldPath = parentPath ? `${parentPath}.${requiredField}` : requiredField
      if (data[requiredField] === undefined) {
        errors.push({
          location,
          msg: `Field '${fieldPath}' is required`,
          param: fieldPath
        })
      }
    }
  }

  // Type validation for properties
  if (schema.properties) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const fieldPath = parentPath ? `${parentPath}.${propName}` : propName
      const value = data[propName]

      if (value !== undefined) {
        // Handle nested object validation
        if (propSchema.type === 'object' && propSchema.properties) {
          validateSchemaRecursive(value, propSchema, errors, location, fieldPath)
        }
        // Handle array validation
        else if (propSchema.type === 'array' && propSchema.items) {
          if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
              const itemPath = `${fieldPath}[${i}]`
              validateSchemaRecursive(value[i], propSchema.items, errors, location, itemPath)
            }
          } else {
            errors.push({
              location,
              msg: `Field '${fieldPath}' expected type 'array', got '${typeof value}'`,
              param: fieldPath
            })
          }
        }
        // Handle primitive type validation
        else if (propSchema.type) {
          const expectedType = propSchema.type
          const actualType = typeof value

          if (expectedType === 'integer' && actualType !== 'number') {
            // Handle string numbers
            if (isNaN(Number(value))) {
              errors.push({
                location,
                msg: `Field '${fieldPath}' expected type '${expectedType}', got '${actualType}'`,
                param: fieldPath
              })
            }
          } else if (expectedType !== 'integer' && actualType !== expectedType) {
            errors.push({
              location,
              msg: `Field '${fieldPath}' expected type '${expectedType}', got '${actualType}'`,
              param: fieldPath
            })
          }

          // Min/Max validation for numbers
          if ((expectedType === 'integer' || expectedType === 'number') && !isNaN(Number(value))) {
            const numValue = Number(value)
            if (propSchema.minimum !== undefined && numValue < propSchema.minimum) {
              errors.push({
                location,
                msg: `Field '${fieldPath}' must be at least ${propSchema.minimum}`,
                param: fieldPath
              })
            }
            if (propSchema.maximum !== undefined && numValue > propSchema.maximum) {
              errors.push({
                location,
                msg: `Field '${fieldPath}' must be at most ${propSchema.maximum}`,
                param: fieldPath
              })
            }
          }

          // Length validation for strings
          if (expectedType === 'string') {
            if (propSchema.minLength !== undefined && String(value).length < propSchema.minLength) {
              errors.push({
                location,
                msg: `Field '${fieldPath}' must be at least ${propSchema.minLength} characters`,
                param: fieldPath
              })
            }
            if (propSchema.maxLength !== undefined && String(value).length > propSchema.maxLength) {
              errors.push({
                location,
                msg: `Field '${fieldPath}' must be at most ${propSchema.maxLength} characters`,
                param: fieldPath
              })
            }

            // Format validation for email
            if (propSchema.format === 'email' && value) {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
              if (!emailRegex.test(String(value))) {
                errors.push({
                  location,
                  msg: `Field '${fieldPath}' must be a valid email address`,
                  param: fieldPath
                })
              }
            }
          }
        }
      }
    }
  }
}

/**
 * Validate response against OpenAPI spec
 */
function validateResponse(res, operationSpec) {
  const errors = []

  if (operationSpec && operationSpec.responses) {
    // Check the response status against spec
    const statusCode = res.statusCode.toString()
    const responseSpec = operationSpec.responses[statusCode] || operationSpec.responses['default']

    if (responseSpec && responseSpec.content && responseSpec.content['application/json']) {
      const schema = responseSpec.content['application/json'].schema
      const body = res.locals.responseBody

      if (schema && body) {
        try {
          // Basic validation
          if (schema.type === 'object' && typeof body !== 'object') {
            errors.push({
              location: 'response',
              msg: `Expected response type 'object', got '${typeof body}'`,
              statusCode: statusCode
            })
          }

          if (schema.type === 'array' && !Array.isArray(body)) {
            errors.push({
              location: 'response',
              msg: `Expected response type 'array', got '${typeof body}'`,
              statusCode: statusCode
            })
          }
        } catch (e) {
          // If validation fails for any reason, log it but don't break the response
          console.error('Response validation error:', e.message)
        }
      }
    }
  }

  return errors
}

/**
 * Contract enforcement middleware
 */
export function contractEnforcementMiddleware() {
  return async (req, res, next) => {
    try {
      // Load spec if not already loaded
      await loadOpenApiSpec()

      // Get the operation spec for this route
      const operationSpec = getOperationSpec(req.path, req.method)

      if (operationSpec) {
        // Validate request parameters
        const paramErrors = validateRequestParams(req, operationSpec)
        if (paramErrors.length > 0) {
          console.warn(`CONTRACT VIOLATION - Parameters: ${JSON.stringify(paramErrors)}`)
          return res.status(400).json({
            success: false,
            error: 'validation',
            message: 'Request parameters validation failed',
            details: paramErrors,
            contract: 'See /api-docs for the official API specification'
          })
        }

        // Validate request body
        const bodyErrors = validateRequestBody(req, operationSpec)
        if (bodyErrors.length > 0) {
          console.warn(`CONTRACT VIOLATION - Request Body: ${JSON.stringify(bodyErrors)}`)
          return res.status(400).json({
            success: false,
            error: 'validation',
            message: 'Request body contract validation failed',
            details: bodyErrors,
            contract: 'See /api-docs for the official API specification'
          })
        }
      }

      // Store the original json method to intercept responses
      const originalJson = res.json
      res.json = function (data) {
        // Save response body for validation later
        res.locals.responseBody = data

        // Get operation spec again for response validation
        if (operationSpec) {
          const responseErrors = validateResponse(res, operationSpec)
          if (responseErrors.length > 0) {
            console.error('Response format violation:', responseErrors)
            // In production, we might send a generic error instead
            if (process.env.NODE_ENV === 'development') {
              return originalJson.call(this, {
                success: false,
                error: 'API Contract Violation - Response',
                message: 'Response does not conform to API specification',
                details: responseErrors
              })
            }
          }
        }

        // Send the original response
        return originalJson.call(this, data)
      }

      // Continue to the next middleware
      next()
    } catch (error) {
      console.error('Contract enforcement error:', error)
      next(error)
    }
  }
}

/**
 * Get API specification
 */
export async function getApiSpec() {
  return await loadOpenApiSpec()
}

/**
 * Validate a request against the OpenAPI spec programmatically
 */
export async function validateRequest(req) {
  await loadOpenApiSpec()

  const operationSpec = getOperationSpec(req.path, req.method)
  if (!operationSpec) {
    throw new BadRequestError(
      `Operation ${req.method} ${req.path} not defined in API specification`
    )
  }

  const paramErrors = validateRequestParams(req, operationSpec)
  const bodyErrors = validateRequestBody(req, operationSpec)

  const allErrors = [...paramErrors, ...bodyErrors]

  if (allErrors.length > 0) {
    const error = new BadRequestError('Request does not conform to API specification')
    error.validationErrors = allErrors
    throw error
  }

  return true
}

/**
 * Validate a response against the OpenAPI spec programmatically
 */
export async function validateResponseData(path, method, statusCode, responseData) {
  await loadOpenApiSpec()

  const operationSpec = getOperationSpec(path, method)
  if (!operationSpec) {
    throw new BadRequestError(`Operation ${method} ${path} not defined in API specification`)
  }

  const responseSpec = operationSpec.responses[statusCode] || operationSpec.responses['default']
  if (!responseSpec) {
    throw new BadRequestError(
      `Response ${statusCode} for ${method} ${path} not defined in API specification`
    )
  }

  return validateResponse({ statusCode, locals: { responseBody: responseData } }, operationSpec)
}
