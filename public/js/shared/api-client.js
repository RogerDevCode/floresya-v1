/**
 * FloresYa API Client
 * Auto-generated from OpenAPI specification
 * Generated: 2025-10-11T23:07:25.351Z
 * Spec Version: 1.0.0
 * Total Endpoints: 43
 *
 * IMPORTANT: This file is AUTO-GENERATED. Do not edit manually.
 * Regenerate using: npm run generate:client
 */

class ApiClient {
  constructor(baseUrl = 'http://localhost:3000') {
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
   * Admin only - Updates product fields
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
   * Create new order with customer and payment information
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
   * Admin only - Soft deletes a user (sets is_active to false)
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
   * Get available payment methods for Venezuela
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
   * Get all payments with filters
   * Admin only - Returns paginated list of payments with optional filters (uses indexed columns)
   * @param {any} params - Parameter
   * @returns {Promise<any>} API response
   */
  getAllPayments(params = {}) {
    const queryString = new URLSearchParams()
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryString.append(key, value.toString())
      }
    })
    const query = queryString.toString()
    const queryPart = query ? '?' + query : ''
    const endpoint = `/api/payments${queryPart}`
    return this.request(endpoint)
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
   * Admin only - Soft deletes an occasion by setting its `is_active` flag to false.
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
  updateDisplayorder(id, data) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/occasions/${id}/display-order`
    return this.request(endpoint, { method: 'PATCH', body: data })
  }

  /**
   * Reactivate occasion
   * Admin only - Reactivates a soft-deleted occasion by setting its `is_active` flag to true.
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
   * Admin only - Save BCV USD exchange rate
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  createBcvprice(data) {
    const endpoint = `/api/admin/settings/bcv-price`
    return this.request(endpoint, { method: 'POST', body: data })
  }

  /**
   * Get business rules status
   * Admin only - Get business rules engine status and configuration
   * @returns {Promise<any>} API response
   */
  getAllBusinessrules() {
    const endpoint = `/api/admin/settings/business-rules`
    return this.request(endpoint)
  }

  /**
   * Confirm payment
   * @param {any} id - Parameter
   * @returns {Promise<any>} API response
   */
  getPaymentById(id) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/payment/${id}`
    return this.request(endpoint)
  }

  /**
   * Create product
   * @param {any} id - Parameter
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  createProduct(id, data) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/product/${id}`
    return this.request(endpoint, { method: 'POST', body: data })
  }

  /**
   * Update product
   * @param {any} id - Parameter
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  updateProduct(id, data) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/product/${id}`
    return this.request(endpoint, { method: 'PATCH', body: data })
  }

  /**
   * Set primary image
   * @param {any} id - Parameter
   * @returns {Promise<any>} API response
   */
  getProductimageById(id) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/productimage/${id}`
    return this.request(endpoint)
  }

  /**
   * Create product images
   * @param {any} id - Parameter
   * @param {any} data - Parameter
   * @returns {Promise<any>} API response
   */
  createProductimage(id, data) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/productimage/${id}`
    return this.request(endpoint, { method: 'POST', body: data })
  }

  /**
   * Delete images by index
   * @param {any} id - Parameter
   * @returns {Promise<any>} API response
   */
  deleteProductimage(id) {
    if (!id || id <= 0) {
      throw new Error('Invalid id')
    }

    const endpoint = `/api/productimage/${id}`
    return this.request(endpoint, { method: 'DELETE' })
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
  getAllPayments: params => apiClient.getAllPayments(params),
  getAllOccasions: () => apiClient.getAllOccasions(),
  createOccasions: data => apiClient.createOccasions(data),
  getOccasionsById: id => apiClient.getOccasionsById(id),
  updateOccasions: (id, data) => apiClient.updateOccasions(id, data),
  deleteOccasions: id => apiClient.deleteOccasions(id),
  getAllSlug: slug => apiClient.getAllSlug(slug),
  updateDisplayorder: (id, data) => apiClient.updateDisplayorder(id, data),
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
  getPaymentById: id => apiClient.getPaymentById(id),
  createProduct: (id, data) => apiClient.createProduct(id, data),
  updateProduct: (id, data) => apiClient.updateProduct(id, data),
  getProductimageById: id => apiClient.getProductimageById(id),
  createProductimage: (id, data) => apiClient.createProductimage(id, data),
  deleteProductimage: id => apiClient.deleteProductimage(id),
  handleError: error => apiClient.handleError(error)
}
