/**
 * E2E Tests for Payment Page
 * Tests customer form, payment methods, order creation, and payment processing
 */

describe('Payment Page - E2E Tests', () => {
  beforeEach(() => {
    // Clear cart and setup fresh state
    cy.clearCart()

    // Setup cart with items
    cy.setupCart()

    // Mock all required APIs
    cy.mockCartPaymentApis()

    // Visit payment page
    cy.visit('/pages/payment.html')
    cy.wait('@getSettings')
  })

  afterEach(() => {
    cy.clearCart()
  })

  describe('Page Load and Redirect', () => {
    it('should redirect to cart page if cart is empty', () => {
      cy.clearCart()
      cy.visit('/pages/payment.html')
      cy.url().should('include', '/pages/cart.html')
    })

    it('should load successfully with cart items', () => {
      cy.waitForPaymentPage()
      cy.get('#customer-form').should('be.visible')
      cy.get('#cart-summary').should('be.visible')
    })

    it('should display cart summary on payment page', () => {
      cy.get('#cart-summary .flex').should('have.length', 2)
    })

    it('should load delivery cost from settings', () => {
      cy.get('#delivery-cost-display').should('contain', '$')
    })
  })

  describe('Cart Summary Display', () => {
    it('should display all cart items in summary', () => {
      cy.get('#cart-summary').within(() => {
        cy.contains('Ramo de Rosas Rojas').should('exist')
        cy.contains('Girasoles Premium').should('exist')
      })
    })

    it('should show correct quantities in cart summary', () => {
      cy.get('#cart-summary').within(() => {
        cy.contains('Cantidad: 2').should('exist')
        cy.contains('Cantidad: 1').should('exist')
      })
    })

    it('should display correct item prices in summary', () => {
      cy.get('#cart-summary').should('contain', '$51.98')
      cy.get('#cart-summary').should('contain', '$18.50')
    })

    it('should show placeholder image for missing product images', () => {
      cy.get('#cart-summary img[src*="placeholder"]').should('exist')
    })

    it('should calculate and display correct order totals', () => {
      cy.verifyCartSummary(3, 70.48, 70.48)
    })
  })

  describe('Customer Form Validation', () => {
    it('should show all required form fields', () => {
      cy.get('#customer-name').should('exist')
      cy.get('#customer-email').should('exist')
      cy.get('#customer-phone').should('exist')
      cy.get('#delivery-address').should('exist')
    })

    it('should validate empty name field', () => {
      cy.get('#customer-name').focus().blur()
      cy.get('#customer-name').parent().find('.error-message').should('be.visible')
    })

    it('should validate invalid email format', () => {
      cy.get('#customer-email').type('invalid-email').blur()
      cy.get('#customer-email').parent().find('.error-message').should('be.visible')
    })

    it('should accept valid email format', () => {
      cy.get('#customer-email').type('test@example.com').blur()
      cy.get('#customer-email').parent().find('.error-message').should('not.be.visible')
    })

    it('should validate Venezuelan phone number format', () => {
      cy.get('#customer-phone').type('1234567890').blur()
      cy.get('#customer-phone').parent().find('.error-message').should('be.visible')
    })

    it('should accept valid Venezuelan phone number', () => {
      cy.get('#customer-phone').type('0414-1234567').blur()
      cy.get('#customer-phone').parent().find('.error-message').should('not.be.visible')
    })

    it('should auto-format phone number as user types', () => {
      cy.get('#customer-phone').type('04141234567')
      cy.get('#customer-phone').should('have.value', '(+58)-414-1234567')
    })

    it('should validate address length', () => {
      cy.get('#delivery-address').type('Short').blur()
      cy.get('#delivery-address').parent().find('.error-message').should('be.visible')
    })

    it('should accept valid address', () => {
      cy.get('#delivery-address').type('Calle Principal, Edificio Test, Piso 5, Apto 10').blur()
      cy.get('#delivery-address').parent().find('.error-message').should('not.be.visible')
    })

    it('should clear error message when user starts typing', () => {
      cy.get('#customer-name').focus().blur()
      cy.get('#customer-name').parent().find('.error-message').should('be.visible')

      cy.get('#customer-name').type('J')
      cy.get('#customer-name').parent().find('.error-message').should('not.be.visible')
    })
  })

  describe('Delivery Method Selection', () => {
    it('should default to pickup method', () => {
      cy.get('input[name="delivery"][value="pickup"]').should('be.checked')
    })

    it('should show free shipping for pickup', () => {
      cy.selectDeliveryMethod('pickup')
      cy.get('#shipping-cost').should('contain', 'Gratis')
    })

    it('should show delivery cost when delivery selected', () => {
      cy.selectDeliveryMethod('delivery')
      cy.get('#shipping-cost').should('contain', '$5.00')
    })

    it('should update total when switching delivery methods', () => {
      cy.verifyCartSummary(3, 70.48, 70.48)

      cy.selectDeliveryMethod('delivery')
      cy.verifyCartSummary(3, 70.48, 75.48)

      cy.selectDeliveryMethod('pickup')
      cy.verifyCartSummary(3, 70.48, 70.48)
    })
  })

  describe('Payment Method Selection', () => {
    it('should default to cash payment', () => {
      cy.get('input[name="payment-method"][value="cash"]').should('be.checked')
    })

    it('should show all available payment methods', () => {
      cy.get('input[name="payment-method"][value="cash"]').should('exist')
      cy.get('input[name="payment-method"][value="mobile_payment"]').should('exist')
      cy.get('input[name="payment-method"][value="bank_transfer"]').should('exist')
      cy.get('input[name="payment-method"][value="zelle"]').should('exist')
      cy.get('input[name="payment-method"][value="crypto"]').should('exist')
    })

    it('should hide all payment forms by default', () => {
      cy.get('#mobile-payment-form').should('have.class', 'hidden')
      cy.get('#bank-transfer-form').should('have.class', 'hidden')
      cy.get('#zelle-form').should('have.class', 'hidden')
      cy.get('#crypto-form').should('have.class', 'hidden')
    })

    it('should show mobile payment form when selected', () => {
      cy.selectPaymentMethod('mobile_payment')
      cy.get('#mobile-payment-form').should('not.have.class', 'hidden')
    })

    it('should show bank transfer form when selected', () => {
      cy.selectPaymentMethod('bank_transfer')
      cy.get('#bank-transfer-form').should('not.have.class', 'hidden')
    })

    it('should show zelle form when selected', () => {
      cy.selectPaymentMethod('zelle')
      cy.get('#zelle-form').should('not.have.class', 'hidden')
    })

    it('should show crypto form when selected', () => {
      cy.selectPaymentMethod('crypto')
      cy.get('#crypto-form').should('not.have.class', 'hidden')
    })

    it('should hide previous form when switching payment methods', () => {
      cy.selectPaymentMethod('mobile_payment')
      cy.get('#mobile-payment-form').should('not.have.class', 'hidden')

      cy.selectPaymentMethod('bank_transfer')
      cy.get('#mobile-payment-form').should('have.class', 'hidden')
      cy.get('#bank-transfer-form').should('not.have.class', 'hidden')
    })
  })

  describe('Payment Method Forms Validation', () => {
    it('should validate mobile payment fields', () => {
      cy.selectPaymentMethod('mobile_payment')
      cy.fillCustomerForm()
      cy.get('#process-payment-button').click()

      cy.on('window:alert', str => {
        expect(str).to.include('número de teléfono')
      })
    })

    it('should validate bank transfer fields', () => {
      cy.selectPaymentMethod('bank_transfer')
      cy.fillCustomerForm()
      cy.get('#process-payment-button').click()

      cy.on('window:alert', str => {
        expect(str).to.include('banco')
      })
    })

    it('should validate zelle email field', () => {
      cy.selectPaymentMethod('zelle')
      cy.fillCustomerForm()
      cy.get('#process-payment-button').click()

      cy.on('window:alert', str => {
        expect(str).to.include('email')
      })
    })

    it('should validate crypto address field', () => {
      cy.selectPaymentMethod('crypto')
      cy.fillCustomerForm()
      cy.get('#process-payment-button').click()

      cy.on('window:alert', str => {
        expect(str).to.include('billetera')
      })
    })
  })

  describe('Order Reference Generation', () => {
    it('should display order reference in payment forms', () => {
      cy.selectPaymentMethod('mobile_payment')
      cy.get('#mobile-reference').should('contain', 'FY-')
    })

    it('should have consistent reference across all payment methods', () => {
      cy.selectPaymentMethod('mobile_payment')
      cy.get('#mobile-reference')
        .invoke('text')
        .then(ref1 => {
          cy.selectPaymentMethod('bank_transfer')
          cy.get('#transfer-reference').should('contain', ref1)

          cy.selectPaymentMethod('zelle')
          cy.get('#zelle-reference').should('contain', ref1)
        })
    })

    it('should generate unique reference number on page load', () => {
      cy.get('#mobile-reference')
        .invoke('text')
        .should('match', /^FY-\d{9}$/)
    })
  })

  describe('Remember Me Functionality', () => {
    it('should save customer data when remember me is checked', () => {
      cy.fillCustomerForm()
      cy.get('#remember-me').check()
      cy.completeCheckout('pickup', 'cash')

      cy.wait('@createOrder')

      cy.window().then(win => {
        const savedData = win.localStorage.getItem('customerData')
        expect(savedData).to.not.be.null
      })
    })

    it('should not save customer data when remember me is unchecked', () => {
      cy.fillCustomerForm()
      cy.get('#remember-me').should('not.be.checked')

      cy.window().then(win => {
        win.localStorage.removeItem('customerData')
      })

      cy.completeCheckout('pickup', 'cash')
      cy.wait('@createOrder')

      cy.window().then(win => {
        const savedData = win.localStorage.getItem('customerData')
        expect(savedData).to.be.null
      })
    })

    it('should load saved customer data on page load', () => {
      const customerData = {
        name: 'Saved User',
        email: 'saved@example.com',
        phone: '(+58)-414-7654321',
        address: 'Saved Address 123',
        references: 'Saved reference',
        notes: 'Saved notes',
        rememberMe: true
      }

      cy.window().then(win => {
        win.localStorage.setItem('customerData', JSON.stringify(customerData))
      })

      cy.visit('/pages/payment.html')
      cy.wait('@getSettings')

      cy.get('#customer-name').should('have.value', 'Saved User')
      cy.get('#customer-email').should('have.value', 'saved@example.com')
      cy.get('#customer-phone').should('have.value', '(+58)-414-7654321')
    })
  })

  describe('Cash Payment Flow', () => {
    it('should complete cash payment successfully', () => {
      cy.completeCheckout('pickup', 'cash')

      cy.wait('@createOrder')
        .its('request.body')
        .should('deep.include', {
          order: {
            customer_name: 'Juan Pérez',
            customer_email: 'test@example.com',
            status: 'pending'
          }
        })

      cy.wait('@confirmPayment')
      cy.verifyOrderConfirmation(12345)
    })

    it('should send correct order data for cash payment', () => {
      cy.completeCheckout('pickup', 'cash')

      cy.wait('@createOrder')
        .its('request.body')
        .then(body => {
          expect(body.order).to.have.property('customer_name', 'Juan Pérez')
          expect(body.order).to.have.property('customer_email', 'test@example.com')
          expect(body.order).to.have.property('customer_phone', '(+58)-414-1234567')
          expect(body.order).to.have.property('total_amount_usd')
          expect(body.items).to.be.an('array')
          expect(body.items).to.have.length(2)
        })
    })

    it('should include delivery cost in total for delivery method', () => {
      cy.completeCheckout('delivery', 'cash')

      cy.wait('@createOrder').its('request.body.order.total_amount_usd').should('equal', 75.48)
    })

    it('should not include delivery cost for pickup method', () => {
      cy.completeCheckout('pickup', 'cash')

      cy.wait('@createOrder').its('request.body.order.total_amount_usd').should('equal', 70.48)
    })
  })

  describe('Mobile Payment Flow', () => {
    it('should complete mobile payment successfully', () => {
      cy.selectPaymentMethod('mobile_payment')
      cy.fillCustomerForm()
      cy.fillPaymentDetails('mobile_payment', { phone: '0414-1234567', bank: 'Banesco' })
      cy.get('#process-payment-button').click()

      cy.wait('@createOrder')
      cy.wait('@confirmPayment').its('request.body').should('deep.include', {
        payment_method: 'mobile_payment'
      })

      cy.verifyOrderConfirmation(12345)
    })

    it('should include mobile payment details in confirmation', () => {
      cy.selectPaymentMethod('mobile_payment')
      cy.fillCustomerForm()
      cy.fillPaymentDetails('mobile_payment', { phone: '0414-1234567', bank: 'Banesco' })
      cy.get('#process-payment-button').click()

      cy.wait('@confirmPayment').its('request.body.payment_details').should('deep.include', {
        phone: '0414-1234567',
        bank: 'Banesco'
      })
    })
  })

  describe('Bank Transfer Flow', () => {
    it('should complete bank transfer successfully', () => {
      cy.selectPaymentMethod('bank_transfer')
      cy.fillCustomerForm()
      cy.fillPaymentDetails('bank_transfer', {
        bank: 'Banesco',
        account: '0102 1234 5678 9012 3456',
        holder: 'Juan Pérez'
      })
      cy.get('#process-payment-button').click()

      cy.wait('@createOrder')
      cy.wait('@confirmPayment')
      cy.verifyOrderConfirmation(12345)
    })

    it('should include bank transfer details in confirmation', () => {
      cy.selectPaymentMethod('bank_transfer')
      cy.fillCustomerForm()
      cy.fillPaymentDetails('bank_transfer', {
        bank: 'Banesco',
        account: '0102 1234 5678 9012 3456',
        holder: 'Juan Pérez'
      })
      cy.get('#process-payment-button').click()

      cy.wait('@confirmPayment').its('request.body.payment_details').should('deep.include', {
        bank: 'Banesco',
        account_number: '0102 1234 5678 9012 3456',
        account_holder: 'Juan Pérez'
      })
    })
  })

  describe('Zelle Payment Flow', () => {
    it('should complete zelle payment successfully', () => {
      cy.selectPaymentMethod('zelle')
      cy.fillCustomerForm()
      cy.fillPaymentDetails('zelle', { email: 'test@zelle.com' })
      cy.get('#process-payment-button').click()

      cy.wait('@createOrder')
      cy.wait('@confirmPayment')
      cy.verifyOrderConfirmation(12345)
    })

    it('should include zelle email in confirmation', () => {
      cy.selectPaymentMethod('zelle')
      cy.fillCustomerForm()
      cy.fillPaymentDetails('zelle', { email: 'test@zelle.com' })
      cy.get('#process-payment-button').click()

      cy.wait('@confirmPayment').its('request.body.payment_details').should('deep.include', {
        email: 'test@zelle.com'
      })
    })
  })

  describe('Crypto Payment Flow', () => {
    it('should complete crypto payment successfully', () => {
      cy.selectPaymentMethod('crypto')
      cy.fillCustomerForm()
      cy.fillPaymentDetails('crypto', {
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
      })
      cy.get('#process-payment-button').click()

      cy.wait('@createOrder')
      cy.wait('@confirmPayment')
      cy.verifyOrderConfirmation(12345)
    })

    it('should include crypto address in confirmation', () => {
      cy.selectPaymentMethod('crypto')
      cy.fillCustomerForm()
      cy.fillPaymentDetails('crypto', {
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
      })
      cy.get('#process-payment-button').click()

      cy.wait('@confirmPayment').its('request.body.payment_details').should('deep.include', {
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
      })
    })
  })

  describe('Error Handling', () => {
    it('should show error alert when form validation fails', () => {
      cy.on('window:alert', str => {
        expect(str).to.include('campos requeridos')
      })

      cy.get('#process-payment-button').click()
    })

    it('should handle API error gracefully', () => {
      cy.mockCreateOrder(500, {
        body: { success: false, message: 'Server error' }
      })

      cy.completeCheckout('pickup', 'cash')

      cy.on('window:alert', str => {
        expect(str).to.include('Error procesando el pago')
      })
    })

    it('should restore button state after error', () => {
      cy.mockCreateOrder(500, {
        body: { success: false, message: 'Server error' }
      })

      cy.completeCheckout('pickup', 'cash')
      cy.wait(1000)

      cy.get('#process-payment-button').should('not.be.disabled')
    })

    it('should continue with order creation even if payment confirmation fails', () => {
      cy.mockCreateOrder(200)
      cy.mockConfirmPayment(12345, 500, {
        body: { success: false, message: 'Payment confirmation failed' }
      })

      cy.completeCheckout('pickup', 'cash')

      cy.wait('@createOrder')
      cy.verifyOrderConfirmation(12345)
    })
  })

  describe('Loading States', () => {
    it('should show loading state when processing payment', () => {
      cy.completeCheckout('pickup', 'cash')
      cy.get('#process-payment-button').should('contain', 'Procesando')
    })

    it('should disable button during processing', () => {
      cy.completeCheckout('pickup', 'cash')
      cy.get('#process-payment-button').should('be.disabled')
    })
  })

  describe('Cart Clearing', () => {
    it('should clear cart after successful payment', () => {
      cy.completeCheckout('pickup', 'cash')

      cy.wait('@createOrder')
      cy.wait('@confirmPayment')

      cy.window().then(win => {
        const cart = win.localStorage.getItem('cart')
        expect(cart).to.be.null
      })
    })

    it('should not clear cart if payment fails', () => {
      cy.mockCreateOrder(500, {
        body: { success: false, message: 'Server error' }
      })

      cy.completeCheckout('pickup', 'cash')
      cy.wait(1000)

      cy.window().then(win => {
        const cart = JSON.parse(win.localStorage.getItem('cart'))
        expect(cart).to.have.length.greaterThan(0)
      })
    })
  })

  describe('Back Button Navigation', () => {
    it('should navigate back to cart when back button clicked', () => {
      cy.get('#back-button').click()
      cy.url().should('include', '/pages/cart.html')
    })
  })

  describe('Responsive Design', () => {
    it('should display correctly on mobile viewport', () => {
      cy.viewport(375, 667)
      cy.visit('/pages/payment.html')
      cy.wait('@getSettings')

      cy.get('#customer-form').should('be.visible')
      cy.get('#process-payment-button').should('be.visible')
    })

    it('should display correctly on tablet viewport', () => {
      cy.viewport(768, 1024)
      cy.visit('/pages/payment.html')
      cy.wait('@getSettings')

      cy.get('#customer-form').should('be.visible')
      cy.get('#cart-summary').should('be.visible')
    })

    it('should display correctly on desktop viewport', () => {
      cy.viewport(1920, 1080)
      cy.visit('/pages/payment.html')
      cy.wait('@getSettings')

      cy.get('#customer-form').should('be.visible')
      cy.get('#cart-summary').should('be.visible')
    })
  })
})
