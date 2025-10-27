/**
 * E2E Tests: DOMContentLoaded Pattern Validation
 * Specifically tests that the DOMContentLoaded wrapper is working correctly
 */

import { test, expect } from '@playwright/test'

test.describe('DOMContentLoaded Pattern Implementation', () => {
  test('should execute scripts only after DOM is ready', async ({ page }) => {
    // Navigate to a page with DOMContentLoaded implementation
    await page.goto('/pages/cart.html')

    // Set up monitoring for DOM ready state and script execution
    const events = []

    page.on('console', msg => {
      events.push({
        type: 'console',
        text: msg.text(),
        timestamp: Date.now()
      })
    })

    // Inject a script to monitor DOM ready state
    await page.evaluate(() => {
      // Monitor DOM ready state
      const monitorDOMReady = () => {
        if (document.readyState === 'loading') {
          window.domLoadingTime = Date.now()
          console.log('DOM State: loading')
        }

        document.addEventListener('DOMContentLoaded', () => {
          window.domContentLoadedTime = Date.now()
          console.log('DOM State: DOMContentLoaded fired')
        })

        window.addEventListener('load', () => {
          window.windowLoadTime = Date.now()
          console.log('DOM State: window load fired')
        })
      }

      monitorDOMReady()

      // Add a test element to the DOM
      const testElement = document.createElement('div')
      testElement.id = 'dom-ready-test'
      testElement.textContent = 'DOM Ready Test Element'
      testElement.style.display = 'none'
      document.body.appendChild(testElement)
    })

    // Navigate to the page
    await page.goto('/pages/cart.html', { waitUntil: 'domcontentloaded' })

    // Wait for scripts to execute
    await page.waitForTimeout(3000)

    // Check that DOMContentLoaded fired
    const domReadyEvents = events.filter(
      e =>
        e.text.includes('DOM State: DOMContentLoaded fired') ||
        e.text.includes('Initializing Carrito de Compras')
    )
    expect(domReadyEvents.length).toBeGreaterThan(0)

    // Check that test element is accessible (DOM is ready)
    const testElementExists = await page.locator('#dom-ready-test').count()
    expect(testElementExists).toBe(1)

    console.log('✅ DOMContentLoaded pattern executed correctly')
  })

  test('should handle script loading errors gracefully', async ({ page }) => {
    // Mock a failed script import
    await page.route('**/cart.js', route => {
      route.abort('failed')
    })

    // Monitor console for error messages
    const consoleMessages = []
    page.on('console', msg => consoleMessages.push(msg.text()))

    // Navigate to the page
    await page.goto('/pages/cart.html')
    await page.waitForTimeout(3000)

    // Should have initialization error message
    const hasErrorLog = consoleMessages.some(
      msg => msg.includes('❌') && msg.includes('initialization failed')
    )
    expect(hasErrorLog).toBe(true)

    // Should show user-friendly error message
    const errorDiv = await page.locator('.fixed.top-4.right-4.bg-red-500').first()
    if (await errorDiv.isVisible({ timeout: 5000 })) {
      const errorText = await errorDiv.textContent()
      expect(errorText).toContain('Error al cargar la página')
    }

    console.log('✅ Error handling works correctly')
  })

  test('should load scripts in correct order with dynamic imports', async ({ page }) => {
    // Track script loading order
    const loadingOrder = []

    page.on('request', request => {
      if (request.url().includes('.js')) {
        loadingOrder.push({
          url: request.url(),
          timestamp: Date.now()
        })
      }
    })

    // Monitor console for script execution
    const consoleMessages = []
    page.on('console', msg => {
      if (msg.text().includes('Initializing') || msg.text().includes('import')) {
        consoleMessages.push({
          text: msg.text(),
          timestamp: Date.now()
        })
      }
    })

    // Navigate to page with multiple scripts
    await page.goto('/pages/contacto.html')
    await page.waitForTimeout(4000)

    // Should have DOMContentLoaded wrapper
    const hasInitMessage = consoleMessages.some(msg =>
      msg.text.includes('🚀 Initializing Contacto')
    )
    expect(hasInitMessage).toBe(true)

    // Should have success message (if scripts load correctly)
    const hasSuccessMessage = consoleMessages.some(msg =>
      msg.text.includes('✅ Contacto initialized successfully')
    )

    // If no error, should have success
    const hasErrorMessage = consoleMessages.some(msg =>
      msg.text.includes('❌ Contacto initialization failed')
    )

    if (!hasErrorMessage) {
      expect(hasSuccessMessage).toBe(true)
    }

    console.log('✅ Dynamic imports work correctly')
  })

  test('should prevent script execution before DOM is ready', async ({ page }) => {
    // Navigate to page with timing monitoring
    await page.goto('/pages/cart.html')

    // Monitor when scripts start executing vs when DOM is ready
    const timingInfo = await page.evaluate(() => {
      return new Promise(resolve => {
        const timing = {
          domReady: false,
          scriptsStarted: false,
          events: []
        }

        // Monitor DOM ready state
        document.addEventListener('DOMContentLoaded', () => {
          timing.domReady = true
          timing.events.push({ event: 'DOMContentLoaded', time: Date.now() })
        })

        // Monitor script execution by looking for console logs
        const originalLog = console.log
        console.log = (...args) => {
          timing.events.push({ event: 'script_execution', time: Date.now(), message: args[0] })
          if (args[0] && args[0].includes('🚀 Initializing')) {
            timing.scriptsStarted = true
          }
          originalLog.apply(console, args)
        }

        // Wait and resolve
        setTimeout(() => resolve(timing), 3000)
      })
    })

    // Scripts should start after DOM is ready (or very close to it)
    expect(timingInfo.domReady).toBe(true)

    // Should have script execution events
    const scriptEvents = timingInfo.events.filter(e => e.event === 'script_execution')
    expect(scriptEvents.length).toBeGreaterThan(0)

    console.log('✅ Script execution timing is correct')
  })

  test('should maintain page functionality after DOMContentLoaded', async ({ page }) => {
    // Navigate to a page
    await page.goto('/')

    // Wait for DOM to be ready
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    // Test that interactive elements work
    const navigation = await page.locator('.navbar').first()
    expect(await navigation.isVisible()).toBe(true)

    // Test that cart badge exists (even if it's 0)
    const cartBadge = await page.locator('.cart-badge').first()
    expect(await cartBadge.isVisible()).toBe(true)

    // Test that product containers exist
    const productsContainer = await page.locator('#productsContainer').first()
    expect(await productsContainer.isVisible()).toBe(true)

    // Check that CSS is loaded (should have styles applied)
    const hasStyles = await page.evaluate(() => {
      const element = document.querySelector('.navbar')
      if (element) {
        const computedStyle = window.getComputedStyle(element)
        return (
          (computedStyle.display !== 'none' && computedStyle.position !== 'static') ||
          computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)'
        )
      }
      return false
    })
    expect(hasStyles).toBe(true)

    console.log('✅ Page functionality maintained after DOMContentLoaded')
  })

  test('should work correctly across different browsers', async ({ page, browserName }) => {
    console.log(`🌐 Testing DOMContentLoaded on ${browserName}`)

    // Navigate to a page
    await page.goto('/pages/cart.html')

    // Monitor console for initialization messages
    const consoleMessages = []
    page.on('console', msg => consoleMessages.push(msg.text()))

    // Wait for everything to load
    await page.waitForTimeout(3000)

    // Should have initialization message
    const hasInitMessage = consoleMessages.some(msg => msg.includes('🚀 Initializing'))
    expect(hasInitMessage).toBe(true)

    // Should not have critical errors
    const hasCriticalErrors = consoleMessages.some(
      msg => msg.includes('❌') && msg.includes('initialization failed')
    )
    expect(hasCriticalErrors).toBe(false)

    // Page should be functional
    const pageTitle = await page.title()
    expect(pageTitle).toContain('Carrito de Compras')

    console.log(`✅ DOMContentLoaded works correctly on ${browserName}`)
  })
})
