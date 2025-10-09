#!/usr/bin/env node

/**
 * API Client Generator for Frontend
 * Genera cliente API JavaScript desde especificación OpenAPI
 * 100% dinámico - no hardcoding
 * Principios: KISS, SOLID, DRY, SSOT
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Generar cliente API completo para frontend
 */
async function generateApiClient() {
  try {
    console.log('🚀 Generating API client from OpenAPI specification...')

    // Cargar especificación OpenAPI (SSOT)
    const specPath = path.join(__dirname, '../api/docs/openapi-spec.json')
    const specContent = await fs.readFile(specPath, 'utf8')
    const spec = JSON.parse(specContent)

    console.log(`📋 Found ${Object.keys(spec.paths).length} endpoints in spec`)

    // Generar cliente API dinámicamente
    const clientCode = generateClientCode(spec)

    // Guardar cliente API
    const clientPath = path.join(__dirname, '../public/js/shared/api-client.js')
    await fs.writeFile(clientPath, clientCode)
    console.log(`✅ API client generated: ${clientPath}`)

    // Generar tipos TypeScript
    const typesCode = generateTypeScriptTypes(spec)
    const typesPath = path.join(__dirname, '../public/js/shared/api-types.js')
    await fs.writeFile(typesPath, typesCode)
    console.log(`✅ TypeScript types generated: ${typesPath}`)

    // Generar documentación de uso
    const usageGuide = generateUsageGuide(spec)
    const guidePath = path.join(__dirname, '../public/js/shared/API_USAGE.md')
    await fs.writeFile(guidePath, usageGuide)
    console.log(`📚 Usage guide generated: ${guidePath}`)

    // Generar reporte
    const report = {
      timestamp: new Date().toISOString(),
      specVersion: spec.info.version,
      totalEndpoints: Object.keys(spec.paths).length,
      generatedMethods: extractMethodsCount(spec),
      outputFiles: {
        client: clientPath,
        types: typesPath,
        guide: guidePath
      }
    }

    console.log(
      `\n🎉 Generated ${report.generatedMethods} methods from ${report.totalEndpoints} endpoints`
    )

    return report
  } catch (error) {
    console.error('❌ Error generating API client:', error)
    throw error
  }
}

/**
 * Generar código del cliente API dinámicamente desde spec
 */
function generateClientCode(spec) {
  const paths = spec.paths || {}
  const servers = spec.servers || []
  const timestamp = new Date().toISOString()

  // Generar métodos dinámicamente desde paths
  const methods = generateMethodsFromPaths(paths, spec)

  // Generar exports de conveniencia
  const convenientExports = generateConvenientExports(methods)

  const code = `/**
 * FloresYa API Client
 * Auto-generated from OpenAPI specification
 * Generated: ${timestamp}
 * Spec Version: ${spec.info.version}
 * Total Endpoints: ${Object.keys(paths).length}
 *
 * IMPORTANT: This file is AUTO-GENERATED. Do not edit manually.
 * Regenerate using: npm run generate:client
 */

class ApiClient {
  constructor(baseUrl = '${servers[0]?.url || 'http://localhost:3000'}') {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    }
  }

  /**
   * Make HTTP request with error handling
   * @param {string} endpoint - API endpoint
   * @param {object} options - Fetch options
   * @returns {Promise<any>} Response data
   */
  async request(endpoint, options = {}) {
    try {
      const url = this.baseUrl + endpoint
      const config = {
        method: options.method || 'GET',
        headers: { ...this.defaultHeaders, ...options.headers }
      }

      if (options.body && options.method !== 'GET') {
        config.body = JSON.stringify(options.body)
      }

      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || \`HTTP \${response.status}: \${response.statusText}\`
        )
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      }

      return await response.text()
    } catch (error) {
      console.error(\`API request failed: \${endpoint}\`, error)
      throw error
    }
  }

  // ==================== AUTO-GENERATED METHODS ====================

${methods.join('\n\n')}

  // ==================== UTILITIES ====================

  /**
   * Handle API errors with user-friendly messages
   * @param {Error} error - Error object
   * @returns {string} User-friendly message
   */
  handleError(error) {
    if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
      return 'Network error. Please check your connection.'
    }
    if (error.message.includes('404')) {
      return 'Resource not found.'
    }
    if (error.message.includes('400')) {
      return 'Invalid request. Please check your input.'
    }
    if (error.message.includes('401')) {
      return 'Authentication required.'
    }
    if (error.message.includes('403')) {
      return 'Access denied.'
    }
    if (error.message.includes('500')) {
      return 'Server error. Please try again later.'
    }

    return error.message || 'An unexpected error occurred.'
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export class for custom instances
export { ApiClient }

// Convenience functions for common operations
export const api = {
${convenientExports.join(',\n')}
}
`

  return code
}

/**
 * Generar métodos dinámicamente desde paths de OpenAPI
 */
function generateMethodsFromPaths(paths, spec) {
  const methods = []
  const generatedNames = new Set()

  for (const [path, pathItem] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
        continue
      }

      const methodInfo = generateMethodFromOperation(path, method, operation, spec)
      if (methodInfo && !generatedNames.has(methodInfo.name)) {
        methods.push(methodInfo.code)
        generatedNames.add(methodInfo.name)
      }
    }
  }

  return methods
}

/**
 * Generar método individual desde operation de OpenAPI
 */
function generateMethodFromOperation(path, httpMethod, operation, _spec) {
  try {
    // Generar nombre de método
    const methodName = generateMethodName(path, httpMethod, operation)

    // Extraer parámetros
    const pathParams = extractPathParams(path)
    const queryParams = extractQueryParams(operation)
    const hasBody = ['post', 'put', 'patch'].includes(httpMethod)

    // Generar firma de función
    const params = [...pathParams]
    if (queryParams.length > 0 || (hasBody && pathParams.length === 0)) {
      params.push(hasBody ? 'data' : 'params = {}')
    } else if (hasBody) {
      params.push('data')
    }

    // Generar endpoint string
    const endpointStr = generateEndpointString(path, pathParams, queryParams.length > 0)

    // Generar query string
    const queryStr = queryParams.length > 0 ? generateQueryString() : ''

    // Generar opciones de request (method + body si aplica)
    const requestOptions =
      httpMethod === 'get'
        ? ''
        : hasBody
          ? `, { method: '${httpMethod.toUpperCase()}', body: data }`
          : `, { method: '${httpMethod.toUpperCase()}' }`

    // Generar validaciones
    const validations = generateValidations(pathParams, operation)

    // Generar JSDoc
    const jsdoc = generateMethodJSDoc(operation, params, httpMethod)

    const code = `  ${jsdoc}
  ${methodName}(${params.join(', ')}) {
${validations}${queryStr}    const endpoint = ${endpointStr}
    return this.request(endpoint${requestOptions})
  }`

    return { name: methodName, code }
  } catch (error) {
    console.warn(`Failed to generate method for ${path} ${httpMethod}:`, error.message)
    return null
  }
}

/**
 * Generar nombre de método desde path y operación
 */
function generateMethodName(path, method, operation) {
  // Usar operationId si existe
  if (operation.operationId) {
    return operation.operationId
  }

  // Generar nombre basado en path y método
  const allParts = path.replace('/api/', '').split('/').filter(Boolean)
  const pathParts = allParts.filter(p => !p.startsWith('{'))
  const paramParts = allParts.filter(p => p.startsWith('{')).map(p => p.replace(/[{}]/g, ''))

  const resource = pathParts[pathParts.length - 1] || pathParts[0]
  const action = method

  // Casos especiales primero (mantienen prioridad)
  if (path.includes('/cancel')) {
    return `cancel${capitalize(pathParts[0])}`
  }
  if (path.includes('/status-history')) {
    return `get${capitalize(pathParts[0])}StatusHistory`
  }
  if (path.includes('/status')) {
    return method === 'patch'
      ? `update${capitalize(pathParts[0])}Status`
      : `get${capitalize(pathParts[0])}Status`
  }
  if (path.includes('/reactivate')) {
    return `reactivate${capitalize(pathParts[0])}`
  }
  if (path.includes('/verify-email')) {
    return 'verifyUserEmail'
  }
  if (path.includes('/confirm')) {
    return `confirm${capitalize(pathParts[0])}`
  }
  if (path.includes('/primary')) {
    const action = method === 'get' ? 'get' : 'update'
    return `${action}PrimaryImage`
  }
  if (path.includes('/carousel-order')) {
    return `updateCarouselProducts`
  }
  if (path.includes('/carousel')) {
    return `${method === 'get' ? 'getAll' : 'update'}CarouselProducts`
  }
  if (path.includes('/with-occasions')) {
    return method === 'get' ? 'getProductsWithOccasions' : 'createProductsWithOccasions'
  }
  if (path.includes('/occasion/')) {
    return 'getProductsByOccasion'
  }
  if (path.includes('/user/')) {
    return 'getOrdersByUser'
  }
  if (path.includes('/email/')) {
    return 'getAllEmail'
  }
  if (path.includes('/sku/')) {
    return 'getAllSku'
  }
  if (path.includes('/slug/')) {
    return 'getAllSlug'
  }
  if (path.includes('/stock')) {
    return 'updateStock'
  }
  if (path.includes('/display-order')) {
    return 'updateDisplayorder'
  }
  if (path.includes('/value')) {
    return 'getValue'
  }
  if (path.includes('/map')) {
    return 'getAllMap'
  }
  if (path.includes('/public')) {
    return 'getAllPublic'
  }
  if (path.includes('/methods')) {
    return 'getAllMethods'
  }
  if (path.includes('/bcv-price')) {
    return 'createBcvprice'
  }
  if (path.includes('/business-rules')) {
    return 'getAllBusinessrules'
  }

  // Image-related endpoints (be specific to avoid collisions)
  if (path === '/api/admin/settings/image' && method === 'post') {
    return 'uploadSettingImage'
  }
  if (path.includes('/products/') && path.includes('/images')) {
    if (method === 'get' && !path.includes('{imageIndex}')) {
      return 'getProductImages'
    }
    if (method === 'post') {
      return 'uploadProductImages'
    }
    if (method === 'delete') {
      return 'deleteProductImage'
    }
  }

  // Mapear acciones
  const actionMap = {
    get: path.endsWith('}') ? 'get' : 'getAll',
    post: 'create',
    put: 'update',
    patch: 'update',
    delete: 'delete'
  }

  const prefix = actionMap[action] || action

  // Para GET con path parameter al final (ej: /api/products/{id})
  // Generar: getProductById, getOrderById, etc.
  if (method === 'get' && path.endsWith('}') && pathParts.length > 0 && paramParts.length === 1) {
    const resourceName = capitalize(pathParts[pathParts.length - 1].replace(/-/g, ''))
    const paramName = capitalize(paramParts[0])
    return `get${resourceName}By${paramName}`
  }

  // Nombre genérico
  const resourceName = capitalize(resource.replace(/-/g, ''))
  return `${prefix}${resourceName}`
}

/**
 * Extraer parámetros de path
 */
function extractPathParams(path) {
  const matches = path.match(/\{([^}]+)\}/g)
  if (!matches) {
    return []
  }
  return matches.map(m => m.replace(/[{}]/g, ''))
}

/**
 * Extraer parámetros de query
 */
function extractQueryParams(operation) {
  if (!operation.parameters) {
    return []
  }
  return operation.parameters.filter(p => p.in === 'query').map(p => p.name)
}

/**
 * Generar string de endpoint
 */
function generateEndpointString(path, pathParams, hasQueryParams) {
  let endpointStr = path

  // Reemplazar {param} con ${param}
  for (const param of pathParams) {
    endpointStr = endpointStr.replace(`{${param}}`, `\${${param}}`)
  }

  // Agregar queryPart si hay query params
  if (hasQueryParams) {
    endpointStr += '${queryPart}'
  }

  return `\`${endpointStr}\``
}

/**
 * Generar query string builder
 */
function generateQueryString() {
  return `    const queryString = new URLSearchParams()
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryString.append(key, value.toString())
      }
    })
    const query = queryString.toString()
    const queryPart = query ? '?' + query : ''
    `
}

/**
 * Generar validaciones
 */
function generateValidations(pathParams, _operation) {
  const validations = []

  for (const param of pathParams) {
    if (param === 'id' || param.endsWith('Id')) {
      validations.push(
        `    if (!${param} || ${param} <= 0) {
      throw new Error('Invalid ${param}')
    }`
      )
    } else {
      validations.push(
        `    if (!${param}) {
      throw new Error('${param} is required')
    }`
      )
    }
  }

  return validations.length > 0 ? validations.join('\n') + '\n\n' : ''
}

/**
 * Generar JSDoc
 */
function generateMethodJSDoc(operation, params, method) {
  const summary = operation.summary || `${method.toUpperCase()} request`
  const description = operation.description || ''

  let jsdoc = `/**\n   * ${summary}`
  if (description && description !== summary) {
    jsdoc += `\n   * ${description}`
  }

  for (const param of params) {
    const paramName = param.includes('=') ? param.split('=')[0].trim() : param
    jsdoc += `\n   * @param {any} ${paramName} - Parameter`
  }

  jsdoc += `\n   * @returns {Promise<any>} API response`
  jsdoc += `\n   */`

  return jsdoc
}

/**
 * Generar exports de conveniencia
 */
function generateConvenientExports(methods) {
  const exports = []
  const methodNames = new Set()

  methods.forEach(methodCode => {
    const match = methodCode.match(/(?:async\s+)?(\w+)\(([^)]*)\)/)
    if (match) {
      const [, methodName, params] = match
      const paramNames = params
        .split(',')
        .map(p => p.split('=')[0].trim())
        .filter(p => p)

      if (!methodNames.has(methodName)) {
        exports.push(
          `  ${methodName}: (${paramNames.join(', ')}) => apiClient.${methodName}(${paramNames.join(', ')})`
        )
        methodNames.add(methodName)
      }
    }
  })

  // Agregar utilities
  exports.push('  handleError: (error) => apiClient.handleError(error)')

  return exports
}

/**
 * Capitalizar string
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Contar métodos generados
 */
function extractMethodsCount(spec) {
  let count = 0
  for (const pathItem of Object.values(spec.paths)) {
    for (const method of Object.keys(pathItem)) {
      if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
        count++
      }
    }
  }
  return count
}

/**
 * Generar tipos TypeScript (mantenido del original)
 */
function generateTypeScriptTypes(spec) {
  const schemas = spec.components?.schemas || {}

  let types = `/**
 * TypeScript Types for FloresYa API
 * Auto-generated from OpenAPI specification
 * Generated: ${new Date().toISOString()}
 * Spec Version: ${spec.info.version}
 */

// Base response types
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message: string
}

export interface ApiError {
  success: false
  error: string
  message: string
  details?: string[]
}

`

  // Generar interfaces desde schemas
  for (const [schemaName, schema] of Object.entries(schemas)) {
    if (schema.type === 'object' && schema.properties) {
      types += generateTypeInterface(schemaName, schema)
    }
  }

  return types
}

/**
 * Generar interface TypeScript desde schema
 */
function generateTypeInterface(name, schema) {
  const interfaceName = capitalize(name)
  const properties = schema.properties || {}

  let interfaceCode = `export interface ${interfaceName} {\n`

  for (const [propName, propSchema] of Object.entries(properties)) {
    const optional = !schema.required?.includes(propName) || propSchema.nullable
    const type = mapOpenApiTypeToTS(propSchema)
    interfaceCode += `  ${propName}${optional ? '?' : ''}: ${type}\n`
  }

  interfaceCode += `}\n\n`
  return interfaceCode
}

/**
 * Mapear tipos OpenAPI a TypeScript
 */
function mapOpenApiTypeToTS(schema) {
  if (schema.enum) {
    return schema.enum.map(v => `'${v}'`).join(' | ')
  }

  switch (schema.type) {
    case 'string':
      return 'string'
    case 'integer':
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'array':
      return `Array<${mapOpenApiTypeToTS(schema.items || {})}>`
    case 'object':
      return 'object'
    default:
      return 'any'
  }
}

/**
 * Generar guía de uso
 */
function generateUsageGuide(spec) {
  return `# 🎯 FloresYa API Client - Usage Guide

**Auto-generated**: ${new Date().toISOString()}
**Spec Version**: ${spec.info.version}
**Total Endpoints**: ${Object.keys(spec.paths).length}

## 📦 Installation

\`\`\`javascript
import { api } from './shared/api-client.js'
\`\`\`

## 🚀 Quick Start

\`\`\`javascript
// Get all products
const products = await api.getAllProducts({ limit: 10, featured: true })

// Get single product
const product = await api.getProduct(67)

// Create order
const order = await api.createOrders({
  order: { customer_email: 'user@example.com', ... },
  items: [{ product_id: 67, quantity: 1, ... }]
})
\`\`\`

## 🛡️ Error Handling

\`\`\`javascript
try {
  const products = await api.getAllProducts()
  console.log('Products:', products.data)
} catch (error) {
  const userMessage = api.handleError(error)
  showError(userMessage)
}
\`\`\`

## 📋 Available Methods

This client was auto-generated from the OpenAPI specification.
All ${Object.keys(spec.paths).length} endpoints are available as methods.

**IMPORTANT**: This file is regenerated automatically. Do not edit manually.
Regenerate using: \`npm run generate:client\`

For detailed API documentation, visit: http://localhost:3000/api-docs
`
}

/**
 * Main execution
 */
async function main() {
  await generateApiClient()
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { generateApiClient }
