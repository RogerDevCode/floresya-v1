/**
 * Working Admin Tests
 */

describe('Admin Dashboard', () => {
  beforeEach(() => {
    cy.visit('/admin/dashboard.html')
  })

  it('should load admin dashboard', () => {
    cy.get('body').should('exist')
  })

  it('should have navigation elements', () => {
    cy.get('nav, .navbar, .admin-menu').should('exist')
  })
})

describe('Admin Create Product', () => {
  beforeEach(() => {
    cy.visit('/admin/create-product.html')
  })

  it('should load create product page', () => {
    cy.get('body').should('exist')
  })

  it('should have form elements', () => {
    cy.get('form, #product-form').should('exist')
  })
})

describe('Admin Edit Product', () => {
  beforeEach(() => {
    cy.visit('/admin/edit-product.html?id=1')
  })

  it('should load edit product page', () => {
    cy.get('body').should('exist')
  })

  it('should have form elements', () => {
    cy.get('form, #edit-product-form').should('exist')
  })
})
