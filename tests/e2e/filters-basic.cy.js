/**
 * @fileoverview Basic E2E Test for Filters
 * Simple test to verify filter elements exist and are interactive
 */

describe('Basic Filter Tests', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('filter elements exist and are visible', () => {
    // Check that sort filter exists
    cy.get('#sortFilter').should('be.visible')

    // Check that price range filter exists
    cy.get('#priceRange').should('be.visible')

    // Check that search input exists
    cy.get('#searchInput').should('be.visible')

    // Check quick filters container exists
    cy.get('.quick-filters').should('be.visible')

    // Check "Todos" button exists
    cy.get('#filter-all').should('be.visible')
  })
})
