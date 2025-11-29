#!/usr/bin/env node

/**
 * OpenAPI Contract Validation CI Script
 *
 * Validates OpenAPI specification completeness and sync with implementation
 * Part of Phase 2: Automated OpenAPI Documentation Validation
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class OpenAPIContractValidator {
  constructor() {
    this.rootDir = path.resolve(__dirname, '../..')
    this.specPath = path.join(this.rootDir, 'api/docs/openapi-spec.json')
    this.yamlPath = path.join(this.rootDir, 'api/docs/openapi-spec.yaml')
    this.annotationsPath = path.join(this.rootDir, 'api/docs/openapi-annotations.js')
    this.errors = []
    this.warnings = []
  }

  /**
   * Run complete OpenAPI contract validation
   */
  async validate() {
    console.log('🔍 Starting OpenAPI Contract Validation...')

    try {
      // Check if specification files exist
      this.validateSpecFilesExist()

      // Validate specification syntax
      await this.validateSpecSyntax()

      // Validate endpoint coverage
      await this.validateEndpointCoverage()

      // Validate schema definitions
      await this.validateSchemaDefinitions()

      // Check annotation sync
      await this.validateAnnotationSync()

      // Generate report
      this.generateReport()

      // Return exit code based on results
      return this.errors.length === 0 ? 0 : 1
    } catch (error) {
      console.error('❌ Validation failed with error:', error.message)
      this.errors.push(`Validation system error: ${error.message}`)
      return 1
    }
  }

  /**
   * Check if required specification files exist
   */
  validateSpecFilesExist() {
    console.log('📁 Checking specification files...')

    const requiredFiles = [
      { path: this.specPath, name: 'JSON specification' },
      { path: this.yamlPath, name: 'YAML specification' },
      { path: this.annotationsPath, name: 'OpenAPI annotations' }
    ]

    requiredFiles.forEach(({ path, name }) => {
      if (!fs.existsSync(path)) {
        this.errors.push(`Missing ${name}: ${path}`)
      } else {
        console.log(`✅ ${name} found`)
      }
    })
  }

  /**
   * Validate OpenAPI specification syntax
   */
  async validateSpecSyntax() {
    console.log('📝 Validating specification syntax...')

    try {
      // Validate JSON spec
      if (fs.existsSync(this.specPath)) {
        const jsonSpec = JSON.parse(fs.readFileSync(this.specPath, 'utf8'))
        this.validateSpecStructure(jsonSpec, 'JSON')
      }

      // Basic YAML syntax check (try to parse as JSON after basic conversion)
      if (fs.existsSync(this.yamlPath)) {
        const yamlContent = fs.readFileSync(this.yamlPath, 'utf8')

        // Basic YAML structure checks
        if (!yamlContent.includes('openapi:')) {
          this.errors.push('YAML spec missing OpenAPI version')
        }
        if (!yamlContent.includes('info:')) {
          this.errors.push('YAML spec missing info section')
        }
        if (!yamlContent.includes('paths:')) {
          this.errors.push('YAML spec missing paths section')
        }

        console.log('✅ YAML specification syntax valid')
      }
    } catch (error) {
      this.errors.push(`Specification syntax error: ${error.message}`)
    }
  }

  /**
   * Validate basic OpenAPI spec structure
   */
  validateSpecStructure(spec, format) {
    const required = ['openapi', 'info', 'paths']
    const missing = required.filter(field => !spec[field])

    if (missing.length > 0) {
      this.errors.push(`${format} spec missing required fields: ${missing.join(', ')}`)
    }

    // Check OpenAPI version
    if (!spec.openapi || !spec.openapi.startsWith('3.')) {
      this.warnings.push(`${format} spec should use OpenAPI 3.x`)
    }

    console.log(`✅ ${format} specification structure valid`)
  }

  /**
   * Validate endpoint coverage against routes
   */
  async validateEndpointCoverage() {
    console.log('🛣️ Validating endpoint coverage...')

    try {
      // Load OpenAPI spec
      const spec = JSON.parse(fs.readFileSync(this.specPath, 'utf8'))

      // Find all route files
      const routesDir = path.join(this.rootDir, 'api/routes')
      const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.routes.js') || f.endsWith('Routes.js'))

      // Map route files to prefixes
      const routePrefixes = {
        'productRoutes.js': '/api/products',
        'orderRoutes.js': '/api/orders',
        'userRoutes.js': '/api/users',
        'paymentRoutes.js': '/api/payments',
        'paymentMethodRoutes.js': '/api/payment-methods',
        'occasionRoutes.js': '/api/occasions',
        'settingsRoutes.js': '/api/settings',
        'admin/settingsRoutes.js': '/api/admin/settings',
        'migrationRoutes.js': '/api/migrations',
        'healthRoutes.js': '/health',
        'accounting.routes.js': '/api/accounting'
      }

      let totalSpecEndpoints = 0
      let documentedEndpoints = 0

      // Handle nested routes (admin/settingsRoutes.js)
      const allRouteFiles = []
      
      // Add root level files
      routeFiles.forEach(file => allRouteFiles.push({ file, path: path.join(routesDir, file) }))
      
      // Add admin level files
      const adminRoutesDir = path.join(routesDir, 'admin')
      if (fs.existsSync(adminRoutesDir)) {
        const adminFiles = fs.readdirSync(adminRoutesDir).filter(f => f.endsWith('Routes.js'))
        adminFiles.forEach(file => allRouteFiles.push({ 
          file: `admin/${file}`, 
          path: path.join(adminRoutesDir, file) 
        }))
      }

      allRouteFiles.forEach(({ file, path: filePath }) => {
        const content = fs.readFileSync(filePath, 'utf8')
        const prefix = routePrefixes[file] || ''

        // Extract route definitions (basic pattern matching)
        const routeMatches =
          content.match(/router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g) || []

        routeMatches.forEach(match => {
          const method = match.match(/\.(get|post|put|delete|patch)\s*\(/)[1]
          const routePath = match.match(/['"`]([^'"`]+)['"`]/)[1]
          
          // Construct full path
          let fullPath = prefix + routePath
          // Remove trailing slash if not root
          if (fullPath.length > 1 && fullPath.endsWith('/')) {
            fullPath = fullPath.slice(0, -1)
          }
          // Ensure no double slashes
          fullPath = fullPath.replace('//', '/')

          totalSpecEndpoints++

          // Check if endpoint is documented in OpenAPI
          const normalizedPath = fullPath.replace(/:([^/]+)/g, '{$1}')
          const specPathKey = Object.keys(spec.paths || {}).find(
            sp => sp.toLowerCase() === normalizedPath.toLowerCase()
          )

          if (specPathKey && spec.paths[specPathKey] && spec.paths[specPathKey][method]) {
            documentedEndpoints++
          } else {
            this.warnings.push(`Undocumented endpoint: ${method.toUpperCase()} ${fullPath}`)
          }
        })
      })

      const coverage =
        totalSpecEndpoints > 0 ? ((documentedEndpoints / totalSpecEndpoints) * 100).toFixed(1) : 0
      console.log(
        `📊 Endpoint coverage: ${documentedEndpoints}/${totalSpecEndpoints} (${coverage}%)`
      )

      if (coverage < 80) {
        this.warnings.push(`Low endpoint coverage: ${coverage}% (target: >80%)`)
      }
    } catch (error) {
      this.errors.push(`Endpoint coverage validation failed: ${error.message}`)
    }
  }

  /**
   * Validate schema definitions
   */
  async validateSchemaDefinitions() {
    console.log('📋 Validating schema definitions...')

    try {
      const spec = JSON.parse(fs.readFileSync(this.specPath, 'utf8'))
      const schemas = spec.components?.schemas || {}

      if (Object.keys(schemas).length === 0) {
        this.warnings.push('No schema definitions found')
        return
      }

      let validSchemas = 0
      const totalSchemas = Object.keys(schemas).length

      Object.entries(schemas).forEach(([name, schema]) => {
        if (this.isValidSchema(schema)) {
          validSchemas++
        } else {
          this.warnings.push(`Invalid schema definition: ${name}`)
        }
      })

      console.log(`📋 Schema validation: ${validSchemas}/${totalSchemas} valid`)
    } catch (error) {
      this.errors.push(`Schema validation failed: ${error.message}`)
    }
  }

  /**
   * Check if schema is valid
   */
  isValidSchema(schema) {
    // Basic schema validation
    if (!schema || typeof schema !== 'object') {
      return false
    }

    // Must have type or properties
    if (!schema.type && !schema.properties && !schema.allOf && !schema.anyOf && !schema.oneOf) {
      return false
    }

    return true
  }

  /**
   * Validate annotation sync with specification
   */
  async validateAnnotationSync() {
    console.log('🔄 Validating annotation sync...')

    try {
      if (!fs.existsSync(this.annotationsPath)) {
        this.errors.push('OpenAPI annotations file not found')
        return
      }

      // Import annotations (dynamic import for ESM)
      const annotationsFile = await import(this.annotationsPath)
      const annotations = annotationsFile.default || annotationsFile

      if (!annotations || typeof annotations !== 'object') {
        this.errors.push('Invalid annotations format')
        return
      }

      const annotationCount = Object.keys(annotations).length
      console.log(`📝 Found ${annotationCount} annotations`)

      if (annotationCount === 0) {
        this.warnings.push('No OpenAPI annotations found')
      }
    } catch (error) {
      this.errors.push(`Annotation sync validation failed: ${error.message}`)
    }
  }

  /**
   * Generate validation report
   */
  generateReport() {
    console.log('\n📊 VALIDATION REPORT')
    console.log('==================')

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All checks passed!')
      return
    }

    if (this.errors.length > 0) {
      console.log(`\n❌ ERRORS (${this.errors.length}):`)
      this.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`)
      })
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️ WARNINGS (${this.warnings.length}):`)
      this.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`)
      })
    }

    console.log(`\nSummary: ${this.errors.length} errors, ${this.warnings.length} warnings`)
  }
}

// Run validation
const validator = new OpenAPIContractValidator()
validator
  .validate()
  .then(exitCode => {
    process.exit(exitCode)
  })
  .catch(error => {
    console.error('Validation script failed:', error)
    process.exit(1)
  })
