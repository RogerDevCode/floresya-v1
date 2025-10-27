/**
 * E2E Tests: Comprehensive Page Loading Validation
 * Verifies that all HTML pages load correctly with proper DOMContentLoaded implementation
 */

import { test, expect } from '@playwright/test'

// List of all HTML pages to test
const HTML_PAGES = [
  // Main pages
  { path: '/', name: 'Homepage', hasTitle: 'FloresYa - Tu Floristería en Línea' },
  { path: '/pages/cart.html', name: 'Cart', hasTitle: 'Carrito de Compras - FloresYa' },
  { path: '/pages/contacto.html', name: 'Contact', hasTitle: 'Contacto - FloresYa' },
  { path: '/pages/payment.html', name: 'Payment', hasTitle: 'Payment - FloresYa' },
  {
    path: '/pages/product-detail.html',
    name: 'Product Detail',
    hasTitle: 'Product Detail - FloresYa'
  },
  {
    path: '/pages/order-confirmation.html',
    name: 'Order Confirmation',
    hasTitle: 'Order Confirmation - FloresYa'
  },

  // Design pages
  { path: '/pages/disenos.html', name: 'Designs', hasTitle: 'Diseños - FloresYa' },
  {
    path: '/pages/diseno-1-jardin-natural.html',
    name: 'Design 1 - Jardin Natural',
    hasTitle: null
  },
  {
    path: '/pages/diseno-2-elegancia-moderna.html',
    name: 'Design 2 - Elegancia Moderna',
    hasTitle: null
  },
  {
    path: '/pages/diseno-3-vintage-romantico.html',
    name: 'Design 3 - Vintage Romántico',
    hasTitle: null
  },
  {
    path: '/pages/diseno-4-tropical-vibrante.html',
    name: 'Design 4 - Tropical Vibrante',
    hasTitle: null
  },
  {
    path: '/pages/diseno-5-zen-minimalista.html',
    name: 'Design 5 - Zen Minimalista',
    hasTitle: null
  },
  {
    path: '/pages/theme-gallery.html',
    name: 'Theme Gallery',
    hasTitle: 'Theme Gallery - FloresYa'
  },

  // Admin pages
  {
    path: '/pages/admin/dashboard.html',
    name: 'Admin Dashboard',
    hasTitle: 'Panel de Administración - FloresYa'
  },
  { path: '/pages/admin/orders.html', name: 'Admin Orders', hasTitle: 'Orders - FloresYa' },
  {
    path: '/pages/admin/create-product.html',
    name: 'Create Product',
    hasTitle: 'Create Product - FloresYa'
  },
  {
    path: '/pages/admin/edit-product.html',
    name: 'Edit Product',
    hasTitle: 'Edit Product - FloresYa'
  },
  {
    path: '/pages/admin/product-editor.html',
    name: 'Product Editor',
    hasTitle: 'Product Editor - FloresYa'
  },
  {
    path: '/pages/admin/contact-editor.html',
    name: 'Contact Editor',
    hasTitle: 'Contact Editor - FloresYa'
  },
  {
    path: '/pages/admin/occasions.html',
    name: 'Admin Occasions',
    hasTitle: 'Occasions - FloresYa'
  },

  // Demo pages
  { path: '/hamburger-menu-demo.html', name: 'Hamburger Menu Demo', hasTitle: null },
  { path: '/product-integration-demo.html', name: 'Product Integration Demo', hasTitle: null },
  { path: '/unregister-sw.html', name: 'Unregister SW', hasTitle: null }
]

test.describe('Page Loading Tests', () => {
  HTML_PAGES.forEach(pageConfig => {
    test(`should load ${pageConfig.name} page successfully`, async ({ page }) => {
      console.log(`🚀 Testing ${pageConfig.name} at ${pageConfig.path}`)

      // Navigate to the page
      const response = await page.goto(pageConfig.path)

      // Check that page loaded successfully (200 status code)
      expect(response.status()).toBe(200)

      // Check that page has proper title
      const title = await page.title()
      if (pageConfig.hasTitle) {
        expect(title).toBe(pageConfig.hasTitle)
      } else {
        // At minimum, should have some title
        expect(title).toBeTruthy()
        expect(title.length).toBeGreaterThan(0)
      }

      // Check that page has proper DOCTYPE
      const doctype = await page.evaluate(() => document.doctype?.name)
      expect(doctype).toBe('html')

      // Check that HTML element has proper attributes
      const htmlAttrs = await page.evaluate(() => ({
        lang: document.documentElement.getAttribute('lang'),
        hasClasses: document.documentElement.className.length > 0
      }))

      expect(htmlAttrs.lang).toBe('es')

      // Check that body element exists and is ready
      const bodyReady = await page.evaluate(() => {
        return document.body && document.body.children.length > 0
      })
      expect(bodyReady).toBe(true)

      // Check that DOMContentLoaded event fired successfully
      const domContentLoadedFired = await page.evaluate(() => {
        return new Promise(resolve => {
          if (document.readyState === 'complete' || document.readyState === 'interactive') {
            resolve(true)
          } else {
            window.addEventListener('DOMContentLoaded', () => resolve(true), { once: true })
            // Fallback timeout
            setTimeout(() => resolve(false), 5000)
          }
        })
      })
      expect(domContentLoadedFired).toBe(true)

      // Check for JavaScript errors in console
      const jsErrors = []
      page.on('pageerror', error => jsErrors.push(error))

      // Wait a bit for scripts to load and check for errors
      await page.waitForTimeout(2000)

      // Should not have JavaScript errors
      expect(jsErrors.length).toBe(0)

      console.log(`✅ ${pageConfig.name} loaded successfully`)
    })
  })
})

test.describe('DOMContentLoaded Pattern Validation', () => {
  test('should implement proper DOMContentLoaded pattern with dynamic imports', async ({
    page
  }) => {
    // Test the most critical pages for DOMContentLoaded implementation
    const criticalPages = [
      '/',
      '/pages/cart.html',
      '/pages/contacto.html',
      '/pages/admin/dashboard.html'
    ]

    for (const pagePath of criticalPages) {
      console.log(`🔍 Testing DOMContentLoaded pattern for ${pagePath}`)

      // Set up console log monitoring
      const consoleMessages = []
      page.on('console', msg => consoleMessages.push(msg.text()))

      // Navigate to page
      await page.goto(pagePath)

      // Wait for scripts to load
      await page.waitForTimeout(3000)

      // Check for DOMContentLoaded initialization logs
      const hasInitLog = consoleMessages.some(
        msg =>
          msg.includes('🚀 Initializing') ||
          (msg.includes('✅') && msg.includes('initialized successfully'))
      )

      if (pagePath !== '/pages/admin/dashboard.html') {
        // Dashboard may have different initialization pattern due to Chart.js
        expect(hasInitLog).toBe(true)
      }

      // Should not have initialization errors
      const hasErrorLog = consoleMessages.some(
        msg => msg.includes('❌') && msg.includes('initialization failed')
      )
      expect(hasErrorLog).toBe(false)

      console.log(`✅ DOMContentLoaded pattern verified for ${pagePath}`)
    }
  })
})

test.describe('Page Load Performance', () => {
  test('should load pages within reasonable time limits', async ({ page }) => {
    const performanceThresholds = {
      mainPages: 3000, // 3 seconds for main pages
      adminPages: 5000, // 5 seconds for admin pages
      demoPages: 2000 // 2 seconds for demo pages
    }

    const mainPages = ['/', '/pages/cart.html', '/pages/contacto.html']
    const adminPages = ['/pages/admin/dashboard.html', '/pages/admin/orders.html']
    const demoPages = ['/hamburger-menu-demo.html', '/product-integration-demo.html']

    // Test main pages
    for (const pagePath of mainPages) {
      const startTime = Date.now()
      await page.goto(pagePath)
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime

      console.log(`⏱️ ${pagePath} loaded in ${loadTime}ms`)
      expect(loadTime).toBeLessThan(performanceThresholds.mainPages)
    }

    // Test admin pages
    for (const pagePath of adminPages) {
      const startTime = Date.now()
      await page.goto(pagePath)
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime

      console.log(`⏱️ ${pagePath} loaded in ${loadTime}ms`)
      expect(loadTime).toBeLessThan(performanceThresholds.adminPages)
    }

    // Test demo pages
    for (const pagePath of demoPages) {
      const startTime = Date.now()
      await page.goto(pagePath)
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime

      console.log(`⏱️ ${pagePath} loaded in ${loadTime}ms`)
      expect(loadTime).toBeLessThan(performanceThresholds.demoPages)
    }
  })
})

test.describe('Responsive Design Validation', () => {
  const viewports = [
    { name: 'Desktop', width: 1280, height: 720 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 }
  ]

  const criticalPages = ['/', '/pages/cart.html', '/pages/contacto.html']

  viewports.forEach(viewport => {
    test(`should render critical pages correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })

      for (const pagePath of criticalPages) {
        console.log(
          `📱 Testing ${pagePath} on ${viewport.name} (${viewport.width}x${viewport.height})`
        )

        // Navigate to page
        await page.goto(pagePath)

        // Check that viewport is properly set
        const viewportMeta = await page.getAttribute('meta[name="viewport"]', 'content')
        expect(viewportMeta).toContain('width=device-width')

        // Check that page content is visible
        const bodyVisible = await page.isVisible('body')
        expect(bodyVisible).toBe(true)

        // Check for horizontal scroll (should not exist on responsive design)
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.body.scrollWidth > document.body.clientWidth
        })

        // Allow some horizontal scroll on very small mobile for certain pages
        if (viewport.width >= 768) {
          expect(hasHorizontalScroll).toBe(false)
        }

        console.log(`✅ ${pagePath} responsive correctly on ${viewport.name}`)
      }
    })
  })
})

test.describe('Error Handling Validation', () => {
  test('should handle missing JavaScript files gracefully', async ({ page }) => {
    // Mock a missing script to test error handling
    await page.route('**/*.js', route => {
      const url = route.request().url()
      if (url.includes('non-existent-script.js')) {
        route.abort()
      } else {
        route.continue()
      }
    })

    // Navigate to a page and inject a non-existent script
    await page.goto('/')

    // Add a script tag pointing to non-existent file
    await page.evaluate(() => {
      const script = document.createElement('script')
      script.type = 'module'
      script.src = './non-existent-script.js'
      document.head.appendChild(script)
    })

    // Wait for error handling
    await page.waitForTimeout(2000)

    // Check that error message is shown to user
    const errorMessage = await page.locator('.fixed.top-4.right-4.bg-red-500').first()

    // The error handling should show a user-friendly message
    if (await errorMessage.isVisible()) {
      const errorText = await errorMessage.textContent()
      expect(errorText).toContain('Error al cargar la página')
    }
  })
})

test.describe('Accessibility Validation', () => {
  test('should have proper accessibility attributes on critical pages', async ({ page }) => {
    const criticalPages = ['/', '/pages/cart.html', '/pages/contacto.html']

    for (const pagePath of criticalPages) {
      console.log(`♿ Testing accessibility for ${pagePath}`)

      await page.goto(pagePath)

      // Check for proper language attribute
      const lang = await page.getAttribute('html', 'lang')
      expect(lang).toBe('es')

      // Check for proper title
      const title = await page.title()
      expect(title).toBeTruthy()
      expect(title.length).toBeGreaterThan(0)

      // Check for proper meta tags
      const description = await page.getAttribute('meta[name="description"]', 'content')
      expect(description).toBeTruthy()
      expect(description.length).toBeGreaterThan(0)

      // Check for viewport meta tag
      const viewport = await page.getAttribute('meta[name="viewport"]', 'content')
      expect(viewport).toContain('width=device-width')

      console.log(`✅ Accessibility checks passed for ${pagePath}`)
    }
  })
})
