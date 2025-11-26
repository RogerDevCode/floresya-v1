import { test, expect } from '@playwright/test'
import * as authHelpers from './utils/auth-helpers.js'

test.describe.skip('Accounting - Admin Access (TODO: Add login page)', () => {
  test.beforeEach(async ({ page }) => {
    // cy.task('db:seed:admin') - This was a mock in Cypress, just logging.
    console.log('Seeding admin user...')
    await authHelpers.login(page, 'admin@floresya.com', 'Admin123!')
  })

  test('should allow admin to access accounting dashboard', async ({ page }) => {
    await page.goto('/admin/accounting')
    await expect(page).toHaveURL(/.*\/admin\/accounting/)
    await expect(page.locator('h1', { hasText: 'Contabilidad' })).toBeVisible()
  })

  test('should allow admin to create new expense', async ({ page }) => {
    await page.goto('/admin/expenses/new')

    await page.locator('#category').selectOption('flores')
    await page.locator('#description').fill('Rosas rojas mayoreo')
    await page.locator('#amount').fill('125.50')
    await page.locator('#expense_date').fill('2025-11-19')
    await page.locator('#payment_method').selectOption('efectivo')
    await page.locator('#notes').fill('Proveedor XYZ')

    await page.locator('form').evaluate(form => form.submit())
    // Or click submit button if exists. Cypress used cy.get('form').submit()
    // Playwright doesn't have form.submit() directly on locator, but we can use evaluate.
    // However, usually there is a button. If not, evaluate is fine.

    await expect(page).toHaveURL(/.*\/admin\/expenses/)
    await expect(page.locator('text=Gasto registrado exitosamente')).toBeVisible()
  })

  test('should display expense list for admin', async ({ page }) => {
    await page.goto('/admin/expenses')

    await expect(page.locator('table')).toBeVisible()
    const rowCount = await page.locator('tbody tr').count()
    expect(rowCount).toBeGreaterThan(0)
  })

  test('should allow admin to view accounting reports', async ({ page }) => {
    await page.goto('/admin/accounting/reports')

    await page.locator('#period').selectOption('week')
    await page.locator('button[type="submit"]').click()

    await expect(page.locator('.report-summary')).toBeVisible()
    await expect(page.locator('.total-sales')).toBeAttached()
    await expect(page.locator('.total-expenses')).toBeAttached()
    await expect(page.locator('.net-profit')).toBeAttached()
  })
})
