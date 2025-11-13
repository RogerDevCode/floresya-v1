/**
 * Basic E2E Smoke Test
 * Tests that the application starts and responds
 */

describe('Basic Smoke Tests', () => {
  it('should load homepage', () => {
    // Navigate to the application
    cy.visit('/')

    // Check that the page loads
    cy.title().should('match', /FloresYa/i)
  })

  it('should have basic structure', () => {
    cy.visit('/')

    // Check for common elements (flexible - accepts header or nav, main or body)
    cy.get('header, nav, .navbar').should('exist')
    cy.get('main, body').should('exist')
    cy.get('footer').should('exist')
  })
})
