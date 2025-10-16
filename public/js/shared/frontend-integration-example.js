/**
 * Frontend Integration Example
 * Muestra cómo usar el cliente API generado en páginas reales
 * Compatible con el contrato OpenAPI actualizado
 */

import { enhancedApi, api } from './api-enhanced.js'

/**
 * Ejemplo: Página de listado de productos
 */
export async function loadProductsPage() {
  try {
    // Mostrar loading
    showLoading('products-container')

    // Cargar productos con caché
    const products = await enhancedApi.getProductsCached({
      featured: true,
      limit: 20,
      imageSize: 'medium'
    })

    // Renderizar productos
    renderProducts(products)

    // Cargar configuración del sitio
    const config = await enhancedApi.getFrontendConfig()
    updateSiteBranding(config)
  } catch (error) {
    enhancedApi.handleError(error, 'Products Page')
    showError('Error loading products. Please try again.')
  }
}

/**
 * Ejemplo: Página de detalle de producto
 */
export async function loadProductDetail(productId) {
  try {
    showLoading('product-detail-container')

    // Cargar producto con imágenes
    const { product, images } = await enhancedApi.getProductWithImages(productId)

    // Renderizar detalle
    renderProductDetail(product, images)

    // Configurar galería de imágenes
    setupImageGallery(images)

    // Configurar botón de agregar al carrito
    setupAddToCart(product)
  } catch (error) {
    if (error.message.includes('404')) {
      showError('Product not found')
    } else {
      enhancedApi.handleError(error, 'Product Detail')
    }
  }
}

/**
 * Ejemplo: Funcionalidad de búsqueda
 */
export function setupProductSearch() {
  const searchInput = document.querySelector('#product-search')

  if (!searchInput) {
    return
  }

  let searchTimeout

  searchInput.addEventListener('input', e => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(async () => {
      const query = e.target.value.trim()

      if (query.length >= 2) {
        try {
          const results = await enhancedApi.searchProducts(query)
          showSearchResults(results)
        } catch (error) {
          console.error('Search failed:', error)
        }
      } else {
        hideSearchResults()
      }
    }, 300) // Debounce 300ms
  })
}

/**
 * Ejemplo: Carrito de compras
 */
export async function addProductToCart(productId, quantity = 1) {
  try {
    // Agregar al carrito
    const cart = await enhancedApi.addToCart(productId, quantity)

    // Mostrar feedback al usuario
    showSuccess(`Added ${quantity} item(s) to cart`)

    // Actualizar contador del carrito
    updateCartCounter(cart)

    // Opcional: mostrar mini carrito
    showMiniCart(cart)
  } catch (error) {
    if (error.message.includes('stock')) {
      showError('Not enough stock available')
    } else {
      enhancedApi.handleError(error, 'Add to Cart')
    }
  }
}

/**
 * Ejemplo: Proceso de checkout
 */
export async function processCheckout(orderData) {
  try {
    // Validar datos del formulario
    const validation = validateCheckoutForm(orderData)
    if (!validation.isValid) {
      showFormErrors(validation.errors)
      return
    }

    // Mostrar loading
    showLoading('checkout-container')

    // Crear pedido
    const order = await enhancedApi.createOrder(orderData)

    // Redirigir a confirmación
    window.location.href = `/order-confirmation/${order.id}`
  } catch (error) {
    if (error.message.includes('Validation')) {
      showFormErrors(error.message.split(', '))
    } else {
      enhancedApi.handleError(error, 'Checkout')
    }
  }
}

/**
 * Ejemplo: Configuración de imagen de carrusel
 */
export async function setupImageCarousel(productId) {
  try {
    const images = await api.getProductImages(productId)

    if (images.data.length === 0) {
      showPlaceholderImage()
      return
    }

    // Crear carrusel con las imágenes
    createCarousel(images.data)

    // Configurar navegación
    setupCarouselNavigation()

    // Configurar lazy loading
    setupLazyLoading()
  } catch (error) {
    console.error('Failed to load carousel images:', error)
    showPlaceholderImage()
  }
}

/**
 * Ejemplo: Carga de configuración del sitio
 */
export async function loadSiteConfiguration() {
  try {
    const config = await enhancedApi.getFrontendConfig()

    // Actualizar branding
    document.title = `${config.siteName} - Flower Delivery`
    const siteNameElement = document.querySelector('.site-name')
    if (siteNameElement) {
      siteNameElement.textContent = config.siteName
    }

    // Actualizar información de contacto
    const contactInfo = document.querySelector('.contact-info')
    if (contactInfo) {
      contactInfo.innerHTML = `
        <p>📞 ${config.contactInfo.phone}</p>
        <p>✉️ ${config.contactInfo.email}</p>
        <p>📍 ${config.contactInfo.address}</p>
      `
    }

    // Actualizar horario de atención
    const businessHoursElement = document.querySelector('.business-hours')
    if (businessHoursElement) {
      businessHoursElement.textContent = `Horario: ${config.businessHours}`
    }

    // Configurar moneda
    window.siteCurrency = config.currency
    window.exchangeRate = config.exchangeRate
  } catch (error) {
    console.error('Failed to load site configuration:', error)
    // Usar configuración por defecto
    const defaultConfig = enhancedApi.getDefaultConfig()
    console.log('Using default configuration:', defaultConfig)
  }
}

// ==================== FUNCIONES AUXILIARES ====================

// Placeholder functions for example purposes
function updateSiteBranding(config) {
  console.log('updateSiteBranding', config)
}
function renderProductDetail(product, images) {
  console.log('renderProductDetail', product, images)
}
function setupImageGallery(images) {
  console.log('setupImageGallery', images)
}
function showSearchResults(results) {
  console.log('showSearchResults', results)
}
function hideSearchResults() {
  console.log('hideSearchResults')
}
function showMiniCart(cart) {
  console.log('showMiniCart', cart)
}
function validateCheckoutForm(_orderData) {
  return { isValid: true, errors: [] }
}
function showFormErrors(errors) {
  console.log('showFormErrors', errors)
}
function showPlaceholderImage() {
  console.log('showPlaceholderImage')
}
function createCarousel(images) {
  console.log('createCarousel', images)
}
function setupCarouselNavigation() {
  console.log('setupCarouselNavigation')
}
function setupLazyLoading() {
  console.log('setupLazyLoading')
}

/**
 * Mostrar loading state
 */
function showLoading(containerId) {
  const container = document.getElementById(containerId)
  if (container) {
    container.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>
    `
  }
}

/**
 * Mostrar error
 */
function showError(message) {
  const errorDiv = document.querySelector('.error-message') || createErrorDiv()
  errorDiv.textContent = message
  errorDiv.style.display = 'block'
}

/**
 * Mostrar success message
 */
function showSuccess(message) {
  const successDiv = document.querySelector('.success-message') || createSuccessDiv()
  successDiv.textContent = message
  successDiv.style.display = 'block'

  setTimeout(() => {
    successDiv.style.display = 'none'
  }, 3000)
}

/**
 * Renderizar productos
 */
function renderProducts(products) {
  const container = document.getElementById('products-container')
  if (!container) {
    return
  }

  container.innerHTML = products
    .map(
      product => `
    <div class="product-card" data-product-id="${product.id}">
      <img src="${getProductImage(product)}" alt="${product.name}" loading="lazy">
      <h3>${product.name}</h3>
      <p class="price">${enhancedApi.formatCurrency(product.price_usd)}</p>
      <p class="stock">${product.stock} available</p>
      <button onclick="addProductToCart(${product.id})"
              ${product.stock === 0 ? 'disabled' : ''}>
        ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  `
    )
    .join('')
}

/**
 * Obtener imagen de producto
 */
function getProductImage(product) {
  // Si el producto tiene imágenes, usar la primera
  if (product.images && product.images.length > 0) {
    return product.images[0].url
  }
  // Placeholder por defecto
  return '/images/placeholder-flower.svg'
}

/**
 * Configurar add to cart
 */
function setupAddToCart(product) {
  const addToCartBtn = document.querySelector('.add-to-cart-btn')
  if (!addToCartBtn) {
    return
  }

  addToCartBtn.addEventListener('click', () => {
    const quantity = parseInt(document.querySelector('.quantity-input')?.value || '1')
    addProductToCart(product.id, quantity)
  })
}

/**
 * Actualizar contador del carrito
 */
function updateCartCounter(cart) {
  const counter = document.querySelector('.cart-counter')
  if (counter) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
    counter.textContent = totalItems
    counter.style.display = totalItems > 0 ? 'block' : 'none'
  }
}

/**
 * Crear elementos de UI
 */
function createErrorDiv() {
  const div = document.createElement('div')
  div.className = 'error-message'
  div.style.cssText =
    'color: red; padding: 10px; margin: 10px 0; background: #fee; border: 1px solid #fcc;'
  document.body.appendChild(div)
  return div
}

function createSuccessDiv() {
  const div = document.createElement('div')
  div.className = 'success-message'
  div.style.cssText =
    'color: green; padding: 10px; margin: 10px 0; background: #efe; border: 1px solid #cfc;'
  document.body.appendChild(div)
  return div
}

// ==================== INICIALIZACIÓN ====================

/**
 * Inicializar integración API en página
 */
export function initializeApiIntegration() {
  // Cargar configuración del sitio
  loadSiteConfiguration()

  // Configurar búsqueda si existe input
  setupProductSearch()

  // Configurar carrito si existe contador
  const cartCounter = document.querySelector('.cart-counter')
  if (cartCounter) {
    const cart = enhancedApi.getCart()
    updateCartCounter(cart)
  }

  console.log('✅ API integration initialized')
}

import { onDOMReady } from './dom-ready.js'

// Auto-inicializar si el script se carga directamente
onDOMReady(initializeApiIntegration)
