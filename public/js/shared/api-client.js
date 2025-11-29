/**
 * FloresYa API Client
 * Auto-generated from OpenAPI specification
 * Generated: 2025-11-29T13:28:25.480Z
 * Spec Version: 1.0.0
 * Total Endpoints: 65
 *
 * IMPORTANT: This file is AUTO-GENERATED. Do not edit manually.
 * Regenerate using: npm run generate:client
 */

class ApiClient {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    }
  }

  /**
   * Make HTTP request with error handling
   * @param {string} endpoint - API endpoint
   * @param {object} options - Fetch options
   * @returns {Promise<any>} Response data
   */
  async request(endpoint, options = {}) {
    try {
      const url = this.baseUrl + endpoint
      const config = {
        method: options.method || 'GET',
        headers: { ...this.defaultHeaders, ...options.headers }
      }

      if (options.body && options.method !== 'GET') {
        config.body = JSON.stringify(options.body)
      }

      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      }

      return await response.text()
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // ==================== AUTO-GENERATED METHODS ====================

  /**
   * Get all error codes
   * Returns complete list of ERROR_CODES with descriptions and categories
   * @returns {Promise<any>} API response
   */
  getAllErrors() {
    const endpoint = `/api/errors`
    return this.request(endpoint)
  }

  /**
   * Get all products with filters
   * Returns paginated list of active products with optional filters (uses indexed columns for performance)
   * @param {any} params - Parameter
   * @returns {Promise<any>} API response
   */
  getAllProducts(params = {}) {
    const queryString = new URLSearchParams()
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryString.append(key, value.toString())
      }
    })
    const query = queryString.toString()
    const queryPart = query ? '?' + query : ''
    const endpoint = `/api/products${queryPart}`
    return this.request(endpoint)
  }

  /**
   * Create new product
   * Admin only - Creates a new product
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  createProducts(data) {
    const endpoint = `/api/products`
    return this.request(endpoint, { method: 'POST', body: data })
  }

  /**
   * Get product by ID
   * @param {any} id - Parameter
   * @param {any} params - Parameter
   * @returns {Promise<any>} API response
   */
  getProductsById(id, params = {}) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const queryString = new URLSearchParams()
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryString.append(key, value.toString())
      }
    })
    const query = queryString.toString()
    const queryPart = query ? '?' + query : ''
    const endpoint = `/api/products/${id}${queryPart}`
    return this.request(endpoint)
  }

  /**
   * Update product
   * Admin only - Updates an existing product
   * @param {any} id - Parameter
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  updateProducts(id, data) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/products/${id}`
    return this.request(endpoint, { method: 'PUT', body: data })
  }

  /**
   * Delete product (soft delete)
   * Admin only - Soft deletes a product (sets active to false)
   * @param {any} id - Parameter
   * @returns {Promise<any>} API response
   */
  deleteProducts(id) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/products/${id}`
    return this.request(endpoint, { method: 'DELETE' })
  }

  /**
   * Get carousel products
   * Returns featured products for carousel display (ordered by carousel_order)
   * @returns {Promise<any>} API response
   */
  getAllCarouselProducts() {
    const endpoint = `/api/products/carousel`
    return this.request(endpoint)
  }

  /**
   * Get products with occasions
   * Returns products with their associated occasions
   * @param {any} params - Parameter
   * @returns {Promise<any>} API response
   */
  getProductsWithOccasions(params = {}) {
    const queryString = new URLSearchParams()
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryString.append(key, value.toString())
      }
    })
    const query = queryString.toString()
    const queryPart = query ? '?' + query : ''
    const endpoint = `/api/products/with-occasions${queryPart}`
    return this.request(endpoint)
  }

  /**
   * Create product with occasions
   * Admin only - Creates a new product with associated occasions
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  createProductsWithOccasions(data) {
    const endpoint = `/api/products/with-occasions`
    return this.request(endpoint, { method: 'POST', body: data })
  }

  /**
   * Get products by occasion
   * @param {any} occasionId - Parameter
   * @returns {Promise<any>} API response
   */
  getProductsByOccasion(occasionId) {
    if (!occasionId || occasionId <= 0) {
      throw new Error('Invalid occasionId')
    }

    const endpoint = `/api/products/occasion/${occasionId}`
    return this.request(endpoint)
  }

  /**
   * Get product by SKU
   * @param {any} sku - Parameter
   * @returns {Promise<any>} API response
   */
  getAllSku(sku) {
    if (!sku) {
      throw new Error('sku is required')
    }

    const endpoint = `/api/products/sku/${sku}`
    return this.request(endpoint)
  }

  /**
   * Get primary image for product
   * @param {any} id - Parameter
   * @returns {Promise<any>} API response
   */
  getPrimaryImage(id) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/products/${id}/images/primary`
    return this.request(endpoint)
  }

  /**
   * Get all images for product
   * @param {any} id - Parameter
   * @param {any} params - Parameter
   * @returns {Promise<any>} API response
   */
  getProductImages(id, params = {}) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const queryString = new URLSearchParams()
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryString.append(key, value.toString())
      }
    })
    const query = queryString.toString()
    const queryPart = query ? '?' + query : ''
    const endpoint = `/api/products/${id}/images${queryPart}`
    return this.request(endpoint)
  }

  /**
   * Upload product images
   * Admin only - Uploads new images for a product (creates all sizes)
   * @param {any} id - Parameter
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  uploadProductImages(id, data) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/products/${id}/images`
    return this.request(endpoint, { method: 'POST', body: data })
  }

  /**
   * Update product carousel order
   * Admin only - Updates the carousel display order for a product
   * @param {any} id - Parameter
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  updateCarouselProducts(id, data) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/products/${id}/carousel-order`
    return this.request(endpoint, { method: 'PATCH', body: data })
  }

  /**
   * Update product stock
   * Admin only - Updates the stock quantity for a product
   * @param {any} id - Parameter
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  updateStock(id, data) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/products/${id}/stock`
    return this.request(endpoint, { method: 'PATCH', body: data })
  }

  /**
   * Delete product images by index
   * Admin only - Deletes all sizes of a specific image index
   * @param {any} id - Parameter
   * @param {any} imageIndex - Parameter
   * @returns {Promise<any>} API response
   */
  deleteProductImage(id, imageIndex) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }
    if (!imageIndex) {
      throw new Error('imageIndex is required')
    }

    const endpoint = `/api/products/${id}/images/${imageIndex}`
    return this.request(endpoint, { method: 'DELETE' })
  }

  /**
   * Set primary image
   * Admin only - Sets a specific image index as the primary image
   * @param {any} id - Parameter
   * @param {any} imageIndex - Parameter
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  updatePrimaryImage(id, imageIndex, data) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }
    if (!imageIndex) {
      throw new Error('imageIndex is required')
    }

    const endpoint = `/api/products/${id}/images/primary/${imageIndex}`
    return this.request(endpoint, { method: 'PATCH', body: data })
  }

  /**
   * Get occasions for a product
   * Admin only - Get all occasions associated with a product
   * @param {any} id - Parameter
   * @returns {Promise<any>} API response
   */
  getProductOccasions(id) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/products/${id}/occasions`
    return this.request(endpoint)
  }

  /**
   * Replace product occasions
   * Admin only - Atomically replace all occasions for a product (transactional)
   * @param {any} id - Parameter
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  updateProductOccasions(id, data) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/products/${id}/occasions`
    return this.request(endpoint, { method: 'PUT', body: data })
  }

  /**
   * Link occasion to product
   * Admin only - Link a single occasion to a product
   * @param {any} id - Parameter
   * @param {any} occasionId - Parameter
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  createProductOccasion(id, occasionId, data) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }
    if (!occasionId || occasionId <= 0) {
      throw new Error('Invalid occasionId')
    }

    const endpoint = `/api/products/${id}/occasions/${occasionId}`
    return this.request(endpoint, { method: 'POST', body: data })
  }

  /**
   * Reactivate product
   * Admin only - Reactivates a soft-deleted product
   * @param {any} id - Parameter
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  reactivateProducts(id, data) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/products/${id}/reactivate`
    return this.request(endpoint, { method: 'PATCH', body: data })
  }

  /**
   * Get all orders with filters
   * Admin only - Returns paginated list of orders with optional filters (uses indexed columns for performance)
   * @param {any} params - Parameter
   * @returns {Promise<any>} API response
   */
  getAllOrders(params = {}) {
    const queryString = new URLSearchParams()
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryString.append(key, value.toString())
      }
    })
    const query = queryString.toString()
    const queryPart = query ? '?' + query : ''
    const endpoint = `/api/orders${queryPart}`
    return this.request(endpoint)
  }

  /**
   * Create new order
   * Create a new order (public endpoint for checkout process)
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  createOrders(data) {
    const endpoint = `/api/orders`
    return this.request(endpoint, { method: 'POST', body: data })
  }

  /**
   * Get order by ID
   * Get order details by ID (owner or admin only)
   * @param {any} id - Parameter
   * @returns {Promise<any>} API response
   */
  getOrdersById(id) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/orders/${id}`
    return this.request(endpoint)
  }

  /**
   * Update order
   * Update order details (owner or admin, limited fields)
   * @param {any} id - Parameter
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  updateOrders(id, data) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/orders/${id}`
    return this.request(endpoint, { method: 'PUT', body: data })
  }

  /**
   * Get orders by user
   * Get all orders for a specific user (owner or admin only)
   * @param {any} userId - Parameter
   * @returns {Promise<any>} API response
   */
  getOrdersByUser(userId) {
    if (!userId || userId <= 0) {
      throw new Error('Invalid userId')
    }

    const endpoint = `/api/orders/user/${userId}`
    return this.request(endpoint)
  }

  /**
   * Get order status history
   * Get the complete status change history for an order
   * @param {any} id - Parameter
   * @returns {Promise<any>} API response
   */
  getOrdersStatusHistory(id) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/orders/${id}/status-history`
    return this.request(endpoint)
  }

  /**
   * Update order status
   * Admin only - Update order status with optional notes
   * @param {any} id - Parameter
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  updateOrdersStatus(id, data) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/orders/${id}/status`
    return this.request(endpoint, { method: 'PATCH', body: data })
  }

  /**
   * Cancel order
   * Cancel an order (owner or admin) with optional cancellation notes
   * @param {any} id - Parameter
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  cancelOrders(id, data) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/orders/${id}/cancel`
    return this.request(endpoint, { method: 'PATCH', body: data })
  }

  /**
   * Get all users
   * Admin only - Returns paginated list of all users
   * @param {any} params - Parameter
   * @returns {Promise<any>} API response
   */
  getAllUsers(params = {}) {
    const queryString = new URLSearchParams()
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryString.append(key, value.toString())
      }
    })
    const query = queryString.toString()
    const queryPart = query ? '?' + query : ''
    const endpoint = `/api/users${queryPart}`
    return this.request(endpoint)
  }

  /**
   * Create new user
   * Create a new user account (public registration)
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  createUsers(data) {
    const endpoint = `/api/users`
    return this.request(endpoint, { method: 'POST', body: data })
  }

  /**
   * Get user by ID
   * Get user details by ID (owner or admin only)
   * @param {any} id - Parameter
   * @returns {Promise<any>} API response
   */
  getUsersById(id) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/users/${id}`
    return this.request(endpoint)
  }

  /**
   * Update user
   * Update user details (owner or admin only)
   * @param {any} id - Parameter
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  updateUsers(id, data) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/users/${id}`
    return this.request(endpoint, { method: 'PUT', body: data })
  }

  /**
   * Delete user (soft delete)
   * Admin only - Soft deletes a user (sets active to false)
   * @param {any} id - Parameter
   * @returns {Promise<any>} API response
   */
  deleteUsers(id) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/users/${id}`
    return this.request(endpoint, { method: 'DELETE' })
  }

  /**
   * Get user by email
   * Admin only - Get user details by email address
   * @param {any} email - Parameter
   * @returns {Promise<any>} API response
   */
  getAllEmail(email) {
    if (!email) {
      throw new Error('email is required')
    }

    const endpoint = `/api/users/email/${email}`
    return this.request(endpoint)
  }

  /**
   * Reactivate user
   * Admin only - Reactivates a soft-deleted user
   * @param {any} id - Parameter
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  reactivateUsers(id, data) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/users/${id}/reactivate`
    return this.request(endpoint, { method: 'PATCH', body: data })
  }

  /**
   * Verify user email
   * Verify user email address (owner or admin only)
   * @param {any} id - Parameter
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  verifyUserEmail(id, data) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/users/${id}/verify-email`
    return this.request(endpoint, { method: 'PATCH', body: data })
  }

  /**
   * Get available payment methods
   * Public - Returns available payment methods for Venezuela
   * @returns {Promise<any>} API response
   */
  getAllMethods() {
    const endpoint = `/api/payments/methods`
    return this.request(endpoint)
  }

  /**
   * Confirm payment for order
   * Confirm payment for an existing order (authenticated users)
   * @param {any} id - Parameter
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  confirmPayments(id, data) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/payments/${id}/confirm`
    return this.request(endpoint, { method: 'POST', body: data })
  }

  /**
   * Get all occasions
   * Public - Returns all active occasions, sorted by display_order.
   * @returns {Promise<any>} API response
   */
  getAllOccasions() {
    const endpoint = `/api/occasions`
    return this.request(endpoint)
  }

  /**
   * Create new occasion
   * Admin only - Creates a new occasion.
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  createOccasions(data) {
    const endpoint = `/api/occasions`
    return this.request(endpoint, { method: 'POST', body: data })
  }

  /**
   * Get occasion by ID
   * Get occasion details by its unique ID.
   * @param {any} id - Parameter
   * @returns {Promise<any>} API response
   */
  getOccasionsById(id) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/occasions/${id}`
    return this.request(endpoint)
  }

  /**
   * Update occasion
   * Admin only - Updates an existing occasion.
   * @param {any} id - Parameter
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  updateOccasions(id, data) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/occasions/${id}`
    return this.request(endpoint, { method: 'PUT', body: data })
  }

  /**
   * Delete occasion (soft delete)
   * Admin only - Soft deletes an occasion by setting its `active` flag to false.
   * @param {any} id - Parameter
   * @returns {Promise<any>} API response
   */
  deleteOccasions(id) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/occasions/${id}`
    return this.request(endpoint, { method: 'DELETE' })
  }

  /**
   * Get occasion by slug
   * Get occasion details by its unique slug.
   * @param {any} slug - Parameter
   * @returns {Promise<any>} API response
   */
  getAllSlug(slug) {
    if (!slug) {
      throw new Error('slug is required')
    }

    const endpoint = `/api/occasions/slug/${slug}`
    return this.request(endpoint)
  }

  /**
   * Update occasion display order
   * Admin only - Atomically updates the display order for an occasion.
   * @param {any} id - Parameter
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  updateOccasionDisplayOrder(id, data) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/occasions/${id}/display-order`
    return this.request(endpoint, { method: 'PATCH', body: data })
  }

  /**
   * Reactivate occasion
   * Admin only - Reactivates a soft-deleted occasion by setting its `active` flag to true.
   * @param {any} id - Parameter
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  reactivateOccasions(id, data) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/occasions/${id}/reactivate`
    return this.request(endpoint, { method: 'PATCH', body: data })
  }

  /**
   * Get public settings
   * Public - Returns public settings only
   * @returns {Promise<any>} API response
   */
  getAllPublic() {
    const endpoint = `/api/settings/public`
    return this.request(endpoint)
  }

  /**
   * Get settings map
   * Returns settings as a key-value map
   * @returns {Promise<any>} API response
   */
  getAllMap() {
    const endpoint = `/api/settings/map`
    return this.request(endpoint)
  }

  /**
   * Get setting value by key
   * Get a specific setting value by its key
   * @param {any} key - Parameter
   * @returns {Promise<any>} API response
   */
  getValue(key) {
    if (!key) {
      throw new Error('key is required')
    }

    const endpoint = `/api/settings/${key}/value`
    return this.request(endpoint)
  }

  /**
   * Get all settings
   * Admin only - Returns all settings
   * @returns {Promise<any>} API response
   */
  getAllSettings() {
    const endpoint = `/api/settings`
    return this.request(endpoint)
  }

  /**
   * Create new setting
   * Admin only - Creates a new setting
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  createSettings(data) {
    const endpoint = `/api/settings`
    return this.request(endpoint, { method: 'POST', body: data })
  }

  /**
   * Get setting by key
   * Admin only - Get setting details by key
   * @param {any} key - Parameter
   * @returns {Promise<any>} API response
   */
  getSettingsByKey(key) {
    if (!key) {
      throw new Error('key is required')
    }

    const endpoint = `/api/settings/${key}`
    return this.request(endpoint)
  }

  /**
   * Update setting
   * Admin only - Updates an existing setting
   * @param {any} key - Parameter
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  updateSettings(key, data) {
    if (!key) {
      throw new Error('key is required')
    }

    const endpoint = `/api/settings/${key}`
    return this.request(endpoint, { method: 'PUT', body: data })
  }

  /**
   * Delete setting
   * Admin only - Deletes a setting
   * @param {any} key - Parameter
   * @returns {Promise<any>} API response
   */
  deleteSettings(key) {
    if (!key) {
      throw new Error('key is required')
    }

    const endpoint = `/api/settings/${key}`
    return this.request(endpoint, { method: 'DELETE' })
  }

  /**
   * Upload setting image
   * Admin only - Upload and save image for a specific setting
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  uploadSettingImage(data) {
    const endpoint = `/api/admin/settings/image`
    return this.request(endpoint, { method: 'POST', body: data })
  }

  /**
   * Save BCV USD rate
   * Admin only - Update BCV exchange rate
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  createBcvprice(data) {
    const endpoint = `/api/admin/settings/bcv-price`
    return this.request(endpoint, { method: 'POST', body: data })
  }

  /**
   * Get business rules status
   * Admin only - Returns business rules engine status and configuration
   * @returns {Promise<any>} API response
   */
  getAllBusinessrules() {
    const endpoint = `/api/admin/settings/business-rules`
    return this.request(endpoint)
  }

  /**
   * Get all payment methods
   * Public - Returns all active payment methods, sorted by display_order.
   * @returns {Promise<any>} API response
   */
  getAllPaymentmethods() {
    const endpoint = `/api/payment-methods`
    return this.request(endpoint)
  }

  /**
   * Create new payment method
   * Admin only - Creates a new payment method.
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  createPaymentmethods(data) {
    const endpoint = `/api/payment-methods`
    return this.request(endpoint, { method: 'POST', body: data })
  }

  /**
   * Add active column to settings table
   * Admin only - Migration endpoint to add active column to settings table
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  createAddisactivetosettings(data) {
    const endpoint = `/api/migrations/add-is-active-to-settings`
    return this.request(endpoint, { method: 'POST', body: data })
  }

  /**
   * Get payment method by ID
   * Get payment method details by its unique ID.
   * @param {any} id - Parameter
   * @returns {Promise<any>} API response
   */
  getPaymentmethodsById(id) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/payment-methods/${id}`
    return this.request(endpoint)
  }

  /**
   * Update payment method
   * Admin only - Updates an existing payment method.
   * @param {any} id - Parameter
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  updatePaymentmethods(id, data) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/payment-methods/${id}`
    return this.request(endpoint, { method: 'PUT', body: data })
  }

  /**
   * Delete payment method (soft delete)
   * Admin only - Soft deletes a payment method by setting its `active` flag to false.
   * @param {any} id - Parameter
   * @returns {Promise<any>} API response
   */
  deletePaymentmethods(id) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/payment-methods/${id}`
    return this.request(endpoint, { method: 'DELETE' })
  }

  /**
   * Update payment method display order
   * Admin only - Atomically updates the display order for a payment method.
   * @param {any} id - Parameter
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  updatePaymentMethodDisplayOrder(id, data) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/payment-methods/${id}/display-order`
    return this.request(endpoint, { method: 'PATCH', body: data })
  }

  /**
   * Reactivate payment method
   * Admin only - Reactivates a soft-deleted payment method by setting its `active` flag to true.
   * @param {any} id - Parameter
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  reactivatePaymentMethods(id, data) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/payment-methods/${id}/reactivate`
    return this.request(endpoint, { method: 'PATCH', body: data })
  }

  /**
   * Get real-time metrics
   * Returns current system performance metrics including requests, errors, and response times
   * @returns {Promise<any>} API response
   */
  getAllMetrics() {
    const endpoint = `/health/metrics`
    return this.request(endpoint)
  }

  /**
   * Get detailed metrics report
   * Returns comprehensive metrics analysis and performance report
   * @returns {Promise<any>} API response
   */
  getAllReport() {
    const endpoint = `/health/metrics/report`
    return this.request(endpoint)
  }

  /**
   * Database health check
   * Tests database connectivity and returns performance metrics
   * @returns {Promise<any>} API response
   */
  getAllDatabase() {
    const endpoint = `/health/database`
    return this.request(endpoint)
  }

  /**
   * Get profiling status
   * Returns current profiling session status (admin only in production)
   * @returns {Promise<any>} API response
   */
  getAllProfiling() {
    const endpoint = `/health/profiling`
    return this.request(endpoint)
  }

  /**
   * Start profiling session
   * Starts a new profiling session for performance analysis (admin recommended)
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  createStart(data) {
    const endpoint = `/health/profiling/start`
    return this.request(endpoint, { method: 'POST', body: data })
  }

  /**
   * Stop profiling session
   * Stops the current profiling session and returns results
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  createStop(data) {
    const endpoint = `/health/profiling/stop`
    return this.request(endpoint, { method: 'POST', body: data })
  }

  /**
   * Get auto-recovery status
   * Returns status of auto-recovery system and recent recovery attempts
   * @returns {Promise<any>} API response
   */
  getAllRecovery() {
    const endpoint = `/health/recovery`
    return this.request(endpoint)
  }

  /**
   * Get system diagnostics
   * Returns detailed system diagnostics including process, environment, and monitoring information
   * @returns {Promise<any>} API response
   */
  getAllDiagnostics() {
    const endpoint = `/health/diagnostics`
    return this.request(endpoint)
  }

  /**
   * Get all expense categories
   * Admin only - Returns all expense categories with optional inactive filter
   * @param {any} params - Parameter
   * @returns {Promise<any>} API response
   */
  getAllCategories(params = {}) {
    const queryString = new URLSearchParams()
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryString.append(key, value.toString())
      }
    })
    const query = queryString.toString()
    const queryPart = query ? '?' + query : ''
    const endpoint = `/api/accounting/categories${queryPart}`
    return this.request(endpoint)
  }

  /**
   * Create expense category
   * Admin only - Creates a new expense category
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  createCategories(data) {
    const endpoint = `/api/accounting/categories`
    return this.request(endpoint, { method: 'POST', body: data })
  }

  /**
   * Get expense category by ID
   * Admin only
   * @param {any} id - Parameter
   * @returns {Promise<any>} API response
   */
  getCategoriesById(id) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/accounting/categories/${id}`
    return this.request(endpoint)
  }

  /**
   * Update expense category
   * Admin only
   * @param {any} id - Parameter
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  updateCategories(id, data) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/accounting/categories/${id}`
    return this.request(endpoint, { method: 'PUT', body: data })
  }

  /**
   * Delete expense category
   * Admin only - Soft delete
   * @param {any} id - Parameter
   * @returns {Promise<any>} API response
   */
  deleteCategories(id) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/accounting/categories/${id}`
    return this.request(endpoint, { method: 'DELETE' })
  }

  /**
   * Get all expenses
   * Admin only - Returns expenses with optional filters
   * @param {any} params - Parameter
   * @returns {Promise<any>} API response
   */
  getAllExpenses(params = {}) {
    const queryString = new URLSearchParams()
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryString.append(key, value.toString())
      }
    })
    const query = queryString.toString()
    const queryPart = query ? '?' + query : ''
    const endpoint = `/api/accounting/expenses${queryPart}`
    return this.request(endpoint)
  }

  /**
   * Create expense
   * Admin only - Create expense with optional receipt upload
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  createExpenses(data) {
    const endpoint = `/api/accounting/expenses`
    return this.request(endpoint, { method: 'POST', body: data })
  }

  /**
   * Get expenses grouped by category
   * Admin only - Requires start and end date
   * @param {any} params - Parameter
   * @returns {Promise<any>} API response
   */
  getAllBycategory(params = {}) {
    const queryString = new URLSearchParams()
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryString.append(key, value.toString())
      }
    })
    const query = queryString.toString()
    const queryPart = query ? '?' + query : ''
    const endpoint = `/api/accounting/expenses/by-category${queryPart}`
    return this.request(endpoint)
  }

  /**
   * Get expense by ID
   * Admin only
   * @param {any} id - Parameter
   * @returns {Promise<any>} API response
   */
  getExpensesById(id) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/accounting/expenses/${id}`
    return this.request(endpoint)
  }

  /**
   * Update expense
   * Admin only - Update with optional new receipt
   * @param {any} id - Parameter
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  updateExpenses(id, data) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/accounting/expenses/${id}`
    return this.request(endpoint, { method: 'PUT', body: data })
  }

  /**
   * Delete expense
   * Admin only
   * @param {any} id - Parameter
   * @returns {Promise<any>} API response
   */
  deleteExpenses(id) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/accounting/expenses/${id}`
    return this.request(endpoint, { method: 'DELETE' })
  }

  /**
   * Get dashboard summary
   * Admin only - Last 7 days summary
   * @returns {Promise<any>} API response
   */
  getAllDashboard() {
    const endpoint = `/api/accounting/reports/dashboard`
    return this.request(endpoint)
  }

  /**
   * Get weekly report
   * Admin only
   * @param {any} params - Parameter
   * @returns {Promise<any>} API response
   */
  getAllWeekly(params = {}) {
    const queryString = new URLSearchParams()
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryString.append(key, value.toString())
      }
    })
    const query = queryString.toString()
    const queryPart = query ? '?' + query : ''
    const endpoint = `/api/accounting/reports/weekly${queryPart}`
    return this.request(endpoint)
  }

  /**
   * Get current week report
   * Admin only - Helper endpoint
   * @returns {Promise<any>} API response
   */
  getAllCurrentweek() {
    const endpoint = `/api/accounting/reports/current-week`
    return this.request(endpoint)
  }

  /**
   * Get monthly report
   * Admin only
   * @param {any} params - Parameter
   * @returns {Promise<any>} API response
   */
  getAllMonthly(params = {}) {
    const queryString = new URLSearchParams()
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryString.append(key, value.toString())
      }
    })
    const query = queryString.toString()
    const queryPart = query ? '?' + query : ''
    const endpoint = `/api/accounting/reports/monthly${queryPart}`
    return this.request(endpoint)
  }

  /**
   * Get current month report
   * Admin only - Helper endpoint
   * @returns {Promise<any>} API response
   */
  getAllCurrentmonth() {
    const endpoint = `/api/accounting/reports/current-month`
    return this.request(endpoint)
  }

  // ==================== UTILITIES ====================

  /**
   * Handle API errors with user-friendly messages
   * @param {Error} error - Error object
   * @returns {string} User-friendly message
   */
  handleError(error) {
    if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
      return 'Network error. Please check your connection.'
    }
    if (error.message.includes('404')) {
      return 'Resource not found.'
    }
    if (error.message.includes('400')) {
      return 'Invalid request. Please check your input.'
    }
    if (error.message.includes('401')) {
      return 'Authentication required.'
    }
    if (error.message.includes('403')) {
      return 'Access denied.'
    }
    if (error.message.includes('500')) {
      return 'Server error. Please try again later.'
    }

    return error.message || 'An unexpected error occurred.'
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export class for custom instances
export { ApiClient }

// Convenience functions for common operations
export const api = {
  getAllErrors: () => apiClient.getAllErrors(),
  getAllProducts: params => apiClient.getAllProducts(params),
  createProducts: data => apiClient.createProducts(data),
  getProductsById: (id, params) => apiClient.getProductsById(id, params),
  updateProducts: (id, data) => apiClient.updateProducts(id, data),
  deleteProducts: id => apiClient.deleteProducts(id),
  getAllCarouselProducts: () => apiClient.getAllCarouselProducts(),
  getProductsWithOccasions: params => apiClient.getProductsWithOccasions(params),
  createProductsWithOccasions: data => apiClient.createProductsWithOccasions(data),
  getProductsByOccasion: occasionId => apiClient.getProductsByOccasion(occasionId),
  getAllSku: sku => apiClient.getAllSku(sku),
  getPrimaryImage: id => apiClient.getPrimaryImage(id),
  getProductImages: (id, params) => apiClient.getProductImages(id, params),
  uploadProductImages: (id, data) => apiClient.uploadProductImages(id, data),
  updateCarouselProducts: (id, data) => apiClient.updateCarouselProducts(id, data),
  updateStock: (id, data) => apiClient.updateStock(id, data),
  deleteProductImage: (id, imageIndex) => apiClient.deleteProductImage(id, imageIndex),
  updatePrimaryImage: (id, imageIndex, data) => apiClient.updatePrimaryImage(id, imageIndex, data),
  getProductOccasions: id => apiClient.getProductOccasions(id),
  updateProductOccasions: (id, data) => apiClient.updateProductOccasions(id, data),
  createProductOccasion: (id, occasionId, data) =>
    apiClient.createProductOccasion(id, occasionId, data),
  reactivateProducts: (id, data) => apiClient.reactivateProducts(id, data),
  getAllOrders: params => apiClient.getAllOrders(params),
  createOrders: data => apiClient.createOrders(data),
  getOrdersById: id => apiClient.getOrdersById(id),
  updateOrders: (id, data) => apiClient.updateOrders(id, data),
  getOrdersByUser: userId => apiClient.getOrdersByUser(userId),
  getOrdersStatusHistory: id => apiClient.getOrdersStatusHistory(id),
  updateOrdersStatus: (id, data) => apiClient.updateOrdersStatus(id, data),
  cancelOrders: (id, data) => apiClient.cancelOrders(id, data),
  getAllUsers: params => apiClient.getAllUsers(params),
  createUsers: data => apiClient.createUsers(data),
  getUsersById: id => apiClient.getUsersById(id),
  updateUsers: (id, data) => apiClient.updateUsers(id, data),
  deleteUsers: id => apiClient.deleteUsers(id),
  getAllEmail: email => apiClient.getAllEmail(email),
  reactivateUsers: (id, data) => apiClient.reactivateUsers(id, data),
  verifyUserEmail: (id, data) => apiClient.verifyUserEmail(id, data),
  getAllMethods: () => apiClient.getAllMethods(),
  confirmPayments: (id, data) => apiClient.confirmPayments(id, data),
  getAllOccasions: () => apiClient.getAllOccasions(),
  createOccasions: data => apiClient.createOccasions(data),
  getOccasionsById: id => apiClient.getOccasionsById(id),
  updateOccasions: (id, data) => apiClient.updateOccasions(id, data),
  deleteOccasions: id => apiClient.deleteOccasions(id),
  getAllSlug: slug => apiClient.getAllSlug(slug),
  updateOccasionDisplayOrder: (id, data) => apiClient.updateOccasionDisplayOrder(id, data),
  reactivateOccasions: (id, data) => apiClient.reactivateOccasions(id, data),
  getAllPublic: () => apiClient.getAllPublic(),
  getAllMap: () => apiClient.getAllMap(),
  getValue: key => apiClient.getValue(key),
  getAllSettings: () => apiClient.getAllSettings(),
  createSettings: data => apiClient.createSettings(data),
  getSettingsByKey: key => apiClient.getSettingsByKey(key),
  updateSettings: (key, data) => apiClient.updateSettings(key, data),
  deleteSettings: key => apiClient.deleteSettings(key),
  uploadSettingImage: data => apiClient.uploadSettingImage(data),
  createBcvprice: data => apiClient.createBcvprice(data),
  getAllBusinessrules: () => apiClient.getAllBusinessrules(),
  getAllPaymentmethods: () => apiClient.getAllPaymentmethods(),
  createPaymentmethods: data => apiClient.createPaymentmethods(data),
  createAddisactivetosettings: data => apiClient.createAddisactivetosettings(data),
  getPaymentmethodsById: id => apiClient.getPaymentmethodsById(id),
  updatePaymentmethods: (id, data) => apiClient.updatePaymentmethods(id, data),
  deletePaymentmethods: id => apiClient.deletePaymentmethods(id),
  updatePaymentMethodDisplayOrder: (id, data) =>
    apiClient.updatePaymentMethodDisplayOrder(id, data),
  reactivatePaymentMethods: (id, data) => apiClient.reactivatePaymentMethods(id, data),
  getAllMetrics: () => apiClient.getAllMetrics(),
  getAllReport: () => apiClient.getAllReport(),
  getAllDatabase: () => apiClient.getAllDatabase(),
  getAllProfiling: () => apiClient.getAllProfiling(),
  createStart: data => apiClient.createStart(data),
  createStop: data => apiClient.createStop(data),
  getAllRecovery: () => apiClient.getAllRecovery(),
  getAllDiagnostics: () => apiClient.getAllDiagnostics(),
  getAllCategories: params => apiClient.getAllCategories(params),
  createCategories: data => apiClient.createCategories(data),
  getCategoriesById: id => apiClient.getCategoriesById(id),
  updateCategories: (id, data) => apiClient.updateCategories(id, data),
  deleteCategories: id => apiClient.deleteCategories(id),
  getAllExpenses: params => apiClient.getAllExpenses(params),
  createExpenses: data => apiClient.createExpenses(data),
  getAllBycategory: params => apiClient.getAllBycategory(params),
  getExpensesById: id => apiClient.getExpensesById(id),
  updateExpenses: (id, data) => apiClient.updateExpenses(id, data),
  deleteExpenses: id => apiClient.deleteExpenses(id),
  getAllDashboard: () => apiClient.getAllDashboard(),
  getAllWeekly: params => apiClient.getAllWeekly(params),
  getAllCurrentweek: () => apiClient.getAllCurrentweek(),
  getAllMonthly: params => apiClient.getAllMonthly(params),
  getAllCurrentmonth: () => apiClient.getAllCurrentmonth(),
  handleError: error => apiClient.handleError(error)
}
