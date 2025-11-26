import { test, expect } from '@playwright/test'
import * as authHelpers from './utils/auth-helpers.js'

test.describe.skip('Accounting - Customer Restrictions (TODO: Add login page)', () => {
  test.beforeEach(async ({ page }) => {
    // cy.task('db:seed:customer') - Mock
    console.log('Seeding customer user...')
    await authHelpers.login(page, 'customer@test.com', 'Customer123!')
  })

  test('should redirect customer from accounting dashboard to home', async ({ page }) => {
    await page.goto('/admin/accounting')
    // Expect redirect to home
    await expect(page).toHaveURL(/\/$/) // Ends with /
    await expect(page.locator('text=No tienes permisos')).toBeVisible()
  })

  test('should redirect customer from expenses page to home', async ({ page }) => {
    await page.goto('/admin/expenses')
    await expect(page).toHaveURL(/\/$/)
  })

  test('should redirect customer from new expense page to home', async ({ page }) => {
    await page.goto('/admin/expenses/new')
    await expect(page).toHaveURL(/\/$/)
  })

  test('should redirect customer from reports page to home', async ({ page }) => {
    await page.goto('/admin/accounting/reports')
    await expect(page).toHaveURL(/\/$/)
  })

  test('should not display admin menu items for customer', async ({ page }) => {
    await page.goto('/')
    const nav = page.locator('nav')
    await expect(nav).not.toContainText('Contabilidad')
    await expect(nav).not.toContainText('Dashboard')
    await expect(nav).not.toContainText('Gastos')
  })
})
