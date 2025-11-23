#!/usr/bin/env node
// @ts-nocheck

/**
 * Script para ejecutar todos los tests de validación de DOM
 * y generar un reporte completo de la carga de páginas
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

console.log('\n' + '='.repeat(80))
console.log(`${COLORS.cyan}🧪 DOM VALIDATION TEST RUNNER${COLORS.reset}`)
console.log('='.repeat(80) + '\n')

const tests = [
  { file: 'tests/e2e/pages-loading-comprehensive.test.js', name: 'Comprehensive Pages Loading' },
  { file: 'tests/e2e/resources-loading.test.js', name: 'Resources Loading' },
  { file: 'tests/e2e/homepage-dom.test.js', name: 'Homepage DOM' },
  { file: 'tests/e2e/cart-dom.test.js', name: 'Cart Page DOM' },
  { file: 'tests/e2e/product-detail-dom.test.js', name: 'Product Detail DOM' },
  { file: 'tests/e2e/admin-pages-dom.test.js', name: 'Admin Pages DOM' },
  { file: 'tests/e2e/other-pages-dom.test.js', name: 'Other Pages DOM' }
]

let totalPassed = 0
let totalFailed = 0
const results = []

for (const test of tests) {
  console.log(`${COLORS.blue}📄 Running: ${test.name}${COLORS.reset}`)
  console.log(`   File: ${test.file}`)

  try {
    const output = execSync(`npx playwright test ${test.file} --reporter=list`, {
      encoding: 'utf-8',
      stdio: 'pipe'
    })

    console.log(`${COLORS.green}✅ PASSED${COLORS.reset}`)
    console.log(output)
    totalPassed++
    results.push({ test: test.name, status: 'PASSED' })
  } catch (error) {
    console.log(`${COLORS.red}❌ FAILED${COLORS.reset}`)
    console.error(error.stdout || error.message)
    totalFailed++
    results.push({ test: test.name, status: 'FAILED', error: error.message })
  }

  console.log('')
}

console.log('\n' + '='.repeat(80))
console.log(`${COLORS.cyan}📊 FINAL RESULTS${COLORS.reset}`)
console.log('='.repeat(80) + '\n')

console.log(`${COLORS.green}✅ Passed: ${totalPassed}${COLORS.reset}`)
console.log(`${COLORS.red}❌ Failed: ${totalFailed}${COLORS.reset}`)
console.log(`📋 Total: ${tests.length}`)

const successRate = ((totalPassed / tests.length) * 100).toFixed(1)
console.log(`\n${COLORS.cyan}Success Rate: ${successRate}%${COLORS.reset}\n`)

if (totalFailed > 0) {
  console.log(`${COLORS.red}Failed Tests:${COLORS.reset}`)
  results
    .filter(r => r.status === 'FAILED')
    .forEach(r => {
      console.log(`  - ${r.test}`)
    })
  console.log('')
}

// Generar reporte HTML
const reportHtml = generateHtmlReport(results, totalPassed, totalFailed)
fs.writeFileSync(path.join(__dirname, '../dom-validation-report.html'), reportHtml)

console.log(`${COLORS.green}📄 Report generated: dom-validation-report.html${COLORS.reset}\n`)

function generateHtmlReport(results, passed, failed) {
  const timestamp = new Date().toISOString()
  const successRate = ((passed / (passed + failed)) * 100).toFixed(1)

  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DOM Validation Report - ${timestamp}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }

        .stats {
            display: flex;
            justify-content: space-around;
            padding: 40px;
            background: #f8f9fa;
        }

        .stat-card {
            text-align: center;
            flex: 1;
        }

        .stat-card .number {
            font-size: 3em;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .stat-card.passed .number {
            color: #28a745;
        }

        .stat-card.failed .number {
            color: #dc3545;
        }

        .stat-card.total .number {
            color: #6c757d;
        }

        .stat-card .label {
            font-size: 1.1em;
            color: #6c757d;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .results {
            padding: 40px;
        }

        .results h2 {
            margin-bottom: 20px;
            color: #343a40;
        }

        .test-item {
            padding: 20px;
            margin-bottom: 15px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .test-item.passed {
            background: #d4edda;
            border-left: 5px solid #28a745;
        }

        .test-item.failed {
            background: #f8d7da;
            border-left: 5px solid #dc3545;
        }

        .test-item .icon {
            font-size: 2em;
        }

        .test-item.passed .icon {
            color: #28a745;
        }

        .test-item.failed .icon {
            color: #dc3545;
        }

        .test-item .name {
            flex: 1;
            font-size: 1.2em;
            font-weight: 500;
        }

        .test-item .status {
            font-weight: bold;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
        }

        .test-item.passed .status {
            background: #28a745;
            color: white;
        }

        .test-item.failed .status {
            background: #dc3545;
            color: white;
        }

        .footer {
            padding: 20px 40px;
            background: #f8f9fa;
            text-align: center;
            color: #6c757d;
            border-top: 1px solid #dee2e6;
        }

        .success-rate {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 8px;
        }

        .success-rate .rate {
            font-size: 4em;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 DOM Validation Report</h1>
            <p>Comprehensive DOM Loading and Integrity Tests</p>
            <p style="margin-top: 10px; font-size: 0.9em;">Generated: ${timestamp}</p>
        </div>

        <div class="stats">
            <div class="stat-card passed">
                <div class="number">${passed}</div>
                <div class="label">Passed</div>
            </div>
            <div class="stat-card failed">
                <div class="number">${failed}</div>
                <div class="label">Failed</div>
            </div>
            <div class="stat-card total">
                <div class="number">${passed + failed}</div>
                <div class="label">Total Tests</div>
            </div>
        </div>

        <div class="success-rate">
            <div>Success Rate</div>
            <div class="rate">${successRate}%</div>
        </div>

        <div class="results">
            <h2>Test Results</h2>
            ${results
              .map(
                result => `
                <div class="test-item ${result.status.toLowerCase()}">
                    <div class="icon">${result.status === 'PASSED' ? '✅' : '❌'}</div>
                    <div class="name">${result.test}</div>
                    <div class="status">${result.status}</div>
                </div>
            `
              )
              .join('')}
        </div>

        <div class="footer">
            <p>Generated by DOM Validation Test Runner</p>
            <p style="margin-top: 10px; font-size: 0.9em;">
                This report validates that all HTML pages load correctly without errors,
                broken references, or DOM structure issues.
            </p>
        </div>
    </div>
</body>
</html>`
}

// Exit with appropriate code
process.exit(totalFailed > 0 ? 1 : 0)
