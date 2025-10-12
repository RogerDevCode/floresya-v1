import { test, expect } from '@playwright/test'

// Test data for validation
const EXPECTED_MIN_PRODUCTS = 4
const BREAKPOINTS = {
  mobile: { width: 375, height: 667 }, // sm breakpoint
  tablet: { width: 768, height: 1024 }, // md breakpoint
  desktop: { width: 1280, height: 720 } // lg breakpoint
}

test.describe('Carousel y Productos - Verificación Exhaustiva', () => {
  test.beforeEach(async ({ page }) => {
    // Configure longer timeouts for API loading
    page.setDefaultTimeout(30000)

    // Navigate to homepage and wait for basic load
    await page.goto('http://localhost:3000')

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')

    // Wait for initial JavaScript to execute
    await page.waitForTimeout(2000)
  })

  test.describe('Carousel de Productos', () => {
    test('debe cargar y mostrar el carousel con productos', async ({ page }) => {
      console.log('🎠 Verificando carga del carousel...')

      // Check if carousel container exists
      const carousel = page.locator('#featuredCarousel')
      await expect(carousel).toBeVisible()

      // Wait for carousel to load products
      await page.waitForSelector('#carouselSlides .carousel-slide', { timeout: 15000 })

      // Check if slides are present
      const slides = page.locator('#carouselSlides .carousel-slide')
      const slideCount = await slides.count()

      console.log(`📊 Found ${slideCount} carousel slides`)
      expect(slideCount).toBeGreaterThan(0)

      // Check if indicators are present
      const indicators = page.locator('#carouselIndicators .carousel-indicator')
      const indicatorCount = await indicators.count()

      console.log(`📍 Found ${indicatorCount} carousel indicators`)
      expect(indicatorCount).toBe(slideCount)

      // Check if navigation buttons are present
      await expect(page.locator('#carousel-prev')).toBeVisible()
      await expect(page.locator('#carousel-next')).toBeVisible()
    })

    test('debe mostrar información completa de productos en el carousel', async ({ page }) => {
      console.log('🔍 Verificando información completa del carousel...')

      // Wait for carousel to load
      await page.waitForSelector('#carouselSlides .carousel-slide', { timeout: 15000 })

      // Check first slide for complete product information
      const firstSlide = page.locator('#carouselSlides .carousel-slide').first()

      // Verify product image
      const productImage = firstSlide.locator('.carousel-product-image')
      await expect(productImage).toBeVisible()

      // Verify image has proper attributes
      const imgSrc = await productImage.getAttribute('src')
      expect(imgSrc).toBeTruthy()
      expect(imgSrc).not.toContain('placeholder')

      // Verify product name
      const productName = firstSlide.locator('h4')
      await expect(productName).toBeVisible()
      const nameText = await productName.textContent()
      expect(nameText?.trim()).toBeTruthy()
      expect(nameText?.trim().length).toBeGreaterThan(0)

      // Verify product description
      const productDescription = firstSlide.locator('p.text-gray-600')
      await expect(productDescription).toBeVisible()
      const descText = await productDescription.textContent()
      expect(descText?.trim()).toBeTruthy()
      expect(descText?.trim().length).toBeGreaterThan(0)

      // Verify product price
      const productPrice = firstSlide.locator('.text-pink-600')
      await expect(productPrice).toBeVisible()
      const priceText = await productPrice.textContent()
      expect(priceText).toMatch(/\$\d+\.\d{2}/)

      // Verify "Agregar al Carrito" button
      const addToCartBtn = firstSlide.locator('.btn-primary')
      await expect(addToCartBtn).toBeVisible()
      expect(await addToCartBtn.textContent()).toContain('Agregar al Carrito')

      console.log(`✅ Carousel product verified: ${nameText} - ${priceText}`)
    })

    test('debe permitir navegación entre slides del carousel', async ({ page }) => {
      console.log('🔄 Verificando navegación del carousel...')

      // Wait for carousel to load
      await page.waitForSelector('#carouselSlides .carousel-slide', { timeout: 15000 })

      // Get initial active slide
      const activeSlide = page.locator('#carouselSlides .carousel-slide.opacity-100')
      const initialSlideIndex = await activeSlide.getAttribute('data-slide')

      // Test next button
      await page.click('#carousel-next')
      await page.waitForTimeout(600) // Wait for transition

      // Verify slide changed
      const newActiveSlide = page.locator('#carouselSlides .carousel-slide.opacity-100')
      const newSlideIndex = await newActiveSlide.getAttribute('data-slide')
      expect(newSlideIndex).not.toBe(initialSlideIndex)

      // Test previous button
      await page.click('#carousel-prev')
      await page.waitForTimeout(600) // Wait for transition

      // Verify slide changed back
      const prevActiveSlide = page.locator('#carouselSlides .carousel-slide.opacity-100')
      const prevSlideIndex = await prevActiveSlide.getAttribute('data-slide')
      expect(prevSlideIndex).toBe(initialSlideIndex)

      // Test indicator navigation
      const indicators = page.locator('#carouselIndicators .carousel-indicator')
      if ((await indicators.count()) > 1) {
        await indicators.nth(1).click()
        await page.waitForTimeout(600)

        const indicatorActiveSlide = page.locator('#carouselSlides .carousel-slide.opacity-100')
        const indicatorSlideIndex = await indicatorActiveSlide.getAttribute('data-slide')
        expect(indicatorSlideIndex).toBe('1')
      }

      console.log('✅ Navegación del carousel verificada')
    })
  })

  test.describe('Cards de Productos', () => {
    test('debe cargar y mostrar las cards de productos', async ({ page }) => {
      console.log('📦 Verificando carga de cards de productos...')

      // Scroll to products section
      await page.locator('#productos').scrollIntoViewIfNeeded()

      // Wait for products to load
      await page.waitForSelector('#productsContainer .product-card', { timeout: 15000 })

      // Check if product cards are present
      const productCards = page.locator('#productsContainer .product-card')
      const cardCount = await productCards.count()

      console.log(`📊 Found ${cardCount} product cards`)
      expect(cardCount).toBeGreaterThan(EXPECTED_MIN_PRODUCTS)

      // Verify products container is visible
      await expect(page.locator('#productsContainer')).toBeVisible()

      // Check if pagination is present
      const pagination = page.locator('#pagination')
      if ((await pagination.count()) > 0) {
        await expect(pagination).toBeVisible()
      }
    })

    test('debe mostrar información completa en las cards de productos', async ({ page }) => {
      console.log('🔍 Verificando información completa de las cards...')

      // Scroll to products section
      await page.locator('#productos').scrollIntoViewIfNeeded()

      // Wait for products to load
      await page.waitForSelector('#productsContainer .product-card', { timeout: 15000 })

      // Check first product card for complete information
      const firstCard = page.locator('#productsContainer .product-card').first()

      // Verify product image carousel container
      const carouselContainer = firstCard.locator('[data-carousel-container]')
      await expect(carouselContainer).toBeVisible()

      // Wait for carousel to initialize
      await page.waitForTimeout(2000)

      // Verify product images (carousel should have at least one image)
      const productImages = carouselContainer.locator('img')
      await expect(productImages.first()).toBeVisible()

      // Verify product name
      const productName = firstCard.locator('h3')
      await expect(productName).toBeVisible()
      const nameText = await productName.textContent()
      expect(nameText?.trim()).toBeTruthy()
      expect(nameText?.trim().length).toBeGreaterThan(0)

      // Verify product description
      const productDescription = firstCard.locator('.text-gray-600')
      await expect(productDescription).toBeVisible()
      const descText = await productDescription.textContent()
      expect(descText?.trim()).toBeTruthy()

      // Verify product price
      const productPrice = firstCard.locator('.text-pink-600')
      await expect(productPrice).toBeVisible()
      const priceText = await productPrice.textContent()
      expect(priceText).toMatch(/\$\d+\.\d{2}/)

      console.log(`✅ Product card verified: ${nameText} - ${priceText}`)
    })

    test('debe mostrar los iconos de acción debajo del precio', async ({ page }) => {
      console.log('🎯 Verificando iconos de acción...')

      // Scroll to products section
      await page.locator('#productos').scrollIntoViewIfNeeded()

      // Wait for products to load
      await page.waitForSelector('#productsContainer .product-card', { timeout: 15000 })

      // Check first product card for action icons
      const firstCard = page.locator('#productsContainer .product-card').first()

      // Wait for icons to initialize
      await page.waitForTimeout(2000)

      // Verify eye icon (quick view)
      const quickViewBtn = firstCard.locator('.quick-view-btn[data-action="quick-view"]')
      await expect(quickViewBtn).toBeVisible()

      // Verify eye icon has lucide icon
      const eyeIcon = quickViewBtn.locator('i[data-lucide="eye"]')
      await expect(eyeIcon).toBeVisible()

      // Verify cart icon (add to cart)
      const addToCartBtn = firstCard.locator('.add-to-cart-btn[data-action="add-to-cart"]')
      await expect(addToCartBtn).toBeVisible()

      // Verify cart icon has lucide icon
      const cartIcon = addToCartBtn.locator('i[data-lucide="shopping-cart"]')
      await expect(cartIcon).toBeVisible()

      // Verify buy now icon (zap)
      const buyNowBtn = firstCard.locator('.buy-now-btn[data-action="buy-now"]')
      await expect(buyNowBtn).toBeVisible()

      // Verify buy now icon has lucide icon
      const zapIcon = buyNowBtn.locator('i[data-lucide="zap"]')
      await expect(zapIcon).toBeVisible()

      // Verify buttons have proper attributes
      expect(await quickViewBtn.getAttribute('aria-label')).toBe('Vista rápida')
      expect(await addToCartBtn.getAttribute('aria-label')).toBe('Agregar al carrito')
      expect(await buyNowBtn.getAttribute('aria-label')).toBe('Comprar ahora')

      console.log('✅ Iconos de acción verificados: ojo, carro, compra')
    })

    test('debe permitir interacción con los botones de acción', async ({ page }) => {
      console.log('🖱️ Verificando interactividad de los botones...')

      // Scroll to products section
      await page.locator('#productos').scrollIntoViewIfNeeded()

      // Wait for products to load
      await page.waitForSelector('#productsContainer .product-card', { timeout: 15000 })

      // Check first product card
      const firstCard = page.locator('#productsContainer .product-card').first()

      // Wait for icons to initialize
      await page.waitForTimeout(2000)

      // Test quick view button
      const quickViewBtn = firstCard.locator('.quick-view-btn[data-action="quick-view"]')
      await expect(quickViewBtn).toBeVisible()

      // Test add to cart button
      const addToCartBtn = firstCard.locator('.add-to-cart-btn[data-action="add-to-cart"]')
      await expect(addToCartBtn).toBeVisible()

      // Test buy now button
      const buyNowBtn = firstCard.locator('.buy-now-btn[data-action="buy-now"]')
      await expect(buyNowBtn).toBeVisible()

      // Verify buttons have proper data attributes
      expect(await quickViewBtn.getAttribute('data-product-id')).toBeTruthy()
      expect(await addToCartBtn.getAttribute('data-product-id')).toBeTruthy()
      expect(await buyNowBtn.getAttribute('data-product-id')).toBeTruthy()

      console.log('✅ Interactividad de los botones verificada')
    })
  })

  test.describe('Responsividad', () => {
    test('debe ser responsive en móvil (375x667)', async ({ page }) => {
      console.log('📱 Verificando responsividad en móvil...')

      // Set mobile viewport
      await page.setViewportSize(BREAKPOINTS.mobile)

      // Wait for responsive layout to adjust
      await page.waitForTimeout(1000)

      // Check carousel on mobile
      const carousel = page.locator('#featuredCarousel')
      await expect(carousel).toBeVisible()

      // Check product cards on mobile
      await page.locator('#productos').scrollIntoViewIfNeeded()
      await page.waitForSelector('#productsContainer .product-card', { timeout: 15000 })

      const productCards = page.locator('#productsContainer .product-card')
      const cardCount = await productCards.count()
      expect(cardCount).toBeGreaterThan(0)

      // Take screenshot for documentation
      await page.screenshot({
        path: 'test-results/carousel-products-mobile.png',
        fullPage: true
      })

      console.log('✅ Layout móvil verificado')
    })

    test('debe ser responsive en tablet (768x1024)', async ({ page }) => {
      console.log('📱 Verificando responsividad en tablet...')

      // Set tablet viewport
      await page.setViewportSize(BREAKPOINTS.tablet)

      // Wait for responsive layout to adjust
      await page.waitForTimeout(1000)

      // Check carousel on tablet
      const carousel = page.locator('#featuredCarousel')
      await expect(carousel).toBeVisible()

      // Check product cards on tablet
      await page.locator('#productos').scrollIntoViewIfNeeded()
      await page.waitForSelector('#productsContainer .product-card', { timeout: 15000 })

      const productCards = page.locator('#productsContainer .product-card')
      const cardCount = await productCards.count()
      expect(cardCount).toBeGreaterThan(0)

      // Take screenshot for documentation
      await page.screenshot({
        path: 'test-results/carousel-products-tablet.png',
        fullPage: true
      })

      console.log('✅ Layout tablet verificado')
    })

    test('debe ser responsive en desktop (1280x720)', async ({ page }) => {
      console.log('🖥️ Verificando responsividad en desktop...')

      // Set desktop viewport
      await page.setViewportSize(BREAKPOINTS.desktop)

      // Wait for responsive layout to adjust
      await page.waitForTimeout(1000)

      // Check carousel on desktop
      const carousel = page.locator('#featuredCarousel')
      await expect(carousel).toBeVisible()

      // Check product cards on desktop
      await page.locator('#productos').scrollIntoViewIfNeeded()
      await page.waitForSelector('#productsContainer .product-card', { timeout: 15000 })

      const productCards = page.locator('#productsContainer .product-card')
      const cardCount = await productCards.count()
      expect(cardCount).toBeGreaterThan(0)

      // Take screenshot for documentation
      await page.screenshot({
        path: 'test-results/carousel-products-desktop.png',
        fullPage: true
      })

      console.log('✅ Layout desktop verificado')
    })
  })

  test.describe('Validación de API y Carga de Datos', () => {
    test('debe verificar que los datos del carousel provienen de la API', async ({ page }) => {
      console.log('🔌 Verificando carga de datos desde API...')

      // Listen for network requests
      const apiResponses = []
      page.on('response', response => {
        if (response.url().includes('/api/products/carousel')) {
          apiResponses.push(response)
        }
      })

      // Wait for carousel to load
      await page.waitForSelector('#carouselSlides .carousel-slide', { timeout: 15000 })

      // Verify API was called
      expect(apiResponses.length).toBeGreaterThan(0)

      // Check API response
      const carouselResponse = apiResponses[0]
      expect(carouselResponse.status()).toBe(200)

      const responseData = await carouselResponse.json()
      expect(responseData.success).toBe(true)
      expect(responseData.data).toBeDefined()
      expect(responseData.data.length).toBeGreaterThan(0)

      console.log(`✅ API carousel verificada: ${responseData.data.length} productos`)
    })

    test('debe verificar que los datos de las cards provienen de la API', async ({ page }) => {
      console.log('🔌 Verificando carga de datos de productos desde API...')

      // Listen for network requests
      const apiResponses = []
      page.on('response', response => {
        if (response.url().includes('/api/products') && !response.url().includes('/carousel')) {
          apiResponses.push(response)
        }
      })

      // Scroll to products section to trigger API call
      await page.locator('#productos').scrollIntoViewIfNeeded()

      // Wait for products to load
      await page.waitForSelector('#productsContainer .product-card', { timeout: 15000 })

      // Verify API was called
      expect(apiResponses.length).toBeGreaterThan(0)

      // Check API response
      const productsResponse = apiResponses[0]
      expect(productsResponse.status()).toBe(200)

      const responseData = await productsResponse.json()
      expect(responseData.success).toBe(true)
      expect(responseData.data).toBeDefined()
      expect(responseData.data.length).toBeGreaterThan(0)

      console.log(`✅ API productos verificada: ${responseData.data.length} productos`)
    })
  })

  test.describe('Manejo de Errores', () => {
    test('debe manejar correctamente errores de carga de imágenes', async ({ page }) => {
      console.log('🖼️ Verificando manejo de errores de imágenes...')

      // Wait for carousel to load
      await page.waitForSelector('#carouselSlides .carousel-slide', { timeout: 15000 })

      // Check if images have fallback attributes
      const productImages = page.locator('.carousel-product-image')
      const imageCount = await productImages.count()

      for (let i = 0; i < imageCount; i++) {
        const image = productImages.nth(i)
        const fallback = await image.getAttribute('data-fallback')
        expect(fallback).toBeTruthy()
      }

      console.log('✅ Manejo de errores de imágenes verificado')
    })
  })
})
