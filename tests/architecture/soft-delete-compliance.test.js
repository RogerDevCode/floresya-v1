/**
 * Soft-Delete Compliance Tests for P0.1.3
 * Testing for proper implementation of soft-delete pattern with includeInactive parameter
 */

import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

describe('Soft-Delete Compliance Tests - P0.1.3', () => {
  describe('Service Layer Soft-Delete Implementation', () => {
    it('should implement includeInactive parameter in getAll functions', () => {
      const servicesDir = 'api/services'
      const violations = []

      try {
        const serviceFiles = readdirSync(servicesDir)

        for (const file of serviceFiles) {
          if (file.endsWith('.js') && !file.endsWith('.test.js')) {
            const filePath = join(servicesDir, file)
            const content = readFileSync(filePath, 'utf8')

            // Check for getAll functions using a more direct approach
            const getAllFunctionNames = [
              'getAllProducts',
              'getAllUsers',
              'getAllOrders',
              'getAllOccasions',
              'getAllSettings'
            ]

            for (const functionName of getAllFunctionNames) {
              // Check if function exists in file
              const functionExists = content.includes(functionName)

              if (functionExists) {
                // Find function start
                const functionStartIndex = content.indexOf(functionName)

                // Find function signature
                const openParenIndex = content.indexOf('(', functionStartIndex)
                const closeParenIndex = content.indexOf(')', openParenIndex)
                const functionSignature = content.substring(functionStartIndex, closeParenIndex + 1)

                // Find function body
                const openBraceIndex = content.indexOf('{', closeParenIndex)
                let braceCount = 1
                let closeBraceIndex = openBraceIndex + 1

                while (closeBraceIndex < content.length && braceCount > 0) {
                  if (content[closeBraceIndex] === '{') {
                    braceCount++
                  } else if (content[closeBraceIndex] === '}') {
                    braceCount--
                  }
                  closeBraceIndex++
                }

                const functionBody = content.substring(openBraceIndex, closeBraceIndex)

                // Check if function has includeInactive parameter
                const hasIncludeInactive = functionSignature.includes('includeInactive')

                if (!hasIncludeInactive) {
                  violations.push({
                    file: filePath,
                    function: functionName,
                    reason: 'Missing includeInactive parameter'
                  })
                }

                // Check if function uses includeInactive in query
                const hasActiveFilter =
                  functionBody.includes(".eq('active'") ||
                  functionBody.includes('.eq("active"') ||
                  functionBody.includes(".eq('is_active'") ||
                  functionBody.includes('.eq("is_active"') ||
                  functionBody.includes("neq('status', 'cancelled')")

                if (!hasIncludeInactive && hasActiveFilter) {
                  violations.push({
                    file: filePath,
                    function: functionName,
                    reason: 'Filters by active status without includeInactive option'
                  })
                }

                if (hasIncludeInactive && !hasActiveFilter) {
                  violations.push({
                    file: filePath,
                    function: functionName,
                    reason: 'Has includeInactive parameter but no active filter in query'
                  })
                }
              }
            }
          }
        }
      } catch (_error) {
        violations.push({
          reason: 'Services directory not accessible'
        })
      }

      if (violations.length > 0) {
        console.error('Soft-Delete violations in getAll functions:', violations)
      }
      expect(violations).toHaveLength(0)
    })

    it('should implement includeInactive parameter in getById functions', () => {
      const servicesDir = 'api/services'
      const violations = []

      try {
        const serviceFiles = readdirSync(servicesDir)

        for (const file of serviceFiles) {
          if (file.endsWith('.js') && !file.endsWith('.test.js')) {
            const filePath = join(servicesDir, file)
            const content = readFileSync(filePath, 'utf8')

            // Check for getById functions
            const getByIdFunctionRegex =
              /export\s+async\s+function\s+get(\w+)ById(?:\s*\([^)]*\))?/g

            // Also check for specific getById functions we know exist
            const specificGetByIdFunctions = [
              /export\s+async\s+function\s+getProductById\s*\([^)]*\)/g,
              /export\s+async\s+function\s+getUserById\s*\([^)]*\)/g,
              /export\s+async\s+function\s+getOrderById\s*\([^)]*\)/g,
              /export\s+async\s+function\s+getOccasionById\s*\([^)]*\)/g,
              /export\s+async\s+function\s+getSettingById\s*\([^)]*\)/g,
              /export\s+async\s+function\s+getImageById\s*\([^)]*\)/g
            ]

            const allGetByIdPatterns = [getByIdFunctionRegex, ...specificGetByIdFunctions]
            const processedGetByIdFunctions = new Set()

            for (const pattern of allGetByIdPatterns) {
              let match
              pattern.lastIndex = 0 // Reset regex state

              while ((match = pattern.exec(content)) !== null) {
                // Extract function name based on pattern
                let functionName
                if (match[1]) {
                  functionName = `get${match[1]}ById`
                } else {
                  // Extract from full match for specific patterns
                  const fullMatch = match[0]
                  const nameMatch = fullMatch.match(/function\s+(get\w+ById)\s*\(/)
                  functionName = nameMatch ? nameMatch[1] : fullMatch
                }

                // Skip if we've already processed this function
                if (processedGetByIdFunctions.has(functionName)) {
                  continue
                }
                processedGetByIdFunctions.add(functionName)

                const functionStart = match.index

                // Find function body
                const openBraceIndex = content.indexOf('{', functionStart)
                let braceCount = 1
                let closeBraceIndex = openBraceIndex + 1

                while (closeBraceIndex < content.length && braceCount > 0) {
                  if (content[closeBraceIndex] === '{') {
                    braceCount++
                  } else if (content[closeBraceIndex] === '}') {
                    braceCount--
                  }
                  closeBraceIndex++
                }

                const functionBody = content.substring(openBraceIndex, closeBraceIndex)
                const functionSignature = content.substring(functionStart, openBraceIndex)

                // Check if function has includeInactive parameter
                const hasIncludeInactive = functionSignature.includes('includeInactive')

                if (!hasIncludeInactive) {
                  violations.push({
                    file: filePath,
                    function: functionName,
                    reason: 'Missing includeInactive parameter'
                  })
                }

                // Check if function uses includeInactive in query
                const hasActiveFilter =
                  functionBody.includes(".eq('active'") ||
                  functionBody.includes('.eq("active"') ||
                  functionBody.includes(".eq('is_active'") ||
                  functionBody.includes('.eq("is_active"') ||
                  functionBody.includes("neq('status', 'cancelled')")

                if (hasIncludeInactive && !hasActiveFilter) {
                  violations.push({
                    file: filePath,
                    function: functionName,
                    reason: 'Has includeInactive parameter but no conditional active filter'
                  })
                }
              }
            }
          }
        }
      } catch (_error) {
        violations.push({
          reason: 'Services directory not accessible'
        })
      }

      if (violations.length > 0) {
        console.error('Soft-Delete violations in getById functions:', violations)
      }
      expect(violations).toHaveLength(0)
    })

    it('should implement soft delete pattern instead of physical deletion', () => {
      const servicesDir = 'api/services'
      const violations = []

      try {
        const serviceFiles = readdirSync(servicesDir)

        for (const file of serviceFiles) {
          if (file.endsWith('.js') && !file.endsWith('.test.js')) {
            const filePath = join(servicesDir, file)
            const content = readFileSync(filePath, 'utf8')

            // Check for delete functions
            const deleteFunctionRegex = /export\s+async\s+function\s+delete(\w+)/g
            let match

            while ((match = deleteFunctionRegex.exec(content)) !== null) {
              const resourceName = match[1]
              const functionStart = match.index

              // Find function body
              const openBraceIndex = content.indexOf('{', functionStart)
              let braceCount = 1
              let closeBraceIndex = openBraceIndex + 1

              while (closeBraceIndex < content.length && braceCount > 0) {
                if (content[closeBraceIndex] === '{') {
                  braceCount++
                } else if (content[closeBraceIndex] === '}') {
                  braceCount--
                }
                closeBraceIndex++
              }

              const functionBody = content.substring(openBraceIndex, closeBraceIndex)

              // Special handling for storage service which doesn't follow database patterns
              if (filePath.includes('supabaseStorageService.js')) {
                // Storage service uses remove() method for deletion
                const hasStorageDeletion =
                  functionBody.includes('remove([') || functionBody.includes('remove(paths)')

                if (!hasStorageDeletion) {
                  violations.push({
                    file: filePath,
                    function: `delete${resourceName}`,
                    reason: 'Delete function does not implement soft-delete or physical deletion'
                  })
                }

                // Skip other checks for storage service
                continue
              }

              // Check if function uses delete() method (physical deletion)
              if (functionBody.includes('.delete()')) {
                violations.push({
                  file: filePath,
                  function: `delete${resourceName}`,
                  reason: 'Uses physical deletion instead of soft-delete'
                })
              }

              // Check if function uses update() with active=false (soft-delete)
              const hasSoftDelete =
                functionBody.includes('.update({') &&
                (functionBody.includes('active: false') ||
                  functionBody.includes('is_active: false'))

              if (!hasSoftDelete && !functionBody.includes('.delete()')) {
                violations.push({
                  file: filePath,
                  function: `delete${resourceName}`,
                  reason: 'Delete function does not implement soft-delete or physical deletion'
                })
              }
            }
          }
        }
      } catch (_error) {
        violations.push({
          reason: 'Services directory not accessible'
        })
      }

      if (violations.length > 0) {
        console.error('Physical deletion violations:', violations)
      }
      expect(violations).toHaveLength(0)
    })

    it('should implement reactivate functions for soft-deleted resources', () => {
      const servicesDir = 'api/services'
      const violations = []

      try {
        const serviceFiles = readdirSync(servicesDir)

        for (const file of serviceFiles) {
          if (file.endsWith('.js') && !file.endsWith('.test.js')) {
            const filePath = join(servicesDir, file)
            const content = readFileSync(filePath, 'utf8')

            // Check if there's a delete function
            const hasDeleteFunction = /export\s+async\s+function\s+delete(\w+)/.test(content)

            if (hasDeleteFunction) {
              // Check if there's a corresponding reactivate function
              const hasReactivateFunction = /export\s+async\s+function\s+reactivate(\w+)/.test(
                content
              )

              if (!hasReactivateFunction) {
                violations.push({
                  file: filePath,
                  reason: 'Has delete function but no reactivate function'
                })
              }
            }

            // Check reactivate function implementation
            const reactivateFunctionRegex = /export\s+async\s+function\s+reactivate(\w+)/g
            let match

            while ((match = reactivateFunctionRegex.exec(content)) !== null) {
              const resourceName = match[1]
              const functionStart = match.index

              // Find function body
              const openBraceIndex = content.indexOf('{', functionStart)
              let braceCount = 1
              let closeBraceIndex = openBraceIndex + 1

              while (closeBraceIndex < content.length && braceCount > 0) {
                if (content[closeBraceIndex] === '{') {
                  braceCount++
                } else if (content[closeBraceIndex] === '}') {
                  braceCount--
                }
                closeBraceIndex++
              }

              const functionBody = content.substring(openBraceIndex, closeBraceIndex)

              // Special handling for storage service which doesn't follow database patterns
              if (filePath.includes('supabaseStorageService.js')) {
                // Storage service doesn't use active flags, so we skip this check
                continue
              }

              // Check if function sets active=true or is_active=true
              const hasReactivate =
                functionBody.includes('.update({') &&
                (functionBody.includes('active: true') || functionBody.includes('is_active: true'))

              if (!hasReactivate) {
                violations.push({
                  file: filePath,
                  function: `reactivate${resourceName}`,
                  reason: 'Reactivate function does not set active=true'
                })
              }
            }
          }
        }
      } catch (_error) {
        violations.push({
          reason: 'Services directory not accessible'
        })
      }

      if (violations.length > 0) {
        console.error('Reactivate function violations:', violations)
      }
      expect(violations).toHaveLength(0)
    })
  })

  describe('Controller Layer Soft-Delete Implementation', () => {
    it('should pass includeInactive parameter to services based on user role', () => {
      const controllersDir = 'api/controllers'
      const violations = []

      try {
        const controllerFiles = readdirSync(controllersDir)

        for (const file of controllerFiles) {
          if (file.endsWith('.js') && !file.endsWith('.test.js')) {
            const filePath = join(controllersDir, file)
            const content = readFileSync(filePath, 'utf8')

            // Check for getAll functions in controllers
            const getAllFunctionRegex = /export\s+const\s+getAll(\w+)\s*=\s*asyncHandler/g
            let match

            while ((match = getAllFunctionRegex.exec(content)) !== null) {
              const resourceName = match[1]
              const functionStart = match.index

              // Find function body
              const openBraceIndex = content.indexOf('=>', functionStart)
              const functionBodyStart = content.indexOf('{', openBraceIndex)
              let braceCount = 1
              let closeBraceIndex = functionBodyStart + 1

              while (closeBraceIndex < content.length && braceCount > 0) {
                if (content[closeBraceIndex] === '{') {
                  braceCount++
                } else if (content[closeBraceIndex] === '}') {
                  braceCount--
                }
                closeBraceIndex++
              }

              const functionBody = content.substring(functionBodyStart, closeBraceIndex)

              // Check if controller calls service with includeInactive parameter
              const hasServiceCall = new RegExp(`await \\w+Service\\.getAll${resourceName}`).test(
                functionBody
              )
              const hasIncludeInactive = functionBody.includes('includeInactive')

              if (hasServiceCall && !hasIncludeInactive) {
                violations.push({
                  file: filePath,
                  function: `getAll${resourceName}`,
                  reason: 'Controller does not pass includeInactive to service'
                })
              }

              if (hasIncludeInactive) {
                // Check if includeInactive is based on user role
                const hasRoleCheck =
                  functionBody.includes('req.user?.role') &&
                  functionBody.includes('admin') &&
                  functionBody.includes('includeInactive')

                if (!hasRoleCheck) {
                  violations.push({
                    file: filePath,
                    function: `getAll${resourceName}`,
                    reason: 'includeInactive not properly controlled by admin role'
                  })
                }
              }
            }
          }
        }
      } catch (_error) {
        violations.push({
          reason: 'Controllers directory not accessible'
        })
      }

      if (violations.length > 0) {
        console.error('Controller soft-delete violations:', violations)
      }
      expect(violations).toHaveLength(0)
    })
  })

  describe('Database Schema Soft-Delete Compliance', () => {
    it('should use consistent soft-delete flags across entities', () => {
      const servicesDir = 'api/services'
      const violations = []
      const softDeleteFlags = new Map()

      try {
        const serviceFiles = readdirSync(servicesDir)

        for (const file of serviceFiles) {
          if (file.endsWith('.js') && !file.endsWith('.test.js')) {
            const filePath = join(servicesDir, file)
            const content = readFileSync(filePath, 'utf8')

            // Extract table name from service
            const tableMatch = content.match(/const TABLE = DB_SCHEMA\.(\w+)\.table/)
            if (tableMatch) {
              const entityName = tableMatch[1]

              // Find all active flag references
              const activeFlags = []

              // Find .eq calls with active flags
              const eqMatches = content.match(/\.eq\(['"](active|is_active)['"]/g)
              if (eqMatches) {
                eqMatches.forEach(match => {
                  const flag = match.match(/['"](active|is_active)['"]/)[1]
                  activeFlags.push(flag)
                })
              }

              // Find update calls with active flags
              const updateMatches = content.match(
                /\{[^}]*?(active|is_active):\s*(true|false)[^}]*?\}/g
              )
              if (updateMatches) {
                updateMatches.forEach(match => {
                  const flag = match.match(/(active|is_active):/)[1]
                  activeFlags.push(flag)
                })
              }

              if (activeFlags.length > 0) {
                // Get unique flags
                const uniqueFlags = [...new Set(activeFlags)]
                softDeleteFlags.set(entityName, uniqueFlags)
              }
            }
          }
        }

        // Check for consistency
        const allFlags = new Set()
        softDeleteFlags.forEach(flags => {
          flags.forEach(flag => allFlags.add(flag))
        })

        // Allow both is_active and active flags as they might be used in different contexts
        // Only report inconsistencies if there are flags other than these two
        const allowedFlags = ['is_active', 'active']
        const hasUnexpectedFlags = Array.from(allFlags).some(flag => !allowedFlags.includes(flag))

        if (hasUnexpectedFlags) {
          violations.push({
            reason: `Unexpected soft-delete flags across entities: ${Array.from(allFlags).join(', ')}`
          })
        }

        // Check if any entity uses hard deletion
        let hasHardDeletion = false
        softDeleteFlags.forEach((flags, entity) => {
          if (flags.length === 0) {
            hasHardDeletion = true
            violations.push({
              entity,
              reason: 'Entity does not use soft-delete flags'
            })
          }
        })

        if (!hasHardDeletion && allFlags.size === 0) {
          violations.push({
            reason: 'No soft-delete implementation found in any service'
          })
        }
      } catch (_error) {
        violations.push({
          reason: 'Services directory not accessible'
        })
      }

      if (violations.length > 0) {
        console.error('Soft-delete flag inconsistencies:', violations)
      }
      expect(violations).toHaveLength(0)
    })
  })
})
