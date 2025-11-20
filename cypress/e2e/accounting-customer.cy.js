describe('Accounting Module - Customer Access Restrictions', () => {
  beforeEach(() => {
    cy.task('db:seed:customer')
    cy.login('customer@test.com', 'Customer123!')
  })

  it('should redirect customer from accounting dashboard to home', () => {
    cy.visit('/admin/accounting')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    cy.contains('No tienes permisos').should('be.visible')
  })

  it('should redirect customer from expenses page to home', () => {
    cy.visit('/admin/expenses')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })

  it('should redirect customer from new expense page to home', () => {
    cy.visit('/admin/expenses/new')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })

  it('should redirect customer from reports page to home', () => {
    cy.visit('/admin/accounting/reports')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })

  it('should not display admin menu items for customer', () => {
    cy.visit('/')
    cy.get('nav').should('not.contain', 'Contabilidad')
    cy.get('nav').should('not.contain', 'Dashboard')
    cy.get('nav').should('not.contain', 'Gastos')
  })
})
