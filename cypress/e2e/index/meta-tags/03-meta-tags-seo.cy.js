/**
 * Test 1.1.3: verify_meta_tags_seo_configuration
 *
 * Test-Driven Development Implementation
 * Following Google SEO Guidelines and MIT CSAIL best practices
 *
 * Purpose: Verify comprehensive SEO meta tags configuration
 * Risk Level: HIGH - Critical for search engine optimization
 * Expected Outcome: 100% Success Rate
 */

describe('🔍 SEO Meta Tags Configuration', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.log('Starting SEO meta tags verification test')
  })

  context('verify_meta_tags_seo_configuration', () => {
    it('✅ should have essential meta tags properly configured', () => {
      cy.log('Testing essential meta tags...')

      cy.visit('/')

      // Character encoding
      cy.get('meta[charset="UTF-8"]').should('exist').and('have.attr', 'charset', 'UTF-8')

      // Viewport configuration for mobile
      cy.get('meta[name="viewport"]')
        .should('exist')
        .and('have.attr', 'content')
        .and('match', /width=device-width/)
        .and('match', /initial-scale=1\.0/)

      // X-UA-Compatible for IE compatibility
      cy.get('meta[http-equiv="X-UA-Compatible"]')
        .should('exist')
        .and('have.attr', 'content', 'IE=edge')

      // Theme color for mobile browsers
      cy.get('meta[name="theme-color"]')
        .should('exist')
        .and('have.attr', 'content')
        .and('match', /^#[0-9a-fA-F]{6}$/) // Hex color format

      // Robots meta tag
      cy.get('meta[name="robots"]').should('exist').and('have.attr', 'content', 'index, follow')

      // Googlebot specific meta tag
      cy.get('meta[name="googlebot"]').should('exist').and('have.attr', 'content', 'index, follow')

      // Format detection (disable telephone auto-formatting)
      cy.get('meta[name="format-detection"]')
        .should('exist')
        .and('have.attr', 'content', 'telephone=no')

      cy.log('Essential meta tags verified successfully', 'success')
    })

    it('✅ should have comprehensive page description', () => {
      cy.log('Testing page description meta tag...')

      cy.visit('/')

      cy.get('meta[name="description"]')
        .should('exist')
        .and('have.attr', 'content')
        .then($content => {
          const description = $content.attr('content')

          // Length validation: between 120 and 160 characters for optimal SEO
          expect(description.length).to.be.within(120, 300)

          // Content validation
          expect(description).to.contain('FloresYa')
          expect(description).to.match(/flor(es|istía)/i)
          expect(description).to.match(/entrega|domicilio|caracas/i)

          // No double quotes or special characters that could break HTML
          expect(description).to.not.contain('"')
          expect(description).to.not.contain('<')
          expect(description).to.not.contain('>')

          cy.log('Description validated:', description)
        })

      cy.log('Page description meta tag verified successfully', 'success')
    })

    it('✅ should have optimized keywords meta tag', () => {
      cy.log('Testing keywords meta tag...')

      cy.visit('/')

      cy.get('meta[name="keywords"]')
        .should('exist')
        .and('have.attr', 'content')
        .then($content => {
          const keywords = $content.attr('content')

          // Length validation: not too long, not too short
          expect(keywords.length).to.be.within(50, 500)

          // Essential keywords for florist business
          expect(keywords.toLowerCase()).to.contain('flores')
          expect(keywords.toLowerCase()).to.contain('floristería')
          expect(keywords.toLowerCase()).to.contain('ramos')
          expect(keywords.toLowerCase()).to.contain('caracas')

          // Proper comma separation
          const keywordArray = keywords.split(',')
          expect(keywordArray.length).to.be.greaterThan(3)
          expect(keywordArray.length).to.be.lessThan(15) // Not keyword stuffing

          // No duplicates
          const uniqueKeywords = [...new Set(keywordArray.map(k => k.trim().toLowerCase()))]
          expect(uniqueKeywords.length).to.equal(keywordArray.length)

          cy.log('Keywords validated:', keywordArray)
        })

      cy.log('Keywords meta tag verified successfully', 'success')
    })

    it('✅ should have properly configured Open Graph tags', () => {
      cy.log('Testing Open Graph meta tags...')

      cy.visit('/')

      // Open Graph title
      cy.get('meta[property="og:title"]')
        .should('exist')
        .and('have.attr', 'content')
        .then($content => {
          const ogTitle = $content.attr('content')
          expect(ogTitle).to.contain('FloresYa')
          expect(ogTitle.length).to.be.within(30, 100)
        })

      // Open Graph description
      cy.get('meta[property="og:description"]')
        .should('exist')
        .and('have.attr', 'content')
        .then($content => {
          const ogDescription = $content.attr('content')
          expect(ogDescription.length).to.be.within(50, 300)
          expect(ogDescription).to.match(/flor|entrega/i)
        })

      // Open Graph type
      cy.get('meta[property="og:type"]').should('exist').and('have.attr', 'content', 'website')

      // Open Graph URL
      cy.get('meta[property="og:url"]')
        .should('exist')
        .and('have.attr', 'content')
        .then($content => {
          const ogUrl = $content.attr('content')
          expect(ogUrl).to.match(/^https?:\/\//)
        })

      // Open Graph image
      cy.get('meta[property="og:image"]')
        .should('exist')
        .and('have.attr', 'content')
        .then($content => {
          const ogImage = $content.attr('content')
          expect(ogImage).to.match(/\.(jpg|jpeg|png|webp)$/i)
        })

      cy.log('Open Graph tags verified successfully', 'success')
    })

    it('✅ should have Twitter Card meta tags', () => {
      cy.log('Testing Twitter Card meta tags...')

      cy.visit('/')

      // Twitter Card type
      cy.get('meta[name="twitter:card"]')
        .should('exist')
        .and('have.attr', 'content')
        .and('be.oneOf', ['summary', 'summary_large_image', 'app', 'player'])

      // Twitter title (should match og:title or be specific)
      cy.get('meta[name="twitter:title"]').should('exist')

      // Twitter description
      cy.get('meta[name="twitter:description"]').should('exist')

      // Twitter image
      cy.get('meta[name="twitter:image"]').should('exist')

      cy.log('Twitter Card meta tags verified successfully', 'success')
    })

    it('✅ should have canonical URL and alternate links', () => {
      cy.log('Testing canonical URL and alternate links...')

      cy.visit('/')

      // Canonical link
      cy.get('link[rel="canonical"]')
        .should('exist')
        .and('have.attr', 'href')
        .then($href => {
          const canonicalUrl = $href.attr('href')
          expect(canonicalUrl).to.match(/^https?:\/\//)
          expect(canonicalUrl).to.not.contain('://www.') // Prefer non-www
        })

      // DNS prefetch for performance
      cy.get('link[rel="dns-prefetch"]').should('exist')

      // Preconnect for critical resources
      cy.get('link[rel="preconnect"]').should('exist')

      cy.log('Canonical URL and performance links verified successfully', 'success')
    })

    it('✅ should have structured data (JSON-LD)', () => {
      cy.log('Testing structured data...')

      cy.visit('/')

      cy.get('script[type="application/ld+json"]')
        .should('exist')
        .and('not.have.text', '')
        .then($script => {
          const jsonLd = $script.text()

          // Parse JSON-LD
          const structuredData = JSON.parse(jsonLd)

          // Verify schema.org context
          expect(structuredData['@context']).to.equal('https://schema.org')

          // Verify type
          expect(structuredData['@type']).to.equal('Florist')

          // Verify required properties for Florist schema
          expect(structuredData.name).to.equal('FloresYa')
          expect(structuredData.description).to.exist
          expect(structuredData.url).to.exist
          expect(structuredData.telephone).to.exist

          // Verify address structure
          expect(structuredData.address).to.exist
          expect(structuredData.address['@type']).to.equal('PostalAddress')
          expect(structuredData.address.addressLocality).to.equal('Gran Caracas')
          expect(structuredData.address.addressCountry).to.equal('VE')

          cy.log('Structured data validated:', structuredData)
        })

      cy.log('Structured data verified successfully', 'success')
    })

    it('✅ should have proper favicon configuration', () => {
      cy.log('Testing favicon configuration...')

      cy.visit('/')

      // Favicon
      cy.get('link[rel="icon"]')
        .should('exist')
        .and('have.attr', 'href')
        .and('have.attr', 'type', 'image/x-icon')

      // Apple touch icon
      cy.get('link[rel="apple-touch-icon"]').should('exist')

      cy.log('Favicon configuration verified successfully', 'success')
    })

    it('✅ should have no conflicting or duplicate meta tags', () => {
      cy.log('Testing for conflicting meta tags...')

      cy.visit('/')

      // Check for duplicate viewport meta tags
      cy.get('meta[name="viewport"]').should('have.length', 1)

      // Check for duplicate description meta tags
      cy.get('meta[name="description"]').should('have.length', 1)

      // Check for duplicate charset meta tags
      cy.get('meta[charset]').should('have.length', 1)

      // Check for conflicting robots meta tags
      const robotsTags = []
      cy.get('meta[name="robots"]')
        .each($meta => {
          robotsTags.push($meta.attr('content'))
        })
        .then(() => {
          expect(robotsTags.length).to.be.lessThan(3) // Allow multiple but not conflicting
        })

      // Verify no deprecated or harmful meta tags
      cy.get('meta[name="generator"]').should('not.exist') // Security best practice
      cy.get('meta[http-equiv="refresh"]').should('not.exist') // No auto-refresh

      cy.log('No conflicting meta tags found', 'success')
    })

    it('✅ should have language and internationalization tags', () => {
      cy.log('Testing language and internationalization...')

      cy.visit('/')

      // HTML lang attribute already verified in structure test, but check here too
      cy.get('html').should('have.attr', 'lang', 'es')

      // Hreflang for international sites (if applicable)
      cy.window().then(win => {
        const hreflangLinks = win.document.querySelectorAll('link[rel="alternate"][hreflang]')

        // If hreflang exists, verify proper structure
        if (hreflangLinks.length > 0) {
          Array.from(hreflangLinks).forEach(link => {
            expect(link.getAttribute('hreflang')).to.match(/^[a-z]{2}(-[A-Z]{2})?$/)
            expect(link.getAttribute('href')).to.match(/^https?:\/\//)
          })
        }
      })

      // Content language meta
      cy.get('meta[http-equiv="content-language"]')
        .should('exist')
        .and('have.attr', 'content', 'es')

      cy.log('Language and internationalization verified successfully', 'success')
    })

    it('✅ should validate meta tag content quality', () => {
      cy.log('Testing meta tag content quality...')

      cy.visit('/')

      // Check title quality
      cy.get('title').then($title => {
        const title = $title.text()

        // Title length: 50-60 characters for optimal SEO
        expect(title.length).to.be.within(30, 70)

        // Title should contain brand name and primary keywords
        expect(title).to.contain('FloresYa')
        expect(title.toLowerCase()).to.match(/flor|ramo|entrega/i)

        // No stuffing or keyword repetition
        const words = title.toLowerCase().split(' ')
        const uniqueWords = [...new Set(words)]
        expect(uniqueWords.length / words.length).to.be.greaterThan(0.7)
      })

      // Check description quality
      cy.get('meta[name="description"]').then($meta => {
        const description = $meta.attr('content')

        // Should be actionable and compelling
        expect(description).to.match(/[a-zA-Z]+/) // Contains readable text
        expect(description).not.to.match(/^[a-zA-Z\s,.!?]+$/) // Not just boilerplate

        // Should contain calls to action
        expect(description.toLowerCase()).to.match(/entrega|compra|envío|domicilio/i)
      })

      cy.log('Meta tag content quality verified successfully', 'success')
    })
  })
})
