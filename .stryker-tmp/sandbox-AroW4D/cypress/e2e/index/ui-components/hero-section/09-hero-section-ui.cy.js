/**
 * Test 1.2.2: verify_hero_section_ui
 *
 * Test-Driven Development Implementation
 * Following Google Testing Blog and MIT CSAIL best practices
 *
 * Purpose: Verify Hero Section UI components functionality
 * Risk Level: HIGH - Critical for first impression and user engagement
 * Expected Outcome: 100% Success Rate
 */
// @ts-nocheck

describe('🎯 Hero Section UI', () => {
  beforeEach(() => {
    // Clean slate for each test
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.log('🎯 Testing hero section UI...')
  })

  context('verify_hero_section_ui', () => {
    it('✅ should render hero section correctly', () => {
      cy.visit('/')

      // Verify hero section exists
      cy.get('.hero-section').should('exist').and('be.visible')
      cy.get('.hero-section').should('have.attr', 'role', 'banner')
      cy.get('.hero-section').should('have.attr', 'aria-labelledby', 'hero-title')

      // Verify hero section has proper styling
      cy.get('.hero-section').should('have.class', 'theme-hero-gradient')
      cy.get('.hero-section').should('have.class', 'animate-gradient')
      cy.get('.hero-section').should('have.class', 'relative')
      cy.get('.hero-section').should('have.class', 'overflow-hidden')
    })

    it('✅ should render hero content correctly', () => {
      cy.visit('/')

      // Verify hero content container
      cy.get('.hero-content').should('exist').and('be.visible')

      // Verify hero text section
      cy.get('.hero-text').should('exist').and('be.visible')

      // Verify hero title
      cy.get('#hero-title').should('exist').and('be.visible')
      cy.get('#hero-title').should('contain', 'Flores frescas para cada ocasión')
      cy.get('#hero-title').should('have.class', 'hero-title')

      // Verify hero subtitle
      cy.get('.hero-subtitle').should('exist').and('be.visible')
      cy.get('.hero-subtitle').should('contain', 'Ramos y arreglos florales')
    })

    it('✅ should render hero CTA buttons correctly', () => {
      cy.visit('/')

      // Verify hero CTA container
      cy.get('.hero-cta').should('exist').and('be.visible')

      // Verify primary CTA button
      cy.get('.hero-cta .btn-primary').should('exist').and('be.visible')
      cy.get('.hero-cta .btn-primary').should('contain', 'Explorar Catálogo')
      cy.get('.hero-cta .btn-primary').should('have.attr', 'href', '#productos')

      // Verify secondary CTA button
      cy.get('.hero-cta .btn-secondary').should('exist').and('be.visible')
      cy.get('.hero-cta .btn-secondary').should('contain', 'Arreglos para Bodas')

      // Verify buttons have icons
      cy.get('.hero-cta .btn-primary .icon').should('exist')
      cy.get('.hero-cta .btn-secondary .icon').should('exist')
    })

    it('✅ should render hero features correctly', () => {
      cy.visit('/')

      // Verify hero features container
      cy.get('.hero-features').should('exist').and('be.visible')

      // Verify feature items
      cy.get('.feature-item').should('have.length', 3)

      // Verify each feature item
      cy.get('.feature-item').each(($feature, index) => {
        cy.wrap($feature).should('be.visible')
        cy.wrap($feature).find('.feature-icon').should('exist')
        cy.wrap($feature).find('span').should('exist')
      })

      // Verify specific feature texts
      cy.get('.feature-item').contains('Entrega gratis').should('exist')
      cy.get('.feature-item').contains('100% garantizado').should('exist')
      cy.get('.feature-item').contains('Entrega el mismo día').should('exist')
    })

    it('✅ should render hero image correctly', () => {
      cy.visit('/')

      // Verify hero image wrapper
      cy.get('.hero-image-wrapper').should('exist').and('be.visible')
      cy.get('.hero-image-wrapper').should('have.class', 'relative')

      // Verify hero image container
      cy.get('.hero-image-container').should('exist').and('be.visible')

      // Verify hero image
      cy.get('.hero-image').should('exist')
      cy.get('.hero-image').should('have.attr', 'src')
      cy.get('.hero-image').should('have.attr', 'alt')
      cy.get('.hero-image').should('have.attr', 'loading', 'eager')
      cy.get('.hero-image').should('have.attr', 'decoding', 'async')
      cy.get('.hero-image').should('have.attr', 'fetchpriority', 'high')

      // Verify image dimensions
      cy.get('.hero-image').should('have.attr', 'width', '600')
      cy.get('.hero-image').should('have.attr', 'height', '450')

      // Verify image loads correctly
      cy.get('.hero-image').should('be.visible')
    })

    it('✅ should have responsive hero section behavior', () => {
      cy.visit('/')

      // Test desktop viewport
      cy.viewport(1280, 720)
      cy.get('.hero-section').should('be.visible')
      cy.get('.hero-content').should('be.visible')

      // Test tablet viewport
      cy.viewport(768, 1024)
      cy.get('.hero-section').should('be.visible')
      cy.get('.hero-content').should('be.visible')

      // Test mobile viewport
      cy.viewport(375, 667)
      cy.get('.hero-section').should('be.visible')
      cy.get('.hero-content').should('be.visible')

      // Verify minimum height works across viewports
      cy.get('.hero-section').should('have.css', 'min-height')
    })

    it('✅ should have proper theme integration', () => {
      cy.visit('/')

      // Verify hero section has theme classes
      cy.get('.hero-section').should('have.class', 'theme-hero-gradient')
      cy.get('.hero-section').should('have.class', 'animate-gradient')

      // Verify gradient animation
      cy.get('.hero-section').should('have.class', 'animate-gradient')
    })

    it('✅ should have hero decorations correctly', () => {
      cy.visit('/')

      // Verify hero decorations exist
      cy.get('.hero-decoration').should('have.length', 2)

      // Verify decoration colors
      cy.get('.hero-decoration.pink').should('exist')
      cy.get('.hero-decoration.green').should('exist')

      // Verify decorations are positioned correctly (check CSS position property)
      cy.get('.hero-decoration').each($decoration => {
        // Check if decoration exists and has positioning
        cy.wrap($decoration).should('exist')
        cy.wrap($decoration).should('have.css', 'position')
        // Verify position is not 'static' (should be 'absolute', 'relative', or 'fixed')
        cy.wrap($decoration).should('not.have.css', 'position', 'static')
      })
    })

    it('✅ should have proper accessibility attributes', () => {
      cy.visit('/')

      // Verify ARIA attributes
      cy.get('.hero-section').should('have.attr', 'role', 'banner')
      cy.get('.hero-section').should('have.attr', 'aria-labelledby', 'hero-title')

      // Verify title is properly labeled
      cy.get('#hero-title').should('exist')
      cy.get('#hero-title').should('have.attr', 'id', 'hero-title')

      // Verify image has alt text
      cy.get('.hero-image').should('have.attr', 'alt')

      // Verify buttons have proper labels
      cy.get('.hero-cta .btn').each($button => {
        cy.wrap($button).should('have.attr', 'href')
      })
    })

    it('✅ should handle hero section interactions correctly', () => {
      cy.visit('/')

      // Test CTA buttons are clickable
      cy.get('.hero-cta .btn-primary').click()
      cy.url().should('include', '#productos')

      // Go back and test secondary CTA
      cy.go('back')
      cy.get('.hero-cta .btn-secondary').click()

      // Test button hover states (visual verification)
      cy.get('.hero-cta .btn-primary').should('have.css', 'transition')
      cy.get('.hero-cta .btn-secondary').should('have.css', 'transition')
    })

    it('✅ should have proper performance optimization', () => {
      cy.visit('/')

      // Verify image loading attributes
      cy.get('.hero-image').should('have.attr', 'loading', 'eager')
      cy.get('.hero-image').should('have.attr', 'fetchpriority', 'high')

      // Verify image preload (from head)
      cy.get('link[rel="preload"][as="image"]').should('exist')

      // Verify hero section is above the fold content
      cy.get('.hero-section').should('be.visible')
    })

    it('✅ should have proper semantic structure', () => {
      cy.visit('/')

      // Verify heading hierarchy
      cy.get('.hero-section').within(() => {
        cy.get('h1').should('exist') // Hero title should be h1
        cy.get('h1#hero-title').should('exist')
      })

      // Verify proper use of semantic elements
      cy.get('.hero-section').should('have.attr', 'role', 'banner')

      // Verify no duplicate h1s in hero section
      cy.get('.hero-section h1').should('have.length', 1)
    })

    it('✅ should handle hero content loading correctly', () => {
      cy.visit('/')

      // Verify content is visible immediately (no loading delays)
      cy.get('.hero-text').should('be.visible')
      cy.get('#hero-title').should('be.visible')
      cy.get('.hero-subtitle').should('be.visible')

      // Verify CTA buttons are visible
      cy.get('.hero-cta').should('be.visible')

      // Verify features are visible
      cy.get('.hero-features').should('be.visible')

      // Verify image loads without errors
      cy.get('.hero-image').should('be.visible')
    })
  })
})
