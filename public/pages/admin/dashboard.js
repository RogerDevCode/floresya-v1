/**
 * Admin Panel Main Controller
 * Manages navigation and views for the admin panel
 */

// Global state
let _currentView = 'dashboard'
const mockProducts = [
  {
    id: 67,
    name: 'Ramo Tropical Vibrante',
    description:
      'Explosión de colores tropicales con aves del paraíso, heliconias y flores exóticas',
    price_usd: 45.99,
    price_ves: 1837.96,
    stock: 15,
    sku: 'FY-001',
    active: true,
    featured: true,
    carousel_order: 1,
    created_at: '2025-09-30T02:22:35.04999+00',
    updated_at: '2025-09-30T02:22:35.04999+00',
    image_url: '/products/vibrant-tropical-flower-bouquet-with-birds-of-para.jpg'
  },
  {
    id: 68,
    name: 'Bouquet Arcoíris de Rosas',
    description: 'Rosas multicolores que forman un hermoso arcoíris de emociones',
    price_usd: 52.99,
    price_ves: 2119.6,
    stock: 20,
    sku: 'FY-002',
    active: true,
    featured: true,
    carousel_order: 2,
    created_at: '2025-09-30T02:22:35.04999+00',
    updated_at: '2025-09-30T02:22:35.04999+00',
    image_url: '/products/rainbow-rose-bouquet.jpg'
  },
  {
    id: 69,
    name: 'Girasoles Gigantes Alegres',
    description: 'Girasoles enormes que irradian alegría y energía positiva',
    price_usd: 38.99,
    price_ves: 1559.6,
    stock: 25,
    sku: 'FY-003',
    active: true,
    featured: false,
    carousel_order: null,
    created_at: '2025-09-30T02:22:35.04999+00',
    updated_at: '2025-09-30T02:22:35.04999+00',
    image_url: '/products/happy-giant-sunflowers.jpg'
  }
]

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

  // Setup sidebar toggle
  setupSidebarToggle()

  // Setup event listeners
  setupEventListeners()

  // Load initial view
  showView('dashboard')
}

/**
 * Setup navigation between admin sections
 */
function setupNavigation() {
  // Get all sidebar menu items
  const menuItems = document.querySelectorAll('.sidebar-menu-item')
  menuItems.forEach(item => {
    item.addEventListener('click', e => {
      const view = item.getAttribute('data-view')

      // Only prevent default and handle view switching for items with data-view
      if (view) {
        e.preventDefault()
        showView(view)

        // Update active class
        menuItems.forEach(menuItem => menuItem.classList.remove('active'))
        item.classList.add('active')
      }
      // Items without data-view (with href) will navigate normally
    })
  })
}

/**
 * Setup sidebar toggle functionality
 */
function setupSidebarToggle() {
  const sidebarToggle = document.getElementById('sidebar-toggle')
  const sidebar = document.getElementById('sidebar')

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed')
    })
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // New product button
  const newProductBtn = document.getElementById('new-product-btn')
  if (newProductBtn) {
    newProductBtn.addEventListener('click', () => {
      alert('Funcionalidad de nuevo producto en desarrollo')
    })
  }

  // Search button
  const searchBtn = document.getElementById('search-btn')
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      filterProducts()
    })
  }

  // Open contact editor button
  const openContactBtn = document.getElementById('open-contact-editor-btn')
  if (openContactBtn) {
    openContactBtn.addEventListener('click', () => {
      // Redirect to the existing contact editor page
      window.location.href = 'contact-editor.html'
    })
  }

  // Logout button
  const logoutBtn = document.getElementById('logout-btn')
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        // Simulate logout
        alert('Sesión cerrada. Redirigiendo al login...')
        window.location.href = '/' // Redirect to home or login page
      }
    })
  }
}

/**
 * Show specified view and hide others
 */
function showView(view) {
  _currentView = view

  // Hide all views
  const views = document.querySelectorAll('[id$="-view"]')
  views.forEach(viewElement => {
    viewElement.classList.add('hidden')
  })

  // Show requested view
  const requestedView = document.getElementById(`${view}-view`)
  if (requestedView) {
    requestedView.classList.remove('hidden')
  }

  // Special handling for products view
  if (view === 'products') {
    renderProducts(mockProducts)
  }

  // Special handling for occasions view
  if (view === 'occasions') {
    // Load occasions data when showing the view
    if (window.occasionsModule && window.occasionsModule.loadOccasionsData) {
      window.occasionsModule.loadOccasionsData()
    }
  }
}

/**
 * Filter products based on search criteria
 */
function filterProducts() {
  const searchInput = document.getElementById('search-input')
  const categoryFilter = document.getElementById('category-filter')
  const statusFilter = document.getElementById('status-filter')

  if (!searchInput || !categoryFilter || !statusFilter) {
    console.error('Filter elements not found')
    return
  }

  const searchTerm = searchInput.value.toLowerCase()
  const category = categoryFilter.value
  const status = statusFilter.value

  let filtered = [...mockProducts]

  if (searchTerm) {
    filtered = filtered.filter(
      product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.sku.toLowerCase().includes(searchTerm)
    )
  }

  if (category) {
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
 * Render products in the table
 */
function renderProducts(products) {
  const productsList = document.getElementById('products-list')
  if (!productsList) {
    return
  }

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
        <a 
          href="#" 
          class="text-indigo-600 hover:text-indigo-900 edit-product-link"
          data-product-id="${product.id}"
        >
          Editar
        </a>
        <a 
          href="#" 
          class="ml-4 text-red-600 hover:text-red-900 delete-product-link"
          data-product-id="${product.id}"
        >
          Eliminar
        </a>
      </td>
    `

    productsList.appendChild(row)
  })

  // Add event listeners to edit links
  document.querySelectorAll('.edit-product-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault()
      const productId = parseInt(e.target.getAttribute('data-product-id'), 10)
      if (!productId || isNaN(productId)) {
        console.error('Invalid product ID')
        return
      }
      editProduct(productId)
    })
  })

  // Add event listeners to delete links
  document.querySelectorAll('.delete-product-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault()
      const productId = parseInt(e.target.getAttribute('data-product-id'), 10)
      if (!productId || isNaN(productId)) {
        console.error('Invalid product ID')
        return
      }
      deleteProduct(productId)
    })
  })
}

/**
 * Edit product (navigation to product detail)
 */
function editProduct(productId) {
  // In a real implementation, you would navigate to a product detail page
  // For this mock, just show an alert
  alert(`Editar producto con ID: ${productId}`)
}

/**
 * Delete product (soft delete - mark as inactive)
 */
function deleteProduct(productId) {
  if (!confirm('¿Estás seguro de que deseas desactivar este producto?')) {
    return
  }

  const product = mockProducts.find(p => p.id === productId)
  if (!product) {
    console.error('Product not found:', productId)
    return
  }

  product.active = false
  product.updated_at = new Date().toISOString()
  renderProducts(mockProducts)
  alert('Producto desactivado exitosamente')
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize icons first
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons()
  }

  // Then initialize admin functionality
  init()

  // Initialize occasions module
  if (window.occasionsModule && window.occasionsModule.initOccasionsManagement) {
    window.occasionsModule.initOccasionsManagement()
  }
})
