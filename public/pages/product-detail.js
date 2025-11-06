/**
 * FloresYa - Product Detail Page (ES6 Module)
 * Loads product details from API and renders UI
 */

import { onDOMReady } from '/js/shared/dom-ready.js'
// Static SVG icons used - no runtime initialization needed
import { addToCart, isInCart, initCartBadge, initCartEventListeners } from '/js/shared/cart.js'
import { showToast } from '/js/components/toast.js'
import { api } from '/js/shared/api-client.js'
import { TouchFeedback } from '/js/shared/touchFeedback.js'
import { loadingMessages } from '/js/components/loadingMessages.js'

/**
 * State
 */
let currentProduct = null
let productImages = []

/**
 * Get product ID from URL params
 */
function getProductIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search)
  const id = urlParams.get('id')

  if (!id) {
    throw new Error('Product ID is required in URL (?id=123)')
  }

  const productId = parseInt(id, 10)
  if (isNaN(productId) || productId <= 0) {
    throw new Error(`Invalid product ID: ${id}`)
  }

  return productId
}

/**
 * Fetch product by ID from API
 */
async function fetchProduct(productId) {
  try {
    const result = await api.getProductsById(productId)

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to load product')
    }

    return result.data
  } catch (error) {
    if (error.message.includes('404') || error.message.includes('not found')) {
      throw new Error('Producto no encontrado')
    }
    console.error(`fetchProduct(${productId}) failed:`, error)
    throw error
  }
}

/**
 * Fetch product images from API
 */
async function fetchProductImages(productId) {
  try {
    const result = await api.getProductImages(productId)

    if (!result.success || !result.data) {
      console.warn('No product images available')
      return []
    }

    return result.data
  } catch (error) {
    console.error(`fetchProductImages(${productId}) failed:`, error)
    // Non-critical: return empty array
    return []
  }
}

/**
 * Render product details
 */
function renderProduct(product, images) {
  // Update page title
  document.title = `${product.name} - FloresYa`

  // Update breadcrumb
  const breadcrumb = document.getElementById('breadcrumb-product')
  if (breadcrumb) {
    breadcrumb.textContent = product.name
  }

  // Title
  const titleEl = document.getElementById('product-title')
  if (titleEl) {
    titleEl.textContent = product.name
  }

  // Price USD
  const priceEl = document.getElementById('product-price')
  if (priceEl && product.price_usd) {
    priceEl.textContent = `$${product.price_usd.toFixed(2)}`
  }

  // Price VES (optional)
  const priceVesEl = document.getElementById('product-price-ves')
  if (priceVesEl && product.price_ves) {
    priceVesEl.textContent = `Bs ${product.price_ves.toFixed(2)}`
  }

  // Stock
  const stockEl = document.getElementById('stock-count')
  if (stockEl) {
    stockEl.textContent = product.stock || 0
  }

  // Description
  const descEl = document.getElementById('product-description')
  if (descEl) {
    descEl.textContent =
      product.description || 'Hermoso arreglo floral perfecto para cualquier ocasión especial.'
  }

  // Render images
  renderProductImages(images)

  // Show product content
  document.getElementById('loading-spinner').classList.add('hidden')
  document.getElementById('product-content').classList.remove('hidden')

  // Static SVG icons used - no runtime initialization needed
}

/**
 * Render product images (main + thumbnails)
 */
function renderProductImages(images) {
  const mainImageEl = document.getElementById('main-image')
  const thumbnailsContainer = document.getElementById('thumbnails-container')

  if (!mainImageEl || !thumbnailsContainer) {
    return
  }

  // Filter images by size (prefer 'medium' for main, 'thumb' for thumbnails)
  const mediumImages = images.filter(img => img.size === 'medium')
  const thumbImages = images.filter(img => img.size === 'thumb')

  // Fallback to placeholder if no images
  if (mediumImages.length === 0) {
    mainImageEl.src = '/images/placeholder-flower.svg'
    mainImageEl.alt = 'Imagen no disponible'
    thumbnailsContainer.innerHTML =
      '<p class="col-span-4 text-center text-gray-500 text-sm">No hay imágenes disponibles</p>'
    return
  }

  // Set main image to first medium image
  mainImageEl.src = mediumImages[0].url
  mainImageEl.alt = currentProduct?.name || 'Producto'

  // Image error handler
  mainImageEl.addEventListener('error', function () {
    console.warn('Main image failed to load:', this.src)
    this.src = '/images/placeholder-flower.svg'
  })

  // Render thumbnails
  if (thumbImages.length > 0) {
    thumbnailsContainer.innerHTML = thumbImages
      .map(
        (img, index) => `
      <button
        type="button"
        class="thumbnail-btn aspect-square rounded-lg overflow-hidden border-2 ${index === 0 ? 'border-pink-600' : 'border-gray-300'} hover:border-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500"
        data-medium-url="${mediumImages[index]?.url || img.url}"
        aria-label="Ver imagen ${index + 1}"
      >
        <img
          src="${img.url}"
          alt="Thumbnail ${index + 1}"
          class="w-full h-full object-cover"
          loading="lazy"
        />
      </button>
    `
      )
      .join('')

    // Add click handlers to thumbnails
    const thumbnailBtns = thumbnailsContainer.querySelectorAll('.thumbnail-btn')
    thumbnailBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const mediumUrl = btn.getAttribute('data-medium-url')
        if (mediumUrl) {
          mainImageEl.src = mediumUrl

          // Update active thumbnail border
          thumbnailBtns.forEach(b => b.classList.replace('border-pink-600', 'border-gray-300'))
          btn.classList.replace('border-gray-300', 'border-pink-600')
        }
      })
    })
  } else {
    thumbnailsContainer.innerHTML =
      '<p class="col-span-4 text-center text-gray-500 text-sm">Solo 1 imagen disponible</p>'
  }
}

/**
 * Show error message
 */
function showError(message) {
  document.getElementById('loading-spinner').classList.add('hidden')
  document.getElementById('product-content').classList.add('hidden')

  const errorContainer = document.getElementById('error-message')
  const errorText = document.getElementById('error-text')

  if (errorContainer && errorText) {
    errorText.textContent = message
    errorContainer.classList.remove('hidden')
  }

  // Static SVG icons used - no runtime initialization needed
}

/**
 * Initialize quantity controls
 */
function initQuantityControls() {
  const qtyInput = document.getElementById('quantity-input')
  const qtyMinus = document.getElementById('qty-minus')
  const qtyPlus = document.getElementById('qty-plus')

  if (!qtyInput || !qtyMinus || !qtyPlus) {
    return
  }

  // Initialize touch feedback for quantity controls using TouchFeedback
  if (qtyMinus) {
    new TouchFeedback(qtyMinus)
  }
  if (qtyPlus) {
    new TouchFeedback(qtyPlus)
  }
  if (qtyInput) {
    new TouchFeedback(qtyInput)
  }

  qtyMinus.addEventListener('click', () => {
    const currentValue = parseInt(qtyInput.value, 10) || 1
    if (currentValue > 1) {
      qtyInput.value = currentValue - 1
    }
  })

  qtyPlus.addEventListener('click', () => {
    const currentValue = parseInt(qtyInput.value, 10) || 1
    const maxStock = currentProduct?.stock || 999
    if (currentValue < maxStock) {
      qtyInput.value = currentValue + 1
    }
  })

  // Validate input on change
  qtyInput.addEventListener('input', () => {
    const value = parseInt(qtyInput.value, 10)
    const maxStock = currentProduct?.stock || 999

    if (isNaN(value) || value < 1) {
      qtyInput.value = 1
    } else if (value > maxStock) {
      qtyInput.value = maxStock
    }
  })
}

/**
 * Add to cart handler
 */
function initCartActions() {
  const addToCartBtn = document.getElementById('add-to-cart-btn')
  const buyNowBtn = document.getElementById('buy-now-btn')
  const qtyInput = document.getElementById('quantity-input')

  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', async () => {
      if (!currentProduct) {
        showToast('Error: Producto no cargado correctamente', 'error')
        return
      }

      const quantity = parseInt(qtyInput?.value || '1', 10)

      // Check stock
      if (quantity > currentProduct.stock) {
        showToast(`Solo hay ${currentProduct.stock} unidades disponibles`, 'warning')
        return
      }

      try {
        // Check if product is already in cart
        if (isInCart(currentProduct.id)) {
          showToast(`El producto "${currentProduct.name}" ya está en el carrito`, 'info')
          return
        }

        // Create product object for shared cart module
        const product = {
          id: currentProduct.id,
          name: currentProduct.name,
          price_usd: currentProduct.price_usd,
          image_url_small:
            productImages.find(img => img.size === 'small')?.url || '/images/placeholder-flower.svg'
        }

        // Add to cart using shared module (automatically updates badge via event)
        await addToCart(product, quantity)

        // Success feedback
        showToast(
          `✓ ${currentProduct.name} agregado al carrito (${quantity} unidad${quantity > 1 ? 'es' : ''})`,
          'success'
        )

        // Stay on the same page - no redirection
      } catch (error) {
        console.error('Error adding to cart:', error)
        showToast('Error al agregar el producto al carrito', 'error')
      }
    })
  }

  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', async () => {
      if (!currentProduct) {
        showToast('Error: Producto no cargado correctamente', 'error')
        return
      }

      const quantity = parseInt(qtyInput?.value || '1', 10)

      // Check stock
      if (quantity > currentProduct.stock) {
        showToast(`Solo hay ${currentProduct.stock} unidades disponibles`, 'warning')
        return
      }

      try {
        // Check if product is already in cart
        if (isInCart(currentProduct.id)) {
          showToast(
            `El producto "${currentProduct.name}" ya está en el carrito. Redirigiendo al pago...`,
            'info'
          )
          // Redirect to payment page after a short delay
          setTimeout(() => {
            window.location.href = '/pages/payment.html'
          }, 1500)
          return
        }

        // Create product object for shared cart module
        const product = {
          id: currentProduct.id,
          name: currentProduct.name,
          price_usd: currentProduct.price_usd,
          image_url_small:
            productImages.find(img => img.size === 'small')?.url || '/images/placeholder-flower.svg'
        }

        // Add to cart using shared module (automatically updates badge via event)
        await addToCart(product, quantity)

        // Success feedback
        showToast(
          `✓ ${currentProduct.name} agregado al carrito. Redirigiendo al pago...`,
          'success'
        )

        // Redirect to payment page after a short delay to show the toast
        setTimeout(() => {
          window.location.href = '/pages/payment.html'
        }, 1500)
      } catch (error) {
        console.error('Error adding to cart:', error)
        showToast('Error al procesar la compra', 'error')
      }
    })
  }
}

/**
 * Initialize page
 */
async function init() {
  try {
    // Static SVG icons used - no runtime initialization needed

    // 🌸 Easter Egg: Inicializar mensajes florales de carga
    loadingMessages.applyToId('loading-spinner')

    // Get product ID from URL
    const productId = getProductIdFromURL()

    // Fetch product and images in parallel
    const [product, images] = await Promise.all([
      fetchProduct(productId),
      fetchProductImages(productId)
    ])

    // Store in state
    currentProduct = product
    productImages = images

    // Render product
    renderProduct(product, images)

    // Initialize cart badge and event listeners
    initCartBadge()
    initCartEventListeners()

    // Initialize interactions
    initQuantityControls()
    initCartActions()

    // Initialize touch feedback for product page buttons
    initProductButtonTouchFeedback()

    // Mark page as loaded
    document.documentElement.classList.add('loaded')
  } catch (error) {
    console.error('Product detail page initialization failed:', error)
    showError(error.message || 'Error al cargar el producto')
    throw error
  }
}

/**
 * Initialize touch feedback for product page buttons
 */
function initProductButtonTouchFeedback() {
  // Add to cart button
  const addToCartBtn = document.getElementById('add-to-cart-btn')
  if (addToCartBtn) {
    const feedback = new TouchFeedback({
      type: 'ripple',
      haptic: 'medium',
      color: 'rgba(236, 72, 153, 0.3)',
      duration: 300
    })
    feedback.init(addToCartBtn)
    addToCartBtn._touchFeedback = feedback
  }

  // Buy now button
  const buyNowBtn = document.getElementById('buy-now-btn')
  if (buyNowBtn) {
    const feedback = new TouchFeedback({
      type: 'ripple',
      haptic: 'medium',
      color: 'rgba(16, 185, 129, 0.3)',
      duration: 300
    })
    feedback.init(buyNowBtn)
    buyNowBtn._touchFeedback = feedback
  }

  console.log('✅ Touch feedback initialized for product page buttons')
}

// Run on DOM ready using the safe utility
onDOMReady(init)
