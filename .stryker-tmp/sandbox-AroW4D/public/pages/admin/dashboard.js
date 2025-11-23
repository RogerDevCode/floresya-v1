/**
 * Admin Panel Main Controller
 * Manages navigation and views for the admin panel
 */
// @ts-nocheck

/* global Chart */

import { initAdminCommon } from '../../js/admin-common.js'
import { toast } from '../../js/components/toast.js'
import { api } from '../../js/shared/api-client.js'
import { initThemeManager } from '../../js/themes/themeManager.js'
import { loadingMessages } from '../../js/components/loadingMessages.js'
import '../../js/services/authMock.js' // ⚠️ DEV ONLY - Side-effect import for auth mock

// Chart.js will be loaded via script tag in HTML
// Global state
let products = [] // Will be populated from API

// 🌸 Easter Egg: Mensajes florales para estados de guardado
function getSavingMessage() {
  const messages = [
    '🌱 Plantando cambios...',
    '💐 Guardando con flores...',
    '🌻 Haciendo florecer actualizaciones...',
    '🌺 Cuidando tu jardín de datos...',
    '🌷 Regando modificaciones...',
    '🌹 Cultivando mejoras...',
    '🌸 Floreciendo guardado...',
    '🌼 Haciendo crecer tus cambios...'
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) {
    return 'N/A'
  }

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    console.error('[Admin] Date formatting failed:', {
      input: dateString,
      error: error.message
    })
    return 'Fecha inválida'
  }
}

/**
 * Debounce function to limit API calls
 */
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Generic confirmation and execution helper
 * LEGACY FIX: Elimina duplicación de código en confirmaciones
 */
async function confirmAndExecute(message, apiCall, logMessage, ...apiArgs) {
  const confirmed = window.confirm(message)

  if (!confirmed) {
    return false
  }

  console.log(logMessage)
  await apiCall(...apiArgs)
  return true
}

/**
 * Load products from API
 * @param {boolean} includeInactive - Include inactive products (admin only)
 * @returns {Promise<Array>} Products array
 */
async function loadProducts(includeInactive = true) {
  try {
    // Set auth token for admin access

    const result = await api.getAllProducts({ includeInactive })

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
        const result = await api.getProductImages(product.id, { size: 'thumb' })
        if (result.success && result.data && result.data.length > 0) {
          // Get primary thumb image (or first thumb image if none is primary)
          const primaryThumb = result.data.find(img => img.is_primary) || result.data[0]
          if (primaryThumb) {
            product.thumbnail_url = primaryThumb.url
          }
        }
      } catch (error) {
        console.error(error)
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

  // Setup mobile sidebar
  setupMobileSidebar()

  // Setup navigation
  setupNavigation()

  // Setup event listeners
  setupEventListeners()

  // Load initial view
  showView('dashboard')
}

/**
 * Setup mobile sidebar toggle
 */
function setupMobileSidebar() {
  const sidebar = document.getElementById('admin-sidebar')
  const overlay = document.getElementById('admin-sidebar-overlay')
  const toggleBtn = document.getElementById('admin-sidebar-toggle')
  const closeBtn = document.getElementById('admin-sidebar-close')

  if (!sidebar || !overlay || !toggleBtn) {
    console.warn('Admin sidebar elements not found')
    return
  }

  // Open sidebar
  function openSidebar() {
    sidebar.classList.add('active')
    overlay.classList.add('active')
    document.body.style.overflow = 'hidden' // Prevent background scrolling
  }

  // Close sidebar
  function closeSidebar() {
    sidebar.classList.remove('active')
    overlay.classList.remove('active')
    document.body.style.overflow = '' // Restore scrolling
  }

  // Toggle button click
  toggleBtn.addEventListener('click', openSidebar)

  // Close button click
  if (closeBtn) {
    closeBtn.addEventListener('click', closeSidebar)
  }

  // Overlay click
  overlay.addEventListener('click', closeSidebar)

  // Close sidebar when clicking a menu item (mobile only)
  const menuItems = sidebar.querySelectorAll('.sidebar-menu-item')
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      // Only close on mobile (check if sidebar has active class)
      if (sidebar.classList.contains('active')) {
        closeSidebar()
      }
    })
  })

  // Close sidebar on escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) {
      closeSidebar()
    }
  })

  console.log('✅ Mobile sidebar initialized')
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
    const ordersResult = await api.getAllOrders()
    const allOrders = ordersResult.success ? ordersResult.data : []

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
      // Remove auth token from localStorage
      localStorage.removeItem('authToken')
      sessionStorage.removeItem('authToken')

      // Simulate logout
      console.log('Logging out...')

      // Redirect to home page immediately (no alert needed for automated tests)
      window.location.href = '/index.html'
    })
  }
}

/**
 * Show specified view and hide others
 */
async function showView(view) {
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

  // Special handling for users view
  if (view === 'users') {
    loadUsersData()
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
    // Set auth token for admin access

    const result = await api.getAllOccasions()
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
 * Normalize text for accent-insensitive search
 * Matches backend normalization logic
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 */
function normalizeText(text) {
  if (!text || typeof text !== 'string') {
    return ''
  }

  return text
    .toLowerCase()
    .normalize('NFD') // Decompose combined characters (é → e + ́)
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .replace(/[^a-z0-9 ]/g, '') // Keep only alphanumeric + spaces
    .trim()
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

  const searchTerm = searchInput.value.trim()
  const occasionId = occasionFilter.value
  const status = statusFilter.value

  let filtered = [...products]

  // Text search with accent-insensitive normalization
  if (searchTerm) {
    const normalizedSearch = normalizeText(searchTerm)
    filtered = filtered.filter(
      product =>
        normalizeText(product.name).includes(normalizedSearch) ||
        normalizeText(product.description || '').includes(normalizedSearch) ||
        normalizeText(product.sku || '').includes(normalizedSearch) ||
        normalizeText(product.occasion || '').includes(normalizedSearch)
    )
  }

  // Filter by occasion (requires checking product_occasions relationship)
  if (occasionId) {
    try {
      console.log(`Filtering by occasion ID: ${occasionId}`)
      // Fetch products for this occasion from API
      const result = await api.getProductsByOccasion(occasionId)
      console.log(`Products for occasion ${occasionId}:`, result.data.length)
      const occasionProductIds = result.data.map(p => p.id)

      // Filter local products to only those in this occasion
      const beforeCount = filtered.length
      filtered = filtered.filter(product => occasionProductIds.includes(product.id))
      console.log(`Filtered: ${beforeCount} → ${filtered.length} products`)
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

  // Add event listeners to edit links (save return URL for back navigation)
  document.querySelectorAll('.edit-product-link').forEach(link => {
    link.addEventListener('click', () => {
      // Save current URL for back navigation (preserves pagination, filters, etc.)
      const currentUrl = window.location.href
      sessionStorage.setItem('editProductReturnUrl', currentUrl)
    })
  })

  // Add event listener to "Nuevo Producto" button (save return URL for back navigation)
  const newProductBtn = document.getElementById('new-product-btn')
  if (newProductBtn) {
    newProductBtn.addEventListener('click', () => {
      // Save current URL for back navigation
      const currentUrl = window.location.href
      sessionStorage.setItem('editProductReturnUrl', currentUrl)
    })
  }

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

import { onDOMReady } from '../../js/shared/dom-ready.js'

// Initialize when DOM is ready
onDOMReady(() => {
  // Initialize icons first

  // Then initialize admin functionality
  init()
  initAdminCommon()
  initThemeManager()

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

  // Validate file type (any image format)
  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona un archivo de imagen válido.')
    event.target.value = ''
    return
  }

  // Validate file size (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    alert('La imagen no debe superar 2MB.')
    event.target.value = ''
    return
  }

  heroImageFile = file

  // Show preview of selected image (backend will process)
  const reader = new FileReader()
  reader.onload = e => {
    const uploadArea = document.querySelector('#hero-image-upload + label')
    if (uploadArea) {
      uploadArea.innerHTML = `
        <img src="${e.target.result}" alt="Preview" class="max-h-32 rounded-lg mx-auto mb-2" style="max-height: 150px;">
        <p class="text-sm text-green-600 font-medium">✓ Imagen seleccionada</p>
        <p class="text-xs text-gray-500 mt-1">${file.name} (${(file.size / 1024).toFixed(2)} KB - se procesará a WebP optimizado)</p>
      `
    }
  }
  reader.readAsDataURL(file)

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

  // Validate file type (any image format)
  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona un archivo de imagen válido.')
    event.target.value = ''
    return
  }

  // Validate file size (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    alert('La imagen no debe superar 2MB.')
    event.target.value = ''
    return
  }

  // Store file and show preview (backend will process)
  logoFile = file

  // Show preview of original image
  const reader = new FileReader()
  reader.onload = e => {
    const img = new Image()
    img.onload = () => {
      const previewArea = document.getElementById('logo-preview-area')
      const previewImg = document.getElementById('logo-preview')
      const dimensionsText = document.getElementById('logo-dimensions')

      if (previewArea && previewImg && dimensionsText) {
        previewImg.src = e.target.result
        dimensionsText.textContent = `Original: ${img.width}x${img.height}px - ${(file.size / 1024).toFixed(2)} KB (se procesará a 128x128px WebP)`
        previewArea.classList.remove('hidden')
      }

      // Enable save button
      const saveButton = document.getElementById('save-logo-btn')
      if (saveButton) {
        saveButton.disabled = false
      }
    }
    img.onerror = () => {
      alert('Error al cargar la imagen. Por favor intenta con otra imagen.')
      event.target.value = ''
    }
    img.src = e.target.result
  }
  reader.readAsDataURL(file)
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
    saveButton.innerHTML = `<i data-lucide="loader" class="h-4 w-4 animate-spin"></i> ${getSavingMessage()}`
    saveButton.disabled = true

    // Create form data
    const formData = new FormData()
    formData.append('image', heroImageFile)
    formData.append('setting_key', 'hero_image')

    // Send request to save image
    const result = await api.uploadSettingImage('hero_image', heroImageFile)

    if (result.success) {
      // Reload hero image preview (with cache bust)
      await loadHeroImagePreview()
      // Reset upload UI
      const uploadArea = document.querySelector('#hero-image-upload + label')
      if (uploadArea) {
        uploadArea.innerHTML = `
          <i data-lucide="upload-cloud" class="h-8 w-8 text-gray-400 mb-2"></i>
          <span class="text-sm text-gray-600">Haz clic para seleccionar una imagen</span>
          <span class="text-xs text-gray-500 mt-1">(JPG, PNG, WebP - Máx 4MB)</span>
        `
      }
      // Reinitialize icons
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
    saveButton.innerHTML = `<i data-lucide="loader" class="h-4 w-4 animate-spin"></i> ${getSavingMessage()}`
    saveButton.disabled = true

    // Create form data
    const formData = new FormData()
    formData.append('image', logoFile)
    formData.append('setting_key', 'site_logo')

    // Send request to save logo
    const result = await api.uploadSettingImage('site_logo', logoFile)

    if (result.success) {
      // Reload logo preview (with cache bust)
      await loadLogoPreview()
      // Reset preview area
      const previewArea = document.getElementById('logo-preview-area')
      if (previewArea) {
        previewArea.classList.add('hidden')
      }
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
    saveButton.innerHTML = `<i data-lucide="loader" class="h-4 w-4 animate-spin"></i> ${getSavingMessage()}`
    saveButton.disabled = true

    // Send request to save BCV price
    const result = await api.createBcvprice(bcvPriceValue)

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
 * ALWAYS use local path: public/images/hero-flowers.webp
 * Hero images are stored locally in public/images/, NOT in Supabase
 */
function loadHeroImagePreview() {
  try {
    // Hero image siempre en public/images/hero-flowers.webp (relative to /public/pages/admin/)
    const heroImageUrl = '../../images/hero-flowers.webp'

    const heroImage = document.getElementById('current-hero-image')
    const noHeroImageText = document.getElementById('no-hero-image-text')

    // Add timestamp to bypass cache
    heroImage.src = `${heroImageUrl}?t=${Date.now()}`
    heroImage.classList.remove('hidden')
    noHeroImageText.classList.add('hidden')

    // Handle error if image doesn't exist
    heroImage.onerror = () => {
      heroImage.classList.add('hidden')
      noHeroImageText.classList.remove('hidden')
      console.warn('Hero image not found at:', heroImageUrl)
    }
  } catch (error) {
    console.error('Error loading hero image preview:', error)
  }
}

/**
 * Load logo preview
 * ALWAYS use local path: public/images/logoFloresYa.jpeg
 * Logo images are stored locally in public/images/, NOT in Supabase
 */
function loadLogoPreview() {
  try {
    // Logo siempre en public/images/logoFloresYa.jpeg (relative to /public/pages/admin/)
    const logoUrl = '../../images/logoFloresYa.jpeg'

    const logo = document.getElementById('current-logo')
    const noLogoText = document.getElementById('no-logo-text')

    // Add timestamp to bypass cache
    logo.src = `${logoUrl}?t=${Date.now()}`
    logo.classList.remove('hidden')
    noLogoText.classList.add('hidden')

    // Handle error if image doesn't exist
    logo.onerror = () => {
      logo.classList.add('hidden')
      noLogoText.classList.remove('hidden')
      console.warn('Logo not found at:', logoUrl)
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
    const result = await api.getValue('bcv_usd_rate')
    const bcvPrice = result.data

    const bcvPriceElement = document.getElementById('current-bcv-price')
    if (bcvPrice) {
      bcvPriceElement.textContent = `Bs. ${parseFloat(bcvPrice).toFixed(2)}`
    } else {
      bcvPriceElement.textContent = 'No establecido'
    }
  } catch (error) {
    console.error('Error loading BCV price:', error)
    document.getElementById('current-bcv-price').textContent = 'Error al cargar'
  }
}

// ==================== USER MANAGEMENT ====================

let users = []
let currentEditingUser = null

/**
 * Load users data from API (KISS principle - no mandatory pagination)
 */
async function loadUsersData(_page = 1) {
  try {
    showUsersLoading(true)

    // Set admin auth token
    if (window.authMock) {
      localStorage.setItem('authToken', 'admin-token')
    }

    const filters = buildUsersFilters()

    // KISS principle: Only add pagination if user explicitly searches or navigates
    const hasSearchFilter = filters.search && filters.search.trim().length > 0
    const hasRoleFilter = filters.role && filters.role.trim().length > 0
    const hasEmailVerifiedFilter = filters.email_verified !== undefined
    const hasStatusFilter = filters.is_active !== undefined
    const hasAnyFilter =
      hasSearchFilter || hasRoleFilter || hasEmailVerifiedFilter || hasStatusFilter

    if (hasAnyFilter) {
      // Only paginate when user is searching
      // Always reset to page 1 when starting a new search
      paginationState.currentPage = 1

      filters.limit = paginationState.pageSize
      filters.offset = (paginationState.currentPage - 1) * paginationState.pageSize
      console.log('Loading users with filters and pagination:', filters)
    } else {
      // Reset pagination when showing all users
      paginationState.currentPage = 1
      // No pagination for initial load - show ALL users
      console.log('Loading ALL users without pagination:', filters)
    }

    const result = await api.getAllUsers(filters)

    if (!result.success) {
      throw new Error(result.message || 'Failed to load users')
    }

    users = result.data || []

    // Update pagination state
    if (hasAnyFilter) {
      paginationState.totalUsers = result.total || users.length
      paginationState.totalPages = Math.ceil(paginationState.totalUsers / paginationState.pageSize)
    } else {
      // When showing all users, disable pagination
      paginationState.totalUsers = users.length
      paginationState.totalPages = 1
    }

    console.log(
      `Loaded ${users.length} users of ${paginationState.totalUsers} total (page ${paginationState.currentPage})`
    )

    renderUsersTable(users)
    updateUsersStats(users)
    updatePaginationControls()
    setupUsersEventListeners()
  } catch (error) {
    console.error('Error loading users:', error)
    toast.error('Error al cargar usuarios: ' + (error.message || 'Error desconocido'))
    showUsersError()
  } finally {
    showUsersLoading(false)
  }
}

// Pagination state
const paginationState = {
  currentPage: 1,
  pageSize: 10,
  totalPages: 0,
  totalUsers: 0
}

/**
 * Clear user search and reset pagination
 */
function clearUserSearch() {
  const searchInput = document.getElementById('user-search-input')
  const roleFilter = document.getElementById('user-role-filter')
  const emailVerifiedFilter = document.getElementById('user-email-verified-filter')
  const statusFilter = document.getElementById('user-status-filter')

  if (searchInput) {
    searchInput.value = ''
    searchInput.focus()
  }

  if (roleFilter) {
    roleFilter.value = ''
  }

  if (emailVerifiedFilter) {
    emailVerifiedFilter.value = ''
  }

  if (statusFilter) {
    statusFilter.value = ''
  }

  // Reset pagination to first page and reload all users
  paginationState.currentPage = 1

  // Reload data without page parameter to show all users
  loadUsersData()
}

/**
 * Go to specific page
 */
function goToPage(page) {
  if (page < 1 || page > paginationState.totalPages) {
    return
  }

  paginationState.currentPage = page
  loadUsersData(page)
}

/**
 * Update pagination controls visibility and state
 */
function updatePaginationControls() {
  const prevBtn = document.getElementById('pagination-prev')
  const nextBtn = document.getElementById('pagination-next')
  const pageNumbers = document.getElementById('pagination-numbers')
  const startEl = document.getElementById('pagination-start')
  const endEl = document.getElementById('pagination-end')
  const totalEl = document.getElementById('pagination-total')

  // Update info text
  const start = (paginationState.currentPage - 1) * paginationState.pageSize + 1
  const end = Math.min(
    paginationState.currentPage * paginationState.pageSize,
    paginationState.totalUsers
  )

  if (startEl) {
    startEl.textContent = start
  }
  if (endEl) {
    endEl.textContent = end
  }
  if (totalEl) {
    totalEl.textContent = paginationState.totalUsers
  }

  // Update button states
  if (prevBtn) {
    prevBtn.disabled = paginationState.currentPage <= 1
  }
  if (nextBtn) {
    nextBtn.disabled = paginationState.currentPage >= paginationState.totalPages
  }

  // Generate page numbers
  if (pageNumbers) {
    pageNumbers.innerHTML = ''

    const maxVisiblePages = 5

    if (paginationState.totalPages <= maxVisiblePages) {
      // Show all pages
      for (let i = 1; i <= paginationState.totalPages; i++) {
        pageNumbers.innerHTML += createPageButton(i, i === paginationState.currentPage)
      }
    } else {
      // Show limited pages with ellipsis
      if (paginationState.currentPage <= 3) {
        // Near start: 1, 2, 3, ..., last
        for (let i = 1; i <= 3; i++) {
          pageNumbers.innerHTML += createPageButton(i, i === paginationState.currentPage)
        }
        if (paginationState.totalPages > 3) {
          pageNumbers.innerHTML += '<span class="px-2 text-gray-500">...</span>'
          pageNumbers.innerHTML += createPageButton(
            paginationState.totalPages,
            paginationState.currentPage === paginationState.totalPages
          )
        }
      } else if (paginationState.currentPage >= paginationState.totalPages - 2) {
        // Near end: first, ..., last-2, last-1, last
        pageNumbers.innerHTML += createPageButton(1, paginationState.currentPage === 1)
        pageNumbers.innerHTML += '<span class="px-2 text-gray-500">...</span>'
        for (let i = paginationState.totalPages - 2; i <= paginationState.totalPages; i++) {
          pageNumbers.innerHTML += createPageButton(i, i === paginationState.currentPage)
        }
      } else {
        // Middle: first, ..., current-1, current, current+1, ..., last
        pageNumbers.innerHTML += createPageButton(1, paginationState.currentPage === 1)
        pageNumbers.innerHTML += '<span class="px-2 text-gray-500">...</span>'
        for (let i = paginationState.currentPage - 1; i <= paginationState.currentPage + 1; i++) {
          pageNumbers.innerHTML += createPageButton(i, i === paginationState.currentPage)
        }
        pageNumbers.innerHTML += '<span class="px-2 text-gray-500">...</span>'
        pageNumbers.innerHTML += createPageButton(
          paginationState.totalPages,
          paginationState.currentPage === paginationState.totalPages
        )
      }
    }
  }
}

/**
 * Create pagination button element
 */
function createPageButton(pageNum, isCurrent) {
  const baseClasses = 'px-3 py-2 text-sm border rounded-md transition-colors'
  const activeClasses = 'bg-pink-600 text-white border-pink-600'
  const inactiveClasses = 'border-gray-300 hover:bg-gray-50 text-gray-700'

  const classes = isCurrent
    ? `${baseClasses} ${activeClasses}`
    : `${baseClasses} ${inactiveClasses}`

  return `<button class="${classes}" onclick="window.goToPage(${pageNum})">${pageNum}</button>`
}

// Make pagination functions globally accessible
window.goToPage = goToPage
window.clearUserSearch = clearUserSearch

/**
 * Build filters object from form inputs
 */
function buildUsersFilters() {
  const filters = {}

  const searchInput = document.getElementById('user-search-input')
  const roleFilter = document.getElementById('user-role-filter')
  const emailVerifiedFilter = document.getElementById('user-email-verified-filter')
  const statusFilter = document.getElementById('user-status-filter')

  if (searchInput?.value.trim()) {
    filters.search = searchInput.value.trim()
  }

  if (roleFilter?.value.trim()) {
    filters.role = roleFilter.value.trim()
  }

  if (emailVerifiedFilter?.value.trim()) {
    filters.email_verified = emailVerifiedFilter.value.trim() === 'true'
  }

  if (statusFilter?.value.trim()) {
    filters.is_active = statusFilter.value.trim() === 'true'
  }

  return filters
}

/**
 * Update users statistics cards
 */
function updateUsersStats(usersList) {
  const totalUsers = document.getElementById('total-users')
  const activeUsers = document.getElementById('active-users')
  const adminUsers = document.getElementById('admin-users')
  const verifiedUsers = document.getElementById('verified-users')

  if (totalUsers) {
    totalUsers.textContent = usersList.length
  }
  if (activeUsers) {
    activeUsers.textContent = usersList.filter(u => u.is_active).length
  }
  if (adminUsers) {
    adminUsers.textContent = usersList.filter(u => u.role === 'admin').length
  }
  if (verifiedUsers) {
    verifiedUsers.textContent = usersList.filter(u => u.email_verified).length
  }
}

/**
 * Render users table
 */
function renderUsersTable(usersList) {
  const tableBody = document.getElementById('users-table-body')
  const emptyState = document.getElementById('users-empty')

  if (!tableBody) {
    return
  }

  if (usersList.length === 0) {
    tableBody.innerHTML = ''
    if (emptyState) {
      emptyState.classList.remove('hidden')
    }
    return
  }

  if (emptyState) {
    emptyState.classList.add('hidden')
  }

  tableBody.innerHTML = usersList
    .map(
      user => `
    <tr class="hover:bg-gray-50">
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex items-center">
          <div class="flex-shrink-0 h-10 w-10 bg-pink-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5 text-pink-600">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div class="ml-4">
            <div class="text-sm font-medium text-gray-900">${escapeHtml(user.full_name || 'Sin nombre')}</div>
            <div class="text-sm text-gray-500">${escapeHtml(user.email)}</div>
            <div class="text-xs text-gray-400">ID: ${user.id}</div>
          </div>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        ${
          user.role === 'admin' && user.id === 3
            ? `
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 mr-1">
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
            </svg>
            Administrador
          </span>
        `
            : `
          <button
            onclick="toggleUserRole(${user.id}, '${user.role}')"
            class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              user.role === 'admin'
                ? 'bg-purple-100 text-purple-800 hover:opacity-80'
                : 'bg-gray-100 text-gray-800 hover:opacity-80'
            } transition-colors"
            title="Click para cambiar rol"
          >
            ${
              user.role === 'admin'
                ? `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 mr-1">
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
                  </svg>`
                : `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 mr-1">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>`
            }
            ${user.role === 'admin' ? 'Administrador' : 'Cliente'}
          </button>
        `
        }
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        ${
          user.role === 'admin' && user.id === 3
            ? `
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 mr-1">
              <path d="M22 4H2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4Z"/>
              <path d="M17 10l-5 5-3-3"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            Verificado
          </span>
        `
            : `
          <button
            onclick="toggleEmailVerification(${user.id}, ${user.email_verified})"
            class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              user.email_verified
                ? 'bg-green-100 text-green-800 hover:opacity-80'
                : 'bg-yellow-100 text-yellow-800 hover:opacity-80'
            } transition-colors"
            title="Click para ${user.email_verified ? 'marcar como no verificado' : 'verificar'}"
          >
            ${
              user.email_verified
                ? `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 mr-1">
                    <path d="M22 4H2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4Z"/>
                    <path d="M17 10l-5 5-3-3"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>`
                : `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 mr-1">
                    <path d="M22 4H2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4Z"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>`
            }
            ${user.email_verified ? 'Verificado' : 'Pendiente'}
          </button>
        `
        }
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-center">
        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }">
          ${user.is_active ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ${formatDate(user.created_at)}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div class="flex justify-end space-x-2">
          <button
            onclick="editUser(${user.id})"
            class="text-pink-600 hover:text-pink-900 p-1 rounded"
            title="Editar usuario"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          ${
            user.role !== 'admin' || user.id !== 3
              ? `
            <button
              onclick="toggleUserStatus(${user.id}, ${user.is_active})"
              class="${
                user.is_active
                  ? 'text-yellow-600 hover:text-yellow-900'
                  : 'text-green-600 hover:text-green-900'
              } p-1 rounded"
              title="${user.is_active ? 'Desactivar usuario' : 'Reactivar usuario'}"
            >
              ${
                user.is_active
                  ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                      <path d="M9 9a3 3 0 1 1 6 0"/>
                      <path d="M12 12v3"/>
                      <path d="M3 12a9 9 0 1 0 18 0"/>
                    </svg>`
                  : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                      <path d="M20 6L9 17l-5-5"/>
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    </svg>`
              }
            </button>
          `
              : ''
          }
        </div>
      </td>
    </tr>
  `
    )
    .join('')
}

/**
 * Setup users event listeners
 */
function setupUsersEventListeners() {
  // Search input
  const searchInput = document.getElementById('user-search-input')
  if (searchInput) {
    searchInput.addEventListener('input', debounce(loadUsersData, 500))
  }

  // Role filter
  const roleFilter = document.getElementById('user-role-filter')
  if (roleFilter) {
    roleFilter.addEventListener('change', loadUsersData)
  }

  // Email verification filter
  const emailVerifiedFilter = document.getElementById('user-email-verified-filter')
  if (emailVerifiedFilter) {
    emailVerifiedFilter.addEventListener('change', loadUsersData)
  }

  // Status filter
  const statusFilter = document.getElementById('user-status-filter')
  if (statusFilter) {
    statusFilter.addEventListener('change', loadUsersData)
  }

  // Create user button
  const createBtn = document.getElementById('create-user-btn')
  if (createBtn) {
    createBtn.addEventListener('click', openCreateUserModal)
  }

  // Clear search button
  const clearSearchBtn = document.getElementById('clear-search-btn')
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', clearUserSearch)
  }

  // Modal events
  setupUserModalEvents()
  setupDeleteModalEvents()
}

/**
 * Setup user modal events
 */
function setupUserModalEvents() {
  const modal = document.getElementById('user-modal')
  const form = document.getElementById('user-form')
  const closeBtn = document.getElementById('close-user-modal')
  const cancelBtn = document.getElementById('cancel-user-form')
  const emailInput = document.getElementById('user-email')
  const magicLinkBtn = document.getElementById('send-magic-link-btn')

  if (closeBtn) {
    closeBtn.addEventListener('click', closeUserModal)
  }
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeUserModal)
  }
  if (form) {
    form.addEventListener('submit', handleUserFormSubmit)
  }

  // Auto-complete form when email is entered
  if (emailInput) {
    emailInput.addEventListener('blur', handleEmailLookup)
  }

  // Magic Link button (disabled for now)
  if (magicLinkBtn) {
    magicLinkBtn.addEventListener('click', () => {
      toast.info('Funcionalidad de Magic Link próximamente disponible')
    })
  }

  // Close modal on outside click
  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        closeUserModal()
      }
    })
  }
}

/**
 * Handle email lookup for auto-completion
 */
async function handleEmailLookup(e) {
  const email = e.target.value.trim()

  if (!email || !email.includes('@')) {
    return
  }

  try {
    // Buscar usuario por email - usar búsqueda general con parámetro de email
    const result = await api.getAllUsers({ search: email })

    if (result.success && result.data) {
      const user = result.data

      // Auto-completar formulario con datos existentes
      document.getElementById('user-full-name').value = user.full_name || ''
      document.getElementById('user-phone').value = user.phone || ''
      document.getElementById('user-role').value = user.role || 'user'

      // Guardar referencia al usuario existente
      currentEditingUser = user

      // Actualizar título del modal
      const modalTitle = document.getElementById('user-modal-title')
      if (modalTitle) {
        modalTitle.textContent = 'Actualizar Usuario Existente'
      }

      // Actualizar texto del botón submit
      const submitText = document.getElementById('user-form-submit-text')
      if (submitText) {
        submitText.textContent = 'Actualizar Usuario'
      }

      toast.info(`Usuario encontrado: ${user.full_name}. Los datos se actualizarán al guardar.`)
    }
  } catch (error) {
    // Si no encuentra el usuario, es un nuevo usuario (guest)
    console.error(error)
    console.log('Usuario no encontrado, será creado como nuevo:', email)
    currentEditingUser = null

    // Restablecer título
    const modalTitle = document.getElementById('user-modal-title')
    if (modalTitle) {
      modalTitle.textContent = 'Crear Nuevo Usuario'
    }

    const submitText = document.getElementById('user-form-submit-text')
    if (submitText) {
      submitText.textContent = 'Crear Usuario'
    }
  }
}

/**
 * Setup delete modal events
 */
function setupDeleteModalEvents() {
  const modal = document.getElementById('confirm-delete-modal')
  const cancelBtn = document.getElementById('cancel-delete')

  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeDeleteModal)
  }

  // Close modal on outside click
  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        closeDeleteModal()
      }
    })
  }
}

/**
 * Open create user modal
 */
function openCreateUserModal() {
  // Redirect to user form page for creating new user
  window.location.href = './user-form.html?mode=create'
}

/**
 * Open edit user modal
 */
function editUser(userId) {
  // Redirect to user form page for editing
  window.location.href = `./user-form.html?mode=edit&id=${userId}`
}

/**
 * Check if user form has unsaved changes
 * @returns {boolean} True if form has changes
 */
function hasUnsavedUserFormChanges() {
  const form = document.getElementById('user-form')
  if (!form) {
    return false
  }

  const email = document.getElementById('user-email')?.value || ''
  const fullName = document.getElementById('user-full-name')?.value || ''
  const phone = document.getElementById('user-phone')?.value || ''
  const role = document.getElementById('user-role')?.value || ''
  const password = document.getElementById('user-password')?.value || ''

  // Check if any field has content
  return (
    email.trim() !== '' ||
    fullName.trim() !== '' ||
    phone.trim() !== '' ||
    role !== '' ||
    password !== ''
  )
}

/**
 * Close user modal with unsaved changes confirmation
 */
function closeUserModal() {
  try {
    // Check for unsaved changes
    if (hasUnsavedUserFormChanges()) {
      const confirmDiscard = window.confirm(
        '¿Estás seguro de que quieres cerrar? Hay cambios sin guardar que se perderán.'
      )
      if (!confirmDiscard) {
        return
      }
    }

    // Reset form
    const form = document.getElementById('user-form')
    if (form) {
      form.reset()
    }

    // Hide modal
    const modal = document.getElementById('user-modal')
    if (modal) {
      modal.classList.add('hidden')
    }

    // Clear editing state
    currentEditingUser = null
  } catch (error) {
    console.error('Error closing user modal:', error)
    throw error
  }
}

/**
 * Handle user form submit
 */
async function handleUserFormSubmit(e) {
  e.preventDefault()

  try {
    const form = e.target
    const formData = new FormData(form)
    const userData = Object.fromEntries(formData.entries())

    const submitBtn = form.querySelector('button[type="submit"]')
    submitBtn.disabled = true
    submitBtn.textContent = currentEditingUser ? getSavingMessage() : `🌱 ${getSavingMessage()}`

    const result = currentEditingUser
      ? await api.updateUsers(currentEditingUser.id, userData)
      : await api.createUsers(userData)

    if (!result.success) {
      throw new Error(result.message || 'Operation failed')
    }

    toast.success(
      currentEditingUser ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente'
    )
    closeUserModal()
    await loadUsersData()
  } catch (error) {
    console.error('Error saving user:', error)
    toast.error('Error al guardar usuario: ' + error.message)
  } finally {
    const submitBtn = e.target.querySelector('button[type="submit"]')
    submitBtn.disabled = false
    submitBtn.textContent = currentEditingUser ? 'Guardar Cambios' : 'Crear Usuario'
  }
}

/**
 * Deactivate user
 */
function deactivateUser(userId, userName) {
  const modal = document.getElementById('confirm-delete-modal')
  const message = document.getElementById('delete-confirm-message')
  const confirmBtn = document.getElementById('confirm-delete')

  if (message) {
    message.textContent = `¿Estás seguro de que deseas desactivar al usuario "${userName}"?`
  }

  if (confirmBtn) {
    confirmBtn.onclick = async () => {
      try {
        confirmBtn.disabled = true
        confirmBtn.textContent = 'Desactivando...'

        const result = await api.deleteUsers(userId)

        if (!result.success) {
          throw new Error(result.message)
        }

        toast.success('Usuario desactivado correctamente')
        closeDeleteModal()
        await loadUsersData()
      } catch (error) {
        console.error('Error deactivating user:', error)
        toast.error('Error al desactivar usuario: ' + error.message)
      } finally {
        confirmBtn.disabled = false
        confirmBtn.textContent = 'Desactivar Usuario'
      }
    }
  }

  if (modal) {
    modal.classList.remove('hidden')
  }
}

/**
 * Reactivate user
 */
async function reactivateUser(userId, userName) {
  try {
    const result = await api.reactivateUsers(userId, {})

    if (!result.success) {
      throw new Error(result.message)
    }

    toast.success(`Usuario "${userName}" reactivado correctamente`)
    await loadUsersData()
  } catch (error) {
    console.error('Error reactivating user:', error)
    toast.error('Error al reactivar usuario: ' + error.message)
  }
}

/**
 * Toggle user role (user <-> admin)
 */
window.toggleUserRole = async function (userId, currentRole) {
  try {
    // Protección: No permitir cambiar rol del admin principal (ID 3)
    if (userId === 3) {
      toast.warning('No se puede cambiar el rol del administrador principal')
      return
    }

    // Validar parámetros
    if (!currentRole || !['admin', 'user'].includes(currentRole)) {
      console.error('Invalid current role:', currentRole)
      toast.error('Error: rol actual inválido')
      return
    }

    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    const roleName = newRole === 'admin' ? 'Administrador' : 'Cliente'

    // LEGACY FIX: Usar función genérica para eliminar duplicación
    const confirmed = await confirmAndExecute(
      `¿Estás seguro de cambiar el rol a "${roleName}"?`,
      api.updateUsers,
      `Changing user ${userId} role from ${currentRole} to ${newRole}`,
      userId,
      { role: newRole }
    )

    if (!confirmed) {
      return
    }

    const result = { success: true } // Ya ejecutado por confirmAndExecute

    if (!result.success) {
      throw new Error(result.message || 'Error al cambiar rol')
    }

    toast.success(`Rol actualizado a "${roleName}"`)
    await loadUsersData()
  } catch (error) {
    console.error('Error toggling user role:', error)
    toast.error('Error al cambiar rol: ' + (error.message || 'Error desconocido'))
  }
}

/**
 * Toggle user active status
 */
window.toggleUserStatus = async function (userId, currentStatus) {
  try {
    // Protección: No permitir desactivar al admin principal (ID 3)
    if (userId === 3 && currentStatus === true) {
      toast.warning('No se puede desactivar al administrador principal')
      return
    }

    // Validar parámetros
    if (typeof currentStatus !== 'boolean') {
      console.error('Invalid current status:', currentStatus)
      toast.error('Error: estado actual inválido')
      return
    }

    // Si es desactivación, redirigir a página de confirmación
    if (currentStatus === true) {
      window.location.href = `./user-delete-confirm.html?id=${userId}`
      return
    }

    // Si es reactivación, ejecutar directamente
    const action = 'activar'
    const actionText = 'activado'

    const confirmed = await confirmAndExecute(
      `¿Estás seguro de ${action} este usuario?`,
      api.reactivateUsers,
      `Reactivating user ${userId}`,
      userId,
      {}
    )

    if (!confirmed) {
      return
    }

    toast.success(`Usuario ${actionText} correctamente`)
    await loadUsersData()
  } catch (error) {
    console.error('Error toggling user status:', error)
    toast.error('Error al cambiar estado: ' + (error.message || 'Error desconocido'))
  }
}

/**
 * Toggle email verification status
 */
window.toggleEmailVerification = async function (userId, currentStatus) {
  try {
    // Protección: Admin principal (ID 3) siempre verificado
    if (userId === 3 && currentStatus === true) {
      toast.warning('El email del administrador principal siempre está verificado')
      return
    }

    // Validar parámetros
    if (typeof currentStatus !== 'boolean') {
      console.error('Invalid current verification status:', currentStatus)
      toast.error('Error: estado de verificación inválido')
      return
    }

    const action = currentStatus ? 'marcar como no verificado' : 'verificar'
    const actionText = currentStatus ? 'marcado como no verificado' : 'verificado'

    // LEGACY FIX: Determinar API call basado en estado
    const apiCall = currentStatus
      ? (id, data) => api.updateUsers(id, data)
      : (id, data) => api.verifyUserEmail(id, data)
    const apiArgs = currentStatus ? [userId, { email_verified: false }] : [userId, {}]
    const logMessage = `Changing user ${userId} email verification from ${currentStatus} to ${!currentStatus}`

    // LEGACY FIX: Usar función genérica para eliminar duplicación
    const confirmed = await confirmAndExecute(
      `¿Estás seguro de ${action} el email de este usuario?`,
      apiCall,
      logMessage,
      ...apiArgs
    )

    if (!confirmed) {
      return
    }

    const result = { success: true } // Ya ejecutado por confirmAndExecute

    if (!result.success) {
      throw new Error(result.message || `Error al ${action} email`)
    }

    toast.success(`Email ${actionText} correctamente`)
    await loadUsersData()
  } catch (error) {
    console.error('Error toggling email verification:', error)
    toast.error('Error al cambiar verificación: ' + (error.message || 'Error desconocido'))
  }
}

/**
 * Close delete modal
 */
function closeDeleteModal() {
  const modal = document.getElementById('confirm-delete-modal')
  if (modal) {
    modal.classList.add('hidden')
  }
}

/**
 * Show users loading state
 */
function showUsersLoading(show) {
  const loading = document.getElementById('users-loading')
  const tableBody = document.getElementById('users-table-body')
  const emptyState = document.getElementById('users-empty')

  if (loading) {
    loading.classList.toggle('hidden', !show)
    // 🌸 Easter Egg: Aplicar mensaje floral cuando se muestra loading
    if (show) {
      loadingMessages.applyToElement(loading)
    }
  }
  if (tableBody) {
    tableBody.classList.toggle('hidden', show)
  }
  if (emptyState) {
    emptyState.classList.add('hidden')
  }
}

/**
 * Show users error state
 */
function showUsersError() {
  const tableBody = document.getElementById('users-table-body')
  const emptyState = document.getElementById('users-empty')

  if (tableBody) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="px-6 py-8 text-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8 mx-auto mb-2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" x2="12" y1="8" y2="12"/>
            <line x1="12" x2="12.01" y1="16" y2="16"/>
          </svg>
          <p>Error al cargar usuarios</p>
        </td>
      </tr>
    `
  }

  if (emptyState) {
    emptyState.classList.add('hidden')
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

// ==================== GLOBAL FUNCTIONS FOR HTML ONCLICK ====================

// Expose user management functions globally for HTML onclick handlers
window.editUser = editUser
window.deactivateUser = deactivateUser
window.reactivateUser = reactivateUser
