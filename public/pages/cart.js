/**
 * Shopping Cart Page
 * Displays cart items with quantity controls and order summary
 * Uses shared cart utility for data persistence
 */

import { onDOMReady } from '/js/shared/dom-ready.js'
import {
  getCartItems,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  getCartItemCount,
  updateCartBadge,
  initCartBadge,
  initCartEventListeners
} from '../js/shared/cart.js'
import { api } from '../js/shared/api-client.js'

// Delivery cost loaded from database
let DELIVERY_COST = 5.0 // Default fallback

// Get cart items from shared utility
const getCurrentCartItems = () => getCartItems()
let deliveryMethod = 'pickup' // 'pickup' or 'delivery'

/**
 * Load delivery cost from settings API
 */
async function loadDeliveryCost() {
  try {
    const result = await api.getValue('DELIVERY_COST_USD')

    if (result.success && result.data !== null) {
      DELIVERY_COST = parseFloat(result.data)
      console.log('Delivery cost loaded from database:', DELIVERY_COST)
    } else {
      console.warn('Delivery cost not found in database, using default:', DELIVERY_COST)
    }
  } catch (error) {
    console.error('Error loading delivery cost:', error)
    // Keep default value
  }
}

/**
 * Initialize cart page
 */
async function init() {
  // Load delivery cost from database first
  await loadDeliveryCost()

  // Initialize cart badge and event listeners
  initCartBadge()
  initCartEventListeners()

  // Back button
  const backButton = document.getElementById('back-button')
  backButton.addEventListener('click', () => {
    // Go back to previous page or home
    if (document.referrer && !document.referrer.includes('cart.html')) {
      window.history.back()
    } else {
      window.location.href = '/'
    }
  })

  // Delivery method radio buttons
  const deliveryRadios = document.querySelectorAll('input[name="delivery"]')
  deliveryRadios.forEach(radio => {
    radio.addEventListener('change', e => {
      deliveryMethod = e.target.value
      updateSummary()
    })
  })

  // Checkout button
  const checkoutButton = document.getElementById('checkout-button')
  checkoutButton.addEventListener('click', handleCheckout)

  // Clear cart button
  const clearCartButton = document.getElementById('clear-cart-button')
  clearCartButton.addEventListener('click', handleClearCart)

  // Update delivery cost display
  document.getElementById('delivery-cost-display').textContent = `$${DELIVERY_COST.toFixed(2)}`

  // Render cart
  renderCart()
}

/**
 * Render cart items
 */
function renderCart() {
  const cartItemsContainer = document.getElementById('cart-items')
  const emptyCart = document.getElementById('empty-cart')
  const checkoutButton = document.getElementById('checkout-button')
  const currentCartItems = getCurrentCartItems()

  if (currentCartItems.length === 0) {
    cartItemsContainer.innerHTML = ''
    emptyCart.classList.remove('hidden')
    checkoutButton.disabled = true
    document.getElementById('clear-cart-section').classList.add('hidden')
    updateSummary()
    return
  }

  emptyCart.classList.add('hidden')
  checkoutButton.disabled = false
  document.getElementById('clear-cart-section').classList.remove('hidden')

  cartItemsContainer.innerHTML = currentCartItems
    .map(
      (item, index) => `
    <div class="cart-item flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors" data-index="${index}">
      <!-- Product Image -->
      <div class="flex-shrink-0">
        <img
          src="${item.image_thumb}"
          alt="${item.name}"
          class="h-20 w-20 object-cover rounded-lg product-image"
        />
      </div>

      <!-- Product Info -->
      <div class="flex-1 min-w-0">
        <h3 class="text-lg font-semibold text-gray-900 truncate">${item.name}</h3>
        <p class="text-sm text-gray-500">Stock disponible: ${item.stock}</p>
        <p class="text-lg font-bold text-pink-600 mt-1">$${item.price_usd.toFixed(2)}</p>
      </div>

      <!-- Quantity Controls -->
      <div class="flex items-center space-x-3">
        <button
          class="btn-decrease h-8 w-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          ${item.quantity <= 1 ? 'disabled' : ''}
        >
          <i data-lucide="minus" class="h-4 w-4"></i>
        </button>
        <span class="text-lg font-semibold text-gray-900 w-8 text-center">${item.quantity}</span>
        <button
          class="btn-increase h-8 w-8 flex items-center justify-center rounded-full bg-pink-600 hover:bg-pink-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          ${item.quantity >= item.stock ? 'disabled' : ''}
        >
          <i data-lucide="plus" class="h-4 w-4"></i>
        </button>
      </div>

      <!-- Item Total -->
      <div class="text-right">
        <p class="text-lg font-bold text-gray-900">$${(item.price_usd * item.quantity).toFixed(2)}</p>
      </div>

      <!-- Remove Button -->
      <button
        class="btn-remove h-8 w-8 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
        aria-label="Eliminar producto"
      >
        <i data-lucide="trash-2" class="h-4 w-4"></i>
      </button>
    </div>
  `
    )
    .join('')

  // Attach event listeners to dynamically created buttons
  attachCartItemListeners()

  // Re-initialize Lucide icons for dynamically added elements
  if (window.lucide) {
    window.lucide.createIcons()
  }

  updateCartBadge(getTotalItems())
  updateSummary()
}

/**
 * Attach event listeners to cart item buttons (CSP-compliant)
 */
function attachCartItemListeners() {
  // Image fallback
  const images = document.querySelectorAll('.product-image')
  images.forEach(img => {
    img.addEventListener('error', function () {
      this.src = '../images/placeholder-flower.svg'
    })
  })

  // Quantity controls
  const cartItemElements = document.querySelectorAll('.cart-item')
  cartItemElements.forEach(item => {
    const index = parseInt(item.dataset.index, 10)

    // Decrease button
    const decreaseBtn = item.querySelector('.btn-decrease')
    if (decreaseBtn) {
      decreaseBtn.addEventListener('click', () => decreaseQuantity(index))
    }

    // Increase button
    const increaseBtn = item.querySelector('.btn-increase')
    if (increaseBtn) {
      increaseBtn.addEventListener('click', () => increaseQuantity(index))
    }

    // Remove button
    const removeBtn = item.querySelector('.btn-remove')
    if (removeBtn) {
      removeBtn.addEventListener('click', () => removeItem(index))
    }
  })
}

/**
 * Update order summary
 */
function updateSummary() {
  const currentCartItems = getCurrentCartItems()
  const subtotal = currentCartItems.reduce((sum, item) => sum + item.price_usd * item.quantity, 0)
  const shippingCost = deliveryMethod === 'delivery' ? DELIVERY_COST : 0
  const total = subtotal + shippingCost
  const totalItems = getTotalItems()

  document.getElementById('total-items').textContent = totalItems
  document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`
  document.getElementById('shipping-cost').textContent =
    shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : 'Gratis'
  document.getElementById('total').textContent = `$${total.toFixed(2)}`
}

/**
 * Get total number of items in cart
 */
function getTotalItems() {
  return getCartItemCount()
}

/**
 * Increase quantity
 */
function increaseQuantity(index) {
  const currentCartItems = getCurrentCartItems()
  const item = currentCartItems[index]
  if (item && item.quantity < item.stock) {
    updateCartItemQuantity(item.id, item.quantity + 1)
    renderCart()
  }
}

/**
 * Decrease quantity
 */
function decreaseQuantity(index) {
  const currentCartItems = getCurrentCartItems()
  const item = currentCartItems[index]
  if (item && item.quantity > 1) {
    updateCartItemQuantity(item.id, item.quantity - 1)
    renderCart()
  }
}

/**
 * Remove item from cart
 */
function removeItem(index) {
  // Confirm removal
  if (confirm('¿Deseas eliminar este producto del carrito?')) {
    const currentCartItems = getCurrentCartItems()
    const item = currentCartItems[index]
    if (item) {
      removeFromCart(item.id)
      renderCart()
    }
  }
}

/**
 * Handle checkout
 */
function handleCheckout() {
  const currentCartItems = getCurrentCartItems()
  const subtotal = currentCartItems.reduce((sum, item) => sum + item.price_usd * item.quantity, 0)
  const shippingCost = deliveryMethod === 'delivery' ? DELIVERY_COST : 0
  const total = subtotal + shippingCost

  console.log('Checkout:', {
    items: currentCartItems,
    deliveryMethod,
    subtotal,
    shippingCost,
    total
  })

  // Store cart data in localStorage before navigating to payment page
  localStorage.setItem('deliveryMethod', deliveryMethod)
  localStorage.setItem('orderSummary', JSON.stringify({ subtotal, shippingCost, total }))

  // Navigate to payment page
  window.location.href = '/pages/payment.html'
}

/**
 * Handle clear cart button click
 */
function handleClearCart() {
  const currentCartItems = getCurrentCartItems()

  if (currentCartItems.length === 0) {
    console.info('Cart is already empty')
    return
  }

  // Show confirmation dialog
  const itemCount = currentCartItems.length
  const itemText = itemCount === 1 ? 'producto' : 'productos'

  if (
    confirm(
      `¿Estás seguro de que deseas vaciar el carrito? Se eliminarán ${itemCount} ${itemText}.`
    )
  ) {
    try {
      // Clear the cart using shared function
      clearCart()

      // Update UI
      renderCart()

      // Show success feedback
      console.info(`Cart cleared successfully: ${itemCount} items removed`)

      // Optional: Show toast notification if available
      if (window.showToast) {
        window.showToast(`Carrito vaciado (${itemCount} ${itemText} eliminados)`, 'success')
      }
    } catch (error) {
      console.error('Failed to clear cart:', error)
      if (window.showToast) {
        window.showToast('Error al vaciar el carrito', 'error')
      }
    }
  }
}

// Initialize when DOM is ready
onDOMReady(async () => {
  // Initialize icons first (from global window.lucide)
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons()
  }

  // Then initialize cart functionality
  await init()
})
