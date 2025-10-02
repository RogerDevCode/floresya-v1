/**
 * Shopping Cart Page
 * Displays cart items with quantity controls and order summary
 * Uses mock data for now - will be replaced with real cart data from localStorage/API
 */

// Mock cart data (will be replaced with real data)
const MOCK_CART_ITEMS = [
  {
    id: 67,
    name: 'Ramo Tropical Vibrante',
    price_usd: 45.99,
    quantity: 2,
    stock: 15,
    image_thumb: '../images/placeholder-flower.svg' // Using placeholder until real images available
  },
  {
    id: 68,
    name: 'Rosas Rojas Clásicas',
    price_usd: 35.5,
    quantity: 1,
    stock: 20,
    image_thumb: '../images/placeholder-flower.svg'
  },
  {
    id: 69,
    name: 'Orquídeas Elegantes',
    price_usd: 65.0,
    quantity: 1,
    stock: 8,
    image_thumb: '../images/placeholder-flower.svg'
  }
]

// Mock delivery cost (will be fetched from /api/settings/public)
const DELIVERY_COST = 5.0

// Cart state
const cartItems = [...MOCK_CART_ITEMS]
let deliveryMethod = 'pickup' // 'pickup' or 'delivery'

/**
 * Initialize cart page
 */
function init() {
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

  if (cartItems.length === 0) {
    cartItemsContainer.innerHTML = ''
    emptyCart.classList.remove('hidden')
    checkoutButton.disabled = true
    updateCartBadge(0)
    updateSummary()
    return
  }

  emptyCart.classList.add('hidden')
  checkoutButton.disabled = false

  cartItemsContainer.innerHTML = cartItems
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
  const subtotal = cartItems.reduce((sum, item) => sum + item.price_usd * item.quantity, 0)
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
  return cartItems.reduce((sum, item) => sum + item.quantity, 0)
}

/**
 * Update cart badge in navbar
 */
function updateCartBadge(count) {
  const badge = document.getElementById('cart-count-badge')
  if (badge) {
    badge.textContent = count
    badge.classList.toggle('hidden', count === 0)
  }
}

/**
 * Increase quantity
 */
function increaseQuantity(index) {
  const item = cartItems[index]
  if (item.quantity < item.stock) {
    item.quantity++
    renderCart()
  }
}

/**
 * Decrease quantity
 */
function decreaseQuantity(index) {
  const item = cartItems[index]
  if (item.quantity > 1) {
    item.quantity--
    renderCart()
  }
}

/**
 * Remove item from cart
 */
function removeItem(index) {
  // Confirm removal
  if (confirm('¿Deseas eliminar este producto del carrito?')) {
    cartItems.splice(index, 1)
    renderCart()
  }
}

/**
 * Handle checkout
 */
function handleCheckout() {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price_usd * item.quantity, 0)
  const shippingCost = deliveryMethod === 'delivery' ? DELIVERY_COST : 0
  const total = subtotal + shippingCost

  console.log('Checkout:', {
    items: cartItems,
    deliveryMethod,
    subtotal,
    shippingCost,
    total
  })

  alert(
    `Procesando compra:\n\nSubtotal: $${subtotal.toFixed(2)}\nEnvío: $${shippingCost.toFixed(2)}\nTotal: $${total.toFixed(2)}\n\nMétodo: ${deliveryMethod === 'pickup' ? 'Recoger en tienda' : 'Envío a domicilio'}`
  )

  // TODO: Navigate to checkout page
  /* Store cart items in localStorage before navigating */
  localStorage.setItem('cartItems', JSON.stringify(cartItems))

  // Navigate to payment page
  window.location.href = '/pages/payment.html'
  // window.location.href = '/pages/checkout.html'
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize icons first (from global window.lucide)
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons()
  }

  // Then initialize cart functionality
  init()
})
