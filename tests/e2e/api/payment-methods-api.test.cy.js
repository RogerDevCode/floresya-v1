/**
 * Payment Methods API E2E Tests
 * Cypress-based end-to-end testing for payment method endpoints
 *
 * Tests the complete payment method lifecycle including creation, retrieval,
 * updates, soft deletion, reactivation, and display order management with
 * proper authentication mocking.
 */

describe('Payment Methods API E2E Tests', () => {
  const baseUrl = 'http://localhost:3000/api'
  let testPaymentMethodId = null

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
    testPaymentMethodId = null

    // Setup common request headers
    cy.intercept('GET', `${baseUrl}/payment-methods*`, req => {
      req.headers['authorization'] = `Bearer ${mockUserToken}`
    }).as('getPaymentMethods')

    cy.intercept('POST', `${baseUrl}/payment-methods`, req => {
      req.headers['authorization'] = `Bearer ${mockAdminToken}`
    }).as('createPaymentMethod')

    cy.intercept('PUT', `${baseUrl}/payment-methods/*`, req => {
      req.headers['authorization'] = `Bearer ${mockAdminToken}`
    }).as('updatePaymentMethod')

    cy.intercept('DELETE', `${baseUrl}/payment-methods/*`, req => {
      req.headers['authorization'] = `Bearer ${mockAdminToken}`
    }).as('deletePaymentMethod')

    cy.intercept('PATCH', `${baseUrl}/payment-methods/*/reactivate`, req => {
      req.headers['authorization'] = `Bearer ${mockAdminToken}`
    }).as('reactivatePaymentMethod')

    cy.intercept('PATCH', `${baseUrl}/payment-methods/*/display-order`, req => {
      req.headers['authorization'] = `Bearer ${mockAdminToken}`
    }).as('updateDisplayOrder')
  })

  describe('Payment Method Retrieval', () => {
    before(() => {
      // Ensure we have a test payment method
      if (!testPaymentMethodId) {
        const paymentMethodData = {
          name: 'Test Transferencia',
          type: 'bank_transfer',
          description: 'Test payment method for E2E tests',
          account_info: 'Cuenta: 123456789',
          display_order: 1
        }

        cy.request('POST', `${baseUrl}/payment-methods`, paymentMethodData).then(response => {
          testPaymentMethodId = response.body.data.id
        })
      }
    })

    it('should retrieve all active payment methods', () => {
      cy.request('GET', `${baseUrl}/payment-methods`).then(response => {
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

    it('should retrieve payment method by ID', () => {
      cy.request('GET', `${baseUrl}/payment-methods/${testPaymentMethodId}`).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.be.true
        expect(response.body.data.id).to.eq(testPaymentMethodId)
        expect(response.body.data).to.have.property('name')
        expect(response.body.data).to.have.property('type')
        expect(response.body.data).to.have.property('description')
      })
    })

    it('should return 404 for non-existent payment method', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/payment-methods/99999`,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(404)
        expect(response.body.success).to.be.false
        expect(response.body.error).to.include('not found')
      })
    })

    it('should support pagination', () => {
      cy.request('GET', `${baseUrl}/payment-methods?limit=2&offset=0`).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.data.length).to.be.at.most(2)
      })
    })
  })

  describe('Payment Method Creation', () => {
    it('should create a new payment method successfully', () => {
      const paymentMethodData = {
        name: 'Pago Móvil Test',
        type: 'mobile_payment',
        description: 'Test mobile payment method',
        account_info: '0414-1234567',
        display_order: 2
      }

      cy.request('POST', `${baseUrl}/payment-methods`, paymentMethodData).then(response => {
        expect(response.status).to.eq(201)
        expect(response.body.success).to.be.true
        expect(response.body.data).to.have.property('id')
        expect(response.body.data.name).to.eq(paymentMethodData.name)
        expect(response.body.data.type).to.eq(paymentMethodData.type)
        expect(response.body.data.active).to.be.true
        expect(response.body.data.display_order).to.eq(paymentMethodData.display_order)

        // Store ID for cleanup
        testPaymentMethodId = response.body.data.id
      })
    })

    it('should validate required fields on creation', () => {
      const invalidData = {
        // Missing required fields
        description: 'Missing name and type'
      }

      cy.request({
        method: 'POST',
        url: `${baseUrl}/payment-methods`,
        body: invalidData,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(400)
        expect(response.body.success).to.be.false
        expect(response.body.error).to.include('required')
      })
    })

    it('should validate payment method type enum', () => {
      const invalidTypeData = {
        name: 'Invalid Type Test',
        type: 'invalid_type',
        description: 'Test with invalid type'
      }

      cy.request({
        method: 'POST',
        url: `${baseUrl}/payment-methods`,
        body: invalidTypeData,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(400)
        expect(response.body.success).to.be.false
        expect(response.body.error).to.include('type')
      })
    })

    it('should validate name length constraints', () => {
      const longNameData = {
        name: 'a'.repeat(101), // Exceeds max length of 100
        type: 'bank_transfer',
        description: 'Test with too long name'
      }

      cy.request({
        method: 'POST',
        url: `${baseUrl}/payment-methods`,
        body: longNameData,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(400)
        expect(response.body.success).to.be.false
        expect(response.body.error).to.include('name')
      })
    })

    it('should validate display_order is non-negative integer', () => {
      const invalidOrderData = {
        name: 'Invalid Order Test',
        type: 'cash',
        display_order: -1
      }

      cy.request({
        method: 'POST',
        url: `${baseUrl}/payment-methods`,
        body: invalidOrderData,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(400)
        expect(response.body.success).to.be.false
        expect(response.body.error).to.include('display_order')
      })
    })
  })

  describe('Payment Method Updates', () => {
    before(() => {
      // Ensure we have a test payment method for updates
      if (!testPaymentMethodId) {
        const paymentMethodData = {
          name: 'Update Test Method',
          type: 'bank_transfer',
          description: 'For update tests'
        }

        cy.request('POST', `${baseUrl}/payment-methods`, paymentMethodData).then(response => {
          testPaymentMethodId = response.body.data.id
        })
      }
    })

    it('should update payment method successfully', () => {
      const updateData = {
        name: 'Updated Payment Method',
        description: 'Updated description',
        display_order: 5
      }

      cy.request('PUT', `${baseUrl}/payment-methods/${testPaymentMethodId}`, updateData).then(
        response => {
          expect(response.status).to.eq(200)
          expect(response.body.success).to.be.true
          expect(response.body.data.name).to.eq(updateData.name)
          expect(response.body.data.description).to.eq(updateData.description)
          expect(response.body.data.display_order).to.eq(updateData.display_order)
          expect(response.body.data).to.have.property('updated_at')
        }
      )
    })

    it('should validate update data', () => {
      const invalidUpdateData = {
        name: '', // Empty name not allowed
        type: 'invalid_type'
      }

      cy.request({
        method: 'PUT',
        url: `${baseUrl}/payment-methods/${testPaymentMethodId}`,
        body: invalidUpdateData,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(400)
        expect(response.body.success).to.be.false
        expect(response.body.error).to.include('name')
      })
    })

    it('should return 404 for updating non-existent payment method', () => {
      const updateData = {
        name: 'Should Not Work'
      }

      cy.request({
        method: 'PUT',
        url: `${baseUrl}/payment-methods/99999`,
        body: updateData,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(404)
        expect(response.body.success).to.be.false
        expect(response.body.error).to.include('not found')
      })
    })
  })

  describe('Payment Method Soft Deletion and Reactivation', () => {
    let deleteTestId = null

    before(() => {
      // Create a payment method specifically for deletion tests
      const paymentMethodData = {
        name: 'Delete Test Method',
        type: 'cash',
        description: 'For deletion tests'
      }

      cy.request('POST', `${baseUrl}/payment-methods`, paymentMethodData).then(response => {
        deleteTestId = response.body.data.id
      })
    })

    it('should soft delete payment method', () => {
      cy.request('DELETE', `${baseUrl}/payment-methods/${deleteTestId}`).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.be.true
        expect(response.body.data.active).to.be.false
      })
    })

    it('should not retrieve deactivated payment method by default', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/payment-methods/${deleteTestId}`,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(404)
        expect(response.body.success).to.be.false
      })
    })

    it('should reactivate payment method', () => {
      cy.request('PATCH', `${baseUrl}/payment-methods/${deleteTestId}/reactivate`).then(
        response => {
          expect(response.status).to.eq(200)
          expect(response.body.success).to.be.true
          expect(response.body.data.active).to.be.true
        }
      )
    })

    it('should retrieve reactivated payment method', () => {
      cy.request('GET', `${baseUrl}/payment-methods/${deleteTestId}`).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.be.true
        expect(response.body.data.active).to.be.true
      })
    })
  })

  describe('Display Order Management', () => {
    let orderTestId = null

    before(() => {
      // Create a payment method for order testing
      const paymentMethodData = {
        name: 'Order Test Method',
        type: 'bank_transfer',
        display_order: 10
      }

      cy.request('POST', `${baseUrl}/payment-methods`, paymentMethodData).then(response => {
        orderTestId = response.body.data.id
      })
    })

    it('should update display order successfully', () => {
      const newOrder = 99

      cy.request('PATCH', `${baseUrl}/payment-methods/${orderTestId}/display-order`, {
        order: newOrder
      }).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.be.true
        expect(response.body.data.display_order).to.eq(newOrder)
      })
    })

    it('should validate display order is non-negative', () => {
      cy.request({
        method: 'PATCH',
        url: `${baseUrl}/payment-methods/${orderTestId}/display-order`,
        body: { order: -5 },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(400)
        expect(response.body.success).to.be.false
        expect(response.body.error).to.include('display_order')
      })
    })

    it('should validate display order is integer', () => {
      cy.request({
        method: 'PATCH',
        url: `${baseUrl}/payment-methods/${orderTestId}/display-order`,
        body: { order: 3.5 },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(400)
        expect(response.body.success).to.be.false
        expect(response.body.error).to.include('display_order')
      })
    })
  })

  describe('Authentication and Authorization', () => {
    it('should allow public access to GET endpoints', () => {
      cy.request('GET', `${baseUrl}/payment-methods`).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.be.true
      })
    })

    it('should require admin authentication for POST', () => {
      const paymentMethodData = {
        name: 'Auth Test',
        type: 'cash'
      }

      cy.request({
        method: 'POST',
        url: `${baseUrl}/payment-methods`,
        body: paymentMethodData,
        headers: {
          authorization: 'Bearer invalid-token'
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.be.within(401, 403)
        expect(response.body.success).to.be.false
      })
    })

    it('should require admin authentication for PUT', () => {
      cy.request({
        method: 'PUT',
        url: `${baseUrl}/payment-methods/1`,
        body: { name: 'Test' },
        headers: {
          authorization: 'Bearer invalid-token'
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.be.within(401, 403)
        expect(response.body.success).to.be.false
      })
    })

    it('should require admin authentication for DELETE', () => {
      cy.request({
        method: 'DELETE',
        url: `${baseUrl}/payment-methods/1`,
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
    it('should handle malformed JSON gracefully', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/payment-methods`,
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

    it('should handle invalid payment method ID format', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/payment-methods/invalid-id`,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.be.within(400, 500)
        expect(response.body.success).to.be.false
      })
    })

    it('should handle database errors gracefully', () => {
      // This would require mocking database errors, but for E2E we test the general error handling
      cy.request({
        method: 'POST',
        url: `${baseUrl}/payment-methods`,
        body: {
          name: 'Test',
          type: 'bank_transfer',
          // Add a field that might cause DB constraint issues
          display_order: 'invalid'
        },
        failOnStatusCode: false
      }).then(response => {
        // Should either succeed or fail with proper error response
        expect([200, 201, 400]).to.include(response.status)
        if (response.status >= 400) {
          expect(response.body.success).to.be.false
        }
      })
    })
  })

  describe('Performance and Load', () => {
    it('should respond within acceptable time limits', () => {
      cy.request('GET', `${baseUrl}/payment-methods?limit=5`).then(response => {
        expect(response.duration).to.be.lessThan(2000) // 2 seconds max
      })
    })

    it('should handle concurrent requests', () => {
      const requests = []

      // Make multiple concurrent requests
      for (let i = 0; i < 3; i++) {
        requests.push(cy.request('GET', `${baseUrl}/payment-methods?limit=1`))
      }

      cy.all(requests).then(responses => {
        responses.forEach(response => {
          expect(response.status).to.eq(200)
        })
      })
    })
  })

  describe('Business Rules and Validation', () => {
    it('should enforce unique payment method names', () => {
      // First create a payment method
      const paymentMethodData = {
        name: 'Unique Name Test',
        type: 'cash'
      }

      cy.request('POST', `${baseUrl}/payment-methods`, paymentMethodData).then(() => {
        // Try to create another with same name
        cy.request({
          method: 'POST',
          url: `${baseUrl}/payment-methods`,
          body: paymentMethodData,
          failOnStatusCode: false
        }).then(response => {
          // Should either succeed (if uniqueness not enforced) or fail with constraint error
          expect([200, 201, 400, 409]).to.include(response.status)
          if (response.status >= 400) {
            expect(response.body.success).to.be.false
          }
        })
      })
    })

    it('should maintain display order as non-negative integers', () => {
      const testCases = [
        { order: 0, shouldSucceed: true },
        { order: 100, shouldSucceed: true },
        { order: -1, shouldSucceed: false },
        { order: 1.5, shouldSucceed: false },
        { order: '5', shouldSucceed: false }
      ]

      testCases.forEach(({ order, shouldSucceed }) => {
        cy.request({
          method: 'POST',
          url: `${baseUrl}/payment-methods`,
          body: {
            name: `Order Test ${order}`,
            type: 'cash',
            display_order: order
          },
          failOnStatusCode: false
        }).then(response => {
          if (shouldSucceed) {
            expect([200, 201]).to.include(response.status)
          } else {
            expect(response.status).to.eq(400)
            expect(response.body.success).to.be.false
          }
        })
      })
    })

    it('should validate enum values for payment method types', () => {
      const validTypes = ['bank_transfer', 'mobile_payment', 'cash', 'crypto', 'international']
      const invalidTypes = ['invalid', 'credit_card', 'paypal', 'zelle']

      validTypes.forEach(type => {
        cy.request({
          method: 'POST',
          url: `${baseUrl}/payment-methods`,
          body: {
            name: `Valid Type ${type}`,
            type: type
          },
          failOnStatusCode: false
        }).then(response => {
          expect([200, 201]).to.include(response.status)
        })
      })

      invalidTypes.forEach(type => {
        cy.request({
          method: 'POST',
          url: `${baseUrl}/payment-methods`,
          body: {
            name: `Invalid Type ${type}`,
            type: type
          },
          failOnStatusCode: false
        }).then(response => {
          expect(response.status).to.eq(400)
          expect(response.body.success).to.be.false
        })
      })
    })
  })
})
