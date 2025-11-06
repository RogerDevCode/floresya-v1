/**
 * Documentation Synchronization System
 * Ensures API documentation is always in sync with implementation
 * Automatically detects and reports discrepancies between code and docs
 *
 * Uses centralized configuration from configLoader
 */

import fs from 'fs/promises'
import path from 'path'
import yaml from 'js-yaml'
import config from '../config/configLoader.js'
import { ConfigurationError } from '../errors/AppError.js'

/**
 * Documentation Synchronizer class
 */
export class DocumentationSynchronizer {
  constructor() {
    this.specPath = path.join(process.cwd(), 'api', 'docs', 'openapi-spec.yaml')
    this.annotationsPath = path.join(process.cwd(), 'api', 'docs', 'openapi-annotations.js')
    this.routesDir = path.join(process.cwd(), 'api', 'routes')
    this.spec = null
  }

  /**
   * Load OpenAPI specification
   */
  async loadSpec() {
    if (!this.spec) {
      const specContent = await fs.readFile(this.specPath, 'utf8')
      this.spec = yaml.load(specContent)
    }
    return this.spec
  }

  /**
   * Read all route files to extract defined endpoints
   */
  async getDefinedEndpoints() {
    const endpoints = []
    const routeFiles = await fs.readdir(this.routesDir)

    for (const file of routeFiles) {
      if (file.endsWith('.js')) {
        const routePath = path.join(this.routesDir, file)
        const routeContent = await fs.readFile(routePath, 'utf8')

        // Extract all route definitions
        const routeMatches = routeContent.matchAll(
          /(app|router)\.(get|post|put|patch|delete|head|options)\s*\(\s*['"`]([^'"`]+)['"`]/g
        )
        for (const match of routeMatches) {
          const method = match[2].toUpperCase()
          const routePath = match[3]

          // Skip non-API routes (like static files, health checks)
          if (routePath.startsWith('/api/')) {
            endpoints.push({
              method,
              path: routePath,
              file: file
            })
          }
        }
      }
    }

    return endpoints
  }

  /**
   * Get documented endpoints from OpenAPI spec
   */
  getDocumentedEndpoints() {
    if (!this.spec) {
      throw new ConfigurationError('Spec not loaded')
    }

    const endpoints = []
    for (const [path, pathItem] of Object.entries(this.spec.paths || {})) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (method !== 'parameters') {
          // Skip the parameters property that's sometimes added
          endpoints.push({
            method: method.toUpperCase(),
            path: path,
            operation
          })
        }
      }
    }

    return endpoints
  }

  /**
   * Compare defined endpoints with documented endpoints
   */
  async findEndpointDiscrepancies() {
    await this.loadSpec()

    const definedEndpoints = await this.getDefinedEndpoints()
    const documentedEndpoints = this.getDocumentedEndpoints()

    const missingInSpec = []
    const missingInCode = []

    // Find endpoints in code but not in spec
    for (const endpoint of definedEndpoints) {
      const found = documentedEndpoints.some(
        docEndpoint => docEndpoint.path === endpoint.path && docEndpoint.method === endpoint.method
      )

      if (!found) {
        missingInSpec.push(endpoint)
      }
    }

    // Find endpoints in spec but not in code
    for (const endpoint of documentedEndpoints) {
      const found = definedEndpoints.some(
        defEndpoint => defEndpoint.path === endpoint.path && defEndpoint.method === endpoint.method
      )

      if (!found) {
        missingInCode.push({
          method: endpoint.method,
          path: endpoint.path,
          operation: endpoint.operation
        })
      }
    }

    return {
      missingInSpec,
      missingInCode
    }
  }

  /**
   * Compare parameters between code and spec
   */
  async findParameterDiscrepancies() {
    await this.loadSpec()

    // This would involve parsing JSDoc annotations in controllers
    // For now, we'll return an empty array, but in a real implementation,
    // we'd parse the controller files to extract parameter information
    return []
  }

  /**
   * Compare request/response schemas between code and spec
   */
  async findSchemaDiscrepancies() {
    await this.loadSpec()

    // This would involve extracting validation schemas from middleware
    // For now, we'll return an empty array, but in a real implementation,
    // we'd parse the validation schemas to compare with OpenAPI schemas
    return []
  }

  /**
   * Generate a report of all discrepancies
   */
  async generateSynchronizationReport() {
    const endpointDiscrepancies = await this.findEndpointDiscrepancies()
    const parameterDiscrepancies = await this.findParameterDiscrepancies()
    const schemaDiscrepancies = await this.findSchemaDiscrepancies()

    return {
      timestamp: new Date().toISOString(),
      endpointDiscrepancies,
      parameterDiscrepancies,
      schemaDiscrepancies,
      totalDiscrepancies:
        endpointDiscrepancies.missingInSpec.length +
        endpointDiscrepancies.missingInCode.length +
        parameterDiscrepancies.length +
        schemaDiscrepancies.length
    }
  }

  /**
   * Generate JSDoc annotations for missing endpoints in documentation
   */
  async generateMissingAnnotations() {
    await this.loadSpec()

    const definedEndpoints = await this.getDefinedEndpoints()
    const documentedEndpoints = this.getDocumentedEndpoints()

    let annotations = ''

    // For each defined endpoint that's missing in the spec
    for (const endpoint of definedEndpoints) {
      const found = documentedEndpoints.some(
        docEndpoint => docEndpoint.path === endpoint.path && docEndpoint.method === endpoint.method
      )

      if (!found) {
        // Generate a template JSDoc annotation
        annotations += `\n/**\n * @swagger\n * ${endpoint.path}:\n *   ${endpoint.method.toLowerCase()}:\n *     tags: [AutoGenerated]\n *     summary: Auto-generated for ${endpoint.path}\n *     description: This endpoint was detected in the code but not documented in the OpenAPI spec\n *     responses:\n *       200:\n *         description: Successful response\n *       default:\n *         description: Error response\n */\n\n`
      }
    }

    return annotations
  }

  /**
   * Update OpenAPI spec with detected routes (if they match a standard format)
   */
  async updateSpecWithDetectedRoutes() {
    await this.loadSpec()

    const definedEndpoints = await this.getDefinedEndpoints()
    const documentedEndpoints = this.getDocumentedEndpoints()

    let updated = false

    for (const endpoint of definedEndpoints) {
      const found = documentedEndpoints.some(
        docEndpoint => docEndpoint.path === endpoint.path && docEndpoint.method === endpoint.method
      )

      if (!found) {
        // Add the endpoint to the spec (with a basic template)
        if (!this.spec.paths) {
          this.spec.paths = {}
        }
        if (!this.spec.paths[endpoint.path]) {
          this.spec.paths[endpoint.path] = {}
        }

        this.spec.paths[endpoint.path][endpoint.method.toLowerCase()] = {
          tags: ['AutoGenerated'],
          summary: `Auto-generated for ${endpoint.path}`,
          description: `This endpoint was detected in the code but not documented in the OpenAPI spec`,
          responses: {
            200: {
              description: 'Successful response'
            },
            default: {
              description: 'Error response'
            }
          }
        }

        updated = true
      }
    }

    if (updated) {
      const yamlSpec = yaml.dump(this.spec, { lineWidth: -1 })
      await fs.writeFile(this.specPath, yamlSpec)
      console.log('✅ OpenAPI spec updated with detected routes')
    }

    return updated
  }

  /**
   * Synchronize documentation with implementation
   */
  async synchronize() {
    console.log('🔄 Starting documentation synchronization...')

    // Generate report of discrepancies
    const report = await this.generateSynchronizationReport()

    if (report.totalDiscrepancies > 0) {
      console.log(`⚠️  Found ${report.totalDiscrepancies} discrepancies:`)

      if (report.endpointDiscrepancies.missingInSpec.length > 0) {
        console.log(
          `  - ${report.endpointDiscrepancies.missingInSpec.length} endpoints missing in OpenAPI spec`
        )
        for (const endpoint of report.endpointDiscrepancies.missingInSpec) {
          console.log(`    • ${endpoint.method} ${endpoint.path} (defined in ${endpoint.file})`)
        }
      }

      if (report.endpointDiscrepancies.missingInCode.length > 0) {
        console.log(
          `  - ${report.endpointDiscrepancies.missingInCode.length} endpoints in spec but not implemented`
        )
        for (const endpoint of report.endpointDiscrepancies.missingInCode) {
          console.log(`    • ${endpoint.method} ${endpoint.path}`)
        }
      }

      // Attempt to fix missing endpoints in spec
      const updatedSpec = await this.updateSpecWithDetectedRoutes()
      if (updatedSpec) {
        console.log('✅ OpenAPI spec updated with missing endpoints')
      }

      // Generate annotations for missing documentation
      const annotations = await this.generateMissingAnnotations()
      if (annotations) {
        console.log(
          `📝 Generated ${annotations.split('/**').length - 1} JSDoc annotation templates`
        )
        // In a real implementation, we might write these to a temporary file
      }
    } else {
      console.log('✅ Documentation is synchronized with implementation')
    }

    return report
  }
}

/**
 * Initialize and run documentation synchronization
 */
export async function runDocumentationSynchronization() {
  const synchronizer = new DocumentationSynchronizer()
  return await synchronizer.synchronize()
}

/**
 * Create a middleware to log when endpoints are accessed that don't exist in the spec
 */
export function createDocumentationComplianceMiddleware() {
  return async (req, res, next) => {
    // Only run in development to avoid performance impact in production
    if (!config.IS_DEVELOPMENT) {
      return next()
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
      return next()
    }

    // Only validate API endpoints
    if (!req.path.startsWith('/api/')) {
      return next()
    }

    const synchronizer = new DocumentationSynchronizer()
    await synchronizer.loadSpec()

    // Check if this endpoint exists in the spec
    const documentedEndpoints = synchronizer.getDocumentedEndpoints()
    const existsInSpec = documentedEndpoints.some(
      endpoint => endpoint.path === req.path && endpoint.method === req.method
    )

    if (!existsInSpec) {
      console.warn(`⚠️  Endpoint ${req.method} ${req.path} is not documented in the OpenAPI spec`)
    }

    next()
  }
}
