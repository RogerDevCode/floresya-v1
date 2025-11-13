/**
 * @fileoverview Quick Smoke Test for Index Homepage (Cypress)
 * Fast-running test to verify basic functionality
 */

describe('Index Homepage - Smoke Test (Cypress)', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should load homepage and verify basic elements', () => {
    // Verify title
    cy.title().should('eq', 'FloresYa')

    // Verify navigation
    cy.get('nav.navbar').should('be.visible')
    cy.get('a.navbar-brand').should('be.visible')

    // Verify hero section
    cy.get('section.hero-section').should('be.visible')

    // Verify carousel exists
    cy.get('#featuredCarousel').should('be.visible')

    // Verify products section exists
    cy.get('#productos').should('be.visible')
  })

  it('should navigate to products section', () => {
    // Click products link
    cy.get('a.nav-link[href="#productos"]').click()

    // Verify products section is visible and scrolled into view
    cy.get('#productos').should('be.visible')
  })

  it('should open and close mobile menu', () => {
    // Set mobile viewport
    cy.viewport(375, 667)

    // Open mobile menu
    cy.get('button.mobile-menu-toggle').click()

    // Verify menu is visible
    cy.get('#mobile-nav-drawer').should('be.visible')

    // Close mobile menu (assuming clicking outside or toggle again)
    cy.get('button.mobile-menu-toggle').click()

    // Verify menu is hidden
    cy.get('#mobile-nav-drawer').should('not.be.visible')
  })
})
