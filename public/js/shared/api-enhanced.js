/**
 * Enhanced API Integration for Frontend
 * Combina el cliente API generado con funcionalidades específicas del frontend
 * Compatible con el contrato OpenAPI actualizado
 */

import { api } from './api-client.js'

/**
 * Enhanced API class with frontend-specific features
 */
class EnhancedApi {
  constructor() {
    this.cache = new Map()
    this.pendingRequests = new Map()
  }

  // ==================== PRODUCTS ====================

  /**
   * Get products with caching for better performance
   */
  async getProductsCached(params = {}, cacheTime = 30000) {
    const cacheKey = `products_${JSON.stringify(params)}`

    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      console.log('📦 Returning cached products')
      return cached.data
    }

    try {
      const response = await api.getAllProducts(params)
      // Cache the result
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      })

      return response.data
    } catch (error) {
      console.error('Failed to fetch products:', api.handleError(error))
      throw error
    }
  }

  /**
   * Get product with images for detail page
   */
  async getProductWithImages(productId) {
    try {
      const [product, images] = await Promise.all([
        api.getProductsById(productId),
        api.getProductImages(productId)
      ])

      return {
        product: product.data,
        images: images.data
      }
    } catch (error) {
      throw new Error(api.handleError(error))
    }
  }

  /**
   * Search products with debouncing
   */
  searchProducts(query, debounceMs = 300) {
    return new Promise(resolve => {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(async () => {
        try {
          const response = await api.getAllProducts({ search: query, limit: 10 })
          resolve(response.data)
        } catch (error) {
          console.error('Search failed:', api.handleError(error))
          resolve([])
        }
      }, debounceMs)
    })
  }

  // ==================== CART INTEGRATION ====================

  /**
   * Add product to cart with validation
   */
  async addToCart(productId, quantity = 1) {
    try {
      // Get fresh product data
      const product = await api.getProductsById(productId)

      // Validate stock
      if (product.data.stock < quantity) {
        throw new Error(`Only ${product.data.stock} items available`)
      }

      // Get existing cart
      const cart = this.getCart()

      // Check if product already in cart
      const existingItem = cart.find(item => item.product.id === productId)

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity
        if (product.data.stock < newQuantity) {
          throw new Error(
            `Cannot add ${quantity} more items. Only ${product.data.stock - existingItem.quantity} available`
          )
        }
        existingItem.quantity = newQuantity
      } else {
        // Add new item
        cart.push({
          product: product.data,
          quantity: quantity,
          addedAt: new Date().toISOString()
        })
      }

      // Save cart
      this.saveCart(cart)

      // Update UI
      this.updateCartUI(cart)

      return cart
    } catch (error) {
      console.error('Failed to add to cart:', error)
      throw error
    }
  }

  /**
   * Get cart from localStorage
   */
  getCart() {
    try {
      const cartData = localStorage.getItem('floresya_cart')
      return cartData ? JSON.parse(cartData) : []
    } catch (error) {
      console.error('Error reading cart:', error)
      return []
    }
  }

  /**
   * Save cart to localStorage
   */
  saveCart(cart) {
    try {
      localStorage.setItem('floresya_cart', JSON.stringify(cart))
    } catch (error) {
      console.error('Error saving cart:', error)
    }
  }

  /**
   * Update cart UI (placeholder - implement based on your UI)
   */
  updateCartUI(cart) {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
    console.log(`🛒 Cart updated: ${cartCount} items`)

    // Update cart counter in UI
    const cartCounter = document.querySelector('.cart-counter')
    if (cartCounter) {
      cartCounter.textContent = cartCount
      cartCounter.style.display = cartCount > 0 ? 'block' : 'none'
    }
  }

  // ==================== ORDER INTEGRATION ====================

  /**
   * Create order with comprehensive validation
   */
  async createOrder(orderData) {
    try {
      // Server-side validation will handle order data validation
      // Get cart for items
      const cart = this.getCart()
      if (cart.length === 0) {
        throw new Error('Cart is empty')
      }

      // Prepare order items
      const items = cart.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        product_summary: item.product.summary,
        unit_price_usd: item.product.price_usd,
        quantity: item.quantity,
        subtotal_usd: item.product.price_usd * item.quantity
      }))

      // Calculate totals
      const totalAmount = items.reduce((sum, item) => sum + item.subtotal_usd, 0)

      // Prepare order data
      const finalOrderData = {
        order: {
          ...orderData,
          total_amount_usd: totalAmount,
          total_amount_ves: orderData.total_amount_ves || totalAmount * 40, // Default exchange rate
          customer_email: orderData.customer_email,
          customer_name: orderData.customer_name,
          customer_phone: orderData.customer_phone,
          delivery_address: orderData.delivery_address
        },
        items: items
      }

      // Create order
      const response = await api.createOrders(finalOrderData)

      // Clear cart on success
      this.clearCart()

      return response.data
    } catch (error) {
      console.error('Failed to create order:', api.handleError(error))
      throw error
    }
  }

  /**
   * Clear cart
   */
  clearCart() {
    localStorage.removeItem('floresya_cart')
    this.updateCartUI([])
  }

  // ==================== SETTINGS INTEGRATION ====================

  /**
   * Get frontend configuration from settings
   */
  async getFrontendConfig() {
    try {
      const [_settings, settingsMap] = await Promise.all([
        api.getAllPublic(),
        api.getAllMap({ public: true })
      ])

      return {
        siteName: settingsMap.data.site_name || 'FloresYa',
        currency: settingsMap.data.currency || 'USD',
        exchangeRate: settingsMap.data.exchange_rate || 40,
        businessHours: settingsMap.data.business_hours || '9:00-18:00',
        contactInfo: {
          phone: settingsMap.data.contact_phone,
          email: settingsMap.data.contact_email,
          address: settingsMap.data.contact_address
        }
      }
    } catch (error) {
      console.error('Failed to load frontend config:', error)
      return this.getDefaultConfig()
    }
  }

  /**
   * Default configuration fallback
   */
  getDefaultConfig() {
    return {
      siteName: 'FloresYa',
      currency: 'USD',
      exchangeRate: 40,
      businessHours: '9:00-18:00',
      contactInfo: {
        phone: '+58 412 1234567',
        email: 'info@floresya.com',
        address: 'Caracas, Venezuela'
      }
    }
  }

  // ==================== ERROR HANDLING ====================

  /**
   * Enhanced error handling with user-friendly messages
   */
  handleError(error, context = '') {
    const baseMessage = api.handleError(error)
    const contextPrefix = context ? `[${context}] ` : ''

    console.error(`${contextPrefix}API Error:`, error)

    // Show user-friendly error
    this.showErrorMessage(baseMessage)

    return baseMessage
  }

  /**
   * Show error message to user (implement based on your UI)
   */
  showErrorMessage(message) {
    // Implementation depends on your UI framework
    console.error('User Error:', message)

    // Example implementation
    const errorDiv = document.querySelector('.error-message')
    if (errorDiv) {
      errorDiv.textContent = message
      errorDiv.style.display = 'block'
      setTimeout(() => {
        errorDiv.style.display = 'none'
      }, 5000)
    }
  }

  // ==================== UTILITIES ====================

  /**
   * Format currency for display
   */
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  /**
   * Format date for display
   */
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  /**
   * Validate email format
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate Venezuelan phone number
   */
  validatePhone(phone) {
    const phoneRegex = /^(\+58)?[0-9]{10}$/
    return phoneRegex.test(phone.replace(/\s+/g, ''))
  }
}

// Export enhanced API instance
export const enhancedApi = new EnhancedApi()

// Export convenience functions
export const {
  getProductsCached,
  getProductWithImages,
  searchProducts,
  addToCart,
  getCart,
  createOrder,
  getFrontendConfig,
  handleError,
  formatCurrency,
  formatDate,
  validateEmail,
  validatePhone
} = enhancedApi

// Export for global use
window.enhancedApi = enhancedApi
