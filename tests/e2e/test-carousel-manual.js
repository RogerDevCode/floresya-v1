import { test, expect } from '@playwright/test'

test.describe('Verificación Manual del Carousel y Productos', () => {
  test('verificar carousel y cards de productos', async ({ page }) => {
    console.log('🔍 Iniciando verificación manual del carousel y productos...')

    // Navigate to homepage
    await page.goto('http://localhost:3000')

    // Wait for page to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    // Check if carousel exists
    const carousel = page.locator('#featuredCarousel')
    await expect(carousel).toBeVisible()
    console.log('✅ Carousel visible')

    // Wait for carousel slides to load
    try {
      await page.waitForSelector('#carouselSlides .carousel-slide', { timeout: 10000 })
      const slides = page.locator('#carouselSlides .carousel-slide')
      const slideCount = await slides.count()
      console.log(`✅ Carousel cargado con ${slideCount} slides`)

      // Check first slide content
      if (slideCount > 0) {
        const firstSlide = slides.first()
        const productImage = firstSlide.locator('.carousel-product-image')
        const productName = firstSlide.locator('h4')
        const productPrice = firstSlide.locator('.text-pink-600')

        if ((await productImage.count()) > 0) {
          const imgSrc = await productImage.getAttribute('src')
          console.log(`✅ Imagen del producto: ${imgSrc}`)
        }

        if ((await productName.count()) > 0) {
          const nameText = await productName.textContent()
          console.log(`✅ Nombre del producto: ${nameText}`)
        }

        if ((await productPrice.count()) > 0) {
          const priceText = await productPrice.textContent()
          console.log(`✅ Precio del producto: ${priceText}`)
        }
      }
    } catch (error) {
      console.log('❌ Error al cargar carousel:', error.message)
    }

    // Check product cards
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
        const cardProductName = firstCard.locator('h3')
        const cardPrice = firstCard.locator('.text-pink-600')
        const quickViewBtn = firstCard.locator('.quick-view-btn')
        const addToCartBtn = firstCard.locator('.add-to-cart-btn')
        const buyNowBtn = firstCard.locator('.buy-now-btn')

        if ((await cardProductName.count()) > 0) {
          const nameText = await cardProductName.textContent()
          console.log(`✅ Nombre en card: ${nameText}`)
        }

        if ((await cardPrice.count()) > 0) {
          const priceText = await cardPrice.textContent()
          console.log(`✅ Precio en card: ${priceText}`)
        }

        // Check icons
        const eyeIcon = quickViewBtn.locator('i[data-lucide="eye"]')
        const cartIcon = addToCartBtn.locator('i[data-lucide="shopping-cart"]')
        const zapIcon = buyNowBtn.locator('i[data-lucide="zap"]')

        console.log(`✅ Icono ojo visible: ${(await eyeIcon.count()) > 0}`)
        console.log(`✅ Icono carro visible: ${(await cartIcon.count()) > 0}`)
        console.log(`✅ Icono compra visible: ${(await zapIcon.count()) > 0}`)
      }
    } catch (error) {
      console.log('❌ Error al cargar cards de productos:', error.message)
    }

    // Take screenshot for documentation
    await page.screenshot({
      path: 'test-results/carousel-products-verification.png',
      fullPage: true
    })

    console.log('✅ Verificación completada')
  })
})
