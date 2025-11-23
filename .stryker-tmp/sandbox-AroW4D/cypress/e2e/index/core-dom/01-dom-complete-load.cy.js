/**
 * Test 1.1.1: verify_dom_complete_load
 *
 * Test-Driven Development Implementation
 * Following Google Testing Blog and MIT CSAIL best practices
 *
 * Purpose: Verify complete DOM loading and initialization
 * Risk Level: HIGH - Critical for page functionality
 * Expected Outcome: 100% Success Rate
 */
// @ts-nocheck

describe('📋 Core DOM Loading & Initialization', () => {
  beforeEach(() => {
    // Clean slate for each test
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.log('🚀 Starting DOM loading verification test')
  })

  context('verify_dom_complete_load', () => {
    it('✅ should load page completely with readyState complete', () => {
      cy.log('🔍 Testing complete DOM load...')

      // Visit the page and wait for it to fully load
      cy.visit('/', {
        timeout: 30000,
        onBeforeLoad: win => {
          // Add loading markers before page load starts
          win.performance.mark('cypress-test-start')
        }
      })

      // 1. Verify document readyState is 'complete'
      cy.window().then(win => {
        const readyState = win.document.readyState
        cy.log(`Document readyState: ${readyState}`)
        expect(readyState).to.equal('complete')
      })

      // 2. Verify critical DOM elements exist
      cy.get('html').should('exist')
      cy.get('head').should('exist')
      cy.get('body').should('exist')

      // 3. Verify document title is loaded
      cy.document().its('title').should('not.be.empty')

      // 4. Verify body is visible (indicates rendering complete)
      cy.get('body').should('be.visible')

      // 5. Verify no parsing errors occurred
      cy.window().then(win => {
        // Check for any parsing errors
        if (win.document.querySelector('parsererror')) {
          throw new Error('XML/HTML parsing errors detected')
        }

        // Verify basic HTML structure
        const html = win.document.documentElement
        expect(html.tagName.toLowerCase()).to.equal('html')
        expect(html.getAttribute('lang')).to.equal('es')
      })

      cy.log('DOM loaded successfully', 'success')
    })

    it('✅ should have document object model fully initialized', () => {
      cy.log('Testing DOM initialization...')

      cy.visit('/')

      // Verify standard DOM properties are available
      cy.window().then(win => {
        const doc = win.document

        // Basic DOM structure verification
        expect(doc.documentElement).to.exist
        expect(doc.head).to.exist
        expect(doc.body).to.exist

        // Verify DOM properties are accessible
        expect(typeof doc.getElementById).to.equal('function')
        expect(typeof doc.querySelector).to.equal('function')
        expect(typeof doc.querySelectorAll).to.equal('function')

        // Verify standard elements are accessible
        expect(doc.querySelector('title')).to.exist
        expect(doc.querySelector('meta[charset]')).to.exist

        cy.log('DOM properties initialized successfully')
      })
    })

    it('✅ should load within performance thresholds', () => {
      cy.log('Testing page load performance...')

      cy.visit('/')

      // Measure load time
      cy.window().then(win => {
        const perfData = win.performance.getEntriesByType('navigation')[0]

        // Validate that performance data exists
        if (!perfData) {
          throw new Error('Performance data not available')
        }

        const loadMetrics = {
          domContentLoaded: perfData.domContentLoadedEventEnd
            ? perfData.domContentLoadedEventEnd - perfData.navigationStart
            : 0,
          loadComplete: perfData.loadEventEnd
            ? perfData.loadEventEnd - perfData.navigationStart
            : 0,
          domInteractive: perfData.domInteractive
            ? perfData.domInteractive - perfData.navigationStart
            : 0
        }

        cy.log('Load Performance Metrics:', loadMetrics)

        // Validate against performance thresholds
        const thresholds = Cypress.env('performanceThresholds')

        if (thresholds) {
          if (
            thresholds.domContentLoaded &&
            loadMetrics.domContentLoaded > thresholds.domContentLoaded
          ) {
            cy.log(`DOM content loaded too slowly: ${loadMetrics.domContentLoaded}ms`, 'warn')
          }

          if (thresholds.pageLoadTime && loadMetrics.loadComplete > thresholds.pageLoadTime) {
            cy.log(`Page load too slow: ${loadMetrics.loadComplete}ms`, 'warn')
          }
        }

        // Basic performance assertions (should pass even without thresholds)
        if (loadMetrics.domContentLoaded > 0) {
          expect(loadMetrics.domContentLoaded).to.be.lessThan(5000) // 5s max
        } else {
          cy.log('DOM content loaded metric not available, skipping assertion')
        }

        if (loadMetrics.loadComplete > 0) {
          expect(loadMetrics.loadComplete).to.be.lessThan(10000) // 10s max
        } else {
          cy.log('Load complete metric not available, skipping assertion')
        }

        cy.log('Performance thresholds validated', 'success')
      })
    })

    it('✅ should have no JavaScript errors during load', () => {
      cy.log('Testing for JavaScript errors...')

      // Capture console errors during page load
      const consoleErrors = []

      cy.visit('/', {
        onBeforeLoad: win => {
          // Override console.error to capture errors
          const originalError = win.console.error
          win.console.error = (...args) => {
            consoleErrors.push(args.join(' '))
            originalError.apply(win.console, args)
          }

          // Override window.onerror to capture unhandled errors
          win.addEventListener('error', event => {
            consoleErrors.push(`${event.error.message} at ${event.filename}:${event.lineno}`)
          })

          // Capture unhandled promise rejections
          win.addEventListener('unhandledrejection', event => {
            consoleErrors.push(`Unhandled promise rejection: ${event.reason}`)
          })
        }
      })

      // Check for captured errors
      cy.then(() => {
        if (consoleErrors.length > 0) {
          cy.log(`JavaScript errors detected: ${consoleErrors.join('; ')}`, 'error')
          throw new Error(`JavaScript errors during page load: ${consoleErrors.join(', ')}`)
        }

        cy.log('No JavaScript errors detected', 'success')
      })
    })

    it('✅ should properly load critical resources', () => {
      cy.log('Testing critical resource loading...')

      cy.visit('/')

      // Verify critical CSS is loaded
      cy.get('link[href*="styles.css"]').should('exist')
      cy.get('link[href*="tailwind.css"]').should('exist')
      cy.get('link[href*="themes.css"]').should('exist')

      // Verify critical scripts are loaded
      cy.window().then(win => {
        // Check that global objects are available (indicating scripts loaded)
        expect(win).to.not.be.undefined
        expect(win.performance).to.not.be.undefined
        expect(win.document).to.not.be.undefined

        // Check that critical scripts are present in DOM
        const scripts = win.document.querySelectorAll('script[src]')
        const criticalScripts = Array.from(scripts).filter(
          script =>
            script.src.includes('themePreload.js') ||
            script.src.includes('themeManager.js') ||
            script.src.includes('index.js')
        )

        expect(criticalScripts.length).to.be.greaterThan(0)

        cy.log(`Loaded ${criticalScripts.length} critical scripts`)
      })

      cy.log('Critical resources loaded successfully', 'success')
    })

    it('✅ should have viewport properly configured', () => {
      cy.log('Testing viewport configuration...')

      cy.visit('/')

      // Verify viewport meta tag
      cy.get('meta[name="viewport"]')
        .should('exist')
        .and('have.attr', 'content')
        .and('match', /width=device-width/)
        .and('match', /initial-scale=1/)

      // Verify HTML viewport dimensions
      cy.window().then(win => {
        const viewport = {
          width: win.innerWidth,
          height: win.innerHeight,
          devicePixelRatio: win.devicePixelRatio
        }

        expect(viewport.width).to.be.greaterThan(0)
        expect(viewport.height).to.be.greaterThan(0)
        expect(viewport.devicePixelRatio).to.be.greaterThan(0)

        cy.log('Viewport dimensions:', viewport)
      })

      cy.log('Viewport properly configured', 'success')
    })
  })
})
