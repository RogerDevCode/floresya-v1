import { chromium } from 'playwright'

async function verifyCarouselAndProducts() {
  console.log('🔍 Iniciando verificación manual del carousel y productos...')

  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  try {
    // Navigate to homepage
    await page.goto('http://localhost:3000')

    // Wait for page to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    console.log('\n=== VERIFICACIÓN DEL CAROUSEL ===')

    // Check if carousel exists
    const carousel = page.locator('#featuredCarousel')
    const carouselVisible = await carousel.isVisible()
    console.log(`✅ Carousel visible: ${carouselVisible}`)

    if (carouselVisible) {
      // Wait for carousel slides to load
      try {
        await page.waitForSelector('#carouselSlides .carousel-slide', { timeout: 10000 })
        const slides = page.locator('#carouselSlides .carousel-slide')
        const slideCount = await slides.count()
        console.log(`✅ Carousel cargado con ${slideCount} slides`)

        // Check indicators
        const indicators = page.locator('#carouselIndicators .carousel-indicator')
        const indicatorCount = await indicators.count()
        console.log(`✅ Indicadores del carousel: ${indicatorCount}`)

        // Check navigation buttons
        const prevBtn = page.locator('#carousel-prev')
        const nextBtn = page.locator('#carousel-next')
        console.log(`✅ Botón anterior visible: ${await prevBtn.isVisible()}`)
        console.log(`✅ Botón siguiente visible: ${await nextBtn.isVisible()}`)

        // Check first slide content
        if (slideCount > 0) {
          const firstSlide = slides.first()
          const productImage = firstSlide.locator('.carousel-product-image')
          const productName = firstSlide.locator('h4')
          const productDescription = firstSlide.locator('p.text-gray-600')
          const productPrice = firstSlide.locator('.text-pink-600')
          const addToCartBtn = firstSlide.locator('.btn-primary')

          if ((await productImage.count()) > 0) {
            const imgSrc = await productImage.getAttribute('src')
            console.log(`✅ Imagen del producto: ${imgSrc?.substring(0, 50)}...`)
          }

          if ((await productName.count()) > 0) {
            const nameText = await productName.textContent()
            console.log(`✅ Nombre del producto: ${nameText}`)
          }

          if ((await productDescription.count()) > 0) {
            const descText = await productDescription.textContent()
            console.log(`✅ Descripción del producto: ${descText?.substring(0, 50)}...`)
          }

          if ((await productPrice.count()) > 0) {
            const priceText = await productPrice.textContent()
            console.log(`✅ Precio del producto: ${priceText}`)
          }

          if ((await addToCartBtn.count()) > 0) {
            const btnText = await addToCartBtn.textContent()
            console.log(`✅ Botón de agregar al carrito: ${btnText}`)
          }
        }

        // Test carousel navigation
        console.log('\n=== PRUEBA DE NAVEGACIÓN DEL CAROUSEL ===')
        const initialSlide = page.locator('#carouselSlides .carousel-slide.opacity-100')
        const initialSlideIndex = await initialSlide.getAttribute('data-slide')
        console.log(`📍 Slide inicial: ${initialSlideIndex}`)

        await nextBtn.click()
        await page.waitForTimeout(600)

        const newSlide = page.locator('#carouselSlides .carousel-slide.opacity-100')
        const newSlideIndex = await newSlide.getAttribute('data-slide')
        console.log(`📍 Slide después de clic siguiente: ${newSlideIndex}`)
        console.log(`✅ Navegación del carousel funciona: ${initialSlideIndex !== newSlideIndex}`)
      } catch (error) {
        console.log('❌ Error al cargar carousel:', error.message)
      }
    }

    console.log('\n=== VERIFICACIÓN DE CARDS DE PRODUCTOS ===')

    // Scroll to products section
    await page.locator('#productos').scrollIntoViewIfNeeded()
    await page.waitForTimeout(2000)

    try {
      await page.waitForSelector('#productsContainer .product-card', { timeout: 10000 })
      const productCards = page.locator('#productsContainer .product-card')
      const cardCount = await productCards.count()
      console.log(`✅ Cards de productos cargadas: ${cardCount}`)

      // Check first card content
      if (cardCount > 0) {
        const firstCard = productCards.first()
        const carouselContainer = firstCard.locator('[data-carousel-container]')
        const cardProductName = firstCard.locator('h3')
        const cardDescription = firstCard.locator('.text-gray-600')
        const cardPrice = firstCard.locator('.text-pink-600')
        const quickViewBtn = firstCard.locator('.quick-view-btn')
        const addToCartBtn = firstCard.locator('.add-to-cart-btn')
        const buyNowBtn = firstCard.locator('.buy-now-btn')

        // Wait for carousel to initialize
        await page.waitForTimeout(2000)

        if ((await carouselContainer.count()) > 0) {
          const productImages = carouselContainer.locator('img')
          const imageCount = await productImages.count()
          console.log(`✅ Imágenes en la card: ${imageCount}`)
        }

        if ((await cardProductName.count()) > 0) {
          const nameText = await cardProductName.textContent()
          console.log(`✅ Nombre en card: ${nameText}`)
        }

        if ((await cardDescription.count()) > 0) {
          const descText = await cardDescription.textContent()
          console.log(`✅ Descripción en card: ${descText?.substring(0, 50)}...`)
        }

        if ((await cardPrice.count()) > 0) {
          const priceText = await cardPrice.textContent()
          console.log(`✅ Precio en card: ${priceText}`)
        }

        // Check icons
        console.log('\n=== VERIFICACIÓN DE ICONOS ===')
        const eyeIcon = quickViewBtn.locator('i[data-lucide="eye"]')
        const cartIcon = addToCartBtn.locator('i[data-lucide="shopping-cart"]')
        const zapIcon = buyNowBtn.locator('i[data-lucide="zap"]')

        console.log(`✅ Icono ojo visible: ${(await eyeIcon.count()) > 0}`)
        console.log(`✅ Icono carro visible: ${(await cartIcon.count()) > 0}`)
        console.log(`✅ Icono compra visible: ${(await zapIcon.count()) > 0}`)

        // Check button attributes
        if ((await quickViewBtn.count()) > 0) {
          const quickViewLabel = await quickViewBtn.getAttribute('aria-label')
          const addToCartLabel = await addToCartBtn.getAttribute('aria-label')
          const buyNowLabel = await buyNowBtn.getAttribute('aria-label')

          console.log(`✅ Aria-label ojo: ${quickViewLabel}`)
          console.log(`✅ Aria-label carro: ${addToCartLabel}`)
          console.log(`✅ Aria-label compra: ${buyNowLabel}`)
        }
      }
    } catch (error) {
      console.log('❌ Error al cargar cards de productos:', error.message)
    }

    console.log('\n=== VERIFICACIÓN DE RESPONSIVIDAD ===')

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(1000)

    const carouselMobile = page.locator('#featuredCarousel')
    const carouselMobileVisible = await carouselMobile.isVisible()
    console.log(`✅ Carousel visible en móvil: ${carouselMobileVisible}`)

    const cardsMobile = page.locator('#productsContainer .product-card')
    const cardsMobileCount = await cardsMobile.count()
    console.log(`✅ Cards visibles en móvil: ${cardsMobileCount}`)

    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.waitForTimeout(1000)

    const carouselDesktop = page.locator('#featuredCarousel')
    const carouselDesktopVisible = await carouselDesktop.isVisible()
    console.log(`✅ Carousel visible en desktop: ${carouselDesktopVisible}`)

    const cardsDesktop = page.locator('#productsContainer .product-card')
    const cardsDesktopCount = await cardsDesktop.count()
    console.log(`✅ Cards visibles en desktop: ${cardsDesktopCount}`)

    // Take screenshot for documentation
    await page.screenshot({
      path: 'test-results/carousel-products-verification.png',
      fullPage: true
    })

    console.log('\n=== VERIFICACIÓN DE API ===')

    // Listen for network requests
    const apiResponses = []
    page.on('response', response => {
      if (response.url().includes('/api/products')) {
        apiResponses.push(response)
      }
    })

    // Refresh page to trigger API calls
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    const carouselAPIResponse = apiResponses.find(r => r.url().includes('/carousel'))
    const productsAPIResponse = apiResponses.find(
      r => r.url().includes('/products') && !r.url().includes('/carousel')
    )

    if (carouselAPIResponse) {
      console.log(`✅ API del carousel respondió: ${carouselAPIResponse.status()}`)
      const carouselData = await carouselAPIResponse.json()
      console.log(`✅ Productos en carousel API: ${carouselData.data?.length || 0}`)
    }

    if (productsAPIResponse) {
      console.log(`✅ API de productos respondió: ${productsAPIResponse.status()}`)
      const productsData = await productsAPIResponse.json()
      console.log(`✅ Productos en API general: ${productsData.data?.length || 0}`)
    }

    console.log('\n✅ Verificación completada exitosamente')
  } catch (error) {
    console.error('❌ Error durante la verificación:', error)
  } finally {
    await browser.close()
  }
}

// Run verification
verifyCarouselAndProducts().catch(console.error)
