import { test, expect } from '@playwright/test'
import * as authHelpers from '../utils/auth-helpers.js'

test.describe.skip('Accounting Module - Expenses Management (TODO: Add login page)', () => {
  const ADMIN_EMAIL = 'admin@floresya.com'
  const ADMIN_PASSWORD = 'admin123'
  const CLIENT_EMAIL = 'client@floresya.com'
  const CLIENT_PASSWORD = 'client123'

  test.beforeEach(async ({ page }) => {
    // Clear cookies/storage is handled by Playwright context usually, but we can be explicit if needed
    // await page.context().clearCookies()
  })

  test.describe('Access Control - Admin Only', () => {
    test('should allow admin to access expenses page', async ({ page }) => {
      await authHelpers.login(page, ADMIN_EMAIL, ADMIN_PASSWORD)
      await page.goto('/dashboard/expenses')
      await expect(page).toHaveURL(/.*\/dashboard\/expenses/)
      await expect(page.locator('h1')).toContainText('Gastos')
    })

    test('should redirect non-admin users to home', async ({ page }) => {
      await authHelpers.login(page, CLIENT_EMAIL, CLIENT_PASSWORD)
      await page.goto('/dashboard/expenses')
      await expect(page).not.toHaveURL(/.*\/dashboard\/expenses/)
      // Expect redirect to home or login
      await expect(page).toHaveURL(/\/(home|login)?$/)
    })

    test('should redirect unauthenticated users to login', async ({ page }) => {
      await page.goto('/dashboard/expenses')
      await expect(page).toHaveURL(/.*\/login/)
    })
  })

  test.describe('Create Expense Flow', () => {
    test.beforeEach(async ({ page }) => {
      await authHelpers.login(page, ADMIN_EMAIL, ADMIN_PASSWORD)
      await page.goto('/dashboard/expenses')
    })

    test('should display expense creation form', async ({ page }) => {
      await page.locator('[data-cy=new-expense-btn]').click()
      await expect(page.locator('[data-cy=expense-form]')).toBeVisible()
      await expect(page.locator('[data-cy=expense-category]')).toBeVisible()
      await expect(page.locator('[data-cy=expense-description]')).toBeVisible()
      await expect(page.locator('[data-cy=expense-amount]')).toBeVisible()
      await expect(page.locator('[data-cy=expense-date]')).toBeVisible()
      await expect(page.locator('[data-cy=expense-payment-method]')).toBeVisible()
    })

    test('should create a new expense successfully', async ({ page }) => {
      const testExpense = {
        category: 'flores',
        description: 'Test expense from E2E',
        amount: '50.00',
        date: '2025-11-19',
        paymentMethod: 'cash'
      }

      await page.locator('[data-cy=new-expense-btn]').click()
      await page.locator('[data-cy=expense-category]').selectOption(testExpense.category)
      await page.locator('[data-cy=expense-description]').fill(testExpense.description)
      await page.locator('[data-cy=expense-amount]').fill(testExpense.amount)
      await page.locator('[data-cy=expense-date]').fill(testExpense.date)
      await page.locator('[data-cy=expense-payment-method]').selectOption(testExpense.paymentMethod)
      await page.locator('[data-cy=expense-submit]').click()

      await expect(page.locator('[data-cy=success-message]')).toContainText(
        'Gasto registrado exitosamente'
      )
      await expect(page.locator('[data-cy=expenses-table]')).toContainText(testExpense.description)
    })

    test('should validate required fields', async ({ page }) => {
      await page.locator('[data-cy=new-expense-btn]').click()
      await page.locator('[data-cy=expense-submit]').click()

      // Check HTML5 validation or custom error messages
      // Playwright can check validationMessage property but it's a bit verbose.
      // Assuming standard HTML5 validation or custom UI feedback.
      // Cypress test checked 'required' attribute.
      await expect(page.locator('[data-cy=expense-category]')).toHaveAttribute('required', '')
      await expect(page.locator('[data-cy=expense-description]')).toHaveAttribute('required', '')
      await expect(page.locator('[data-cy=expense-amount]')).toHaveAttribute('required', '')
      await expect(page.locator('[data-cy=expense-date]')).toHaveAttribute('required', '')
    })

    test('should validate amount as positive number', async ({ page }) => {
      await page.locator('[data-cy=new-expense-btn]').click()
      await page.locator('[data-cy=expense-amount]').fill('-50')
      await page.locator('[data-cy=expense-submit]').click()

      await expect(page.locator('[data-cy=error-message]')).toContainText(
        'El monto debe ser mayor a 0'
      )
    })
  })

  test.describe('List and Filter Expenses', () => {
    test.beforeEach(async ({ page }) => {
      await authHelpers.login(page, ADMIN_EMAIL, ADMIN_PASSWORD)
      await page.goto('/dashboard/expenses')
    })

    test('should display expenses table', async ({ page }) => {
      await expect(page.locator('[data-cy=expenses-table]')).toBeVisible()
      const thead = page.locator('[data-cy=expenses-table] thead')
      await expect(thead).toContainText('Categoría')
      await expect(thead).toContainText('Descripción')
      await expect(thead).toContainText('Monto')
      await expect(thead).toContainText('Fecha')
      await expect(thead).toContainText('Método de Pago')
    })

    test('should filter expenses by category', async ({ page }) => {
      await page.locator('[data-cy=filter-category]').selectOption('flores')
      const rows = page.locator('[data-cy=expenses-table] tbody tr')
      const count = await rows.count()
      for (let i = 0; i < count; i++) {
        await expect(rows.nth(i).locator('[data-cy=expense-category]')).toContainText('Flores')
      }
    })

    test('should filter expenses by date range', async ({ page }) => {
      const startDate = '2025-11-01'
      const endDate = '2025-11-30'

      await page.locator('[data-cy=filter-start-date]').fill(startDate)
      await page.locator('[data-cy=filter-end-date]').fill(endDate)
      await page.locator('[data-cy=filter-apply]').click()

      await expect(page.locator('[data-cy=expenses-table] tbody tr')).not.toHaveCount(0)
    })

    test('should display empty state when no expenses', async ({ page }) => {
      await page.locator('[data-cy=filter-start-date]').fill('2099-01-01')
      await page.locator('[data-cy=filter-end-date]').fill('2099-01-31')
      await page.locator('[data-cy=filter-apply]').click()

      await expect(page.locator('[data-cy=empty-state]')).toBeVisible()
      await expect(page.locator('[data-cy=empty-state]')).toContainText('No se encontraron gastos')
    })
  })

  test.describe('Update Expense Flow', () => {
    test.beforeEach(async ({ page }) => {
      await authHelpers.login(page, ADMIN_EMAIL, ADMIN_PASSWORD)
      await page.goto('/dashboard/expenses')
    })

    test('should open edit form with existing data', async ({ page }) => {
      await page
        .locator('[data-cy=expenses-table] tbody tr')
        .first()
        .locator('[data-cy=edit-btn]')
        .click()
      await expect(page.locator('[data-cy=expense-form]')).toBeVisible()
      await expect(page.locator('[data-cy=expense-description]')).not.toHaveValue('')
      await expect(page.locator('[data-cy=expense-amount]')).not.toHaveValue('')
    })

    test('should update expense successfully', async ({ page }) => {
      await page
        .locator('[data-cy=expenses-table] tbody tr')
        .first()
        .locator('[data-cy=edit-btn]')
        .click()

      const newDescription = 'Updated description E2E'
      await page.locator('[data-cy=expense-description]').fill(newDescription)
      await page.locator('[data-cy=expense-submit]').click()

      await expect(page.locator('[data-cy=success-message]')).toContainText('Gasto actualizado')
      await expect(page.locator('[data-cy=expenses-table]')).toContainText(newDescription)
    })

    test('should cancel edit and restore original data', async ({ page }) => {
      const row = page.locator('[data-cy=expenses-table] tbody tr').first()
      const originalDescription = await row.locator('[data-cy=expense-description]').innerText()

      await row.locator('[data-cy=edit-btn]').click()
      await page.locator('[data-cy=expense-description]').fill('This will be cancelled')
      await page.locator('[data-cy=expense-cancel]').click()

      await expect(page.locator('[data-cy=expenses-table]')).toContainText(originalDescription)
      await expect(page.locator('[data-cy=expenses-table]')).not.toContainText(
        'This will be cancelled'
      )
    })
  })

  test.describe('Delete Expense Flow (Soft Delete)', () => {
    test.beforeEach(async ({ page }) => {
      await authHelpers.login(page, ADMIN_EMAIL, ADMIN_PASSWORD)
      await page.goto('/dashboard/expenses')
    })

    test('should soft delete expense', async ({ page }) => {
      const row = page.locator('[data-cy=expenses-table] tbody tr').first()
      const description = await row.locator('[data-cy=expense-description]').innerText()

      await row.locator('[data-cy=delete-btn]').click()
      await expect(page.locator('[data-cy=confirm-delete]')).toBeVisible()
      await page.locator('[data-cy=confirm-delete-btn]').click()

      await expect(page.locator('[data-cy=success-message]')).toContainText('Gasto eliminado')
      await expect(page.locator('[data-cy=expenses-table]')).not.toContainText(description)
    })

    test('should show inactive expenses when toggled', async ({ page }) => {
      const initialCount = await page.locator('[data-cy=expenses-table] tbody tr').count()

      await page.locator('[data-cy=show-inactive-toggle]').check()

      const finalCount = await page.locator('[data-cy=expenses-table] tbody tr').count()
      expect(finalCount).toBeGreaterThan(initialCount)
      await expect(page.locator('[data-cy=expenses-table] tbody tr.inactive')).toBeAttached()
    })

    test('should cancel delete operation', async ({ page }) => {
      const row = page.locator('[data-cy=expenses-table] tbody tr').first()
      const description = await row.locator('[data-cy=expense-description]').innerText()

      await row.locator('[data-cy=delete-btn]').click()
      await expect(page.locator('[data-cy=confirm-delete]')).toBeVisible()
      await page.locator('[data-cy=cancel-delete-btn]').click()

      await expect(page.locator('[data-cy=expenses-table]')).toContainText(description)
    })
  })

  test.describe('Dark/Light Theme Support', () => {
    test.beforeEach(async ({ page }) => {
      await authHelpers.login(page, ADMIN_EMAIL, ADMIN_PASSWORD)
      await page.goto('/dashboard/expenses')
    })

    test('should apply dark theme correctly', async ({ page }) => {
      await page.locator('[data-cy=theme-toggle]').click()
      await expect(page.locator('body')).toHaveClass(/dark/)
      await expect(page.locator('[data-cy=expenses-table]')).toHaveCSS(
        'background-color',
        /rgb\(.*\)/
      )
    })

    test('should apply light theme correctly', async ({ page }) => {
      await page.locator('[data-cy=theme-toggle]').click() // Toggle to dark
      await page.locator('[data-cy=theme-toggle]').click() // Toggle back to light
      await expect(page.locator('body')).not.toHaveClass(/dark/)
    })

    test('should persist theme preference', async ({ page }) => {
      await page.locator('[data-cy=theme-toggle]').click()
      await page.reload()
      await expect(page.locator('body')).toHaveClass(/dark/)
    })
  })

  test.describe('Responsive Design', () => {
    test.beforeEach(async ({ page }) => {
      await authHelpers.login(page, ADMIN_EMAIL, ADMIN_PASSWORD)
      await page.goto('/dashboard/expenses')
    })

    test('should display correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 }) // iPhone X
      await expect(page.locator('[data-cy=expenses-table]')).toBeVisible()
      await expect(page.locator('[data-cy=new-expense-btn]')).toBeVisible()
    })

    test('should display correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }) // iPad
      await expect(page.locator('[data-cy=expenses-table]')).toBeVisible()
      await expect(page.locator('[data-cy=new-expense-btn]')).toBeVisible()
    })

    test('should display correctly on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      await expect(page.locator('[data-cy=expenses-table]')).toBeVisible()
      await expect(page.locator('[data-cy=new-expense-btn]')).toBeVisible()
    })
  })
})
