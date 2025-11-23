/**
 * EJEMPLOS DE USO - Comandos Personalizados Cart & Payment
 *
 * Este archivo muestra ejemplos prácticos de cómo usar los comandos
 * personalizados creados para testing de carrito y pago.
 */
// @ts-nocheck

// ============================================
// EJEMPLO 1: Setup básico de carrito
// ============================================
describe('Ejemplo 1: Setup básico', () => {
  it('debería configurar carrito con items por defecto', () => {
    cy.clearCart()
    cy.setupCart() // Usa items por defecto
    cy.visit('/pages/cart.html')
    cy.get('.cart-item').should('have.length', 2)
  })

  it('debería configurar carrito con items personalizados', () => {
    cy.clearCart()
    cy.setupCart([
      {
        id: 999,
        name: 'Producto Custom',
        price_usd: 99.99,
        stock: 3,
        quantity: 1,
        image_thumb: '/images/custom.jpg'
      }
    ])
    cy.visit('/pages/cart.html')
    cy.contains('Producto Custom').should('exist')
  })
})

// ============================================
// EJEMPLO 2: Mocking de APIs
// ============================================
describe('Ejemplo 2: Mocking de APIs', () => {
  it('debería mockear settings API', () => {
    cy.mockSettings()
    cy.visit('/pages/cart.html')
    cy.wait('@getSettings')
    // Settings cargados desde fixture
  })

  it('debería mockear creación de orden con error', () => {
    cy.setupCart()
    cy.mockSettings()
    cy.mockCreateOrder(500, {
      body: { success: false, message: 'Error de servidor' }
    })

    cy.visit('/pages/payment.html')
    cy.completeCheckout('pickup', 'cash')

    cy.on('window:alert', str => {
      expect(str).to.include('Error procesando el pago')
    })
  })
})

// ============================================
// EJEMPLO 3: Flujo completo de checkout
// ============================================
describe('Ejemplo 3: Checkout completo', () => {
  beforeEach(() => {
    cy.clearCart()
    cy.setupCart()
    cy.mockCartPaymentApis() // Mock de todas las APIs necesarias
    cy.visit('/pages/payment.html')
    cy.wait('@getSettings')
  })

  it('flujo de pago con efectivo y pickup', () => {
    cy.completeCheckout('pickup', 'cash')
    cy.wait('@createOrder')
    cy.verifyOrderConfirmation(12345)
  })

  it('flujo de pago con tarjeta y delivery', () => {
    cy.completeCheckout('delivery', 'mobile_payment', {
      name: 'María González',
      email: 'maria@example.com',
      phone: '0424-9876543',
      address: 'Av. Principal, Torre XYZ, Piso 10'
    })

    cy.wait('@createOrder')
    cy.wait('@confirmPayment')
    cy.verifyOrderConfirmation(12345)
  })
})

// ============================================
// EJEMPLO 4: Validación de formularios
// ============================================
describe('Ejemplo 4: Validación de formularios', () => {
  beforeEach(() => {
    cy.setupCart()
    cy.mockSettings()
    cy.visit('/pages/payment.html')
    cy.wait('@getSettings')
  })

  it('validar email inválido', () => {
    cy.fillCustomerForm({
      email: 'email-invalido' // Sin @
    })

    cy.get('#customer-email').blur()
    cy.get('#customer-email').parent().find('.error-message').should('be.visible')
  })

  it('validar teléfono venezolano', () => {
    cy.get('#customer-phone').type('04141234567')
    cy.get('#customer-phone').should('have.value', '(+58)-414-1234567')
  })
})

// ============================================
// EJEMPLO 5: Tests de métodos de pago
// ============================================
describe('Ejemplo 5: Métodos de pago', () => {
  beforeEach(() => {
    cy.setupCart()
    cy.mockCartPaymentApis()
    cy.visit('/pages/payment.html')
    cy.wait('@getSettings')
  })

  it('pago móvil completo', () => {
    cy.selectPaymentMethod('mobile_payment')
    cy.get('#mobile-payment-form').should('be.visible')

    cy.fillCustomerForm()
    cy.fillPaymentDetails('mobile_payment', {
      phone: '0414-1234567',
      bank: 'Banesco'
    })

    cy.get('#process-payment-button').click()
    cy.wait('@createOrder')
    cy.wait('@confirmPayment').its('request.body.payment_details').should('deep.include', {
      phone: '0414-1234567',
      bank: 'Banesco'
    })
  })

  it('transferencia bancaria completa', () => {
    cy.selectPaymentMethod('bank_transfer')
    cy.fillCustomerForm()
    cy.fillPaymentDetails('bank_transfer', {
      bank: 'Mercantil',
      account: '0105 0000 1111 2222 3333',
      holder: 'Juan Pérez'
    })

    cy.get('#process-payment-button').click()
    cy.wait('@confirmPayment').its('request.body.payment_details.bank').should('equal', 'Mercantil')
  })
})

// ============================================
// EJEMPLO 6: Verificación de totales
// ============================================
describe('Ejemplo 6: Verificación de totales', () => {
  it('verificar totales con pickup (sin costo de envío)', () => {
    cy.clearCart()
    cy.setupCart([
      { id: 1, name: 'Item 1', price_usd: 10.0, stock: 5, quantity: 2, image_thumb: '/img1.jpg' },
      { id: 2, name: 'Item 2', price_usd: 15.0, stock: 5, quantity: 1, image_thumb: '/img2.jpg' }
    ])
    cy.mockSettings()
    cy.visit('/pages/cart.html')
    cy.wait('@getSettings')

    cy.selectDeliveryMethod('pickup')
    cy.verifyCartSummary(3, 35.0, 35.0) // 3 items, subtotal $35, total $35
  })

  it('verificar totales con delivery (con costo de envío)', () => {
    cy.clearCart()
    cy.setupCart([
      { id: 1, name: 'Item 1', price_usd: 10.0, stock: 5, quantity: 1, image_thumb: '/img1.jpg' }
    ])
    cy.mockSettings()
    cy.visit('/pages/cart.html')
    cy.wait('@getSettings')

    cy.selectDeliveryMethod('delivery')
    cy.verifyCartSummary(1, 10.0, 15.0) // 1 item, subtotal $10, total $15 ($10 + $5 delivery)
  })
})

// ============================================
// EJEMPLO 7: Manejo de errores
// ============================================
describe('Ejemplo 7: Manejo de errores', () => {
  it('manejo de error 500 en creación de orden', () => {
    cy.setupCart()
    cy.mockSettings()
    cy.mockCreateOrder(500, {
      body: {
        success: false,
        error: 'Internal server error'
      }
    })

    cy.visit('/pages/payment.html')
    cy.wait('@getSettings')
    cy.completeCheckout('pickup', 'cash')

    // Verificar que se muestra mensaje de error
    cy.on('window:alert', str => {
      expect(str).to.include('Error procesando el pago')
    })

    // Verificar que el botón se restaura
    cy.get('#process-payment-button').should('not.be.disabled')
  })

  it('confirmación de pago falla pero orden se crea', () => {
    cy.setupCart()
    cy.mockSettings()
    cy.mockCreateOrder(200)
    cy.mockConfirmPayment(12345, 500, {
      body: { success: false, message: 'Payment service unavailable' }
    })

    cy.visit('/pages/payment.html')
    cy.wait('@getSettings')
    cy.completeCheckout('pickup', 'cash')

    cy.wait('@createOrder')
    // A pesar del error en confirmación, la orden se creó y redirige
    cy.verifyOrderConfirmation(12345)
  })
})

// ============================================
// EJEMPLO 8: Recordar datos del cliente
// ============================================
describe('Ejemplo 8: Recordar datos del cliente', () => {
  it('guardar y cargar datos del cliente', () => {
    cy.clearCart()
    cy.setupCart()
    cy.mockCartPaymentApis()

    // Primera visita: llenar y guardar
    cy.visit('/pages/payment.html')
    cy.wait('@getSettings')

    cy.fillCustomerForm({
      name: 'Usuario Guardado',
      email: 'guardado@example.com',
      phone: '0414-9999999'
    })

    cy.get('#remember-me').check()
    cy.completeCheckout('pickup', 'cash')
    cy.wait('@createOrder')

    // Segunda visita: datos deben estar cargados
    cy.setupCart()
    cy.visit('/pages/payment.html')
    cy.wait('@getSettings')

    cy.get('#customer-name').should('have.value', 'Usuario Guardado')
    cy.get('#customer-email').should('have.value', 'guardado@example.com')
  })
})

// ============================================
// EJEMPLO 9: Responsive Testing
// ============================================
describe('Ejemplo 9: Responsive Testing', () => {
  const viewports = [
    { device: 'Mobile', width: 375, height: 667 },
    { device: 'Tablet', width: 768, height: 1024 },
    { device: 'Desktop', width: 1920, height: 1080 }
  ]

  viewports.forEach(({ device, width, height }) => {
    it(`debería verse correctamente en ${device}`, () => {
      cy.viewport(width, height)
      cy.setupCart()
      cy.mockSettings()
      cy.visit('/pages/cart.html')
      cy.wait('@getSettings')

      cy.get('.cart-item').should('be.visible')
      cy.get('#checkout-button').should('be.visible')
    })
  })
})

// ============================================
// EJEMPLO 10: Flujo completo end-to-end
// ============================================
describe('Ejemplo 10: Flujo E2E completo', () => {
  it('flujo completo: carrito → pago → confirmación', () => {
    // 1. Setup inicial
    cy.clearCart()
    cy.mockSettings()

    // 2. Agregar items al carrito
    cy.addToCart({
      id: 1,
      name: 'Rosas Premium',
      price_usd: 50.0,
      stock: 10,
      quantity: 2,
      image_thumb: '/images/rosas.jpg'
    })

    // 3. Visitar página de carrito
    cy.visit('/pages/cart.html')
    cy.wait('@getSettings')

    // 4. Verificar items en carrito
    cy.get('.cart-item').should('have.length', 1)
    cy.contains('Rosas Premium').should('exist')

    // 5. Seleccionar delivery
    cy.selectDeliveryMethod('delivery')
    cy.verifyCartSummary(2, 100.0, 105.0)

    // 6. Ir a checkout
    cy.get('#checkout-button').click()
    cy.url().should('include', '/pages/payment.html')

    // 7. Mock de APIs para pago
    cy.mockCreateOrder()
    cy.mockConfirmPayment()

    // 8. Completar formulario y pagar
    cy.fillCustomerForm()
    cy.selectPaymentMethod('cash')
    cy.get('#process-payment-button').click()

    // 9. Verificar creación de orden
    cy.wait('@createOrder')
      .its('request.body')
      .then(body => {
        expect(body.order.customer_name).to.equal('Juan Pérez')
        expect(body.order.total_amount_usd).to.equal(105.0)
        expect(body.items).to.have.length(1)
      })

    // 10. Verificar confirmación de pago
    cy.wait('@confirmPayment')

    // 11. Verificar redirección a confirmación
    cy.verifyOrderConfirmation(12345)

    // 12. Verificar que el carrito se limpió
    cy.window().then(win => {
      expect(win.localStorage.getItem('cart')).to.be.null
    })
  })
})
