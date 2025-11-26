#!/usr/bin/env node

/**
 * Frontend Contract Validation Script
 *
 * Validates frontend components against OpenAPI contracts
 * Part of Phase 2: Automated OpenAPI Documentation Validation
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class FrontendContractValidator {
  constructor() {
    this.rootDir = path.resolve(__dirname, '../..')
    this.specPath = path.join(this.rootDir, 'api/docs/openapi-spec.json')
    this.frontendDir = path.join(this.rootDir, 'public')
    this.errors = []
    this.warnings = []
    this.contracts = new Map()
  }

  /**
   * Run complete frontend contract validation
   */
  async validate() {
    console.log('🎨 Starting Frontend Contract Validation...')

    try {
      // Load OpenAPI contracts
      await this.loadContracts()

      // Validate frontend forms against API schemas
      await this.validateFormContracts()

      // Validate frontend API response handling
      await this.validateResponseHandling()

      // Validate frontend data models
      await this.validateDataModels()

      // Generate report
      this.generateReport()

      // Return exit code based on results
      return this.errors.length === 0 ? 0 : 1
    } catch (error) {
      console.error('❌ Frontend contract validation failed:', error.message)
      this.errors.push(`Validation system error: ${error.message}`)
      return 1
    }
  }

  /**
   * Load OpenAPI contracts/schemas
   */
  async loadContracts() {
    console.log('📖 Loading OpenAPI contracts...')

    if (!fs.existsSync(this.specPath)) {
      this.errors.push('OpenAPI specification file not found')
      return
    }

    try {
      const spec = JSON.parse(fs.readFileSync(this.specPath, 'utf8'))
      const schemas = spec.components?.schemas || {}

      // Store contracts for validation
      Object.entries(schemas).forEach(([name, schema]) => {
        this.contracts.set(name, schema)
      })

      console.log(`✅ Loaded ${this.contracts.size} contracts from OpenAPI spec`)
    } catch (error) {
      this.errors.push(`Failed to load OpenAPI contracts: ${error.message}`)
    }
  }

  /**
   * Validate frontend forms against API schemas
   */
  async validateFormContracts() {
    console.log('📝 Validating frontend form contracts...')

    const htmlFiles = this.findFiles(this.frontendDir, ['.html', '.htm'])

    htmlFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8')
        this.validateFormsInFile(content, file)
      } catch (error) {
        console.warn(`Warning: Could not read file ${file}: ${error.message}`)
      }
    })

    const jsValidationFiles = this.findFiles(this.frontendDir, ['.js'])
    jsValidationFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8')
        this.validateFormValidationInJS(content, file)
      } catch (error) {
        console.warn(`Warning: Could not read file ${file}: ${error.message}`)
      }
    })
  }

  /**
   * Find files with specific extensions
   */
  findFiles(dir, extensions) {
    const files = []

    function traverse(currentDir) {
      try {
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
      } catch {
        // Skip directories that can't be read
      }
    }

    traverse(dir)
    return files
  }

  /**
   * Validate forms in HTML file
   */
  validateFormsInFile(content, filePath) {
    // Find forms
    const formRegex = /<form[^>]*>([\s\S]*?)<\/form>/gi
    let match

    while ((match = formRegex.exec(content)) !== null) {
      const formContent = match[1]

      // Extract form fields
      const fields = this.extractFormFields(formContent)

      // Try to match with API contracts
      this.validateFormFields(fields, `${filePath} (form)`)
    }
  }

  /**
   * Extract form fields from HTML
   */
  extractFormFields(formContent) {
    const fields = []

    // Input fields
    const inputRegex =
      /<input[^>]*name\s*=\s*['"`]([^'"`]+)['"`][^>]*type\s*=\s*['"`]([^'"`]+)['"`]/gi
    let match

    while ((match = inputRegex.exec(formContent)) !== null) {
      fields.push({
        name: match[1],
        type: match[2],
        element: 'input'
      })
    }

    // Select fields
    const selectRegex = /<select[^>]*name\s*=\s*['"`]([^'"`]+)['"`]/gi
    while ((match = selectRegex.exec(formContent)) !== null) {
      fields.push({
        name: match[1],
        type: 'select',
        element: 'select'
      })
    }

    // Textarea fields
    const textareaRegex = /<textarea[^>]*name\s*=\s*['"`]([^'"`]+)['"`]/gi
    while ((match = textareaRegex.exec(formContent)) !== null) {
      fields.push({
        name: match[1],
        type: 'textarea',
        element: 'textarea'
      })
    }

    return fields
  }

  /**
   * Validate form fields against contracts
   */
  validateFormFields(fields, context) {
    if (fields.length === 0) {
      return
    }

    // Try to find matching contract
    const contractName = this.inferContractFromFields(fields)
    if (!contractName || !this.contracts.has(contractName)) {
      this.warnings.push(`Could not validate ${context}: no matching contract found for fields`)
      return
    }

    const contract = this.contracts.get(contractName)
    const contractProperties = contract.properties || {}

    fields.forEach(field => {
      const contractField = contractProperties[field.name]

      if (!contractField) {
        this.warnings.push(
          `Field '${field.name}' in ${context} not found in contract '${contractName}'`
        )
        return
      }

      // Basic type validation
      if (!this.validateFieldType(field, contractField)) {
        this.errors.push(
          `Field '${field.name}' type mismatch in ${context}: expected ${contractField.type}, got ${field.type}`
        )
      }
    })

    // Check for missing required fields
    Object.entries(contractProperties).forEach(([name, schema]) => {
      if (schema.required && !fields.find(f => f.name === name)) {
        this.warnings.push(`Required field '${name}' missing in ${context}`)
      }
    })
  }

  /**
   * Infer contract name from form fields
   */
  inferContractFromFields(fields) {
    const fieldNames = fields.map(f => f.name.toLowerCase())

    // Simple heuristic matching
    if (fieldNames.includes('email') && fieldNames.includes('password')) {
      return 'user'
    }
    if (fieldNames.includes('name') && fieldNames.includes('price')) {
      return 'product'
    }
    if (fieldNames.includes('total_amount') || fieldNames.includes('customer_email')) {
      return 'order'
    }
    if (fieldNames.includes('key') && fieldNames.includes('value')) {
      return 'settings'
    }

    return null
  }

  /**
   * Validate field type against schema
   */
  validateFieldType(field, schema) {
    const frontendType = field.type.toLowerCase()
    const schemaType = schema.type

    // Basic type mapping
    const typeMapping = {
      text: ['string'],
      email: ['string', 'email'],
      password: ['string'],
      number: ['number', 'integer'],
      tel: ['string'],
      url: ['string', 'uri'],
      textarea: ['string'],
      select: ['string']
    }

    const validSchemaTypes = typeMapping[frontendType] || []
    return validSchemaTypes.includes(schemaType)
  }

  /**
   * Validate form validation in JavaScript files
   */
  validateFormValidationInJS(content, filePath) {
    // Look for form validation patterns
    const validationPatterns = [
      /required\s*\(\s*['"`]([^'"`]+)['"`]/gi,
      /email\s*\(\s*['"`]([^'"`]+)['"`]/gi,
      /minlength\s*\(\s*['"`]([^'"`]+)['"`]/gi,
      /maxlength\s*\(\s*['"`]([^'"`]+)['"`]/gi
    ]

    validationPatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(content)) !== null) {
        // Found validation - this is good
        console.log(`✅ Found validation for field '${match[1]}' in ${filePath}`)
      }
    })
  }

  /**
   * Validate frontend API response handling
   */
  async validateResponseHandling() {
    console.log('🔄 Validating API response handling...')

    const jsFiles = this.findFiles(this.frontendDir, ['.js'])

    jsFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8')
        this.validateResponseHandlingInFile(content, file)
      } catch (error) {
        console.warn(`Warning: Could not read file ${file}: ${error.message}`)
      }
    })
  }

  /**
   * Validate response handling in JavaScript file
   */
  validateResponseHandlingInFile(content, filePath) {
    // Look for proper error handling patterns
    const errorHandlingPatterns = [
      /\.catch\s*\(/gi,
      /try\s*{[\s\S]*?}\s*catch/gi,
      /status\s*===\s*400/gi,
      /status\s*===\s*500/gi,
      /response\.ok/gi
    ]

    let hasErrorHandling = false
    errorHandlingPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        hasErrorHandling = true
      }
    })

    // Look for fetch/axios calls
    const apiCallPatterns = [/fetch\s*\(/gi, /axios\./gi, /\$\.ajax/gi]

    let hasApiCalls = false
    apiCallPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        hasApiCalls = true
      }
    })

    if (hasApiCalls && !hasErrorHandling) {
      this.warnings.push(`${filePath}: API calls found but no error handling detected`)
    }
  }

  /**
   * Validate frontend data models
   */
  async validateDataModels() {
    console.log('🏗️ Validating frontend data models...')

    const jsFiles = this.findFiles(this.frontendDir, ['.js'])

    jsFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8')
        this.validateDataModelsInFile(content, file)
      } catch (error) {
        console.warn(`Warning: Could not read file ${file}: ${error.message}`)
      }
    })
  }

  /**
   * Validate data models in JavaScript file
   */
  validateDataModelsInFile(content, filePath) {
    // Look for object creation patterns that might represent data models
    const objectPatterns = [
      /const\s+\w+\s*=\s*{[\s\S]*?}/gi,
      /{\s*id\s*:/gi,
      /{\s*name\s*:/gi,
      /{\s*email\s*:/gi
    ]

    objectPatterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches && matches.length > 0) {
        console.log(`✅ Found data model patterns in ${filePath}`)
      }
    })
  }

  /**
   * Generate validation report
   */
  generateReport() {
    console.log('\n📊 FRONTEND CONTRACT VALIDATION REPORT')
    console.log('====================================')

    console.log(`📖 Loaded contracts: ${this.contracts.size}`)

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All frontend contract validations passed!')
      return
    }

    if (this.errors.length > 0) {
      console.log(`\n❌ CONTRACT ERRORS (${this.errors.length}):`)
      this.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`)
      })
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️ CONTRACT WARNINGS (${this.warnings.length}):`)
      this.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`)
      })
    }

    console.log(`\nSummary: ${this.errors.length} errors, ${this.warnings.length} warnings`)
  }
}

// Run validation
const validator = new FrontendContractValidator()
validator
  .validate()
  .then(exitCode => {
    process.exit(exitCode)
  })
  .catch(error => {
    console.error('Frontend contract validation failed:', error)
    process.exit(1)
  })
