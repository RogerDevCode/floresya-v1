/**
 * Test Utilities
 * Helper functions for creating and cleaning up test data
 * Follows KISS, DRY, and SSOT principles
 */

import request from 'supertest'
import app from '../app.js'

/**
 * Creates a test user for integration tests
 * @returns {Object} Created user data
 */
export const createTestUser = async () => {
  const timestamp = Date.now()
  const testUser = {
    email: `testuser${timestamp}@example.com`,
    full_name: 'Test User',
    phone: `+569${timestamp.toString().slice(-8)}`,
    password_hash: 'TestPassword123!',
    role: 'user',
    email_verified: true
  }

  const adminToken = getAdminToken()
  const response = await request(app)
    .post('/api/users')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(testUser)

  if (response.status !== 201) {
    throw new Error(`Failed to create test user: ${response.body.error}`)
  }

  return response.body.data
}

/**
 * Deletes a test user
 * @param {number} userId - User ID to delete
 */
export const deleteTestUser = async userId => {
  const adminToken = process.env.TEST_ADMIN_TOKEN || 'dev-mock-token-admin-floresya'

  await request(app)
    .delete(`/api/users/${userId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200)
}

/**
 * Creates a test product for integration tests
 * @returns {Object} Created product data
 */
export const createTestProduct = async () => {
  const timestamp = Date.now()
  const testProduct = {
    product: {
      name: `Test Product ${timestamp}`,
      price_usd: 25.99,
      summary: 'Test product for integration tests',
      description: 'This is a test product created for integration testing',
      price_ves: 950.5,
      stock: 100,
      sku: `TEST${timestamp}`,
      featured: false
    }
  }

  const adminToken = process.env.TEST_ADMIN_TOKEN || 'dev-mock-token-admin-floresya'
  const response = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(testProduct)

  if (response.status !== 201) {
    console.error('Test product creation failed:', response.body)
    throw new Error(`Failed to create test product: ${response.body.error || response.text}`)
  }

  return response.body.data
}

/**
 * Deletes a test product
 * @param {number} productId - Product ID to delete
 */
export const deleteTestProduct = async productId => {
  const adminToken = process.env.TEST_ADMIN_TOKEN || 'dev-mock-token-admin-floresya'

  await request(app)
    .delete(`/api/products/${productId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200)
}

/**
 * Creates a test occasion for integration tests
 * @returns {Object} Created occasion data
 */
export const createTestOccasion = async () => {
  const timestamp = Date.now()
  const testOccasion = {
    name: `Test Occasion ${timestamp}`,
    description: 'Test occasion for integration tests',
    slug: `test-occasion-${timestamp}`,
    display_order: timestamp % 100
  }

  const adminToken = process.env.TEST_ADMIN_TOKEN || 'dev-mock-token-admin-floresya'
  const response = await request(app)
    .post('/api/occasions')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(testOccasion)

  if (response.status !== 201) {
    throw new Error(`Failed to create test occasion: ${response.body.error}`)
  }

  return response.body.data
}

/**
 * Deletes a test occasion
 * @param {number} occasionId - Occasion ID to delete
 */
export const deleteTestOccasion = async occasionId => {
  const adminToken = process.env.TEST_ADMIN_TOKEN || 'dev-mock-token-admin-floresya'

  await request(app)
    .delete(`/api/occasions/${occasionId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200)
}

/**
 * Creates a test order for integration tests
 * @param {number} userId - User ID for the order
 * @param {number} productId - Product ID for the order
 * @returns {Object} Created order data
 */
export const createTestOrder = async (userId, productId) => {
  const testOrder = {
    order: {
      user_id: userId,
      delivery_address: 'Test Address 123',
      delivery_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      delivery_time: '10:00',
      special_instructions: 'Handle with care',
      total_usd: 25.99,
      total_ves: 950.5
    },
    items: [
      {
        product_id: productId,
        quantity: 1,
        price_usd: 25.99,
        price_ves: 950.5
      }
    ]
  }

  const response = await request(app).post('/api/orders').send(testOrder)

  if (response.status !== 201) {
    throw new Error(`Failed to create test order: ${response.body.error}`)
  }

  return response.body.data
}

/**
 * Cancels a test order
 * @param {number} orderId - Order ID to cancel
 */
export const cancelTestOrder = async orderId => {
  const response = await request(app)
    .patch(`/api/orders/${orderId}/cancel`)
    .send({ notes: 'Cancelled by test cleanup' })

  if (response.status !== 200) {
    throw new Error(`Failed to cancel test order: ${response.body.error}`)
  }
}

/**
 * Creates a test payment method for integration tests
 * @returns {Object} Created payment method data
 */
export const createTestPaymentMethod = async () => {
  const timestamp = Date.now()
  const testPaymentMethod = {
    name: `Test Payment Method ${timestamp}`,
    type: 'bank_transfer',
    description: 'Test payment method for integration tests',
    account_info: `0123-4567-8901-${timestamp.toString().slice(-4)}`,
    display_order: timestamp % 100
  }

  const adminToken = process.env.TEST_ADMIN_TOKEN || 'dev-mock-token-admin-floresya'
  const response = await request(app)
    .post('/api/payment-methods')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(testPaymentMethod)

  if (response.status !== 201) {
    throw new Error(`Failed to create test payment method: ${response.body.error}`)
  }

  return response.body.data
}

/**
 * Deletes a test payment method
 * @param {number} paymentMethodId - Payment method ID to delete
 */
export const deleteTestPaymentMethod = async paymentMethodId => {
  const adminToken = process.env.TEST_ADMIN_TOKEN || 'dev-mock-token-admin-floresya'

  await request(app)
    .delete(`/api/payment-methods/${paymentMethodId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200)
}

/**
 * Creates a test product image for integration tests
 * @param {number} productId - Product ID for the image
 * @returns {Object} Created product image data
 */
export const createTestProductImage = async productId => {
  const timestamp = Date.now()
  const testProductImage = {
    product_id: productId,
    image_url: `https://example.com/test-image-${timestamp}.jpg`,
    alt_text: `Test image ${timestamp}`,
    display_order: 1,
    is_primary: true
  }

  const adminToken = process.env.TEST_ADMIN_TOKEN || 'dev-mock-token-admin-floresya'
  const response = await request(app)
    .post('/api/product-images')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(testProductImage)

  if (response.status !== 201) {
    throw new Error(`Failed to create test product image: ${response.body.error}`)
  }

  return response.body.data
}

/**
 * Deletes a test product image
 * @param {number} imageId - Product image ID to delete
 */
export const deleteTestProductImage = async imageId => {
  const adminToken = process.env.TEST_ADMIN_TOKEN || 'dev-mock-token-admin-floresya'

  await request(app)
    .delete(`/api/product-images/${imageId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200)
}

/**
 * Gets admin authentication token for tests
 * @returns {string} Admin token
 */
export const getAdminToken = () => {
  // Use the mock token defined in auth middleware for development
  return process.env.TEST_ADMIN_TOKEN || 'dev-mock-token-admin-floresya'
}

/**
 * Creates a complete test scenario with user, product, occasion, and order
 * @returns {Object} Test scenario data
 */
export const createTestScenario = async () => {
  try {
    // Create test entities
    const user = await createTestUser()
    const product = await createTestProduct()
    const occasion = await createTestOccasion()
    const order = await createTestOrder(user.id, product.id)

    return {
      user,
      product,
      occasion,
      order,
      cleanup: async () => {
        // Cleanup in reverse order
        try {
          if (order?.id) {
            await cancelTestOrder(order.id)
          }
          if (product?.id) {
            await deleteTestProduct(product.id)
          }
          if (occasion?.id) {
            await deleteTestOccasion(occasion.id)
          }
          if (user?.id) {
            await deleteTestUser(user.id)
          }
        } catch (error) {
          console.error('Error during test cleanup:', error)
        }
      }
    }
  } catch (error) {
    throw new Error(`Failed to create test scenario: ${error.message}`)
  }
}
