// @ts-nocheck
describe('Accounting Module - Admin Access', () => {
  beforeEach(() => {
    cy.task('db:seed:admin')
    cy.login('admin@floresya.com', 'Admin123!')
  })

  it('should allow admin to access accounting dashboard', () => {
    cy.visit('/admin/accounting')
    cy.url().should('include', '/admin/accounting')
    cy.contains('h1', 'Contabilidad').should('be.visible')
  })

  it('should allow admin to create new expense', () => {
    cy.visit('/admin/expenses/new')

    cy.get('#category').select('flores')
    cy.get('#description').type('Rosas rojas mayoreo')
    cy.get('#amount').type('125.50')
    cy.get('#expense_date').type('2025-11-19')
    cy.get('#payment_method').select('efectivo')
    cy.get('#notes').type('Proveedor XYZ')

    cy.get('form').submit()

    cy.url().should('include', '/admin/expenses')
    cy.contains('Gasto registrado exitosamente').should('be.visible')
  })

  it('should display expense list for admin', () => {
    cy.visit('/admin/expenses')

    cy.get('table').should('be.visible')
    cy.get('tbody tr').should('have.length.greaterThan', 0)
  })

  it('should allow admin to view accounting reports', () => {
    cy.visit('/admin/accounting/reports')

    cy.get('#period').select('week')
    cy.get('button[type="submit"]').click()

    cy.get('.report-summary').should('be.visible')
    cy.get('.total-sales').should('exist')
    cy.get('.total-expenses').should('exist')
    cy.get('.net-profit').should('exist')
  })
})
