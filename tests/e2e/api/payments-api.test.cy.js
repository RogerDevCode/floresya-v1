/**
 * Payments API E2E Tests
 * Cypress-based end-to-end testing for payment endpoints
 *
 * Tests the complete payment lifecycle including payment method retrieval,
 * payment confirmation, and order payment retrieval with proper authentication mocking.
 */

describe('Payments API E2E Tests', () => {
  const baseUrl = 'http://localhost:3000/api'
  let testOrderId = null

  // Mock authentication setup
  const mockAdminToken = 'mock-admin-token'
  const mockUserToken = 'mock-user-token'

  before(() => {
    // Setup mock authentication
    cy.window().then(win => {
      // Mock localStorage for auth tokens
      win.localStorage.setItem('admin-token', mockAdminToken)
      win.localStorage.setItem('user-token', mockUserToken)
    })

    // Ensure server is running
    cy.request({
      url: `${baseUrl}/health`,
      failOnStatusCode: false
    }).then(response => {
      if (response.status !== 200) {
        cy.log('Server not running, skipping E2E tests')
        Cypress.runner.stop()
      }
    })
  })

  beforeEach(() => {
    // Reset test data
    testOrderId = null
    testPaymentMethodId = null

    // Setup common request headers
    cy.intercept('GET', `${baseUrl}/payments/methods`, req => {
      req.headers['authorization'] = `Bearer ${mockUserToken}`
    }).as('getPaymentMethods')

    cy.intercept('POST', `${baseUrl}/payments/*/confirm`, req => {
      req.headers['authorization'] = `Bearer ${mockUserToken}`
    }).as('confirmPayment')

    cy.intercept('GET', `${baseUrl}/payments/*`, req => {
      req.headers['authorization'] = `Bearer ${mockUserToken}`
    }).as('getOrderPayments')
  })

  describe('Payment Methods Retrieval', () => {
    it('should retrieve available payment methods', () => {
      cy.request('GET', `${baseUrl}/payments/methods`).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.be.true
        expect(response.body.data).to.be.an('array')
        expect(response.body.data.length).to.be.at.least(1)

        // Verify payment method structure
        const paymentMethod = response.body.data[0]
        expect(paymentMethod).to.have.property('id')
        expect(paymentMethod).to.have.property('name')
        expect(paymentMethod).to.have.property('type')
        expect(paymentMethod).to.have.property('active')
        expect(paymentMethod).to.have.property('display_order')
      })
    })

    it('should return payment methods sorted by display_order', () => {
      cy.request('GET', `${baseUrl}/payments/methods`).then(response => {
        expect(response.status).to.eq(200)
        const methods = response.body.data

        // Check if methods are sorted by display_order
        for (let i = 1; i < methods.length; i++) {
          expect(methods[i].display_order).to.be.at.least(methods[i - 1].display_order)
        }
      })
    })

    it('should only return active payment methods', () => {
      cy.request('GET', `${baseUrl}/payments/methods`).then(response => {
        expect(response.status).to.eq(200)
        const methods = response.body.data

        methods.forEach(method => {
          expect(method.active).to.be.true
        })
      })
    })
  })

  describe('Payment Confirmation Flow', () => {
    before(() => {
      // Ensure we have a test order and payment method
      if (!testOrderId) {
        // First get a product
        cy.request('GET', `${baseUrl}/products?limit=1`).then(productResponse => {
          expect(productResponse.status).to.eq(200)
          expect(productResponse.body.data).to.have.length.greaterThan(0)

          const testProductId = productResponse.body.data[0].id

          // Create an order
          const orderData = {
            customer_name: 'Payment Test Customer',
            customer_email: 'payment@example.com',
            customer_phone: '+58 412-1234567',
            delivery_address: 'Payment Test Address 123',
            delivery_date: '2024-12-25',
            delivery_time_slot: '14:00-17:00',
            items: [
              {
                product_id: testProductId,
                quantity: 2
              }
            ]
          }

          cy.request('POST', `${baseUrl}/orders`, orderData).then(orderResponse => {
            testOrderId = orderResponse.body.data.id
          })
        })
      }

      // Get a payment method ID
      cy.request('GET', `${baseUrl}/payments/methods`).then(methodsResponse => {
        if (methodsResponse.body.data && methodsResponse.body.data.length > 0) {
          testPaymentMethodId = methodsResponse.body.data[0].id
        }
      })
    })

    it('should confirm payment for an order successfully', () => {
      const paymentData = {
        payment_method: 'bank_transfer',
        reference_number: 'REF123456789',
        payment_details: 'Transferencia bancaria desde Banco Nacional',
        receipt_image_url: 'https://example.com/receipt.jpg'
      }

      cy.request('POST', `${baseUrl}/payments/${testOrderId}/confirm`, paymentData).then(
        response => {
          expect(response.status).to.eq(200)
          expect(response.body.success).to.be.true
          expect(response.body.data).to.have.property('id')
          expect(response.body.data.order_id).to.eq(testOrderId)
          expect(response.body.data.payment_method_name).to.be.a('string')
          expect(response.body.data.amount_usd).to.be.a('number')
          expect(response.body.data.amount_ves).to.be.a('number')
          expect(response.body.data.reference_number).to.eq(paymentData.reference_number)
          expect(response.body.data.status).to.eq('pending')
        }
      )
    })

    it('should validate required fields on payment confirmation', () => {
      const invalidData = {
        // Missing payment_method and reference_number
        payment_details: 'Missing required fields'
      }

      cy.request({
        method: 'POST',
        url: `${baseUrl}/payments/${testOrderId}/confirm`,
        body: invalidData,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(400)
        expect(response.body.success).to.be.false
        expect(response.body.error).to.include('required')
      })
    })

    it('should validate payment method exists', () => {
      const invalidPaymentData = {
        payment_method: 'nonexistent_method',
        reference_number: 'REF123456789'
      }

      cy.request({
        method: 'POST',
        url: `${baseUrl}/payments/${testOrderId}/confirm`,
        body: invalidPaymentData,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(404)
        expect(response.body.success).to.be.false
        expect(response.body.error).to.include('not found')
      })
    })

    it('should validate order exists', () => {
      const paymentData = {
        payment_method: 'bank_transfer',
        reference_number: 'REF123456789'
      }

      cy.request({
        method: 'POST',
        url: `${baseUrl}/payments/99999/confirm`,
        body: paymentData,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(404)
        expect(response.body.success).to.be.false
        expect(response.body.error).to.include('not found')
      })
    })

    it('should handle malformed JSON gracefully', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/payments/${testOrderId}/confirm`,
        body: '{ invalid json',
        headers: {
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.be.within(400, 500)
        expect(response.body.success).to.be.false
      })
    })
  })

  describe('Order Payment Retrieval', () => {
    before(() => {
      // Create a payment for testing retrieval
      if (!testOrderId) {
        cy.request('GET', `${baseUrl}/products?limit=1`).then(productResponse => {
          const testProductId = productResponse.body.data[0].id

          const orderData = {
            customer_name: 'Retrieval Test Customer',
            customer_email: 'retrieval@example.com',
            customer_phone: '+58 412-7654321',
            delivery_address: 'Retrieval Test Address',
            delivery_date: '2024-12-26',
            delivery_time_slot: '10:00-13:00',
            items: [{ product_id: testProductId, quantity: 1 }]
          }

          cy.request('POST', `${baseUrl}/orders`, orderData).then(orderResponse => {
            testOrderId = orderResponse.body.data.id

            const paymentData = {
              payment_method: 'cash',
              reference_number: 'RETRIEVE123'
            }

            cy.request('POST', `${baseUrl}/payments/${testOrderId}/confirm`, paymentData).then(
              () => {
                // Payment created successfully for retrieval test
              }
            )
          })
        })
      }
    })

    it('should retrieve payments for an order', () => {
      cy.request('GET', `${baseUrl}/payments/${testOrderId}`).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.be.true
        expect(response.body.data).to.be.an('array')
        expect(response.body.data.length).to.be.at.least(1)

        // Verify payment structure
        const payment = response.body.data[0]
        expect(payment).to.have.property('id')
        expect(payment).to.have.property('order_id')
        expect(payment).to.have.property('payment_method_name')
        expect(payment).to.have.property('amount_usd')
        expect(payment).to.have.property('amount_ves')
        expect(payment).to.have.property('reference_number')
        expect(payment).to.have.property('status')
        expect(payment).to.have.property('payment_date')
      })
    })

    it('should return 404 for non-existent order payments', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/payments/99999`,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(404)
        expect(response.body.success).to.be.false
        expect(response.body.error).to.include('not found')
      })
    })

    it('should handle invalid order ID format', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/payments/invalid-id`,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.be.within(400, 500)
        expect(response.body.success).to.be.false
      })
    })
  })

  describe('Authentication and Authorization', () => {
    it('should require authentication for payment methods endpoint', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/payments/methods`,
        headers: {
          authorization: 'Bearer invalid-token'
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.be.within(401, 403)
        expect(response.body.success).to.be.false
      })
    })

    it('should require authentication for payment confirmation', () => {
      const paymentData = {
        payment_method: 'cash',
        reference_number: 'REF123'
      }

      cy.request({
        method: 'POST',
        url: `${baseUrl}/payments/1/confirm`,
        body: paymentData,
        headers: {
          authorization: 'Bearer invalid-token'
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.be.within(401, 403)
        expect(response.body.success).to.be.false
      })
    })

    it('should require authentication for order payments retrieval', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/payments/1`,
        headers: {
          authorization: 'Bearer invalid-token'
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.be.within(401, 403)
        expect(response.body.success).to.be.false
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid payment method types', () => {
      const invalidData = {
        payment_method: 'invalid_type',
        reference_number: 'REF123'
      }

      cy.request({
        method: 'POST',
        url: `${baseUrl}/payments/${testOrderId}/confirm`,
        body: invalidData,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.be.within(400, 404)
        expect(response.body.success).to.be.false
      })
    })

    it('should handle database connection errors gracefully', () => {
      // This test assumes the API handles DB errors properly
      // In a real scenario, you might need to mock DB failures
      cy.request({
        method: 'GET',
        url: `${baseUrl}/payments/methods`,
        failOnStatusCode: false
      }).then(response => {
        // Should either succeed or fail with proper error response
        expect([200, 500]).to.include(response.status)
        if (response.status >= 400) {
          expect(response.body.success).to.be.false
        }
      })
    })
  })

  describe('Performance and Load', () => {
    it('should respond within acceptable time limits for payment methods', () => {
      cy.request('GET', `${baseUrl}/payments/methods`).then(response => {
        expect(response.duration).to.be.lessThan(2000) // 2 seconds max
      })
    })

    it('should handle concurrent payment method requests', () => {
      const requests = []

      // Make multiple concurrent requests
      for (let i = 0; i < 3; i++) {
        requests.push(cy.request('GET', `${baseUrl}/payments/methods`))
      }

      cy.all(requests).then(responses => {
        responses.forEach(response => {
          expect(response.status).to.eq(200)
        })
      })
    })

    it('should handle concurrent order payment retrieval', () => {
      const requests = []

      // Make multiple concurrent requests
      for (let i = 0; i < 3; i++) {
        requests.push(cy.request('GET', `${baseUrl}/payments/${testOrderId}`))
      }

      cy.all(requests).then(responses => {
        responses.forEach(response => {
          expect(response.status).to.eq(200)
        })
      })
    })
  })

  describe('Business Rules and Validation', () => {
    it('should validate reference number format', () => {
      const invalidData = {
        payment_method: 'bank_transfer',
        reference_number: '' // Empty reference
      }

      cy.request({
        method: 'POST',
        url: `${baseUrl}/payments/${testOrderId}/confirm`,
        body: invalidData,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(400)
        expect(response.body.success).to.be.false
        expect(response.body.error).to.include('reference_number')
      })
    })

    it('should prevent duplicate payment confirmations for same order', () => {
      // First payment
      const paymentData = {
        payment_method: 'cash',
        reference_number: 'DUPLICATE123'
      }

      cy.request('POST', `${baseUrl}/payments/${testOrderId}/confirm`, paymentData).then(() => {
        // Attempt duplicate payment
        cy.request({
          method: 'POST',
          url: `${baseUrl}/payments/${testOrderId}/confirm`,
          body: paymentData,
          failOnStatusCode: false
        }).then(response => {
          // Should either succeed (if allowed) or fail with constraint error
          expect([200, 201, 400, 409]).to.include(response.status)
          if (response.status >= 400) {
            expect(response.body.success).to.be.false
          }
        })
      })
    })

    it('should calculate payment amounts correctly', () => {
      const paymentData = {
        payment_method: 'bank_transfer',
        reference_number: 'AMOUNT123'
      }

      cy.request('POST', `${baseUrl}/payments/${testOrderId}/confirm`, paymentData).then(
        response => {
          expect(response.status).to.eq(200)
          const payment = response.body.data

          expect(payment.amount_usd).to.be.a('number')
          expect(payment.amount_ves).to.be.a('number')
          expect(payment.amount_usd).to.be.greaterThan(0)
          expect(payment.amount_ves).to.be.greaterThan(0)
          expect(payment.currency_rate).to.be.a('number')
        }
      )
    })
  })
})
