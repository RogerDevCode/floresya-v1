/**
 * Error Handling Compliance Tests for P0.1.2
 * Testing for silent error handling and fallback operators
 */

import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

describe('Error Handling Compliance Tests - P0.1.2', () => {
  describe('Silent Error Handling Detection', () => {
    it('should not use fallback operators (||, ??) in critical operations', () => {
      const violations = []

      // Files that should NOT have fallback operators
      const criticalFiles = [
        'api/services/productService.js',
        'api/services/orderService.js',
        'api/services/userService.js',
        'api/services/authService.js',
        'api/controllers/productController.js',
        'api/controllers/orderController.js',
        'api/controllers/userController.js'
      ]

      for (const filePath of criticalFiles) {
        try {
          const content = readFileSync(filePath, 'utf8')
          const lines = content.split('\n')

          lines.forEach((line, index) => {
            const lineNumber = index + 1

            // Check for logical OR operator ||
            if (line.includes(' || ')) {
              // Allow some safe cases
              const safePatterns = [
                "req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined",
                '// Example',
                '// Mock',
                'true || false', // Boolean literals
                'console.log', // Logging
                'throw new', // Error throwing
                'return ' // Return statements
              ]

              const isSafe = safePatterns.some(pattern => line.includes(pattern))

              if (!isSafe) {
                violations.push({
                  file: filePath,
                  line: lineNumber,
                  reason: 'Uses || fallback operator',
                  code: line.trim()
                })
              }
            }

            // Check for nullish coalescing operator ??
            if (line.includes(' ?? ')) {
              violations.push({
                file: filePath,
                line: lineNumber,
                reason: 'Uses ?? nullish coalescing operator',
                code: line.trim()
              })
            }
          })
        } catch (_error) {
          // File might not exist
        }
      }

      if (violations.length > 0) {
        console.error('Fallback operator violations:', violations)
      }
      expect(violations).toHaveLength(0)
    })

    it('should ensure all try-catch blocks have proper error handling', () => {
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

              // Find all try blocks
              let inTryBlock = false
              let braceCount = 0

              lines.forEach((line, index) => {
                const lineNumber = index + 1
                const trimmedLine = line.trim()

                // Detect try block start
                if (trimmedLine.startsWith('try') && trimmedLine.includes('{')) {
                  inTryBlock = true
                  tryStartLine = lineNumber
                  braceCount =
                    (trimmedLine.match(/\{/g) || []).length -
                    (trimmedLine.match(/\}/g) || []).length
                } else if (trimmedLine === 'try {') {
                  inTryBlock = true
                  tryStartLine = lineNumber
                  braceCount = 1
                }

                // Track braces to find end of try block
                if (inTryBlock) {
                  const openBraces = (line.match(/\{/g) || []).length
                  const closeBraces = (line.match(/\}/g) || []).length
                  braceCount += openBraces - closeBraces

                  // Look for catch block when brace count returns to 0
                  if (braceCount <= 0 && trimmedLine.includes('catch')) {
                    inTryBlock = false

                    // Check catch block
                    const catchLine = trimmedLine
                    const hasCatchParam =
                      catchLine.includes('catch (') || catchLine.includes('catch(')

                    if (!hasCatchParam) {
                      violations.push({
                        file: itemPath,
                        line: lineNumber,
                        reason: 'Catch block without error parameter',
                        code: catchLine
                      })
                    }

                    // Check for console.error in the next few lines
                    const hasConsoleError = (() => {
                      // Look ahead in next 5 lines for error logging
                      for (let i = 1; i <= 5 && index + i < lines.length; i++) {
                        const nextLine = lines[index + i]

                        if (
                          nextLine.includes('console.error') ||
                          nextLine.includes('console.log')
                        ) {
                          return true
                        }
                      }
                      return false
                    })()

                    if (!hasConsoleError) {
                      violations.push({
                        file: itemPath,
                        line: lineNumber,
                        reason: 'Catch block missing console.error',
                        code: catchLine
                      })
                    }
                  }
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
        console.error('Error handling violations:', violations)
      }
    })

    it('should ensure fail-fast behavior in critical operations', () => {
      const servicesDir = 'api/services'
      const violations = []

      try {
        const serviceFiles = readdirSync(servicesDir)

        for (const file of serviceFiles) {
          if (file.endsWith('.js') && !file.endsWith('.test.js')) {
            const filePath = join(servicesDir, file)
            const content = readFileSync(filePath, 'utf8')
            const lines = content.split('\n')

            // Check for proper error throwing in validation functions
            lines.forEach((line, index) => {
              const lineNumber = index + 1
              const trimmedLine = line.trim()

              // Look for validation patterns that should throw errors
              if (
                trimmedLine.includes('if') &&
                (trimmedLine.includes('!') ||
                  trimmedLine.includes('undefined') ||
                  trimmedLine.includes('null'))
              ) {
                // Check next few lines for throw
                let hasThrow = false
                for (let i = 1; i <= 3 && index + i < lines.length; i++) {
                  const nextLine = lines[index + i].trim()
                  if (nextLine.includes('throw new')) {
                    hasThrow = true
                    break
                  }
                }

                // If it's a validation but doesn't throw, check if it returns early
                if (!hasThrow) {
                  let hasReturn = false
                  for (let i = 1; i <= 3 && index + i < lines.length; i++) {
                    const nextLine = lines[index + i].trim()
                    if (nextLine.startsWith('return')) {
                      hasReturn = true
                      break
                    }
                  }

                  // If neither throw nor return, might be silent failure
                  if (!hasReturn && !trimmedLine.includes('//')) {
                    // This might be a silent validation failure
                    // Only flag if it looks like validation
                    const validationPatterns = [
                      /if.*!.*required/,
                      /if.*undefined/,
                      /if.*null/,
                      /if.*\.length.*0/,
                      /if.*typeof.*!==/
                    ]

                    const isValidation = validationPatterns.some(pattern =>
                      pattern.test(trimmedLine)
                    )

                    if (isValidation) {
                      violations.push({
                        file: filePath,
                        line: lineNumber,
                        reason: 'Potential silent validation failure',
                        code: trimmedLine
                      })
                    }
                  }
                }
              }
            })

            // Check for empty catch blocks
            const catchBlockRegex = /catch\s*\([^)]*\)\s*\{\s*\}/g
            const matches = content.match(catchBlockRegex)

            if (matches) {
              violations.push({
                file: filePath,
                reason: 'Empty catch block found',
                count: matches.length
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
        console.error('Fail-fast violations:', violations)
      }
    })

    it('should ensure proper error propagation in controllers', () => {
      const controllersDir = 'api/controllers'
      const violations = []

      try {
        const controllerFiles = readdirSync(controllersDir)

        for (const file of controllerFiles) {
          if (file.endsWith('.js') && !file.endsWith('.test.js')) {
            const filePath = join(controllersDir, file)
            const content = readFileSync(filePath, 'utf8')

            // Check for asyncHandler usage (should be present)
            const hasAsyncHandler = /asyncHandler/.test(content)
            if (!hasAsyncHandler) {
              violations.push({
                file: filePath,
                reason: 'Controller missing asyncHandler wrapper'
              })
            }

            // Check for manual try-catch in controllers (should use asyncHandler instead)
            const manualTryCatch =
              /export\s+const\s+\w+\s*=\s*async\s*\([^)]*\)\s*=>\s*\{[\s\S]*?try\s*\{/.test(content)
            if (manualTryCatch) {
              violations.push({
                file: filePath,
                reason: 'Controller uses manual try-catch instead of asyncHandler'
              })
            }

            // Check for error re-throwing patterns (should not be needed in controllers)
            const hasErrorRethrow = /throw\s+error/.test(content)
            if (hasErrorRethrow) {
              violations.push({
                file: filePath,
                reason: 'Controller manually re-throws errors (use asyncHandler instead)'
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

  describe('Custom Error Class Usage', () => {
    it('should use custom error classes instead of generic Error', () => {
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

              lines.forEach((line, index) => {
                const lineNumber = index + 1
                const trimmedLine = line.trim()

                // Check for generic Error usage
                if (
                  trimmedLine.includes('new Error(') &&
                  !trimmedLine.includes('// Mock') &&
                  !trimmedLine.includes('// Example')
                ) {
                  // Allow some cases
                  const allowedPatterns = [
                    "new Error('No data returned",
                    'Internal Server Error',
                    'Service temporarily unavailable'
                  ]

                  const isAllowed = allowedPatterns.some(pattern => line.includes(pattern))

                  if (!isAllowed) {
                    violations.push({
                      file: itemPath,
                      line: lineNumber,
                      reason: 'Uses generic Error class instead of custom error',
                      code: trimmedLine
                    })
                  }
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
  })
})
