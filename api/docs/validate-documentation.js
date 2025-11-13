#!/usr/bin/env node

/**
 * Documentation Validation System
 * Validates generated OpenAPI documentation for consistency and compliance
 */

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Validation rules for documentation consistency
 */
const VALIDATION_RULES = {
  // Schema consistency checks
  schemas: {
    requiredFields: ['type', 'properties'],
    namingConvention: /^[a-z][a-zA-Z]*$/,
    maxProperties: 50
  },

  // Endpoint consistency checks
  endpoints: {
    requiredFields: ['summary', 'responses'],
    responseConsistency: true,
    parameterValidation: true
  },

  // Response consistency checks
  responses: {
    successResponsePattern: /200|201/,
    errorResponsePattern: /4\d\d|5\d\d/,
    contentTypeConsistency: true
  }
}

/**
 * Validates schema definitions
 * @param {Object} schemas - Schema definitions from OpenAPI spec
 * @returns {Array} Validation errors
 */
function validateSchemas(schemas) {
  const errors = []

  Object.entries(schemas).forEach(([schemaName, schema]) => {
    // Check required fields
    if (!schema.type || !schema.properties) {
      errors.push(`Schema '${schemaName}' missing required fields: type, properties`)
    }

    // Check naming convention
    if (!VALIDATION_RULES.schemas.namingConvention.test(schemaName)) {
      errors.push(`Schema '${schemaName}' doesn't follow naming convention (should be camelCase)`)
    }

    // Check property count
    if (
      schema.properties &&
      Object.keys(schema.properties).length > VALIDATION_RULES.schemas.maxProperties
    ) {
      errors.push(
        `Schema '${schemaName}' has too many properties (${Object.keys(schema.properties).length})`
      )
    }

    // Check for example values
    if (schema.properties) {
      Object.entries(schema.properties).forEach(([propName, propDef]) => {
        if (!propDef.example && propDef.type !== 'object' && propDef.type !== 'array') {
          errors.push(`Schema '${schemaName}' property '${propName}' missing example value`)
        }
      })
    }
  })

  return errors
}

/**
 * Validates endpoint definitions
 * @param {Object} paths - Path definitions from OpenAPI spec
 * @returns {Array} Validation errors
 */
function validateEndpoints(paths) {
  const errors = []

  Object.entries(paths).forEach(([path, pathItem]) => {
    Object.entries(pathItem).forEach(([method, operation]) => {
      // Check required fields
      if (!operation.summary) {
        errors.push(`Endpoint ${method.toUpperCase()} ${path} missing summary`)
      }

      if (!operation.responses) {
        errors.push(`Endpoint ${method.toUpperCase()} ${path} missing responses`)
      }

      // Check response consistency
      if (operation.responses) {
        const responseCodes = Object.keys(operation.responses)

        // Should have at least one success response
        const hasSuccessResponse = responseCodes.some(code =>
          VALIDATION_RULES.responses.successResponsePattern.test(code)
        )

        if (!hasSuccessResponse) {
          errors.push(`Endpoint ${method.toUpperCase()} ${path} missing success response (2xx)`)
        }

        // Should have error responses for bad requests
        const hasErrorResponse = responseCodes.some(code =>
          VALIDATION_RULES.responses.errorResponsePattern.test(code)
        )

        if (!hasErrorResponse) {
          errors.push(`Endpoint ${method.toUpperCase()} ${path} missing error responses (4xx/5xx)`)
        }
      }

      // Check parameter consistency
      if (operation.parameters) {
        operation.parameters.forEach(param => {
          if (!param.name || !param.in) {
            errors.push(`Endpoint ${method.toUpperCase()} ${path} has malformed parameter`)
          }
        })
      }
    })
  })

  return errors
}

/**
 * Validates response consistency across endpoints
 * @param {Object} paths - Path definitions from OpenAPI spec
 * @returns {Array} Validation errors
 */
function validateResponseConsistency(paths) {
  const errors = []
  const responsePatterns = new Map()

  Object.entries(paths).forEach(([path, pathItem]) => {
    Object.entries(pathItem).forEach(([method, operation]) => {
      if (operation.responses) {
        Object.entries(operation.responses).forEach(([code, response]) => {
          const key = `${method.toUpperCase()}_${code}`

          if (!responsePatterns.has(key)) {
            responsePatterns.set(key, {
              structure: JSON.stringify(response),
              endpoints: []
            })
          }

          const existing = responsePatterns.get(key)
          if (existing.structure !== JSON.stringify(response)) {
            existing.endpoints.push(`${method.toUpperCase()} ${path}`)
          }
        })
      }
    })
  })

  // Report inconsistent responses
  responsePatterns.forEach((pattern, key) => {
    if (pattern.endpoints.length > 1) {
      errors.push(
        `Inconsistent response pattern for ${key} found in: ${pattern.endpoints.join(', ')}`
      )
    }
  })

  return errors
}

/**
 * Validates OpenAPI specification file
 * @param {string} specPath - Path to OpenAPI spec file
 * @returns {Object} Validation results
 */
function validateOpenAPISpec(specPath) {
  const errors = []
  const warnings = []

  try {
    if (!existsSync(specPath)) {
      errors.push(`OpenAPI spec file not found: ${specPath}`)
      return { errors, warnings, isValid: false }
    }

    const spec = JSON.parse(readFileSync(specPath, 'utf8'))

    // Validate basic structure
    if (!spec.openapi) {
      errors.push('Missing openapi version field')
    }

    if (!spec.info) {
      errors.push('Missing info section')
    }

    if (!spec.paths) {
      errors.push('Missing paths section')
    }

    // Validate schemas
    if (spec.components && spec.components.schemas) {
      errors.push(...validateSchemas(spec.components.schemas))
    }

    // Validate endpoints
    if (spec.paths) {
      errors.push(...validateEndpoints(spec.paths))
      errors.push(...validateResponseConsistency(spec.paths))
    }

    // Check for common issues
    if (spec.paths) {
      Object.entries(spec.paths).forEach(([path, pathItem]) => {
        Object.entries(pathItem).forEach(([method, operation]) => {
          // Check for missing tags
          if (!operation.tags || operation.tags.length === 0) {
            warnings.push(`Endpoint ${method.toUpperCase()} ${path} missing tags`)
          }

          // Check for missing descriptions
          if (!operation.description) {
            warnings.push(`Endpoint ${method.toUpperCase()} ${path} missing description`)
          }
        })
      })
    }
  } catch (error) {
    errors.push(`Error parsing OpenAPI spec: ${error.message}`)
  }

  return {
    errors,
    warnings,
    isValid: errors.length === 0
  }
}

/**
 * Generates validation report
 * @param {Object} results - Validation results
 * @returns {string} Formatted report
 */
function generateValidationReport(results) {
  let report = '\n📊 Documentation Validation Report\n'
  report += '='.repeat(50) + '\n\n'

  if (results.errors.length > 0) {
    report += '❌ ERRORS:\n'
    results.errors.forEach((error, index) => {
      report += `  ${index + 1}. ${error}\n`
    })
    report += '\n'
  }

  if (results.warnings.length > 0) {
    report += '⚠️  WARNINGS:\n'
    results.warnings.forEach((warning, index) => {
      report += `  ${index + 1}. ${warning}\n`
    })
    report += '\n'
  }

  if (results.isValid) {
    report += '✅ Documentation is valid!\n'
  } else {
    report += '❌ Documentation has validation errors that need to be fixed.\n'
  }

  return report
}

/**
 * Main validation function
 */
function main() {
  console.log('🔍 Validating OpenAPI documentation...')

  const specPath = join(__dirname, 'openapi-spec.json')
  const results = validateOpenAPISpec(specPath)

  console.log(generateValidationReport(results))

  if (!results.isValid) {
    console.log('💡 To fix validation errors:')
    console.log('  1. Check schema definitions in schema-templates.js')
    console.log('  2. Review endpoint documentation in openapi-annotations.js')
    console.log('  3. Run documentation generator again')
    process.exit(1)
  }

  console.log('🎉 Documentation validation completed successfully!')
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { validateOpenAPISpec, generateValidationReport }
