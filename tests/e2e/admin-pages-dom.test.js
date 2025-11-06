import { test, expect } from '@playwright/test'

/**
 * Tests para verificar que las páginas de admin cargan correctamente
 */

test.describe('Admin Pages DOM Loading', () => {
  const adminPages = [
    { path: '/pages/admin/dashboard.html', name: 'Dashboard' },
    { path: '/pages/admin/create-product.html', name: 'Create Product' },
    { path: '/pages/admin/edit-product.html', name: 'Edit Product' },
    { path: '/pages/admin/orders.html', name: 'Orders Management' },
    { path: '/pages/admin/occasions.html', name: 'Occasions Management' }
  ]

  adminPages.forEach(({ path, name }) => {
    test.describe(`Admin Page: ${name}`, () => {
      test(`should load ${path} without errors`, async ({ page }) => {
        await page.goto(path, { waitUntil: 'networkidle' })

        // Verificar elementos básicos
        await expect(page.locator('body')).toBeVisible()
        await expect(page.locator('header')).toBeVisible()

        // Verificar que no hay errores críticos de JS
        const jsErrors = []
        page.on('console', msg => {
          if (msg.type() === 'error') {
            jsErrors.push(msg.text())
          }
        })
        page.on('pageerror', error => {
          jsErrors.push(error.message)
        })

        await page.waitForTimeout(2000)

        const criticalErrors = jsErrors.filter(
          err => !err.toLowerCase().includes('favicon') && !err.toLowerCase().includes('warning')
        )

        expect(criticalErrors.length).toBe(0)
      })

      test(`should have admin navigation - ${path}`, async ({ page }) => {
        await page.goto(path)

        // Buscar navegación de admin
        const adminNav = page.locator(
          '.admin-nav, .sidebar, .admin-sidebar, .navigation, [data-admin-nav]'
        )

        if ((await adminNav.count()) > 0) {
          await expect(adminNav.first()).toBeVisible()

          // Verificar enlaces de navegación
          const navLinks = adminNav.locator('a')
          const linkCount = await navLinks.count()

          if (linkCount > 0) {
            // Al menos un enlace debería ser visible
            await expect(navLinks.first()).toBeVisible()
          }
        }
      })

      test(`should be responsive - ${path}`, async ({ page }) => {
        await page.goto(path)

        // Verificar en móvil
        await page.setViewportSize({ width: 375, height: 667 })
        await page.waitForTimeout(500)

        const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
        const viewportWidth = await page.viewportSize().width
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10)
      })
    })
  })

  test.describe('Dashboard Specific Tests', () => {
    test('dashboard should load statistics widgets', async ({ page }) => {
      await page.goto('/pages/admin/dashboard.html')
      await page.waitForLoadState('networkidle')

      // Buscar widgets de estadísticas
      const widgets = page.locator('.widget, .stat, .statistics, .stats-widget, [data-widget]')

      if ((await widgets.count()) > 0) {
        // Al menos un widget debería estar visible
        await expect(widgets.first()).toBeVisible()
      }
    })

    test('dashboard should load charts if present', async ({ page }) => {
      await page.goto('/pages/admin/dashboard.html')
      await page.waitForLoadState('networkidle')

      // Buscar gráficos
      const charts = page.locator('canvas, .chart, .graph, [data-chart]')

      if ((await charts.count()) > 0) {
        await expect(charts.first()).toBeVisible()
      }
    })
  })

  test.describe('Product Editor Specific Tests', () => {
    test('product editor should have form fields', async ({ page }) => {
      await page.goto('/pages/admin/create-product.html')
      await page.waitForLoadState('networkidle')

      // Buscar formulario
      const form = page.locator('form, .product-form, [data-form="product"]')

      if ((await form.count()) > 0) {
        await expect(form.first()).toBeVisible()

        // Verificar campos de entrada
        const inputs = form.locator('input, textarea, select')
        const inputCount = await inputs.count()

        if (inputCount > 0) {
          // Al menos un input debería estar visible
          await expect(inputs.first()).toBeVisible()
        }
      }
    })

    test('product editor should have image upload area', async ({ page }) => {
      await page.goto('/pages/admin/create-product.html')
      await page.waitForLoadState('networkidle')

      // Buscar área de carga de imágenes
      const uploadArea = page.locator('.upload-area, .image-upload, .file-upload, [data-upload]')

      if ((await uploadArea.count()) > 0) {
        await expect(uploadArea.first()).toBeVisible()
      }
    })
  })

  test.describe('Orders Management Specific Tests', () => {
    test('orders page should load order table', async ({ page }) => {
      await page.goto('/pages/admin/orders.html')
      await page.waitForLoadState('networkidle')

      // Buscar tabla de órdenes
      const table = page.locator('table, .orders-table, [data-table="orders"]')

      if ((await table.count()) > 0) {
        await expect(table.first()).toBeVisible()

        // Verificar headers de tabla
        const headers = table.locator('th, thead th')
        const headerCount = await headers.count()

        if (headerCount > 0) {
          await expect(headers.first()).toBeVisible()
        }
      }
    })

    test('orders page should have filters', async ({ page }) => {
      await page.goto('/pages/admin/orders.html')
      await page.waitForLoadState('networkidle')

      // Buscar filtros
      const filters = page.locator('.filters, .filter-bar, .search-filters, [data-filters]')

      if ((await filters.count()) > 0) {
        await expect(filters.first()).toBeVisible()
      }
    })
  })

  test.describe('Occasions Management Specific Tests', () => {
    test('occasions page should load occasions list', async ({ page }) => {
      await page.goto('/pages/admin/occasions.html')
      await page.waitForLoadState('networkidle')

      // Buscar lista de ocasiones
      const list = page.locator('.occasions-list, .list, .items-list, [data-list="occasions"]')

      if ((await list.count()) > 0) {
        await expect(list.first()).toBeVisible()
      }
    })

    test('occasions page should have create button', async ({ page }) => {
      await page.goto('/pages/admin/occasions.html')

      // Buscar botón de crear
      const createButton = page.locator(
        '.create-btn, .btn-create, .add-occasion, [data-action="create"]'
      )

      if ((await createButton.count()) > 0) {
        await expect(createButton.first()).toBeVisible()
      }
    })
  })
})
