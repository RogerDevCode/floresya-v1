/**
 * Working Products Tests
 */

describe('Products Page', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display products section', () => {
    cy.get('#productos, .products').should('exist')
  })

  it('should have product cards', () => {
    cy.get('.model-4-card, .card').should('have.length.greaterThan', 0)
  })
})

describe('Product Detail', () => {
  beforeEach(() => {
    cy.visit('/product-detail.html?id=1')
  })

  it('should load product detail page', () => {
    cy.get('body').should('exist')
  })

  it('should have product information', () => {
    cy.get('.product-info, .product-detail').should('exist')
  })
})
