#!/usr/bin/env node

/**
 * Verify OpenAPI Annotations Synchronization
 * Compares implemented routes with documented endpoints
 *
 * Enhanced version that detects nested routes and mounted sub-routers
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

/**
 * Route mounting configuration from app.js
 */
const ROUTE_MOUNTS = {
  productRoutes: '/api/products',
  productImageRoutes: '/api/products', // Nested under products in app.js
  orderRoutes: '/api/orders',
  userRoutes: '/api/users',
  paymentRoutes: '/api/payments',
  paymentMethodRoutes: '/api/payment-methods',
  occasionRoutes: '/api/occasions',
  settingsRoutes: '/api/settings',
  adminSettingsRoutes: '/api/admin/settings',
  migrationRoutes: '/api/migration'
}

/**
 * Get all route files recursively
 */
async function getRouteFiles(dir = 'api/routes') {
  const fullDir = path.join(rootDir, dir)
  const entries = await fs.readdir(fullDir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      const subFiles = await getRouteFiles(fullPath)
      files.push(...subFiles)
    } else if (entry.name.endsWith('.js')) {
      files.push(fullPath)
    }
  }

  return files
}

/**
 * Extract routes from a single route file
 */
async function extractRoutesFromFile(file) {
  const content = await fs.readFile(path.join(rootDir, file), 'utf-8')
  const routes = []

  // Extract router.METHOD(path, ...) patterns
  // More robust regex that handles multiline and various quote styles
  const routeRegex = /router\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g
  let match

  while ((match = routeRegex.exec(content)) !== null) {
    const method = match[1].toUpperCase()
    let routePath = match[2]

    // Convert Express params (:id) to OpenAPI params ({id})
    routePath = routePath.replace(/:(\w+)/g, '{$1}')

    routes.push({
      method,
      path: routePath,
      file
    })
  }

  return routes
}

/**
 * Determine base path for a route file
 */
function getBasePath(file) {
  const fileName = path.basename(file, '.js')

  // Check for admin routes
  if (file.includes('routes/admin/')) {
    if (fileName === 'settingsRoutes') {
      return '/api/admin/settings'
    }
    return `/api/admin/${fileName.replace('Routes', '')}`
  }

  // Standard route mapping
  const routeKey = fileName
  return ROUTE_MOUNTS[routeKey] || `/api/${fileName.replace('Routes', '')}`
}

/**
 * Extract routes from all route files
 */
async function extractRoutesFromFiles() {
  const routeFiles = await getRouteFiles()
  const allRoutes = []

  for (const file of routeFiles) {
    const fileRoutes = await extractRoutesFromFile(file)
    const basePath = getBasePath(file)

    for (const route of fileRoutes) {
      // Build full path
      const fullPath = route.path === '/' ? basePath : basePath + route.path

      allRoutes.push({
        method: route.method,
        path: fullPath,
        file,
        localPath: route.path
      })
    }
  }

  return allRoutes
}

/**
 * Extract endpoints from OpenAPI spec
 */
async function extractEndpointsFromSpec() {
  const specPath = path.join(rootDir, 'api/docs/openapi-spec.json')
  const specContent = await fs.readFile(specPath, 'utf-8')
  const spec = JSON.parse(specContent)

  const endpoints = []

  for (const [path, methods] of Object.entries(spec.paths || {})) {
    for (const [method, details] of Object.entries(methods)) {
      if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
        endpoints.push({
          method: method.toUpperCase(),
          path,
          summary: details.summary,
          tags: details.tags || []
        })
      }
    }
  }

  return endpoints
}

/**
 * Compare routes with documented endpoints
 */
async function compareRoutesAndDocs() {
  console.log('🔍 Verifying OpenAPI synchronization...\n')

  const implementedRoutes = await extractRoutesFromFiles()
  const documentedEndpoints = await extractEndpointsFromSpec()

  console.log(`📊 Found ${implementedRoutes.length} implemented routes`)
  console.log(`📚 Found ${documentedEndpoints.length} documented endpoints\n`)

  // Create maps for comparison
  const implementedMap = new Map()
  const documentedMap = new Map()

  implementedRoutes.forEach(route => {
    const key = `${route.method} ${route.path}`
    implementedMap.set(key, route)
  })

  documentedEndpoints.forEach(endpoint => {
    const key = `${endpoint.method} ${endpoint.path}`
    documentedMap.set(key, endpoint)
  })

  // Find discrepancies
  const undocumented = []
  const documented = []
  const matched = []

  for (const [key, route] of implementedMap) {
    if (!documentedMap.has(key)) {
      undocumented.push({ key, ...route })
    } else {
      matched.push({ key, ...route })
    }
  }

  for (const [key, endpoint] of documentedMap) {
    if (!implementedMap.has(key)) {
      documented.push({ key, ...endpoint })
    }
  }

  // Print results
  console.log('='.repeat(80))
  console.log('📋 SYNCHRONIZATION REPORT')
  console.log('='.repeat(80))

  console.log(`\n✅ Matched: ${matched.length}`)
  console.log(`⚠️  Implemented but not documented: ${undocumented.length}`)
  console.log(`⚠️  Documented but not implemented: ${documented.length}`)

  if (undocumented.length > 0) {
    console.log('\n' + '='.repeat(80))
    console.log('❌ IMPLEMENTED BUT NOT DOCUMENTED')
    console.log('='.repeat(80))
    undocumented.forEach(route => {
      console.log(`  ${route.key}`)
      console.log(`    File: ${route.file}`)
    })
  }

  if (documented.length > 0) {
    console.log('\n' + '='.repeat(80))
    console.log('⚠️  DOCUMENTED BUT NOT IMPLEMENTED')
    console.log('='.repeat(80))
    documented.forEach(endpoint => {
      console.log(`  ${endpoint.key}`)
      console.log(`    Tags: ${endpoint.tags.join(', ')}`)
      console.log(`    Summary: ${endpoint.summary}`)
    })
  }

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      implemented: implementedRoutes.length,
      documented: documentedEndpoints.length,
      matched: matched.length,
      undocumented: undocumented.length,
      documentedButNotImplemented: documented.length
    },
    undocumented: undocumented.map(r => ({ method: r.method, path: r.path, file: r.file })),
    documentedButNotImplemented: documented.map(e => ({
      method: e.method,
      path: e.path,
      tags: e.tags,
      summary: e.summary
    })),
    matched: matched.map(r => ({ method: r.method, path: r.path }))
  }

  const reportPath = path.join(rootDir, 'api/docs/openapi-sync-report.json')
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
  console.log(`\n📄 Detailed report saved: ${reportPath}`)

  console.log('\n' + '='.repeat(80))

  if (undocumented.length === 0 && documented.length === 0) {
    console.log('✅ OpenAPI annotations are synchronized with implementation!')
    return 0
  } else {
    console.log('⚠️  Found synchronization issues. Please review and fix.')
    return 1
  }
}

// Run verification
compareRoutesAndDocs()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error('❌ Verification failed:', error)
    process.exit(1)
  })
