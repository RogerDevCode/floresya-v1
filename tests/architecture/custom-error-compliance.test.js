/**
 * Custom Error Compliance Tests for P0.1.4
 * Testing for proper usage of custom error classes instead of generic Error
 */

import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

describe('Custom Error Compliance Tests - P0.1.4', () => {
  describe('Custom Error Class Usage', () => {
    it('should import and use custom error classes from AppError.js', () => {
      const apiDir = 'api'
      const violations = []

      function checkDirectory(dir) {
        const fullPath = join(apiDir, dir)

        try {
          const items = readdirSync(fullPath)

          for (const item of items) {
            const itemPath = join(fullPath, item)
            const stat = statSync(itemPath)

            if (stat.isDirectory() && !item.startsWith('.')) {
              checkDirectory(join(dir, item))
            } else if (item.endsWith('.js') && !item.endsWith('.test.js')) {
              const content = readFileSync(itemPath, 'utf8')
              const lines = content.split('\n')

              // Check for AppError import
              const hasAppErrorImport = /import.*from.*AppError\.js/.test(content)

              // Check for generic Error usage
              lines.forEach((line, index) => {
                const lineNumber = index + 1
                const trimmedLine = line.trim()

                // Check for generic Error usage
                if (
                  trimmedLine.includes('new Error(') &&
                  !trimmedLine.includes('// Mock') &&
                  !trimmedLine.includes('// Example')
                ) {
                  // Allow some specific cases
                  const allowedPatterns = [
                    'No data returned',
                    'Internal Server Error',
                    'Service temporarily unavailable',
                    'Authentication required',
                    'Invalid token'
                  ]

                  const isAllowed = allowedPatterns.some(pattern => line.includes(pattern))

                  if (!isAllowed) {
                    violations.push({
                      file: itemPath,
                      line: lineNumber,
                      reason: 'Uses generic Error class instead of custom error',
                      code: trimmedLine,
                      hasAppErrorImport
                    })
                  }
                }
              })

              // Check for throw statements without custom errors
              lines.forEach((line, index) => {
                const lineNumber = index + 1
                const trimmedLine = line.trim()

                // Check for throw with generic Error
                if (
                  trimmedLine.startsWith('throw ') &&
                  trimmedLine.includes('new Error(') &&
                  !trimmedLine.includes('// Mock') &&
                  !trimmedLine.includes('// Example')
                ) {
                  violations.push({
                    file: itemPath,
                    line: lineNumber,
                    reason: 'Throws generic Error instead of custom error',
                    code: trimmedLine
                  })
                }
              })
            }
          }
        } catch (_error) {
          // Directory might not exist
        }
      }

      // Check all subdirectories
      try {
        const items = readdirSync(apiDir)
        for (const item of items) {
          const itemPath = join(apiDir, item)
          const stat = statSync(itemPath)

          if (stat.isDirectory() && !item.startsWith('.')) {
            checkDirectory(item)
          }
        }
      } catch (_error) {
        // API directory might not exist
      }

      expect(violations).toHaveLength(0)
      if (violations.length > 0) {
        console.error('Generic Error violations:', violations)
      }
    })

    it('should use appropriate custom error classes for different error types', () => {
      const servicesDir = 'api/services'
      const violations = []

      try {
        const serviceFiles = readdirSync(servicesDir)

        for (const file of serviceFiles) {
          if (file.endsWith('.js') && !file.endsWith('.test.js')) {
            const filePath = join(servicesDir, file)
            const content = readFileSync(filePath, 'utf8')

            // Check for AppError import
            const hasAppErrorImport = /import.*from.*AppError\.js/.test(content)

            if (hasAppErrorImport) {
              // Check for specific error patterns
              const errorPatterns = [
                {
                  pattern: /throw new BadRequestError\(/,
                  context: 'Invalid input or parameters',
                  shouldUse: 'BadRequestError'
                },
                {
                  pattern: /throw new NotFoundError\(/,
                  context: 'Resource not found',
                  shouldUse: 'NotFoundError'
                },
                {
                  pattern: /throw new DatabaseError\(/,
                  context: 'Database operation failure',
                  shouldUse: 'DatabaseError'
                },
                {
                  pattern: /throw new ValidationError\(/,
                  context: 'Input validation failure',
                  shouldUse: 'ValidationError'
                },
                {
                  pattern: /throw new DatabaseConstraintError\(/,
                  context: 'Database constraint violation',
                  shouldUse: 'DatabaseConstraintError'
                },
                {
                  pattern: /throw new InsufficientStockError\(/,
                  context: 'Insufficient product stock',
                  shouldUse: 'InsufficientStockError'
                },
                {
                  pattern: /throw new UnauthorizedError\(/,
                  context: 'Authentication required',
                  shouldUse: 'UnauthorizedError'
                },
                {
                  pattern: /throw new ForbiddenError\(/,
                  context: 'Access denied',
                  shouldUse: 'ForbiddenError'
                }
              ]

              // Check for appropriate error usage
              errorPatterns.forEach(({ pattern, context, shouldUse }) => {
                if (pattern.test(content)) {
                  // This is good - using appropriate custom error
                } else {
                  // Check if there's a situation where this error should be used
                  switch (shouldUse) {
                    case 'BadRequestError':
                      if (content.includes('Invalid') && content.includes('throw new')) {
                        violations.push({
                          file: filePath,
                          reason: `Should use BadRequestError for ${context}`,
                          context
                        })
                      }
                      break
                    case 'NotFoundError':
                      if (content.includes('not found') && content.includes('throw new')) {
                        violations.push({
                          file: filePath,
                          reason: `Should use NotFoundError for ${context}`,
                          context
                        })
                      }
                      break
                    case 'DatabaseError':
                      if (content.includes('database') && content.includes('throw new')) {
                        violations.push({
                          file: filePath,
                          reason: `Should use DatabaseError for ${context}`,
                          context
                        })
                      }
                      break
                    case 'ValidationError':
                      if (content.includes('validation') && content.includes('throw new')) {
                        violations.push({
                          file: filePath,
                          reason: `Should use ValidationError for ${context}`,
                          context
                        })
                      }
                      break
                  }
                }
              })
            } else {
              violations.push({
                file: filePath,
                reason: 'Service does not import custom error classes'
              })
            }
          }
        }
      } catch (_error) {
        violations.push({
          reason: 'Services directory not accessible'
        })
      }

      expect(violations).toHaveLength(0)
      if (violations.length > 0) {
        console.error('Inappropriate custom error usage:', violations)
      }
    })

    it('should ensure custom errors have proper metadata', () => {
      const errorsFile = 'api/errors/AppError.js'
      const violations = []

      try {
        const content = readFileSync(errorsFile, 'utf8')

        // Check for base AppError class
        const hasAppErrorClass = /class AppError extends Error/.test(content)
        if (!hasAppErrorClass) {
          violations.push({
            reason: 'Missing base AppError class'
          })
        }

        // Check for proper error metadata in AppError constructor
        const hasMetadata =
          /this\.(statusCode|code|isOperational|context|userMessage|timestamp|severity)/.test(
            content
          )
        if (!hasMetadata) {
          violations.push({
            reason: 'AppError constructor missing proper metadata'
          })
        }

        // Check for specific error classes
        const requiredErrorClasses = [
          'BadRequestError',
          'UnauthorizedError',
          'ForbiddenError',
          'NotFoundError',
          'ValidationError',
          'DatabaseError',
          'DatabaseConstraintError',
          'InsufficientStockError'
        ]

        requiredErrorClasses.forEach(errorClass => {
          const hasErrorClass = new RegExp(`class ${errorClass} extends`).test(content)
          if (!hasErrorClass) {
            violations.push({
              reason: `Missing required error class: ${errorClass}`
            })
          }
        })

        // Check for proper export of all error classes
        const hasExportAll = /export\s*\{[\s\S]*AppError[\s\S]*\}/.test(content)
        if (!hasExportAll) {
          violations.push({
            reason: 'Missing export of all error classes'
          })
        }
      } catch (_error) {
        violations.push({
          reason: 'AppError.js file not accessible'
        })
      }

      expect(violations).toHaveLength(0)
      if (violations.length > 0) {
        console.error('Custom error metadata violations:', violations)
      }
    })

    it('should ensure error handling in controllers uses custom errors', () => {
      const controllersDir = 'api/controllers'
      const violations = []

      try {
        const controllerFiles = readdirSync(controllersDir)

        for (const file of controllerFiles) {
          if (file.endsWith('.js') && !file.endsWith('.test.js')) {
            const filePath = join(controllersDir, file)
            const content = readFileSync(filePath, 'utf8')

            // Controllers should not create errors directly
            const hasErrorCreation = /new (Error|BadRequestError|NotFoundError)/.test(content)
            if (hasErrorCreation) {
              violations.push({
                file: filePath,
                reason: 'Controller creates errors instead of letting services throw them'
              })
            }

            // Controllers should use asyncHandler which handles errors
            const hasAsyncHandler = /asyncHandler/.test(content)
            if (!hasAsyncHandler) {
              violations.push({
                file: filePath,
                reason: 'Controller missing asyncHandler wrapper'
              })
            }
          }
        }
      } catch (_error) {
        violations.push({
          reason: 'Controllers directory not accessible'
        })
      }

      expect(violations).toHaveLength(0)
      if (violations.length > 0) {
        console.error('Controller error handling violations:', violations)
      }
    })
  })

  describe('Error Response Format Compliance', () => {
    it('should ensure custom errors have proper toJSON method', () => {
      const errorsFile = 'api/errors/AppError.js'
      const violations = []

      try {
        const content = readFileSync(errorsFile, 'utf8')

        // Check for toJSON method in AppError
        const hasToJSON = /toJSON\(includeStack = false\)/.test(content)
        if (!hasToJSON) {
          violations.push({
            reason: 'AppError class missing toJSON method'
          })
        }

        // Check for proper response format in toJSON
        const hasResponseFormat =
          /success:\s*false/.test(content) && /error:/.test(content) && /message:/.test(content)

        if (!hasResponseFormat) {
          violations.push({
            reason: 'AppError toJSON does not return proper response format'
          })
        }

        // Check for ValidationError override
        const hasValidationErrorOverride = /class ValidationError.*toJSON/.test(content)
        if (!hasValidationErrorOverride) {
          violations.push({
            reason: 'ValidationError class missing toJSON override'
          })
        }
      } catch (_error) {
        violations.push({
          reason: 'AppError.js file not accessible'
        })
      }

      expect(violations).toHaveLength(0)
      if (violations.length > 0) {
        console.error('Error response format violations:', violations)
      }
    })
  })
})
