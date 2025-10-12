/**
 * Script de prueba para validar el comportamiento del grid de productos
 * en diferentes tamaños de pantalla
 */

import { chromium } from 'playwright'
import fs from 'fs'

async function testProductGrid() {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  // Definir los viewports a probar
  const viewports = [
    { name: 'Mobile Small', width: 375, height: 667, expectedColumns: 1 },
    { name: 'Mobile Large', width: 414, height: 896, expectedColumns: 1 },
    { name: 'Mobile XL', width: 767, height: 1024, expectedColumns: 1 },
    { name: 'Tablet', width: 768, height: 1024, expectedColumns: 2 },
    { name: 'Tablet Large', width: 1023, height: 768, expectedColumns: 2 },
    { name: 'Desktop Small', width: 1024, height: 768, expectedColumns: 3 },
    { name: 'Desktop Medium', width: 1280, height: 720, expectedColumns: 3 },
    { name: 'Desktop Large', width: 1279, height: 800, expectedColumns: 3 },
    { name: 'Large Screen', width: 1280, height: 800, expectedColumns: 4 },
    { name: 'Ultra Wide', width: 1920, height: 1080, expectedColumns: 4 }
  ]

  console.log('🔍 Iniciando pruebas del grid de productos en diferentes viewports...\n')

  const results = []

  for (const viewport of viewports) {
    console.log(`📱 Probando viewport: ${viewport.name} (${viewport.width}x${viewport.height})`)

    // Configurar el viewport
    await page.setViewportSize({ width: viewport.width, height: viewport.height })

    // Navegar a la página de prueba
    await page.goto(`http://localhost:8081/product-grid-test.html`)

    // Esperar a que la página cargue completamente
    await page.waitForLoadState('networkidle')

    // Verificar si hay scroll horizontal
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.body.scrollWidth > document.body.clientWidth
    })

    // Obtener información del grid
    const gridInfo = await page.evaluate(() => {
      const grid = document.getElementById('productGrid')
      if (!grid) return null

      const computedStyle = window.getComputedStyle(grid)
      const gridTemplateColumns = computedStyle.gridTemplateColumns
      const columnCount = gridTemplateColumns.split(' ').length

      return {
        gridTemplateColumns,
        columnCount,
        gridClasses: grid.className
      }
    })

    // Verificar visibilidad del contenido
    const contentVisibility = await page.evaluate(() => {
      const products = document.querySelectorAll('.product-card')
      let visibleProducts = 0

      products.forEach(product => {
        const rect = product.getBoundingClientRect()
        const isVisible =
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= window.innerHeight &&
          rect.right <= window.innerWidth

        if (isVisible) visibleProducts++
      })

      return {
        totalProducts: products.length,
        visibleProducts,
        firstProductVisible:
          products.length > 0 ? products[0].getBoundingClientRect().top >= 0 : false
      }
    })

    // Capturar screenshot
    const screenshotPath = `test-results/product-grid-${viewport.name.toLowerCase().replace(/\s+/g, '-')}.png`
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    })

    // Evaluar resultados
    const testResult = {
      viewport: viewport.name,
      width: viewport.width,
      height: viewport.height,
      expectedColumns: viewport.expectedColumns,
      actualColumns: gridInfo ? gridInfo.columnCount : 0,
      hasHorizontalScroll,
      contentVisibility,
      gridClasses: gridInfo ? gridInfo.gridClasses : null,
      screenshot: screenshotPath,
      passed: gridInfo
        ? gridInfo.columnCount === viewport.expectedColumns && !hasHorizontalScroll
        : false
    }

    results.push(testResult)

    // Mostrar resultado
    const status = testResult.passed ? '✅' : '❌'
    console.log(
      `   ${status} Columnas: esperadas ${viewport.expectedColumns}, obtenidas ${testResult.actualColumns}`
    )
    console.log(
      `   ${status} Scroll horizontal: ${hasHorizontalScroll ? 'Detectado' : 'No detectado'}`
    )
    console.log(`   📸 Screenshot guardado en: ${screenshotPath}`)
    console.log('')
  }

  // Generar reporte
  console.log('📊 Reporte de resultados:')
  console.log('========================')

  const passedTests = results.filter(r => r.passed).length
  const totalTests = results.length

  console.log(`✅ Pruebas pasadas: ${passedTests}/${totalTests}`)
  console.log(`❌ Pruebas fallidas: ${totalTests - passedTests}/${totalTests}\n`)

  // Mostrar detalles de pruebas fallidas
  const failedTests = results.filter(r => !r.passed)
  if (failedTests.length > 0) {
    console.log('❌ Detalles de pruebas fallidas:')
    console.log('================================')

    failedTests.forEach(test => {
      console.log(`📱 ${test.viewport} (${test.width}x${test.height}):`)
      console.log(`   Columnas: esperadas ${test.expectedColumns}, obtenidas ${test.actualColumns}`)
      console.log(
        `   Scroll horizontal: ${test.hasHorizontalScroll ? 'Detectado' : 'No detectado'}`
      )
      console.log(`   Classes: ${test.gridClasses}`)
      console.log('')
    })
  }

  await browser.close()

  // Guardar resultados en archivo JSON
  const reportPath = 'test-results/product-grid-viewport-test-results.json'

  // Asegurar que el directorio exista
  if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results')
  }

  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2))
  console.log(`📄 Resultados guardados en: ${reportPath}`)

  return results
}

// Ejecutar pruebas si se llama directamente al script
if (import.meta.url === `file://${process.argv[1]}`) {
  testProductGrid()
    .then(results => {
      const passedTests = results.filter(r => r.passed).length
      const totalTests = results.length

      console.log(
        `\n🏁 Pruebas completadas. Resultado: ${passedTests}/${totalTests} pruebas pasadas`
      )

      if (passedTests === totalTests) {
        console.log('🎉 Todas las pruebas pasaron correctamente')
        process.exit(0)
      } else {
        console.log('⚠️ Algunas pruebas fallaron')
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('❌ Error al ejecutar las pruebas:', error)
      process.exit(1)
    })
}

export { testProductGrid }
