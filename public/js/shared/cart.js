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
  try {
    const items = getCartItems()
    if (items.length === 0) {
      console.info('Cart is already empty')
      return false
    }

    saveCartItems([])

    // Dispatch cleared event with item count for notifications
    window.dispatchEvent(
      new CustomEvent(CART_EVENTS.CLEARED, {
        detail: { previousItemCount: items.length }
      })
    )

    console.info(`Cart cleared: ${items.length} items removed`)
    return true
  } catch (error) {
    console.error('Failed to clear cart:', error)
    return false
  }
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
  // Try to find badge by class first (index.html, contacto.html)
  let badge = document.querySelector('.cart-badge')

  // If not found, try by ID (cart.html, payment.html, product-detail.html)
  if (!badge) {
    badge = document.querySelector('#cart-count-badge') || document.querySelector('#cart-count')
  }

  if (badge) {
    const previousCount = parseInt(badge.textContent, 10) || 0

    // Update badge content
    badge.textContent = count
    badge.setAttribute('aria-label', `${count} productos`)

    // Hide badge if count is 0
    badge.style.display = count > 0 ? 'inline-flex' : 'none'

    // Add touch feedback animation when count changes
    if (previousCount !== count && count > previousCount) {
      // Pulse animation for item added
      badge.classList.add('cart-badge--pulse')
      setTimeout(() => {
        badge.classList.remove('cart-badge--pulse')
      }, 300)

      // Trigger haptic feedback if supported
      if ('vibrate' in navigator) {
        navigator.vibrate(10)
      }
    } else if (previousCount !== count && count < previousCount) {
      // Shake animation for item removed
      badge.classList.add('cart-badge--shake')
      setTimeout(() => {
        badge.classList.remove('cart-badge--shake')
      }, 300)
    }
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
 * Force update cart badge (useful for cross-page synchronization)
 */
export function forceUpdateCartBadge() {
  const count = getCartItemCount()
  updateCartBadge(count)
  return count
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

  // Show notification when cart is cleared
  window.addEventListener(CART_EVENTS.CLEARED, event => {
    const { previousItemCount } = event.detail || {}
    if (previousItemCount && previousItemCount > 0) {
      showCartNotification(`Carrito vaciado (${previousItemCount} productos eliminados)`)
    } else {
      showCartNotification('Carrito vaciado')
    }
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

  // Trigger haptic feedback for cart notification
  if ('vibrate' in navigator) {
    // Double tap for cart notification
    navigator.vibrate([10, 50, 10])
  }
}

/**
 * Test function to verify cart functionality (for development)
 * Can be called from browser console: window.testCart()
 */
export function testCart() {
  console.log('🧪 Testing cart functionality...')

  // Test 1: Check if cart is empty
  const initialCount = getCartItemCount()
  console.log(`Initial cart count: ${initialCount}`)

  // Test 2: Add a test product
  const testProduct = {
    id: 999,
    name: 'Producto de Prueba',
    price_usd: 10.5,
    image_url_small: '/images/placeholder-flower.svg'
  }

  console.log('Adding test product...')
  addToCart(testProduct, 2)

  // Test 3: Check if product was added
  const newCount = getCartItemCount()
  console.log(`Cart count after adding: ${newCount}`)

  // Test 4: Check cart items
  const items = getCartItems()
  console.log('Cart items:', items)

  // Test 5: Clear cart
  console.log('Clearing cart...')
  clearCart()

  // Test 6: Verify cart is empty
  const finalCount = getCartItemCount()
  console.log(`Final cart count: ${finalCount}`)

  console.log('✅ Cart test completed!')
  return {
    initialCount,
    newCount,
    finalCount,
    success: finalCount === 0
  }
}

/**
 * Initialize touch feedback for cart elements
 */
export function initCartTouchFeedback() {
  // Touch feedback for cart icons/badges
  const cartBadges = document.querySelectorAll('.cart-badge, #cart-count-badge, #cart-count')
  cartBadges.forEach(badge => {
    // Add scale feedback on touch
    badge.addEventListener('touchstart', () => {
      badge.style.transform = 'scale(1.1)'
    })

    badge.addEventListener('touchend', () => {
      badge.style.transform = 'scale(1)'
    })

    // Add click feedback
    badge.addEventListener('click', () => {
      // Pulse animation on click
      badge.classList.add('cart-badge--pulse')
      setTimeout(() => {
        badge.classList.remove('cart-badge--pulse')
      }, 300)

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(5)
      }
    })
  })

  // Touch feedback for cart buttons
  const cartButtons = document.querySelectorAll('.cart-btn, .add-to-cart-btn, .view-cart-btn')
  cartButtons.forEach(button => {
    // Add ripple effect to cart buttons
    button.addEventListener('touchstart', e => {
      const ripple = document.createElement('span')
      ripple.className = 'cart-button-ripple'

      const rect = button.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.touches[0].clientX - rect.left - size / 2
      const y = e.touches[0].clientY - rect.top - size / 2

      ripple.style.width = ripple.style.height = size + 'px'
      ripple.style.left = x + 'px'
      ripple.style.top = y + 'px'

      button.appendChild(ripple)

      // Remove ripple after animation
      setTimeout(() => {
        ripple.remove()
      }, 600)
    })
  })

  console.log('✅ Touch feedback initialized for cart elements')
}

// Make test function available globally for debugging
if (typeof window !== 'undefined') {
  window.testCart = testCart
  window.initCartTouchFeedback = initCartTouchFeedback
}
