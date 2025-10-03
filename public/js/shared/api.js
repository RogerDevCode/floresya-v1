/**
 * API Client - SSOT for HTTP requests
 * Centralizes all API calls with fail-fast error handling
 */

const API_BASE = '/api'

/**
 * Fetch JSON with error handling
 * @param {string} endpoint - API endpoint (e.g., '/products')
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<any>} Parsed JSON response
 * @throws {Error} If request fails
 */
export async function fetchJSON(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`fetchJSON(${endpoint}) failed:`, error)
    throw error // Fail-fast
  }
}

/**
 * API methods (SSOT)
 */
export const api = {
  // Products
  getProducts: (filters = {}) => {
    const params = new URLSearchParams(filters)
    return fetchJSON(`/products?${params}`)
  },
  getProduct: id => fetchJSON(`/products/${id}`),
  createProduct: data => fetchJSON('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) =>
    fetchJSON(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: id => fetchJSON(`/products/${id}`, { method: 'DELETE' }),
  getProductImages: (productId, size = 'small') => {
    const params = new URLSearchParams({ size })
    return fetchJSON(`/products/${productId}/images?${params}`)
  },
  getProductPrimaryImage: productId => fetchJSON(`/products/${productId}/images/primary`),

  // Orders (OpenAPI contract compliant)
  createOrder: (order, items) =>
    fetchJSON('/orders', {
      method: 'POST',
      body: JSON.stringify({ order, items })
    }),
  getOrders: filters => {
    const params = new URLSearchParams(filters)
    return fetchJSON(`/orders?${params}`)
  },
  getOrderById: id => fetchJSON(`/orders/${id}`),
  getOrdersByUser: (userId, filters = {}) => {
    const params = new URLSearchParams(filters)
    return fetchJSON(`/orders/user/${userId}?${params}`)
  },
  getOrderStatusHistory: orderId => fetchJSON(`/orders/${orderId}/status-history`),
  updateOrderStatus: (orderId, status, notes) =>
    fetchJSON(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes })
    }),
  cancelOrder: (orderId, notes) =>
    fetchJSON(`/orders/${orderId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ notes })
    }),

  // Payments
  getPaymentMethods: () => fetchJSON('/payments/methods'),
  confirmPayment: (orderId, paymentData) =>
    fetchJSON(`/payments/${orderId}/confirm`, {
      method: 'PATCH',
      body: JSON.stringify(paymentData)
    }),

  // Users
  login: data => fetchJSON('/users/login', { method: 'POST', body: JSON.stringify(data) }),
  register: data => fetchJSON('/users/register', { method: 'POST', body: JSON.stringify(data) }),

  // Settings
  getSettings: (publicOnly = false) => {
    const params = new URLSearchParams({ public: publicOnly })
    return fetchJSON(`/settings?${params}`)
  },
  getPublicSettings: () => fetchJSON('/settings/public'),
  getSettingByKey: key => fetchJSON(`/settings/${key}`),
  createSetting: data => fetchJSON('/settings', { method: 'POST', body: JSON.stringify(data) }),
  updateSetting: (key, data) =>
    fetchJSON(`/settings/${key}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSetting: key => fetchJSON(`/settings/${key}`, { method: 'DELETE' })
}
