import { chromium } from 'playwright'

async function debugFrontend() {
  console.log('🔍 Debugging frontend issues...')

  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  // Listen for console messages
  const consoleMessages = []
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    })
  })

  // Listen for network requests
  const networkRequests = []
  page.on('request', request => {
    networkRequests.push({
      url: request.url(),
      method: request.method(),
      headers: request.headers()
    })
  })

  const networkResponses = []
  page.on('response', response => {
    networkResponses.push({
      url: response.url(),
      status: response.status(),
      headers: response.headers()
    })
  })

  try {
    // Navigate to homepage
    await page.goto('http://localhost:3000')

    // Wait for page to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(5000) // Extra time for JavaScript to execute

    console.log('\n=== ERRORES EN CONSOLA ===')
    const errors = consoleMessages.filter(msg => msg.type === 'error')
    if (errors.length > 0) {
      errors.forEach(error => {
        console.log(`❌ ${error.text}`)
        if (error.location) {
          console.log(`   📍 ${error.location.url}:${error.location.lineNumber}`)
        }
      })
    } else {
      console.log('✅ No hay errores en la consola')
    }

    console.log('\n=== WARNINGS EN CONSOLA ===')
    const warnings = consoleMessages.filter(msg => msg.type === 'warning')
    if (warnings.length > 0) {
      warnings.forEach(warning => {
        console.log(`⚠️ ${warning.text}`)
      })
    } else {
      console.log('✅ No hay warnings en la consola')
    }

    console.log('\n=== REQUESTS DE API ===')
    const apiRequests = networkRequests.filter(req => req.url.includes('/api/'))
    apiRequests.forEach(req => {
      console.log(`📤 ${req.method} ${req.url}`)
    })

    console.log('\n=== RESPONSES DE API ===')
    const apiResponses = networkResponses.filter(res => res.url.includes('/api/'))
    apiResponses.forEach(res => {
      const status = res.status >= 200 && res.status < 300 ? '✅' : '❌'
      console.log(`${status} ${res.status} ${res.url}`)
    })

    console.log('\n=== ESTADO DEL DOM ===')

    // Check if carousel elements exist
    const carouselContainer = await page.locator('#featuredCarousel').count()
    const carouselSlides = await page.locator('#carouselSlides .carousel-slide').count()
    const carouselIndicators = await page.locator('#carouselIndicators .carousel-indicator').count()

    console.log(`🎠 Container del carousel: ${carouselContainer > 0 ? '✅' : '❌'}`)
    console.log(`🎠 Slides del carousel: ${carouselSlides > 0 ? '✅' : '❌'} (${carouselSlides})`)
    console.log(
      `🎠 Indicadores del carousel: ${carouselIndicators > 0 ? '✅' : '❌'} (${carouselIndicators})`
    )

    // Check if product cards exist
    const productsContainer = await page.locator('#productsContainer').count()
    const productCards = await page.locator('#productsContainer .product-card').count()

    console.log(`📦 Container de productos: ${productsContainer > 0 ? '✅' : '❌'}`)
    console.log(`📦 Cards de productos: ${productCards > 0 ? '✅' : '❌'} (${productCards})`)

    // Check if JavaScript is working
    const jsWorking = await page.evaluate(() => {
      try {
        return (
          typeof window.initCarousel === 'function' && typeof window.initProductsGrid === 'function'
        )
      } catch (_e) {
        return false
      }
    })

    console.log(`🟢 JavaScript funcionando: ${jsWorking ? '✅' : '❌'}`)

    // Check if API client is available
    const apiClientAvailable = await page.evaluate(() => {
      try {
        return (
          typeof window.api !== 'undefined' &&
          typeof window.api.getAllCarouselProducts === 'function'
        )
      } catch (_e) {
        return false
      }
    })

    console.log(`🔌 API client disponible: ${apiClientAvailable ? '✅' : '❌'}`)

    // Try to manually trigger carousel initialization
    console.log('\n=== INTENTO DE INICIALIZACIÓN MANUAL ===')

    const manualInitResult = await page.evaluate(async () => {
      try {
        // Check if functions exist
        if (typeof window.initCarousel === 'function') {
          console.log('🔄 Ejecutando initCarousel manualmente...')
          await window.initCarousel()
          return 'Carousel inicializado manualmente'
        } else {
          return 'initCarousel no disponible'
        }
      } catch (error) {
        return `Error al inicializar carousel: ${error.message}`
      }
    })

    console.log(`🔧 Resultado: ${manualInitResult}`)

    // Wait and check again
    await page.waitForTimeout(3000)

    const slidesAfterInit = await page.locator('#carouselSlides .carousel-slide').count()
    const cardsAfterInit = await page.locator('#productsContainer .product-card').count()

    console.log(`🎠 Slides después de inicialización: ${slidesAfterInit}`)
    console.log(`📦 Cards después de inicialización: ${cardsAfterInit}`)

    // Take screenshot
    await page.screenshot({
      path: 'test-results/debug-frontend.png',
      fullPage: true
    })

    console.log('\n✅ Debug completado')
  } catch (error) {
    console.error('❌ Error durante el debug:', error)
  } finally {
    await browser.close()
  }
}

// Run debug
debugFrontend().catch(console.error)
