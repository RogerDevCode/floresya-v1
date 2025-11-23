#!/usr/bin/env node
// @ts-nocheck

/**
 * Script completo para ejecutar todos los tests y generar reporte de fallos
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
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
}

console.log('\n' + '═'.repeat(80))
console.log(`${COLORS.magenta}🧪 RUNNING ALL TESTS AND GENERATING REPORT${COLORS.reset}`)
console.log('═'.repeat(80) + '\n')

const report = {
  timestamp: new Date().toISOString(),
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    successRate: 0
  },
  failures: [],
  repairs: []
}

function addTestResult(name, status, output, error) {
  report.tests.push({
    name,
    status,
    output: output?.substring(0, 500),
    error: error?.substring(0, 500)
  })

  report.summary.total++

  if (status === 'PASSED') {
    report.summary.passed++
    console.log(`${COLORS.green}  ✅ PASSED${COLORS.reset}`)
  } else {
    report.summary.failed++
    console.log(`${COLORS.red}  ❌ FAILED${COLORS.reset}`)

    report.failures.push({
      test: name,
      error: error?.substring(0, 300),
      output: output?.substring(0, 300)
    })

    // Agregar reparaciones sugeridas
    if (error?.includes('404')) {
      report.repairs.push({
        type: 'FILE_NOT_FOUND',
        test: name,
        description: 'Archivo no encontrado (404)',
        solution: 'Verificar que el archivo existe en la ruta especificada'
      })
    }

    if (error?.includes('SyntaxError')) {
      report.repairs.push({
        type: 'SYNTAX_ERROR',
        test: name,
        description: 'Error de sintaxis en JavaScript',
        solution: 'Verificar sintaxis en el archivo JavaScript'
      })
    }

    if (error?.includes('timeout')) {
      report.repairs.push({
        type: 'TIMEOUT',
        test: name,
        description: 'Test agotó el tiempo de espera',
        solution: 'Aumentar timeout o verificar que el servidor esté corriendo'
      })
    }
  }

  report.summary.successRate = ((report.summary.passed / report.summary.total) * 100).toFixed(1)
}

// Lista de tests a ejecutar
const testSuites = [
  {
    name: 'DOM Validation',
    pattern: 'tests/e2e/pages-loading-comprehensive.test.js',
    script: 'scripts/run-dom-validation-tests.js'
  },
  {
    name: 'JavaScript Chain Validation',
    pattern: 'tests/e2e/javascript-loading-chain.test.js',
    script: 'scripts/run-js-chain-validation.js'
  }
]

// Ejecutar cada suite
for (const suite of testSuites) {
  console.log(`\n${COLORS.blue}▶ ${suite.name}${COLORS.reset}`)
  console.log(`  Pattern: ${suite.pattern}`)
  console.log(`  Script: ${suite.script}\n`)

  try {
    const output = execSync(`node ${suite.script}`, {
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 300000 // Aumentado a 5 minutos
    })

    addTestResult(suite.name, 'PASSED', output)
    console.log(output.substring(0, 1000))
  } catch (error) {
    addTestResult(suite.name, 'FAILED', error.stdout, error.message)
    console.error(error.stdout?.substring(0, 1000) || error.message)
  }

  console.log('')
}

// También ejecutar tests individuales para mayor detalle
console.log('\n' + '-'.repeat(80))
console.log(`${COLORS.cyan}Running individual tests for detailed analysis...${COLORS.reset}\n`)

const individualTests = [
  'tests/e2e/homepage-dom.test.js',
  'tests/e2e/javascript-dom-ready.test.js',
  'tests/e2e/static-html-validation.test.js'
]

for (const testFile of individualTests) {
  const testName = path.basename(testFile)
  console.log(`\n${COLORS.yellow}▶ ${testName}${COLORS.reset}`)

  try {
    const output = execSync(`npx playwright test "${testFile}" --reporter=list`, {
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 180000 // Aumentado a 3 minutos
    })

    addTestResult(testName, 'PASSED', output)
  } catch (error) {
    addTestResult(testName, 'FAILED', error.stdout, error.message)
    console.error(error.stdout?.substring(0, 500))
  }
}

// Generar reportes
console.log('\n' + '═'.repeat(80))
console.log(`${COLORS.cyan}GENERATING REPORTS${COLORS.reset}`)
console.log('═'.repeat(80) + '\n')

// HTML Report
const htmlReport = generateHtmlReport(report)
fs.writeFileSync(path.join(__dirname, '../full-test-report.html'), htmlReport)
console.log(`${COLORS.green}📄 HTML Report: full-test-report.html${COLORS.reset}`)

// Console Report
const consoleReport = generateConsoleReport(report)
fs.writeFileSync(path.join(__dirname, '../full-test-report.txt'), consoleReport)
console.log(`${COLORS.green}📄 Console Report: full-test-report.txt${COLORS.reset}`)

// Failures Report
if (report.failures.length > 0) {
  const failuresReport = generateFailuresReport(report)
  fs.writeFileSync(path.join(__dirname, '../failures-report.txt'), failuresReport)
  console.log(`${COLORS.yellow}📄 Failures Report: failures-report.txt${COLORS.reset}`)
}

// Repairs Report
if (report.repairs.length > 0) {
  const repairsReport = generateRepairsReport(report)
  fs.writeFileSync(path.join(__dirname, '../repairs-required.txt'), repairsReport)
  console.log(`${COLORS.yellow}📄 Repairs Report: repairs-required.txt${COLORS.reset}`)
}

// Resumen final
console.log('\n' + '═'.repeat(80))
console.log(`${COLORS.magenta}📊 FINAL SUMMARY${COLORS.reset}`)
console.log('═'.repeat(80))
console.log(`Total Tests: ${report.summary.total}`)
console.log(`Passed: ${COLORS.green}${report.summary.passed}${COLORS.reset}`)
console.log(`Failed: ${COLORS.red}${report.summary.failed}${COLORS.reset}`)
console.log(`Success Rate: ${report.summary.successRate}%`)
console.log('')

if (report.summary.failed > 0) {
  console.log(
    `${COLORS.red}⚠️  REPAIRS REQUIRED: ${report.repairs.length} issues found${COLORS.reset}\n`
  )
  report.repairs.forEach((repair, i) => {
    console.log(`${i + 1}. [${repair.type}] ${repair.description}`)
    console.log(`   Solution: ${repair.solution}\n`)
  })
} else {
  console.log(`${COLORS.green}✅ All tests passed! No repairs required.${COLORS.reset}\n`)
}

function generateHtmlReport(report) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Full Test Report - ${report.timestamp}</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { background: #667eea; color: white; padding: 20px; border-radius: 8px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .card { flex: 1; padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .test-item { margin: 15px 0; padding: 15px; background: #fff; border-left: 4px solid #667eea; border-radius: 4px; }
        .failure { border-left-color: #dc3545; }
        .repair-section { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📋 Full Test Report</h1>
        <p>Generated: ${report.timestamp}</p>
    </div>

    <div class="summary">
        <div class="card">
            <h2>Total</h2>
            <h3>${report.summary.total}</h3>
        </div>
        <div class="card passed">
            <h2>Passed</h2>
            <h3>${report.summary.passed}</h3>
        </div>
        <div class="card failed">
            <h2>Failed</h2>
            <h3>${report.summary.failed}</h3>
        </div>
        <div class="card">
            <h2>Success Rate</h2>
            <h3>${report.summary.successRate}%</h3>
        </div>
    </div>

    <h2>Test Results</h2>
    ${report.tests
      .map(
        test => `
        <div class="test-item ${test.status === 'FAILED' ? 'failure' : ''}">
            <h3>${test.name}</h3>
            <p><strong>Status:</strong> ${test.status}</p>
            ${test.error ? `<p><strong>Error:</strong> ${test.error}</p>` : ''}
        </div>
    `
      )
      .join('')}

    ${
      report.repairs.length > 0
        ? `
        <div class="repair-section">
            <h2>⚠️ Repairs Required</h2>
            ${report.repairs
              .map(
                repair => `
                <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px;">
                    <h4>[${repair.type}] ${repair.description}</h4>
                    <p><strong>Test:</strong> ${repair.test}</p>
                    <p><strong>Solution:</strong> ${repair.solution}</p>
                </div>
            `
              )
              .join('')}
        </div>
    `
        : '<div style="color: green; font-weight: bold;">✅ No repairs required!</div>'
    }
</body>
</html>
  `
}

function generateConsoleReport(report) {
  return `
═══════════════════════════════════════════════════════════════════════════════
                          📋 FULL TEST REPORT
═══════════════════════════════════════════════════════════════════════════════

Generated: ${report.timestamp}

SUMMARY
───────────────────────────────────────────────────────────────────────────────
Total Tests: ${report.summary.total}
Passed: ${report.summary.passed}
Failed: ${report.summary.failed}
Success Rate: ${report.summary.successRate}%

TEST RESULTS
───────────────────────────────────────────────────────────────────────────────

${report.tests
  .map(
    test => `
${test.name}
Status: ${test.status}
${test.error ? `Error: ${test.error.substring(0, 200)}` : ''}
`
  )
  .join('')}

${
  report.summary.failed > 0
    ? `
FAILURES
───────────────────────────────────────────────────────────────────────────────

${report.failures
  .map(
    f => `
Test: ${f.test}
Error: ${f.error?.substring(0, 300)}
`
  )
  .join('')}
`
    : '✅ All tests passed!'
}

═══════════════════════════════════════════════════════════════════════════════
`
}

function generateFailuresReport(report) {
  return `
═══════════════════════════════════════════════════════════════════════════════
                              FAILURES REPORT
═══════════════════════════════════════════════════════════════════════════════

Total Failures: ${report.failures.length}

${report.failures
  .map(
    (failure, i) => `
${i + 1}. TEST: ${failure.test}
   ERROR: ${failure.error?.substring(0, 500)}
   OUTPUT: ${failure.output?.substring(0, 500)}
`
  )
  .join('')}

═══════════════════════════════════════════════════════════════════════════════
`
}

function generateRepairsReport(report) {
  return `
═══════════════════════════════════════════════════════════════════════════════
                            REPAIRS REQUIRED
═══════════════════════════════════════════════════════════════════════════════

Total Issues: ${report.repairs.length}

${report.repairs
  .map(
    (repair, i) => `
${i + 1}. TYPE: ${repair.type}
   TEST: ${repair.test}
   DESCRIPTION: ${repair.description}
   SOLUTION: ${repair.solution}

`
  )
  .join('')}

═══════════════════════════════════════════════════════════════════════════════
`
}

process.exit(report.summary.failed > 0 ? 1 : 0)
