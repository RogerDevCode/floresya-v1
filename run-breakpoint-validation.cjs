/**
 * Script principal de validación de breakpoints mobile-first
 * según el punto P1.1.1 del plan de mejoras
 *
 * Ejecuta todas las pruebas y genera un reporte consolidado
 */

const fs = require('fs')
const path = require('path')
// const { execSync } = require('child_process') // No utilizado en este archivo

// Importar módulos de prueba
const { runBreakpointTests } = require('./test-mobile-first-breakpoints.cjs')
const { runLighthouseMobileTests } = require('./test-lighthouse-mobile.cjs')

// Configuración
const REPORTS_DIR = './test-results'
const CONSOLIDATED_REPORT = path.join(REPORTS_DIR, 'P1.1.1-breakpoints-validation-report.json')
const HTML_REPORT = path.join(REPORTS_DIR, 'P1.1.1-breakpoints-validation-report.html')

// Asegurarse de que el directorio de reportes existe
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true })
}

/**
 * Función principal que ejecuta todas las validaciones
 */
async function runFullValidation() {
  console.log('='.repeat(70))
  console.log('🌸 VALIDACIÓN COMPLETA DE BREAKPOINTS MOBILE-FIRST - P1.1.1')
  console.log('='.repeat(70))

  const startTime = Date.now()

  const report = {
    metadata: {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      planReference: 'P1.1.1',
      title: 'Validación de Breakpoints Mobile-First en Tailwind CSS',
      description:
        'Implementación y validación de breakpoints mobile-first con valores específicos',
      testUrl: 'http://localhost:3001/public/index.html'
    },
    configuration: {
      breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px'
      },
      testDevices: [
        { name: 'Mobile Small', width: 320, height: 568 },
        { name: 'Mobile Large', width: 375, height: 667 },
        { name: 'Tablet', width: 768, height: 1024 }
      ],
      kpiTargets: {
        mobilePerformanceScore: 90
      }
    },
    validationResults: {},
    summary: {},
    recommendations: [],
    conclusion: {}
  }

  try {
    // 1. Verificar configuración de Tailwind
    console.log('\n📋 PASO 1: Verificando configuración de Tailwind CSS...')
    report.validationResults.tailwindConfig = await validateTailwindConfig()

    // 2. Ejecutar pruebas de breakpoints
    console.log('\n📱 PASO 2: Ejecutando pruebas de breakpoints...')
    report.validationResults.breakpoints = await runBreakpointTests()

    // 3. Ejecutar pruebas de Lighthouse
    console.log('\n🔍 PASO 3: Ejecutando pruebas de Lighthouse...')
    report.validationResults.lighthouse = await runLighthouseMobileTests()

    // 4. Generar resumen
    console.log('\n📊 PASO 4: Generando resumen de resultados...')
    report.summary = generateSummary(report.validationResults)

    // 5. Generar recomendaciones
    console.log('\n💡 PASO 5: Generando recomendaciones...')
    report.recommendations = generateRecommendations(report)

    // 6. Generar conclusión
    console.log('\n🎯 PASO 6: Generando conclusión...')
    report.conclusion = generateConclusion(report)

    // 7. Guardar reporte JSON
    fs.writeFileSync(CONSOLIDATED_REPORT, JSON.stringify(report, null, 2))
    console.log(`\n📄 Reporte JSON guardado en: ${CONSOLIDATED_REPORT}`)

    // 8. Generar reporte HTML
    await generateHTMLReport(report)
    console.log(`📄 Reporte HTML guardado en: ${HTML_REPORT}`)

    const duration = Math.round((Date.now() - startTime) / 1000)
    console.log(`\n⏱️ Validación completada en ${duration} segundos`)
  } catch (error) {
    console.error('\n❌ Error durante la validación:', error.message)
    report.error = error.message
  }

  return report
}

/**
 * Valida la configuración de Tailwind CSS
 */
async function validateTailwindConfig() {
  try {
    // Verificar que existe el archivo de configuración
    const configPath = './tailwind.config.js'
    if (!fs.existsSync(configPath)) {
      throw new Error('No se encuentra el archivo tailwind.config.js')
    }

    // Leer y analizar el archivo
    const configContent = fs.readFileSync(configPath, 'utf8')

    // Verificar breakpoints configurados
    const expectedBreakpoints = { sm: '640px', md: '768px', lg: '1024px', xl: '1280px' }
    const configuredBreakpoints = {}

    // Extraer breakpoints del archivo usando regex
    const screensMatch = configContent.match(/screens\s*:\s*{([^}]+)}/)
    if (screensMatch) {
      const screensContent = screensMatch[1]
      Object.keys(expectedBreakpoints).forEach(bp => {
        const bpMatch = screensContent.match(new RegExp(`${bp}\\s*:\\s*['"]([^'"]+)['"]`))
        if (bpMatch) {
          configuredBreakpoints[bp] = bpMatch[1]
        }
      })
    }

    // Verificar si todos los breakpoints están configurados correctamente
    const allCorrect = Object.keys(expectedBreakpoints).every(
      bp => configuredBreakpoints[bp] === expectedBreakpoints[bp]
    )

    return {
      exists: true,
      path: configPath,
      expectedBreakpoints,
      configuredBreakpoints,
      allCorrect,
      issues: allCorrect ? [] : ['Algunos breakpoints no están configurados correctamente']
    }
  } catch (error) {
    return {
      exists: false,
      error: error.message,
      issues: [error.message]
    }
  }
}

/**
 * Genera un resumen de todos los resultados
 */
function generateSummary(results) {
  const summary = {
    overallStatus: 'PENDING',
    testsPassed: 0,
    testsFailed: 0,
    totalTests: 0,
    kpiResults: {},
    keyFindings: []
  }

  // Resumen de configuración de Tailwind
  if (results.tailwindConfig) {
    summary.totalTests++
    if (results.tailwindConfig.allCorrect) {
      summary.testsPassed++
      summary.keyFindings.push('✅ Configuración de Tailwind CSS correcta')
    } else {
      summary.testsFailed++
      summary.keyFindings.push('❌ Configuración de Tailwind CSS incorrecta')
    }
  }

  // Resumen de pruebas de breakpoints
  if (results.breakpoints && results.breakpoints.summary) {
    const bpSummary = results.breakpoints.summary
    summary.testsPassed += bpSummary.passed
    summary.testsFailed += bpSummary.failed
    summary.totalTests += bpSummary.totalTests

    if (bpSummary.passRate >= 80) {
      summary.keyFindings.push(`✅ Pruebas de breakpoints: ${bpSummary.passRate}% de éxito`)
    } else {
      summary.keyFindings.push(`⚠️ Pruebas de breakpoints: Solo ${bpSummary.passRate}% de éxito`)
    }
  }

  // Resumen de KPIs de Lighthouse
  if (results.lighthouse && results.lighthouse.results) {
    const perfScore = results.lighthouse.results.performance
    summary.kpiResults = {
      mobilePerformanceScore: {
        value: perfScore,
        target: 90,
        met: perfScore >= 90
      }
    }

    summary.totalTests++
    if (perfScore >= 90) {
      summary.testsPassed++
      summary.keyFindings.push(`✅ KPI de performance móvil cumplido: ${perfScore}/100`)
    } else {
      summary.testsFailed++
      summary.keyFindings.push(
        `❌ KPI de performance móvil no cumplido: ${perfScore}/100 (objetivo: 90)`
      )
    }
  }

  // Determinar estado general
  const passRate = summary.totalTests > 0 ? (summary.testsPassed / summary.totalTests) * 100 : 0
  if (passRate >= 90) {
    summary.overallStatus = 'PASS'
  } else if (passRate >= 70) {
    summary.overallStatus = 'WARNING'
  } else {
    summary.overallStatus = 'FAIL'
  }

  summary.passRate = Math.round(passRate)

  return summary
}

/**
 * Genera recomendaciones basadas en los resultados
 */
function generateRecommendations(report) {
  const recommendations = []

  // Recomendaciones basadas en la configuración
  if (
    report.validationResults.tailwindConfig &&
    !report.validationResults.tailwindConfig.allCorrect
  ) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Configuration',
      title: 'Corregir configuración de breakpoints en Tailwind',
      description:
        'Asegurarse de que todos los breakpoints estén configurados con los valores correctos: sm: 640px, md: 768px, lg: 1024px, xl: 1280px'
    })
  }

  // Recomendaciones basadas en las pruebas de breakpoints
  if (report.validationResults.breakpoints && report.validationResults.breakpoints.issues) {
    const uniqueIssues = [...new Set(report.validationResults.breakpoints.issues)]
    uniqueIssues.forEach(issue => {
      recommendations.push({
        priority: issue.includes('Error') ? 'HIGH' : 'MEDIUM',
        category: 'Responsive Design',
        title: 'Corregir problema de responsive',
        description: issue
      })
    })
  }

  // Recomendaciones basadas en Lighthouse
  if (report.validationResults.lighthouse && report.validationResults.lighthouse.recommendations) {
    report.validationResults.lighthouse.recommendations.forEach(rec => {
      recommendations.push({
        priority: rec.impact === 'high' ? 'HIGH' : rec.impact === 'medium' ? 'MEDIUM' : 'LOW',
        category: 'Performance',
        title: rec.title,
        description: rec.description
      })
    })
  }

  // Recomendación sobre el KPI si no se cumple
  if (
    report.summary.kpiResults &&
    report.summary.kpiResults.mobilePerformanceScore &&
    !report.summary.kpiResults.mobilePerformanceScore.met
  ) {
    recommendations.push({
      priority: 'HIGH',
      category: 'KPI',
      title: 'Mejorar performance móvil para cumplir KPI',
      description: `El score actual de ${report.summary.kpiResults.mobilePerformanceScore.value} está por debajo del objetivo de 90. Implementar optimizaciones de rendimiento.`
    })
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}

/**
 * Genera la conclusión del reporte
 */
function generateConclusion(report) {
  const conclusion = {
    status: report.summary.overallStatus,
    implementationComplete: false,
    kpiMet: false,
    nextSteps: []
  }

  // Determinar si la implementación está completa
  const tailwindOk =
    report.validationResults.tailwindConfig && report.validationResults.tailwindConfig.allCorrect
  const breakpointsOk =
    report.validationResults.breakpoints &&
    report.validationResults.breakpoints.summary &&
    report.validationResults.breakpoints.summary.passRate >= 80

  conclusion.implementationComplete = tailwindOk && breakpointsOk

  // Determinar si los KPIs se cumplen
  conclusion.kpiMet =
    report.summary.kpiResults &&
    report.summary.kpiResults.mobilePerformanceScore &&
    report.summary.kpiResults.mobilePerformanceScore.met

  // Generar próximos pasos
  if (!conclusion.implementationComplete) {
    conclusion.nextSteps.push('Completar la implementación de breakpoints mobile-first')
  }

  if (!conclusion.kpiMet) {
    conclusion.nextSteps.push(
      'Implementar optimizaciones para cumplir el KPI de performance móvil (>90)'
    )
  }

  if (conclusion.implementationComplete && conclusion.kpiMet) {
    conclusion.nextSteps.push('Monitorear continuamente el performance móvil')
    conclusion.nextSteps.push('Documentar las buenas prácticas implementadas')
  }

  return conclusion
}

/**
 * Genera un reporte HTML completo
 */
async function generateHTMLReport(report) {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.metadata.title} - ${report.metadata.planReference}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
            line-height: 1.6;
        }
        .header {
            background: linear-gradient(135deg, #ec4899, #db2777);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            text-align: center;
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9em;
            margin: 10px 0;
        }
        .status-pass { background-color: #d1fae5; color: #065f46; }
        .status-warning { background-color: #fed7aa; color: #92400e; }
        .status-fail { background-color: #fee2e2; color: #991b1b; }
        .section {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            margin-bottom: 25px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .card {
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #e5e7eb;
            background-color: #f9fafb;
        }
        .card-high { border-left-color: #ef4444; }
        .card-medium { border-left-color: #f59e0b; }
        .card-low { border-left-color: #22c55e; }
        .metric {
            text-align: center;
            padding: 15px;
            border-radius: 8px;
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #ec4899;
            margin: 10px 0;
        }
        .checklist {
            list-style: none;
            padding: 0;
        }
        .checklist li {
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .checklist li:before {
            content: "✓";
            color: #22c55e;
            font-weight: bold;
            margin-right: 10px;
        }
        .checklist li.incomplete:before {
            content: "✗";
            color: #ef4444;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }
        h1, h2, h3 {
            color: #1f2937;
        }
        h1 { font-size: 2.5em; margin-bottom: 10px; }
        h2 { font-size: 1.8em; margin-bottom: 15px; color: #374151; }
        h3 { font-size: 1.3em; margin-bottom: 10px; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        th {
            background-color: #f9fafb;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌸 ${report.metadata.title}</h1>
        <p>${report.metadata.description}</p>
        <p>Referencia: ${report.metadata.planReference}</p>
        <p>Fecha: ${new Date(report.metadata.timestamp).toLocaleString('es-ES')}</p>
        <div class="status-badge status-${report.summary.overallStatus.toLowerCase()}">
            ESTADO GENERAL: ${report.summary.overallStatus}
        </div>
    </div>

    <div class="section">
        <h2>📊 Resumen Ejecutivo</h2>
        <div class="grid">
            <div class="metric">
                <h3>Tests Pasados</h3>
                <div class="metric-value">${report.summary.testsPassed}/${report.summary.totalTests}</div>
                <p>${report.summary.passRate}% de éxito</p>
            </div>
            <div class="metric">
                <h3>Performance Móvil</h3>
                <div class="metric-value">${report.summary.kpiResults.mobilePerformanceScore ? report.summary.kpiResults.mobilePerformanceScore.value : 'N/A'}</div>
                <p>Objetivo: 90</p>
            </div>
            <div class="metric">
                <h3>Implementación</h3>
                <div class="metric-value">${report.conclusion.implementationComplete ? '✅' : '❌'}</div>
                <p>${report.conclusion.implementationComplete ? 'Completa' : 'Incompleta'}</p>
            </div>
            <div class="metric">
                <h3>KPI Cumplido</h3>
                <div class="metric-value">${report.conclusion.kpiMet ? '✅' : '❌'}</div>
                <p>${report.conclusion.kpiMet ? 'Sí' : 'No'}</p>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>📋 Configuración de Breakpoints</h2>
        <table>
            <thead>
                <tr>
                    <th>Breakpoint</th>
                    <th>Valor Esperado</th>
                    <th>Valor Configurado</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(report.configuration.breakpoints)
                  .map(
                    ([key, value]) => `
                    <tr>
                        <td><strong>${key}</strong></td>
                        <td>${value}</td>
                        <td>${report.validationResults.tailwindConfig.configuredBreakpoints[key] || 'N/A'}</td>
                        <td>${report.validationResults.tailwindConfig.configuredBreakpoints[key] === value ? '✅ Correcto' : '❌ Incorrecto'}</td>
                    </tr>
                `
                  )
                  .join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>📱 Dispositivos Probados</h2>
        <div class="grid">
            ${report.configuration.testDevices
              .map(
                device => `
                <div class="metric">
                    <h3>${device.name}</h3>
                    <div class="metric-value">${device.width}×${device.height}</div>
                    <p>Resolución de prueba</p>
                </div>
            `
              )
              .join('')}
        </div>
    </div>

    ${
      report.summary.keyFindings.length > 0
        ? `
    <div class="section">
        <h2>🔍 Hallazgos Clave</h2>
        <ul class="checklist">
            ${report.summary.keyFindings
              .map(
                finding => `
                <li class="${finding.includes('❌') || finding.includes('⚠️') ? 'incomplete' : ''}">${finding}</li>
            `
              )
              .join('')}
        </ul>
    </div>
    `
        : ''
    }

    ${
      report.recommendations.length > 0
        ? `
    <div class="section">
        <h2>💡 Recomendaciones</h2>
        ${report.recommendations
          .map(
            rec => `
            <div class="card card-${rec.priority.toLowerCase()}">
                <h3>${rec.title}</h3>
                <p>${rec.description}</p>
                <small><strong>Prioridad:</strong> ${rec.priority} | <strong>Categoría:</strong> ${rec.category}</small>
            </div>
        `
          )
          .join('')}
    </div>
    `
        : ''
    }

    <div class="section">
        <h2>🎯 Conclusión</h2>
        <p><strong>Estado de la implementación:</strong> ${report.conclusion.implementationComplete ? '✅ Completa' : '❌ Incompleta'}</p>
        <p><strong>Cumplimiento de KPI:</strong> ${report.conclusion.kpiMet ? '✅ Sí' : '❌ No'}</p>
        
        ${
          report.conclusion.nextSteps.length > 0
            ? `
            <h3>Próximos Pasos:</h3>
            <ul>
                ${report.conclusion.nextSteps.map(step => `<li>${step}</li>`).join('')}
            </ul>
        `
            : ''
        }
    </div>

    <div class="footer">
        <p>Generado por FloresYa - Sistema de Validación de Breakpoints Mobile-First</p>
        <p>Plan de Mejoras P1.1.1</p>
    </div>
</body>
</html>`

  fs.writeFileSync(HTML_REPORT, html)
}

// Ejecutar validación si este script se ejecuta directamente
if (require.main === module) {
  ;(async () => {
    try {
      const report = await runFullValidation()

      console.log('\n' + '='.repeat(70))
      console.log('🌸 VALIDACIÓN COMPLETA FINALIZADA')
      console.log('='.repeat(70))

      console.log(`\n📊 ESTADO GENERAL: ${report.summary.overallStatus}`)
      console.log(`📈 TASA DE ÉXITO: ${report.summary.passRate}%`)
      console.log(`✅ TESTS PASADOS: ${report.summary.testsPassed}/${report.summary.totalTests}`)
      console.log(
        `🎯 KPI PERFORMANCE: ${report.summary.kpiResults.mobilePerformanceScore ? report.summary.kpiResults.mobilePerformanceScore.value + '/100' : 'N/A'}`
      )

      if (report.recommendations.length > 0) {
        console.log(`\n💡 RECOMENDACIONES (${report.recommendations.length}):`)
        report.recommendations.slice(0, 5).forEach((rec, index) => {
          console.log(`${index + 1}. [${rec.priority}] ${rec.title}`)
        })
      }

      console.log('\n📄 REPORTES GENERADOS:')
      console.log(`- JSON: ${CONSOLIDATED_REPORT}`)
      console.log(`- HTML: ${HTML_REPORT}`)

      console.log('\n' + '='.repeat(70))

      // Salir con código apropiado según el resultado
      process.exit(report.summary.overallStatus === 'FAIL' ? 1 : 0)
    } catch (error) {
      console.error('❌ Error fatal durante la validación:', error)
      process.exit(1)
    }
  })()
}

module.exports = {
  runFullValidation,
  validateTailwindConfig,
  generateSummary,
  generateRecommendations,
  generateConclusion
}
