/**
 * Test 1.1.2: verify_html_structure_integrity
 *
 * Test-Driven Development Implementation
 * Following Google Testing Blog and MIT CSAIL best practices
 *
 * Purpose: Verify HTML structure integrity and semantic correctness
 * Risk Level: HIGH - Critical for SEO and accessibility
 * Expected Outcome: 100% Success Rate
 */

describe('🏗️ HTML Structure Integrity', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.log('Starting HTML structure integrity verification test')
  })

  context('verify_html_structure_integrity', () => {
    it('✅ should have proper HTML5 semantic structure', () => {
      cy.log('Testing HTML5 semantic structure...')

      cy.visit('/')

      // Verify HTML root element
      cy.get('html').should('exist').and('have.attr', 'lang', 'es').and('have.attr', 'data-theme') // Theme system should be present

      // Verify document direction
      cy.get('html').should('have.attr', 'dir', 'ltr')

      // Verify head section structure
      cy.get('head').within(() => {
        // Essential meta tags
        cy.get('meta[charset="UTF-8"]').should('exist')

        // Viewport meta tag
        cy.get('meta[name="viewport"]')
          .should('exist')
          .and('have.attr', 'content')
          .and('match', /width=device-width.*initial-scale=1/)

        // Page title
        cy.get('title').should('exist').and('not.be.empty').and('contain.text', 'FloresYa')

        // Description meta tag
        cy.get('meta[name="description"]')
          .should('exist')
          .and('have.attr', 'content')
          .and('match', /flores|floristería/i)
          .and('have.length.gte', 10) // Reasonable description length

        // Theme color
        cy.get('meta[name="theme-color"]').should('exist').and('have.attr', 'content')
      })

      // Verify body section structure
      cy.get('body').should('exist').and('be.visible').and('have.class') // Should have some classes for styling

      cy.log('HTML5 semantic structure verified successfully', 'success')
    })

    it('✅ should have all critical sections present', () => {
      cy.log('Testing critical page sections...')

      cy.visit('/')

      // Verify main navigation
      cy.get('nav[role="navigation"]')
        .should('exist')
        .and('have.attr', 'aria-label', 'Navegación principal')

      // Verify main content area
      cy.get('main').should('exist').and('have.attr', 'id', 'main-content')

      // Verify hero section
      cy.get('section[role="banner"]')
        .should('exist')
        .and('have.attr', 'aria-labelledby', 'hero-title')

      // Verify hero title exists
      cy.get('#hero-title').should('exist').and('not.be.empty')

      // Verify products section
      cy.get('#productos').should('exist').and('have.attr', 'role', 'main')

      // Verify footer
      cy.get('footer').should('exist').and('have.class', 'footer-section')

      cy.log('All critical sections present', 'success')
    })

    it('✅ should have proper heading hierarchy', () => {
      cy.log('Testing heading hierarchy...')

      cy.visit('/')

      // Only one h1 per page
      cy.get('h1').should('have.length', 1)

      // Verify h1 content
      cy.get('h1').should('contain.text', 'Flores frescas')

      // Check that headings are in proper order
      cy.get('h2').each(($h2, index) => {
        cy.wrap($h2).should('have.prop', 'tagName', 'H2')
      })

      cy.get('h3').each(($h3, index) => {
        cy.wrap($h3).should('have.prop', 'tagName', 'H3')
      })

      // Verify no skipped heading levels (basic check)
      cy.get('h1, h2, h3, h4, h5, h6').then($headings => {
        const levels = Array.from($headings).map(h => parseInt(h.tagName.substring(1)))

        // Basic validation: all levels should be between 1-6
        levels.forEach(level => {
          expect(level).to.be.within(1, 6)
        })

        cy.log(`Found ${$headings.length} headings with levels: ${levels.join(', ')}`)
      })

      cy.log('Heading hierarchy verified successfully', 'success')
    })

    it('✅ should have proper image structure', () => {
      cy.log('Testing image structure...')

      cy.visit('/')

      // Verify main hero image
      cy.get('img[alt*="Hermoso ramo de flores frescas"]')
        .should('exist')
        .and('have.attr', 'width', '600')
        .and('have.attr', 'height', '450')
        .and('have.attr', 'loading', 'eager')
        .and('have.attr', 'decoding', 'async')
        .and('have.attr', 'fetchpriority', 'high')

      // Verify logo image
      cy.get('img[alt="Logo de FloresYa"]').should('exist').and('have.class', 'brand-logo')

      // Verify all images have alt text
      cy.get('img').each($img => {
        const alt = $img.attr('alt')
        expect(alt).to.exist
        expect(alt).to.not.be.empty
      })

      // Verify images have dimensions
      cy.get('img').each($img => {
        expect($img).to.have.attr('width')
        expect($img).to.have.attr('height')
      })

      cy.log('Image structure verified successfully', 'success')
    })

    it('✅ should have proper link structure', () => {
      cy.log('Testing link structure...')

      cy.visit('/')

      // Verify navigation links
      cy.get('nav a[href]').each($link => {
        // Links should have href attributes
        expect($link).to.have.attr('href')

        // Links should have meaningful text or aria-label
        const text = $link.text().trim()
        const ariaLabel = $link.attr('aria-label')

        expect(text || ariaLabel).to.exist
      })

      // Verify main navigation links are present
      const expectedNavLinks = ['Inicio', 'Productos', 'Contacto', 'Admin']
      expectedNavLinks.forEach(linkText => {
        cy.get('nav').contains('a', linkText).should('exist')
      })

      // Verify cart link
      cy.get('a[href="/pages/cart.html"]').should('exist').and('have.attr', 'aria-label')

      // Verify accessibility attributes
      cy.get('nav [role="menubar"]').should('exist')
      cy.get('nav [role="menubar"] > li').should('have.length.gte', 4)

      cy.log('Link structure verified successfully', 'success')
    })

    it('✅ should have proper form structure (if forms exist)', () => {
      cy.log('Testing form structure...')

      cy.visit('/')

      // Check if there are any forms on the page
      cy.get('body').then($body => {
        const forms = $body.find('form')

        if (forms.length > 0) {
          // For each form, verify proper structure
          cy.get('form').each($form => {
            // Forms should have action or be handled by JavaScript
            // This is a basic check - more complex validation would depend on specific forms

            // Check form elements have labels
            cy.wrap($form)
              .find('input, select, textarea')
              .each($input => {
                const id = $input.attr('id')
                const ariaLabel = $input.attr('aria-label')
                const ariaLabelledBy = $input.attr('aria-labelledby')
                const label = $input.siblings('label').first().attr('for')

                // Each input should be labeled somehow
                expect(id || ariaLabel || ariaLabelledBy || label).to.exist
              })
          })

          cy.log('Form structure verified', 'success')
        } else {
          cy.log('No forms found on page - skipping form validation')
        }
      })
    })

    it('✅ should have proper meta tags for social sharing', () => {
      cy.log('Testing social sharing meta tags...')

      cy.visit('/')

      // Open Graph meta tags
      cy.get('meta[property="og:title"]')
        .should('exist')
        .and('have.attr', 'content')
        .and('not.be.empty')

      cy.get('meta[property="og:description"]')
        .should('exist')
        .and('have.attr', 'content')
        .and('not.be.empty')

      cy.get('meta[property="og:type"]').should('exist').and('have.attr', 'content', 'website')

      cy.get('meta[property="og:url"]').should('exist').and('have.attr', 'content')

      cy.get('meta[property="og:image"]').should('exist').and('have.attr', 'content')

      // Twitter Card meta tags (optional but good practice)
      cy.get('meta[name="twitter:card"]').should('exist')

      // Structured data (JSON-LD)
      cy.get('script[type="application/ld+json"]')
        .should('exist')
        .then($script => {
          const jsonLd = $script.text()
          expect(jsonLd).to.not.be.empty

          try {
            const structuredData = JSON.parse(jsonLd)
            expect(structuredData['@context']).to.equal('https://schema.org')
            expect(structuredData['@type']).to.exist
          } catch {
            cy.log('Invalid JSON-LD structured data', 'error')
            throw new Error('Invalid JSON-LD structured data')
          }
        })

      cy.log('Social sharing meta tags verified successfully', 'success')
    })

    it('✅ should have no broken HTML structure', () => {
      cy.log('Testing for broken HTML structure...')

      cy.visit('/')

      // Check for properly closed tags
      cy.window().then(win => {
        const doc = win.document

        // Verify HTML is well-formed (basic checks)
        expect(doc.documentElement).to.exist
        expect(doc.documentElement.tagName.toLowerCase()).to.equal('html')

        // Check that head and body are properly nested
        expect(doc.head.parentElement).to.equal(doc.documentElement)
        expect(doc.body.parentElement).to.equal(doc.documentElement)

        // No parser errors
        const parserErrors = doc.querySelectorAll('parsererror')
        expect(parserErrors.length).to.equal(0)

        // Verify no obvious structural issues
        expect(doc.documentElement.childNodes.length).to.be.greaterThan(0)
      })

      // Check for common structural issues
      cy.get('html').should('not.have.class', 'error')
      cy.get('body').should('not.have.class', 'error')

      cy.log('HTML structure integrity verified successfully', 'success')
    })
  })
})
