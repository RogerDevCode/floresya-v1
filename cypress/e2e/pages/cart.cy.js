/**
 * E2E Tests for Shopping Cart Page
 * Tests cart display, item manipulation, delivery options, and checkout navigation
 */

describe('Shopping Cart Page - E2E Tests', () => {
  beforeEach(() => {
    // Clear cart before each test
    cy.clearCart()

    // Mock API endpoints
    cy.mockSettings()

    // Visit cart page
    cy.visit('/pages/cart.html')
  })

  afterEach(() => {
    // Clean up after each test
    cy.clearCart()
  })

  describe('Empty Cart State', () => {
    it('should display empty cart message when cart is empty', () => {
      cy.get('#empty-cart').should('not.have.class', 'hidden')
      cy.get('#empty-cart').should('contain', 'Tu carrito está vacío')
      cy.get('#cart-items').should('be.empty')
    })

    it('should disable checkout button when cart is empty', () => {
      cy.get('#checkout-button').should('be.disabled')
    })

    it('should hide clear cart section when cart is empty', () => {
      cy.get('#clear-cart-section').should('have.class', 'hidden')
    })

    it('should show zero in cart summary when empty', () => {
      cy.verifyCartSummary(0, 0, 0)
    })

    it('should display cart count badge as 0', () => {
      cy.get('#cart-count-badge').should('contain', '0')
    })

    it('should show link to products section in empty cart message', () => {
      cy.get('#empty-cart a').should('have.attr', 'href', '/#productos')
      cy.get('#empty-cart a').should('contain', 'Ver Productos')
    })
  })

  describe('Cart with Items', () => {
    beforeEach(() => {
      // Setup cart with 2 items
      cy.setupCart()
      cy.visit('/pages/cart.html')
    })

    it('should display cart items correctly', () => {
      cy.get('.cart-item').should('have.length', 2)
    })

    it('should hide empty cart message when items exist', () => {
      cy.get('#empty-cart').should('have.class', 'hidden')
    })

    it('should enable checkout button when items exist', () => {
      cy.get('#checkout-button').should('not.be.disabled')
    })

    it('should show clear cart section when items exist', () => {
      cy.get('#clear-cart-section').should('not.have.class', 'hidden')
    })

    it('should display correct item details (name, price, quantity, image)', () => {
      cy.get('.cart-item')
        .first()
        .within(() => {
          cy.contains('Ramo de Rosas Rojas').should('exist')
          cy.contains('$25.99').should('exist')
          cy.contains('2').should('exist')
          cy.get('img').should('have.attr', 'src').and('include', 'rosas-rojas')
        })
    })

    it('should display correct cart summary totals', () => {
      // 2 * 25.99 + 1 * 18.50 = 70.48
      cy.verifyCartSummary(3, 70.48, 70.48)
    })

    it('should update cart badge with correct count', () => {
      cy.get('#cart-count-badge').should('contain', '3')
    })

    it('should display stock availability for each item', () => {
      cy.get('.cart-item').first().should('contain', 'Stock disponible: 10')
    })
  })

  describe('Quantity Controls', () => {
    beforeEach(() => {
      cy.setupCart([
        {
          id: 1,
          name: 'Test Product',
          price_usd: 10.0,
          stock: 5,
          quantity: 2,
          image_thumb: '/images/test.jpg'
        }
      ])
      cy.visit('/pages/cart.html')
    })

    it('should increase quantity when plus button clicked', () => {
      cy.get('.btn-increase').click()
      cy.get('.cart-item').should('contain', '3')
      cy.verifyCartSummary(3, 30.0, 30.0)
    })

    it('should decrease quantity when minus button clicked', () => {
      cy.get('.btn-decrease').click()
      cy.get('.cart-item').should('contain', '1')
      cy.verifyCartSummary(1, 10.0, 10.0)
    })

    it('should disable decrease button when quantity is 1', () => {
      cy.get('.btn-decrease').click()
      cy.get('.btn-decrease').should('be.disabled')
    })

    it('should disable increase button when quantity reaches stock limit', () => {
      cy.get('.btn-increase').click()
      cy.get('.btn-increase').click()
      cy.get('.btn-increase').click()
      cy.get('.btn-increase').should('be.disabled')
    })

    it('should not increase quantity beyond stock limit', () => {
      // Try to increase beyond stock
      cy.get('.btn-increase').click()
      cy.get('.btn-increase').click()
      cy.get('.btn-increase').click()
      cy.get('.btn-increase').click()
      cy.get('.cart-item').should('contain', '5')
      cy.verifyCartSummary(5, 50.0, 50.0)
    })
  })

  describe('Remove Items', () => {
    beforeEach(() => {
      cy.setupCart()
      cy.visit('/pages/cart.html')
    })

    it('should show confirmation dialog when remove button clicked', () => {
      cy.window().then(win => {
        cy.stub(win, 'confirm').returns(false)
        cy.get('.btn-remove').first().click()
        cy.wrap(win.confirm).should('be.called')
      })
    })

    it('should remove item when confirmed', () => {
      cy.window().then(win => {
        cy.stub(win, 'confirm').returns(true)
      })

      cy.get('.cart-item').should('have.length', 2)
      cy.get('.btn-remove').first().click()
      cy.get('.cart-item').should('have.length', 1)
    })

    it('should not remove item when cancelled', () => {
      cy.window().then(win => {
        cy.stub(win, 'confirm').returns(false)
      })

      cy.get('.cart-item').should('have.length', 2)
      cy.get('.btn-remove').first().click()
      cy.get('.cart-item').should('have.length', 2)
    })

    it('should update cart summary after item removal', () => {
      cy.window().then(win => {
        cy.stub(win, 'confirm').returns(true)
      })

      cy.get('.btn-remove').first().click()
      // Only second item remains: 1 * 18.50
      cy.verifyCartSummary(1, 18.5, 18.5)
    })
  })

  describe('Clear Cart Functionality', () => {
    beforeEach(() => {
      cy.setupCart()
      cy.visit('/pages/cart.html')
    })

    it('should show confirmation dialog when clear cart clicked', () => {
      cy.window().then(win => {
        cy.stub(win, 'confirm').returns(false)
        cy.get('#clear-cart-button').click()
        cy.wrap(win.confirm).should('be.called')
      })
    })

    it('should clear all items when confirmed', () => {
      cy.window().then(win => {
        cy.stub(win, 'confirm').returns(true)
      })

      cy.get('.cart-item').should('have.length', 2)
      cy.get('#clear-cart-button').click()
      cy.get('#empty-cart').should('not.have.class', 'hidden')
      cy.get('.cart-item').should('have.length', 0)
    })

    it('should not clear cart when cancelled', () => {
      cy.window().then(win => {
        cy.stub(win, 'confirm').returns(false)
      })

      cy.get('.cart-item').should('have.length', 2)
      cy.get('#clear-cart-button').click()
      cy.get('.cart-item').should('have.length', 2)
    })

    it('should show empty cart state after clearing', () => {
      cy.window().then(win => {
        cy.stub(win, 'confirm').returns(true)
      })

      cy.get('#clear-cart-button').click()
      cy.get('#empty-cart').should('not.have.class', 'hidden')
      cy.verifyCartSummary(0, 0, 0)
    })
  })

  describe('Delivery Method Selection', () => {
    beforeEach(() => {
      cy.setupCart([
        {
          id: 1,
          name: 'Test Product',
          price_usd: 10.0,
          stock: 5,
          quantity: 1,
          image_thumb: '/images/test.jpg'
        }
      ])
      cy.visit('/pages/cart.html')
      cy.wait('@getSettings')
    })

    it('should default to pickup method (free shipping)', () => {
      cy.get('input[name="delivery"][value="pickup"]').should('be.checked')
      cy.get('#shipping-cost').should('contain', 'Gratis')
      cy.verifyCartSummary(1, 10.0, 10.0)
    })

    it('should show delivery cost when delivery selected', () => {
      cy.selectDeliveryMethod('delivery')
      cy.get('#shipping-cost').should('contain', '$5.00')
      cy.verifyCartSummary(1, 10.0, 15.0)
    })

    it('should update total when switching delivery methods', () => {
      cy.selectDeliveryMethod('delivery')
      cy.verifyCartSummary(1, 10.0, 15.0)

      cy.selectDeliveryMethod('pickup')
      cy.verifyCartSummary(1, 10.0, 10.0)
    })

    it('should display correct delivery cost from settings', () => {
      cy.get('#delivery-cost-display').should('contain', '$5.00')
    })
  })

  describe('Checkout Navigation', () => {
    beforeEach(() => {
      cy.setupCart()
      cy.visit('/pages/cart.html')
    })

    it('should navigate to payment page when checkout clicked', () => {
      cy.get('#checkout-button').click()
      cy.url().should('include', '/pages/payment.html')
    })

    it('should store delivery method in localStorage before navigation', () => {
      cy.selectDeliveryMethod('delivery')
      cy.get('#checkout-button').click()

      cy.window().then(win => {
        expect(win.localStorage.getItem('deliveryMethod')).to.equal('delivery')
      })
    })

    it('should store order summary in localStorage before navigation', () => {
      cy.get('#checkout-button').click()

      cy.window().then(win => {
        const orderSummary = JSON.parse(win.localStorage.getItem('orderSummary'))
        expect(orderSummary).to.have.property('subtotal')
        expect(orderSummary).to.have.property('shippingCost')
        expect(orderSummary).to.have.property('total')
      })
    })
  })

  describe('Back Button Navigation', () => {
    it('should navigate back when back button clicked', () => {
      cy.visit('/pages/cart.html')
      cy.get('#back-button').should('exist')
      cy.get('#back-button').click()
      cy.url().should('include', '/')
    })
  })

  describe('Image Error Handling', () => {
    beforeEach(() => {
      cy.setupCart([
        {
          id: 1,
          name: 'Test Product',
          price_usd: 10.0,
          stock: 5,
          quantity: 1,
          image_thumb: '/invalid/path/image.jpg'
        }
      ])
      cy.visit('/pages/cart.html')
    })

    it('should display placeholder image on error', () => {
      cy.get('.product-image').should('have.attr', 'src').and('include', 'placeholder')
    })
  })

  describe('Responsive Design', () => {
    beforeEach(() => {
      cy.setupCart()
    })

    it('should display correctly on mobile viewport', () => {
      cy.viewport(375, 667)
      cy.visit('/pages/cart.html')
      cy.get('.cart-item').should('be.visible')
      cy.get('#checkout-button').should('be.visible')
    })

    it('should display correctly on tablet viewport', () => {
      cy.viewport(768, 1024)
      cy.visit('/pages/cart.html')
      cy.get('.cart-item').should('be.visible')
      cy.get('#checkout-button').should('be.visible')
    })

    it('should display correctly on desktop viewport', () => {
      cy.viewport(1920, 1080)
      cy.visit('/pages/cart.html')
      cy.get('.cart-item').should('be.visible')
      cy.get('#checkout-button').should('be.visible')
    })
  })

  describe('Cart Badge Updates', () => {
    it('should update cart badge when quantity changes', () => {
      cy.setupCart([
        {
          id: 1,
          name: 'Test Product',
          price_usd: 10.0,
          stock: 5,
          quantity: 1,
          image_thumb: '/images/test.jpg'
        }
      ])
      cy.visit('/pages/cart.html')

      cy.get('#cart-count-badge').should('contain', '1')
      cy.get('.btn-increase').click()
      cy.get('#cart-count-badge').should('contain', '2')
    })

    it('should update cart badge when item removed', () => {
      cy.setupCart()
      cy.visit('/pages/cart.html')

      cy.window().then(win => {
        cy.stub(win, 'confirm').returns(true)
      })

      cy.get('#cart-count-badge').should('contain', '3')
      cy.get('.btn-remove').first().click()
      cy.get('#cart-count-badge').should('contain', '1')
    })
  })

  describe('Performance and Loading', () => {
    it('should load cart page within acceptable time', () => {
      cy.setupCart()
      const startTime = Date.now()

      cy.visit('/pages/cart.html').then(() => {
        const loadTime = Date.now() - startTime
        expect(loadTime).to.be.lessThan(3000)
      })
    })

    it('should render all cart items efficiently', () => {
      const manyItems = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Product ${i + 1}`,
        price_usd: 10.0,
        stock: 10,
        quantity: 1,
        image_thumb: `/images/product${i + 1}.jpg`
      }))

      cy.setupCart(manyItems)
      cy.visit('/pages/cart.html')

      cy.get('.cart-item').should('have.length', 10)
    })
  })
})
