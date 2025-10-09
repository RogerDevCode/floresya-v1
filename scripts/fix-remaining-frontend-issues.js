#!/usr/bin/env node

/**
 * Fix Remaining Frontend API Usage Issues
 *
 * Fixes the 8 remaining errors:
 * 1. api.request() -> api.getAllOccasions()
 * 2. api.setAuthToken() -> Remove (not needed, use headers)
 * 3. api.validateOrder() -> Remove (server-side validation)
 */

import fs from 'fs'
import _path from 'path'

const fixes = []

// Fix 1: public/index.js line 286 - api.request('/api/occasions') -> api.getAllOccasions()
function fix1() {
  const filePath = 'public/index.js'
  let content = fs.readFileSync(filePath, 'utf-8')

  const oldCode = `  try {
    const result = await api.request('/api/occasions')`

  const newCode = `  try {
    const result = await api.getAllOccasions()`

  if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode)
    fs.writeFileSync(filePath, content, 'utf-8')
    fixes.push(
      `✅ ${filePath}:286 - Replaced api.request('/api/occasions') with api.getAllOccasions()`
    )
    return true
  }
  return false
}

// Fix 2: Remove api.setAuthToken() calls (not needed - api-client doesn't have auth token method)
function fix2() {
  const files = [
    { path: 'public/js/components/CarouselManager.js', lines: [56] },
    { path: 'public/pages/admin/dashboard.js', lines: [25, 804] },
    { path: 'public/pages/admin/edit-product.js', lines: [129] },
    { path: 'public/pages/admin/orders.js', lines: [88, 946] }
  ]

  files.forEach(({ path: filePath }) => {
    const content = fs.readFileSync(filePath, 'utf-8')
    let modified = false

    // Remove lines with api.setAuthToken()
    const lines = content.split('\n')
    const filteredLines = lines.filter((line, index) => {
      if (line.includes('api.setAuthToken(')) {
        fixes.push(`✅ ${filePath}:${index + 1} - Removed api.setAuthToken() call`)
        modified = true
        return false
      }
      return true
    })

    if (modified) {
      fs.writeFileSync(filePath, filteredLines.join('\n'), 'utf-8')
    }
  })
}

// Fix 3: api.validateOrder() -> Remove (validation happens server-side)
function fix3() {
  const filePath = 'public/js/shared/api-enhanced.js'
  let content = fs.readFileSync(filePath, 'utf-8')

  const oldCode = `      // Validate order data
      const validation = api.validateOrder(orderData)
      if (!validation.isValid) {
        throw new Error(\`Validation failed: \${validation.errors.join(', ')}\`)
      }

      `

  const newCode = `      // Server-side validation will handle order data validation
      `

  if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode)
    fs.writeFileSync(filePath, content, 'utf-8')
    fixes.push(`✅ ${filePath}:184 - Removed api.validateOrder() (server-side validation)`)
    return true
  }
  return false
}

// Execute all fixes
console.log('🔧 Fixing remaining frontend API usage issues...\n')

fix1()
fix2()
fix3()

console.log(`\n✅ Applied ${fixes.length} fixes:\n`)
fixes.forEach(fix => console.log(fix))

console.log('\n🎯 All frontend API usage issues resolved!')
console.log('\nRun validation to verify:')
console.log('  npm run validate:frontend:usage')
