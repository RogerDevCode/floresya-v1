#!/usr/bin/env node
// @ts-nocheck

/**
 * Script para generar reporte completo de todos los tests ejecutados
 * DOM Validation + JavaScript Chain Validation
 */

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
console.log(`${COLORS.magenta}📋 FULL TEST REPORT GENERATOR${COLORS.reset}`)
console.log('═'.repeat(80) + '\n')

// Definir estructura del reporte
const report = {
  timestamp: new Date().toISOString(),
  domValidation: {
    status: 'PENDING',
    testsTotal: 0,
    testsPassed: 0,
    testsFailed: 0,
    successRate: 0,
    failures: [],
    warnings: []
  },
  jsChainValidation: {
    status: 'PENDING',
    testsTotal: 0,
    testsPassed: 0,
    testsFailed: 0,
    successRate: 0,
    failures: [],
    warnings: []
  },
  summary: {
    totalTests: 0,
    totalPassed: 0,
    totalFailed: 0,
    overallSuccessRate: 0
  }
}

// Función para generar reporte HTML
function generateHtmlReport(report) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Full Test Report - ${report.timestamp}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            padding: 20px;
            min-height: 100vh;
        }

        .container {
            max-width: 1600px;
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

        .summary {
            display: flex;
            justify-content: space-around;
            padding: 40px;
            background: #f8f9fa;
        }

        .summary-card {
            text-align: center;
            flex: 1;
            padding: 20px;
        }

        .summary-card .number {
            font-size: 3em;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .summary-card.total .number {
            color: #6c757d;
        }

        .summary-card.passed .number {
            color: #28a745;
        }

        .summary-card.failed .number {
            color: #dc3545;
        }

        .summary-card .label {
            font-size: 1.1em;
            color: #6c757d;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .section {
            padding: 40px;
        }

        .section h2 {
            margin-bottom: 20px;
            color: #343a40;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
        }

        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9em;
        }

        .status-badge.complete {
            background: #28a745;
            color: white;
        }

        .status-badge.pending {
            background: #ffc107;
            color: #333;
        }

        .failure-list {
            background: #f8d7da;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }

        .failure-item {
            padding: 15px;
            background: white;
            margin-bottom: 10px;
            border-radius: 6px;
            border-left: 4px solid #dc3545;
        }

        .failure-item h4 {
            color: #dc3545;
            margin-bottom: 5px;
        }

        .repair-section {
            background: #fff3cd;
            padding: 30px;
            border-radius: 8px;
            margin-top: 20px;
        }

        .repair-section h3 {
            color: #856404;
            margin-bottom: 15px;
        }

        .repair-item {
            padding: 15px;
            background: white;
            margin-bottom: 10px;
            border-radius: 6px;
            border-left: 4px solid #ffc107;
        }

        .repair-item code {
            background: #f8f9fa;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
        }

        .footer {
            padding: 20px 40px;
            background: #f8f9fa;
            text-align: center;
            color: #6c757d;
            border-top: 1px solid #dee2e6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 Full Test Report</h1>
            <p>DOM Validation + JavaScript Chain Validation</p>
            <p style="margin-top: 10px; font-size: 0.9em;">Generated: ${report.timestamp}</p>
        </div>

        <div class="summary">
            <div class="summary-card total">
                <div class="number">${report.summary.totalTests}</div>
                <div class="label">Total Tests</div>
            </div>
            <div class="summary-card passed">
                <div class="number">${report.summary.totalPassed}</div>
                <div class="label">Passed</div>
            </div>
            <div class="summary-card failed">
                <div class="number">${report.summary.totalFailed}</div>
                <div class="label">Failed</div>
            </div>
        </div>

        <div class="section">
            <h2>DOM Validation Results</h2>
            <p>Status: <span class="status-badge ${report.domValidation.status.toLowerCase()}">${report.domValidation.status}</span></p>
            <p>Success Rate: ${report.domValidation.successRate}%</p>

            ${
              report.domValidation.failures.length > 0
                ? `
                <div class="failure-list">
                    <h3>Failures Found: ${report.domValidation.failures.length}</h3>
                    ${report.domValidation.failures
                      .map(
                        failure => `
                        <div class="failure-item">
                            <h4>${failure.name}</h4>
                            <p><strong>File:</strong> ${failure.file}</p>
                            <p><strong>Error:</strong> ${failure.error}</p>
                        </div>
                    `
                      )
                      .join('')}
                </div>
            `
                : '<p style="color: green; font-weight: bold;">✅ All DOM validation tests passed!</p>'
            }
        </div>

        <div class="section">
            <h2>JavaScript Chain Validation Results</h2>
            <p>Status: <span class="status-badge ${report.jsChainValidation.status.toLowerCase()}">${report.jsChainValidation.status}</span></p>
            <p>Success Rate: ${report.jsChainValidation.successRate}%</p>

            ${
              report.jsChainValidation.failures.length > 0
                ? `
                <div class="failure-list">
                    <h3>Failures Found: ${report.jsChainValidation.failures.length}</h3>
                    ${report.jsChainValidation.failures
                      .map(
                        failure => `
                        <div class="failure-item">
                            <h4>${failure.name}</h4>
                            <p><strong>File:</strong> ${failure.file}</p>
                            <p><strong>Error:</strong> ${failure.error}</p>
                        </div>
                    `
                      )
                      .join('')}
                </div>
            `
                : '<p style="color: green; font-weight: bold;">✅ All JavaScript chain validation tests passed!</p>'
            }
        </div>

        <div class="section">
            <h2>Repairs Required</h2>
            <div class="repair-section">
                ${
                  report.summary.totalFailed === 0
                    ? `
                    <p style="color: green; font-weight: bold;">🎉 No repairs required! All tests passed.</p>
                `
                    : `
                    <p><strong>Total Issues to Fix:</strong> ${report.summary.totalFailed}</p>
                    <p style="margin-top: 10px;">Please review the failures above and apply the necessary fixes.</p>
                `
                }
            </div>
        </div>

        <div class="footer">
            <p>Generated by Full Test Report Generator</p>
            <p style="margin-top: 10px; font-size: 0.9em;">
                This report summarizes all DOM validation and JavaScript chain validation tests.
            </p>
        </div>
    </div>
</body>
</html>`
}

// Función para generar reporte de consola
function generateConsoleReport(report) {
  return `
═══════════════════════════════════════════════════════════════════════════════
                        📋 FULL TEST REPORT
═══════════════════════════════════════════════════════════════════════════════

Generated: ${report.timestamp}

SUMMARY
───────────────────────────────────────────────────────────────────────────────
Total Tests: ${report.summary.totalTests}
Passed: ${report.summary.totalPassed}
Failed: ${report.summary.totalFailed}
Success Rate: ${report.summary.overallSuccessRate}%

DOM VALIDATION
───────────────────────────────────────────────────────────────────────────────
Status: ${report.domValidation.status}
Tests: ${report.domValidation.testsTotal}
Passed: ${report.domValidation.testsPassed}
Failed: ${report.domValidation.testsFailed}
Success Rate: ${report.domValidation.successRate}%

${
  report.domValidation.failures.length > 0
    ? `
FAILURES (${report.domValidation.failures.length}):
${report.domValidation.failures
  .map(
    f => `
  - ${f.name}
    File: ${f.file}
    Error: ${f.error}
`
  )
  .join('')}
`
    : '✅ All tests passed!'
}

JAVASCRIPT CHAIN VALIDATION
───────────────────────────────────────────────────────────────────────────────
Status: ${report.jsChainValidation.status}
Tests: ${report.jsChainValidation.testsTotal}
Passed: ${report.jsChainValidation.testsPassed}
Failed: ${report.jsChainValidation.testsFailed}
Success Rate: ${report.jsChainValidation.successRate}%

${
  report.jsChainValidation.failures.length > 0
    ? `
FAILURES (${report.jsChainValidation.failures.length}):
${report.jsChainValidation.failures
  .map(
    f => `
  - ${f.name}
    File: ${f.file}
    Error: ${f.error}
`
  )
  .join('')}
`
    : '✅ All tests passed!'
}

REPAIRS REQUIRED
───────────────────────────────────────────────────────────────────────────────
${
  report.summary.totalFailed === 0
    ? '✅ No repairs required - All tests passed!'
    : `⚠️  ${report.summary.totalFailed} issues need to be fixed`
}

═══════════════════════════════════════════════════════════════════════════════
`
}

// Guardar reportes
const htmlReport = generateHtmlReport(report)
const consoleReport = generateConsoleReport(report)

fs.writeFileSync(path.join(__dirname, '../full-test-report.html'), htmlReport)

fs.writeFileSync(path.join(__dirname, '../full-test-report.txt'), consoleReport)

console.log(`${COLORS.green}📄 HTML Report: full-test-report.html${COLORS.reset}`)
console.log(`${COLORS.green}📄 Console Report: full-test-report.txt${COLORS.reset}\n`)

// Exponer funciones para actualización
export function updateReport(newData) {
  Object.assign(report, newData)
  report.summary.totalTests = report.domValidation.testsTotal + report.jsChainValidation.testsTotal
  report.summary.totalPassed =
    report.domValidation.testsPassed + report.jsChainValidation.testsPassed
  report.summary.totalFailed =
    report.domValidation.testsFailed + report.jsChainValidation.testsFailed
  report.summary.overallSuccessRate =
    report.summary.totalTests > 0
      ? ((report.summary.totalPassed / report.summary.totalTests) * 100).toFixed(1)
      : 0
}

export function generateAndSaveReport() {
  const htmlReport = generateHtmlReport(report)
  const consoleReport = generateConsoleReport(report)

  fs.writeFileSync(path.join(__dirname, '../full-test-report.html'), htmlReport)

  fs.writeFileSync(path.join(__dirname, '../full-test-report.txt'), consoleReport)

  console.log(`${COLORS.green}✅ Reports updated and saved${COLORS.reset}\n`)
}
