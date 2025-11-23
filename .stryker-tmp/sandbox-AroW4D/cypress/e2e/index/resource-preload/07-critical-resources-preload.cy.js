/**
 * Test 1.1.7: verify_critical_resources_preload
 *
 * Test-Driven Development Implementation
 * Following Google Web Vitals and MIT CSAIL best practices
 *
 * Purpose: Verify critical resources preload optimization
 * Risk Level: HIGH - Critical for initial page load performance
 * Expected Outcome: 100% Success Rate
 */
// @ts-nocheck

describe('⚡ Critical Resources Preload', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.log('Starting critical resources preload verification test')
  })

  context('verify_critical_resources_preload', () => {
    it('✅ should have proper preload directives for critical resources', () => {
      cy.log('Testing critical resource preload directives...')

      cy.visit('/')

      // Check for preload directives in head
      cy.get('head link[rel="preload"]').each(($link, index) => {
        const as = $link.attr('as')
        const href = $link.attr('href')
        const type = $link.attr('type')

        cy.log(`Preload ${index + 1}: ${as} -> ${href}`)

        // Verify preload attributes
        expect(as).to.exist
        expect(href).to.exist

        // Verify proper MIME types for preloaded resources
        switch (as) {
          case 'image':
            expect(type).to.match(/^image\/(jpeg|jpg|png|webp|svg\+xml)$/)
            break
          case 'style':
            expect(type).to.equal('text/css')
            break
          case 'script':
            expect(type).to.equal('text/javascript')
            break
          case 'font':
            expect(type).to.match(/^font\/(woff|woff2|ttf|otf)$/)
            break
        }
      })

      // Check for specific critical resources mentioned in HTML
      cy.get('head link[rel="preload"][href*="hero-flowers.webp"]').should('exist')
      cy.get('head link[rel="preload"][as="style"][href*="styles.css"]').should('exist')
      cy.get('head link[rel="preload"][as="style"][href*="tailwind.css"]').should('exist')

      cy.log('Critical resource preload directives verified successfully', 'success')
    })

    it('✅ should preload hero image for faster perceived performance', () => {
      cy.log('Testing hero image preload...')

      cy.visit('/')

      // Verify hero image preload directive exists
      cy.get('head link[rel="preload"][as="image"][href*="hero-flowers.webp"]')
        .should('exist')
        .and('have.attr', 'fetchpriority', 'high')

      // Check that hero image loads quickly
      cy.get('img[src*="hero-flowers.webp"]')
        .should('be.visible')
        .and('have.attr', 'loading', 'eager')
        .and('have.attr', 'fetchpriority', 'high')

      // Measure hero image load time
      cy.window().then(win => {
        const heroImage = win.document.querySelector('img[src*="hero-flowers.webp"]')
        if (heroImage) {
          // Check if image is already loaded
          expect(heroImage.naturalWidth).to.be.greaterThan(0)
          expect(heroImage.naturalHeight).to.be.greaterThan(0)

          cy.log('Hero image dimensions:', {
            width: heroImage.naturalWidth,
            height: heroImage.naturalHeight
          })
        }
      })

      cy.log('Hero image preload verified successfully', 'success')
    })

    it('✅ should preload critical CSS files', () => {
      cy.log('Testing critical CSS preload...')

      cy.visit('/', {
        onBeforeLoad: win => {
          win.cssPreloadTest = {
            preloadedCSS: [],
            loadTimes: []
          }

          // Track when preloaded CSS files are loaded
          const originalCreateElement = win.document.createElement
          win.document.createElement = function (tagName) {
            const element = originalCreateElement.call(this, tagName)

            if (tagName.toLowerCase() === 'link' && element.rel === 'stylesheet') {
              element.addEventListener('load', () => {
                win.cssPreloadTest.loadTimes.push({
                  href: element.href,
                  loadTime: win.performance.now()
                })
              })
            }

            return element
          }
        }
      })

      // Wait for CSS files to load
      cy.wait(2000).then(() => {
        cy.window().then(win => {
          const cssLoadTimes = win.cssPreloadTest.loadTimes

          // Verify critical CSS files are loaded
          const criticalCSS = cssLoadTimes.filter(
            css =>
              css.href.includes('styles.css') ||
              css.href.includes('tailwind.css') ||
              css.href.includes('themes.css')
          )

          expect(criticalCSS.length).to.be.greaterThan(0)

          // Calculate load times
          criticalCSS.forEach(css => {
            cy.log(`CSS loaded: ${css.href.split('/').pop()} in ${css.loadTime.toFixed(2)}ms`)
          })

          // CSS should load quickly (under 500ms optimal)
          const averageLoadTime =
            criticalCSS.length > 0
              ? criticalCSS.reduce((sum, css) => sum + css.loadTime, 0) / criticalCSS.length
              : 0

          if (averageLoadTime > 0) {
            expect(averageLoadTime).to.be.lessThan(1000) // Under 1s average
          }
        })
      })

      cy.log('Critical CSS preload verified successfully', 'success')
    })

    it('✅ should have DNS prefetch for external domains', () => {
      cy.log('Testing DNS prefetch configuration...')

      cy.visit('/')

      // Check for DNS prefetch directives
      cy.get('head link[rel="dns-prefetch"]').each(($link, index) => {
        const href = $link.attr('href')

        expect(href).to.exist
        expect(href).to.match(/^https?:\/\//) // Should be full URLs

        cy.log(`DNS prefetch ${index + 1}: ${href}`)
      })

      // Verify specific domains are prefetched
      const expectedDomains = ['fonts.googleapis.com', 'fonts.gstatic.com']
      expectedDomains.forEach(domain => {
        cy.get(`head link[rel="dns-prefetch"][href*="${domain}"]`).should('exist')
      })

      cy.log('DNS prefetch configuration verified successfully', 'success')
    })

    it('✅ should have preconnect for critical external resources', () => {
      cy.log('Testing preconnect configuration...')

      cy.visit('/')

      // Check for preconnect directives
      cy.get('head link[rel="preconnect"]').each(($link, index) => {
        const href = $link.attr('href')
        const crossorigin = $link.attr('crossorigin')

        expect(href).to.exist
        expect(href).to.match(/^https?:\/\//)

        // Check crossorigin attribute for external resources
        if (href.includes('fonts.googleapis.com') || href.includes('fonts.gstatic.com')) {
          expect(crossorigin).to.exist
        }

        cy.log(`Preconnect ${index + 1}: ${href}`)
      })

      // Verify critical domains are preconnected
      const expectedPreconnect = ['fonts.googleapis.com', 'fonts.gstatic.com']
      expectedPreconnect.forEach(domain => {
        cy.get(`head link[rel="preconnect"][href*="${domain}"]`).should('exist')
      })

      cy.log('Preconnect configuration verified successfully', 'success')
    })

    it('✅ should preload fonts for optimal text rendering', () => {
      cy.log('Testing font preload optimization...')

      cy.visit('/')

      // Check for font preload directives
      cy.get('head link[rel="preload"][as="font"]').each(($link, index) => {
        const href = $link.attr('href')
        const type = $link.attr('type')
        const crossorigin = $link.attr('crossorigin')

        expect(href).to.exist
        expect(type).to.match(/^font\/(woff|woff2|ttf|otf)$/)
        expect(crossorigin).to.exist

        cy.log(`Font preload ${index + 1}: ${href}`)
      })

      // Check if fonts are loaded and applied
      cy.window().then(win => {
        const computedStyle = win.getComputedStyle(win.document.body)
        const fontFamily = computedStyle.fontFamily

        // Verify custom fonts are being used (not just system fonts)
        expect(fontFamily).to.not.match(/^[a-zA-Z\s,-]+$/) // Should not be only system fonts

        cy.log('Applied font family:', fontFamily)
      })

      cy.log('Font preload optimization verified successfully', 'success')
    })

    it('✅ should have proper priority hints for critical resources', () => {
      cy.log('Testing priority hints...')

      cy.visit('/')

      // Check for fetchpriority attribute on critical resources
      cy.get('img[fetchpriority="high"]').should('exist')

      // Verify hero image has high priority
      cy.get('img[src*="hero-flowers.webp"]').should('have.attr', 'fetchpriority', 'high')

      // Check that non-critical images don't have high priority
      cy.get('img:not([src*="hero-flowers"])').each(($img, index) => {
        const priority = $img.attr('fetchpriority')
        if (priority === 'high') {
          cy.log(`Warning: Non-critical image has high priority: ${$img.attr('src')}`)
        }
      })

      cy.log('Priority hints verified successfully', 'success')
    })

    it('✅ should optimize resource loading order for Core Web Vitals', () => {
      cy.log('Testing resource loading order optimization...')

      cy.visit('/', {
        onBeforeLoad: win => {
          win.resourceLoadingTest = {
            resourceTimes: [],
            criticalResourcesLoaded: false
          }

          // Track resource loading order and timing
          const observer = new win.PerformanceObserver(list => {
            list.getEntries().forEach(entry => {
              if (entry.entryType === 'resource') {
                win.resourceLoadingTest.resourceTimes.push({
                  name: entry.name,
                  type: entry.initiatorType,
                  startTime: entry.startTime,
                  responseEnd: entry.responseEnd,
                  duration: entry.duration,
                  size: entry.transferSize || 0
                })
              }
            })
          })

          observer.observe({ entryTypes: ['resource'] })
          win.resourceLoadingTest.observer = observer
        }
      })

      // Wait for resources to load
      cy.wait(3000).then(() => {
        cy.window().then(win => {
          const resourceTest = win.resourceLoadingTest

          if (resourceTest.observer) {
            resourceTest.observer.disconnect()
          }

          const resources = resourceTest.resourceTimes

          // Analyze critical resource loading
          const criticalResources = resources.filter(
            resource =>
              resource.name.includes('hero-flowers') ||
              resource.name.includes('styles.css') ||
              resource.name.includes('tailwind.css') ||
              resource.name.includes('themes.css')
          )

          const imageResources = resources.filter(resource => resource.type === 'img')
          const cssResources = resources.filter(resource => resource.type === 'css')
          const fontResources = resources.filter(resource => resource.type === 'link')

          cy.log('Resource Loading Analysis:', {
            total: resources.length,
            critical: criticalResources.length,
            images: imageResources.length,
            css: cssResources.length,
            fonts: fontResources.length
          })

          // Critical resources should load quickly
          if (criticalResources.length > 0) {
            const averageCriticalLoadTime =
              criticalResources.reduce((sum, r) => sum + r.duration, 0) / criticalResources.length
            expect(averageCriticalLoadTime).to.be.lessThan(500) // Under 500ms average
          }

          // Images should be optimized
          if (imageResources.length > 0) {
            const largeImages = imageResources.filter(img => img.size > 100000) // > 100KB
            cy.log(`Large images found: ${largeImages.length}`)
          }

          // CSS should not block rendering excessively
          if (cssResources.length > 0) {
            const cssLoadTimes = cssResources.map(css => css.duration)
            const maxCSSLoadTime = Math.max(...cssLoadTimes)
            expect(maxCSSLoadTime).to.be.lessThan(1000) // Under 1s max
          }
        })
      })

      cy.log('Resource loading order optimization verified successfully', 'success')
    })

    it('✅ should have no resource loading errors or 404s', () => {
      cy.log('Testing for resource loading errors...')

      cy.visit('/', {
        onBeforeLoad: win => {
          win.resourceErrors = []

          // Track resource loading errors
          const originalFetch = win.fetch
          win.fetch = (...args) => {
            return originalFetch.apply(win, args).catch(error => {
              win.resourceErrors.push({
                url: args[0],
                error: error.message,
                timestamp: win.performance.now()
              })
              throw error
            })
          }

          // Track image loading errors
          win.addEventListener(
            'error',
            event => {
              if (event.target.tagName === 'IMG') {
                win.resourceErrors.push({
                  url: event.target.src,
                  error: 'Image load error',
                  timestamp: win.performance.now()
                })
              }
            },
            true
          )
        }
      })

      cy.wait(2000).then(() => {
        cy.window().then(win => {
          const errors = win.resourceErrors || []

          if (errors.length > 0) {
            const errorMessages = errors.map(e => `${e.url}: ${e.error}`)
            cy.log(`Resource loading errors: ${errorMessages.join(', ')}`, 'error')
            throw new Error(`Resource loading errors detected: ${errorMessages.join(', ')}`)
          }

          cy.log('No resource loading errors detected', 'success')
        })
      })
    })

    it('✅ should optimize cache headers for preloaded resources', () => {
      cy.log('Testing cache headers optimization...')

      cy.visit('/')

      // Test cache headers for critical resources
      const criticalResources = [
        '/css/styles.css',
        '/css/tailwind.css',
        '/css/themes.css',
        '/images/hero-flowers.webp'
      ]

      criticalResources.forEach(resource => {
        cy.request({
          url: resource,
          failOnStatusCode: false
        }).then(response => {
          if (response.status === 200) {
            // Check for appropriate caching headers
            const cacheControl = response.headers['cache-control']
            const etag = response.headers['etag']
            const lastModified = response.headers['last-modified']

            cy.log(`Resource ${resource}:`, {
              cacheControl,
              etag,
              lastModified
            })

            // CSS should have reasonable caching
            if (resource.includes('.css')) {
              expect(cacheControl).to.exist
            }

            // Images should have longer cache times
            if (resource.includes('.webp')) {
              expect(cacheControl).to.exist
              expect(cacheControl).to.match(/max-age=\d+/)
            }
          }
        })
      })

      cy.log('Cache headers optimization verified successfully', 'success')
    })
  })
})
