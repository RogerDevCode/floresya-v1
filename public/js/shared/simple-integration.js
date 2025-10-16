/**
 * Simple Frontend Integration Example
 * Muestra cómo usar el cliente API generado en páginas reales
 */

import { api } from './api-client.js'

/**
 * Ejemplo simple: Cargar productos en página principal
 */
export async function loadFeaturedProducts() {
  try {
    console.log('🌸 Loading featured products...')

    // Llamar API usando el cliente generado
    const response = await api.getAllProducts({
      featured: true,
      limit: 8,
      imageSize: 'medium'
    })

    console.log('✅ Products loaded:', response.data?.length || 0)

    // Renderizar productos (implementar según tu UI)
    renderFeaturedProducts(response.data)

    return response.data
  } catch (error) {
    console.error('❌ Failed to load products:', api.handleError(error))
    showErrorMessage('Error loading products')
    return []
  }
}

/**
 * Ejemplo simple: Buscar productos
 */
export async function searchProducts(query) {
  try {
    if (!query || query.length < 2) {
      return []
    }

    console.log('🔍 Searching products:', query)

    const response = await api.getAllProducts({
      search: query,
      limit: 10
    })

    console.log('✅ Search results:', response.data?.length || 0)
    return response.data || []
  } catch (error) {
    console.error('❌ Search failed:', api.handleError(error))
    return []
  }
}

/**
 * Ejemplo simple: Cargar detalle de producto
 */
export async function loadProductDetail(productId) {
  try {
    console.log('📦 Loading product detail:', productId)

    // Cargar producto e imágenes en paralelo
    const [productResponse, imagesResponse] = await Promise.all([
      api.getProductsById(productId),
      api.getProductImages(productId)
    ])

    const productData = {
      product: productResponse.data,
      images: imagesResponse.data
    }

    console.log('✅ Product detail loaded')
    renderProductDetail(productData)

    return productData
  } catch (error) {
    if (error.message.includes('404')) {
      console.error('❌ Product not found:', productId)
      showErrorMessage('Product not found')
    } else {
      console.error('❌ Failed to load product:', api.handleError(error))
      showErrorMessage('Error loading product details')
    }
    throw error
  }
}

/**
 * Ejemplo simple: Crear pedido
 */
export async function createOrder(orderData) {
  try {
    // Validar datos antes de enviar
    const validation = validateOrderData(orderData)
    if (!validation.isValid) {
      showErrorMessage('Please check your information: ' + validation.errors.join(', '))
      return null
    }

    console.log('🛒 Creating order...')

    const response = await api.createOrders(orderData)

    console.log('✅ Order created:', response.data.id)
    showSuccessMessage('Order created successfully!')

    return response.data
  } catch (error) {
    console.error('❌ Failed to create order:', api.handleError(error))
    showErrorMessage('Failed to create order. Please try again.')
    return null
  }
}

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Validar datos de pedido
 */
function validateOrderData(orderData) {
  const errors = []

  if (!orderData.order.customer_email) {
    errors.push('Email is required')
  }

  if (!orderData.order.customer_name) {
    errors.push('Name is required')
  }

  if (!orderData.order.customer_phone) {
    errors.push('Phone is required')
  }

  if (!orderData.order.delivery_address) {
    errors.push('Delivery address is required')
  }

  if (!orderData.items || orderData.items.length === 0) {
    errors.push('Order must contain at least one item')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Renderizar productos featured (placeholder)
 */
function renderFeaturedProducts(products) {
  const container = document.getElementById('featured-products')
  if (!container) {
    return
  }

  if (!products || products.length === 0) {
    container.innerHTML = '<p>No products available</p>'
    return
  }

  container.innerHTML = products
    .map(
      product => `
    <div class="product-item">
      <h3>${product.name}</h3>
      <p>Price: $${product.price_usd}</p>
      <p>Stock: ${product.stock}</p>
      <button onclick="loadProductDetail(${product.id})">View Details</button>
    </div>
  `
    )
    .join('')
}

/**
 * Renderizar detalle de producto (placeholder)
 */
function renderProductDetail(data) {
  const container = document.getElementById('product-detail')
  if (!container) {
    return
  }

  const { product, images } = data

  container.innerHTML = `
    <h1>${product.name}</h1>
    <p>${product.description || 'No description available'}</p>
    <p><strong>Price:</strong> $${product.price_usd}</p>
    <p><strong>Stock:</strong> ${product.stock}</p>
    <p><strong>Images:</strong> ${images?.length || 0} available</p>
  `
}

/**
 * Mostrar mensaje de error
 */
function showErrorMessage(message) {
  // Crear o actualizar elemento de error
  let errorDiv = document.getElementById('error-message')
  if (!errorDiv) {
    errorDiv = document.createElement('div')
    errorDiv.id = 'error-message'
    errorDiv.style.cssText =
      'color: red; padding: 10px; margin: 10px 0; background: #fee; border: 1px solid #fcc; border-radius: 4px;'
    document.body.appendChild(errorDiv)
  }

  errorDiv.textContent = message
  errorDiv.style.display = 'block'

  // Auto-ocultar después de 5 segundos
  setTimeout(() => {
    errorDiv.style.display = 'none'
  }, 5000)
}

/**
 * Mostrar mensaje de éxito
 */
function showSuccessMessage(message) {
  let successDiv = document.getElementById('success-message')
  if (!successDiv) {
    successDiv = document.createElement('div')
    successDiv.id = 'success-message'
    successDiv.style.cssText =
      'color: green; padding: 10px; margin: 10px 0; background: #efe; border: 1px solid #cfc; border-radius: 4px;'
    document.body.appendChild(successDiv)
  }

  successDiv.textContent = message
  successDiv.style.display = 'block'

  setTimeout(() => {
    successDiv.style.display = 'none'
  }, 3000)
}

// ==================== INICIALIZACIÓN ====================

/**
 * Inicializar integración API
 */
export function initializeApiIntegration() {
  console.log('🚀 Initializing API integration...')

  // Hacer funciones disponibles globalmente para HTML onclick
  window.loadProductDetail = loadProductDetail
  window.searchProducts = searchProducts
  window.createOrder = createOrder

  console.log('✅ API integration ready')
}

import { onDOMReady } from './dom-ready.js'

// Auto-inicializar
onDOMReady(initializeApiIntegration)
