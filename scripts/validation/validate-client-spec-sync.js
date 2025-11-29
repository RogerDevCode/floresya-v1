#!/usr/bin/env node

/**
 * Client-Spec Sync Validation Script
 *
 * Validates that frontend client usage matches OpenAPI specification
 * Part of Phase 2: Automated OpenAPI Documentation Validation
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class ClientSpecSyncValidator {
  constructor() {
    this.rootDir = path.resolve(__dirname, '../..')
    this.specPath = path.join(this.rootDir, 'api/docs/openapi-spec.json')
    this.frontendDir = path.join(this.rootDir, 'public')
    this.errors = []
    this.warnings = []
    this.apiEndpoints = new Set()
    this.frontendApiCalls = new Set()
  }

  /**
   * Run complete client-spec sync validation
   */
  async validate() {
    console.log('🔄 Starting Client-Spec Sync Validation...')

    try {
      // Parse OpenAPI specification
      await this.parseOpenAPISpec()

      // Scan frontend for API calls
      await this.scanFrontendApiCalls()

      // Compare specification vs usage
      await this.validateSync()

      // Generate report
      this.generateReport()

      // Return exit code based on results
      return this.errors.length === 0 ? 0 : 1
    } catch (error) {
      console.error('❌ Client-spec sync validation failed:', error.message)
      this.errors.push(`Validation system error: ${error.message}`)
      return 1
    }
  }

  /**
   * Parse OpenAPI specification to extract endpoints
   */
  async parseOpenAPISpec() {
    console.log('📖 Parsing OpenAPI specification...')

    if (!fs.existsSync(this.specPath)) {
      this.errors.push('OpenAPI specification file not found')
      return
    }

    try {
      const spec = JSON.parse(fs.readFileSync(this.specPath, 'utf8'))
      const paths = spec.paths || {}

      Object.entries(paths).forEach(([path, pathItem]) => {
        Object.keys(pathItem).forEach(method => {
          if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
            this.apiEndpoints.add(`${method.toUpperCase()} ${path}`)
          }
        })
      })

      console.log(`✅ Found ${this.apiEndpoints.size} endpoints in OpenAPI spec`)
    } catch (error) {
      this.errors.push(`Failed to parse OpenAPI spec: ${error.message}`)
    }
  }

  /**
   * Scan frontend files for API calls
   */
  async scanFrontendApiCalls() {
    console.log('🔍 Scanning frontend for API calls...')

    if (!fs.existsSync(this.frontendDir)) {
      this.warnings.push('Frontend directory not found')
      return
    }

    const jsFiles = this.findFiles(this.frontendDir, ['.js', '.html', '.htm'])

    jsFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8')
        this.extractApiCalls(content, file)
      } catch (error) {
        console.warn(`Warning: Could not read file ${file}: ${error.message}`)
      }
    })

    console.log(`✅ Found ${this.frontendApiCalls.size} API calls in frontend`)
  }

  /**
   * Find files with specific extensions
   */
  findFiles(dir, extensions) {
    const files = []

    function traverse(currentDir) {
      const items = fs.readdirSync(currentDir)

      items.forEach(item => {
        const fullPath = path.join(currentDir, item)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          traverse(fullPath)
        } else if (stat.isFile()) {
          const ext = path.extname(item).toLowerCase()
          if (extensions.includes(ext)) {
            files.push(fullPath)
          }
        }
      })
    }

    traverse(dir)
    return files
  }

  /**
   * Extract API calls from file content
   */
  extractApiCalls(content, filePath) {
    // Patterns for different API call methods
    const patterns = [
      // fetch API
      /fetch\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*\{[^}]*method\s*:\s*['"`]([^'"`]+)['"`]/gi,
      // axios methods
      /axios\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi,
      // jQuery AJAX
      /\$\.ajax\s*\(\s*\{[^}]*url\s*:\s*['"`]([^'"`]+)['"`][^}]*type\s*:\s*['"`]([^'"`]+)['"`]/gi,
      // Simple URL patterns (fallback)
      { pattern: /['"`](\/api\/[^'"`]+)['"`]/g, defaultMethod: 'UNKNOWN' }
    ]

    patterns.forEach(item => {
      const pattern = item.pattern || item
      const defaultMethod = item.defaultMethod
      let match
      while ((match = pattern.exec(content)) !== null) {
        let method
        let url

        if (defaultMethod) {
           url = match[1]
           method = defaultMethod
        } else {
           // Logic for other patterns
           if (['get', 'post', 'put', 'delete', 'patch'].includes(match[1].toLowerCase())) {
             method = match[1]
             url = match[2]
           } else {
             url = match[1]
             method = match[2] || 'GET'
           }
        }

        // Clean up the URL
        const cleanUrl = url.replace(/^['"`]|['"`]$/g, '')

        // Normalize to OpenAPI path format
        const normalizedPath = this.normalizeApiPath(cleanUrl)
        const normalizedMethod = method.toUpperCase()

        // Add to set (allow /api and /health endpoints)
        if (normalizedPath.startsWith('/api') || normalizedPath.startsWith('/health')) {
          this.frontendApiCalls.add(`${normalizedMethod} ${normalizedPath}`)
        }
      }
    })
  }

  /**
   * Normalize API path to OpenAPI format
   */
  normalizeApiPath(path) {
    // Remove protocol and domain
    let cleanPath = path.replace(/^https?:\/\/[^/]+/, '')

    // Remove query parameters
    cleanPath = cleanPath.split('?')[0]

    // Replace /${...} with /{param} (path parameters)
    cleanPath = cleanPath.replace(/\/\$\{[^}]+\}/g, '/{param}')
    
    // Replace remaining ${...} with nothing (likely query params)
    cleanPath = cleanPath.replace(/\$\{[^}]+\}/g, '')

    // Normalize to lowercase
    cleanPath = cleanPath.toLowerCase()
    
    // Ensure it starts with /
    if (!cleanPath.startsWith('/')) {
      cleanPath = '/' + cleanPath
    }
    
    // Handle double slashes
    cleanPath = cleanPath.replace(/\/+/g, '/')
    
    // Note: We don't force /api prefix here anymore to allow matching /health endpoints
    // But we might need to handle it in extraction or validation

    return cleanPath
  }

  /**
   * Validate synchronization between spec and usage
   */
  async validateSync() {
    console.log('🔄 Validating spec-usage synchronization...')

    // Find API calls in frontend that are not in spec
    const undocumentedCalls = Array.from(this.frontendApiCalls).filter(call => {
      const [method, path] = call.split(' ')
      return !Array.from(this.apiEndpoints).some(specCall => {
        const [specMethod, specPath] = specCall.split(' ')
        // If method is UNKNOWN, match any method
        const methodMatch = method === 'UNKNOWN' || specMethod === method
        
        // Try matching exact path
        if (methodMatch && this.pathsMatch(specPath, path)) {
          return true
        }
        
        // Try matching with /api prefix difference
        // If spec has /health and frontend has /api/health
        if (methodMatch && path.startsWith('/api') && !specPath.startsWith('/api')) {
           const pathWithoutApi = path.replace('/api', '')
           if (this.pathsMatch(specPath, pathWithoutApi)) {
             return true
           }
        }
        
        // If spec has /api/health and frontend has /health (unlikely but possible)
        if (methodMatch && !path.startsWith('/api') && specPath.startsWith('/api')) {
           const pathWithApi = '/api' + path
           if (this.pathsMatch(specPath, pathWithApi)) {
             return true
           }
        }
        
        return false
      })
    })

    // Find documented endpoints not used in frontend
    const unusedEndpoints = Array.from(this.apiEndpoints).filter(specCall => {
      const [method, path] = specCall.split(' ')
      return !Array.from(this.frontendApiCalls).some(call => {
        const [callMethod, callPath] = call.split(' ')
        // If callMethod is UNKNOWN, match any method
        const methodMatch = callMethod === 'UNKNOWN' || callMethod === method
        return methodMatch && this.pathsMatch(path, callPath)
      })
    })

    // Report undocumented calls (errors)
    undocumentedCalls.forEach(call => {
      this.errors.push(`Undocumented API call in frontend: ${call}`)
    })

    // Report unused endpoints (warnings - might be valid)
    unusedEndpoints.forEach(endpoint => {
      this.warnings.push(`Documented endpoint not used in frontend: ${endpoint}`)
    })

    console.log(
      `📊 Sync analysis: ${undocumentedCalls.length} undocumented, ${unusedEndpoints.length} unused`
    )
  }

  /**
   * Check if two API paths match (considering path parameters)
   */
  pathsMatch(specPath, callPath) {
    // Convert both to lowercase for comparison
    const specLower = specPath.toLowerCase()
    const callLower = callPath.toLowerCase()

    // Simple path segment comparison
    const specSegments = specLower.split('/').filter(s => s)
    const callSegments = callLower.split('/').filter(s => s)

    if (specSegments.length !== callSegments.length) {
      return false
    }

    return specSegments.every((specSegment, index) => {
      const callSegment = callSegments[index]

      // If spec segment is a parameter (starts with { or :), it matches anything
      if (specSegment.startsWith('{') || specSegment.startsWith(':')) {
        return true
      }

      return specSegment === callSegment
    })
  }

  /**
   * Generate validation report
   */
  generateReport() {
    console.log('\n📊 CLIENT-SPEC SYNC REPORT')
    console.log('===========================')

    console.log(`📖 OpenAPI endpoints: ${this.apiEndpoints.size}`)
    console.log(`🔍 Frontend API calls: ${this.frontendApiCalls.size}`)

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ Perfect synchronization between spec and usage!')
      return
    }

    if (this.errors.length > 0) {
      console.log(`\n❌ SYNC ERRORS (${this.errors.length}):`)
      this.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`)
      })
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️ SYNC WARNINGS (${this.warnings.length}):`)
      this.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`)
      })
    }

    const syncRate =
      this.apiEndpoints.size > 0
        ? (((this.apiEndpoints.size - this.errors.length) / this.apiEndpoints.size) * 100).toFixed(
            1
          )
        : 0

    console.log(`\n📈 Synchronization rate: ${syncRate}%`)
    console.log(`Summary: ${this.errors.length} errors, ${this.warnings.length} warnings`)
  }
}

// Run validation
const validator = new ClientSpecSyncValidator()
validator
  .validate()
  .then(exitCode => {
    process.exit(exitCode)
  })
  .catch(error => {
    console.error('Client-spec sync validation failed:', error)
    process.exit(1)
  })
