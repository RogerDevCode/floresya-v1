/**
 * Orders Page Loads - Cypress E2E Test
 * Verifica que la página de gestión de pedidos carga sin errores
 *
 * Cobertura:
 * - Sin errores JavaScript
 * - Sin warnings críticos
 * - Todos los elementos principales visibles
 * - Filtros presentes
 * - Tabla y paginación visibles
 * - Íconos Lucide renderizados
 * - Modales ocultos al cargar
 * - Valores por defecto correctos
 */

describe('Orders Page - Page Loads', () => {
  const BASE_URL = Cypress.env('BASE_URL') || 'http://localhost:3000'
  const ORDERS_URL = `${BASE_URL}/pages/admin/orders.html`

  // Mock data for consistent testing
  const mockOrders = [
    {
      id: 1,
      customer_name: 'Test Customer 1',
      customer_email: 'test1@example.com',
      customer_phone: '+58 412-1234567',
      delivery_address: 'Test Address 1',
      delivery_date: '2024-12-25',
      delivery_time_slot: '14:00-17:00',
      order_items: [
        {
          product_name: 'Test Product 1',
          quantity: 2,
          unit_price_usd: 25.99,
          subtotal_usd: 51.98
        }
      ],
      total_amount_usd: 51.98,
      total_amount_ves: 1824.3,
      status: 'pending',
      created_at: '2024-11-01T10:00:00Z',
      notes: '',
      delivery_notes: ''
    },
    {
      id: 2,
      customer_name: 'Test Customer 2',
      customer_email: 'test2@example.com',
      customer_phone: '+58 412-7654321',
      delivery_address: 'Test Address 2',
      delivery_date: '2024-12-26',
      delivery_time_slot: '10:00-13:00',
      order_items: [
        {
          product_name: 'Test Product 2',
          quantity: 1,
          unit_price_usd: 15.5,
          subtotal_usd: 15.5
        }
      ],
      total_amount_usd: 15.5,
      total_amount_ves: 543.25,
      status: 'delivered',
      created_at: '2024-11-02T14:30:00Z',
      notes: '',
      delivery_notes: ''
    }
  ]

  beforeEach(() => {
    // Intercept API calls to mock Supabase responses
    cy.intercept('GET', '/api/orders*', { success: true, data: mockOrders }).as('getOrders')

    // Intercept any other potential API calls that might cause issues
    cy.intercept('GET', '/api/settings*', { success: true, data: {} }).as('getSettings')

    // Listen for uncaught exceptions to fail tests on JavaScript errors
    cy.on('uncaught:exception', err => {
      expect(err.message).to.not.contain('Script error') // Ignore cross-origin script errors
      throw err
    })

    cy.visit(ORDERS_URL)
    cy.wait('@getOrders') // Wait for orders API to complete
  })

  it('should load page without JavaScript errors', () => {
    // JavaScript errors are caught by the uncaught:exception handler in beforeEach
    // If no errors occurred, the test passes
    cy.get('body').should('be.visible') // Basic check that page loaded
  })

  it('should display main page elements', () => {
    // Header principal
    cy.get('h1').should('contain', 'Gestión de Pedidos')

    // Estadísticas
    cy.get('[data-testid="stats-container"], .stats-container, .statistics').should('be.visible')

    // Filtros
    cy.get('[data-testid="filters"], .filters, .filter-section').should('be.visible')

    // Tabla de pedidos
    cy.get('[data-testid="orders-table"], table, .orders-table').should('be.visible')

    // Paginación
    cy.get('[data-testid="pagination"], .pagination, .page-controls').should('be.visible')
  })

  it('should display filter controls', () => {
    // Filtro por status
    cy.get('[data-testid="status-filter"], select[name="status"], #status-filter').should(
      'be.visible'
    )

    // Filtro por año
    cy.get('[data-testid="year-filter"], select[name="year"], #year-filter').should('be.visible')

    // Filtro por rango de fechas
    cy.get(
      '[data-testid="date-range-filter"], select[name="dateRange"], #date-range-filter'
    ).should('be.visible')

    // Filtro por búsqueda
    cy.get('[data-testid="search-input"], input[name="search"], #search-input').should('be.visible')

    // Botón limpiar filtros
    cy.get('[data-testid="clear-filters-btn"], button')
      .contains('Limpiar Filtros')
      .should('be.visible')
  })

  it('should display table with proper headers', () => {
    const expectedHeaders = [
      'Cliente',
      'Productos',
      'Total',
      'Fecha',
      'Estado',
      'Acciones',
      'Historial'
    ]

    cy.get('[data-testid="orders-table"] thead th, table thead th, .table-header').each(
      ($header, index) => {
        if (expectedHeaders[index]) {
          cy.wrap($header).should('contain', expectedHeaders[index])
        }
      }
    )
  })

  it('should display pagination controls', () => {
    // Información de paginación
    cy.get('[data-testid="pagination-info"], .pagination-info, .showing-info').should('be.visible')

    // Controles de navegación
    cy.get('[data-testid="pagination-controls"], .pagination-controls, .page-navigation').should(
      'be.visible'
    )

    // Botones First/Previous (deshabilitados en página 1)
    cy.get('[data-testid="first-page-btn"], button').contains('First').should('be.disabled')
    cy.get('[data-testid="prev-page-btn"], button').contains('Previous').should('be.disabled')
  })

  it('should render Lucide icons', () => {
    // Verificar que los íconos se renderizan (al menos algunos comunes)
    cy.get('[data-testid="lucide-icon"], svg, .lucide-icon').should('have.length.greaterThan', 0)
  })

  it('should hide modals on initial load', () => {
    // Modal de detalle
    cy.get('[data-testid="order-detail-modal"], .modal, #order-detail-modal').should(
      'not.be.visible'
    )

    // Modal de historial
    cy.get('[data-testid="order-history-modal"], .modal, #order-history-modal').should(
      'not.be.visible'
    )
  })

  it('should have correct default values', () => {
    // Filtro de status por defecto
    cy.get('[data-testid="status-filter"], select[name="status"], #status-filter').should(
      'have.value',
      'all'
    )

    // Filtro de año por defecto (año actual)
    const currentYear = new Date().getFullYear().toString()
    cy.get('[data-testid="year-filter"], select[name="year"], #year-filter').should(
      'have.value',
      currentYear
    )

    // Items por página por defecto
    cy.get('[data-testid="items-per-page"], select[name="itemsPerPage"], #items-per-page').should(
      'have.value',
      '50'
    )
  })

  it('should display statistics cards', () => {
    // 4 tarjetas de estadísticas
    cy.get('[data-testid="stat-card"], .stat-card, .statistic-card').should('have.length', 4)

    // Cada tarjeta debe tener valor
    cy.get('[data-testid="stat-card"], .stat-card, .statistic-card').each($card => {
      cy.wrap($card).find('[data-testid="stat-value"], .stat-value, .value').should('not.be.empty')
    })
  })

  it('should load orders data', () => {
    // Verificar que se cargan pedidos
    cy.get('[data-testid="orders-table"] tbody tr, tbody tr, .order-row').should('have.length', 2) // Based on our mock data
  })

  it('should display order data correctly', () => {
    cy.get('[data-testid="orders-table"] tbody tr, tbody tr, .order-row')
      .first()
      .within(() => {
        // Cliente
        cy.get('td').eq(0).should('contain', 'Test Customer 1')

        // Productos (conteo)
        cy.get('td').eq(1).should('contain', '2 item')

        // Total (formato USD)
        cy.get('td').eq(2).should('contain', '$51.98')

        // Fecha
        cy.get('td').eq(3).should('not.be.empty')

        // Estado (badge)
        cy.get('td')
          .eq(4)
          .find('[data-testid="status-badge"], .badge, .status')
          .should('be.visible')

        // Acciones (botones)
        cy.get('td').eq(5).find('button').should('have.length.greaterThan', 0)

        // Historial (botón)
        cy.get('td').eq(6).find('button').should('be.visible')
      })
  })
})
