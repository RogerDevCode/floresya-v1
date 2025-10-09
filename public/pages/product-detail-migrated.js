/**
 * FloresYa - Product Detail Page (MIGRATED to API Client)
 * Versión migrada que usa el cliente API generado
 * Compatible con el contrato OpenAPI actualizado
 */

import { createIcons } from '/js/lucide-icons.js'
import { addToCart, updateCartBadge, isInCart } from '/js/shared/cart.js'
import { showToast } from '/js/components/toast.js'
import { api } from '/js/shared/api-client.js'

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
 * Load product using API client
 */
async function loadProduct(productId) {
  try {
    // Use API client instead of direct fetch
    const response = await api.getProductsById(productId)

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to load product')
    }

    return response.data
  } catch (error) {
    console.error(`loadProduct(${productId}) failed:`, error)
    throw error
  }
}

/**
 * Load product images using API client
 */
async function loadProductImages(productId) {
  try {
    // Use API client instead of direct fetch
    const response = await api.getProductImages(productId)

    if (!response.success) {
      console.warn('No product images available')
      return []
    }

    return response.data || []
  } catch (error) {
    console.error(`loadProductImages(${productId}) failed:`, error)
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

  // Reinitialize icons
  createIcons()
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

  // Reinitialize icons
  createIcons()
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
 * Add to cart handler using API client
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

        // Add to cart using shared module
        await addToCart(product, quantity)

        // Update badge
        updateCartBadge()

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

        // Add to cart using shared module
        await addToCart(product, quantity)

        // Update badge
        updateCartBadge()

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
 * Initialize page using API client
 */
async function init() {
  try {
    // Initialize Lucide icons first
    createIcons()

    // Get product ID from URL
    const productId = getProductIdFromURL()

    // Load product and images using API client
    const [product, images] = await Promise.all([
      loadProduct(productId),
      loadProductImages(productId)
    ])

    // Store in state
    currentProduct = product
    productImages = images

    // Render product
    renderProduct(product, images)

    // Initialize interactions
    initQuantityControls()
    initCartActions()
    updateCartBadge()

    // Mark page as loaded
    document.documentElement.classList.add('loaded')
  } catch (error) {
    console.error('Product detail page initialization failed:', error)

    // Use API client error handling
    const userMessage = api.handleError(error)
    showError(userMessage)
    throw error
  }
}

// Run on DOM ready
document.addEventListener('DOMContentLoaded', init)
