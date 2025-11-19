/**
 * Custom Cypress Commands for Cart and Payment E2E Testing
 * Commands for mocking API responses, cart manipulation, and payment flows
 */

/**
 * Mock API settings endpoint
 */
Cypress.Commands.add('mockSettings', () => {
  cy.intercept('GET', '**/api/settings/public', {
    fixture: 'settings.json'
  }).as('getSettings')
})

/**
 * Setup cart with mock items
 */
Cypress.Commands.add('setupCart', (items = null) => {
  cy.window().then(win => {
    const cartItems = items || [
      {
        id: 1,
        name: 'Ramo de Rosas Rojas',
        price_usd: 25.99,
        stock: 10,
        quantity: 2,
        image_thumb: '/images/products/rosas-rojas-thumb.jpg'
      },
      {
        id: 2,
        name: 'Girasoles Premium',
        price_usd: 18.5,
        stock: 15,
        quantity: 1,
        image_thumb: '/images/products/girasoles-thumb.jpg'
      }
    ]
    win.localStorage.setItem('cart', JSON.stringify(cartItems))
  })
})

/**
 * Clear cart
 */
Cypress.Commands.add('clearCart', () => {
  cy.window().then(win => {
    win.localStorage.removeItem('cart')
    win.localStorage.removeItem('deliveryMethod')
    win.localStorage.removeItem('orderSummary')
    win.localStorage.removeItem('customerData')
  })
})

/**
 * Add single item to cart
 */
Cypress.Commands.add('addToCart', item => {
  cy.window().then(win => {
    const currentCart = JSON.parse(win.localStorage.getItem('cart') || '[]')
    currentCart.push(item)
    win.localStorage.setItem('cart', JSON.stringify(currentCart))
  })
})

/**
 * Get cart items count
 */
Cypress.Commands.add('getCartCount', () => {
  cy.window().then(win => {
    const cart = JSON.parse(win.localStorage.getItem('cart') || '[]')
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  })
})

/**
 * Mock order creation API
 */
Cypress.Commands.add('mockCreateOrder', (status = 200, response = null) => {
  const mockResponse = response || { fixture: 'order-response.json' }
  cy.intercept('POST', '**/api/orders', {
    statusCode: status,
    ...mockResponse
  }).as('createOrder')
})

/**
 * Mock payment confirmation API
 */
Cypress.Commands.add('mockConfirmPayment', (orderId = 12345, status = 200, response = null) => {
  const mockResponse = response || { fixture: 'payment-confirmation.json' }
  cy.intercept('POST', `**/api/orders/${orderId}/payments`, {
    statusCode: status,
    ...mockResponse
  }).as('confirmPayment')
})

/**
 * Fill customer form with valid data
 */
Cypress.Commands.add('fillCustomerForm', (customerData = {}) => {
  const defaultData = {
    name: 'Juan Pérez',
    email: 'test@example.com',
    phone: '0414-1234567',
    address: 'Calle Principal, Edificio Test, Piso 5, Apto 10',
    references: 'Portón azul al lado del supermercado',
    notes: 'Entregar por la tarde'
  }

  const data = { ...defaultData, ...customerData }

  cy.get('#customer-name').clear().type(data.name)
  cy.get('#customer-email').clear().type(data.email)
  cy.get('#customer-phone').clear().type(data.phone)
  cy.get('#delivery-address').clear().type(data.address)
  cy.get('#delivery-references').clear().type(data.references)
  cy.get('#additional-notes').clear().type(data.notes)
})

/**
 * Select delivery method
 */
Cypress.Commands.add('selectDeliveryMethod', method => {
  cy.get(`input[name="delivery"][value="${method}"]`).check({ force: true })
})

/**
 * Select payment method
 */
Cypress.Commands.add('selectPaymentMethod', method => {
  cy.get(`input[name="payment-method"][value="${method}"]`).check({ force: true })
})

/**
 * Fill payment method specific fields
 */
Cypress.Commands.add('fillPaymentDetails', (method, details = {}) => {
  switch (method) {
    case 'mobile_payment':
      cy.get('#mobile-phone')
        .clear()
        .type(details.phone || '0414-1234567')
      cy.get('#mobile-bank').select(details.bank || 'Banesco')
      break

    case 'bank_transfer':
      cy.get('#bank-name').select(details.bank || 'Banesco')
      cy.get('#account-number')
        .clear()
        .type(details.account || '0102 1234 5678 9012 3456')
      cy.get('#account-holder')
        .clear()
        .type(details.holder || 'Juan Pérez')
      break

    case 'zelle':
      cy.get('#zelle-email')
        .clear()
        .type(details.email || 'test@example.com')
      break

    case 'crypto':
      cy.get('#crypto-address')
        .clear()
        .type(details.address || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh')
      break

    case 'cash':
      // Cash doesn't require additional fields
      break
  }
})

/**
 * Complete full checkout flow
 */
Cypress.Commands.add(
  'completeCheckout',
  (deliveryMethod = 'pickup', paymentMethod = 'cash', customerData = {}) => {
    // Fill customer form
    cy.fillCustomerForm(customerData)

    // Select delivery method
    cy.selectDeliveryMethod(deliveryMethod)

    // Select payment method and fill details
    cy.selectPaymentMethod(paymentMethod)
    if (paymentMethod !== 'cash') {
      cy.fillPaymentDetails(paymentMethod)
    }

    // Click process payment button
    cy.get('#process-payment-button').click()
  }
)

/**
 * Verify cart summary displays correctly
 */
Cypress.Commands.add('verifyCartSummary', (expectedItems, expectedSubtotal, expectedTotal) => {
  cy.get('#total-items').should('contain', expectedItems)
  cy.get('#subtotal').should('contain', `$${expectedSubtotal.toFixed(2)}`)
  cy.get('#total').should('contain', `$${expectedTotal.toFixed(2)}`)
})

/**
 * Verify order confirmation page
 */
Cypress.Commands.add('verifyOrderConfirmation', orderId => {
  cy.url().should('include', '/pages/order-confirmation.html')
  if (orderId) {
    cy.url().should('include', `orderId=${orderId}`)
  }
})

/**
 * Wait for cart page to load
 */
Cypress.Commands.add('waitForCartPage', () => {
  cy.get('#cart-items').should('exist')
  cy.get('#checkout-button').should('exist')
})

/**
 * Wait for payment page to load
 */
Cypress.Commands.add('waitForPaymentPage', () => {
  cy.get('#customer-form').should('exist')
  cy.get('#process-payment-button').should('exist')
})

/**
 * Mock all required APIs for cart/payment flow
 */
Cypress.Commands.add('mockCartPaymentApis', () => {
  cy.mockSettings()
  cy.mockCreateOrder()
  cy.mockConfirmPayment()
})
