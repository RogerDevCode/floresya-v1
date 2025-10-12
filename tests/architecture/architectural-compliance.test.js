/**
 * Architectural Compliance Tests for P0.1.1
 * Testing for violations of MVC Strict and Service Layer exclusivity
 */

import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

describe('Architectural Compliance Tests - P0.1.1', () => {
  describe('Service Layer Exclusivity - Supabase Client Access', () => {
    it('should not import supabaseClient outside api/services/', () => {
      const apiDir = 'api'
      const forbiddenDirs = ['controllers', 'routes', 'middleware']
      const violations = []

      // Recursively check all JS files in forbidden directories
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

              // Check for supabaseClient imports
              if (
                content.includes("from './supabaseClient.js'") ||
                content.includes("from '../supabaseClient.js'") ||
                content.includes("from '../../supabaseClient.js'") ||
                content.includes('from "../services/supabaseClient.js"') ||
                content.includes('supabaseClient.js')
              ) {
                violations.push({
                  file: itemPath,
                  reason: 'Imports supabaseClient.js outside services layer'
                })
              }

              // Check for direct supabase imports
              if (
                content.includes('createClient') &&
                content.includes('@supabase/supabase-js') &&
                !content.includes('// Mock') &&
                !content.includes('vi.mock')
              ) {
                violations.push({
                  file: itemPath,
                  reason: 'Direct Supabase client creation outside services layer'
                })
              }
            }
          }
        } catch (_error) {
          // Directory might not exist, which is fine
          console.error('Directory check failed:', _error)
        }
      }

      // Check all forbidden directories
      for (const dir of forbiddenDirs) {
        checkDirectory(dir)
      }

      // Also check root api directory files
      try {
        const items = readdirSync(apiDir)
        for (const item of items) {
          const itemPath = join(apiDir, item)
          const stat = statSync(itemPath)

          if (stat.isFile() && item.endsWith('.js') && !item.endsWith('.test.js')) {
            const content = readFileSync(itemPath, 'utf8')

            if (
              content.includes('supabaseClient') &&
              !content.includes('// Mock') &&
              !content.includes('vi.mock')
            ) {
              violations.push({
                file: itemPath,
                reason: 'Uses supabaseClient in root API file'
              })
            }
          }
        }
      } catch (_error) {
        // Directory might not exist
        console.error('Root API directory check failed:', _error)
      }

      expect(violations).toHaveLength(0)
      if (violations.length > 0) {
        console.error('Architecture violations found:', violations)
      }
    })

    it('should ensure only services/ directory contains database operations', () => {
      const servicesDir = 'api/services'
      const nonServiceDirs = ['controllers', 'routes', 'middleware']
      const dbOperationPatterns = [
        /\.from\(/,
        /\.select\(/,
        /\.insert\(/,
        /\.update\(/,
        /\.delete\(/,
        /\.single\(/,
        /\.rpc\(/,
        /\.eq\(/,
        /\.or\(/,
        /\.order\(/,
        /\.limit\(/,
        /\.range\(/,
        /\.gte\(/,
        /\.lte\(/,
        /supabase\./
      ]
      const violations = []

      // Check that services do contain DB operations
      try {
        const serviceFiles = readdirSync(servicesDir)
        let serviceDbOpsFound = false

        for (const file of serviceFiles) {
          if (file.endsWith('.js') && !file.endsWith('.test.js')) {
            const filePath = join(servicesDir, file)
            const content = readFileSync(filePath, 'utf8')

            for (const pattern of dbOperationPatterns) {
              if (
                pattern.test(content) &&
                !content.includes('// Mock') &&
                !content.includes('vi.mock')
              ) {
                serviceDbOpsFound = true
                break
              }
            }
          }
        }

        if (!serviceDbOpsFound) {
          violations.push({
            reason: 'No database operations found in services layer'
          })
        }
      } catch (error) {
        console.error('Services directory check failed:', error)
        violations.push({
          reason: 'Services directory not accessible'
        })
      }

      // Check that non-services don't contain DB operations
      function checkDirectoryForDbOps(dir) {
        const fullPath = join('api', dir)

        try {
          const items = readdirSync(fullPath)

          for (const item of items) {
            const itemPath = join(fullPath, item)
            const stat = statSync(itemPath)

            if (stat.isDirectory() && !item.startsWith('.')) {
              checkDirectoryForDbOps(join(dir, item))
            } else if (item.endsWith('.js') && !item.endsWith('.test.js')) {
              const content = readFileSync(itemPath, 'utf8')

              for (const pattern of dbOperationPatterns) {
                if (
                  pattern.test(content) &&
                  !content.includes('// Mock') &&
                  !content.includes('vi.mock') &&
                  !content.includes('// Example')
                ) {
                  violations.push({
                    file: itemPath,
                    reason: `Database operation pattern ${pattern} found outside services layer`
                  })
                }
              }
            }
          }
        } catch (_error) {
          // Directory might not exist
          console.error('Directory DB operations check failed:', _error)
        }
      }

      for (const dir of nonServiceDirs) {
        checkDirectoryForDbOps(dir)
      }

      expect(violations).toHaveLength(0)
      if (violations.length > 0) {
        console.error('Database operation violations:', violations)
      }
    })

    it('should ensure controllers only call services and handle HTTP logic', () => {
      const controllersDir = 'api/controllers'
      const violations = []

      try {
        const controllerFiles = readdirSync(controllersDir)

        for (const file of controllerFiles) {
          if (file.endsWith('.js') && !file.includes('.test.')) {
            const filePath = join(controllersDir, file)
            const content = readFileSync(filePath, 'utf8')

            // Check for service imports (should be present)
            const hasServiceImport = /import \* as \w+Service from ['"]\.\.\/services\//.test(
              content
            )
            if (!hasServiceImport) {
              violations.push({
                file: filePath,
                reason: 'Controller does not import from services layer'
              })
            }

            // Check for direct database operations (should not be present)
            const directDbOps = [
              /\.from\(/,
              /\.select\(/,
              /\.insert\(/,
              /\.update\(/,
              /\.delete\(/,
              /\.rpc\(/,
              /supabase\./
            ]

            for (const pattern of directDbOps) {
              if (pattern.test(content) && !content.includes('// Mock')) {
                violations.push({
                  file: filePath,
                  reason: `Direct database operation ${pattern} in controller`
                })
              }
            }

            // Check for HTTP response patterns (should be present)
            const hasHttpResponse = /res\.(status|json|send)/.test(content)
            if (!hasHttpResponse) {
              violations.push({
                file: filePath,
                reason: 'Controller does not handle HTTP responses'
              })
            }

            // Check for request handling (should be present)
            const hasRequestHandling = /req\.(params|query|body|user)/.test(content)
            if (!hasRequestHandling) {
              violations.push({
                file: filePath,
                reason: 'Controller does not handle request data'
              })
            }
          }
        }
      } catch (error) {
        console.error('Controllers directory check failed:', error)
        violations.push({
          reason: 'Controllers directory not accessible'
        })
      }

      expect(violations).toHaveLength(0)
      if (violations.length > 0) {
        console.error('Controller violations:', violations)
      }
    })

    it('should ensure routes only define endpoints and middleware', () => {
      const routesDir = 'api/routes'
      const violations = []

      try {
        const routeFiles = readdirSync(routesDir)

        for (const file of routeFiles) {
          if (file.endsWith('.js') && !file.includes('.test.')) {
            const filePath = join(routesDir, file)
            const content = readFileSync(filePath, 'utf8')

            // Check for router patterns (should be present)
            const hasRouter = /express\.Router\(\)/.test(content) || /Router\(\)/.test(content)
            if (!hasRouter) {
              violations.push({
                file: filePath,
                reason: 'Route file does not define a router'
              })
            }

            // Check for HTTP method definitions (should be present)
            const hasHttpMethods = /\.(get|post|put|patch|delete)\(/.test(content)
            if (!hasHttpMethods) {
              violations.push({
                file: filePath,
                reason: 'Route file does not define HTTP methods'
              })
            }

            // Check for controller imports (should be present)
            const hasControllerImport = /import.*from ['"]\.\.\/controllers\//.test(content)
            if (!hasControllerImport) {
              violations.push({
                file: filePath,
                reason: 'Route file does not import controllers'
              })
            }

            // Check for business logic (should not be present)
            const businessLogicPatterns = [
              /\.from\(/,
              /\.select\(/,
              /\.insert\(/,
              /\.update\(/,
              /createClient\(/,
              /supabase\./
            ]

            for (const pattern of businessLogicPatterns) {
              if (pattern.test(content) && !content.includes('// Example')) {
                violations.push({
                  file: filePath,
                  reason: `Business logic pattern ${pattern} in route file`
                })
              }
            }
          }
        }
      } catch (_error) {
        console.error('Routes directory check failed:', _error)
        violations.push({
          reason: 'Routes directory not accessible'
        })
      }

      expect(violations).toHaveLength(0)
      if (violations.length > 0) {
        console.error('Route violations:', violations)
      }
    })
  })

  describe('MVC Strict Pattern Compliance', () => {
    it('should ensure proper separation of concerns across layers', () => {
      const apiDir = 'api'
      const layers = {
        controllers: {
          path: 'controllers',
          shouldHave: ['req\\.', 'res\\.', 'asyncHandler'],
          shouldNotHave: ['supabase\\.', '\\.from\\(', '\\.select\\(', 'createClient']
        },
        services: {
          path: 'services',
          shouldHave: ['supabase\\.', '\\.from\\(', '\\.select\\(', 'try\\s*{', 'catch\\s*\\('],
          shouldNotHave: ['req\\.', 'res\\.', 'status\\(', 'json\\(']
        },
        routes: {
          path: 'routes',
          shouldHave: ['Router\\(\\)', '\\.(get|post|put|patch|delete)\\(', 'middleware'],
          shouldNotHave: ['supabase\\.', '\\.from\\(', 'req\\.', 'res\\.']
        }
      }

      const violations = []

      for (const [layerName, config] of Object.entries(layers)) {
        const layerPath = join(apiDir, config.path)

        try {
          const files = readdirSync(layerPath)

          for (const file of files) {
            if (file.endsWith('.js') && !file.endsWith('.test.js')) {
              const filePath = join(layerPath, file)
              const content = readFileSync(filePath, 'utf8')

              // Check for required patterns
              for (const pattern of config.shouldHave) {
                const regex = new RegExp(pattern)
                if (!regex.test(content) && !content.includes('// Mock')) {
                  violations.push({
                    layer: layerName,
                    file: filePath,
                    reason: `Missing required pattern: ${pattern}`
                  })
                }
              }

              // Check for forbidden patterns
              for (const pattern of config.shouldNotHave) {
                const regex = new RegExp(pattern)
                if (
                  regex.test(content) &&
                  !content.includes('// Mock') &&
                  !content.includes('// Example')
                ) {
                  violations.push({
                    layer: layerName,
                    file: filePath,
                    reason: `Contains forbidden pattern: ${pattern}`
                  })
                }
              }
            }
          }
        } catch (error) {
          console.error(`Layer ${layerName} directory check failed:`, error)
          violations.push({
            layer: layerName,
            reason: `Layer directory not accessible: ${error.message}`
          })
        }
      }

      expect(violations).toHaveLength(0)
      if (violations.length > 0) {
        console.error('MVC separation violations:', violations)
      }
    })
  })
})
