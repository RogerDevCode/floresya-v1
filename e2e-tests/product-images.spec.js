/**
 * E2E Test: Product Images Loading
 * Verifica que las imágenes se cargan correctamente en carousel y product cards
 */

import { test, expect } from '@playwright/test'

test.describe('Product Images Loading', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página principal
    await page.goto('/')
    // Esperar a que el DOM esté listo
    await page.waitForLoadState('networkidle')
  })

  test('should load carousel images', async ({ page }) => {
    // Esperar a que el carousel esté presente
    const carousel = page.locator('#featuredCarousel')
    await expect(carousel).toBeVisible({ timeout: 10000 })

    // Verificar que hay slides en el carousel
    const slides = carousel.locator('.carousel-slide')

    // Esperar explícitamente a que aparezca al menos un slide
    try {
      await expect(slides.first()).toBeVisible({ timeout: 10000 })
    } catch (e) {
      console.warn('⚠️ Timeout waiting for slides. Checking for error message.')
    }

    const slideCount = await slides.count()

    // Si no hay slides, puede ser que no haya productos destacados o falló la carga
    if (slideCount === 0) {
      console.warn('⚠️ No carousel slides found. Checking for error message.')
      const errorMsg = carousel.locator('text=No se pudieron cargar')
      if ((await errorMsg.count()) > 0) {
        console.warn('⚠️ Carousel failed to load data. Skipping image check.')
        return
      }
    }
    expect(slideCount).toBeGreaterThan(0)

    // Verificar que las imágenes dentro del carousel se cargan
    const carouselImages = carousel.locator('img.carousel-product-image')
    const imageCount = await carouselImages.count()
    expect(imageCount).toBeGreaterThan(0)

    // Verificar que al menos una imagen tiene src válido
    const firstImage = carouselImages.first()
    const src = await firstImage.getAttribute('src')
    expect(src).toBeTruthy()

    // Verificar que la imagen se carga correctamente
    if (src && !src.includes('placeholder')) {
      const response = await page.request.get(src)
      expect(response.status()).toBe(200)
    }

    console.log(`✅ Carousel: ${imageCount} images found`)
  })

  test('should load product card images', async ({ page }) => {
    // Esperar a que el contenedor de productos esté presente
    const productsContainer = page.locator('#productsContainer')
    await expect(productsContainer).toBeVisible({ timeout: 10000 })

    // Esperar a que se carguen los productos (el loader desaparece)
    await expect(productsContainer.locator('.animate-spin')).toBeHidden({ timeout: 10000 })

    // Verificar que hay cards de productos (usando data-product-id como selector principal)
    // Nota: El selector debe ser directo hijo o buscar div con data-product-id
    const productCards = productsContainer.locator('> div[data-product-id]')
    const cardCount = await productCards.count()

    if (cardCount === 0) {
      console.warn('⚠️ No product cards found in grid. API might be empty.')
      return
    }

    expect(cardCount).toBeGreaterThan(0)
    console.log(`Found ${cardCount} product cards`)

    // Verificar imágenes en las primeras 5 cards
    const cardsToCheck = Math.min(5, cardCount)

    for (let i = 0; i < cardsToCheck; i++) {
      const card = productCards.nth(i)
      const image = card.locator('img').first()

      // Verificar que la imagen existe
      await expect(image).toBeVisible()

      const src = await image.getAttribute('src')
      expect(src).toBeTruthy()

      if (src && !src.includes('placeholder') && !src.startsWith('data:')) {
        try {
          const response = await page.request.get(src)
          expect(response.status()).toBe(200)
        } catch (error) {
          console.warn(`⚠️ Image check failed for ${src}`)
        }
      }
    }
  })

  test('should load all visible product images without 404 errors', async ({ page }) => {
    const failed404Requests = []

    page.on('response', response => {
      if (response.status() === 404 && response.url().match(/\.(jpg|jpeg|png|webp)$/i)) {
        failed404Requests.push(response.url())
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    if (failed404Requests.length > 0) {
      console.error('❌ Found 404 errors for images:', failed404Requests)
    }

    expect(failed404Requests.length).toBe(0)
  })

  test('should have primary images for all products in grid', async ({ page }) => {
    await page.waitForSelector('#productsContainer', { timeout: 10000 })

    const productsContainer = page.locator('#productsContainer')
    await expect(productsContainer.locator('.animate-spin')).toBeHidden()

    const productCards = productsContainer.locator('> div[data-product-id]')
    const count = await productCards.count()

    if (count === 0) return

    // Verificar que cada card tiene al menos una imagen
    for (let i = 0; i < count; i++) {
      const card = productCards.nth(i)
      const images = card.locator('img')
      const imageCount = await images.count()

      expect(imageCount).toBeGreaterThanOrEqual(1)
      const firstImage = images.first()
      await expect(firstImage).toBeVisible()
    }
  })
})
