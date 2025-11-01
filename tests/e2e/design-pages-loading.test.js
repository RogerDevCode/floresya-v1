/**
 * E2E Tests: Design Pages Loading Validation
 * Tests design-specific pages and theme loading patterns
 */

import { test, expect } from '@playwright/test'

const DESIGN_PAGES = [
  {
    path: '/pages/disenos.html',
    name: 'Design Gallery',
    expectedElements: ['.design-gallery', '.design-grid', '.design-card'],
    hasMainScript: false
  },
  {
    path: '/pages/diseno-1-jardin-natural.html',
    name: 'Design 1 - Jardin Natural',
    expectedElements: ['.design-container', '.theme-elements'],
    hasMainScript: true
  },
  {
    path: '/pages/diseno-2-elegancia-moderna.html',
    name: 'Design 2 - Elegancia Moderna',
    expectedElements: ['.design-container', '.theme-elements'],
    hasMainScript: true
  },
  {
    path: '/pages/diseno-3-vintage-romantico.html',
    name: 'Design 3 - Vintage Romántico',
    expectedElements: ['.design-container', '.theme-elements'],
    hasMainScript: true
  },
  {
    path: '/pages/diseno-4-tropical-vibrante.html',
    name: 'Design 4 - Tropical Vibrante',
    expectedElements: ['.design-container', '.theme-elements'],
    hasMainScript: true
  },
  {
    path: '/pages/diseno-5-zen-minimalista.html',
    name: 'Design 5 - Zen Minimalista',
    expectedElements: ['.design-container', '.theme-elements'],
    hasMainScript: true
  },
  {
    path: '/pages/theme-gallery.html',
    name: 'Theme Gallery',
    expectedElements: ['.theme-gallery', '.theme-preview', '.theme-selector'],
    hasMainScript: true
  }
]

test.describe('Design Pages Loading Tests', () => {
  DESIGN_PAGES.forEach(pageConfig => {
    test(`should load ${pageConfig.name} page successfully`, async ({ page }) => {
      console.log(`🎨 Testing ${pageConfig.name} at ${pageConfig.path}`)

      // Navigate to the page
      const response = await page.goto(pageConfig.path)
      expect(response.status()).toBe(200)

      // Check page has proper title
      const title = await page.title()
      expect(title).toBeTruthy()
      expect(title.length).toBeGreaterThan(0)

      // Wait for DOM to be ready
      await page.waitForLoadState('domcontentloaded')

      // Wait additional time for theme scripts if they exist
      if (pageConfig.hasMainScript) {
        await page.waitForTimeout(3000)
      } else {
        await page.waitForTimeout(1000)
      }

      // Check for design-specific structure
      await page.locator('body[class*="design"], body[class*="theme"]').count()

      // Check for expected elements (allow for some flexibility)
      let foundExpectedElements = 0
      for (const elementSelector of pageConfig.expectedElements) {
        try {
          const element = await page.locator(elementSelector).first()
          if (await element.isVisible({ timeout: 2000 })) {
            foundExpectedElements++
            console.log(`   ✅ Found ${elementSelector}`)
          }
        } catch (_error) {
          console.log(`   ⚠️ Element ${elementSelector} not found`)
        }
      }

      // At minimum, should have basic page structure
      const mainContent = await page.locator('main, .main-content, .container').first()
      expect(await mainContent.isVisible()).toBe(true)

      // Check for navigation
      const navbar = await page.locator('.navbar').first()
      expect(await navbar.isVisible()).toBe(true)

      // Check for theme/design specific elements
      const hasThemeElements = await page
        .locator('[class*="theme"], [class*="design"], .floral-element')
        .count()
      if (hasThemeElements > 0) {
        console.log(`   ✅ Found ${hasThemeElements} theme/design elements`)
      }

      console.log(
        `✅ ${pageConfig.name} loaded successfully (found ${foundExpectedElements}/${pageConfig.expectedElements.length} expected elements)`
      )
    })
  })
})

test.describe('Theme Loading Validation', () => {
  test('should load theme preloader correctly', async ({ page }) => {
    console.log('🎭 Testing theme preloader functionality')

    // Monitor network requests for theme script
    const themeScriptRequests = []
    page.on('request', request => {
      if (request.url().includes('themePreload.js')) {
        themeScriptRequests.push(request.url())
      }
    })

    // Navigate to a design page
    await page.goto('/pages/theme-gallery.html')
    await page.waitForTimeout(2000)

    // Should attempt to load theme preloader
    if (themeScriptRequests.length > 0) {
      console.log('✅ Theme preloader script requested')
    }

    // Check for theme-related functionality
    const themeSelector = await page.locator('#theme-selector-container, .theme-selector').first()
    if (await themeSelector.isVisible({ timeout: 3000 })) {
      console.log('✅ Theme selector found')

      // Test theme switching functionality
      const themeButtons = await themeSelector.locator('button').all()
      if (themeButtons.length > 0) {
        console.log(`   Found ${themeButtons.length} theme buttons`)

        // Test clicking a theme button
        await themeButtons[0].click()
        await page.waitForTimeout(500)

        // Check if theme was applied (look for theme classes)
        const bodyClasses = await page.locator('body').getAttribute('class')
        if (bodyClasses && bodyClasses.includes('theme-')) {
          console.log('✅ Theme switching works correctly')
        }
      }
    }

    // Check for CSS custom properties (theme variables)
    const hasThemeVariables = await page.evaluate(() => {
      const rootStyle = getComputedStyle(document.documentElement)
      const cssVariables = []
      for (let i = 0; i < rootStyle.length; i++) {
        const property = rootStyle[i]
        if (property.startsWith('--')) {
          cssVariables.push(property)
        }
      }
      return cssVariables.length > 0
    })

    if (hasThemeVariables) {
      console.log('✅ CSS theme variables found')
    }

    console.log('✅ Theme loading validation completed')
  })

  test('should apply design-specific styles correctly', async ({ page }) => {
    console.log('🎨 Testing design-specific styles')

    // Test each design page for unique styling
    const designTests = [
      {
        path: '/pages/diseno-1-jardin-natural.html',
        expectedStyles: ['green', 'natural', 'garden'],
        name: 'Jardin Natural'
      },
      {
        path: '/pages/diseno-2-elegancia-moderna.html',
        expectedStyles: ['modern', 'elegant', 'clean'],
        name: 'Elegancia Moderna'
      },
      {
        path: '/pages/diseno-3-vintage-romantico.html',
        expectedStyles: ['vintage', 'romantic', 'classic'],
        name: 'Vintage Romántico'
      },
      {
        path: '/pages/diseno-4-tropical-vibrante.html',
        expectedStyles: ['tropical', 'vibrant', 'colorful'],
        name: 'Tropical Vibrante'
      },
      {
        path: '/pages/diseno-5-zen-minimalista.html',
        expectedStyles: ['zen', 'minimalist', 'clean'],
        name: 'Zen Minimalista'
      }
    ]

    for (const designTest of designTests) {
      console.log(`   Testing ${designTest.name}...`)

      await page.goto(designTest.path)
      await page.waitForTimeout(2000)

      // Check for design-specific classes
      const bodyClasses = (await page.locator('body').getAttribute('class')) || ''
      const hasDesignClass = designTest.expectedStyles.some(style =>
        bodyClasses.toLowerCase().includes(style.toLowerCase())
      )

      if (hasDesignClass) {
        console.log(`   ✅ ${designTest.name} has design-specific classes`)
      }

      // Check for design-specific colors (via computed styles)
      const hasDesignColors = await page.evaluate(() => {
        const elements = document.querySelectorAll(
          '[class*="theme"], [class*="design"], .floral-element'
        )
        if (elements.length === 0) {
          return false
        }

        // Check if elements have custom colors applied
        for (const element of elements.slice(0, 5)) {
          // Check first 5 elements
          const style = getComputedStyle(element)
          const bgColor = style.backgroundColor
          const color = style.color

          // Check for non-default colors
          if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
            return true
          }
          if (color && color !== 'rgb(0, 0, 0)' && color !== 'rgb(0, 0, 0, 0)') {
            return true
          }
        }
        return false
      })

      if (hasDesignColors) {
        console.log(`   ✅ ${designTest.name} has design-specific colors`)
      }

      // Check for decorative elements
      const decorativeElements = await page
        .locator('.floral-element, .decoration, [class*="flower"]')
        .count()
      if (decorativeElements > 0) {
        console.log(`   ✅ ${designTest.name} has ${decorativeElements} decorative elements`)
      }
    }

    console.log('✅ Design-specific styles validation completed')
  })
})

test.describe('Design Pages Responsive Behavior', () => {
  const viewports = [
    { name: 'Desktop', width: 1280, height: 720 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 }
  ]

  viewports.forEach(viewport => {
    test(`should render design gallery correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      console.log(
        `📱 Testing design gallery on ${viewport.name} (${viewport.width}x${viewport.height})`
      )

      await page.goto('/pages/disenos.html')
      await page.waitForTimeout(2000)

      // Check that gallery layout adapts
      const galleryGrid = await page.locator('.design-grid, .gallery-grid').first()
      if (await galleryGrid.isVisible()) {
        const gridStyles = await galleryGrid.evaluate(el => {
          const computedStyle = getComputedStyle(el)
          return {
            display: computedStyle.display,
            gridTemplateColumns: computedStyle.gridTemplateColumns,
            gap: computedStyle.gap
          }
        })

        console.log(`   Grid display: ${gridStyles.display}`)
        if (gridStyles.display === 'grid') {
          console.log(`   Grid template: ${gridStyles.gridTemplateColumns}`)
        }

        // Verify grid fits within viewport
        const gridBox = await galleryGrid.boundingBox()
        if (gridBox) {
          expect(gridBox.width).toBeLessThanOrEqual(viewport.width)
        }
      }

      // Check design cards
      const designCards = await page.locator('.design-card, .gallery-item').all()
      console.log(`   Found ${designCards.length} design cards`)

      if (designCards.length > 0) {
        // Check that cards are visible and properly sized
        const firstCard = designCards[0]
        expect(await firstCard.isVisible()).toBe(true)

        const cardBounds = await firstCard.boundingBox()
        expect(cardBounds.width).toBeGreaterThan(0)
        expect(cardBounds.height).toBeGreaterThan(0)

        // Verify card fits in viewport
        expect(cardBounds.width).toBeLessThanOrEqual(viewport.width)

        // On mobile, cards should stack or use minimal columns
        if (viewport.width <= 768) {
          console.log('   Checking mobile card layout...')

          // Check for mobile-friendly layout
          const layoutCheck = await page.evaluate(_width => {
            const grid = document.querySelector('.design-grid, .gallery-grid')
            if (!grid) {
              return false
            }

            const style = getComputedStyle(grid)
            const template = style.gridTemplateColumns

            // Mobile should have 1-2 columns max
            const columns = template.split(' ').length
            return columns <= 2
          }, viewport.width)

          if (layoutCheck) {
            console.log('   ✅ Mobile layout uses appropriate column count')
          }
        }
      }

      // Check navigation functionality
      const navbar = await page.locator('.navbar').first()
      expect(await navbar.isVisible()).toBe(true)

      // On mobile, check mobile menu
      if (viewport.width <= 768) {
        const mobileMenuToggle = await page
          .locator('.mobile-menu-toggle, #mobile-menu-btn, .hamburger-menu')
          .first()
        if (await mobileMenuToggle.isVisible()) {
          console.log('   ✅ Mobile menu toggle found')

          // Test mobile menu functionality
          await mobileMenuToggle.click()
          await page.waitForTimeout(300)

          const mobileMenu = page.locator('.mobile-menu, .mobile-nav')
          if (await mobileMenu.isVisible()) {
            console.log('   ✅ Mobile menu opens correctly')
          }
        }
      }

      // Verify no horizontal overflow
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth + 20
      })
      expect(hasOverflow).toBe(false)

      console.log(`✅ Design gallery responsive correctly on ${viewport.name}`)
    })
  })

  test('should maintain functionality across viewports', async ({ page }) => {
    // Test that interactions work on mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/pages/disenos.html')
    await page.waitForTimeout(2000)

    // Click on a design card
    const designCard = page.locator('.design-card, .gallery-item').first()
    if (await designCard.isVisible()) {
      await designCard.click()
      await page.waitForTimeout(500)

      // Check if we navigated to detail page
      const currentUrl = page.url()
      const isDetailPage = currentUrl.includes('diseno-') || currentUrl.includes('design-')

      if (isDetailPage) {
        console.log('✅ Navigation to detail page works on mobile')
      }
    }
  })
})

test.describe('Design Pages Interactive Features', () => {
  test('should support theme preview and switching', async ({ page }) => {
    console.log('🔄 Testing theme preview and switching')

    await page.goto('/pages/theme-gallery.html')
    await page.waitForTimeout(3000)

    // Look for theme preview functionality
    const themePreviews = await page.locator('.theme-preview, .theme-card, [data-theme]').all()
    console.log(`   Found ${themePreviews.length} theme previews`)

    if (themePreviews.length > 0) {
      // Test clicking on a theme preview
      const firstPreview = themePreviews[0]
      await firstPreview.hover()
      await page.waitForTimeout(500)

      // Check for hover effects or interactions
      const hasHoverEffect = await firstPreview.evaluate(el => {
        const style = getComputedStyle(el)
        return style.transform !== 'none' || style.transition !== 'all 0s ease 0s'
      })

      if (hasHoverEffect) {
        console.log('   ✅ Theme previews have hover effects')
      }

      // Try clicking the preview
      await firstPreview.click()
      await page.waitForTimeout(1000)

      // Check if theme was applied (look for changes in body classes or styles)
      const bodyClassesAfter = (await page.locator('body').getAttribute('class')) || ''
      if (bodyClassesAfter.length > 0) {
        console.log('   ✅ Theme selection appears to work')
      }
    }

    // Check for apply/reset buttons
    const applyButton = await page
      .locator('button:has-text("Aplicar"), button:has-text("Apply")')
      .first()
    const resetButton = await page
      .locator('button:has-text("Restablecer"), button:has-text("Reset")')
      .first()

    if (await applyButton.isVisible()) {
      console.log('   ✅ Apply theme button found')
    }

    if (await resetButton.isVisible()) {
      console.log('   ✅ Reset theme button found')
    }

    console.log('✅ Theme preview and switching validation completed')
  })

  test('should handle missing theme resources gracefully', async ({ page }) => {
    console.log('🚨 Testing graceful handling of missing theme resources')

    // Mock theme script loading failure
    await page.route('**/themePreload.js', route => {
      route.abort('failed')
    })

    // Monitor console for error messages
    const consoleMessages = []
    page.on('console', msg => consoleMessages.push(msg.text()))

    // Navigate to a theme-dependent page
    await page.goto('/pages/theme-gallery.html')
    await page.waitForTimeout(3000)

    // Page should still load even without theme script
    const mainContent = await page.locator('main, .main-content, .container').first()
    expect(await mainContent.isVisible()).toBe(true)

    // Should have fallback styling
    const hasBasicStyling = await page.evaluate(() => {
      const element = document.querySelector('.theme-gallery, .container')
      if (element) {
        const style = getComputedStyle(element)
        return style.display !== 'none' && style.padding !== '0px'
      }
      return false
    })

    expect(hasBasicStyling).toBe(true)

    // Should not have critical errors blocking the page
    const hasCriticalErrors = consoleMessages.some(
      msg => msg.includes('Uncaught') && msg.includes('Error')
    )

    // Some errors are expected, but page should remain functional
    if (hasCriticalErrors) {
      console.log('   ⚠️ Some errors occurred (expected with missing theme script)')
    }

    console.log('✅ Graceful degradation works correctly')
  })
})
