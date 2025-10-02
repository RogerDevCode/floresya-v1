/**
 * Admin Panel - Product Management
 * Mock implementation for product editing and image management
 */

// Import dependencies
import '../js/lucide-icons.js'
import './image-manager.js'
import { api } from '../js/shared/api.js'

// Global state
let selectedProduct = null
let products = [] // Loaded from API

/**
 * Initialize admin panel
 */
function init() {
  // Initialize Lucide icons
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons()
  }

  // Setup navigation
  setupNavigation()

  // Setup product management
  setupProductManagement()

  // Setup event listeners
  setupEventListeners()

  // Load initial view
  loadInitialView()
}

/**
 * Setup navigation between admin sections
 */
function setupNavigation() {
  // Sidebar menu items
  document.getElementById('products-menu-item').addEventListener('click', e => {
    e.preventDefault()
    showProductsView()
  })

  document.getElementById('orders-menu-item').addEventListener('click', e => {
    e.preventDefault()
    alert('Sección de Pedidos - En desarrollo')
  })

  document.getElementById('users-menu-item').addEventListener('click', e => {
    e.preventDefault()
    alert('Sección de Usuarios - En desarrollo')
  })

  document.getElementById('occasions-menu-item').addEventListener('click', e => {
    e.preventDefault()
    alert('Sección de Ocasiones - En desarrollo')
  })

  document.getElementById('settings-menu-item').addEventListener('click', e => {
    e.preventDefault()
    alert('Sección de Configuración - En desarrollo')
  })

  // Logout button
  document.getElementById('logout-btn').addEventListener('click', () => {
    alert('Cerrar sesión - En desarrollo')
  })
}

/**
 * Setup product management functionality
 */
function setupProductManagement() {
  // New product button
  document.getElementById('new-product-btn').addEventListener('click', () => {
    selectedProduct = null
    document.getElementById('product-detail-title').textContent = 'Nuevo Producto'
    document.getElementById('product-id-display').textContent = 'Nuevo'

    // Reset form
    document.getElementById('product-name').value = ''
    document.getElementById('product-description').value = ''
    document.getElementById('product-price-usd').value = ''
    document.getElementById('product-stock').value = ''
    document.getElementById('product-sku').value = ''
    document.getElementById('product-active').checked = true
    document.getElementById('product-featured').checked = false

    // Clear images preview
    document.getElementById('images-preview').innerHTML = ''

    showProductDetailView()
  })

  // Save product button
  document.getElementById('save-product-btn').addEventListener('click', saveProduct)

  // Cancel product button
  document.getElementById('cancel-product-btn').addEventListener('click', () => {
    if (selectedProduct) {
      showProductDetailView()
    } else {
      showProductsView()
    }
  })

  // Back to products button
  document.getElementById('back-to-products').addEventListener('click', showProductsView)

  // Upload trigger
  document.getElementById('upload-trigger').addEventListener('click', () => {
    document.getElementById('image-upload').click()
  })

  // File upload handler
  document.getElementById('image-upload').addEventListener('change', handleImageUpload)
}

/**
 * Handle image upload
 */
function handleImageUpload(e) {
  const files = e.target.files
  if (files.length === 0) {
    throw new Error('No files selected for upload')
  }

  // In a real implementation, we would upload the files to a server
  // For this mock, we'll just show the files in the preview
  const imagesPreview = document.getElementById('images-preview')

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const reader = new FileReader()

    reader.onload = function (e) {
      const imgContainer = document.createElement('div')
      imgContainer.className = 'relative group'

      imgContainer.innerHTML = `
        <img 
          src="${e.target.result}" 
          alt="Preview" 
          class="w-full h-32 object-cover rounded-lg"
        />
        <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
          <button class="text-white p-2">
            <i data-lucide="x" class="h-5 w-5"></i>
          </button>
        </div>
      `

      imagesPreview.appendChild(imgContainer)

      // Reinitialize icons
      if (window.lucide && window.lucide.createIcons) {
        window.lucide.createIcons()
      }
    }

    reader.readAsDataURL(file)
  }
}

/**
 * Save product
 */
async function saveProduct() {
  try {
    // Get form values
    const name = document.getElementById('product-name').value
    const description = document.getElementById('product-description').value
    const priceUsd = parseFloat(document.getElementById('product-price-usd').value)
    const stock = parseInt(document.getElementById('product-stock').value)
    const sku = document.getElementById('product-sku').value
    const active = document.getElementById('product-active').checked
    const featured = document.getElementById('product-featured').checked

    // Basic validation
    if (!name) {
      throw new Error('Product name is required')
    }
    if (!priceUsd || priceUsd <= 0) {
      throw new Error('Product price must be greater than 0')
    }
    if (stock === null || stock === undefined || stock < 0) {
      throw new Error('Product stock must be 0 or greater')
    }

    const productData = {
      name,
      description,
      price_usd: priceUsd,
      stock,
      sku,
      active,
      featured
    }

    let response
    if (selectedProduct) {
      // Update existing product via API
      response = await api.updateProduct(selectedProduct.id, productData)
    } else {
      // Create new product via API
      response = await api.createProduct(productData)
    }

    if (response.success) {
      alert(`Producto ${selectedProduct ? 'actualizado' : 'creado'} exitosamente!`)
      // Reload products from API
      await loadProducts()
      // Return to products view
      showProductsView()
    } else {
      throw new Error(response.message || 'Failed to save product')
    }
  } catch (error) {
    console.error('saveProduct failed:', error)
    alert(`Error al guardar producto: ${error.message}`)
    throw error
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Search button
  document.getElementById('search-btn').addEventListener('click', filterProducts)
}

/**
 * Filter products based on search criteria
 */
function filterProducts() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase()
  const category = document.getElementById('category-filter').value
  const status = document.getElementById('status-filter').value

  let filtered = [...products]

  if (searchTerm) {
    filtered = filtered.filter(
      product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    )
  }

  if (category) {
    // Mock categories for demonstration
    filtered = filtered.filter(product => {
      if (category === 'flores') {
        return (
          product.name.includes('Rosa') ||
          product.name.includes('Girasol') ||
          product.name.includes('Orquídea')
        )
      }
      if (category === 'ramos') {
        return product.name.includes('Ramo') || product.name.includes('Bouquet')
      }
      if (category === 'plantas') {
        return product.name.includes('Planta')
      }
      return true
    })
  }

  if (status) {
    filtered = filtered.filter(product => (status === 'active' ? product.active : !product.active))
  }

  renderProducts(filtered)
}

/**
 * Load products from API (fail-fast, no fallback)
 */
async function loadProducts() {
  const response = await api.getProducts({ includeInactive: true })
  if (!response.success) {
    throw new Error(response.message || 'Failed to load products from API')
  }
  if (!response.data) {
    throw new Error('No product data received from API')
  }
  products = response.data
}

/**
 * Load initial view
 */
async function loadInitialView() {
  await loadProducts()
  showDashboardView()
}

/**
 * Show dashboard view
 */
function showDashboardView() {
  // Hide all sections
  document.getElementById('dashboard-section').classList.add('hidden')
  document.getElementById('products-section').classList.add('hidden')
  document.getElementById('product-detail-section').classList.add('hidden')

  // Show dashboard
  document.getElementById('dashboard-section').classList.remove('hidden')

  // Update active link
  updateActiveLink('dashboard')
}

/**
 * Show products view
 */
function showProductsView() {
  // Hide all sections
  document.getElementById('dashboard-section').classList.add('hidden')
  document.getElementById('products-section').classList.add('hidden')
  document.getElementById('product-detail-section').classList.add('hidden')

  // Show products
  document.getElementById('products-section').classList.remove('hidden')

  // Render products
  renderProducts(products)

  // Update active link
  updateActiveLink('products')
}

/**
 * Show product detail view
 */
function showProductDetailView() {
  // Hide all sections
  document.getElementById('dashboard-section').classList.add('hidden')
  document.getElementById('products-section').classList.add('hidden')
  document.getElementById('product-detail-section').classList.add('hidden')

  // Show product detail
  document.getElementById('product-detail-section').classList.remove('hidden')

  if (selectedProduct) {
    // Populate form with product data
    document.getElementById('product-name').value = selectedProduct.name
    document.getElementById('product-description').value = selectedProduct.description
    document.getElementById('product-price-usd').value = selectedProduct.price_usd
    document.getElementById('product-stock').value = selectedProduct.stock
    document.getElementById('product-sku').value = selectedProduct.sku || ''
    document.getElementById('product-active').checked = selectedProduct.active
    document.getElementById('product-featured').checked = selectedProduct.featured

    // Update title and ID display
    document.getElementById('product-detail-title').textContent = 'Editar Producto'
    document.getElementById('product-id-display').textContent = `#${selectedProduct.id}`

    // Render images
    renderProductImages(selectedProduct.images)

    // Render occasions
    renderProductOccasions(selectedProduct.occasions)
  }

  // Update active link
  updateActiveLink('products')
}

/**
 * Render products in the table
 */
function renderProducts(products) {
  const productsList = document.getElementById('products-list')
  productsList.innerHTML = ''

  products.forEach(product => {
    const row = document.createElement('tr')

    // Determine status badge class
    let statusClass = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full '
    statusClass += product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'

    row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex items-center">
          <div class="flex-shrink-0 h-10 w-10">
            <img class="h-10 w-10 rounded-md object-cover" src="${product.image_url || '../images/placeholder-flower.svg'}" alt="${product.name}">
          </div>
          <div class="ml-4">
            <div class="text-sm font-medium text-gray-900">${product.name}</div>
            <div class="text-sm text-gray-500">${product.sku || 'No SKU'}</div>
          </div>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        $${product.price_usd.toFixed(2)}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ${product.stock}
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="${statusClass}">
          ${product.active ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button 
          class="text-indigo-600 hover:text-indigo-900 edit-product-btn"
          data-product-id="${product.id}"
        >
          Editar
        </button>
        <button 
          class="ml-4 text-red-600 hover:text-red-900 delete-product-btn"
          data-product-id="${product.id}"
        >
          Eliminar
        </button>
      </td>
    `

    productsList.appendChild(row)
  })

  // Add event listeners to edit buttons
  document.querySelectorAll('.edit-product-btn').forEach(button => {
    button.addEventListener('click', e => {
      const productId = parseInt(e.target.getAttribute('data-product-id'))
      editProduct(productId)
    })
  })

  // Add event listeners to delete buttons
  document.querySelectorAll('.delete-product-btn').forEach(button => {
    button.addEventListener('click', e => {
      const productId = parseInt(e.target.getAttribute('data-product-id'))
      deleteProduct(productId)
    })
  })
}

/**
 * Render product images
 */
function renderProductImages(images) {
  const imagesPreview = document.getElementById('images-preview')
  imagesPreview.innerHTML = ''

  images.forEach(image => {
    const imgContainer = document.createElement('div')
    imgContainer.className = 'relative group'

    imgContainer.innerHTML = `
      <img 
        src="${image.url}" 
        alt="Product Image" 
        class="w-full h-32 object-cover rounded-lg"
      />
      <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
        <button class="text-white p-2 delete-image-btn" data-image-id="${image.id}">
          <i data-lucide="x" class="h-5 w-5"></i>
        </button>
      </div>
      ${image.is_primary ? '<div class="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">Principal</div>' : ''}
    `

    imagesPreview.appendChild(imgContainer)
  })

  // Add event listeners to delete image buttons
  document.querySelectorAll('.delete-image-btn').forEach(button => {
    button.addEventListener('click', e => {
      const imageId = parseInt(e.target.closest('.delete-image-btn').getAttribute('data-image-id'))
      deleteProductImage(imageId)
    })
  })

  // Reinitialize icons
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons()
  }
}

/**
 * Render product occasions
 */
function renderProductOccasions(occasions) {
  const occasionsContainer = document.getElementById('occasions-container')
  occasionsContainer.innerHTML = ''

  occasions.forEach(occasion => {
    occasionsContainer.innerHTML += `
      <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
        <div class="flex items-center">
          <div class="w-8 h-8 rounded-full flex items-center justify-center" style="background-color: ${occasion.color}20; color: ${occasion.color}">
            <i data-lucide="${occasion.icon}" class="h-4 w-4"></i>
          </div>
          <span class="ml-3">${occasion.name}</span>
        </div>
        <button class="text-red-600 hover:text-red-800 delete-occasion-btn" data-occasion-id="${occasion.id}">
          <i data-lucide="x" class="h-4 w-4"></i>
        </button>
      </div>
    `
  })

  // Add event listeners to delete occasion buttons
  document.querySelectorAll('.delete-occasion-btn').forEach(button => {
    button.addEventListener('click', e => {
      const occasionId = parseInt(
        e.target.closest('.delete-occasion-btn').getAttribute('data-occasion-id')
      )
      deleteProductOccasion(occasionId)
    })
  })

  // Reinitialize icons
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons()
  }
}

/**
 * Edit product
 */
function editProduct(productId) {
  selectedProduct = products.find(p => p.id === productId)
  if (!selectedProduct) {
    throw new Error(`Product with ID ${productId} not found`)
  }
  showProductDetailView()
}

/**
 * Delete product (soft-delete via API)
 */
async function deleteProduct(productId) {
  if (
    confirm(
      '¿Estás seguro de que deseas eliminar este producto? Esta acción marcará el producto como inactivo.'
    )
  ) {
    try {
      const response = await api.deleteProduct(productId)
      if (response.success) {
        alert('Producto eliminado exitosamente')
        // Reload products from API
        await loadProducts()
        renderProducts(products)
      } else {
        throw new Error(response.message || 'Failed to delete product')
      }
    } catch (error) {
      console.error('deleteProduct failed:', error)
      alert(`Error al eliminar producto: ${error.message}`)
      throw error
    }
  }
}

/**
 * Delete product image
 */
function deleteProductImage(imageId) {
  if (selectedProduct) {
    selectedProduct.images = selectedProduct.images.filter(img => img.id !== imageId)
    renderProductImages(selectedProduct.images)
  }
}

/**
 * Delete product occasion
 */
function deleteProductOccasion(occasionId) {
  if (selectedProduct) {
    selectedProduct.occasions = selectedProduct.occasions.filter(occ => occ.id !== occasionId)
    renderProductOccasions(selectedProduct.occasions)
  }
}

/**
 * Update active link in sidebar
 */
function updateActiveLink(activeView) {
  // Remove active class from all links
  document.querySelectorAll('.sidebar a').forEach(link => {
    link.classList.remove('bg-white/20')
  })

  // Add active class to appropriate link
  switch (activeView) {
    case 'dashboard':
      // The dashboard link is special (always active when no other section is selected)
      break
    case 'products':
      document.getElementById('products-menu-item').classList.add('bg-white/20')
      break
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize icons first
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons()
  }

  // Then initialize admin functionality
  init()
})
