/**
 * E2E Tests - Accounting Module: Expenses Management
 * Tests complete user flows for expense CRUD operations
 */
// @ts-nocheck

describe('Accounting Module - Expenses Management', () => {
  const ADMIN_EMAIL = Cypress.env('ADMIN_EMAIL') || 'admin@floresya.com'
  const ADMIN_PASSWORD = Cypress.env('ADMIN_PASSWORD') || 'admin123'
  const CLIENT_EMAIL = Cypress.env('CLIENT_EMAIL') || 'client@floresya.com'
  const CLIENT_PASSWORD = Cypress.env('CLIENT_PASSWORD') || 'client123'

  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  context('Access Control - Admin Only', () => {
    it('should allow admin to access expenses page', () => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD)
      cy.visit('/dashboard/expenses')
      cy.url().should('include', '/dashboard/expenses')
      cy.get('h1').should('contain', 'Gastos')
    })

    it('should redirect non-admin users to home', () => {
      cy.login(CLIENT_EMAIL, CLIENT_PASSWORD)
      cy.visit('/dashboard/expenses', { failOnStatusCode: false })
      cy.url().should('not.include', '/dashboard/expenses')
      cy.url().should('match', /\/(home|login)?$/)
    })

    it('should redirect unauthenticated users to login', () => {
      cy.visit('/dashboard/expenses', { failOnStatusCode: false })
      cy.url().should('include', '/login')
    })
  })

  context('Create Expense Flow', () => {
    beforeEach(() => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD)
      cy.visit('/dashboard/expenses')
    })

    it('should display expense creation form', () => {
      cy.get('[data-cy=new-expense-btn]').should('be.visible').click()
      cy.get('[data-cy=expense-form]').should('be.visible')
      cy.get('[data-cy=expense-category]').should('exist')
      cy.get('[data-cy=expense-description]').should('exist')
      cy.get('[data-cy=expense-amount]').should('exist')
      cy.get('[data-cy=expense-date]').should('exist')
      cy.get('[data-cy=expense-payment-method]').should('exist')
    })

    it('should create a new expense successfully', () => {
      const testExpense = {
        category: 'flores',
        description: 'Test expense from E2E',
        amount: '50.00',
        date: '2025-11-19',
        paymentMethod: 'cash'
      }

      cy.get('[data-cy=new-expense-btn]').click()
      cy.get('[data-cy=expense-category]').select(testExpense.category)
      cy.get('[data-cy=expense-description]').type(testExpense.description)
      cy.get('[data-cy=expense-amount]').type(testExpense.amount)
      cy.get('[data-cy=expense-date]').type(testExpense.date)
      cy.get('[data-cy=expense-payment-method]').select(testExpense.paymentMethod)
      cy.get('[data-cy=expense-submit]').click()

      cy.get('[data-cy=success-message]').should('contain', 'Gasto registrado exitosamente')
      cy.get('[data-cy=expenses-table]').should('contain', testExpense.description)
    })

    it('should validate required fields', () => {
      cy.get('[data-cy=new-expense-btn]').click()
      cy.get('[data-cy=expense-submit]').click()

      cy.get('[data-cy=expense-category]').should('have.attr', 'required')
      cy.get('[data-cy=expense-description]').should('have.attr', 'required')
      cy.get('[data-cy=expense-amount]').should('have.attr', 'required')
      cy.get('[data-cy=expense-date]').should('have.attr', 'required')
    })

    it('should validate amount as positive number', () => {
      cy.get('[data-cy=new-expense-btn]').click()
      cy.get('[data-cy=expense-amount]').type('-50')
      cy.get('[data-cy=expense-submit]').click()

      cy.get('[data-cy=error-message]').should('contain', 'El monto debe ser mayor a 0')
    })
  })

  context('List and Filter Expenses', () => {
    beforeEach(() => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD)
      cy.visit('/dashboard/expenses')
    })

    it('should display expenses table', () => {
      cy.get('[data-cy=expenses-table]').should('be.visible')
      cy.get('[data-cy=expenses-table] thead').should('contain', 'Categoría')
      cy.get('[data-cy=expenses-table] thead').should('contain', 'Descripción')
      cy.get('[data-cy=expenses-table] thead').should('contain', 'Monto')
      cy.get('[data-cy=expenses-table] thead').should('contain', 'Fecha')
      cy.get('[data-cy=expenses-table] thead').should('contain', 'Método de Pago')
    })

    it('should filter expenses by category', () => {
      cy.get('[data-cy=filter-category]').select('flores')
      cy.get('[data-cy=expenses-table] tbody tr').each($row => {
        cy.wrap($row).find('[data-cy=expense-category]').should('contain', 'Flores')
      })
    })

    it('should filter expenses by date range', () => {
      const startDate = '2025-11-01'
      const endDate = '2025-11-30'

      cy.get('[data-cy=filter-start-date]').type(startDate)
      cy.get('[data-cy=filter-end-date]').type(endDate)
      cy.get('[data-cy=filter-apply]').click()

      cy.get('[data-cy=expenses-table] tbody tr').should('have.length.greaterThan', 0)
    })

    it('should display empty state when no expenses', () => {
      cy.get('[data-cy=filter-start-date]').type('2099-01-01')
      cy.get('[data-cy=filter-end-date]').type('2099-01-31')
      cy.get('[data-cy=filter-apply]').click()

      cy.get('[data-cy=empty-state]').should('be.visible')
      cy.get('[data-cy=empty-state]').should('contain', 'No se encontraron gastos')
    })
  })

  context('Update Expense Flow', () => {
    beforeEach(() => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD)
      cy.visit('/dashboard/expenses')
    })

    it('should open edit form with existing data', () => {
      cy.get('[data-cy=expenses-table] tbody tr').first().find('[data-cy=edit-btn]').click()
      cy.get('[data-cy=expense-form]').should('be.visible')
      cy.get('[data-cy=expense-description]').should('not.have.value', '')
      cy.get('[data-cy=expense-amount]').should('not.have.value', '')
    })

    it('should update expense successfully', () => {
      cy.get('[data-cy=expenses-table] tbody tr').first().find('[data-cy=edit-btn]').click()

      const newDescription = 'Updated description E2E'
      cy.get('[data-cy=expense-description]').clear().type(newDescription)
      cy.get('[data-cy=expense-submit]').click()

      cy.get('[data-cy=success-message]').should('contain', 'Gasto actualizado')
      cy.get('[data-cy=expenses-table]').should('contain', newDescription)
    })

    it('should cancel edit and restore original data', () => {
      cy.get('[data-cy=expenses-table] tbody tr')
        .first()
        .then($row => {
          const originalDescription = $row.find('[data-cy=expense-description]').text()

          cy.wrap($row).find('[data-cy=edit-btn]').click()
          cy.get('[data-cy=expense-description]').clear().type('This will be cancelled')
          cy.get('[data-cy=expense-cancel]').click()

          cy.get('[data-cy=expenses-table]').should('contain', originalDescription)
          cy.get('[data-cy=expenses-table]').should('not.contain', 'This will be cancelled')
        })
    })
  })

  context('Delete Expense Flow (Soft Delete)', () => {
    beforeEach(() => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD)
      cy.visit('/dashboard/expenses')
    })

    it('should soft delete expense', () => {
      cy.get('[data-cy=expenses-table] tbody tr')
        .first()
        .then($row => {
          const description = $row.find('[data-cy=expense-description]').text()

          cy.wrap($row).find('[data-cy=delete-btn]').click()
          cy.get('[data-cy=confirm-delete]').should('be.visible')
          cy.get('[data-cy=confirm-delete-btn]').click()

          cy.get('[data-cy=success-message]').should('contain', 'Gasto eliminado')
          cy.get('[data-cy=expenses-table]').should('not.contain', description)
        })
    })

    it('should show inactive expenses when toggled', () => {
      const rowCountBefore = Cypress.$('[data-cy=expenses-table] tbody tr').length

      cy.get('[data-cy=show-inactive-toggle]').check()

      cy.get('[data-cy=expenses-table] tbody tr').should('have.length.greaterThan', rowCountBefore)
      cy.get('[data-cy=expenses-table] tbody tr.inactive').should('exist')
    })

    it('should cancel delete operation', () => {
      cy.get('[data-cy=expenses-table] tbody tr')
        .first()
        .then($row => {
          const description = $row.find('[data-cy=expense-description]').text()

          cy.wrap($row).find('[data-cy=delete-btn]').click()
          cy.get('[data-cy=confirm-delete]').should('be.visible')
          cy.get('[data-cy=cancel-delete-btn]').click()

          cy.get('[data-cy=expenses-table]').should('contain', description)
        })
    })
  })

  context('Dark/Light Theme Support', () => {
    beforeEach(() => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD)
      cy.visit('/dashboard/expenses')
    })

    it('should apply dark theme correctly', () => {
      cy.get('[data-cy=theme-toggle]').click()
      cy.get('body').should('have.class', 'dark')
      cy.get('[data-cy=expenses-table]')
        .should('have.css', 'background-color')
        .and('match', /rgb\(.*\)/)
    })

    it('should apply light theme correctly', () => {
      cy.get('[data-cy=theme-toggle]').click()
      cy.get('[data-cy=theme-toggle]').click()
      cy.get('body').should('not.have.class', 'dark')
      cy.get('[data-cy=expenses-table]')
        .should('have.css', 'background-color')
        .and('match', /rgb\(.*\)/)
    })

    it('should persist theme preference', () => {
      cy.get('[data-cy=theme-toggle]').click()
      cy.reload()
      cy.get('body').should('have.class', 'dark')
    })
  })

  context('Responsive Design', () => {
    beforeEach(() => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD)
      cy.visit('/dashboard/expenses')
    })

    it('should display correctly on mobile', () => {
      cy.viewport('iphone-x')
      cy.get('[data-cy=expenses-table]').should('be.visible')
      cy.get('[data-cy=new-expense-btn]').should('be.visible')
    })

    it('should display correctly on tablet', () => {
      cy.viewport('ipad-2')
      cy.get('[data-cy=expenses-table]').should('be.visible')
      cy.get('[data-cy=new-expense-btn]').should('be.visible')
    })

    it('should display correctly on desktop', () => {
      cy.viewport(1920, 1080)
      cy.get('[data-cy=expenses-table]').should('be.visible')
      cy.get('[data-cy=new-expense-btn]').should('be.visible')
    })
  })
})
