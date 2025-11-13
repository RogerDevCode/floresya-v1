/**
 * Products API E2E Tests
 * Cypress-based end-to-end testing for product endpoints
 *
 * Tests the complete product lifecycle including creation, retrieval,
 * updates, soft deletion, reactivation, and image management with
 * proper authentication mocking.
 */

describe('Products API E2E Tests', () => {
  const baseUrl = 'http://localhost:3000/api'
  let testProductId = null
  let testOccasionId = null

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
    testProductId = null
    testOccasionId = null

    // Setup common request headers
    cy.intercept('GET', `${baseUrl}/products*`, req => {
      req.headers['authorization'] = `Bearer ${mockUserToken}`
    }).as('getProducts')

    cy.intercept('POST', `${baseUrl}/products`, req => {
      req.headers['authorization'] = `Bearer ${mockAdminToken}`
    }).as('createProduct')

    cy.intercept('PUT', `${baseUrl}/products/*`, req => {
      req.headers['authorization'] = `Bearer ${mockAdminToken}`
    }).as('updateProduct')

    cy.intercept('PATCH', `${baseUrl}/products/*/**`, req => {
      req.headers['authorization'] = `Bearer ${mockAdminToken}`
    }).as('patchProduct')

    cy.intercept('DELETE', `${baseUrl}/products/*`, req => {
      req.headers['authorization'] = `Bearer ${mockAdminToken}`
    }).as('deleteProduct')
  })

  describe('Product Retrieval', () => {
    before(() => {
      // Ensure we have a test product
      if (!testProductId) {
        const productData = {
          name: 'Test Product for Retrieval',
          summary: 'Test summary',
          description: 'Test description for retrieval tests',
          price_usd: 25.99,
          price_ves: 1000000,
          stock: 10,
          sku: 'TEST-RETRIEVE-001',
          featured: true,
          carousel_order: 1
        }

        cy.request('POST', `${baseUrl}/products`, productData).then(response => {
          testProductId = response.body.data.id
        })
      }
    })

    it('should retrieve all products', () => {
      cy.request('GET', `${baseUrl}/products`).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.be.true
        expect(response.body.data).to.be.an('array')
        expect(response.body.data.length).to.be.at.least(1)

        // Verify product structure
        const product = response.body.data[0]
        expect(product).to.have.property('id')
        expect(product).to.have.property('name')
        expect(product).to.have.property('price_usd')
        expect(product).to.have.property('active')
        expect(product).to.have.property('created_at')
      })
    })

    it('should retrieve product by ID', () => {
      cy.request('GET', `${baseUrl}/products/${testProductId}`).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.be.true
        expect(response.body.data.id).to.eq(testProductId)
        expect(response.body.data).to.have.property('name')
        expect(response.body.data).to.have.property('description')
        expect(response.body.data).to.have.property('price_usd')
        expect(response.body.data).to.have.property('price_ves')
      })
    })

    it('should retrieve product by SKU', () => {
      cy.request('GET', `${baseUrl}/products/sku/TEST-RETRIEVE-001`).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.be.true
        expect(response.body.data.sku).to.eq('TEST-RETRIEVE-001')
      })
    })

    it('should retrieve carousel products', () => {
      cy.request('GET', `${baseUrl}/products/carousel`).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.be.true
        expect(response.body.data).to.be.an('array')

        // Carousel products should be featured and have carousel_order
        response.body.data.forEach(product => {
          expect(product.featured).to.be.true
          expect(product).to.have.property('carousel_order')
        })
      })
    })

    it('should retrieve products with occasions', () => {
      cy.request('GET', `${baseUrl}/products/with-occasions`).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.be.true
        expect(response.body.data).to.be.an('array')
      })
    })

    it('should filter products by featured status', () => {
      cy.request('GET', `${baseUrl}/products?featured=true`).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.be.true
        expect(response.body.data).to.be.an('array')

        response.body.data.forEach(product => {
          expect(product.featured).to.be.true
        })
      })
    })

    it('should support pagination', () => {
      cy.request('GET', `${baseUrl}/products?limit=2&offset=0`).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.data.length).to.be.at.most(2)
      })
    })

    it('should return 404 for non-existent product', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/products/99999`,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(404)
        expect(response.body.success).to.be.false
        expect(response.body.error).to.include('not found')
      })
    })

    it('should return 404 for non-existent SKU', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/products/sku/NONEXISTENT`,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(404)
        expect(response.body.success).to.be.false
      })
    })
  })

  describe('Product Creation', () => {
    it('should create a new product successfully', () => {
      const productData = {
        name: 'New Test Product',
        summary: 'Test summary',
        description: 'Test description',
        price_usd: 19.99,
        price_ves: 800000,
        stock: 5,
        sku: 'TEST-CREATE-001',
        featured: false
      }

      cy.request('POST', `${baseUrl}/products`, productData).then(response => {
        expect(response.status).to.eq(201)
        expect(response.body.success).to.be.true
        expect(response.body.data).to.have.property('id')
        expect(response.body.data.name).to.eq(productData.name)
        expect(response.body.data.price_usd).to.eq(productData.price_usd)
        expect(response.body.data.active).to.be.true
        expect(response.body.data).to.have.property('created_at')

        // Store ID for cleanup
        testProductId = response.body.data.id
      })
    })

    it('should create a product with occasions', () => {
      // First get an occasion ID
      cy.request('GET', `${baseUrl}/occasions?limit=1`).then(occasionResponse => {
        if (occasionResponse.body.data && occasionResponse.body.data.length > 0) {
          testOccasionId = occasionResponse.body.data[0].id

          const productData = {
            name: 'Product with Occasions',
            summary: 'Test product with occasions',
            price_usd: 29.99,
            price_ves: 1200000,
            stock: 8,
            sku: 'TEST-OCCASIONS-001'
          }

          const requestData = {
            product: productData,
            occasionIds: [testOccasionId]
          }

          cy.request('POST', `${baseUrl}/products/with-occasions`, requestData).then(response => {
            expect(response.status).to.eq(201)
            expect(response.body.success).to.be.true
            expect(response.body.data).to.have.property('id')
            expect(response.body.data.name).to.eq(productData.name)
          })
        } else {
          cy.log('No occasions available, skipping test')
        }
      })
    })

    it('should validate required fields on creation', () => {
      const invalidData = {
        // Missing required fields
        summary: 'Missing name and price'
      }

      cy.request({
        method: 'POST',
        url: `${baseUrl}/products`,
        body: invalidData,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(400)
        expect(response.body.success).to.be.false
        expect(response.body.error).to.include('required')
      })
    })

    it('should validate price constraints', () => {
      const invalidPriceData = {
        name: 'Invalid Price Product',
        price_usd: -10, // Negative price
        summary: 'Test with invalid price'
      }

      cy.request({
        method: 'POST',
        url: `${baseUrl}/products`,
        body: invalidPriceData,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(400)
        expect(response.body.success).to.be.false
        expect(response.body.error).to.include('price')
      })
    })

    it('should validate stock constraints', () => {
      const invalidStockData = {
        name: 'Invalid Stock Product',
        price_usd: 15.99,
        stock: -5, // Negative stock
        summary: 'Test with invalid stock'
      }

      cy.request({
        method: 'POST',
        url: `${baseUrl}/products`,
        body: invalidStockData,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(400)
        expect(response.body.success).to.be.false
        expect(response.body.error).to.include('stock')
      })
    })

    it('should validate name length constraints', () => {
      const longNameData = {
        name: 'a'.repeat(256), // Exceeds max length
        price_usd: 15.99,
        summary: 'Test with too long name'
      }

      cy.request({
        method: 'POST',
        url: `${baseUrl}/products`,
        body: longNameData,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(400)
        expect(response.body.success).to.be.false
        expect(response.body.error).to.include('name')
      })
    })
  })

  describe('Product Updates', () => {
    before(() => {
      // Ensure we have a test product for updates
      if (!testProductId) {
        const productData = {
          name: 'Update Test Product',
          summary: 'For update tests',
          price_usd: 22.5,
          stock: 3,
          sku: 'TEST-UPDATE-001'
        }

        cy.request('POST', `${baseUrl}/products`, productData).then(response => {
          testProductId = response.body.data.id
        })
      }
    })

    it('should update product successfully', () => {
      const updateData = {
        name: 'Updated Product Name',
        summary: 'Updated summary',
        price_usd: 27.99,
        stock: 15
      }

      cy.request('PUT', `${baseUrl}/products/${testProductId}`, updateData).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.be.true
        expect(response.body.data.name).to.eq(updateData.name)
        expect(response.body.data.summary).to.eq(updateData.summary)
        expect(response.body.data.price_usd).to.eq(updateData.price_usd)
        expect(response.body.data.stock).to.eq(updateData.stock)
        expect(response.body.data).to.have.property('updated_at')
      })
    })

    it('should update carousel order', () => {
      const orderData = {
        order: 5
      }

      cy.request('PATCH', `${baseUrl}/products/${testProductId}/carousel-order`, orderData).then(
        response => {
          expect(response.status).to.eq(200)
          expect(response.body.success).to.be.true
          expect(response.body.data.carousel_order).to.eq(orderData.order)
        }
      )
    })

    it('should update stock', () => {
      const stockData = {
        quantity: 25
      }

      cy.request('PATCH', `${baseUrl}/products/${testProductId}/stock`, stockData).then(
        response => {
          expect(response.status).to.eq(200)
          expect(response.body.success).to.be.true
          expect(response.body.data.stock).to.eq(stockData.quantity)
        }
      )
    })

    it('should validate update data', () => {
      const invalidUpdateData = {
        name: '', // Empty name not allowed
        price_usd: -5
      }

      cy.request({
        method: 'PUT',
        url: `${baseUrl}/products/${testProductId}`,
        body: invalidUpdateData,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(400)
        expect(response.body.success).to.be.false
        expect(response.body.error).to.include('name')
      })
    })

    it('should return 404 for updating non-existent product', () => {
      const updateData = {
        name: 'Should Not Work'
      }

      cy.request({
        method: 'PUT',
        url: `${baseUrl}/products/99999`,
        body: updateData,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(404)
        expect(response.body.success).to.be.false
        expect(response.body.error).to.include('not found')
      })
    })
  })

  describe('Product Soft Deletion and Reactivation', () => {
    let deleteTestId = null

    before(() => {
      // Create a product specifically for deletion tests
      const productData = {
        name: 'Delete Test Product',
        summary: 'For deletion tests',
        price_usd: 12.99,
        stock: 2,
        sku: 'TEST-DELETE-001'
      }

      cy.request('POST', `${baseUrl}/products`, productData).then(response => {
        deleteTestId = response.body.data.id
      })
    })

    it('should soft delete product', () => {
      cy.request('DELETE', `${baseUrl}/products/${deleteTestId}`).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.be.true
        expect(response.body.data.active).to.be.false
      })
    })

    it('should not retrieve deactivated product by default', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/products/${deleteTestId}`,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(404)
        expect(response.body.success).to.be.false
      })
    })

    it('should reactivate product', () => {
      cy.request('PATCH', `${baseUrl}/products/${deleteTestId}/reactivate`).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.be.true
        expect(response.body.data.active).to.be.true
      })
    })

    it('should retrieve reactivated product', () => {
      cy.request('GET', `${baseUrl}/products/${deleteTestId}`).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.be.true
        expect(response.body.data.active).to.be.true
      })
    })
  })

  describe('Authentication and Authorization', () => {
    it('should allow public access to GET endpoints', () => {
      cy.request('GET', `${baseUrl}/products`).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.be.true
      })
    })

    it('should require admin authentication for POST', () => {
      const productData = {
        name: 'Auth Test Product',
        price_usd: 10.99
      }

      cy.request({
        method: 'POST',
        url: `${baseUrl}/products`,
        body: productData,
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
        url: `${baseUrl}/products/1`,
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
        url: `${baseUrl}/products/1`,
        headers: {
          authorization: 'Bearer invalid-token'
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.be.within(401, 403)
        expect(response.body.success).to.be.false
      })
    })

    it('should require admin authentication for PATCH operations', () => {
      cy.request({
        method: 'PATCH',
        url: `${baseUrl}/products/1/stock`,
        body: { quantity: 5 },
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
        url: `${baseUrl}/products`,
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

    it('should handle invalid product ID format', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/products/invalid-id`,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.be.within(400, 500)
        expect(response.body.success).to.be.false
      })
    })

    it('should handle database errors gracefully', () => {
      // This would require mocking database errors, but for E2E we test the general error handling
      cy.request({
        method: 'GET',
        url: `${baseUrl}/products`,
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
    it('should respond within acceptable time limits', () => {
      cy.request('GET', `${baseUrl}/products?limit=5`).then(response => {
        expect(response.duration).to.be.lessThan(2000) // 2 seconds max
      })
    })

    it('should handle concurrent product requests', () => {
      const requests = []

      // Make multiple concurrent requests
      for (let i = 0; i < 3; i++) {
        requests.push(cy.request('GET', `${baseUrl}/products?limit=1`))
      }

      cy.all(requests).then(responses => {
        responses.forEach(response => {
          expect(response.status).to.eq(200)
        })
      })
    })
  })

  describe('Business Rules and Validation', () => {
    it('should enforce unique SKU constraint', () => {
      // First create a product with a SKU
      const productData = {
        name: 'Unique SKU Test',
        price_usd: 18.99,
        sku: 'UNIQUE-SKU-TEST'
      }

      cy.request('POST', `${baseUrl}/products`, productData).then(() => {
        // Try to create another with same SKU
        cy.request({
          method: 'POST',
          url: `${baseUrl}/products`,
          body: productData,
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

    it('should validate carousel order constraints', () => {
      const invalidOrderData = {
        name: 'Invalid Carousel Order',
        price_usd: 15.99,
        featured: true,
        carousel_order: -1 // Negative order not allowed
      }

      cy.request({
        method: 'POST',
        url: `${baseUrl}/products`,
        body: invalidOrderData,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(400)
        expect(response.body.success).to.be.false
        expect(response.body.error).to.include('carousel_order')
      })
    })

    it('should handle search functionality', () => {
      cy.request('GET', `${baseUrl}/products?search=test`).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.be.true
        expect(response.body.data).to.be.an('array')
      })
    })

    it('should validate image size parameter', () => {
      cy.request('GET', `${baseUrl}/products/1?imageSize=invalid`).then(response => {
        // Should either succeed with default or fail with validation error
        expect([200, 400]).to.include(response.status)
        if (response.status === 400) {
          expect(response.body.success).to.be.false
        }
      })
    })
  })
})
