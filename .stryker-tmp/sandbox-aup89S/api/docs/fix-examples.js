#!/usr/bin/env node
// @ts-nocheck

/**
 * Procesado por B
 */

/**
 * Script to fix missing example values in schema templates
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const schemaPath = join(__dirname, 'schema-templates.js')

// Read current file
let content = readFileSync(schemaPath, 'utf8')

// Add missing examples for all date-time fields
const fixes = [
  // User schema
  {
    pattern: /(email_verified: \{ type: 'boolean', example: false \})/,
    replacement:
      "$1,\n    created_at: { type: 'string', format: 'date-time', example: '2025-01-01T10:00:00Z' },\n    updated_at: { type: 'string', format: 'date-time', example: '2025-01-01T10:00:00Z' }"
  },

  // Product schema
  {
    pattern: /(active: \{ type: 'boolean', example: true \})/,
    replacement:
      "$1,\n    created_at: { type: 'string', format: 'date-time', example: '2025-01-01T10:00:00Z' },\n    updated_at: { type: 'string', format: 'date-time', example: '2025-01-01T10:00:00Z' }"
  },

  // Occasion schema
  {
    pattern: /(active: \{ type: 'boolean', example: true \})/,
    replacement:
      "$1,\n    created_at: { type: 'string', format: 'date-time', example: '2025-01-01T10:00:00Z' },\n    updated_at: { type: 'string', format: 'date-time', example: '2025-01-01T10:00:00Z' }"
  },

  // Product image schema
  {
    pattern: /(is_primary: \{ type: 'boolean', example: false \})/,
    replacement:
      "$1,\n    created_at: { type: 'string', format: 'date-time', example: '2025-01-01T10:00:00Z' },\n    updated_at: { type: 'string', format: 'date-time', example: '2025-01-01T10:00:00Z' }"
  },

  // Order schema
  {
    pattern: /(admin_notes: \{ type: 'string', example: 'Cliente frecuente' \})/,
    replacement:
      "$1,\n    created_at: { type: 'string', format: 'date-time', example: '2025-01-01T10:00:00Z' },\n    updated_at: { type: 'string', format: 'date-time', example: '2025-01-01T10:00:00Z' }"
  },

  // Order item schema
  {
    pattern: /(subtotal_ves: \{ type: 'number', format: 'decimal', example: 3679.2 \})/,
    replacement:
      "$1,\n    created_at: { type: 'string', format: 'date-time', example: '2025-01-01T10:00:00Z' },\n    updated_at: { type: 'string', format: 'date-time', example: '2025-01-01T10:00:00Z' }"
  },

  // Payment schema
  {
    pattern: /(status: \{[\s\S]*?example: 'pending'[\s\S]*?\})/,
    replacement:
      "$1,\n    created_at: { type: 'string', format: 'date-time', example: '2025-01-01T10:00:00Z' },\n    updated_at: { type: 'string', format: 'date-time', example: '2025-01-01T10:00:00Z' }"
  },

  // Settings schema
  {
    pattern: /(is_public: \{ type: 'boolean', example: true \})/,
    replacement:
      "$1,\n    created_at: { type: 'string', format: 'date-time', example: '2025-01-01T10:00:00Z' },\n    updated_at: { type: 'string', format: 'date-time', example: '2025-01-01T10:00:00Z' }"
  },

  // Pagination params schema
  {
    pattern: /(page: \{ type: 'integer', minimum: 1 \})/,
    replacement:
      "$1,\n    limit: { type: 'integer', minimum: 1, maximum: 100, default: 10, example: 10 },\n    offset: { type: 'integer', minimum: 0, default: 0, example: 0 }"
  }
]

// Apply fixes
fixes.forEach(fix => {
  content = content.replace(fix.pattern, fix.replacement)
})

// Write back to file
writeFileSync(schemaPath, content)

console.log('✅ Fixed missing example values in schema templates')
console.log('🔄 Regenerating documentation...')

// Now regenerate the documentation
const { execSync } = await import('child_process')
try {
  execSync('node api/docs/generate-documentation.js', { cwd: join(__dirname, '..', '..') })
  console.log('✅ Documentation regenerated successfully')
} catch (error) {
  console.error('❌ Error regenerating documentation:', error.message)
}
