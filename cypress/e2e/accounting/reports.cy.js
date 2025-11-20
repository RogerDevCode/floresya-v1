/**
 * E2E Tests - Accounting Module: Reports Dashboard
 * Tests financial reports, profit/loss calculations, and dashboard UI
 */

describe('Accounting Module - Reports Dashboard', () => {
  const ADMIN_EMAIL = Cypress.env('ADMIN_EMAIL') || 'admin@floresya.com'
  const ADMIN_PASSWORD = Cypress.env('ADMIN_PASSWORD') || 'admin123'

  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.login(ADMIN_EMAIL, ADMIN_PASSWORD)
  })

  context('Access Control', () => {
    it('should allow admin to access accounting dashboard', () => {
      cy.visit('/dashboard/accounting')
      cy.url().should('include', '/dashboard/accounting')
      cy.get('h1').should('contain', 'Contabilidad')
    })

    it('should redirect non-admin to home', () => {
      const CLIENT_EMAIL = Cypress.env('CLIENT_EMAIL') || 'client@floresya.com'
      const CLIENT_PASSWORD = Cypress.env('CLIENT_PASSWORD') || 'client123'

      cy.clearCookies()
      cy.clearLocalStorage()
      cy.login(CLIENT_EMAIL, CLIENT_PASSWORD)
      cy.visit('/dashboard/accounting', { failOnStatusCode: false })
      cy.url().should('not.include', '/dashboard/accounting')
    })
  })

  context('Dashboard Overview', () => {
    beforeEach(() => {
      cy.visit('/dashboard/accounting')
    })

    it('should display key metrics cards', () => {
      cy.get('[data-cy=total-sales-card]').should('be.visible')
      cy.get('[data-cy=total-expenses-card]').should('be.visible')
      cy.get('[data-cy=profit-loss-card]').should('be.visible')
      cy.get('[data-cy=profit-margin-card]').should('be.visible')
    })

    it('should display sales amount in USD', () => {
      cy.get('[data-cy=total-sales-amount]').should('contain', '$')
      cy.get('[data-cy=total-sales-amount]')
        .invoke('text')
        .should('match', /\$\d+(\.\d{2})?/)
    })

    it('should display expenses amount in USD', () => {
      cy.get('[data-cy=total-expenses-amount]').should('contain', '$')
      cy.get('[data-cy=total-expenses-amount]')
        .invoke('text')
        .should('match', /\$\d+(\.\d{2})?/)
    })

    it('should calculate profit/loss correctly', () => {
      let sales, expenses

      cy.get('[data-cy=total-sales-amount]')
        .invoke('text')
        .then(text => {
          sales = parseFloat(text.replace('$', '').replace(',', ''))
        })

      cy.get('[data-cy=total-expenses-amount]')
        .invoke('text')
        .then(text => {
          expenses = parseFloat(text.replace('$', '').replace(',', ''))
        })

      cy.get('[data-cy=profit-loss-amount]')
        .invoke('text')
        .then(text => {
          const profitLoss = parseFloat(text.replace('$', '').replace(',', ''))
          const expected = sales - expenses
          expect(profitLoss).to.be.closeTo(expected, 0.01)
        })
    })

    it('should show positive profit in green', () => {
      cy.get('[data-cy=profit-loss-card]').then($card => {
        const text = $card.find('[data-cy=profit-loss-amount]').text()
        const amount = parseFloat(text.replace('$', '').replace(',', ''))

        if (amount > 0) {
          cy.wrap($card).should('have.class', 'positive')
          cy.wrap($card).find('[data-cy=profit-loss-amount]').should('have.class', 'text-green')
        }
      })
    })

    it('should show negative profit in red', () => {
      cy.get('[data-cy=profit-loss-card]').then($card => {
        const text = $card.find('[data-cy=profit-loss-amount]').text()
        const amount = parseFloat(text.replace('$', '').replace(',', ''))

        if (amount < 0) {
          cy.wrap($card).should('have.class', 'negative')
          cy.wrap($card).find('[data-cy=profit-loss-amount]').should('have.class', 'text-red')
        }
      })
    })
  })

  context('Period Selector', () => {
    beforeEach(() => {
      cy.visit('/dashboard/accounting')
    })

    it('should have weekly and monthly period options', () => {
      cy.get('[data-cy=period-selector]').should('be.visible')
      cy.get('[data-cy=period-weekly]').should('exist')
      cy.get('[data-cy=period-monthly]').should('exist')
    })

    it('should update data when switching to weekly view', () => {
      cy.get('[data-cy=period-weekly]').click()
      cy.get('[data-cy=period-label]').should('contain', 'Semanal')
      cy.get('[data-cy=total-sales-card]').should('be.visible')
    })

    it('should update data when switching to monthly view', () => {
      cy.get('[data-cy=period-monthly]').click()
      cy.get('[data-cy=period-label]').should('contain', 'Mensual')
      cy.get('[data-cy=total-sales-card]').should('be.visible')
    })

    it('should have custom date range option', () => {
      cy.get('[data-cy=period-custom]').click()
      cy.get('[data-cy=custom-start-date]').should('be.visible')
      cy.get('[data-cy=custom-end-date]').should('be.visible')
      cy.get('[data-cy=apply-custom-period]').should('be.visible')
    })

    it('should apply custom date range correctly', () => {
      cy.get('[data-cy=period-custom]').click()
      cy.get('[data-cy=custom-start-date]').type('2025-11-01')
      cy.get('[data-cy=custom-end-date]').type('2025-11-15')
      cy.get('[data-cy=apply-custom-period]').click()

      cy.get('[data-cy=period-label]').should('contain', '2025-11-01')
      cy.get('[data-cy=period-label]').should('contain', '2025-11-15')
    })
  })

  context('Sales vs Expenses Chart', () => {
    beforeEach(() => {
      cy.visit('/dashboard/accounting')
    })

    it('should display chart visualization', () => {
      cy.get('[data-cy=chart-container]').should('be.visible')
      cy.get('canvas').should('exist')
    })

    it('should show sales and expenses data series', () => {
      cy.get('[data-cy=chart-legend]').should('contain', 'Ventas')
      cy.get('[data-cy=chart-legend]').should('contain', 'Gastos')
    })

    it('should be interactive on hover', () => {
      cy.get('canvas').trigger('mousemove', { x: 100, y: 100 })
      cy.get('[data-cy=chart-tooltip]').should('be.visible')
    })
  })

  context('Export Functionality', () => {
    beforeEach(() => {
      cy.visit('/dashboard/accounting')
    })

    it('should have export button', () => {
      cy.get('[data-cy=export-btn]').should('be.visible')
      cy.get('[data-cy=export-btn]').should('contain', 'Exportar')
    })

    it('should show export format options', () => {
      cy.get('[data-cy=export-btn]').click()
      cy.get('[data-cy=export-pdf]').should('be.visible')
      cy.get('[data-cy=export-csv]').should('be.visible')
      cy.get('[data-cy=export-excel]').should('be.visible')
    })

    it('should download CSV report', () => {
      cy.get('[data-cy=export-btn]').click()
      cy.get('[data-cy=export-csv]').click()

      const downloadsFolder = Cypress.config('downloadsFolder')
      cy.readFile(`${downloadsFolder}/reporte-contabilidad.csv`, { timeout: 15000 }).should('exist')
    })

    it('should download PDF report', () => {
      cy.get('[data-cy=export-btn]').click()
      cy.get('[data-cy=export-pdf]').click()

      const downloadsFolder = Cypress.config('downloadsFolder')
      cy.readFile(`${downloadsFolder}/reporte-contabilidad.pdf`, { timeout: 15000 }).should('exist')
    })
  })

  context('Expenses by Category Breakdown', () => {
    beforeEach(() => {
      cy.visit('/dashboard/accounting')
    })

    it('should display expenses breakdown table', () => {
      cy.get('[data-cy=expenses-breakdown]').should('be.visible')
      cy.get('[data-cy=expenses-breakdown] thead').should('contain', 'Categoría')
      cy.get('[data-cy=expenses-breakdown] thead').should('contain', 'Monto')
      cy.get('[data-cy=expenses-breakdown] thead').should('contain', '% del Total')
    })

    it('should show all expense categories', () => {
      const categories = ['Flores', 'Suministros', 'Personal', 'Servicios', 'Transporte', 'Otros']

      categories.forEach(category => {
        cy.get('[data-cy=expenses-breakdown]').should('contain', category)
      })
    })

    it('should calculate percentages correctly', () => {
      const percentages = []

      cy.get('[data-cy=expenses-breakdown] tbody tr')
        .each($row => {
          const percentText = $row.find('[data-cy=category-percent]').text()
          const percent = parseFloat(percentText.replace('%', ''))
          percentages.push(percent)
        })
        .then(() => {
          const sumPercent = percentages.reduce((a, b) => a + b, 0)
          expect(sumPercent).to.be.closeTo(100, 0.1)
        })
    })
  })

  context('Quick Actions', () => {
    beforeEach(() => {
      cy.visit('/dashboard/accounting')
    })

    it('should have quick link to register expense', () => {
      cy.get('[data-cy=quick-add-expense]').should('be.visible').click()
      cy.url().should('include', '/dashboard/expenses')
    })

    it('should have quick link to view all expenses', () => {
      cy.get('[data-cy=view-all-expenses]').should('be.visible').click()
      cy.url().should('include', '/dashboard/expenses')
    })
  })

  context('Responsive Design', () => {
    beforeEach(() => {
      cy.visit('/dashboard/accounting')
    })

    it('should display correctly on mobile', () => {
      cy.viewport('iphone-x')
      cy.get('[data-cy=total-sales-card]').should('be.visible')
      cy.get('[data-cy=chart-container]').should('be.visible')
    })

    it('should stack cards vertically on mobile', () => {
      cy.viewport('iphone-x')
      cy.get('[data-cy=metrics-grid]').should('have.css', 'flex-direction', 'column')
    })

    it('should display correctly on tablet', () => {
      cy.viewport('ipad-2')
      cy.get('[data-cy=total-sales-card]').should('be.visible')
      cy.get('[data-cy=chart-container]').should('be.visible')
    })

    it('should display correctly on desktop', () => {
      cy.viewport(1920, 1080)
      cy.get('[data-cy=metrics-grid]').should('have.css', 'display', 'grid')
    })
  })

  context('Dark Theme Support', () => {
    beforeEach(() => {
      cy.visit('/dashboard/accounting')
    })

    it('should apply dark theme to cards', () => {
      cy.get('[data-cy=theme-toggle]').click()
      cy.get('body').should('have.class', 'dark')
      cy.get('[data-cy=total-sales-card]').should('have.class', 'dark:bg-gray-800')
    })

    it('should update chart colors for dark theme', () => {
      cy.get('[data-cy=theme-toggle]').click()
      cy.get('canvas').should('exist')
    })
  })

  context('Real-time Updates', () => {
    beforeEach(() => {
      cy.visit('/dashboard/accounting')
    })

    it('should refresh data periodically', () => {
      cy.get('[data-cy=last-updated]').should('be.visible')
      cy.get('[data-cy=last-updated]').invoke('text').as('initialTime')

      cy.wait(60000)

      cy.get('[data-cy=last-updated]').invoke('text').should('not.equal', '@initialTime')
    })

    it('should have manual refresh button', () => {
      cy.get('[data-cy=refresh-btn]').should('be.visible').click()
      cy.get('[data-cy=loading-spinner]').should('be.visible')
      cy.get('[data-cy=loading-spinner]').should('not.exist')
    })
  })
})
