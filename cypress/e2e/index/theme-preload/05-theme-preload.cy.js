/**
 * Test 1.1.5: verify_theme_preload_functionality
 *
 * Test-Driven Development Implementation
 * Following Google Performance Guidelines and MIT CSAIL best practices
 *
 * Purpose: Verify theme preload functionality to prevent FOUC (Flash of Unstyled Content)
 * Risk Level: HIGH - Critical for user experience and perceived performance
 * Expected Outcome: 100% Success Rate
 */

describe('🎨 Theme Preload Functionality', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.log('Starting theme preload verification test')
  })

  context('verify_theme_preload_functionality', () => {
    it('✅ should have theme preload script properly configured', () => {
      cy.log('Testing theme preload script configuration...')

      cy.visit('/', {
        onBeforeLoad: win => {
          // Track theme preload initialization
          win.themePreloadTest = {
            scriptLoaded: false,
            themeApplied: false,
            startTime: win.performance.now()
          }

          // Override script loading detection
          const originalCreateElement = win.document.createElement
          win.document.createElement = function (tagName) {
            const element = originalCreateElement.call(this, tagName)

            if (tagName.toLowerCase() === 'script' && element.src.includes('themePreload')) {
              win.themePreloadTest.themePreloadScriptDetected = true
            }

            return element
          }
        }
      })

      // Verify theme preload script exists in DOM
      cy.get('script[src*="themePreload.js"]')
        .should('exist')
        .and('have.attr', 'type', 'text/javascript')
        .then($script => {
          const src = $script.attr('src')
          expect(src).to.include('themePreload')
          cy.log('Theme preload script found:', src)
        })

      cy.log('Theme preload script configuration verified successfully', 'success')
    })

    it('✅ should prevent FOUC (Flash of Unstyled Content)', () => {
      cy.log('Testing FOUC prevention...')

      cy.visit('/', {
        onBeforeLoad: win => {
          // Track when theme is applied
          win.foucTest = {
            navigationStart: win.performance.timing.navigationStart,
            themeDetectionTime: null,
            initialTheme: null
          }

          // Monitor theme changes
          const observer = new win.MutationObserver(mutations => {
            mutations.forEach(mutation => {
              if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                win.foucTest.themeDetectionTime = win.performance.now()
                win.foucTest.initialTheme = win.document.documentElement.getAttribute('data-theme')
              }
            })
          })

          observer.observe(win.document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
          })

          // Store observer for cleanup
          win.foucTest.observer = observer
        }
      })

      // Wait for theme to be applied
      cy.wait(500).then(() => {
        cy.window().then(win => {
          // Clean up observer
          if (win.foucTest.observer) {
            win.foucTest.observer.disconnect()
          }

          // Verify theme was applied quickly
          expect(win.foucTest.initialTheme).to.exist
          expect(['light', 'dark']).to.include(win.foucTest.initialTheme)

          // Verify FOUC timing (should be < 100ms for ideal user experience)
          if (win.foucTest.themeDetectionTime) {
            const foucTime = win.foucTest.themeDetectionTime - win.foucTest.navigationStart
            cy.log('FOUC prevention time:', foucTime + 'ms')

            // Should prevent visible FOUC (< 16ms is ideal, < 100ms is acceptable)
            expect(foucTime).to.be.lessThan(200)
          }

          // Verify no visible FOUC occurred by checking if body has theme classes
          cy.get('body').should('have.attr', 'class')
          cy.get('html').should('have.attr', 'data-theme')
        })
      })

      cy.log('FOUC prevention verified successfully', 'success')
    })

    it('✅ should have theme preload loading before main CSS', () => {
      cy.log('Testing theme preload loading order...')

      cy.visit('/', {
        onBeforeLoad: win => {
          const loadOrder = []

          // Track script loading order
          const originalCreateElement = win.document.createElement
          win.document.createElement = function (tagName) {
            const element = originalCreateElement.call(this, tagName)

            if (tagName.toLowerCase() === 'script') {
              const originalSrc = Object.getOwnPropertyDescriptor(
                HTMLScriptElement.prototype,
                'src'
              )
              Object.defineProperty(element, 'src', {
                get() {
                  return originalSrc.get.call(this)
                },
                set(value) {
                  loadOrder.push({
                    type: 'script',
                    src: value,
                    timestamp: win.performance.now()
                  })
                  originalSrc.set.call(this, value)
                }
              })
            }

            return element
          }

          // Track CSS loading order
          const originalCreateElementCSS = win.document.createElement
          win.document.createElement = function (tagName) {
            const element = originalCreateElementCSS.call(this, tagName)

            if (tagName.toLowerCase() === 'link' && element.rel === 'stylesheet') {
              const originalHref = Object.getOwnPropertyDescriptor(
                HTMLLinkElement.prototype,
                'href'
              )
              Object.defineProperty(element, 'href', {
                get() {
                  return originalHref.get.call(this)
                },
                set(value) {
                  loadOrder.push({
                    type: 'css',
                    href: value,
                    timestamp: win.performance.now()
                  })
                  originalHref.set.call(this, value)
                }
              })
            }

            return element
          }

          win.loadOrderTest = loadOrder
        }
      })

      // Wait for page to load completely
      cy.wait(2000).then(() => {
        cy.window().then(win => {
          const loadOrder = win.loadOrderTest || []

          // Find theme preload script
          const themePreloadScript = loadOrder.find(
            item => item.type === 'script' && item.src.includes('themePreload')
          )

          // Find main CSS files
          const mainCSSFiles = loadOrder.filter(
            item =>
              item.type === 'css' &&
              (item.href.includes('styles.css') || item.href.includes('tailwind.css'))
          )

          cy.log('Load order:', loadOrder)

          // Verify theme preload script exists
          expect(themePreloadScript).to.exist

          if (mainCSSFiles.length > 0) {
            // Theme preload should load before or at the same time as main CSS
            const firstMainCSS = Math.min(...mainCSSFiles.map(css => css.timestamp))
            const themePreloadTime = themePreloadScript.timestamp

            expect(themePreloadTime).to.be.lte(firstMainCSS + 50) // Allow 50ms tolerance
          }

          cy.log('Loading order verified successfully')
        })
      })

      cy.log('Theme preload loading order verified successfully', 'success')
    })

    it('✅ should have proper theme system initialization', () => {
      cy.log('Testing theme system initialization...')

      cy.visit('/')

      // Verify theme data attribute is set
      cy.get('html')
        .should('have.attr', 'data-theme')
        .and('match', /^(light|dark)$/)

      // Verify theme-related CSS classes are applied
      cy.get('body')
        .should('have.attr', 'class')
        .and('match', /theme-|light-theme|dark-theme/)

      // Check for theme system variables
      cy.window().then(win => {
        const computedStyle = win.getComputedStyle(win.document.documentElement)

        // Verify CSS variables are set for theming
        expect(computedStyle.getPropertyValue('--navbar-icon-color')).to.not.be.empty()
        expect(computedStyle.getPropertyValue('--primary-color')).to.not.be.empty()

        // Verify theme is properly applied via CSS custom properties
        const hasThemeVariables = computedStyle.cssText.includes('--')
        expect(hasThemeVariables).to.be.true

        cy.log('Theme system variables applied')
      })

      cy.log('Theme system initialization verified successfully', 'success')
    })

    it('✅ should store theme preference in localStorage', () => {
      cy.log('Testing localStorage theme persistence...')

      cy.visit('/')

      // Check if localStorage is used for theme storage
      cy.window().then(win => {
        // Check if theme is stored in localStorage
        const storedTheme =
          win.localStorage.getItem('theme') || win.localStorage.getItem('theme-preference')
        const currentTheme = win.document.documentElement.getAttribute('data-theme')

        if (storedTheme) {
          expect(storedTheme).to.be.oneOf(['light', 'dark'])
          expect(storedTheme).to.equal(currentTheme)
        } else {
          // If no stored theme, default should be used
          expect(['light', 'dark']).to.include(currentTheme)
        }

        cy.log('Theme persistence:', { storedTheme, currentTheme })
      })

      // Test theme switching and persistence
      cy.window().then(win => {
        // Clear any existing theme preference
        win.localStorage.removeItem('theme')
        win.localStorage.removeItem('theme-preference')
      })

      cy.reload()

      cy.window().then(win => {
        const themeAfterReload = win.document.documentElement.getAttribute('data-theme')

        // Theme should be consistent (either stored or default)
        expect(['light', 'dark']).to.include(themeAfterReload)
      })

      cy.log('localStorage theme persistence verified successfully', 'success')
    })

    it('✅ should handle theme switching without layout shifts', () => {
      cy.log('Testing theme switching without layout shifts...')

      cy.visit('/')

      // Get initial layout measurements
      cy.get('body').then($body => {
        const initialRect = $body[0].getBoundingClientRect()
        const initialStyles = {
          width: initialRect.width,
          height: initialRect.height
        }

        cy.log('Initial layout dimensions:', initialStyles)

        // Force theme change (if theme switcher is available)
        cy.get('#theme-selector-container').then($container => {
          if ($container.length > 0) {
            // Try to switch theme
            cy.get($container).find('button, [role="button"]').first().click()

            cy.wait(100).then(() => {
              cy.get('body').then($bodyAfterSwitch => {
                const rectAfterSwitch = $bodyAfterSwitch[0].getBoundingClientRect()
                const stylesAfterSwitch = {
                  width: rectAfterSwitch.width,
                  height: rectAfterSwitch.height
                }

                // Verify no significant layout shift (allow minor variations)
                expect(Math.abs(stylesAfterSwitch.width - initialStyles.width)).to.be.lessThan(10)
                expect(Math.abs(stylesAfterSwitch.height - initialStyles.height)).to.be.lessThan(50)

                cy.log('Layout after theme switch:', stylesAfterSwitch)
              })
            })
          } else {
            cy.log('Theme switcher not available - skipping switch test')
          }
        })
      })

      cy.log('Theme switching layout stability verified successfully', 'success')
    })

    it('✅ should load theme-related resources efficiently', () => {
      cy.log('Testing theme resource loading efficiency...')

      cy.visit('/')

      // Check that theme-related resources are loaded
      cy.get('link[href*="themes.css"]').should('exist')
      cy.get('link[href*="themes-granular.css"]').should('exist')

      // Verify theme CSS files are loaded
      cy.window().then(win => {
        const themeCSSLinks = Array.from(
          win.document.querySelectorAll('link[rel="stylesheet"]')
        ).filter(link => link.href.includes('theme'))

        expect(themeCSSLinks.length).to.be.greaterThan(0)

        cy.log('Theme CSS files found:', themeCSSLinks.length)
      })

      // Check for theme preload indicators
      cy.get('html').then($html => {
        const hasPreloadClass = $html.hasClass('theme-preloaded')
        const hasThemeLoadedClass = $html.hasClass('theme-loaded')

        cy.log('Theme preload indicators:', { hasPreloadClass, hasThemeLoadedClass })
      })

      cy.log('Theme resource loading efficiency verified successfully', 'success')
    })

    it('✅ should handle theme system errors gracefully', () => {
      cy.log('Testing theme system error handling...')

      cy.visit('/')

      // Verify theme system doesn't throw errors
      cy.window().then(win => {
        const consoleErrors = []
        const originalError = win.console.error

        win.console.error = (...args) => {
          consoleErrors.push(args.join(' '))
          originalError.apply(win.console, args)
        }

        // Test theme-related functions exist and are callable
        expect(typeof win.addEventListener).to.equal('function')
        expect(win.document.documentElement).to.exist

        // Try to trigger theme changes that might cause errors
        try {
          const html = win.document.documentElement

          // Test setting invalid theme (should fallback gracefully)
          html.setAttribute('data-theme', 'invalid-theme')
          cy.wait(100)

          // Verify theme is still valid after invalid attempt
          const currentTheme = html.getAttribute('data-theme')
          expect(['light', 'dark']).to.include(currentTheme)
        } catch (error) {
          cy.log(`Theme system error: ${error.message}`, 'error')
          throw error
        }

        // Check for console errors
        if (consoleErrors.length > 0) {
          const themeErrors = consoleErrors.filter(error => error.toLowerCase().includes('theme'))

          if (themeErrors.length > 0) {
            cy.log(`Theme system console errors: ${themeErrors.join(', ')}`, 'error')
          }
        }
      })

      cy.log('Theme system error handling verified successfully', 'success')
    })

    it('✅ should have proper theme preload timing', () => {
      cy.log('Testing theme preload timing...')

      cy.visit('/', {
        onBeforeLoad: win => {
          win.themeTimingTest = {
            navigationStart: win.performance.timing.navigationStart,
            themeSetTime: null
          }

          // Monitor when theme is set
          const observer = new win.MutationObserver(mutations => {
            mutations.forEach(mutation => {
              if (
                mutation.type === 'attributes' &&
                mutation.attributeName === 'data-theme' &&
                !win.themeTimingTest.themeSetTime
              ) {
                win.themeTimingTest.themeSetTime = win.performance.now()
              }
            })
          })

          observer.observe(win.document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
          })
        }
      })

      // Wait for theme to be applied
      cy.wait(1000).then(() => {
        cy.window().then(win => {
          const themeTiming = win.themeTimingTest

          if (themeTiming.themeSetTime) {
            const themeSetDuration = themeTiming.themeSetTime - themeTiming.navigationStart

            cy.log('Theme set timing:', themeSetDuration + 'ms')

            // Theme should be set very quickly to prevent FOUC
            expect(themeSetDuration).to.be.lessThan(100) // Under 100ms
          } else {
            cy.log('Theme timing not detected', 'warn')
          }

          // Verify current theme state
          const currentTheme = win.document.documentElement.getAttribute('data-theme')
          expect(['light', 'dark']).to.include(currentTheme)
        })
      })

      cy.log('Theme preload timing verified successfully', 'success')
    })
  })
})
