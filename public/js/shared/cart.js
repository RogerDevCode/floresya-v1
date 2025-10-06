/**
 * Cart Utility - SSOT for shopping cart operations
 * Manages cart state in localStorage with real-time UI updates
 */

const CART_STORAGE_KEY = 'floresya_cart'
const CART_EVENTS = {
  UPDATED: 'cart:updated',
  ITEM_ADDED: 'cart:itemAdded',
  ITEM_REMOVED: 'cart:itemRemoved',
  CLEARED: 'cart:cleared'
}

/**
 * Get cart items from localStorage
 * @returns {Array} Cart items array
 */
export function getCartItems() {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error)
    return []
  }
}

/**
 * Save cart items to localStorage
 * @param {Array} items - Cart items to save
 */
function saveCartItems(items) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent(CART_EVENTS.UPDATED, { detail: { items } }))
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error)
  }
}

/**
 * Add item to cart
 * @param {Object} product - Product to add
 * @param {number} quantity - Quantity to add (default: 1)
 * @returns {Object} Updated cart item
 */
export function addToCart(product, quantity = 1) {
  if (!product || !product.id) {
    throw new Error('Invalid product data')
  }

  const items = getCartItems()
  const existingItem = items.find(item => item.id === product.id)

  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    items.push({
      id: product.id,
      name: product.name,
      price_usd: product.price_usd,
      quantity: quantity,
      stock: product.stock || 999, // Default high stock if not provided
      image_thumb:
        product.image_url_small || product.image_thumb || '/images/placeholder-flower.svg'
    })
  }

  saveCartItems(items)

  // Dispatch item added event
  window.dispatchEvent(
    new CustomEvent(CART_EVENTS.ITEM_ADDED, {
      detail: { product, quantity, items }
    })
  )

  return items.find(item => item.id === product.id)
}

/**
 * Remove item from cart
 * @param {number} productId - Product ID to remove
 * @returns {boolean} True if item was removed
 */
export function removeFromCart(productId) {
  const items = getCartItems()
  const filteredItems = items.filter(item => item.id !== productId)

  if (filteredItems.length !== items.length) {
    saveCartItems(filteredItems)

    // Dispatch item removed event
    window.dispatchEvent(
      new CustomEvent(CART_EVENTS.ITEM_REMOVED, {
        detail: { productId, items: filteredItems }
      })
    )

    return true
  }

  return false
}

/**
 * Update item quantity in cart
 * @param {number} productId - Product ID
 * @param {number} quantity - New quantity
 * @returns {Object|null} Updated cart item or null if not found
 */
export function updateCartItemQuantity(productId, quantity) {
  if (quantity < 0) {
    throw new Error('Quantity cannot be negative')
  }

  const items = getCartItems()
  const item = items.find(item => item.id === productId)

  if (!item) {
    return null
  }

  if (quantity === 0) {
    return removeFromCart(productId) ? null : item
  }

  item.quantity = Math.min(quantity, item.stock) // Don't exceed stock
  saveCartItems(items)

  return item
}

/**
 * Get total number of items in cart
 * @returns {number} Total item count
 */
/***
 * Get total number of unique items in cart
 * @returns {number} Total unique item count (not counting quantity)
 */
export function getCartItemCount() {
  const items = getCartItems()
  return items.length // Count the number of unique items, not the total quantity
}

/**
 * Get cart total price
 * @returns {number} Total price in USD
 */
export function getCartTotal() {
  const items = getCartItems()
  return items.reduce((total, item) => total + item.price_usd * item.quantity, 0)
}

/**
 * Clear all items from cart
 */
export function clearCart() {
  saveCartItems([])
  window.dispatchEvent(new CustomEvent(CART_EVENTS.CLEARED))
}

/**
 * Check if product is in cart
 * @param {number} productId - Product ID
 * @returns {boolean} True if product is in cart
 */
export function isInCart(productId) {
  const items = getCartItems()
  return items.some(item => item.id === productId)
}

/**
 * Get cart item by product ID
 * @param {number} productId - Product ID
 * @returns {Object|null} Cart item or null
 */
export function getCartItem(productId) {
  const items = getCartItems()
  return items.find(item => item.id === productId) || null
}

/**
 * Update cart badge in navbar
 * @param {number} count - Item count to display
 */
export function updateCartBadge(count) {
  const badge = document.querySelector('.cart-badge')
  if (badge) {
    badge.textContent = count
    badge.setAttribute('aria-label', `${count} productos`)
    // Hide badge if count is 0
    badge.style.display = count > 0 ? 'inline-flex' : 'none'
  }
}

/**
 * Initialize cart badge on page load
 */
export function initCartBadge() {
  const count = getCartItemCount()
  updateCartBadge(count)
}

/**
 * Listen for cart events and update UI accordingly
 */
export function initCartEventListeners() {
  // Update badge when cart changes
  window.addEventListener(CART_EVENTS.UPDATED, () => {
    const count = getCartItemCount()
    updateCartBadge(count)
  })

  // Show success message when item is added
  window.addEventListener(CART_EVENTS.ITEM_ADDED, event => {
    const { product, quantity } = event.detail
    showCartNotification(`${product.name} agregado al carrito (${quantity})`)
  })

  // Show notification when item is removed
  window.addEventListener(CART_EVENTS.ITEM_REMOVED, () => {
    showCartNotification('Producto eliminado del carrito')
  })
}

/**
 * Show cart notification (toast)
 * @param {string} message - Message to show
 */
function showCartNotification(message) {
  // Simple notification - could be enhanced with a proper toast system
  console.info('🛒', message)

  // If there's a toast system available, use it
  if (window.showToast) {
    window.showToast(message, 'success')
  }
}
