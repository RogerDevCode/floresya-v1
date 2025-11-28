import { test, expect } from '@playwright/test'
// import { setupPages } from '../utils/page-setup.js'

// Responsive Viewports para testing
const VIEWPORTS = {
  mobile: { width: 375, height: 667 }, // iPhone SE
  tablet: { width: 768, height: 1024 }, // iPad
  desktop: { width: 1280, height: 720 }, // Desktop,
  widescreen: { width: 1920, height: 1080 } // Widescreen
}

test.describe('Navigation Bar - Complete Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Configurar viewport dinámico para cada test
    await page.goto('/')
    await page.waitForLoad()
  })

  Object.entries(VIEWPORTS).forEach(([viewportName, viewport]) => {
    test.describe(`${viewportName} Viewport`, () => {
      test.use({ viewport })

      test('should display logo and be clickable', async ({ page }) => {
        const logo = page.locator('[data-testid="floresya-logo"]')
        await expect(logo).toBeVisible()

        // Click en logo lleva a página principal
        await logo.click()
        await expect(page).toHaveURL(/\/$|^\/\//)
      })

      test('should show desktop navigation on desktop', async ({ page }) => {
        const desktopNav = page.locator('[data-testid="desktop-navigation"]')

        if (viewportName === 'mobile' || viewportName === 'tablet') {
          await expect(desktopNav).toBeHidden()
        } else {
          await expect(desktopNav).toBeVisible()

          // Verificar links principales
          const inicioLink = page.locator('[data-testid="nav-inicio"]')
          const coleccionLink = page.locator('[data-testid="nav-coleccion"]')
          const contactoLink = page.locator('[data-testid="nav-contacto"]')

          await expect(inicioLink).toBeVisible()
          await expect(coleccionLink).toBeVisible()
          await expect(contactoLink).toBeVisible()

          // Test navigation
          await inicioLink.click()
          await expect(page).toHaveURL(/inicio/)
        }
      })

      test('should show mobile menu toggle on mobile', async ({ page }) => {
        const mobileMenuBtn = page.locator('[data-testid="mobile-menu-toggle"]')
        const mobileMenu = page.locator('[data-testid="mobile-menu-drawer"]')

        if (viewportName === 'mobile' || viewportName === 'tablet') {
          await expect(mobileMenuBtn).toBeVisible()
          await expect(mobileMenu).toBeHidden()

          // Abrir menú mobile
          await mobileMenuBtn.click()
          await expect(mobileMenu).toBeVisible()
          await expect(mobileMenu).toHaveClass(/open/)

          // Verificar links en menú mobile
          const mobileInicioLink = page.locator('[data-testid="mobile-menu-inicio"]')
          const mobileColeccionLink = page.locator('[data-testid="mobile-menu-coleccion"]')
          const mobileContactoLink = page.locator('[data-testid="mobile-menu-contacto"]')
          const mobileLoginLink = page.locator('[data-testid="mobile-menu-login"]')

          await expect(mobileInicioLink).toBeVisible()
          await expect(mobileColeccionLink).toBeVisible()
          await expect(mobileContactoLink).toBeVisible()
          await expect(mobileLoginLink).toBeVisible()
        } else {
          await expect(mobileMenuBtn).toBeHidden()
        }
      })

      test('should open/close mobile menu with toggle button', async ({ page }) => {
        if (viewportName !== 'mobile' && viewportName !== 'tablet') {
          test.skip()
          return
        }

        const mobileMenuBtn = page.locator('[data-testid="mobile-menu-toggle"]')
        const mobileMenu = page.locator('[data-testid="mobile-menu-drawer"]')
        const overlay = page.locator('[data-testid="mobile-menu-overlay"]')

        // Abrir menú
        await mobileMenuBtn.click()
        await expect(mobileMenu).toBeVisible()
        await expect(overlay).toBeVisible()

        // Cerrar menú con el mismo botón
        await mobileMenuBtn.click()
        await expect(mobileMenu).toBeHidden()
        await expect(overlay).toBeHidden()
      })

      test('should close mobile menu with ESC key', async ({ page }) => {
        if (viewportName !== 'mobile' && viewportName !== 'tablet') {
          test.skip()
          return
        }

        const mobileMenuBtn = page.locator('[data-testid="mobile-menu-toggle"]')
        const mobileMenu = page.locator('[data-testid="mobile-menu-drawer"]')
        const overlay = page.locator('[data-testid="mobile-menu-overlay"]')

        // Abrir menú
        await mobileMenuBtn.click()
        await expect(mobileMenu).toBeVisible()

        // Cerrar con ESC
        await page.keyboard.press('Escape')
        await expect(mobileMenu).toBeHidden()
        await expect(overlay).toBeHidden()
      })

      test('should close mobile menu with overlay click', async ({ page }) => {
        if (viewportName !== 'mobile' && viewportName !== 'tablet') {
          test.skip()
          return
        }

        const mobileMenuBtn = page.locator('[data-testid="mobile-menu-toggle"]')
        const mobileMenu = page.locator('[data-testid="mobile-menu-drawer"]')
        const overlay = page.locator('[data-testid="mobile-menu-overlay"]')

        // Abrir menú
        await mobileMenuBtn.click()
        await expect(mobileMenu).toBeVisible()

        // Cerrar click en overlay
        const overlayBox = await overlay.boundingBox()
        await page.mouse.click(overlayBox.x + 10, overlayBox.y + 10)
        await expect(mobileMenu).toBeHidden()
      })

      test('should show cart button with correct badge count', async ({ page }) => {
        const cartButton = page.locator('[data-testid="cart-button"]')
        const cartBadge = page.locator('[data-testid="cart-count-badge"]')

        await expect(cartButton).toBeVisible()

        // Verificar que badge esté presente (puede estar oculto si carrito vacío)
        const isCartEmpty = await cartBadge.isHidden()
        if (!isCartEmpty) {
          const badgeText = await cartBadge.textContent()
          expect(/^\d+$/.test(badgeText)).toBeTruthy() // Solo números
        }
      })

      test('should show login button on all viewports', async ({ page }) => {
        const loginButton = page.locator('[data-testid="login-button"]')

        if (viewportName === 'mobile' || viewportName === 'tablet') {
          await expect(loginButton).toBeVisible()
        } else {
          await expect(loginButton).toBeVisible()
        }
      })

      test('should have proper hover effects on navigation items', async ({ page }) => {
        if (viewportName === 'mobile' || viewportName === 'tablet') {
          test.skip()
          return
        }

        const inicioLink = page.locator('[data-testid="nav-inicio"]')

        // Verificar hover effect
        await inicioLink.hover()
        const computedStyle = await page.evaluate(
          el => {
            return window.getComputedStyle(el)
          },
          await inicioLink.elementHandle()
        )

        expect(computedStyle.color).not.toBe('rgb(0, 0, 0)') // No debe ser transparente
      })
    })
  })

  test('should handle keyboard navigation in mobile menu', async ({ page }) => {
    test.use({ viewport: VIEWPORTS.mobile })

    const mobileMenuBtn = page.locator('[data-testid="mobile-menu-toggle"]')
    const mobileMenu = page.locator('[data-testid="mobile-menu-drawer"]')

    // Abrir menú
    await mobileMenuBtn.click()
    await expect(mobileMenu).toBeVisible()

    // Navegación por teclado
    await page.keyboard.press('Tab') // Debe enfocar primer link
    await expect(page.locator('[data-testid="mobile-menu-inicio"]')).toBeFocused()

    await page.keyboard.press('Tab') // Siguiente link
    await expect(page.locator('[data-testid="mobile-menu-coleccion"]')).toBeFocused()

    await page.keyboard.press('Tab') // Link contacto
    await expect(page.locator('[data-testid="mobile-menu-contacto"]')).toBeFocused()

    await page.keyboard.press('Tab') // Botón login
    await expect(page.locator('[data-testid="mobile-menu-login"]')).toBeFocused()
  })

  test('should be accessible with screen readers', async ({ page }) => {
    // Verificar atributos ARIA
    const nav = page.locator('[data-testid="main-navigation"]')
    await expect(nav).toHaveAttribute('role', 'navigation')
    await expect(nav).toHaveAttribute('aria-label', 'Navegación principal')

    // Logo con aria-label
    const logo = page.locator('[data-testid="floresya-logo"] a')
    await expect(logo).toHaveAttribute('aria-label', 'Ir a la página principal de FloresYa')

    // Mobile menu accessibility
    test.use({ viewport: VIEWPORTS.mobile })
    const mobileMenuBtn = page.locator('[data-testid="mobile-menu-toggle"]')
    await expect(mobileMenuBtn).toHaveAttribute('aria-label', 'Abrir menú')
    await expect(mobileMenuBtn).toHaveAttribute('aria-expanded', 'false')

    await mobileMenuBtn.click()
    await expect(mobileMenuBtn).toHaveAttribute('aria-expanded', 'true')
    await expect(mobileMenuBtn).toHaveAttribute('aria-label', 'Cerrar menú')
  })
})
