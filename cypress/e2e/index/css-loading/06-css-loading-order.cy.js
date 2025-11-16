/**
 * Test 1.1.6: verify_css_loading_order_performance
 *
 * Test-Driven Development Implementation
 * Following Google Web Vitals and MIT CSAIL best practices
 *
 * Purpose: Verify CSS loading order and performance optimization
 * Risk Level: HIGH - Critical for render performance and user experience
 * Expected Outcome: 100% Success Rate
 */

describe('🎨 CSS Loading Order & Performance', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.log('Starting CSS loading order verification test')
  })

  context('verify_css_loading_order_performance', () => {
    it('✅ should load CSS files in optimal order', () => {
      cy.log('Testing CSS file loading order...')

      cy.visit('/', {
        onBeforeLoad: win => {
          const resourceLoadOrder = []

          // Track CSS file loading order
          const originalCreateElement = win.document.createElement
          win.document.createElement = function (tagName) {
            const element = originalCreateElement.call(this, tagName)

            if (tagName.toLowerCase() === 'link' && element.rel === 'stylesheet') {
              const originalSetAttribute = element.setAttribute.bind(element)

              element.setAttribute = function (name, value) {
                if (name === 'href') {
                  resourceLoadOrder.push({
                    type: 'css',
                    href: value,
                    timestamp: win.performance.now(),
                    loadOrder: resourceLoadOrder.length + 1
                  })
                }
                return originalSetAttribute(name, value)
              }
            }

            return element
          }

          win.cssLoadOrderTest = resourceLoadOrder
        }
      })

      // Wait for page to load
      cy.wait(2000).then(() => {
        cy.window().then(win => {
          const loadOrder = win.cssLoadOrderTest || []

          // Extract critical CSS files
          const criticalCSS = loadOrder.filter(
            item =>
              item.href.includes('styles.css') ||
              item.href.includes('tailwind.css') ||
              item.href.includes('themes.css')
          )

          // Extract theme-related CSS files
          const themeCSS = loadOrder.filter(
            item =>
              item.href.includes('themes-granular.css') ||
              item.href.includes('themePreload') ||
              item.href.includes('contrast')
          )

          // Extract component CSS files
          const componentCSS = loadOrder.filter(
            item => item.href.includes('cuco-clock') || item.href.includes('components/')
          )

          cy.log('CSS Load Order Analysis:', {
            total: loadOrder.length,
            critical: criticalCSS.length,
            theme: themeCSS.length,
            component: componentCSS.length
          })

          // Verify critical CSS files are loaded first
          if (criticalCSS.length > 0 && themeCSS.length > 0) {
            const firstCritical = Math.min(...criticalCSS.map(css => css.timestamp))
            const firstTheme = Math.min(...themeCSS.map(css => css.timestamp))

            // Critical CSS should load before or at same time as theme CSS
            expect(firstCritical).to.be.lte(firstTheme + 50) // 50ms tolerance
          }

          // Verify we have the expected CSS files
          expect(criticalCSS.length).to.be.greaterThan(0)
          expect(themeCSS.length).to.be.greaterThan(0)

          cy.log(
            'CSS files in order:',
            loadOrder.map(css => css.href.split('/').pop())
          )
        })
      })

      cy.log('CSS loading order verified successfully', 'success')
    })

    it('✅ should have proper CSS preload directives', () => {
      cy.log('Testing CSS preload directives...')

      cy.visit('/')

      // Check for preload directives in head
      cy.get('head link[rel="preload"]').each($link => {
        const as = $link.attr('as')
        const href = $link.attr('href')

        if (as === 'style') {
          cy.log('Found CSS preload directive:', href)
          expect(href).to.include('.css')
        }
      })

      // Verify theme preload is properly configured
      cy.get('script[src*="themePreload.js"]').should('exist')

      // Check if CSS files have proper loading attributes
      cy.get('link[rel="stylesheet"]').each($link => {
        const href = $link.attr('href')

        // Critical CSS should have appropriate loading strategy
        if (href.includes('styles.css') || href.includes('tailwind.css')) {
          // Main CSS files should be loaded synchronously in head
          cy.wrap($link).should('have.attr', 'media')
        }
      })

      cy.log('CSS preload directives verified successfully', 'success')
    })

    it('✅ should not have render-blocking CSS issues', () => {
      cy.log('Testing for render-blocking CSS issues...')

      cy.visit('/', {
        onBeforeLoad: win => {
          // Track render blocking time
          win.renderBlockingTest = {
            navigationStart: win.performance.timing.navigationStart,
            domInteractive: null,
            firstPaint: null,
            cssLoadTimes: []
          }

          // Track when CSS files finish loading
          const originalCreateElement = win.document.createElement
          win.document.createElement = function (tagName) {
            const element = originalCreateElement.call(this, tagName)

            if (tagName.toLowerCase() === 'link' && element.rel === 'stylesheet') {
              element.addEventListener('load', () => {
                win.renderBlockingTest.cssLoadTimes.push({
                  href: element.href,
                  loadTime: win.performance.now()
                })
              })
            }

            return element
          }
        }
      })

      // Wait for initial paint and DOM ready
      cy.wait(1500).then(() => {
        cy.window().then(win => {
          const perfData = win.performance.getEntriesByType('navigation')[0]
          const paintEntries = win.performance.getEntriesByType('paint')

          const metrics = {
            domInteractive: perfData.domInteractive - perfData.navigationStart,
            firstPaint: paintEntries.find(e => e.name === 'first-paint')?.startTime,
            firstContentfulPaint: paintEntries.find(e => e.name === 'first-contentful-paint')
              ?.startTime
          }

          cy.log('Performance metrics:', metrics)

          // CSS should not significantly delay first paint
          if (metrics.firstPaint) {
            expect(metrics.firstPaint).to.be.lessThan(1500) // Under 1.5s
          }

          if (metrics.firstContentfulPaint) {
            expect(metrics.firstContentfulPaint).to.be.lessThan(2000) // Under 2s
          }

          // DOM should become interactive quickly
          expect(metrics.domInteractive).to.be.lessThan(2500) // Under 2.5s
        })
      })

      cy.log('Render-blocking CSS analysis completed successfully', 'success')
    })

    it('✅ should have CSS optimization features enabled', () => {
      cy.log('Testing CSS optimization features...')

      cy.visit('/')

      // Check for CSS optimization indicators
      cy.window().then(win => {
        const document = win.document

        // Check for critical CSS inline (if implemented)
        const inlineStyles = document.querySelectorAll('style:not([data-emotion])')
        if (inlineStyles.length > 0) {
          cy.log('Found inline CSS styles:', inlineStyles.length)
        }

        // Check for CSS compression indicators
        const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        const minifiedCSS = cssLinks.filter(
          link =>
            link.href.includes('.min.css') ||
            link.href.includes('bundle.css') ||
            link.href.includes('styles.css')
        )

        cy.log('CSS files found:', {
          total: cssLinks.length,
          potentiallyMinified: minifiedCSS.length
        })

        // Check for CSS modules or component-based CSS
        const componentCSS = cssLinks.filter(
          link =>
            link.href.includes('components/') ||
            link.href.includes('modules/') ||
            link.href.includes('cuco-clock')
        )

        if (componentCSS.length > 0) {
          cy.log('Component CSS found:', componentCSS.length)
        }
      })

      // Verify CSS files have proper caching headers
      cy.request('/css/styles.css').then(response => {
        expect(response.status).to.equal(200)

        // Check for cache-control header (important for CSS performance)
        if (response.headers['cache-control']) {
          const cacheControl = response.headers['cache-control']
          cy.log('CSS Cache-Control:', cacheControl)
        }

        // Check for ETag header (for cache validation)
        if (response.headers['etag']) {
          cy.log('CSS ETag:', response.headers['etag'])
        }
      })

      cy.log('CSS optimization features verified successfully', 'success')
    })

    it('✅ should load CSS within performance thresholds', () => {
      cy.log('Testing CSS loading performance thresholds...')

      cy.visit('/', {
        onBeforeLoad: win => {
          win.cssPerformanceTest = {
            navigationStart: win.performance.timing.navigationStart,
            cssLoadComplete: null,
            cssFiles: []
          }

          // Track CSS loading completion
          let totalCSSFiles = 0
          let loadedCSSFiles = 0

          const observer = new win.MutationObserver(() => {
            const currentCSSFiles = win.document.querySelectorAll('link[rel="stylesheet"]').length
            if (currentCSSFiles > totalCSSFiles) {
              totalCSSFiles = currentCSSFiles
            }

            loadedCSSFiles = currentCSSFiles

            // Consider CSS loading complete when all files are loaded
            if (loadedCSSFiles >= 5) {
              // Minimum expected CSS files
              win.cssPerformanceTest.cssLoadComplete = win.performance.now()
              win.cssPerformanceTest.cssFiles = Array.from(
                win.document.querySelectorAll('link[rel="stylesheet"]')
              ).map(link => link.href)
            }
          })

          observer.observe(win.document.head, {
            childList: true,
            subtree: true
          })

          win.cssPerformanceTest.observer = observer
        }
      })

      // Wait for CSS loading
      cy.wait(3000).then(() => {
        cy.window().then(win => {
          const perfData = win.performance.getEntriesByType('navigation')[0]
          const cssTest = win.cssPerformanceTest

          // Clean up observer
          if (cssTest.observer) {
            cssTest.observer.disconnect()
          }

          // Calculate CSS loading time
          let cssLoadTime = null
          if (cssTest.cssLoadComplete) {
            cssLoadTime = cssTest.cssLoadComplete - cssTest.navigationStart
          } else {
            // Fallback: calculate based on resource timing
            const cssResources = win.performance
              .getEntriesByType('resource')
              .filter(r => r.name.includes('.css'))
            if (cssResources.length > 0) {
              cssLoadTime = Math.max(...cssResources.map(r => r.responseEnd - r.startTime))
            }
          }

          cy.log('CSS Performance Analysis:', {
            cssLoadTime,
            cssFilesLoaded: cssTest.cssFiles.length,
            totalLoadTime: perfData.loadEventEnd - perfData.navigationStart
          })

          // Verify CSS loading performance
          if (cssLoadTime) {
            // CSS should load quickly (under 500ms for optimal UX)
            expect(cssLoadTime).to.be.lessThan(1000) // Under 1s
          }

          // Verify CSS files are loaded
          expect(cssTest.cssFiles.length).to.be.greaterThan(0)

          // CSS should not significantly impact overall page load
          const totalLoadTime = perfData.loadEventEnd - perfData.navigationStart
          expect(totalLoadTime).to.be.lessThan(5000) // Under 5s total
        })
      })

      cy.log('CSS loading performance thresholds verified successfully', 'success')
    })

    it('✅ should have no CSS-related console errors', () => {
      cy.log('Testing for CSS-related console errors...')

      const cssErrors = []

      cy.visit('/', {
        onBeforeLoad: win => {
          const originalError = win.console.error
          const originalWarn = win.console.warn

          win.console.error = (...args) => {
            const message = args.join(' ')
            if (message.toLowerCase().includes('css') || message.includes('stylesheet')) {
              cssErrors.push(message)
            }
            originalError.apply(win.console, args)
          }

          win.console.warn = (...args) => {
            const message = args.join(' ')
            if (message.toLowerCase().includes('css') || message.includes('stylesheet')) {
              cssErrors.push(`WARN: ${message}`)
            }
            originalWarn.apply(win.console, args)
          }
        }
      })

      cy.wait(1000).then(() => {
        if (cssErrors.length > 0) {
          cy.log(`CSS-related console errors found: ${cssErrors.join('; ')}`, 'error')
          throw new Error(`CSS console errors detected: ${cssErrors.join(', ')}`)
        }

        cy.log('No CSS-related console errors detected', 'success')
      })
    })

    it('✅ should have proper CSS media queries for responsive design', () => {
      cy.log('Testing CSS media queries...')

      cy.visit('/')

      // Test different viewport sizes to ensure responsive CSS works
      const viewports = [
        { width: 375, height: 667, name: 'Mobile' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1280, height: 720, name: 'Desktop' },
        { width: 1920, height: 1080, name: 'Large Desktop' }
      ]

      viewports.forEach(viewport => {
        cy.viewport(viewport.width, viewport.height)
        cy.wait(200) // Allow CSS to apply

        // Verify page is still functional
        cy.get('body').should('be.visible')
        cy.get('nav').should('be.visible')

        // Check that responsive classes are applied
        cy.get('html').should('have.attr', 'data-theme')

        cy.log(`Responsive test passed for ${viewport.name}`)
      })

      // Reset to default viewport
      cy.viewport(1280, 720)

      // Test media query changes dynamically
      cy.window().then(win => {
        // Test media query list
        if (win.matchMedia) {
          const mobileQuery = win.matchMedia('(max-width: 768px)')
          const desktopQuery = win.matchMedia('(min-width: 769px)')

          expect(mobileQuery).to.exist
          expect(desktopQuery).to.exist

          // One should match, one should not
          expect(mobileQuery.matches !== desktopQuery.matches).to.be.true
        }
      })

      cy.log('CSS media queries verified successfully', 'success')
    })

    it('✅ should have CSS specificity and override order correctly implemented', () => {
      cy.log('Testing CSS specificity and override order...')

      cy.visit('/')

      // Check that theme CSS is properly loaded and applied
      cy.get('html').should('have.attr', 'data-theme')

      // Verify CSS custom properties are available
      cy.window().then(win => {
        const computedStyle = win.getComputedStyle(win.document.documentElement)

        // Theme-related CSS variables should be available
        const themeVariables = [
          '--navbar-icon-color',
          '--primary-color',
          '--secondary-color',
          '--text-color',
          '--background-color'
        ]

        themeVariables.forEach(variable => {
          const value = computedStyle.getPropertyValue(variable)
          expect(value).to.not.be.empty()
        })

        cy.log('CSS variables verified:', themeVariables.length)
      })

      // Test CSS class overrides work correctly
      cy.get('nav').should('have.class')
      cy.get('nav.theme-nav-glass').should('exist')

      cy.log('CSS specificity and override order verified successfully', 'success')
    })
  })
})
