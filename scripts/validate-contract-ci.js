#!/usr/bin/env node

/**
 * OpenAPI Contract Validation for CI/CD
 * Validates contract compliance in automated environments
 * Exits with appropriate codes for CI/CD pipelines
 */

import { generateOpenApiSpec, validateContractCompliance } from './generate-openapi-spec.js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * CI/CD Contract Validation
 */
async function validateContractForCI() {
  const results = {
    timestamp: new Date().toISOString(),
    success: true,
    checks: [],
    summary: {}
  }

  try {
    console.log('🔬 Starting CI/CD contract validation...\n')

    // Check 1: Generate OpenAPI specification
    console.log('📝 Check 1: Generating OpenAPI specification...')
    try {
      const generationSummary = await generateOpenApiSpec()
      results.checks.push({
        name: 'openapi_generation',
        status: 'PASS',
        details: generationSummary
      })
      results.summary = { ...results.summary, ...generationSummary }
    } catch (error) {
      results.checks.push({
        name: 'openapi_generation',
        status: 'FAIL',
        error: error.message
      })
      results.success = false
      throw error
    }

    // Check 2: Validate contract compliance
    console.log('🔍 Check 2: Validating contract compliance...')
    try {
      const validation = await validateContractCompliance()
      results.checks.push({
        name: 'contract_compliance',
        status: validation.valid ? 'PASS' : 'WARN',
        details: validation
      })

      if (!validation.valid) {
        results.success = false
        console.warn('⚠️  Contract compliance issues found:', validation.error)
      }
    } catch (error) {
      results.checks.push({
        name: 'contract_compliance',
        status: 'FAIL',
        error: error.message
      })
      results.success = false
    }

    // Check 3: Validate specification structure
    console.log('🏗️  Check 3: Validating specification structure...')
    try {
      const specPath = path.join(__dirname, '../api/docs/openapi-spec.json')
      const specContent = await fs.readFile(specPath, 'utf8')
      const spec = JSON.parse(specContent)

      // Required OpenAPI fields
      const requiredFields = ['openapi', 'info', 'paths']
      const missingFields = requiredFields.filter(field => !spec[field])

      if (missingFields.length > 0) {
        throw new Error(`Missing required OpenAPI fields: ${missingFields.join(', ')}`)
      }

      // Check for minimum endpoints
      if (Object.keys(spec.paths).length < 5) {
        throw new Error(
          `Too few endpoints defined: ${Object.keys(spec.paths).length}. Expected at least 5.`
        )
      }

      results.checks.push({
        name: 'specification_structure',
        status: 'PASS',
        details: {
          endpoints: Object.keys(spec.paths).length,
          schemas: Object.keys(spec.components?.schemas || {}).length,
          version: spec.info.version
        }
      })
    } catch (error) {
      results.checks.push({
        name: 'specification_structure',
        status: 'FAIL',
        error: error.message
      })
      results.success = false
    }

    // Check 4: Validate annotations quality
    console.log('📋 Check 4: Validating annotations quality...')
    try {
      const annotationsPath = path.join(__dirname, '../api/docs/openapi-annotations.js')
      const annotationsContent = await fs.readFile(annotationsPath, 'utf8')

      // Check for common annotation patterns (FIXED: corrected regex patterns)
      const hasSwaggerAnnotations =
        annotationsContent.includes('/**') && annotationsContent.includes('@swagger')
      const hasEndpointAnnotations =
        annotationsContent.includes('/api/') &&
        /\s+(get|post|put|patch|delete):/i.test(annotationsContent)
      const hasResponseDefinitions =
        annotationsContent.includes('responses:') && annotationsContent.includes('200:')

      if (!hasSwaggerAnnotations || !hasEndpointAnnotations || !hasResponseDefinitions) {
        throw new Error('Incomplete or missing JSDoc annotations')
      }

      results.checks.push({
        name: 'annotations_quality',
        status: 'PASS',
        details: {
          hasSwaggerAnnotations,
          hasEndpointAnnotations,
          hasResponseDefinitions,
          annotationLines: annotationsContent.split('\n').length
        }
      })
    } catch (error) {
      results.checks.push({
        name: 'annotations_quality',
        status: 'FAIL',
        error: error.message
      })
      results.success = false
    }

    // Generate final report
    await generateCIReport(results)

    // Exit with appropriate code
    if (results.success) {
      console.log('\n✅ All CI/CD contract validations passed!')
      process.exit(0)
    } else {
      console.log('\n❌ Some CI/CD contract validations failed!')
      process.exit(1)
    }
  } catch (error) {
    console.error('\n💥 CI/CD contract validation failed:', error)
    results.success = false
    results.error = error.message

    await generateCIReport(results)
    process.exit(1)
  }
}

/**
 * Generate CI/CD report
 */
async function generateCIReport(results) {
  try {
    const reportPath = path.join(__dirname, '../api/docs/ci-contract-report.json')
    await fs.writeFile(reportPath, JSON.stringify(results, null, 2))

    console.log(`📊 CI/CD report saved to: ${reportPath}`)

    // Also save a simplified version for easy parsing
    const simpleReport = {
      success: results.success,
      timestamp: results.timestamp,
      summary: results.summary,
      totalChecks: results.checks.length,
      passedChecks: results.checks.filter(c => c.status === 'PASS').length,
      failedChecks: results.checks.filter(c => c.status === 'FAIL').length,
      warningChecks: results.checks.filter(c => c.status === 'WARN').length
    }

    const simpleReportPath = path.join(__dirname, '../api/docs/ci-report-simple.json')
    await fs.writeFile(simpleReportPath, JSON.stringify(simpleReport, null, 2))
  } catch (error) {
    console.error('Failed to generate CI report:', error)
  }
}

/**
 * Main execution function
 */
async function main() {
  await validateContractForCI()
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { validateContractForCI, generateCIReport }
