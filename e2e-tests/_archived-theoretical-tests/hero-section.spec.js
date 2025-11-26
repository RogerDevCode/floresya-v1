import { test, expect } from '@playwright/test'
import { setupPages } from '../utils/page-setup.js'

test.describe('Hero Section - Complete Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await setupPages(page)
    await page.goto('/')
    await page.waitForLoad()
  })

  test.describe('Hero Section Structure and Content', () => {
    test('should display hero image correctly', async ({ page }) => {
      const heroImage = page.locator('[data-testid="hero-background-image"]')
      await expect(heroImage).toBeVisible()
      await expect(heroImage).toHaveAttribute('loading', 'eager')
      await expect(heroImage).toHaveAttribute('alt', 'Exclusivo ramo de flores')
    })

    test('should have proper heading hierarchy', async ({ page }) => {
      const heroTitle = page.locator('[data-testid="hero-title"]')
      await expect(heroTitle).toBeVisible()
      await expect(heroTitle).toContainText('Flores que')
      await expect(heroTitle).toContainText('Inspiran')

      // Verificar que sea h1
      await expect(heroTitle).toHaveTag('h1')
      await expect(heroTitle).toHaveAttribute('id', 'hero-title')
    })

    test('should display descriptive content', async ({ page }) => {
      const heroDescription = page.locator('[data-testid="hero-description"]')
      await expect(heroDescription).toBeVisible()

      const descriptionText = await heroDescription.textContent()
      expect(descriptionText).toContain('Diseños florales de vanguardia')
      expect(descriptionText).toContain('entregados con precisión')
      expect(descriptionText).toContain('Gran Caracas')
    })

    test('should show promotional badge', async ({ page }) => {
      const badge = page.locator('[data-testid="hero-promotional-badge"]')
      await expect(badge).toBeVisible()
      await expect(badge).toContainText('Nueva Colección 2025')

      // Verificar estilos del badge
      await expect(badge).toHaveClass(/rounded-full/)
      await expect(badge).toHaveClass(/backdrop-blur-md/)
    })
  })

  test.describe('Hero Section Call-to-Action Buttons', () => {
    test('should display "Explorar Catálogo" button', async ({ page }) => {
      const exploreBtn = page.locator('[data-testid="hero-explore-btn"]')
      await expect(exploreBtn).toBeVisible()
      await expect(exploreBtn).toContainText('Explorar Catálogo')
      await expect(exploreBtn).toHaveAttribute('href', '#productos')

      // Verificar ícono SVG
      const icon = exploreBtn.locator('svg')
      await expect(icon).toBeVisible()
    })

    test('should display "Bodas y Eventos" button', async ({ page }) => {
      const eventsBtn = page.locator('[data-testid="hero-events-btn"]')
      await expect(eventsBtn).toBeVisible()
      await expect(eventsBtn).toContainText('Bodas y Eventos')
      await expect(eventsBtn).toHaveAttribute('href', '#bodas')

      // Verificar estilos del botón secundario
      await expect(eventsBtn).toHaveClass(/bg-white\/10/)
      await expect(eventsBtn).toHaveClass(/backdrop-blur-md/)
      await expect(eventsBtn).toHaveClass(/border/)
    })

    test('should navigate to products when clicking "Explorar Catálogo"', async ({ page }) => {
      const exploreBtn = page.locator('[data-testid="hero-explore-btn"]')
      await exploreBtn.click()

      // Esperar que la página se desplace
      await page.waitForTimeout(500)

      // Verificar que estamos en la sección de productos
      const productsSection = page.locator('[data-testid="productos-section"]')
      await expect(productsSection).toBeInViewport()
    })

    test('should navigate to events when clicking "Bodas y Eventos"', async ({ page }) => {
      const eventsBtn = page.locator('[data-testid="hero-events-btn"]')
      await eventsBtn.click()

      await page.waitForTimeout(500)

      // Verificar URL o sección de bodas (si existe)
      const url = page.url()
      if (url.includes('#bodas')) {
        const bodasSection = page.locator('[data-testid="bodas-section"]')
        await expect(bodasSection).toBeInViewport()
      } else {
        // Si no hay sección de bodas, debería ir a contacto
        expect(url).toContain('contacto')
      }
    })

    test('should have proper hover effects on buttons', async ({ page }) => {
      const exploreBtn = page.locator('[data-testid="hero-explore-btn"]')
      const eventsBtn = page.locator('[data-testid="hero-events-btn"]')

      // Verificar hover en botón de explorar
      await exploreBtn.hover()
      await expect(exploreBtn).toHaveClass(/hover:bg-rose-700/)
      await expect(exploreBtn).toHaveClass(/hover:shadow-lg/)

      // Verificar hover en botón de eventos
      await eventsBtn.hover()
      await expect(eventsBtn).toHaveClass(/hover:bg-white\/20/)

      // Verificar que se eliminen las clases hover al quitar el mouse
      await page.mouse.move(0, 0)
      await expect(eventsBtn).not.toHaveClass(/hover:bg-white\/20/)
    })
  })

  test.describe('Hero Section Visual Effects and Layout', () => {
    test('should have proper overlay gradient', async ({ page }) => {
      const overlay = page.locator('[data-testid="hero-overlay"]')
      await expect(overlay).toBeVisible()
      await expect(overlay).toHaveClass(/bg-gradient-to-r/)
      await expect(overlay).toHaveClass(/from-slate-900/)
      await expect(overlay).toHaveClass(/to-transparent/)
    })

    test('should have responsive layout', async ({ page }) => {
      // Desktop
      await page.setViewportSize({ width: 1280, height: 800 })
      let heroContainer = page.locator('[data-testid="hero-container"]')

      let containerBox = await heroContainer.boundingBox()
      expect(containerBox.width).toBeGreaterThan(900)
      expect(containerBox.height).toBeGreaterThan(400)

      // Mobile
      await page.setViewportSize({ width: 375, height: 667 })
      heroContainer = page.locator('[data-testid="hero-container"]')

      containerBox = await heroContainer.boundingBox()
      expect(containerBox.width).toBeLessThan(400)
      expect(containerBox.height).toBeGreaterThan(300)

      // Verificar que el contenido sea legible en mobile
      const heroTitle = page.locator('[data-testid="hero-title"]')
      await expect(heroTitle).toBeVisible()
      await expect(heroTitle).toBeInViewport()
    })

    test('should have smooth animations and transitions', async ({ page }) => {
      const exploreBtn = page.locator('[data-testid="hero-explore-btn"]')

      // Verificar transición de entrada del botón
      const initialStyles = await exploreBtn.evaluate(el => ({
        transition: window.getComputedStyle(el).transition,
        transform: window.getComputedStyle(el).transform
      }))

      expect(initialStyles.transition).toContain('transition')
      expect(initialStyles.transform).toContain('none')

      // Verificar efecto hover con animación
      await exploreBtn.hover()
      const hoverStyles = await exploreBtn.evaluate(el => ({
        transition: window.getComputedStyle(el).transition,
        transform: window.getComputedStyle(el).transform
      }))

      expect(hoverStyles.transition).toContain('all')
      expect(hoverStyles.transform).not.toBe('none')
    })

    test('should maintain aspect ratio on different screen sizes', async ({ page }) => {
      const heroImage = page.locator('[data-testid="hero-background-image"]')

      // Probar diferentes viewports
      const viewports = [
        { width: 1920, height: 1080 }, // Desktop grande
        { width: 1440, height: 900 }, // Desktop
        { width: 1024, height: 768 }, // Tablet
        { width: 768, height: 1024 }, // Tablet portrait
        { width: 375, height: 667 } // Mobile
      ]

      for (const viewport of viewports) {
        await page.setViewportSize(viewport)
        await page.waitForTimeout(100)

        const isIntersecting = await heroImage.evaluate(el => {
          const rect = el.getBoundingClientRect()
          return rect.width > 0 && rect.height > 0
        })

        expect(isIntersecting).toBe(true)
      }
    })
  })

  test.describe('Hero Section Accessibility', () => {
    test('should have proper ARIA labels and roles', async ({ page }) => {
      const heroSection = page.locator('[data-testid="hero-section"]')
      await expect(heroSection).toHaveAttribute('role', 'banner')
      await expect(heroSection).toHaveAttribute('aria-labelledby', 'hero-title')

      const heroTitle = page.locator('[data-testid="hero-title"]')
      await expect(heroTitle).toHaveAttribute('id', 'hero-title')

      const exploreBtn = page.locator('[data-testid="hero-explore-btn"]')
      await expect(exploreBtn).toBeVisible()

      const eventsBtn = page.locator('[data-testid="hero-events-btn"]')
      await expect(eventsBtn).toBeVisible()
    })

    test('should be keyboard navigable', async ({ page }) => {
      // Tab a través de elementos del hero
      await page.keyboard.press('Tab') // Debe enfocar el título o primer botón
      await expect(
        page.locator('[data-testid="hero-explore-btn"], [data-testid="hero-title"]').first()
      ).toBeFocused()

      await page.keyboard.press('Tab') // Segundo botón
      await expect(page.locator('[data-testid="hero-events-btn"]')).toBeFocused()

      // Probar Enter en botones
      await page.keyboard.press('Enter')

      // Debe navegar a productos o eventos
      await page.waitForTimeout(500)
      const url = page.url()
      expect(url.includes('#productos') || url.includes('#bodas') || url.includes('contacto')).toBe(
        true
      )
    })

    test('should have sufficient color contrast', async ({ page }) => {
      // Verificar contraste del texto con el overlay
      const heroTitle = page.locator('[data-testid="hero-title"]')
      const titleStyles = await heroTitle.evaluate(el => ({
        color: window.getComputedStyle(el).color,
        backgroundColor: window.getComputedStyle(el).backgroundColor
      }))

      // El título debe tener buen contraste con el overlay
      expect(titleStyles.color).not.toBe('rgba(0, 0, 0, 0)')
      expect(titleStyles.color).not.toBe('rgb(255, 255, 255)')

      // Debe ser blanco o near-white sobre overlay oscuro
      const rgbMatch = titleStyles.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1])
        const g = parseInt(rgbMatch[2])
        const b = parseInt(rgbMatch[3])
        expect(r + g + b).toBeGreaterThan(600) // Texto claro
      }

      const heroDescription = page.locator('[data-testid="hero-description"]')
      const descStyles = await heroDescription.evaluate(el => ({
        color: window.getComputedStyle(el).color
      }))

      const descRgbMatch = descStyles.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
      if (descRgbMatch) {
        const r = parseInt(descRgbMatch[1])
        const g = parseInt(descRgbMatch[2])
        const b = parseInt(descRgbMatch[3])
        expect(r + g + b).toBeGreaterThan(600)
      }
    })

    test('should be screen reader friendly', async ({ page }) => {
      const heroSection = page.locator('[data-testid="hero-section"]')

      // Verificar que hay contenido textual alternativo
      const heroImage = page.locator('[data-testid="hero-background-image"]')
      await expect(heroImage).toHaveAttribute('alt')
      await expect(heroImage.getAttribute('alt')).not.toBe('')

      const heroTitle = page.locator('[data-testid="hero-title"]')
      await expect(heroTitle).toHaveAttribute('id')

      // Verificar landmarks
      await expect(heroSection).toHaveAttribute('role', 'banner')
      await expect(heroSection).toHaveAttribute('aria-labelledby', 'hero-title')

      // Verificar que los botones tengan contexto
      const exploreBtn = page.locator('[data-testid="hero-explore-btn"]')
      const eventsBtn = page.locator('[data-testid="hero-events-btn"]')

      await expect(exploreBtn).toBeVisible()
      await expect(eventsBtn).toBeVisible()
    })
  })

  test.describe('Hero Section Performance and Optimization', () => {
    test('should load hero image efficiently', async ({ page }) => {
      const startTime = Date.now()

      // Limpiar caché y recargar
      await page.context().clearCookies()
      await page.evaluate(() => localStorage.clear())

      await page.goto('/')
      await page.waitForLoad()

      const loadTime = Date.now() - startTime

      // La imagen hero debe cargar rápidamente (< 2 segundos)
      expect(loadTime).toBeLessThan(2000)

      const heroImage = page.locator('[data-testid="hero-background-image"]')
      await expect(heroImage).toBeVisible()

      // Verificar que la imagen tenga loading="eager"
      await expect(heroImage).toHaveAttribute('loading', 'eager')
    })

    test('should be SEO optimized', async ({ page }) => {
      // Verificar meta tags relevantes para el hero section
      const title = await page.title()
      expect(title).toContain('FloresYa')
      expect(title).toContain('Floristería')

      const description = await page.locator('meta[name="description"]').getAttribute('content')
      expect(description).toContain('flores')
      expect(description).toContain('arreglos')
      expect(description).toContain('Gran Caracas')

      // Verificar Open Graph tags
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
      expect(ogTitle).toContain('FloresYa')

      const ogDescription = await page
        .locator('meta[property="og:description"]')
        .getAttribute('content')
      expect(ogDescription).toContain('Hermosos ramos')

      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content')
      expect(ogImage).toBeTruthy()
    })

    test('should handle image loading errors gracefully', async ({ page }) => {
      // Simular error en carga de imagen
      await page.route('**/images/hero-flowers.webp', route => {
        route.fulfill({
          status: 404
        })
      })

      await page.goto('/')
      await page.waitForLoad()

      // Debe mostrar fallback o mensaje apropiado
      const heroContainer = page.locator('[data-testid="hero-container"]')
      await expect(heroContainer).toBeVisible()

      // El contenido debe seguir siendo visible
      const heroTitle = page.locator('[data-testid="hero-title"]')
      await expect(heroTitle).toBeVisible()

      const heroDescription = page.locator('[data-testid="hero-description"]')
      await expect(heroDescription).toBeVisible()

      // Los botones CTA deben seguir funcionando
      const exploreBtn = page.locator('[data-testid="hero-explore-btn"]')
      await expect(exploreBtn).toBeVisible()
    })

    test('should not cause layout shift during load', async ({ page }) => {
      // Medir CLS (Cumulative Layout Shift)
      const layoutShifts = []

      await page.evaluateOnNewDocument(() => {
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              layoutShifts.push(entry.value)
            }
          }
        }).observe({ type: 'layout-shift', buffered: true })
      })

      await page.goto('/')
      await page.waitForLoad()

      // La sección hero no debe causar layout shifts significativos
      const totalShift = await page.evaluate(() => {
        return layoutShifts.reduce((sum, shift) => sum + shift, 0)
      })

      expect(totalShift).toBeLessThan(0.1) // Muy bajo CLS
    })
  })

  test.describe('Hero Section Integration', () => {
    test('should integrate with theme system', async ({ page }) => {
      // Cambiar a tema oscuro
      const darkThemeBtn = page.locator('[data-testid="theme-btn-3"]')
      if (await darkThemeBtn.isVisible()) {
        await darkThemeBtn.click()
        await page.waitForTimeout(500)
      }

      // Verificar que el hero se adapte al tema
      const heroSection = page.locator('[data-testid="hero-section"]')

      // El overlay puede cambiar con el tema
      const overlay = page.locator('[data-testid="hero-overlay"]')
      await expect(overlay).toBeVisible()

      // El texto debe seguir siendo legible
      const heroTitle = page.locator('[data-testid="hero-title"]')
      await expect(heroTitle).toBeVisible()

      const titleStyles = await heroTitle.evaluate(el => ({
        color: window.getComputedStyle(el).color
      }))

      expect(titleStyles.color).toBeTruthy()
      expect(titleStyles.color).not.toBe('transparent')
    })

    test('should work with different device orientations', async ({ page }) => {
      // Portrait mode (mobile)
      await page.setViewportSize({ width: 375, height: 812 })

      const heroContainer = page.locator('[data-testid="hero-container"]')
      await expect(heroContainer).toBeVisible()

      const heroTitle = page.locator('[data-testid="hero-title"]')
      await expect(heroTitle).toBeInViewport()

      const heroDescription = page.locator('[data-testid="hero-description"]')
      await expect(heroDescription).toBeInViewport()

      // Landscape mode (mobile)
      await page.setViewportSize({ width: 812, height: 375 })

      await expect(heroContainer).toBeVisible()
      await expect(heroTitle).toBeInViewport()
      await expect(heroDescription).toBeInViewport()
    })

    test('should handle scroll behavior correctly', async ({ page }) => {
      const heroSection = page.locator('[data-testid="hero-section"]')

      // Verificar posición inicial
      await expect(heroSection).toBeInViewport()

      // Scroll hacia abajo
      await page.evaluate(() => {
        window.scrollTo(0, 500)
      })

      await page.waitForTimeout(500)

      // En mobile pequeño, el hero puede salir de viewport
      const isHeroVisible = await heroSection.isVisible()
      const viewport = page.viewportSize()

      if (viewport.height < 600) {
        // En mobile, puede salir de viewport al scrollear
        expect(isHeroVisible).toBe(false)
      } else {
        // En desktop, debe seguir parcialmente visible
        expect(isHeroVisible).toBe(true)
      }

      // Scroll de regreso al inicio
      await page.evaluate(() => {
        window.scrollTo(0, 0)
      })

      await page.waitForTimeout(500)
      await expect(heroSection).toBeInViewport()
    })
  })
})
