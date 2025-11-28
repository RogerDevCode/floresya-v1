import { test, expect } from '@playwright/test'
import { setupPages } from '../utils/page-setup.js'

// Fixtures completos para filtros combinatorios
const PRODUCT_FIXTURES = [
  // Flores (lower price)
  {
    id: 1,
    name: 'Ramo de Rosas Rojas',
    price_usd: 25.99,
    category: 'flores',
    occasion: ['amor', 'cumpleaños'],
    stock: 15,
    tags: ['rosa', 'romántico']
  },
  {
    id: 2,
    name: 'Girasoles Amarillos',
    price_usd: 22.5,
    category: 'flores',
    occasion: ['agradecimiento', 'recuperación'],
    stock: 8,
    tags: ['amarillo', 'alegre']
  },

  // Plantas (medium price)
  {
    id: 3,
    name: 'Orquídea Bella',
    price_usd: 45.0,
    category: 'plantas',
    occasion: ['decoración', 'inauguración'],
    stock: 6,
    tags: ['verde', 'elegante']
  },
  {
    id: 4,
    name: 'Suculenta Moderna',
    price_usd: 35.0,
    category: 'plantas',
    occasion: ['oficina', 'regalo'],
    stock: 12,
    tags: ['moderno', 'fácil cuidado']
  },

  // Arreglos premium (high price)
  {
    id: 5,
    name: 'Arreglo Floral Premium',
    price_usd: 89.99,
    category: 'arreglos',
    occasion: ['boda', 'aniversario'],
    stock: 4,
    tags: ['lujo', 'exclusivo']
  },
  {
    id: 6,
    name: 'Centro de Mesa Especial',
    price_usd: 120.0,
    category: 'arreglos',
    occasion: ['evento', 'celebración'],
    stock: 3,
    tags: ['grande', 'espectacular']
  }
]

// Todas las categorías y ocasiones disponibles
// const ALL_CATEGORIES = ['flores', 'plantas', 'arreglos']
// const ALL_OCCASIONS = [
//   'amor',
//   'cumpleaños',
//   'agradecimiento',
//   'recuperación',
//   'decoración',
//   'inauguración',
//   'oficina',
//   'regalo',
//   'boda',
//   'aniversario',
//   'evento',
//   'celebración'
// ]
// const PRICE_RANGES = {
//   '0-30': { min: 0, max: 30 },
//   '30-60': { min: 30, max: 60 },
//   '60-100': { min: 60, max: 100 },
//   '100+': { min: 100, max: Infinity }
// }
// const SORT_OPTIONS = ['created_desc', 'price_asc', 'price_desc', 'rating_desc']

test.describe('Catalog Filter Combinations - Complete Coverage', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API con productos completos
    await page.route('**/api/products**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: PRODUCT_FIXTURES,
          pagination: {
            page: 1,
            totalPages: 1,
            totalItems: PRODUCT_FIXTURES.length
          }
        })
      })
    })

    await setupPages(page)
    await page.goto('/#productos')
    await page.waitForLoad()
  })

  // Tests básicos de filtros individuales
  test.describe('Individual Filter Operations', () => {
    test('should filter by category: flores only', async ({ page }) => {
      const categoryFilter = page.locator('[data-testid="filter-category-flores"]')
      await categoryFilter.click()

      // Esperar filtrado
      await page.waitForTimeout(300)

      // Verificar que solo muestre productos de categoría flores
      const visibleProducts = page.locator('[data-testid^="product-card-"]:visible')
      const count = await visibleProducts.count()

      expect(count).toBe(2) // Solo rosas y girasoles

      // Verificar que los productos visibles son flores
      for (let i = 0; i < count; i++) {
        const productCard = visibleProducts.nth(i)
        await expect(productCard.locator('[data-testid="product-category"]')).toContainText(
          'flores'
        )
      }
    })

    test('should filter by category: plantas only', async ({ page }) => {
      const categoryFilter = page.locator('[data-testid="filter-category-plantas"]')
      await categoryFilter.click()

      await page.waitForTimeout(300)

      const visibleProducts = page.locator('[data-testid^="product-card-"]:visible')
      const count = await visibleProducts.count()

      expect(count).toBe(2) // Orquídea y Suculenta

      for (let i = 0; i < count; i++) {
        const productCard = visibleProducts.nth(i)
        await expect(productCard.locator('[data-testid="product-category"]')).toContainText(
          'plantas'
        )
      }
    })

    test('should filter by category: arreglos only', async ({ page }) => {
      const categoryFilter = page.locator('[data-testid="filter-category-arreglos"]')
      await categoryFilter.click()

      await page.waitForTimeout(300)

      const visibleProducts = page.locator('[data-testid^="product-card-"]:visible')
      const count = await visibleProducts.count()

      expect(count).toBe(2) // Arreglo premium y centro de mesa

      for (let i = 0; i < count; i++) {
        const productCard = visibleProducts.nth(i)
        await expect(productCard.locator('[data-testid="product-category"]')).toContainText(
          'arreglos'
        )
      }
    })

    test('should filter by occasion: cumpleaños', async ({ page }) => {
      const occasionFilter = page.locator('[data-testid="filter-occasion-cumpleaños"]')
      await occasionFilter.click()

      await page.waitForTimeout(300)

      const visibleProducts = page.locator('[data-testid^="product-card-"]:visible')
      const count = await visibleProducts.count()

      expect(count).toBe(1) // Solo Ramo de Rosas Rojas

      const productCard = visibleProducts.first()
      await expect(productCard.locator('[data-testid="product-occasions"]')).toContainText(
        'cumpleaños'
      )
    })

    test('should filter by occasion: boda', async ({ page }) => {
      const occasionFilter = page.locator('[data-testid="filter-occasion-boda"]')
      await occasionFilter.click()

      await page.waitForTimeout(300)

      const visibleProducts = page.locator('[data-testid^="product-card-"]:visible')
      const count = await visibleProducts.count()

      expect(count).toBe(2) // Arreglo premium y centro de mesa

      for (let i = 0; i < count; i++) {
        const productCard = visibleProducts.nth(i)
        const occasions = await productCard
          .locator('[data-testid="product-occasions"]')
          .textContent()
        expect(occasions.toLowerCase()).toContain('boda')
      }
    })

    test('should filter by price range: 0-30', async ({ page }) => {
      const priceFilter = page.locator('[data-testid="filter-price-0-30"]')
      await priceFilter.click()

      await page.waitForTimeout(300)

      const visibleProducts = page.locator('[data-testid^="product-card-"]:visible')
      const count = await visibleProducts.count()

      expect(count).toBe(2) // Rosas y girasoles

      // Verificar que todos los precios estén en el rango
      for (let i = 0; i < count; i++) {
        const productCard = visibleProducts.nth(i)
        const priceText = await productCard.locator('[data-testid="product-price"]').textContent()
        const price = parseFloat(priceText.replace(/[^0-9.]/g, ''))
        expect(price).toBeGreaterThanOrEqual(0)
        expect(price).toBeLessThanOrEqual(30)
      }
    })

    test('should filter by price range: 100+', async ({ page }) => {
      const priceFilter = page.locator('[data-testid="filter-price-100+"]')
      await priceFilter.click()

      await page.waitForTimeout(300)

      const visibleProducts = page.locator('[data-testid^="product-card-"]:visible')
      const count = await visibleProducts.count()

      expect(count).toBe(1) // Solo Centro de Mesa Especial

      const productCard = visibleProducts.first()
      const priceText = await productCard.locator('[data-testid="product-price"]').textContent()
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ''))
      expect(price).toBeGreaterThanOrEqual(100)
    })

    test('should sort by price: low to high', async ({ page }) => {
      const sortSelect = page.locator('[data-testid="sort-select"]')
      await sortSelect.selectOption({ label: 'Precio: Menor → Mayor' })

      await page.waitForTimeout(500)

      const visibleProducts = page.locator('[data-testid^="product-card-"]:visible')
      const count = await visibleProducts.count()

      expect(count).toBe(PRODUCT_FIXTURES.length) // Todos los productos

      // Verificar orden de precios
      const prices = []
      for (let i = 0; i < count; i++) {
        const productCard = visibleProducts.nth(i)
        const priceText = await productCard.locator('[data-testid="product-price"]').textContent()
        prices.push(parseFloat(priceText.replace(/[^0-9.]/g, '')))
      }

      // Verificar que están ordenados ascendente
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1])
      }
    })

    test('should sort by price: high to low', async ({ page }) => {
      const sortSelect = page.locator('[data-testid="sort-select"]')
      await sortSelect.selectOption({ label: 'Precio: Mayor → Menor' })

      await page.waitForTimeout(500)

      const visibleProducts = page.locator('[data-testid^="product-card-"]:visible')
      const count = await visibleProducts.count()

      // Verificar orden de precios (descendente)
      const prices = []
      for (let i = 0; i < count; i++) {
        const productCard = visibleProducts.nth(i)
        const priceText = await productCard.locator('[data-testid="product-price"]').textContent()
        prices.push(parseFloat(priceText.replace(/[^0-9.]/g, '')))
      }

      // Verificar que están ordenados descendente
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeLessThanOrEqual(prices[i - 1])
      }
    })
  })

  // Tests de combinaciones complejas
  test.describe('Complex Filter Combinations', () => {
    test('should filter: category flores + price 0-30', async ({ page }) => {
      const categoryFilter = page.locator('[data-testid="filter-category-flores"]')
      const priceFilter = page.locator('[data-testid="filter-price-0-30"]')

      await categoryFilter.click()
      await priceFilter.click()

      await page.waitForTimeout(300)

      const visibleProducts = page.locator('[data-testid^="product-card-"]:visible')
      const count = await visibleProducts.count()

      expect(count).toBe(2) // Rosas y girasoles (ambos son flores y están en 0-30)

      for (let i = 0; i < count; i++) {
        const productCard = visibleProducts.nth(i)

        // Verificar categoría
        await expect(productCard.locator('[data-testid="product-category"]')).toContainText(
          'flores'
        )

        // Verificar precio
        const priceText = await productCard.locator('[data-testid="product-price"]').textContent()
        const price = parseFloat(priceText.replace(/[^0-9.]/g, ''))
        expect(price).toBeGreaterThanOrEqual(0)
        expect(price).toBeLessThanOrEqual(30)
      }
    })

    test('should filter: category arreglos + occasion boda', async ({ page }) => {
      const categoryFilter = page.locator('[data-testid="filter-category-arreglos"]')
      const occasionFilter = page.locator('[data-testid="filter-occasion-boda"]')

      await categoryFilter.click()
      await occasionFilter.click()

      await page.waitForTimeout(300)

      const visibleProducts = page.locator('[data-testid^="product-card-"]:visible')
      const count = await visibleProducts.count()

      expect(count).toBe(2) // Arreglo premium y centro de mesa (ambos son arreglos y para boda)

      for (let i = 0; i < count; i++) {
        const productCard = visibleProducts.nth(i)

        // Verificar categoría
        await expect(productCard.locator('[data-testid="product-category"]')).toContainText(
          'arreglos'
        )

        // Verificar ocasión
        const occasions = await productCard
          .locator('[data-testid="product-occasions"]')
          .textContent()
        expect(occasions.toLowerCase()).toContain('boda')
      }
    })

    test('should filter: category plantas + price 30-60', async ({ page }) => {
      const categoryFilter = page.locator('[data-testid="filter-category-plantas"]')
      const priceFilter = page.locator('[data-testid="filter-price-30-60"]')

      await categoryFilter.click()
      await priceFilter.click()

      await page.waitForTimeout(300)

      const visibleProducts = page.locator('[data-testid^="product-card-"]:visible')
      const count = await visibleProducts.count()

      expect(count).toBe(2) // Orquídea ($45) y Suculenta ($35)

      for (let i = 0; i < count; i++) {
        const productCard = visibleProducts.nth(i)

        await expect(productCard.locator('[data-testid="product-category"]')).toContainText(
          'plantas'
        )

        const priceText = await productCard.locator('[data-testid="product-price"]').textContent()
        const price = parseFloat(priceText.replace(/[^0-9.]/g, ''))
        expect(price).toBeGreaterThanOrEqual(30)
        expect(price).toBeLessThanOrEqual(60)
      }
    })

    test('should filter: occasion amor + price 0-30', async ({ page }) => {
      const occasionFilter = page.locator('[data-testid="filter-occasion-amor"]')
      const priceFilter = page.locator('[data-testid="filter-price-0-30"]')

      await occasionFilter.click()
      await priceFilter.click()

      await page.waitForTimeout(300)

      const visibleProducts = page.locator('[data-testid^="product-card-"]:visible')
      const count = await visibleProducts.count()

      expect(count).toBe(1) // Solo Ramo de Rosas Rojas (amor y $25.99)

      const productCard = visibleProducts.first()
      await expect(productCard.locator('[data-testid="product-category"]')).toContainText('flores')

      const occasions = await productCard.locator('[data-testid="product-occasions"]').textContent()
      expect(occasions.toLowerCase()).toContain('amor')

      const priceText = await productCard.locator('[data-testid="product-price"]').textContent()
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ''))
      expect(price).toBeGreaterThanOrEqual(0)
      expect(price).toBeLessThanOrEqual(30)
    })

    test('should return no results for impossible combination', async ({ page }) => {
      const categoryFilter = page.locator('[data-testid="filter-category-arreglos"]')
      const priceFilter = page.locator('[data-testid="filter-price-0-30"]')

      await categoryFilter.click()
      await priceFilter.click()

      await page.waitForTimeout(300)

      // Arreglos + precio 0-30 = no hay resultados (arreglos cuestan 89+)
      const visibleProducts = page.locator('[data-testid^="product-card-"]:visible')
      expect(await visibleProducts.count()).toBe(0)

      // Verificar mensaje de "no results"
      await expect(page.locator('[data-testid="no-results-message"]')).toBeVisible()
      await expect(page.locator('[data-testid="no-results-message"]')).toContainText(
        'No se encontraron productos'
      )
    })

    test('should handle combination: category flores + sort price_desc', async ({ page }) => {
      const categoryFilter = page.locator('[data-testid="filter-category-flores"]')
      const sortSelect = page.locator('[data-testid="sort-select"]')

      await categoryFilter.click()
      await sortSelect.selectOption({ label: 'Precio: Mayor → Menor' })

      await page.waitForTimeout(500)

      const visibleProducts = page.locator('[data-testid^="product-card-"]:visible')
      const count = await visibleProducts.count()

      expect(count).toBe(2) // Solo flores

      // Verificar que están ordenados por precio descendente
      const prices = []
      for (let i = 0; i < count; i++) {
        const productCard = visibleProducts.nth(i)
        const priceText = await productCard.locator('[data-testid="product-price"]').textContent()
        prices.push(parseFloat(priceText.replace(/[^0-9.]/g, '')))
      }

      expect(prices[0]).toBe(25.99) // Rosas
      expect(prices[1]).toBe(22.5) // Girasoles (debe ser segunda)
    })

    test('should handle complex: category arreglos + price 60-100 + sort price_asc', async ({
      page
    }) => {
      const categoryFilter = page.locator('[data-testid="filter-category-arreglos"]')
      const priceFilter = page.locator('[data-testid="filter-price-60-100"]')
      const sortSelect = page.locator('[data-testid="sort-select"]')

      await categoryFilter.click()
      await priceFilter.click()
      await sortSelect.selectOption({ label: 'Precio: Menor → Mayor' })

      await page.waitForTimeout(500)

      const visibleProducts = page.locator('[data-testid^="product-card-"]:visible')
      const count = await visibleProducts.count()

      expect(count).toBe(1) // Solo Arreglo Floral Premium ($89.99)

      const productCard = visibleProducts.first()
      await expect(productCard.locator('[data-testid="product-category"]')).toContainText(
        'arreglos'
      )

      const priceText = await productCard.locator('[data-testid="product-price"]').textContent()
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ''))
      expect(price).toBeGreaterThanOrEqual(60)
      expect(price).toBeLessThanOrEqual(100)
    })
  })

  // Tests de interacción con filtros
  test.describe('Filter Interaction and State', () => {
    test('should toggle filters on/off correctly', async ({ page }) => {
      const categoryFilter = page.locator('[data-testid="filter-category-flores"]')
      const priceFilter = page.locator('[data-testid="filter-price-0-30"]')

      // Activar filtros
      await categoryFilter.click()
      await priceFilter.click()
      await page.waitForTimeout(300)

      let visibleProducts = page.locator('[data-testid^="product-card-"]:visible')
      let count = await visibleProducts.count()
      expect(count).toBe(2) // Flores en rango 0-30

      // Desactivar filtro de categoría
      await categoryFilter.click()
      await page.waitForTimeout(300)

      visibleProducts = page.locator('[data-testid^="product-card-"]:visible')
      count = await visibleProducts.count()
      expect(count).toBe(2) // Todos los productos en rango 0-30 (sin filtro de categoría)

      // Desactivar filtro de precio también
      await priceFilter.click()
      await page.waitForTimeout(300)

      visibleProducts = page.locator('[data-testid^="product-card-"]:visible')
      count = await visibleProducts.count()
      expect(count).toBe(PRODUCT_FIXTURES.length) // Todos los productos
    })

    test('should reset all filters with reset button', async ({ page }) => {
      // Aplicar múltiples filtros
      const categoryFilter = page.locator('[data-testid="filter-category-plantas"]')
      const priceFilter = page.locator('[data-testid="filter-price-30-60"]')
      const sortSelect = page.locator('[data-testid="sort-select"]')

      await categoryFilter.click()
      await priceFilter.click()
      await sortSelect.selectOption({ label: 'Precio: Mayor → Menor' })

      await page.waitForTimeout(500)

      // Verificar que hay resultados filtrados
      let visibleProducts = page.locator('[data-testid^="product-card-"]:visible')
      let count = await visibleProducts.count()
      expect(count).toBeLessThan(PRODUCT_FIXTURES.length)

      // Resetear filtros
      const resetButton = page.locator('[data-testid="reset-filters-button"]')
      await resetButton.click()

      await page.waitForTimeout(300)

      // Verificar que se muestran todos los productos y orden es default
      visibleProducts = page.locator('[data-testid^="product-card-"]:visible')
      count = await visibleProducts.count()
      expect(count).toBe(PRODUCT_FIXTURES.length)

      // Verificar orden default (más recientes)
      const selectedOption = await sortSelect.inputValue()
      expect(selectedOption).toBe('created_desc')
    })

    test('should maintain filter state during navigation', async ({ page }) => {
      // Aplicar filtros
      const categoryFilter = page.locator('[data-testid="filter-category-flores"]')
      await categoryFilter.click()
      await page.waitForTimeout(300)

      // Navegar a otra página
      await page.goto('/pages/contacto.html')
      await page.waitForLoad()

      // Volver a productos
      await page.goto('/#productos')
      await page.waitForLoad()

      // Verificar que los filtros se mantienen
      const visibleProducts = page.locator('[data-testid^="product-card-"]:visible')
      const count = await visibleProducts.count()
      expect(count).toBe(2) // Flores filtradas

      // Verificar que el botón de categoría está activo
      await expect(categoryFilter).toHaveClass(/active/)
    })

    test('should show active filter indicators', async ({ page }) => {
      const categoryFilter = page.locator('[data-testid="filter-category-arreglos"]')
      const priceFilter = page.locator('[data-testid="filter-price-100+"]')

      await categoryFilter.click()
      await priceFilter.click()
      await page.waitForTimeout(300)

      // Verificar indicadores visuales de filtros activos
      await expect(categoryFilter).toHaveClass(/active|selected/)
      await expect(priceFilter).toHaveClass(/active|selected/)

      // Verificar que se muestra sección de filtros activos si existe
      const activeFiltersSection = page.locator('[data-testid="active-filters"]')
      if (await activeFiltersSection.isVisible()) {
        await expect(activeFiltersSection).toContainText('arreglos')
        await expect(activeFiltersSection).toContainText('$100+')
      }
    })
  })

  // Tests de búsqueda combinada con filtros
  test.describe('Search with Filters Combinations', () => {
    test('should search and filter simultaneously', async ({ page }) => {
      const searchInput = page.locator('[data-testid="search-input"]')
      const categoryFilter = page.locator('[data-testid="filter-category-plantas"]')

      // Buscar "orquídea"
      await searchInput.fill('orquídea')
      await categoryFilter.click()

      await page.waitForTimeout(500)

      const visibleProducts = page.locator('[data-testid^="product-card-"]:visible')
      const count = await visibleProducts.count()

      expect(count).toBe(1) // Solo Orquídea Bella

      const productCard = visibleProducts.first()
      await expect(productCard.locator('[data-testid="product-name"]')).toContainText('orquídea', {
        ignoreCase: true
      })
      await expect(productCard.locator('[data-testid="product-category"]')).toContainText('plantas')
    })

    test('should handle search with no results + filters', async ({ page }) => {
      const searchInput = page.locator('[data-testid="search-input"]')
      const priceFilter = page.locator('[data-testid="filter-price-0-30"]')

      await searchInput.fill('producto inexistente')
      await priceFilter.click()

      await page.waitForTimeout(500)

      const visibleProducts = page.locator('[data-testid^="product-card-"]:visible')
      expect(await visibleProducts.count()).toBe(0)

      // Verificar mensaje de no results
      await expect(page.locator('[data-testid="no-results-message"]')).toBeVisible()
      await expect(page.locator('[data-testid="no-results-message"]')).toContainText(
        'No se encontraron productos'
      )

      // Verificar que se muestra sugerencia de búsqueda
      const searchSuggestion = page.locator('[data-testid="search-suggestion"]')
      if (await searchSuggestion.isVisible()) {
        await expect(searchSuggestion).toContainText('producto inexistente')
      }
    })

    test('should clear search and maintain filters', async ({ page }) => {
      const searchInput = page.locator('[data-testid="search-input"]')
      const categoryFilter = page.locator('[data-testid="filter-category-arreglos"]')

      // Aplicar búsqueda y filtro
      await searchInput.fill('arreglo')
      await categoryFilter.click()
      await page.waitForTimeout(500)

      let visibleProducts = page.locator('[data-testid^="product-card-"]:visible')
      expect(await visibleProducts.count()).toBe(2) // 2 arreglos

      // Limpiar búsqueda pero mantener filtro
      await searchInput.clear()
      await page.waitForTimeout(300)

      // Deberían mostrarse todos los arreglos
      visibleProducts = page.locator('[data-testid^="product-card-"]:visible')
      const count = await visibleProducts.count()
      expect(count).toBe(2) // Solo arreglos

      for (let i = 0; i < count; i++) {
        const productCard = visibleProducts.nth(i)
        await expect(productCard.locator('[data-testid="product-category"]')).toContainText(
          'arreglos'
        )
      }
    })
  })

  // Tests de performance con filtros
  test.describe('Filter Performance', () => {
    test('should apply filters quickly', async ({ page }) => {
      const startTime = Date.now()

      // Aplicar filtros rápidos
      const categoryFilter = page.locator('[data-testid="filter-category-flores"]')
      const priceFilter = page.locator('[data-testid="filter-price-0-60"]')
      const sortSelect = page.locator('[data-testid="sort-select"]')

      await categoryFilter.click()
      await priceFilter.click()
      await sortSelect.selectOption({ label: 'Precio: Menor → Mayor' })

      await page.waitForTimeout(500)

      const endTime = Date.now()
      const filterTime = endTime - startTime

      // Filtrado debe ser rápido (< 2 segundos)
      expect(filterTime).toBeLessThan(2000)

      // Verificar resultados
      const visibleProducts = page.locator('[data-testid^="product-card-"]:visible')
      expect(await visibleProducts.count()).toBe(2)
    })

    test('should handle rapid filter changes without errors', async ({ page }) => {
      // Cambiar filtros rápidamente (como un usuario real)
      const filters = [
        '[data-testid="filter-category-flores"]',
        '[data-testid="filter-category-plantas"]',
        '[data-testid="filter-category-arreglos"]'
      ]

      for (const filterSelector of filters) {
        await page.locator(filterSelector).click()
        await page.waitForTimeout(100) // Cambio rápido
      }

      // Cambiar ordenamiento también rápidamente
      const sortSelect = page.locator('[data-testid="sort-select"]')
      await sortSelect.selectOption({ label: 'Precio: Mayor → Menor' })
      await page.waitForTimeout(100)
      await sortSelect.selectOption({ label: 'Más recientes' })

      // No debe haber errores
      const errorMessages = page.locator('[data-testid^="error-"]')
      expect(await errorMessages.count()).toBe(0)

      // Verificar que página sigue funcional
      const visibleProducts = page.locator('[data-testid^="product-card-"]')
      expect(await visibleProducts.count()).toBeGreaterThan(0)
    })
  })
})
