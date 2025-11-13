/**
 * @fileoverview Complete E2E Test Suite for Index Page
 * Comprehensive test covering all major functionality
 * Uses data-cy attributes for reliable element selection
 */

describe('Index - Complete Functionality Test', () => {
  beforeEach(() => {
    cy.visit('/', { timeout: 10000 })
  })

  afterEach(() => {
    // Clean up any test state
    cy.window().then(win => {
      // Clear localStorage if needed
      if (win.localStorage) {
        win.localStorage.clear()
      }
    })
  })

  it('should load homepage with all sections visible', () => {
    // Check all main sections using data-cy attributes
    cy.get('[data-cy="navbar"]').should('be.visible')
    cy.get('[data-cy="hero-section"]').should('be.visible')
    cy.get('[data-cy="featured-carousel"]').should('be.visible')
    cy.get('[data-cy="productos-section"]').should('be.visible')
    cy.get('[data-cy="testimonials-section"]').should('be.visible')
    cy.get('[data-cy="features-section"]').should('be.visible')
    cy.get('[data-cy="special-cta-section"]').should('be.visible')
    cy.get('[data-cy="footer"]').should('be.visible')
  })

  describe('Complete User Journey: Browse to Purchase', () => {
    it('should allow complete user flow from homepage to product interaction', () => {
      // 1. Start at homepage
      cy.get('[data-cy="hero-section"]').should('be.visible')
      cy.get('[data-cy="hero-title"]').should('contain.text', 'Flores frescas')

      // 2. Navigate to products via hero CTA
      cy.get('[data-cy="hero-cta-button"]').should('be.visible').click()
      cy.get('[data-cy="productos-section"]').should('be.visible')

      // 3. Wait for products to load
      cy.get('[data-cy="products-container"] [data-cy="product-card"]', { timeout: 10000 }).should(
        'have.length.greaterThan',
        0
      )

      // 4. Search for a product
      cy.get('[data-cy="search-input"]').clear().type('rosa')
      cy.wait(300) // Allow for debounced search

      // 5. Use sort filter
      cy.get('[data-cy="sort-filter"]').select('price_asc')
      cy.get('[data-cy="sort-filter"]').should('have.value', 'price_asc')

      // 6. Use price filter
      cy.get('[data-cy="price-range-filter"]').select('30-60')
      cy.get('[data-cy="price-range-filter"]').should('have.value', '30-60')

      // 7. Reset filters
      cy.get('[data-cy="filter-all"]').click()
      cy.get('[data-cy="search-input"]').should('have.value', '')

      // 8. Interact with carousel
      cy.get('[data-cy="featured-carousel"]', { timeout: 10000 }).should('be.visible')
      cy.get('[data-cy="carousel-next"]').click()
      cy.wait(500) // Allow for smooth transition
      cy.get('[data-cy="carousel-prev"]').click()
      cy.wait(500)

      // 9. Try to add product to cart
      cy.get('[data-cy="product-card"]')
        .first()
        .find('[data-cy="add-to-cart-btn"]')
        .should('be.visible')
        .click()
      cy.wait(300)

      // 10. Navigate to cart
      cy.get('[data-cy="nav-cart-link"]').click()
      cy.url().should('include', 'pages/cart.html')
    })
  })

  describe('Mobile Responsive Flow', () => {
    it('should work completely on mobile', () => {
      // Set mobile viewport
      cy.viewport('iphone-x')

      // 1. Check navbar
      cy.get('[data-cy="navbar"]').should('be.visible')
      cy.get('[data-cy="mobile-menu-toggle"]').should('be.visible')

      // 2. Open mobile menu
      cy.get('[data-cy="mobile-menu-toggle"]').click()
      cy.get('[data-cy="mobile-menu"]').should('not.have.class', 'hidden')
      cy.get('[data-cy="mobile-nav-links"]').should('be.visible')

      // 3. Navigate via mobile menu
      cy.get('[data-cy="mobile-nav-links"] [data-cy="nav-productos-link"]').click()
      cy.get('[data-cy="productos-section"]').should('be.visible')

      // 4. Use filters on mobile
      cy.get('[data-cy="search-input"]').clear().type('rosa')
      cy.get('[data-cy="search-input"]').should('have.value', 'rosa')

      // 5. Close mobile menu
      cy.get('[data-cy="mobile-menu-toggle"]').click()
      cy.get('[data-cy="mobile-menu"]').should('have.class', 'hidden')

      // 6. Interact with carousel on mobile
      cy.get('[data-cy="featured-carousel"]').should('be.visible')
      cy.get('[data-cy="carousel-next"]').click()
      cy.wait(500) // Allow for smooth transition
    })
  })

  describe('Filter and Search Integration', () => {
    it('should handle complex filter combinations', () => {
      // Navigate to products
      cy.get('[data-cy="nav-productos-link"]').click()
      cy.get('[data-cy="productos-section"]').should('be.visible')
      cy.get('[data-cy="products-container"] [data-cy="product-card"]', { timeout: 10000 }).should(
        'have.length.greaterThan',
        0
      )

      // Test 1: Search + Sort
      cy.get('[data-cy="search-input"]').clear().type('rosa')
      cy.get('[data-cy="sort-filter"]').select('name_asc')
      cy.wait(300) // Allow for debounced search
      cy.get('[data-cy="search-input"]').clear()

      // Test 2: Sort + Price
      cy.get('[data-cy="sort-filter"]').select('price_desc')
      cy.get('[data-cy="price-range-filter"]').select('60-100')
      cy.wait(300)

      // Test 3: Quick Filter + Search
      cy.get('[data-cy="filter-all"]').click()
      cy.get('[data-cy="quick-filters"] button')
        .not('[data-cy="filter-all"]')
        .then($buttons => {
          if ($buttons.length > 0) {
            cy.wrap($buttons[0]).click()
            cy.get('[data-cy="search-input"]').clear().type('flor')
            cy.wait(300)
          }
        })

      // Test 4: Reset all
      cy.get('[data-cy="filter-all"]').click()
      cy.get('[data-cy="search-input"]').should('have.value', '')
      cy.get('[data-cy="sort-filter"]').should('have.value', 'created_desc')
      cy.get('[data-cy="price-range-filter"]').should('have.value', '')
    })
  })

  describe('Carousel Complete Interaction', () => {
    it('should allow full carousel navigation', () => {
      // Wait for carousel
      cy.get('[data-cy="featured-carousel"]', { timeout: 10000 }).should('be.visible')
      cy.wait(1000) // Allow for initial load

      // Test next button multiple times
      cy.get('[data-cy="carousel-next"]').click()
      cy.wait(500)
      cy.get('[data-cy="carousel-next"]').click()
      cy.wait(500)
      cy.get('[data-cy="carousel-next"]').click()
      cy.wait(500)

      // Test previous button
      cy.get('[data-cy="carousel-prev"]').click()
      cy.wait(500)
      cy.get('[data-cy="carousel-prev"]').click()
      cy.wait(500)

      // Test indicator navigation (if available)
      cy.get('[data-cy="carousel-indicators"] [data-cy="carousel-indicator"]', {
        timeout: 5000
      }).then($indicators => {
        if ($indicators.length > 0) {
          cy.wrap($indicators.first()).click()
          cy.wait(500)
        }
      })

      // Verify progress bar updates
      cy.get('[data-cy="carousel-progress-bar"]').should('be.visible')
    })
  })

  describe('Navigation Flow', () => {
    it('should allow complete site navigation', () => {
      // Test all main nav links
      cy.get('[data-cy="nav-inicio-link"]').click()
      cy.get('[data-cy="hero-section"]').should('be.visible')

      cy.get('[data-cy="nav-productos-link"]').click()
      cy.get('[data-cy="productos-section"]').should('be.visible')

      // Test page navigation
      cy.get('[data-cy="nav-contacto-link"]').click()
      cy.url().should('include', 'pages/contacto.html')
      cy.go('back')

      cy.get('[data-cy="nav-admin-link"]').click()
      cy.url().should('include', 'pages/admin/dashboard.html')
      cy.go('back')

      // Test logo link
      cy.get('[data-cy="navbar-brand"]').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/')
    })
  })

  describe('Product Interaction', () => {
    it('should allow product card interactions', () => {
      // Navigate to products
      cy.get('[data-cy="nav-productos-link"]').click()
      cy.get('[data-cy="products-container"] [data-cy="product-card"]', { timeout: 10000 }).should(
        'have.length.greaterThan',
        0
      )
      cy.wait(500) // Allow for dynamic content

      // Test all action buttons
      cy.get('[data-cy="products-container"] [data-cy="product-card"]')
        .first()
        .within(() => {
          // Quick view
          cy.get('[data-cy="quick-view-btn"]').should('be.visible').click()
          cy.wait(300)

          // Add to cart
          cy.get('[data-cy="add-to-cart-btn"]').should('be.visible').click()
          cy.wait(300)

          // Buy now
          cy.get('[data-cy="buy-now-btn"]').should('be.visible').click()
          cy.wait(300)
        })

      // Verify cart was updated (if cart icon updates)
      cy.get('[data-cy="cart-badge"]').should('be.visible')
    })
  })

  describe('Content Sections', () => {
    it('should display all content sections with proper styling', () => {
      // Hero section
      cy.get('[data-cy="hero-section"]').should('be.visible')
      cy.get('[data-cy="hero-title"]').should('be.visible')
      cy.get('[data-cy="hero-cta"]').should('be.visible')
      cy.get('[data-cy="hero-features"]').should('be.visible')

      // Carousel section
      cy.get('[data-cy="featured-carousel"]').should('be.visible')

      // Products section
      cy.get('[data-cy="productos-section"]').should('be.visible')
      cy.get('[data-cy="quick-filters"]').should('be.visible')
      cy.get('[data-cy="search-input"]').should('be.visible')

      // Testimonials
      cy.get('[data-cy="testimonials-section"]').scrollIntoView().should('be.visible')
      cy.get('[data-cy="testimonial-card"]').should('have.length', 3)

      // Features
      cy.get('[data-cy="features-section"]').scrollIntoView().should('be.visible')
      cy.get('[data-cy="feature-card"]').should('have.length.at.least', 4)

      // Special CTA
      cy.get('[data-cy="special-cta-section"]').scrollIntoView().should('be.visible')
      cy.contains('h2', '¿Buscas algo especial?').should('be.visible')

      // Footer
      cy.get('[data-cy="footer"]').scrollIntoView().should('be.visible')
      cy.contains('[data-cy="footer"]', 'FloresYa').should('be.visible')
    })
  })

  describe('Accessibility and ARIA', () => {
    it('should have proper ARIA labels', () => {
      // Navbar
      cy.get('[data-cy="navbar"]').should('have.attr', 'aria-label', 'Navegación principal')

      // Mobile menu
      cy.get('[data-cy="mobile-menu-toggle"]').should('have.attr', 'aria-label')
      cy.get('[data-cy="mobile-menu-toggle"]').should('have.attr', 'aria-expanded')

      // Carousel
      cy.get('[data-cy="featured-carousel"]').should(
        'have.attr',
        'aria-roledescription',
        'carousel'
      )
      cy.get('[data-cy="carousel-slides"]').should('have.attr', 'aria-live', 'polite')

      // Forms
      cy.get('[data-cy="search-input"]').should('have.attr', 'aria-labelledby')
      cy.get('[data-cy="sort-filter"]').should('have.attr', 'aria-labelledby')
      cy.get('[data-cy="price-range-filter"]').should('have.attr', 'aria-labelledby')

      // Buttons
      cy.get('[data-cy="carousel-prev"]').should('have.attr', 'aria-label', 'Producto anterior')
      cy.get('[data-cy="carousel-next"]').should('have.attr', 'aria-label', 'Producto siguiente')
    })
  })

  describe('Theme and Styling', () => {
    it('should load with proper theme classes', () => {
      cy.get('html').should('have.attr', 'data-theme', 'light')
      cy.get('[data-cy="navbar"]').should('have.class', 'theme-nav-glass')
      cy.get('[data-cy="hero-section"]').should('have.class', 'theme-hero-gradient')
      cy.get('[data-cy="featured-carousel"]').should('have.class', 'theme-carousel-premium')
      cy.get('[data-cy="productos-section"]').should('have.class', 'theme-products-cards')
    })

    it('should have responsive design classes', () => {
      cy.get('[data-cy="featured-carousel"]').should('have.class', 'lg:py-16')
      cy.get('[data-cy="productos-section"]')
        .should('have.class', 'py-12')
        .and('have.class', 'lg:py-16')
      cy.get('.grid').should('exist')
    })
  })
})
