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

  // Orders
  createOrder: data => fetchJSON('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getOrders: () => fetchJSON('/orders'),

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
