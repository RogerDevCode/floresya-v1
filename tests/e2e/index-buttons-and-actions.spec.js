/**
 * @fileoverview Playwright E2E Tests for Buttons and Interactive Elements
 * Tests all buttons, clicks, and user actions throughout the page
 */

import { test, expect } from '@playwright/test'

test.describe('Index - Buttons and Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Navbar Actions', () => {
    test('should toggle cuco clock when clicked', async ({ page }) => {
      const cucoToggle = page.locator('#cuco-clock-toggle')
      await expect(cucoToggle).toBeVisible()
      await cucoToggle.click()
      await page.waitForTimeout(300)
      // Verify it can be clicked again
      await cucoToggle.click()
      await page.waitForTimeout(300)
    })

    test('should navigate to cart when clicking cart icon', async ({ page }) => {
      const cartLink = page.locator('a.nav-icon[href="/pages/cart.html"]')
      await cartLink.click()
      await expect(page).toHaveURL(/pages\/cart\.html/)
      await page.goBack()
    })

    test('should navigate to login when clicking login button', async ({ page }) => {
      const loginBtn = page.locator('a.btn-login')
      await loginBtn.click()
      // Login link is anchor to #login, should scroll
      await loginBtn.click() // Just verify it's clickable
    })
  })

  test.describe('Hero Section Buttons', () => {
    test('should have clickable primary CTA button', async ({ page }) => {
      const primaryCta = page.locator('.hero-cta a.btn-primary')
      await expect(primaryCta).toBeVisible()
      await expect(primaryCta).toContainText('Explorar Catálogo')
      await primaryCta.click()
      await page.waitForTimeout(500)
      // Check if we're on the products section by checking element visibility
      const productosSection = page.locator('#productos')
      await expect(productosSection).toBeVisible()
    })

    test('should have clickable secondary CTA button', async ({ page }) => {
      const secondaryCta = page.locator('.hero-cta a.btn-secondary')
      await expect(secondaryCta).toBeVisible()
      await expect(secondaryCta).toContainText('Arreglos para Bodas')
    })

    test('should navigate to products section from hero', async ({ page }) => {
      const primaryCta = page.locator('.hero-cta a.btn-primary')
      await primaryCta.click()
      const productosSection = page.locator('#productos')
      await expect(productosSection).toBeVisible()
      await page.waitForTimeout(500)
    })
  })

  test.describe('Carousel Action Buttons', () => {
    test.beforeEach(async ({ page }) => {
      const carousel = page.locator('#featuredCarousel')
      await expect(carousel).toBeVisible()
      await page.waitForTimeout(2000)
    })

    test('should have clickable next button', async ({ page }) => {
      const nextBtn = page.locator('#carousel-next')
      await expect(nextBtn).toBeVisible()
      await expect(nextBtn).not.toBeDisabled()
      await nextBtn.click()
      await page.waitForTimeout(600)
    })

    test('should have clickable previous button', async ({ page }) => {
      const prevBtn = page.locator('#carousel-prev')
      await expect(prevBtn).toBeVisible()
      await expect(prevBtn).not.toBeDisabled()
      await prevBtn.click()
      await page.waitForTimeout(600)
    })

    test('should navigate carousel using arrow keys', async ({ page }) => {
      // Focus on carousel and use keyboard
      const carousel = page.locator('#featuredCarousel')
      await carousel.focus()
      await page.keyboard.press('ArrowRight')
      await page.waitForTimeout(600)
      await page.keyboard.press('ArrowLeft')
      await page.waitForTimeout(600)
    })
  })

  test.describe('Product Card Actions', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/')
      const productsLink = page.locator('a.nav-link[href="#productos"]')
      await productsLink.click()
      const productCards = page.locator('#productsContainer .model-4-card')
      await expect(productCards.first()).toBeVisible()
      await page.waitForTimeout(1000)
    })

    test('should display action buttons on product cards', async ({ page }) => {
      const firstCard = page.locator('#productsContainer .model-4-card').first()
      await expect(firstCard.locator('.quick-view-btn')).toBeVisible()
      await expect(firstCard.locator('.model-4-cart')).toBeVisible()
      await expect(firstCard.locator('.model-4-buy')).toBeVisible()
    })

    test('should have visible action icons', async ({ page }) => {
      const firstCard = page.locator('#productsContainer .model-4-card').first()
      await expect(firstCard.locator('svg')).toHaveCount(3)
    })

    test('should have properly labeled action buttons', async ({ page }) => {
      const firstCard = page.locator('#productsContainer .model-4-card').first()
      await expect(firstCard.locator('.quick-view-btn')).toHaveAttribute('title', 'Vista rápida')
      await expect(firstCard.locator('.model-4-cart')).toHaveAttribute('data-action', 'add-to-cart')
      await expect(firstCard.locator('.model-4-buy')).toHaveAttribute('data-action', 'buy-now')
    })

    test('should have clickable quick view button', async ({ page }) => {
      const quickViewBtn = page.locator('.quick-view-btn').first()
      await expect(quickViewBtn).toBeVisible()
      await quickViewBtn.click()
      await page.waitForTimeout(300)
    })

    test('should have clickable add to cart button', async ({ page }) => {
      const addToCartBtn = page.locator('.model-4-cart').first()
      await expect(addToCartBtn).toBeVisible()
      await addToCartBtn.click()
      await page.waitForTimeout(300)
    })

    test('should have clickable buy now button', async ({ page }) => {
      const buyNowBtn = page.locator('.model-4-buy').first()
      await expect(buyNowBtn).toBeVisible()
      await buyNowBtn.click()
      await page.waitForTimeout(300)
    })

    test('should have data attributes for product actions', async ({ page }) => {
      const quickViewBtn = page.locator('.quick-view-btn').first()
      const addToCartBtn = page.locator('.model-4-cart').first()
      const buyNowBtn = page.locator('.model-4-buy').first()

      await expect(quickViewBtn).toHaveAttribute('data-action', 'quick-view')
      await expect(addToCartBtn).toHaveAttribute('data-action', 'add-to-cart')
      await expect(buyNowBtn).toHaveAttribute('data-action', 'buy-now')
    })
  })

  test.describe('Filter Buttons', () => {
    test.beforeEach(async ({ page }) => {
      const productsLink = page.locator('a.nav-link[href="#productos"]')
      await productsLink.click()
      const productosSection = page.locator('#productos')
      await expect(productosSection).toBeVisible()
    })

    test('should have clickable quick filter buttons', async ({ page }) => {
      const filterButtons = page.locator('#quickFilters button')
      const count = await filterButtons.count()
      for (let i = 0; i < count; i++) {
        await expect(filterButtons.nth(i)).toBeVisible()
        await expect(filterButtons.nth(i)).not.toBeDisabled()
      }
    })

    test('should toggle active state on filter buttons', async ({ page }) => {
      const filterAll = page.locator('#filter-all')
      await expect(filterAll).toHaveClass(/active/)
      await expect(filterAll).toHaveAttribute('aria-pressed', 'true')

      const otherFilters = page.locator('#quickFilters button').locator(':not(#filter-all)')
      const otherCount = await otherFilters.count()
      if (otherCount > 0) {
        await otherFilters.first().click()
        await expect(otherFilters.first()).toHaveClass(/active/)
      }
    })
  })

  test.describe('Form Input Buttons', () => {
    test.beforeEach(async ({ page }) => {
      const productsLink = page.locator('a.nav-link[href="#productos"]')
      await productsLink.click()
      const productosSection = page.locator('#productos')
      await expect(productosSection).toBeVisible()
    })

    test('should accept text input', async ({ page }) => {
      const searchInput = page.locator('#searchInput')
      await searchInput.fill('producto de prueba')
      await expect(searchInput).toHaveValue('producto de prueba')
    })

    test('should allow selection from sort dropdown', async ({ page }) => {
      const sortFilter = page.locator('#sortFilter')
      await sortFilter.selectOption('name_asc')
      await expect(sortFilter).toHaveValue('name_asc')
    })

    test('should allow selection from price range dropdown', async ({ page }) => {
      const priceRange = page.locator('#priceRange')
      await priceRange.selectOption('30-60')
      await expect(priceRange).toHaveValue('30-60')
    })
  })

  test.describe('Mobile Menu Actions', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('should toggle mobile menu', async ({ page }) => {
      const mobileToggle = page.locator('button.mobile-menu-toggle')
      await mobileToggle.click()
      const drawer = page.locator('#mobile-nav-drawer')
      await expect(drawer).toBeVisible()

      const closeBtn = page.locator('.drawer-close-btn')
      await closeBtn.click()
      await expect(drawer).not.toBeVisible()
    })

    test('should navigate using mobile menu links', async ({ page }) => {
      const mobileToggle = page.locator('button.mobile-menu-toggle')
      await mobileToggle.click()
      const drawer = page.locator('#mobile-nav-drawer')
      await expect(drawer).toBeVisible()

      const mobileLinks = page.locator('#mobile-nav-drawer a')
      await mobileLinks.first().click()
      await page.waitForTimeout(300)
    })
  })

  test.describe('Special CTA Section', () => {
    test('should display special CTA cards', async ({ page }) => {
      const specialCta = page.locator('.special-cta-section')
      await specialCta.scrollIntoViewIfNeeded()
      await expect(specialCta).toBeVisible()
      await expect(page.locator('.special-cta-section h2')).toContainText('¿Buscas algo especial?')
    })

    test('should have clickable CTA card', async ({ page }) => {
      const specialCta = page.locator('.special-cta-section')
      await specialCta.scrollIntoViewIfNeeded()
      const ctaCard = page.locator('a.cta-card').first()
      await expect(ctaCard).toBeVisible()
    })

    test('should display "Conocer más" button in CTA', async ({ page }) => {
      const specialCta = page.locator('.special-cta-section')
      await specialCta.scrollIntoViewIfNeeded()
      await expect(page.locator('.special-cta-section span.btn')).toContainText('Conocer más')
    })

    test('should display "Próximamente" button', async ({ page }) => {
      const specialCta = page.locator('.special-cta-section')
      await specialCta.scrollIntoViewIfNeeded()
      await expect(page.locator('.special-cta-section span.btn')).toContainText('Próximamente')
    })
  })

  test.describe('Footer Actions', () => {
    test.beforeEach(async ({ page }) => {
      const footer = page.locator('footer')
      await footer.scrollIntoViewIfNeeded()
    })

    test('should have clickable social media links', async ({ page }) => {
      const facebookLink = page.locator('footer a[href="https://facebook.com"]')
      const instagramLink = page.locator('footer a[href="https://instagram.com"]')
      const twitterLink = page.locator('footer a[href="https://twitter.com"]')

      await expect(facebookLink).toBeVisible()
      await expect(instagramLink).toBeVisible()
      await expect(twitterLink).toBeVisible()
    })

    test('should have clickable product links', async ({ page }) => {
      await expect(page.locator('footer')).toContainText('Rosas')
      await expect(page.locator('footer')).toContainText('Bouquets')
      await expect(page.locator('footer')).toContainText('Plantas')
      await expect(page.locator('footer')).toContainText('Arreglos')
    })

    test('should have clickable occasion links', async ({ page }) => {
      await expect(page.locator('footer')).toContainText('Amor')
      await expect(page.locator('footer')).toContainText('Cumpleaños')
      await expect(page.locator('footer')).toContainText('Aniversarios')
      await expect(page.locator('footer')).toContainText('Día de la Madre')
    })

    test('should have clickable legal links', async ({ page }) => {
      await expect(page.locator('footer')).toContainText('Términos')
      await expect(page.locator('footer')).toContainText('Privacidad')
    })
  })

  test.describe('Testimonials Interaction', () => {
    test('should display testimonials section', async ({ page }) => {
      const testimonialsSection = page.locator('.testimonials-section')
      await expect(testimonialsSection).toContainText('Lo que dicen nuestros clientes')
      await testimonialsSection.scrollIntoViewIfNeeded()
      await expect(testimonialsSection).toBeVisible()
    })

    test('should display three testimonial cards', async ({ page }) => {
      const testimonialCards = page.locator('.testimonials-section .testimonial-card')
      await expect(testimonialCards).toHaveCount(3)
    })

    test('should have styled testimonial authors', async ({ page }) => {
      const testimonialAuthors = page.locator('.testimonial-author')
      await expect(testimonialAuthors.first()).toBeVisible()
    })
  })

  test.describe('Features Section', () => {
    test('should display features section', async ({ page }) => {
      const featuresSection = page.locator('.features-section')
      await expect(featuresSection).toContainText('Flores Frescas')
      await featuresSection.scrollIntoViewIfNeeded()
      await expect(featuresSection).toBeVisible()
    })

    test('should display all four feature cards', async ({ page }) => {
      const featureCards = page.locator('.feature-card')
      await expect(featureCards).toHaveCount(4)
      await expect(page.locator('.feature-title')).toHaveText([
        'Flores Frescas',
        'Entrega Rápida',
        'Hechos con Amor',
        'Garantía Total'
      ])
    })
  })
})
