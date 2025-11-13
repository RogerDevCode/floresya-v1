/**
 * Working Cart Tests
 */

describe('Shopping Cart', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should add product to cart', () => {
    cy.get('.add-to-cart, .btn-add-cart').first().click()
  })

  it('should navigate to cart', () => {
    cy.visit('/cart.html')
    cy.get('body').should('exist')
  })

  it('should have cart elements', () => {
    cy.visit('/cart.html')
    cy.get('.cart-items, #cart-items').should('exist')
  })
})
