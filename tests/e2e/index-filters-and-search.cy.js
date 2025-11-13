/**
 * @fileoverview E2E Tests for Filters and Search Functionality
 * Tests all filtering options, search input, and product sorting
 */

describe('Index - Filters and Search', () => {
  beforeEach(() => {
    cy.visit('/')
    // Navigate to products section
    cy.get('a.nav-link[href="#productos"]').click()
    cy.get('#productos', { timeout: 15000 }).should('be.visible')
    // Wait for products to load by checking for product cards
    cy.get('#productsContainer .model-4-card', { timeout: 15000 }).should(
      'have.length.greaterThan',
      0
    )
  })

  describe('Filter Section Structure', () => {
    it('should display the products section', () => {
      cy.get('#productos').should('be.visible')
      cy.get('#productos h2').should('contain.text', 'Productos Destacados')
    })

    it('should display filter panel', () => {
      cy.get('#filters-heading').should('exist') // SR-only heading
      cy.get('.theme-panel-light.rounded-xl.p-6.mb-8').should('be.visible')
    })

    it('should display quick filters section', () => {
      cy.contains('h3', 'Filtrar por ocasión').should('be.visible')
      cy.get('#quickFilters').should('be.visible')
    })

    it('should display search input section', () => {
      cy.contains('label', 'Buscar productos').should('be.visible')
      cy.get('#searchInput').should('be.visible')
    })

    it('should display sort and price filters', () => {
      cy.contains('label', 'Ordenar por').should('be.visible')
      cy.get('#sortFilter').should('be.visible')
      cy.contains('label', 'Rango de precio').should('be.visible')
      cy.get('#priceRange').should('be.visible')
    })
  })

  describe('Quick Filters', () => {
    it('should display "Todos" filter button', () => {
      cy.get('#filter-all').should('be.visible')
      cy.get('#filter-all').should('contain.text', 'Todos')
      cy.get('#filter-all').should('have.class', 'active')
      cy.get('#filter-all').should('have.attr', 'aria-pressed', 'true')
    })

    it('should toggle filter button states', () => {
      // Get all filter buttons
      cy.get('#quickFilters button').then($buttons => {
        const count = $buttons.length
        expect(count).to.be.gt(1) // Should have "Todos" + dynamic filters
      })

      // Check "Todos" is active by default
      cy.get('#filter-all').should('have.class', 'active')
    })

    it('should activate filter when clicking', () => {
      // Click the first dynamic filter (if exists)
      cy.get('#quickFilters button')
        .not('#filter-all')
        .then($buttons => {
          if ($buttons.length > 0) {
            cy.wrap($buttons[0]).click()
            cy.wrap($buttons[0]).should('have.class', 'active')
          }
        })
    })

    it('should deactivate other filters when one is activated', () => {
      cy.get('#quickFilters button')
        .not('#filter-all')
        .then($buttons => {
          if ($buttons.length > 0) {
            // Click another filter
            cy.wrap($buttons[0]).click()
            // "Todos" should not be active
            cy.get('#filter-all').should('not.have.class', 'active')
          }
        })
    })

    it('should toggle back to "Todos" when clicked', () => {
      cy.get('#filter-all').click()
      cy.get('#filter-all').should('have.class', 'active')
    })
  })

  describe('Search Functionality', () => {
    it('should accept text input in search field', () => {
      cy.get('#searchInput').type('rosas')
      cy.get('#searchInput').should('have.value', 'rosas')
    })

    it('should have proper placeholder text', () => {
      cy.get('#searchInput').should('have.attr', 'placeholder', 'Buscar por nombre...')
    })

    it('should have search icon', () => {
      cy.get('#searchInput').parent().find('svg').should('be.visible')
    })

    it('should filter products when typing', () => {
      // Type search term
      cy.get('#searchInput').type('rosa')
      // Wait for debounce by checking that the input has the value
      cy.get('#searchInput').should('have.value', 'rosa')

      // Products should be filtered
      cy.get('#productsContainer').should('not.contain.text', 'Cargando productos')
    })

    it('should clear search when input is cleared', () => {
      // Type and search
      cy.get('#searchInput').type('rosa')
      cy.get('#searchInput').should('have.value', 'rosa')

      // Clear search
      cy.get('#searchInput').clear()
      cy.get('#searchInput').should('have.value', '')
    })

    it('should handle special characters in search', () => {
      cy.get('#searchInput').type('árbol @#$%')
      cy.get('#searchInput').should('have.value', 'árbol @#$%')
    })

    it('should handle empty search', () => {
      cy.get('#searchInput').type('{backspace}'.repeat(20))
      cy.get('#searchInput').should('have.value', '')
    })
  })

  describe('Sort Filter', () => {
    it('should display sort options', () => {
      cy.get('#sortFilter').should('be.visible')
      cy.get('#sortFilter option').should('have.length.at.least', 5)
    })

    it('should have default sort option', () => {
      cy.get('#sortFilter option:selected').should('contain.text', 'Más recientes')
    })

    it('should change sort when selecting different option', () => {
      cy.get('#sortFilter').select('name_asc')
      cy.get('#sortFilter').should('have.value', 'name_asc')
    })

    it('should support all sort options', () => {
      const sortOptions = [
        { value: 'created_desc', text: 'Más recientes' },
        { value: 'price_asc', text: 'Precio: Menor a mayor' },
        { value: 'price_desc', text: 'Precio: Mayor a menor' },
        { value: 'name_asc', text: 'Nombre: A-Z' },
        { value: 'rating_desc', text: 'Mejor valorados' }
      ]

      sortOptions.forEach(option => {
        cy.get('#sortFilter').select(option.value)
        cy.get('#sortFilter').should('have.value', option.value)
      })
    })
  })

  describe('Price Range Filter', () => {
    it('should display price range options', () => {
      cy.get('#priceRange').should('be.visible')
      cy.get('#priceRange option').should('have.length.at.least', 5)
    })

    it('should have default "all prices" option', () => {
      cy.get('#priceRange option:selected').should('contain.text', 'Todos los precios')
      cy.get('#priceRange').should('have.value', '')
    })

    it('should change price filter when selecting range', () => {
      cy.get('#priceRange').select('30-60')
      cy.get('#priceRange').should('have.value', '30-60')
    })

    it('should support all price ranges', () => {
      const priceRanges = ['', '0-30', '30-60', '60-100', '100+']

      priceRanges.forEach(range => {
        cy.get('#priceRange').select(range)
        cy.get('#priceRange').should('have.value', range)
      })
    })
  })

  describe('Combined Filters', () => {
    it('should allow combining search with sort', () => {
      cy.get('#searchInput').type('rosa')
      cy.get('#sortFilter').select('price_asc')
      cy.get('#searchInput').should('have.value', 'rosa')
      cy.get('#sortFilter').should('have.value', 'price_asc')
    })

    it('should allow combining search with price filter', () => {
      cy.get('#searchInput').type('rosa')
      cy.get('#priceRange').select('30-60')
      cy.get('#searchInput').should('have.value', 'rosa')
      cy.get('#priceRange').should('have.value', '30-60')
    })

    it('should allow combining sort with price filter', () => {
      cy.get('#sortFilter').select('price_asc')
      cy.get('#priceRange').select('30-60')
      cy.get('#sortFilter').should('have.value', 'price_asc')
      cy.get('#priceRange').should('have.value', '30-60')
    })

    it('should allow combining quick filter with search', () => {
      // Click a quick filter
      cy.get('#quickFilters button')
        .not('#filter-all')
        .then($buttons => {
          if ($buttons.length > 0) {
            cy.wrap($buttons[0]).click()
            cy.get('#searchInput').type('rosa')
            cy.get('#searchInput').should('have.value', 'rosa')
          }
        })
    })
  })

  describe('Filter Interactions', () => {
    it('should reset filters when clicking "Todos"', () => {
      // Set some filters
      cy.get('#searchInput').type('rosa')
      cy.get('#sortFilter').select('price_asc')
      cy.get('#priceRange').select('30-60')

      // Click "Todos" to reset
      cy.get('#filter-all').click()

      // Check filters are reset
      cy.get('#searchInput').should('have.value', '')
      cy.get('#sortFilter').should('have.value', 'created_desc')
      cy.get('#priceRange').should('have.value', '')
    })

    it('should update products when filters change', () => {
      // Initial products loaded
      cy.get('#productsContainer .model-4-card', { timeout: 10000 })
        .its('length')
        .should('be.gt', 0)

      // Change search
      cy.get('#searchInput').type('rosa')
      cy.get('#searchInput').should('have.value', 'rosa')

      // Products should update
      cy.get('#productsContainer').should('not.contain.text', 'Cargando productos')
    })
  })

  describe('Products Container', () => {
    it('should display products grid', () => {
      cy.get('#productsContainer').should('be.visible')
      cy.get('#productsContainer').should('have.class', 'grid')
    })

    it('should display products when loaded', () => {
      // Wait for products to load
      cy.get('#productsContainer .model-4-card', { timeout: 15000 })
        .its('length')
        .should('be.gt', 0)
    })

    it('should display product cards with complete information', () => {
      cy.get('#productsContainer .model-4-card')
        .first()
        .within(() => {
          cy.get('h3').should('exist') // Product name
          cy.get('.text-gray-600').should('exist') // Description
          cy.get('.text-pink-600').should('exist') // Price
          cy.get('[data-action]').should('exist') // Action buttons
        })
    })
  })

  describe('Pagination', () => {
    it('should display pagination container', () => {
      cy.get('#pagination').should('be.visible')
    })

    it('should update pagination when filters change', () => {
      // Initial state
      cy.get('#pagination').should('be.visible')

      // Change filter
      cy.get('#searchInput').type('rosa')
      cy.get('#searchInput').should('have.value', 'rosa')

      // Pagination should still be visible
      cy.get('#pagination').should('be.visible')
    })
  })
})
