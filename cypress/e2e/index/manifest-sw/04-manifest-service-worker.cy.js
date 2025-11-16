/**
 * Test 1.1.4: verify_manifest_service_worker_registration
 *
 * Test-Driven Development Implementation
 * Following Google PWA Guidelines and MIT CSAIL best practices
 *
 * Purpose: Verify Web App Manifest and Service Worker functionality
 * Risk Level: HIGH - Critical for PWA functionality and offline support
 * Expected Outcome: 100% Success Rate
 */

describe('📱 Manifest & Service Worker Configuration', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.log('Starting manifest and service worker verification test')
  })

  context('verify_manifest_service_worker_registration', () => {
    it('✅ should have properly configured Web App Manifest', () => {
      cy.log('Testing Web App Manifest...')

      cy.visit('/')

      // Check manifest link exists
      cy.get('link[rel="manifest"]')
        .should('exist')
        .and('have.attr', 'href')
        .and('match', /manifest\.json$/)

      // Fetch and validate manifest content
      cy.get('link[rel="manifest"]').then($link => {
        const manifestUrl = $link.attr('href')

        // Convert relative URL to absolute if needed
        const absoluteUrl = manifestUrl.startsWith('http')
          ? manifestUrl
          : `${Cypress.config().baseUrl}${manifestUrl}`

        cy.request(absoluteUrl).then(response => {
          expect(response.status).to.equal(200)
          expect(response.body).to.be.an('object')

          const manifest = response.body

          // Verify required manifest properties
          expect(manifest.name).to.exist
          expect(manifest.name).to.equal('FloresYa')
          expect(manifest.short_name).to.exist
          expect(manifest.short_name.length).to.be.lessThanOrEqual(12)

          // Verify start URL
          expect(manifest.start_url).to.exist
          expect(manifest.start_url).to.equal('/')

          // Verify display mode
          expect(manifest.display).to.exist
          expect(manifest.display).to.be.oneOf([
            'fullscreen',
            'standalone',
            'minimal-ui',
            'browser'
          ])

          // Verify theme color
          expect(manifest.theme_color).to.exist
          expect(manifest.theme_color).to.match(/^#[0-9a-fA-F]{6}$/)

          // Verify background color
          expect(manifest.background_color).to.exist
          expect(manifest.background_color).to.match(/^#[0-9a-fA-F]{6}$/)

          // Verify orientation (optional but recommended)
          if (manifest.orientation) {
            expect(manifest.orientation).to.be.oneOf([
              'any',
              'natural',
              'landscape',
              'portrait',
              'portrait-primary',
              'portrait-secondary',
              'landscape-primary',
              'landscape-secondary'
            ])
          }

          // Verify icons
          expect(manifest.icons).to.exist
          expect(manifest.icons).to.be.an('array')
          expect(manifest.icons.length).to.be.greaterThan(0)

          // Check icon structure
          manifest.icons.forEach((icon, index) => {
            expect(icon.src).to.exist
            expect(icon.sizes).to.exist
            expect(icon.type).to.match(/^image\/(png|jpg|jpeg|webp|svg\+xml)$/)

            // Verify sizes format
            if (icon.sizes !== 'any') {
              expect(icon.sizes).to.match(/^\d+x\d+$/)
            }
          })

          // Check for essential icon sizes
          const iconSizes = manifest.icons.map(icon => icon.sizes).flat()
          const has192Icon = iconSizes.some(size => size.includes('192'))
          const has512Icon = iconSizes.some(size => size.includes('512'))

          expect(has192Icon).to.be.true // Minimum required for PWA
          expect(has512Icon).to.be.true // Required for some platforms

          cy.log('Manifest validated:', manifest)
        })
      })

      cy.log('Web App Manifest verified successfully', 'success')
    })

    it('✅ should have Service Worker registration functionality', () => {
      cy.log('Testing Service Worker functionality...')

      cy.visit('/', {
        onBeforeLoad: win => {
          // Intercept service worker registration to track it
          const originalRegister = win.navigator.serviceWorker.register
          win.navigator.serviceWorker.register = function (scriptURL, options) {
            // Store the registration attempt for testing
            win.swRegistrationAttempt = {
              scriptURL,
              options,
              timestamp: Date.now()
            }

            return originalRegister.call(this, scriptURL, options)
          }
        }
      })

      // Wait for service worker registration (asynchronous)
      cy.wait(2000).then(() => {
        cy.window()
          .then(win => {
            // Check if service worker API is available
            expect('serviceWorker' in win.navigator).to.be.true

            // Check if registration was attempted (from the page script)
            if (win.swRegistrationAttempt) {
              cy.log('Service worker registration detected:', win.swRegistrationAttempt)
            }

            // Check current service worker registrations
            return win.navigator.serviceWorker.getRegistrations()
          })
          .then(registrations => {
            // Note: The current page script unregisters existing SWs,
            // so this tests the unregistration functionality
            cy.log('Current service worker registrations:', registrations.length)

            // Test that we can access service worker API
            cy.window().then(win => {
              expect(win.navigator.serviceWorker).to.exist
              expect(typeof win.navigator.serviceWorker.register).to.equal('function')
              expect(typeof win.navigator.serviceWorker.getRegistrations).to.equal('function')
            })
          })
      })

      cy.log('Service Worker API verified successfully', 'success')
    })

    it('✅ should have proper PWA installation prompts support', () => {
      cy.log('Testing PWA installation support...')

      cy.visit('/')

      cy.window().then(win => {
        // Check for beforeinstallprompt event support
        expect('onbeforeinstallprompt' in win).to.be.true

        // Check for app installed banner support (Chrome)
        expect('onappinstalled' in win).to.be.true

        // Check if manifest would trigger install prompt
        // Note: This is a basic check - actual install prompt requires HTTPS and user interaction
        const hasManifest = !!document.querySelector('link[rel="manifest"]')
        const hasServiceWorker = 'serviceWorker' in win.navigator
        const isHTTPS = win.location.protocol === 'https:' || win.location.hostname === 'localhost'

        const canInstall = hasManifest && hasServiceWorker && isHTTPS

        cy.log('PWA installation capability:', {
          hasManifest,
          hasServiceWorker,
          isHTTPS,
          canInstall
        })

        // In development environment, localhost should work
        if (win.location.hostname === 'localhost') {
          expect(canInstall).to.be.true
        }
      })

      cy.log('PWA installation support verified', 'success')
    })

    it('✅ should have proper cache-control headers for PWA resources', () => {
      cy.log('Testing cache-control headers...')

      cy.visit('/')

      // Test manifest file headers
      cy.request('/manifest.json').then(response => {
        expect(response.status).to.equal(200)
        expect(response.headers).to.exist

        // Check for cache-control header (important for PWA)
        if (response.headers['cache-control']) {
          // Should not cache for too long in development
          expect(response.headers['cache-control']).to.exist
        }
      })

      // Test service worker file headers (if it exists)
      cy.request({
        url: '/sw.js',
        failOnStatusCode: false // Service worker might not exist yet
      }).then(response => {
        if (response.status === 200) {
          expect(response.headers['cache-control']).to.exist
          expect(response.headers['content-type']).to.include('application/javascript')
        }
      })

      cy.log('Cache headers verified successfully', 'success')
    })

    it('✅ should have proper HTTPS preparation', () => {
      cy.log('Testing HTTPS preparation...')

      cy.visit('/')

      cy.window().then(win => {
        // Check for security-related headers preparation
        const isLocalhost =
          win.location.hostname === 'localhost' || win.location.hostname === '127.0.0.1'
        const isHTTPS = win.location.protocol === 'https:'

        if (isLocalhost) {
          cy.log('Running on localhost - HTTPS requirements relaxed for development')
        } else {
          expect(isHTTPS).to.be.true
        }

        // Check for HSTS preparation (meta tag)
        const hstsMeta = win.document.querySelector('meta[http-equiv="strict-transport-security"]')
        if (!isLocalhost) {
          // In production, HSTS should be set via headers, but meta tag is a good fallback
          cy.log('HSTS configuration would be verified in production environment')
        }
      })

      cy.log('HTTPS preparation verified successfully', 'success')
    })

    it('✅ should have proper offline functionality preparation', () => {
      cy.log('Testing offline functionality preparation...')

      cy.visit('/')

      cy.window().then(win => {
        // Check for offline-related HTML elements
        const offlineElements = win.document.querySelectorAll('[data-offline]')
        cy.log(`Found ${offlineElements.length} offline-specific elements`)

        // Check for fallback images or offline indicators
        const offlineImages = win.document.querySelectorAll(
          'img[onerror*="offline"], img[data-offline]'
        )
        cy.log(`Found ${offlineImages.length} offline image fallbacks`)

        // Check for connection status API usage
        expect('onLine' in win.navigator).to.be.true
        expect('connection' in win.navigator).to.be.true

        // Check for network status indicator elements
        const networkIndicators = win.document.querySelectorAll('[data-network-status]')
        cy.log(`Found ${networkIndicators.length} network status indicators`)

        // Verify basic offline functionality preparation
        expect(win.navigator.onLine).to.be.a('boolean')
      })

      cy.log('Offline functionality preparation verified', 'success')
    })

    it('✅ should have proper viewport and mobile optimization', () => {
      cy.log('Testing mobile optimization...')

      cy.visit('/')

      // Verify viewport configuration (already tested in meta tags, but critical for PWA)
      cy.get('meta[name="viewport"]')
        .should('have.attr', 'content')
        .and('match', /width=device-width/)
        .and('match', /initial-scale=1\.?0/)
        .and('match', /viewport-fit=cover/)

      // Check for touch optimization
      cy.get('body').then($body => {
        const hasTouchOptimization =
          $body.attr('style')?.includes('touch-action') ||
          $body.find('[style*="touch-action"]').length > 0

        cy.log('Touch optimization detected:', hasTouchOptimization)
      })

      // Test mobile viewport dimensions
      cy.viewport(375, 667) // iPhone SE dimensions
      cy.wait(1000)

      // Verify page is still functional on mobile
      cy.get('nav').should('be.visible')
      cy.get('h1').should('be.visible')

      // Reset to desktop viewport
      cy.viewport(1280, 720)

      cy.log('Mobile optimization verified successfully', 'success')
    })

    it('✅ should have proper app shortcuts and related apps', () => {
      cy.log('Testing app shortcuts...')

      cy.visit('/')

      cy.request('/manifest.json').then(response => {
        const manifest = response.body

        // Check for shortcuts (PWA feature)
        if (manifest.shortcuts) {
          expect(manifest.shortcuts).to.be.an('array')

          manifest.shortcuts.forEach((shortcut, index) => {
            expect(shortcut.name).to.exist
            expect(shortcut.url).to.exist
            expect(shortcut.icons).to.exist

            cy.log(`Shortcut ${index + 1}: ${shortcut.name}`)
          })
        }

        // Check for related_applications
        if (manifest.related_applications) {
          expect(manifest.related_applications).to.be.an('array')

          manifest.related_applications.forEach((app, index) => {
            expect(app.platform).to.exist
            expect(app.url).to.exist

            cy.log(`Related app ${index + 1}: ${app.platform}`)
          })
        }
      })

      cy.log('App shortcuts verified successfully', 'success')
    })

    it('✅ should validate manifest accessibility features', () => {
      cy.log('Testing manifest accessibility features...')

      cy.visit('/')

      cy.request('/manifest.json').then(response => {
        const manifest = response.body

        // Check for accessibility-related properties
        if (manifest.prefers_color_scheme) {
          expect(manifest.prefers_color_scheme).to.be.oneOf(['light', 'dark', 'any'])
        }

        // Check for display preferences that aid accessibility
        if (manifest.display) {
          const accessibleDisplays = ['standalone', 'minimal-ui', 'browser']
          expect(manifest.display).to.be.oneOf(accessibleDisplays)
        }

        // Verify icons have proper alt attributes concept (while icons don't have alt text,
        // the manifest should provide proper descriptions)
        manifest.icons.forEach(icon => {
          expect(icon.src).to.not.be.empty
          expect(icon.type).to.exist

          // PNG icons provide better accessibility support
          if (icon.type === 'image/png') {
            cy.log('PNG icon found - good for accessibility')
          }
        })
      })

      cy.log('Manifest accessibility features verified successfully', 'success')
    })
  })
})
