/**
 * CartService
 * Business logic for shopping cart operations
 * @typedef {import('../types/index.js').CartItem} CartItem
 * @typedef {import('../types/index.js').Cart} Cart
 */

import { getStorageItem, setStorageItem } from '../utils/storage.js'

export class CartService {
  constructor() {
    this.storageKey = 'floresya_cart'
    this.cart = this.loadCart()
  }

  /**
   * Load cart from localStorage
   * @returns {CartItem[]}
   */
  loadCart() {
    try {
      return getStorageItem(this.storageKey, [])
    } catch (error) {
      console.error('Failed to load cart:', error)
      return []
    }
  }

  /**
   * Save cart to localStorage
   * @private
   */
  saveCart() {
    try {
      setStorageItem(this.storageKey, this.cart)
    } catch (error) {
      console.error('Failed to save cart:', error)
      throw error
    }
  }

  /**
   * Get current cart
   * @returns {Cart}
   */
  getCart() {
    const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const itemCount = this.cart.reduce((sum, item) => sum + item.quantity, 0)

    return {
      items: this.cart,
      total,
      itemCount
    }
  }

  /**
   * Add product to cart
   * @param {Object} product
   * @returns {Cart}
   */
  addToCart(product) {
    try {
      const existingItem = this.cart.find(item => item.productId === product.id)

      if (existingItem) {
        existingItem.quantity += 1
      } else {
        this.cart.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image
        })
      }

      this.saveCart()
      return this.getCart()
    } catch (error) {
      console.error('Failed to add to cart:', error)
      throw error
    }
  }

  /**
   * Update item quantity
   * @param {number} productId
   * @param {number} quantity
   * @returns {Cart}
   */
  updateQuantity(productId, quantity) {
    try {
      if (quantity <= 0) {
        return this.removeFromCart(productId)
      }

      const item = this.cart.find(item => item.productId === productId)
      if (item) {
        item.quantity = quantity
        this.saveCart()
      }

      return this.getCart()
    } catch (error) {
      console.error('Failed to update quantity:', error)
      throw error
    }
  }

  /**
   * Remove item from cart
   * @param {number} productId
   * @returns {Cart}
   */
  removeFromCart(productId) {
    try {
      this.cart = this.cart.filter(item => item.productId !== productId)
      this.saveCart()
      return this.getCart()
    } catch (error) {
      console.error('Failed to remove from cart:', error)
      throw error
    }
  }

  /**
   * Clear entire cart
   * @returns {Cart}
   */
  clearCart() {
    try {
      this.cart = []
      this.saveCart()
      return this.getCart()
    } catch (error) {
      console.error('Failed to clear cart:', error)
      throw error
    }
  }

  /**
   * Get cart item count
   * @returns {number}
   */
  getItemCount() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0)
  }

  /**
   * Get cart total
   * @returns {number}
   */
  getTotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }
}