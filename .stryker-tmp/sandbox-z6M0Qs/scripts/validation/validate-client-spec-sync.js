#!/usr/bin/env node
// @ts-nocheck

/**
 * Client-Spec Synchronization Validator
 * Validates that generated API client is 100% synchronized with OpenAPI spec
 * Ensures no drift between spec and implementation
 *
 * Principles: KISS, Fail-Fast, SSOT
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Main validation function
 */
async function validateClientSpecSync() {
  const results = {
    timestamp: new Date().toISOString(),
    valid: true,
    issues: [],
    warnings: [],
    summary: {
      specEndpoints: 0,
      clientMethods: 0,
      coverage: 0,
      orphanedEndpoints: [],
      missingMethods: [],
      extraMethods: []
    }
  }

  try {
    console.log('🔍 Validating API client ↔ OpenAPI spec synchronization...\n')

    // Load OpenAPI spec
    const specPath = path.resolve(__dirname, '../../api/docs/openapi-spec.json')
    const spec = JSON.parse(await fs.readFile(specPath, 'utf8'))

    // Load generated API client
    const clientPath = path.resolve(__dirname, '../../public/js/shared/api-client.js')
    const clientContent = await fs.readFile(clientPath, 'utf8')

    // Extract endpoints from spec
    const specEndpoints = extractEndpointsFromSpec(spec)
    results.summary.specEndpoints = specEndpoints.length

    // Extract methods from client
    const clientMethods = extractMethodsFromClient(clientContent)
    results.summary.clientMethods = clientMethods.length

    console.log(`📋 OpenAPI Spec: ${specEndpoints.length} endpoints`)
    console.log(`🔧 API Client: ${clientMethods.length} methods\n`)

    // Validation 1: Check if all spec endpoints have corresponding client methods
    console.log('✓ Check 1: Validating spec → client coverage...')
    const missingMethods = []
    for (const endpoint of specEndpoints) {
      const hasMethod = clientMethods.some(
        m => m.endpoint === endpoint.path && m.method === endpoint.method
      )
      if (!hasMethod) {
        missingMethods.push(endpoint)
        results.issues.push({
          type: 'missing_method',
          severity: 'error',
          message: `Endpoint ${endpoint.method.toUpperCase()} ${endpoint.path} has no corresponding client method`,
          endpoint: endpoint.path,
          method: endpoint.method
        })
      }
    }

    if (missingMethods.length === 0) {
      console.log('  ✅ All spec endpoints have client methods')
    } else {
      console.log(`  ❌ ${missingMethods.length} endpoints missing client methods`)
      results.valid = false
    }

    // Validation 2: Check for orphaned methods (in client but not in spec)
    console.log('✓ Check 2: Detecting orphaned client methods...')
    const orphanedMethods = []
    for (const method of clientMethods) {
      // Skip utility methods
      if (method.name === 'request' || method.name === 'handleError') {
        continue
      }

      const hasEndpoint = specEndpoints.some(
        e => e.path === method.endpoint && e.method === method.method
      )
      if (!hasEndpoint && method.endpoint && method.method) {
        orphanedMethods.push(method)
        results.warnings.push({
          type: 'orphaned_method',
          severity: 'warning',
          message: `Client method ${method.name}() does not match any spec endpoint`,
          methodName: method.name,
          endpoint: method.endpoint,
          method: method.method
        })
      }
    }

    if (orphanedMethods.length === 0) {
      console.log('  ✅ No orphaned client methods detected')
    } else {
      console.log(`  ⚠️  ${orphanedMethods.length} orphaned methods detected`)
    }

    // Validation 3: Check parameter consistency
    console.log('✓ Check 3: Validating parameter consistency...')
    const paramIssues = validateParameters(specEndpoints, clientMethods)
    if (paramIssues.length === 0) {
      console.log('  ✅ All parameters are consistent')
    } else {
      console.log(`  ⚠️  ${paramIssues.length} parameter inconsistencies`)
      results.warnings.push(...paramIssues)
    }

    // Validation 4: Check HTTP method consistency
    console.log('✓ Check 4: Validating HTTP method consistency...')
    const methodIssues = validateHttpMethods(specEndpoints, clientMethods)
    if (methodIssues.length === 0) {
      console.log('  ✅ All HTTP methods are consistent')
    } else {
      console.log(`  ❌ ${methodIssues.length} HTTP method inconsistencies`)
      results.issues.push(...methodIssues)
      results.valid = false
    }

    // Calculate coverage
    const coverage = ((specEndpoints.length - missingMethods.length) / specEndpoints.length) * 100
    results.summary.coverage = Math.round(coverage * 100) / 100
    results.summary.missingMethods = missingMethods.map(m => `${m.method.toUpperCase()} ${m.path}`)
    results.summary.orphanedMethods = orphanedMethods.map(m => m.name)

    // Generate report
    await generateSyncReport(results)

    // Print summary
    console.log('\n📊 Synchronization Summary:')
    console.log(`  Coverage: ${results.summary.coverage}%`)
    console.log(`  Errors: ${results.issues.length}`)
    console.log(`  Warnings: ${results.warnings.length}`)

    if (results.valid) {
      console.log('\n✅ API client is synchronized with OpenAPI spec!')
      process.exit(0)
    } else {
      console.log('\n❌ API client is NOT synchronized with OpenAPI spec')
      console.log('\n💡 Recommendations:')
      if (missingMethods.length > 0) {
        console.log('  - Run: npm run generate:client')
        console.log('  - Ensure all endpoints are properly annotated in OpenAPI spec')
      }
      process.exit(1)
    }
  } catch (error) {
    console.error('\n💥 Validation failed:', error)
    results.valid = false
    results.error = error.message
    await generateSyncReport(results)
    process.exit(1)
  }
}

/**
 * Extract all endpoints from OpenAPI spec
 */
function extractEndpointsFromSpec(spec) {
  const endpoints = []

  for (const [path, pathItem] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
        endpoints.push({
          path,
          method,
          operationId: operation.operationId,
          summary: operation.summary,
          parameters: operation.parameters || [],
          requestBody: operation.requestBody,
          responses: operation.responses
        })
      }
    }
  }

  return endpoints
}

/**
 * Extract all methods from generated API client
 */
function extractMethodsFromClient(clientContent) {
  const methods = []

  // Match methods with or without async keyword
  // Pattern: async methodName( or just methodName(
  const methodRegex = /(?:async\s+)?(\w+)\s*\(([^)]*)\)\s*\{/g
  let match

  while ((match = methodRegex.exec(clientContent)) !== null) {
    const methodName = match[1]
    const fullMethodString = match[0]

    // Get the rest of the method body after the opening {
    const startIndex = match.index + fullMethodString.length
    const remainingContent = clientContent.substring(startIndex)

    // Find the matching closing brace (simple approach - works for our generated code)
    let braceCount = 1
    let endIndex = 0
    for (let i = 0; i < remainingContent.length; i++) {
      if (remainingContent[i] === '{') {
        braceCount++
      }
      if (remainingContent[i] === '}') {
        braceCount--
        if (braceCount === 0) {
          endIndex = i
          break
        }
      }
    }

    const methodBody = remainingContent.substring(0, endIndex)

    // Skip utility methods and constructor
    if (methodName === 'request' || methodName === 'handleError' || methodName === 'constructor') {
      continue
    }

    // Extract endpoint from: const endpoint = `...`
    const endpointMatch = methodBody.match(/const\s+endpoint\s*=\s*`([^`]+)`/)
    if (!endpointMatch) {
      continue
    }

    let endpoint = endpointMatch[1]

    // Remove template literal variables ${...} and replace with {param}
    endpoint = endpoint.replace(/\$\{(\w+)\}/g, '{$1}')

    // Remove query string portion ({queryPart}, {query}, etc.)
    endpoint = endpoint.replace(/\{[^}]*[Pp]art\}/g, '')
    endpoint = endpoint.replace(/\{query\}/g, '')

    // Extract HTTP method from: method: 'POST'
    const httpMethodMatch = methodBody.match(/method:\s*'(\w+)'/i)
    const httpMethod = httpMethodMatch ? httpMethodMatch[1].toLowerCase() : 'get'

    methods.push({
      name: methodName,
      endpoint,
      method: httpMethod
    })
  }

  return methods
}

/**
 * Validate parameter consistency
 */
function validateParameters(specEndpoints, clientMethods) {
  const issues = []

  for (const endpoint of specEndpoints) {
    const method = clientMethods.find(
      m => m.endpoint === endpoint.path && m.method === endpoint.method
    )

    if (!method) {
      continue
    }

    // Extract path parameters from spec
    const specPathParams = (endpoint.path.match(/\{([^}]+)\}/g) || []).map(p =>
      p.replace(/[{}]/g, '')
    )

    // Extract path parameters from client endpoint
    // Note: endpoint was already normalized to {param} format in extractMethodsFromClient
    const clientPathParams = (method.endpoint.match(/\{([^}]+)\}/g) || []).map(p =>
      p.replace(/[{}]/g, '')
    )

    // Compare
    const missingParams = specPathParams.filter(p => !clientPathParams.includes(p))
    const extraParams = clientPathParams.filter(p => !specPathParams.includes(p))

    if (missingParams.length > 0) {
      issues.push({
        type: 'missing_parameter',
        severity: 'warning',
        message: `Method ${method.name}() missing parameters: ${missingParams.join(', ')}`,
        methodName: method.name,
        missingParams
      })
    }

    if (extraParams.length > 0) {
      issues.push({
        type: 'extra_parameter',
        severity: 'warning',
        message: `Method ${method.name}() has extra parameters: ${extraParams.join(', ')}`,
        methodName: method.name,
        extraParams
      })
    }
  }

  return issues
}

/**
 * Validate HTTP method consistency
 */
function validateHttpMethods(specEndpoints, clientMethods) {
  const issues = []

  for (const endpoint of specEndpoints) {
    // Find method that matches BOTH endpoint path AND HTTP method
    const method = clientMethods.find(
      m => m.endpoint === endpoint.path && m.method === endpoint.method
    )

    if (!method) {
      continue
    }

    // This check is now redundant since we're matching by method too,
    // but keep it for extra safety
    if (method.method !== endpoint.method) {
      issues.push({
        type: 'method_mismatch',
        severity: 'error',
        message: `HTTP method mismatch for ${endpoint.path}: spec=${endpoint.method.toUpperCase()}, client=${method.method.toUpperCase()}`,
        endpoint: endpoint.path,
        specMethod: endpoint.method,
        clientMethod: method.method
      })
    }
  }

  return issues
}

/**
 * Generate synchronization report
 */
async function generateSyncReport(results) {
  try {
    const reportPath = path.resolve(__dirname, '../../api/docs/client-spec-sync-report.json')
    await fs.writeFile(reportPath, JSON.stringify(results, null, 2))
    console.log(`\n📊 Sync report saved to: ${reportPath}`)
  } catch (error) {
    console.error('Failed to generate sync report:', error)
  }
}

/**
 * Main execution
 */
async function main() {
  await validateClientSpecSync()
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { validateClientSpecSync }
