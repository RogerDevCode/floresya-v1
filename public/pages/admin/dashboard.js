/**
 * Admin Panel Main Controller
 * Manages navigation and views for the admin panel
 */

/* global Chart */

import { initAdminCommon } from '../../js/admin-common.js'
import { toast } from '../../js/components/toast.js'

// Chart.js will be loaded via script tag in HTML
// Global state
let _currentView = 'dashboard'
let products = [] // Will be populated from API

/**
 * Load products from API
 * @param {boolean} includeInactive - Include inactive products (admin only)
 * @returns {Promise<Array>} Products array
 */
async function loadProducts(includeInactive = true) {
  try {
    const url = `/api/products?includeInactive=${includeInactive}`
    const response = await fetch(url, {
      headers: {
        Authorization: 'Bearer admin:1:admin' // Admin token for includeInactive
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to load products')
    }

    products = result.data

    // Load primary images (thumb size) for each product
    await loadProductImages(products)

    console.log(`✓ Loaded ${products.length} products from API`)
    return products
  } catch (error) {
    console.error('Error loading products:', error)
    toast.error('Error al cargar productos: ' + error.message)
    products = [] // Fail-fast: empty array on error
    return products
  }
}

/**
 * Load primary images for products
 * @param {Array} products - Products array
 */
async function loadProductImages(products) {
  try {
    // Load images for all products in parallel
    const imagePromises = products.map(async product => {
      try {
        // Get all images for product, filter by size=thumb
        const response = await fetch(`/api/products/${product.id}/images?size=thumb`, {
          headers: {
            Authorization: 'Bearer admin:1:admin'
          }
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data && result.data.length > 0) {
            // Get primary thumb image (or first thumb image if none is primary)
            const primaryThumb = result.data.find(img => img.is_primary) || result.data[0]
            if (primaryThumb) {
              product.thumbnail_url = primaryThumb.url
            }
          }
        }
      } catch {
        console.warn(`Failed to load image for product ${product.id}`)
      }
    })

    await Promise.all(imagePromises)
  } catch (error) {
    console.error('Error loading product images:', error)
  }
}

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

  // Setup event listeners
  setupEventListeners()

  // Load initial view
  showView('dashboard')
}

// ==================== DASHBOARD STATS ====================

let dashboardYearFilter = new Date().getFullYear().toString() // Default: año actual
let dashboardDateFilter = '' // Default: todos los períodos
let chartStatusFilter = 'all-non-cancelled' // Default: todos los pedidos no cancelados
let salesChartInstance = null // Chart.js instance
let isLoadingDashboardStats = false // Flag to prevent concurrent API calls
let cachedOrders = [] // Cache orders to avoid redundant API calls

/**
 * Load dashboard data
 */
async function loadDashboardData() {
  setupDashboardFilters()
  setupChartFilter()
  await updateDashboardStats()
}

/**
 * Setup dashboard filter listeners
 */
function setupDashboardFilters() {
  const yearFilter = document.getElementById('dashboard-year-filter')
  const dateFilter = document.getElementById('dashboard-date-filter')

  if (yearFilter) {
    yearFilter.value = dashboardYearFilter
    yearFilter.addEventListener('change', e => {
      dashboardYearFilter = e.target.value
      if (!isLoadingDashboardStats) {
        updateDashboardStats()
      }
    })
  }

  if (dateFilter) {
    dateFilter.addEventListener('change', e => {
      dashboardDateFilter = e.target.value
      if (!isLoadingDashboardStats) {
        updateDashboardStats()
      }
    })
  }
}

/**
 * Apply dashboard filters to orders
 */
function applyDashboardFilters(orders) {
  let filtered = [...orders]

  // Filter by year
  if (dashboardYearFilter) {
    const year = parseInt(dashboardYearFilter)
    filtered = filtered.filter(order => {
      const orderYear = new Date(order.created_at).getFullYear()
      return orderYear === year
    })
  }

  // Filter by period
  if (dashboardDateFilter === 'today') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    filtered = filtered.filter(order => new Date(order.created_at) >= today)
  } else if (dashboardDateFilter === 'current-month') {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    filtered = filtered.filter(order => new Date(order.created_at) >= firstDay)
  } else if (dashboardDateFilter === 'last-month') {
    const now = new Date()
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    lastDayLastMonth.setHours(23, 59, 59, 999)
    filtered = filtered.filter(order => {
      const orderDate = new Date(order.created_at)
      return orderDate >= firstDayLastMonth && orderDate <= lastDayLastMonth
    })
  } else if (dashboardDateFilter && !isNaN(parseInt(dashboardDateFilter))) {
    const days = parseInt(dashboardDateFilter)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    filtered = filtered.filter(order => new Date(order.created_at) >= cutoffDate)
  }

  return filtered
}

/**
 * Update filter indicator text
 */
function updateFilterIndicator() {
  const indicator = document.getElementById('dashboard-filter-indicator')
  if (!indicator) {
    return
  }

  const yearText = `Año ${dashboardYearFilter}`
  let periodText = 'Todos los pedidos'

  if (dashboardDateFilter === 'today') {
    periodText = 'Día de hoy'
  } else if (dashboardDateFilter === 'current-month') {
    periodText = 'Este mes'
  } else if (dashboardDateFilter === 'last-month') {
    periodText = 'Mes pasado'
  } else if (dashboardDateFilter === '30') {
    periodText = 'Últimos 30 días'
  } else if (dashboardDateFilter === '60') {
    periodText = 'Últimos 60 días'
  } else if (dashboardDateFilter === '90') {
    periodText = 'Últimos 90 días'
  }

  indicator.textContent = `Mostrando: ${yearText} | ${periodText}`
}

/**
 * Render monthly sales chart with Chart.js
 * @param {Array} orders - All orders from API
 */
function renderMonthlySalesChart(orders) {
  const canvas = document.getElementById('monthly-sales-chart')
  if (!canvas) {
    return
  }

  // Filter orders based on chart status filter
  let filteredOrders = [...orders]

  if (chartStatusFilter === 'all-non-cancelled') {
    filteredOrders = filteredOrders.filter(o => o.status !== 'cancelled')
  } else if (chartStatusFilter !== 'all') {
    filteredOrders = filteredOrders.filter(o => o.status === chartStatusFilter)
  }

  // Generate last 12 months from current month backwards
  const months = []
  const now = new Date()

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthName = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
    months.push({
      label: monthName.charAt(0).toUpperCase() + monthName.slice(1), // Capitalize
      year: date.getFullYear(),
      month: date.getMonth()
    })
  }

  // Calculate sales and order count per month
  const salesData = months.map(m => {
    const monthOrders = filteredOrders.filter(order => {
      const orderDate = new Date(order.created_at)
      return orderDate.getFullYear() === m.year && orderDate.getMonth() === m.month
    })

    const totalSales = monthOrders.reduce(
      (sum, order) => sum + parseFloat(order.total_amount_usd || 0),
      0
    )
    const orderCount = monthOrders.length

    return { totalSales, orderCount }
  })

  // Destroy existing chart if it exists
  if (salesChartInstance) {
    salesChartInstance.destroy()
  }

  // Create new chart
  const ctx = canvas.getContext('2d')
  salesChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months.map(m => m.label),
      datasets: [
        {
          label: 'Monto USD',
          data: salesData.map(d => d.totalSales),
          backgroundColor: 'rgba(236, 72, 153, 0.5)', // Pink
          borderColor: 'rgba(236, 72, 153, 1)',
          borderWidth: 2,
          yAxisID: 'y-usd',
          order: 2
        },
        {
          label: 'Cantidad de Pedidos',
          data: salesData.map(d => d.orderCount),
          type: 'line',
          backgroundColor: 'rgba(168, 85, 247, 0.2)', // Purple
          borderColor: 'rgba(168, 85, 247, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(168, 85, 247, 1)',
          pointRadius: 4,
          yAxisID: 'y-count',
          order: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || ''
              if (label) {
                label += ': '
              }
              if (context.datasetIndex === 0) {
                label += `$${context.parsed.y.toFixed(2)}`
              } else {
                label += context.parsed.y
              }
              return label
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        'y-usd': {
          type: 'linear',
          position: 'left',
          title: {
            display: true,
            text: 'Monto USD'
          },
          ticks: {
            callback: function (value) {
              return '$' + value.toFixed(0)
            }
          }
        },
        'y-count': {
          type: 'linear',
          position: 'right',
          title: {
            display: true,
            text: 'Cantidad'
          },
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  })

  // Update subtitle based on filter
  updateChartSubtitle()
}

/**
 * Update chart subtitle based on active filter
 */
function updateChartSubtitle() {
  const subtitle = document.getElementById('chart-subtitle')
  if (!subtitle) {
    return
  }

  let text = 'Últimos 12 meses'

  if (chartStatusFilter === 'all-non-cancelled') {
    text += ' (pedidos no cancelados)'
  } else if (chartStatusFilter === 'all') {
    text += ' (todos los pedidos)'
  } else {
    const statusNames = {
      pending: 'Pendientes',
      verified: 'Verificados',
      preparing: 'Preparando',
      shipped: 'Enviados',
      delivered: 'Entregados',
      cancelled: 'Cancelados'
    }
    text += ` (solo ${statusNames[chartStatusFilter] || chartStatusFilter})`
  }

  subtitle.textContent = text
}

/**
 * Setup chart filter listener
 */
function setupChartFilter() {
  const chartFilter = document.getElementById('chart-status-filter')
  if (!chartFilter) {
    return
  }

  chartFilter.addEventListener('change', e => {
    chartStatusFilter = e.target.value

    // Reuse cached orders instead of fetching again
    if (cachedOrders.length > 0) {
      renderMonthlySalesChart(cachedOrders)
      console.log(`✓ Chart re-rendered with filter: ${chartStatusFilter}`)
    } else {
      console.warn('No cached orders available for chart re-render')
    }
  })
}

/**
 * Get top products by quantity sold
 * @param {Array} orders - All orders from API
 * @param {Number} limit - Number of top products to return (default: 3)
 * @returns {Array} - Top products with sales count
 */
function getTopProducts(orders, limit = 3) {
  // Filter: exclude cancelled orders + apply global filters
  const filteredOrders = applyDashboardFilters(orders).filter(o => o.status !== 'cancelled')

  // Group by product_id and sum quantities
  const productSales = {}

  filteredOrders.forEach(order => {
    if (!order.order_items || !Array.isArray(order.order_items)) {
      return
    }

    order.order_items.forEach(item => {
      const productId = item.product_id
      const productName = item.product_name
      const quantity = parseInt(item.quantity) || 0

      if (!productSales[productId]) {
        productSales[productId] = {
          product_id: productId,
          product_name: productName,
          total_quantity: 0
        }
      }

      productSales[productId].total_quantity += quantity
    })
  })

  // Convert to array and sort by quantity DESC
  const sortedProducts = Object.values(productSales).sort(
    (a, b) => b.total_quantity - a.total_quantity
  )

  // Return top N
  return sortedProducts.slice(0, limit)
}

/**
 * Render top products section
 * @param {Array} topProducts - Top products from getTopProducts()
 */
function renderTopProducts(topProducts) {
  const container = document.getElementById('top-products-list')
  if (!container) {
    return
  }

  if (!topProducts || topProducts.length === 0) {
    container.innerHTML = `
      <div class="text-center text-gray-500 py-8">
        <i data-lucide="package-x" class="h-8 w-8 mx-auto"></i>
        <p class="mt-2">No hay datos de productos vendidos</p>
      </div>
    `
    // Reinitialize icons
    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons()
    }
    return
  }

  container.innerHTML = topProducts
    .map(
      (product, index) => `
    <div class="flex items-center justify-between border-b pb-3">
      <div class="flex items-center gap-3">
        <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
          ${index + 1}
        </div>
        <div>
          <p class="font-medium text-gray-900">${product.product_name}</p>
          <p class="text-sm text-gray-500">ID: ${product.product_id}</p>
        </div>
      </div>
      <div class="text-right">
        <p class="font-bold text-gray-900 text-lg">${product.total_quantity}</p>
        <p class="text-xs text-gray-500">unidades</p>
      </div>
    </div>
  `
    )
    .join('')

  // Update subtitle
  updateTopProductsSubtitle()
}

/**
 * Update top products subtitle based on active filters
 */
function updateTopProductsSubtitle() {
  const subtitle = document.getElementById('top-products-subtitle')
  if (!subtitle) {
    return
  }

  const yearText = `Año ${dashboardYearFilter}`
  let periodText = 'Todos los pedidos'

  if (dashboardDateFilter === 'today') {
    periodText = 'Día de hoy'
  } else if (dashboardDateFilter === 'current-month') {
    periodText = 'Este mes'
  } else if (dashboardDateFilter === 'last-month') {
    periodText = 'Mes pasado'
  } else if (dashboardDateFilter === '30') {
    periodText = 'Últimos 30 días'
  } else if (dashboardDateFilter === '60') {
    periodText = 'Últimos 60 días'
  } else if (dashboardDateFilter === '90') {
    periodText = 'Últimos 90 días'
  }

  subtitle.textContent = `Filtros: ${yearText} | ${periodText} (excluye cancelados)`
}

/**
 * Update dashboard statistics with real API data
 */
async function updateDashboardStats() {
  // Prevent concurrent calls
  if (isLoadingDashboardStats) {
    console.log('⏳ Dashboard stats already loading, skipping duplicate call')
    return
  }

  try {
    isLoadingDashboardStats = true

    // Fetch orders from API
    const ordersResponse = await fetch('/api/orders', {
      headers: { Authorization: 'Bearer admin:1:admin' }
    })

    if (!ordersResponse.ok) {
      throw new Error('Failed to fetch orders from API')
    }

    const ordersData = await ordersResponse.json()
    const allOrders = ordersData.success ? ordersData.data : []

    // Cache orders for chart filter reuse
    cachedOrders = allOrders

    // Apply filters
    const filteredOrders = applyDashboardFilters(allOrders)

    // Calculate stats by status
    const stats = {
      pending: filteredOrders.filter(o => o.status === 'pending').length,
      verified: filteredOrders.filter(o => o.status === 'verified').length,
      preparing: filteredOrders.filter(o => o.status === 'preparing').length,
      shipped: filteredOrders.filter(o => o.status === 'shipped').length,
      delivered: filteredOrders.filter(o => o.status === 'delivered').length,
      cancelled: filteredOrders.filter(o => o.status === 'cancelled').length
    }

    // Total orders (includes cancelled)
    const totalOrders = filteredOrders.length

    // Total sales (excludes cancelled)
    const totalSales = filteredOrders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, order) => sum + parseFloat(order.total_amount_usd || 0), 0)

    // Update DOM
    const updateElement = (id, value) => {
      const el = document.getElementById(id)
      if (el) {
        el.textContent = value
      }
    }

    updateElement('dash-total-orders', totalOrders)
    updateElement('dash-total-sales', `$${totalSales.toFixed(2)}`)
    updateElement('dash-status-pending', stats.pending)
    updateElement('dash-status-verified', stats.verified)
    updateElement('dash-status-preparing', stats.preparing)
    updateElement('dash-status-shipped', stats.shipped)
    updateElement('dash-status-delivered', stats.delivered)
    updateElement('dash-status-cancelled', stats.cancelled)

    // Update filter indicator
    updateFilterIndicator()

    // Render monthly sales chart
    renderMonthlySalesChart(allOrders)

    // Render top products
    const topProducts = getTopProducts(allOrders, 3)
    renderTopProducts(topProducts)

    console.log('✓ Dashboard stats updated:', { totalOrders, totalSales, stats, topProducts })
  } catch (error) {
    console.error('Error loading dashboard stats:', error)
    showDashboardError()
  } finally {
    isLoadingDashboardStats = false
  }
}

/**
 * Show error state in dashboard stats
 */
function showDashboardError() {
  const elements = [
    'dash-total-products',
    'dash-total-orders',
    'dash-total-sales',
    'dash-pending-orders'
  ]

  elements.forEach(id => {
    const el = document.getElementById(id)
    if (el) {
      el.textContent = 'Error'
      el.classList.add('text-red-600')
    }
  })
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
 * Setup event listeners
 */
function setupEventListeners() {
  // Apply filters button
  const applyFiltersBtn = document.getElementById('apply-filters-btn')
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', () => {
      filterProducts()
    })
  }

  // Clear filters button
  const clearFiltersBtn = document.getElementById('clear-filters-btn')
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      clearFilters()
    })
  }

  // Auto-filter on search input (Enter key)
  const searchInput = document.getElementById('search-input')
  if (searchInput) {
    searchInput.addEventListener('keyup', e => {
      if (e.key === 'Enter') {
        filterProducts()
      }
    })
  }

  // Auto-filter on occasion change
  const occasionFilter = document.getElementById('occasion-filter')
  if (occasionFilter) {
    occasionFilter.addEventListener('change', () => {
      filterProducts()
    })
  }

  // Auto-filter on status change
  const statusFilter = document.getElementById('status-filter')
  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
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
async function showView(view) {
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

  // Special handling for dashboard view
  if (view === 'dashboard') {
    loadDashboardData()
  }

  // Special handling for products view
  if (view === 'products') {
    await loadProducts() // Fetch from API
    await loadOccasionsFilter() // Load occasions for filter
    renderProducts(products)
  }

  // Special handling for occasions view
  if (view === 'occasions') {
    // Load occasions data when showing the view
    if (window.occasionsModule && window.occasionsModule.loadOccasionsData) {
      window.occasionsModule.loadOccasionsData()
    }
  }

  // Special handling for settings view
  if (view === 'settings') {
    handleSettingsView()
  }
}

/**
 * Clear all filters and show all products
 */
function clearFilters() {
  // Reset all filter inputs
  const searchInput = document.getElementById('search-input')
  const occasionFilter = document.getElementById('occasion-filter')
  const statusFilter = document.getElementById('status-filter')

  if (searchInput) {
    searchInput.value = ''
  }
  if (occasionFilter) {
    occasionFilter.value = ''
  }
  if (statusFilter) {
    statusFilter.value = ''
  }

  // Show all products
  renderProducts(products)
}

/**
 * Load occasions for filter dropdown
 */
async function loadOccasionsFilter() {
  try {
    const response = await fetch('/api/occasions', {
      headers: {
        Authorization: 'Bearer admin:1:admin'
      }
    })

    if (!response.ok) {
      console.warn('Failed to load occasions for filter')
      return
    }

    const result = await response.json()
    if (!result.success || !result.data) {
      console.warn('No occasions data received')
      return
    }

    const occasions = result.data.filter(occ => occ.is_active)
    const select = document.getElementById('occasion-filter')

    if (!select) {
      console.error('Occasion filter select not found')
      return
    }

    // Clear existing options (except "Todas")
    select.innerHTML = '<option value="">Todas las ocasiones</option>'

    // Add occasion options
    occasions.forEach(occasion => {
      const option = document.createElement('option')
      option.value = occasion.id
      option.textContent = occasion.name
      select.appendChild(option)
    })

    console.log(`✓ Loaded ${occasions.length} occasions for filter`)
  } catch (error) {
    console.error('Error loading occasions filter:', error)
  }
}

/**
 * Filter products based on search criteria
 */
async function filterProducts() {
  const searchInput = document.getElementById('search-input')
  const occasionFilter = document.getElementById('occasion-filter')
  const statusFilter = document.getElementById('status-filter')

  if (!searchInput || !occasionFilter || !statusFilter) {
    console.error('Filter elements not found')
    return
  }

  const searchTerm = searchInput.value.toLowerCase()
  const occasionId = occasionFilter.value
  const status = statusFilter.value

  let filtered = [...products]

  // Text search
  if (searchTerm) {
    filtered = filtered.filter(
      product =>
        product.name.toLowerCase().includes(searchTerm) ||
        (product.description && product.description.toLowerCase().includes(searchTerm)) ||
        (product.sku && product.sku.toLowerCase().includes(searchTerm))
    )
  }

  // Filter by occasion (requires checking product_occasions relationship)
  if (occasionId) {
    try {
      console.log(`Filtering by occasion ID: ${occasionId}`)
      // Fetch products for this occasion from API
      const response = await fetch(`/api/products/occasion/${occasionId}`, {
        headers: {
          Authorization: 'Bearer admin:1:admin'
        }
      })

      if (response.ok) {
        const result = await response.json()
        console.log(`Products for occasion ${occasionId}:`, result.data.length)
        const occasionProductIds = result.data.map(p => p.id)

        // Filter local products to only those in this occasion
        const beforeCount = filtered.length
        filtered = filtered.filter(product => occasionProductIds.includes(product.id))
        console.log(`Filtered: ${beforeCount} → ${filtered.length} products`)
      } else {
        console.warn('Failed to fetch products for occasion:', occasionId, response.status)
        toast.warning('No se pudieron cargar productos para esta ocasión')
      }
    } catch (error) {
      console.error('Error filtering by occasion:', error)
      toast.error('Error al filtrar por ocasión')
    }
  }

  // Filter by status
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

  // Placeholder images for cycling (relative to /public/pages/admin/)
  const placeholders = ['../../images/placeholder-flower.svg', '../../images/placeholder-hero.svg']
  let placeholderIndex = 0

  products.forEach(product => {
    const row = document.createElement('tr')

    // Determine status badge class
    let statusClass = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full '
    statusClass += product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'

    // Get image URL - cycle through placeholders if no thumbnail
    let imageUrl = product.thumbnail_url
    if (!imageUrl) {
      imageUrl = placeholders[placeholderIndex % placeholders.length]
      placeholderIndex++
    }

    row.innerHTML = `
      <td class="px-6 py-4">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0 h-12 w-12">
            <img class="h-12 w-12 rounded-md object-cover" src="${imageUrl}" alt="${product.name}">
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-sm font-semibold text-gray-900 truncate">${product.name}</div>
            <div class="text-xs text-gray-500 mt-0.5">${product.sku || 'Sin SKU'}</div>
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
          href="./edit-product.html?id=${product.id}"
          class="text-indigo-600 hover:text-indigo-900"
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
 * Delete product (soft delete - mark as inactive)
 */
function deleteProduct(productId) {
  if (!confirm('¿Estás seguro de que deseas desactivar este producto?')) {
    return
  }

  const product = products.find(p => p.id === productId)
  if (!product) {
    console.error('Product not found:', productId)
    toast.error('Producto no encontrado')
    return
  }

  product.active = false
  product.updated_at = new Date().toISOString()
  renderProducts(products)
  toast.success('Producto desactivado exitosamente')
}

// ==================== INITIALIZATION ====================

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize icons first
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons()
  }

  // Then initialize admin functionality
  init()
  initAdminCommon()

  // Initialize occasions module
  if (window.occasionsModule && window.occasionsModule.initOccasionsManagement) {
    window.occasionsModule.initOccasionsManagement()
  }

  // Setup event listeners for settings view
  setupSettingsEventListeners()
})

// Settings state
let heroImageFile = null
let logoFile = null
let bcvPriceValue = ''

/**
 * Setup event listeners for settings view
 */
function setupSettingsEventListeners() {
  // Hero image upload
  const heroImageUpload = document.getElementById('hero-image-upload')
  if (heroImageUpload) {
    heroImageUpload.addEventListener('change', handleHeroImageUpload)
  }

  // Save hero image button
  const saveHeroImageButton = document.getElementById('save-hero-image-btn')
  if (saveHeroImageButton) {
    saveHeroImageButton.addEventListener('click', saveHeroImage)
  }

  // Logo upload
  const logoUpload = document.getElementById('logo-upload')
  if (logoUpload) {
    logoUpload.addEventListener('change', handleLogoUpload)
  }

  // Save logo button
  const saveLogoButton = document.getElementById('save-logo-btn')
  if (saveLogoButton) {
    saveLogoButton.addEventListener('click', saveLogo)
  }

  // BCV price input
  const bcvPriceInput = document.getElementById('bcv-price-input')
  if (bcvPriceInput) {
    bcvPriceInput.addEventListener('input', handleBcvPriceInput)
  }

  // Save BCV price button
  const saveBcvPriceButton = document.getElementById('save-bcv-price-btn')
  if (saveBcvPriceButton) {
    saveBcvPriceButton.addEventListener('click', saveBcvPrice)
  }
}
/**
 * Setup event listeners for settings view
 */
function handleHeroImageUpload(event) {
  const file = event.target.files[0]
  if (!file) {
    return
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona un archivo de imagen válido.')
    event.target.value = ''
    return
  }

  // Validate file size (4MB max)
  if (file.size > 4 * 1024 * 1024) {
    alert('La imagen no debe superar 4MB.')
    event.target.value = ''
    return
  }

  heroImageFile = file

  // Enable save button
  const saveButton = document.getElementById('save-hero-image-btn')
  if (saveButton) {
    saveButton.disabled = false
  }
}

/**
 * Handle logo upload
 */
function handleLogoUpload(event) {
  const file = event.target.files[0]
  if (!file) {
    return
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona un archivo de imagen válido.')
    event.target.value = ''
    return
  }

  // Validate file size (4MB max)
  if (file.size > 4 * 1024 * 1024) {
    alert('La imagen no debe superar 4MB.')
    event.target.value = ''
    return
  }

  logoFile = file

  // Enable save button
  const saveButton = document.getElementById('save-logo-btn')
  if (saveButton) {
    saveButton.disabled = false
  }
}

/**
 * Handle BCV price input
 */
function handleBcvPriceInput(event) {
  const value = event.target.value
  if (value && !isNaN(value) && parseFloat(value) > 0) {
    bcvPriceValue = value

    // Enable save button
    const saveButton = document.getElementById('save-bcv-price-btn')
    if (saveButton) {
      saveButton.disabled = false
    }
  } else {
    bcvPriceValue = ''

    // Disable save button
    const saveButton = document.getElementById('save-bcv-price-btn')
    if (saveButton) {
      saveButton.disabled = true
    }
  }
}

/**
 * Save hero image
 */
async function saveHeroImage() {
  if (!heroImageFile) {
    return
  }

  try {
    // Show loading state
    const saveButton = document.getElementById('save-hero-image-btn')
    saveButton.innerHTML = '<i data-lucide="loader" class="h-4 w-4 animate-spin"></i> Guardando...'
    saveButton.disabled = true

    // Create form data
    const formData = new FormData()
    formData.append('image', heroImageFile)
    formData.append('setting_key', 'hero_image')

    // Send request to save image
    const response = await fetch('/api/admin/settings/image', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer admin:1:admin'
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error('Error al guardar la imagen hero')
    }

    const result = await response.json()

    if (result.success) {
      // Reload hero image preview
      loadHeroImagePreview()
      // Reset file input
      heroImageFile = null
      document.getElementById('hero-image-upload').value = ''
      saveButton.disabled = true
      alert('Imagen hero guardada exitosamente')
    } else {
      throw new Error(result.message || 'Error al guardar la imagen hero')
    }
  } catch (error) {
    console.error('Error saving hero image:', error)
    alert('Error al guardar la imagen hero: ' + error.message)
  } finally {
    // Restore button
    const saveButton = document.getElementById('save-hero-image-btn')
    saveButton.innerHTML = 'Guardar Imagen Hero'
    saveButton.disabled = false
  }
}

/**
 * Save logo
 */
async function saveLogo() {
  if (!logoFile) {
    return
  }

  try {
    // Show loading state
    const saveButton = document.getElementById('save-logo-btn')
    saveButton.innerHTML = '<i data-lucide="loader" class="h-4 w-4 animate-spin"></i> Guardando...'
    saveButton.disabled = true

    // Create form data
    const formData = new FormData()
    formData.append('image', logoFile)
    formData.append('setting_key', 'site_logo')

    // Send request to save logo
    const response = await fetch('/api/admin/settings/image', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer admin:1:admin'
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error('Error al guardar el logo')
    }

    const result = await response.json()

    if (result.success) {
      // Reload logo preview
      loadLogoPreview()
      // Reset file input
      logoFile = null
      document.getElementById('logo-upload').value = ''
      saveButton.disabled = true
      alert('Logo guardado exitosamente')
    } else {
      throw new Error(result.message || 'Error al guardar el logo')
    }
  } catch (error) {
    console.error('Error saving logo:', error)
    alert('Error al guardar el logo: ' + error.message)
  } finally {
    // Restore button
    const saveButton = document.getElementById('save-logo-btn')
    saveButton.innerHTML = 'Guardar Logo'
    saveButton.disabled = false
  }
}

/**
 * Save BCV price
 */
async function saveBcvPrice() {
  if (!bcvPriceValue) {
    return
  }

  try {
    // Show loading state
    const saveButton = document.getElementById('save-bcv-price-btn')
    saveButton.innerHTML = '<i data-lucide="loader" class="h-4 w-4 animate-spin"></i> Guardando...'
    saveButton.disabled = true

    // Send request to save BCV price
    const response = await fetch('/api/admin/settings/bcv-price', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer admin:1:admin',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bcv_price: bcvPriceValue })
    })

    if (!response.ok) {
      throw new Error('Error al guardar el precio BCV')
    }

    const result = await response.json()

    if (result.success) {
      // Reload BCV price
      loadBcvPrice()
      // Reset input
      bcvPriceValue = ''
      document.getElementById('bcv-price-input').value = ''
      saveButton.disabled = true
      alert('Precio BCV guardado exitosamente')
    } else {
      throw new Error(result.message || 'Error al guardar el precio BCV')
    }
  } catch (error) {
    console.error('Error saving BCV price:', error)
    alert('Error al guardar el precio BCV: ' + error.message)
  } finally {
    // Restore button
    const saveButton = document.getElementById('save-bcv-price-btn')
    saveButton.innerHTML = 'Guardar Precio BCV'
    saveButton.disabled = false
  }
}

/**
 * Load hero image preview
 */
async function loadHeroImagePreview() {
  try {
    const response = await fetch('/api/settings/hero_image/value')
    if (response.ok) {
      const result = await response.json()
      const heroImageUrl = result.data

      const heroImage = document.getElementById('current-hero-image')
      const noHeroImageText = document.getElementById('no-hero-image-text')

      if (heroImageUrl) {
        heroImage.src = heroImageUrl
        heroImage.classList.remove('hidden')
        noHeroImageText.classList.add('hidden')
      } else {
        heroImage.classList.add('hidden')
        noHeroImageText.classList.remove('hidden')
      }
    }
  } catch (error) {
    console.error('Error loading hero image preview:', error)
  }
}

/**
 * Load logo preview
 */
async function loadLogoPreview() {
  try {
    const response = await fetch('/api/settings/site_logo/value')
    if (response.ok) {
      const result = await response.json()
      const logoUrl = result.data

      const logo = document.getElementById('current-logo')
      const noLogoText = document.getElementById('no-logo-text')

      if (logoUrl) {
        logo.src = logoUrl
        logo.classList.remove('hidden')
        noLogoText.classList.add('hidden')
      } else {
        logo.classList.add('hidden')
        noLogoText.classList.remove('hidden')
      }
    }
  } catch (error) {
    console.error('Error loading logo preview:', error)
  }
}

/**
 * Load BCV price
 */
async function loadBcvPrice() {
  try {
    const response = await fetch('/api/settings/bcv_usd_rate/value')
    if (response.ok) {
      const result = await response.json()
      const bcvPrice = result.data

      const bcvPriceElement = document.getElementById('current-bcv-price')
      if (bcvPrice) {
        bcvPriceElement.textContent = `Bs. ${parseFloat(bcvPrice).toFixed(2)}`
      } else {
        bcvPriceElement.textContent = 'No establecido'
      }
    }
  } catch (error) {
    console.error('Error loading BCV price:', error)
    document.getElementById('current-bcv-price').textContent = 'Error al cargar'
  }
}

/**
 * Special handling for settings view
 */
async function handleSettingsView() {
  // Load previews for all settings
  await loadHeroImagePreview()
  await loadLogoPreview()
  await loadBcvPrice()
}
