/* eslint-env mocha, cypress/globals */
/**
 * E2E Test Suite: Product Detail Page - Complete Component Loading
 * Purpose: Verify proper loading and functionality of product detail page
 * Following CLAUDE.md strict test validation rules
 *
 * Test Coverage:
 * 1. Page Structure & Loading States
 * 2. Navigation & Breadcrumb
 * 3. Product Information Display
 * 4. Image Gallery
 * 5. Quantity Controls
 * 6. Action Buttons
 * 7. Product Features
 * 8. Accessibility
 * 9. Error Handling
 */

describe('Product Detail Page - Complete Functionality', () => {
  const VALID_PRODUCT_ID = '1'
  const INVALID_PRODUCT_ID = '999999'

  beforeEach(() => {
    cy.visit(`/pages/product-detail.html?id=${VALID_PRODUCT_ID}`, {
      failOnStatusCode: false,
      onBeforeLoad(win) {
        cy.stub(win.console, 'error').as('consoleError')
        cy.stub(win.console, 'warn').as('consoleWarn')
      }
    })
  })

  /**
   * Phase 1: Page Structure and HTML Elements
   * Verify: DOCTYPE, meta tags, head elements
   */
  describe('Phase 1: Page Structure and Meta Tags', () => {
    it('should have valid HTML structure and DOCTYPE', () => {
      cy.request(`/pages/product-detail.html?id=${VALID_PRODUCT_ID}`).then(response => {
        expect(response.body).to.include('<!doctype html>')
        expect(response.body).to.include('lang="es"')
      })
    })

    it('should have required meta tags', () => {
      cy.get('head meta[charset="UTF-8"]').should('exist')

      cy.get('head meta[name="viewport"]')
        .should('exist')
        .and('have.attr', 'content', 'width=device-width, initial-scale=1.0')

      cy.get('head meta[name="description"]')
        .should('exist')
        .and('have.attr', 'content', 'Detalles del producto - FloresYa')
    })

    it('should have proper title tag', () => {
      cy.get('head title').should('exist').and('contain', 'FloresYa')
    })

    it('should load theme preload script first', () => {
      cy.get('head script').first().should('have.attr', 'src').and('include', 'themePreload')
    })

    it('should load all required stylesheets', () => {
      cy.get('head link[rel="stylesheet"][href="/css/styles.css"]').should('exist')
      cy.get('head link[rel="stylesheet"][href="/css/tailwind.css"]').should('exist')
      cy.get('head link[rel="stylesheet"][href="/css/themes-granular.css"]').should('exist')
    })

    it('should have favicon', () => {
      cy.get('head link[rel="icon"]')
        .should('exist')
        .and('have.attr', 'type', 'image/x-icon')
        .and('have.attr', 'href', '/images/favicon.ico')
    })
  })

  /**
   * Phase 2: Navigation and Breadcrumb
   * Verify: Navbar, breadcrumb trail, cart icon
   */
  describe('Phase 2: Navigation and Breadcrumb', () => {
    it('should render navigation with proper role', () => {
      cy.get('nav.navbar')
        .should('exist')
        .and('have.attr', 'role', 'navigation')
        .and('have.attr', 'aria-label', 'Navegación principal')
    })

    it('should display logo and brand', () => {
      cy.get('.navbar-brand')
        .should('exist')
        .and('have.attr', 'href', '/')

      cy.get('.navbar-brand img')
        .should('exist')
        .and('have.attr', 'src', '/images/logoFloresYa.jpeg')
        .and('have.attr', 'alt', 'Logo de FloresYa')

      cy.get('.navbar-brand .brand-text').should('exist').and('contain', 'FloresYa')
    })

    it('should have navigation links', () => {
      cy.get('.desktop-nav .nav-links').should('exist')

      cy.contains('.nav-link', 'Inicio').should('have.attr', 'href', '/')
      cy.contains('.nav-link', 'Productos').should('have.attr', 'href', '/#productos')
      cy.contains('.nav-link', 'Contacto').should('have.attr', 'href', '/#contacto')
    })

    it('should display cart icon with counter', () => {
      cy.get('#cart-icon')
        .should('exist')
        .and('have.attr', 'href', '/pages/cart.html')
        .and('have.attr', 'aria-label', 'Carrito de compras')

      cy.get('#cart-count').should('exist').and('contain', '0')
    })

    it('should render breadcrumb navigation', () => {
      cy.get('nav[aria-label="Breadcrumb"]').should('exist')

      cy.get('nav[aria-label="Breadcrumb"] ol').should('exist')

      // Check breadcrumb items
      cy.contains('nav[aria-label="Breadcrumb"]', 'Inicio').should('have.attr', 'href', '/')
      cy.contains('nav[aria-label="Breadcrumb"]', 'Productos').should('have.attr', 'href', '/#productos')
      cy.get('#breadcrumb-product').should('exist').and('contain', 'Producto')
    })
  })

  /**
   * Phase 3: Loading States
   * Verify: Loading spinner, error message, content visibility
   */
  describe('Phase 3: Loading States and Error Handling', () => {
    it('should have loading spinner element', () => {
      cy.get('#loading-spinner').should('exist')

      cy.get('#loading-spinner .animate-spin').should('exist')

      cy.get('#loading-spinner .loading-message').should('exist').and('contain', 'Cargando producto')
    })

    it('should have error message container', () => {
      cy.get('#error-message').should('exist').and('have.class', 'hidden')

      cy.get('#error-text').should('exist')

      cy.get('#error-message a[href="/"]').should('exist').and('contain', 'Volver al inicio')
    })

    it('should have product content container', () => {
      cy.get('#product-content').should('exist')
    })

    it('should hide loading spinner after product loads', () => {
      cy.get('#loading-spinner', { timeout: 10000 }).should('not.be.visible')
    })

    it('should display product content after load', () => {
      cy.get('#product-content', { timeout: 10000 }).should('be.visible')
    })
  })

  /**
   * Phase 4: Product Information Display
   * Verify: Title, price, stock, description
   */
  describe('Phase 4: Product Information Display', () => {
    it('should display product title', () => {
      cy.get('#product-title', { timeout: 10000 })
        .should('be.visible')
        .and('not.contain', 'Producto') // Should be replaced with actual title
    })

    it('should display product price in USD', () => {
      cy.get('#product-price', { timeout: 10000 })
        .should('be.visible')
        .and('not.contain', '$0.00') // Should be replaced with actual price
        .invoke('text')
        .should('match', /^\$\d+\.\d{2}$/)
    })

    it('should have price display in VES (optional)', () => {
      cy.get('#product-price-ves').should('exist')
    })

    it('should display stock information', () => {
      cy.get('#stock-info').should('be.visible')

      cy.get('#stock-count')
        .should('be.visible')
        .invoke('text')
        .then(text => {
          const stock = parseInt(text)
          expect(stock).to.be.at.least(0)
        })
    })

    it('should display product description', () => {
      cy.get('#product-description', { timeout: 10000 })
        .should('be.visible')
        .and('not.contain', 'Hermoso arreglo floral perfecto para cualquier ocasión especial') // Should be replaced
    })

    it('should display occasion badges', () => {
      cy.get('#occasion-badges').should('exist')
    })

    it('should display delivery availability badges', () => {
      cy.contains('Disponible para entrega').should('be.visible')
      cy.contains('Entrega el mismo día').should('be.visible')
    })
  })

  /**
   * Phase 5: Image Gallery
   * Verify: Main image, thumbnails, zoom functionality
   */
  describe('Phase 5: Image Gallery', () => {
    it('should display main product image', () => {
      cy.get('#main-image', { timeout: 10000 })
        .should('be.visible')
        .and('have.attr', 'src')
        .and('not.be.empty')
    })

    it('should have main image with proper alt text', () => {
      cy.get('#main-image')
        .should('have.attr', 'alt')
        .and('not.be.empty')
    })

    it('should have image zoom hint', () => {
      cy.contains('Click para ampliar').should('exist')
    })

    it('should have thumbnails container', () => {
      cy.get('#thumbnails-container').should('exist')
    })

    it('should verify main image loads successfully', () => {
      cy.get('#main-image').then($img => {
        expect($img[0].naturalWidth).to.be.greaterThan(0)
      })
    })
  })

  /**
   * Phase 6: Quantity Controls
   * Verify: Quantity input, increment, decrement buttons
   */
  describe('Phase 6: Quantity Controls', () => {
    it('should have quantity input field', () => {
      cy.get('#quantity-input')
        .should('exist')
        .and('have.attr', 'type', 'number')
        .and('have.attr', 'value', '1')
        .and('have.attr', 'min', '1')
        .and('have.attr', 'aria-label', 'Cantidad')
    })

    it('should have quantity decrease button', () => {
      cy.get('#qty-minus')
        .should('exist')
        .and('have.attr', 'type', 'button')
        .and('have.attr', 'aria-label', 'Disminuir cantidad')
        .and('contain', '-')
    })

    it('should have quantity increase button', () => {
      cy.get('#qty-plus')
        .should('exist')
        .and('have.attr', 'type', 'button')
        .and('have.attr', 'aria-label', 'Aumentar cantidad')
        .and('contain', '+')
    })

    it('should increment quantity when plus button is clicked', () => {
      cy.get('#quantity-input').should('have.value', '1')

      cy.get('#qty-plus').click()

      cy.get('#quantity-input').should('have.value', '2')
    })

    it('should decrement quantity when minus button is clicked', () => {
      // First increment to 2
      cy.get('#qty-plus').click()
      cy.get('#quantity-input').should('have.value', '2')

      // Then decrement back to 1
      cy.get('#qty-minus').click()
      cy.get('#quantity-input').should('have.value', '1')
    })

    it('should not allow quantity to go below 1', () => {
      cy.get('#quantity-input').should('have.value', '1')

      cy.get('#qty-minus').click()

      cy.get('#quantity-input').should('have.value', '1')
    })
  })

  /**
   * Phase 7: Action Buttons
   * Verify: Add to cart, buy now buttons
   */
  describe('Phase 7: Action Buttons', () => {
    it('should have "Add to Cart" button', () => {
      cy.get('#add-to-cart-btn')
        .should('exist')
        .and('have.attr', 'type', 'button')
        .and('contain', 'Agregar al Carrito')
        .and('be.visible')
    })

    it('should have "Buy Now" button', () => {
      cy.get('#buy-now-btn')
        .should('exist')
        .and('have.attr', 'type', 'button')
        .and('contain', 'Comprar Ahora')
        .and('be.visible')
    })

    it('should have proper gradient styling on action buttons', () => {
      cy.get('#add-to-cart-btn').should('have.class', 'theme-btn-gradient')
      cy.get('#buy-now-btn').should('have.class', 'theme-btn-gradient')
    })

    it('should have SVG icons in action buttons', () => {
      cy.get('#add-to-cart-btn svg').should('exist')
      cy.get('#buy-now-btn svg').should('exist')
    })
  })

  /**
   * Phase 8: Product Features Section
   * Verify: Features list, icons, content
   */
  describe('Phase 8: Product Features and Help', () => {
    it('should display features section heading', () => {
      cy.contains('h3', 'Características').should('exist')
    })

    it('should display all 4 product features', () => {
      cy.contains('Flores frescas del día').should('be.visible')
      cy.contains('Diseño profesional').should('be.visible')
      cy.contains('Incluye tarjeta de dedicatoria').should('be.visible')
      cy.contains('Garantía de frescura').should('be.visible')
    })

    it('should have feature icons', () => {
      // Each feature should have an SVG icon
      cy.get('ul.space-y-2 li svg').should('have.length', 4)
    })

    it('should display help section', () => {
      cy.contains('¿Necesitas ayuda personalizada?').should('be.visible')
    })

    it('should have WhatsApp contact link', () => {
      cy.contains('a', 'WhatsApp')
        .should('exist')
        .and('have.attr', 'href', 'https://wa.me/584121234567')
        .and('have.attr', 'target', '_blank')
        .and('have.attr', 'rel', 'noopener noreferrer')
    })

    it('should have phone contact link', () => {
      cy.contains('a', 'Llamar')
        .should('exist')
        .and('have.attr', 'href', 'tel:+584121234567')
    })
  })

  /**
   * Phase 9: Footer
   * Verify: Footer structure, branding, copyright
   */
  describe('Phase 9: Footer', () => {
    it('should render footer section', () => {
      cy.get('footer.footer-section')
        .should('exist')
        .and('have.class', 'theme-footer-solid')
    })

    it('should display FloresYa branding in footer', () => {
      cy.get('footer').within(() => {
        cy.contains('FloresYa').should('exist')
        cy.contains('Tu floristería en línea de confianza').should('exist')
      })
    })

    it('should display copyright notice', () => {
      cy.get('footer').within(() => {
        cy.contains('2025 FloresYa. Todos los derechos reservados.').should('exist')
      })
    })

    it('should have footer icon', () => {
      cy.get('footer svg').should('exist')
    })
  })

  /**
   * Phase 10: Accessibility
   * Verify: ARIA labels, semantic HTML, keyboard navigation
   */
  describe('Phase 10: Accessibility Standards', () => {
    it('should have proper heading hierarchy', () => {
      cy.get('h1').should('have.length', 1)
      cy.get('#product-title').should('exist')
    })

    it('should have alt text on all images', () => {
      cy.get('img').each($img => {
        cy.wrap($img).should('have.attr', 'alt')
      })
    })

    it('should have ARIA labels on interactive elements', () => {
      cy.get('nav[aria-label]').should('have.length.at.least', 2)
      cy.get('button[aria-label]').should('have.length.at.least', 2)
      cy.get('a[aria-label]').should('have.length.at.least', 1)
    })

    it('should have semantic HTML structure', () => {
      cy.get('nav').should('exist')
      cy.get('main').should('exist')
      cy.get('footer').should('exist')
      cy.get('button').should('exist')
    })

    it('should support keyboard navigation on buttons', () => {
      cy.get('#add-to-cart-btn').focus().should('be.focused')
      cy.get('#add-to-cart-btn').should('have.css', 'outline')
    })
  })

  /**
   * Phase 11: JavaScript Module Loading
   * Verify: All scripts loaded, no errors
   */
  describe('Phase 11: JavaScript Module Loading', () => {
    it('should load theme management scripts', () => {
      cy.get('script[src*="themeManager.js"]').should('exist').and('have.attr', 'type', 'module')
      cy.get('script[src*="themeSelectorUI.js"]').should('exist').and('have.attr', 'type', 'module')
    })

    it('should load product detail script', () => {
      cy.get('script[src*="product-detail.js"]').should('exist').and('have.attr', 'type', 'module')
    })

    it('should not have console errors', () => {
      cy.get('@consoleError').should('not.have.been.called')
    })
  })

  /**
   * Phase 12: Toast Container
   * Verify: Toast notification container exists
   */
  describe('Phase 12: Toast Notifications', () => {
    it('should have toast container', () => {
      cy.get('#toast-container')
        .should('exist')
        .and('have.class', 'fixed')
        .and('have.class', 'z-50')
    })
  })

  /**
   * Phase 13: Error Handling for Invalid Product
   * Verify: Error display when product not found
   */
  describe('Phase 13: Error Handling - Invalid Product ID', () => {
    beforeEach(() => {
      cy.visit(`/pages/product-detail.html?id=${INVALID_PRODUCT_ID}`, {
        failOnStatusCode: false
      })
    })

    it('should display error message for invalid product', () => {
      cy.get('#error-message', { timeout: 10000 }).should('be.visible')
    })

    it('should hide loading spinner on error', () => {
      cy.get('#loading-spinner', { timeout: 10000 }).should('not.be.visible')
    })

    it('should hide product content on error', () => {
      cy.get('#product-content', { timeout: 10000 }).should('not.be.visible')
    })

    it('should display error title', () => {
      cy.contains('Error al cargar el producto').should('be.visible')
    })

    it('should have back to home link on error', () => {
      cy.get('#error-message a[href="/"]')
        .should('be.visible')
        .and('contain', 'Volver al inicio')
    })
  })

  /**
   * Phase 14: Complete Integration
   * Verify: All components work together
   */
  describe('Phase 14: Complete Integration', () => {
    it('should have all critical sections rendered', () => {
      cy.get('nav.navbar').should('exist')
      cy.get('nav[aria-label="Breadcrumb"]').should('exist')
      cy.get('main').should('exist')
      cy.get('#product-content', { timeout: 10000 }).should('be.visible')
      cy.get('footer').should('exist')
    })

    it('should allow full user interaction flow', () => {
      // Wait for product to load
      cy.get('#product-content', { timeout: 10000 }).should('be.visible')

      // Change quantity
      cy.get('#qty-plus').click()
      cy.get('#quantity-input').should('have.value', '2')

      // Click add to cart
      cy.get('#add-to-cart-btn').should('be.enabled').click()

      // No errors
      cy.get('@consoleError').should('not.have.been.called')
    })

    it('should maintain accessibility throughout interactions', () => {
      cy.get('#qty-plus').click()
      cy.get('#quantity-input').should('have.attr', 'aria-label', 'Cantidad')
    })

    it('should complete page load without resource errors', () => {
      cy.get('@consoleError').should('not.have.been.called')
    })
  })
})
