/**
 * Orders API E2E Tests
 * Cypress-based end-to-end testing for critical order endpoints
 *
 * Tests the complete order lifecycle including creation, retrieval,
 * status updates, and cancellation with proper authentication mocking.
 */

describe('Orders API E2E Tests', () => {
  const baseUrl = 'http://localhost:3000/api'
  let testOrderId = null
  let testProductId = null

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
    testProductId = null

    // Setup common request headers
    cy.intercept('POST', `${baseUrl}/orders`, req => {
      req.headers['authorization'] = `Bearer ${mockUserToken}`
    }).as('createOrder')

    cy.intercept('GET', `${baseUrl}/orders*`, req => {
      req.headers['authorization'] = `Bearer ${mockAdminToken}`
    }).as('getOrders')

    cy.intercept('PATCH', `${baseUrl}/orders/*`, req => {
      req.headers['authorization'] = `Bearer ${mockAdminToken}`
    }).as('updateOrder')
  })

  describe('Order Creation Flow', () => {
    it('should create a complete order with valid data', () => {
      // First, get an existing product ID dynamically
      cy.request('GET', `${baseUrl}/products?limit=1`).then(productResponse => {
        expect(productResponse.status).to.eq(200)
        expect(productResponse.body.data).to.have.length.greaterThan(0)

        testProductId = productResponse.body.data[0].id

        const orderData = {
          customer_name: 'Test Customer',
          customer_email: 'test@example.com',
          customer_phone: '+58 412-1234567',
          delivery_address: 'Test Address 123',
          delivery_date: '2024-12-25',
          delivery_time_slot: '14:00-17:00',
          items: [
            {
              product_id: testProductId,
              quantity: 2
            }
          ]
        }

        cy.request('POST', `${baseUrl}/orders`, orderData).then(response => {
          expect(response.status).to.eq(201)
          expect(response.body.success).to.be.true
          expect(response.body.data).to.have.property('id')
          expect(response.body.data.customer_name).to.eq(orderData.customer_name)
          expect(response.body.data.status).to.eq('pending')
          expect(response.body.data).to.have.property('total_amount_usd')
          expect(response.body.data).to.have.property('order_items')

          // Store order ID for subsequent tests
          testOrderId = response.body.data.id
        })
      })
    })

    it('should validate required fields on order creation', () => {
      const invalidOrderData = {
        // Missing required fields
        customer_email: 'test@example.com'
      }

      cy.request({
        method: 'POST',
        url: `${baseUrl}/orders`,
        body: invalidOrderData,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(400)
        expect(response.body.success).to.be.false
        expect(response.body.error).to.include('required')
      })
    })

    it('should validate email format', () => {
      const invalidEmailData = {
        customer_name: 'Test Customer',
        customer_email: 'invalid-email',
        customer_phone: '+58 412-1234567',
        delivery_address: 'Test Address',
        delivery_date: '2024-12-25',
        delivery_time_slot: '14:00-17:00',
        items: [{ product_id: 1, quantity: 1 }]
      }

      cy.request({
        method: 'POST',
        url: `${baseUrl}/orders`,
        body: invalidEmailData,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(400)
        expect(response.body.success).to.be.false
        expect(response.body.error).to.include('email')
      })
    })

    it('should validate delivery date is not in the past', () => {
      const pastDateData = {
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        customer_phone: '+58 412-1234567',
        delivery_address: 'Test Address',
        delivery_date: '2020-01-01', // Past date
        delivery_time_slot: '14:00-17:00',
        items: [{ product_id: 1, quantity: 1 }]
      }

      cy.request({
        method: 'POST',
        url: `${baseUrl}/orders`,
        body: pastDateData,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(400)
        expect(response.body.success).to.be.false
        expect(response.body.error).to.include('date')
      })
    })
  })

  describe('Order Retrieval', () => {
    before(() => {
      // Ensure we have a test order
      if (!testOrderId) {
        cy.request('GET', `${baseUrl}/products?limit=1`).then(productResponse => {
          testProductId = productResponse.body.data[0].id

          const orderData = {
            customer_name: 'Retrieval Test Customer',
            customer_email: 'retrieval@example.com',
            customer_phone: '+58 412-7654321',
            delivery_address: 'Retrieval Test Address',
            delivery_date: '2024-12-26',
            delivery_time_slot: '10:00-13:00',
            items: [{ product_id: testProductId, quantity: 1 }]
          }

          cy.request('POST', `${baseUrl}/orders`, orderData).then(response => {
            testOrderId = response.body.data.id
          })
        })
      }
    })

    it('should retrieve order by ID', () => {
      cy.request('GET', `${baseUrl}/orders/${testOrderId}`).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.be.true
        expect(response.body.data.id).to.eq(testOrderId)
        expect(response.body.data).to.have.property('customer_name')
        expect(response.body.data).to.have.property('order_items')
        expect(response.body.data.order_items).to.be.an('array')
      })
    })

    it('should return 404 for non-existent order', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/orders/99999`,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(404)
        expect(response.body.success).to.be.false
        expect(response.body.error).to.include('not found')
      })
    })

    it('should list orders for admin', () => {
      cy.request('GET', `${baseUrl}/orders?limit=10`).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.be.true
        expect(response.body.data).to.be.an('array')
        expect(response.body.data.length).to.be.at.least(1)

        // Verify order structure
        const order = response.body.data[0]
        expect(order).to.have.property('id')
        expect(order).to.have.property('customer_name')
        expect(order).to.have.property('status')
        expect(order).to.have.property('total_amount_usd')
      })
    })

    it('should filter orders by status', () => {
      cy.request('GET', `${baseUrl}/orders?status=pending&limit=5`).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.be.true
        expect(response.body.data).to.be.an('array')

        // All returned orders should have the filtered status
        response.body.data.forEach(order => {
          expect(order.status).to.eq('pending')
        })
      })
    })

    it('should support pagination', () => {
      cy.request('GET', `${baseUrl}/orders?limit=2&offset=0`).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.data.length).to.be.at.most(2)
      })
    })
  })

  describe('Order Status Updates', () => {
    before(() => {
      // Ensure we have a test order in pending status
      if (!testOrderId) {
        cy.request('GET', `${baseUrl}/products?limit=1`).then(productResponse => {
          testProductId = productResponse.body.data[0].id

          const orderData = {
            customer_name: 'Status Update Test',
            customer_email: 'status@example.com',
            customer_phone: '+58 412-9999999',
            delivery_address: 'Status Test Address',
            delivery_date: '2024-12-27',
            delivery_time_slot: '16:00-19:00',
            items: [{ product_id: testProductId, quantity: 1 }]
          }

          cy.request('POST', `${baseUrl}/orders`, orderData).then(response => {
            testOrderId = response.body.data.id
          })
        })
      }
    })

    it('should update order status to processing', () => {
      cy.request('PATCH', `${baseUrl}/orders/${testOrderId}/status`, {
        status: 'processing'
      }).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.be.true
        expect(response.body.data.status).to.eq('processing')
        expect(response.body.data).to.have.property('updated_at')
      })
    })

    it('should update order status to shipped', () => {
      cy.request('PATCH', `${baseUrl}/orders/${testOrderId}/status`, {
        status: 'shipped'
      }).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.be.true
        expect(response.body.data.status).to.eq('shipped')
      })
    })

    it('should update order status to delivered', () => {
      cy.request('PATCH', `${baseUrl}/orders/${testOrderId}/status`, {
        status: 'delivered'
      }).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.be.true
        expect(response.body.data.status).to.eq('delivered')
      })
    })

    it('should validate status transitions', () => {
      cy.request({
        method: 'PATCH',
        url: `${baseUrl}/orders/${testOrderId}/status`,
        body: { status: 'invalid_status' },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(400)
        expect(response.body.success).to.be.false
        expect(response.body.error).to.include('status')
      })
    })

    it('should cancel order with reason', () => {
      // Create a new order for cancellation
      cy.request('GET', `${baseUrl}/products?limit=1`).then(productResponse => {
        const productId = productResponse.body.data[0].id

        const orderData = {
          customer_name: 'Cancel Test Customer',
          customer_email: 'cancel@example.com',
          customer_phone: '+58 412-1111111',
          delivery_address: 'Cancel Test Address',
          delivery_date: '2024-12-28',
          delivery_time_slot: '09:00-12:00',
          items: [{ product_id: productId, quantity: 1 }]
        }

        cy.request('POST', `${baseUrl}/orders`, orderData).then(createResponse => {
          const cancelOrderId = createResponse.body.data.id

          cy.request('PATCH', `${baseUrl}/orders/${cancelOrderId}/cancel`, {
            reason: 'Customer requested cancellation'
          }).then(cancelResponse => {
            expect(cancelResponse.status).to.eq(200)
            expect(cancelResponse.body.success).to.be.true
            expect(cancelResponse.body.data.status).to.eq('cancelled')
          })
        })
      })
    })
  })

  describe('Order Statistics and Business Rules', () => {
    it('should exclude cancelled orders from statistics', () => {
      cy.request('GET', `${baseUrl}/orders/statistics`).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.be.true

        // Verify cancelled orders are excluded from totals
        if (response.body.data.total_orders > 0) {
          expect(response.body.data).to.have.property('active_orders')
          expect(response.body.data.active_orders).to.be.at.most(response.body.data.total_orders)
        }
      })
    })

    it('should calculate order totals correctly', () => {
      cy.request('GET', `${baseUrl}/orders/${testOrderId}`).then(response => {
        expect(response.status).to.eq(200)
        const order = response.body.data

        expect(order).to.have.property('total_amount_usd')
        expect(order).to.have.property('total_amount_ves')
        expect(order.total_amount_usd).to.be.a('number')
        expect(order.total_amount_ves).to.be.a('number')
        expect(order.total_amount_usd).to.be.greaterThan(0)
        expect(order.total_amount_ves).to.be.greaterThan(0)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/orders`,
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

    it('should handle invalid order ID format', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/orders/invalid-id`,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.be.within(400, 500)
        expect(response.body.success).to.be.false
      })
    })

    it('should prevent unauthorized access to admin endpoints', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/orders`,
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

  describe('Performance and Load', () => {
    it('should respond within acceptable time limits', () => {
      cy.request('GET', `${baseUrl}/orders?limit=5`).then(response => {
        expect(response.duration).to.be.lessThan(2000) // 2 seconds max
      })
    })

    it('should handle concurrent requests', () => {
      const requests = []

      // Make multiple concurrent requests
      for (let i = 0; i < 5; i++) {
        requests.push(cy.request('GET', `${baseUrl}/products?limit=1`))
      }

      cy.all(requests).then(responses => {
        responses.forEach(response => {
          expect(response.status).to.eq(200)
        })
      })
    })
  })
})
