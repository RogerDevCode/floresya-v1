/**
 * Orders Management Module
 * Handles order status changes with inline dropdown
 */

import '../../js/lucide-icons.js'
import { initAdminCommon } from '../../js/admin-common.js'
import { api } from '../../js/shared/api-client.js'

// Global state
let currentFilter = 'all'
let currentYearFilter = new Date().getFullYear().toString() // Default: current year
let currentDateFilter = '' // Date range filter (30, 60, 90, custom, empty = all)
let customDateFrom = ''
let customDateTo = ''
let searchQuery = ''
let currentPage = 1
let itemsPerPage = 50
let allOrders = [] // All orders from API
let orders = [] // Filtered orders

// Order statuses with colors (aligned with DB_SCHEMA.orders.enums.status)
const ORDER_STATUSES = {
  pending: {
    label: 'Pendiente',
    color: 'blue',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-800'
  },
  verified: {
    label: 'Verificado',
    color: 'indigo',
    bgClass: 'bg-indigo-100',
    textClass: 'text-indigo-800'
  },
  preparing: {
    label: 'Preparando',
    color: 'yellow',
    bgClass: 'bg-yellow-100',
    textClass: 'text-yellow-800'
  },
  shipped: {
    label: 'Enviado',
    color: 'purple',
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-800'
  },
  delivered: {
    label: 'Entregado',
    color: 'green',
    bgClass: 'bg-green-100',
    textClass: 'text-green-800'
  },
  cancelled: {
    label: 'Cancelado',
    color: 'red',
    bgClass: 'bg-red-100',
    textClass: 'text-red-800'
  }
}

// No mock data - using real API only

/**
 * Initialize orders management
 */
async function init() {
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons()
  }

  // Set initial year filter to current year
  const yearFilter = document.getElementById('year-filter')
  if (yearFilter) {
    yearFilter.value = currentYearFilter
  }

  setupEventListeners()
  await fetchOrdersFromAPI()
}

/**
 * Fetch orders from API
 */
async function fetchOrdersFromAPI() {
  try {
    // Set auth token for admin access

    const result = await api.getAllOrders()
    if (!result.success || !Array.isArray(result.data)) {
      throw new Error('Invalid API response format')
    }

    allOrders = result.data.map(order => ({
      id: order.id,
      customer_name: order.customer_name || 'Cliente Desconocido',
      customer_email: order.customer_email || '',
      customer_phone: order.customer_phone || '',
      delivery_address: order.delivery_address || '',
      delivery_date: order.delivery_date || '',
      delivery_time_slot: order.delivery_time_slot || '',
      items: order.order_items || [],
      total_usd: parseFloat(order.total_amount_usd) || 0,
      total_ves: parseFloat(order.total_amount_ves) || 0,
      status: order.status || 'pending',
      created_at: order.created_at || new Date().toISOString(),
      notes: order.notes || '',
      delivery_notes: order.delivery_notes || ''
    }))

    // Sort by date DESC (most recent first)
    allOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    console.log(`✓ Loaded ${allOrders.length} orders from Supabase API`)
    applyFilters()
  } catch (error) {
    console.error('Error fetching orders from API:', error)
    showErrorState(error.message)
  }
}

/**
 * Show error state in orders table
 */
function showErrorState(errorMessage) {
  const tbody = document.getElementById('orders-tbody')
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-12 text-center">
          <div class="text-red-600 mb-2">Error al cargar pedidos</div>
          <div class="text-sm text-gray-500 mb-4">${errorMessage}</div>
          <button
            id="retry-button"
            class="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
          >
            Reintentar
          </button>
        </td>
      </tr>
    `

    // Add event listener for retry button
    const retryButton = document.getElementById('retry-button')
    if (retryButton) {
      retryButton.addEventListener('click', () => {
        location.reload()
      })
    }
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Status filter dropdown
  const statusFilter = document.getElementById('status-filter')
  if (statusFilter) {
    statusFilter.addEventListener('change', e => {
      currentFilter = e.target.value
      currentPage = 1
      applyFilters()
    })
  }

  // Year filter dropdown
  const yearFilter = document.getElementById('year-filter')
  if (yearFilter) {
    yearFilter.addEventListener('change', e => {
      currentYearFilter = e.target.value
      currentPage = 1
      applyFilters()
    })
  }

  // Date range filter dropdown
  const dateRangeFilter = document.getElementById('date-range-filter')
  const customDateRow = document.getElementById('custom-date-row')
  if (dateRangeFilter) {
    dateRangeFilter.addEventListener('change', e => {
      currentDateFilter = e.target.value
      currentPage = 1

      // Show/hide custom date inputs
      if (currentDateFilter === 'custom') {
        customDateRow.classList.remove('hidden')
      } else {
        customDateRow.classList.add('hidden')
        customDateFrom = ''
        customDateTo = ''
        applyFilters()
      }
    })
  }

  // Custom date range apply
  const applyCustomBtn = document.getElementById('apply-custom-date')
  if (applyCustomBtn) {
    applyCustomBtn.addEventListener('click', () => {
      customDateFrom = document.getElementById('date-from').value
      customDateTo = document.getElementById('date-to').value

      if (!customDateFrom || !customDateTo) {
        alert('Por favor selecciona ambas fechas')
        return
      }

      currentPage = 1
      applyFilters()
    })
  }

  // Pagination buttons
  document.getElementById('btn-first-page').addEventListener('click', () => goToPage(1))
  document
    .getElementById('btn-prev-page')
    .addEventListener('click', () => goToPage(currentPage - 1))
  document
    .getElementById('btn-next-page')
    .addEventListener('click', () => goToPage(currentPage + 1))
  document
    .getElementById('btn-last-page')
    .addEventListener('click', () => goToPage(Math.ceil(orders.length / itemsPerPage)))

  // Search
  const searchInput = document.getElementById('search-input')
  searchInput.addEventListener('input', e => {
    searchQuery = e.target.value
    currentPage = 1
    applyFilters()
  })

  // Clear all filters
  const clearAllBtn = document.getElementById('clear-all-btn')
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      const currentYear = new Date().getFullYear().toString()

      // Reset all filters
      searchInput.value = ''
      searchQuery = ''
      currentFilter = 'all'
      currentYearFilter = currentYear
      currentDateFilter = ''
      customDateFrom = ''
      customDateTo = ''
      currentPage = 1

      // Reset dropdowns
      document.getElementById('status-filter').value = 'all'
      document.getElementById('year-filter').value = currentYear
      document.getElementById('date-range-filter').value = ''
      document.getElementById('date-from').value = ''
      document.getElementById('date-to').value = ''

      // Hide custom date row
      customDateRow.classList.add('hidden')

      applyFilters()
    })
  }

  // Items per page
  document.getElementById('items-per-page').addEventListener('change', e => {
    itemsPerPage = parseInt(e.target.value, 10)
    currentPage = 1
    renderPage()
  })

  // Export CSV
  document.getElementById('export-csv-btn').addEventListener('click', exportToCSV)

  // Modal close
  document.getElementById('close-modal').addEventListener('click', closeModal)
  document.getElementById('order-modal').addEventListener('click', e => {
    if (e.target.id === 'order-modal') {
      closeModal()
    }
  })

  // History Modal close
  document.getElementById('close-history-modal').addEventListener('click', closeHistoryModal)
  document.getElementById('history-modal').addEventListener('click', e => {
    if (e.target.id === 'history-modal') {
      closeHistoryModal()
    }
  })

  // Setup scroll indicators
  setupScrollIndicators()

  // Setup ESC key to close modals
  setupEscapeKeyHandler()
}

/**
 * Normalize text for search (remove accents, lowercase)
 */
function normalizeText(text) {
  if (!text) {
    return ''
  }
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .trim()
}

/**
 * Apply all filters (search + status + date + year)
 */
function applyFilters() {
  let filtered = [...allOrders]

  // Filter by year first
  if (currentYearFilter) {
    const year = parseInt(currentYearFilter)
    filtered = filtered.filter(order => {
      const orderYear = new Date(order.created_at).getFullYear()
      return orderYear === year
    })
  }

  // Filter by date range
  if (currentDateFilter === 'custom' && customDateFrom && customDateTo) {
    const fromDate = new Date(customDateFrom)
    const toDate = new Date(customDateTo)
    toDate.setHours(23, 59, 59, 999)

    filtered = filtered.filter(order => {
      const orderDate = new Date(order.created_at)
      return orderDate >= fromDate && orderDate <= toDate
    })
  } else if (currentDateFilter === 'today') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    filtered = filtered.filter(order => new Date(order.created_at) >= today)
  } else if (currentDateFilter === 'current-month') {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    firstDayOfMonth.setHours(0, 0, 0, 0)

    filtered = filtered.filter(order => new Date(order.created_at) >= firstDayOfMonth)
  } else if (currentDateFilter === 'last-month') {
    const now = new Date()
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    firstDayOfLastMonth.setHours(0, 0, 0, 0)
    lastDayOfLastMonth.setHours(23, 59, 59, 999)

    filtered = filtered.filter(order => {
      const orderDate = new Date(order.created_at)
      return orderDate >= firstDayOfLastMonth && orderDate <= lastDayOfLastMonth
    })
  } else if (currentDateFilter && !isNaN(parseInt(currentDateFilter))) {
    const days = parseInt(currentDateFilter)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    filtered = filtered.filter(order => new Date(order.created_at) >= cutoffDate)
  }

  // Filter by search query (name, email, ID)
  if (searchQuery.trim()) {
    const normalizedQuery = normalizeText(searchQuery)
    filtered = filtered.filter(order => {
      const normalizedName = normalizeText(order.customer_name)
      const normalizedEmail = normalizeText(order.customer_email)
      const orderId = order.id.toString()

      return (
        normalizedName.includes(normalizedQuery) ||
        normalizedEmail.includes(normalizedQuery) ||
        orderId.includes(normalizedQuery)
      )
    })
  }

  // Filter by status
  if (currentFilter !== 'all') {
    filtered = filtered.filter(order => order.status === currentFilter)
  }

  orders = filtered
  updateStats(filtered) // Pass ALL filtered orders (including status + search)
  updateActiveFiltersText() // Update filter indicator text
  renderPage()
}

/**
 * Update statistics based on fully filtered orders (all filters applied)
 */
function updateStats(filteredOrders) {
  const stats = {
    pending: filteredOrders.filter(o => o.status === 'pending').length,
    processing: filteredOrders.filter(
      o => o.status === 'verified' || o.status === 'preparing' || o.status === 'shipped'
    ).length,
    completed: filteredOrders.filter(o => o.status === 'delivered').length,
    cancelled: filteredOrders.filter(o => o.status === 'cancelled').length
  }

  document.getElementById('stats-pending').textContent = stats.pending
  document.getElementById('stats-processing').textContent = stats.processing
  document.getElementById('stats-completed').textContent = stats.completed
  document.getElementById('stats-cancelled').textContent = stats.cancelled
}

/**
 * Update active filters text indicator
 */
function updateActiveFiltersText() {
  const filters = []

  if (currentYearFilter) {
    filters.push(`Año: ${currentYearFilter}`)
  }

  if (currentDateFilter === 'custom' && customDateFrom && customDateTo) {
    filters.push(`Período: ${customDateFrom} a ${customDateTo}`)
  } else if (currentDateFilter === 'today') {
    filters.push('Período: Día de hoy')
  } else if (currentDateFilter === 'current-month') {
    filters.push('Período: Mes actual')
  } else if (currentDateFilter === 'last-month') {
    filters.push('Período: Mes pasado')
  } else if (currentDateFilter && !isNaN(parseInt(currentDateFilter))) {
    filters.push(`Período: Últimos ${currentDateFilter} días`)
  }

  if (currentFilter !== 'all') {
    const statusLabel = {
      pending: 'Pendiente',
      verified: 'Verificado',
      preparing: 'Preparando',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    }[currentFilter]
    filters.push(`Estado: ${statusLabel}`)
  }

  if (searchQuery.trim()) {
    filters.push(`Búsqueda: "${searchQuery}"`)
  }

  const textEl = document.getElementById('active-filters-text')
  if (textEl) {
    if (filters.length === 0) {
      textEl.textContent = 'Mostrando todos los pedidos (sin filtros aplicados)'
    } else {
      textEl.textContent = `Filtros activos: ${filters.join(' • ')}`
    }
  }
}

/**
 * Go to specific page
 */
function goToPage(page) {
  const totalPages = Math.ceil(orders.length / itemsPerPage)
  if (page < 1 || page > totalPages) {
    return
  }
  currentPage = page
  renderPage()
}

/**
 * Render current page
 */
function renderPage() {
  const totalPages = Math.ceil(orders.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const endIdx = startIdx + itemsPerPage
  const pageOrders = orders.slice(startIdx, endIdx)

  renderOrdersTable(pageOrders)
  updatePaginationUI(totalPages, startIdx, endIdx)
}

/**
 * Update pagination UI
 */
function updatePaginationUI(totalPages, startIdx, endIdx) {
  const showingFrom = orders.length > 0 ? startIdx + 1 : 0
  const showingTo = Math.min(endIdx, orders.length)

  document.getElementById('showing-from').textContent = showingFrom
  document.getElementById('showing-to').textContent = showingTo
  document.getElementById('total-orders').textContent = orders.length
  document.getElementById('current-page').textContent = currentPage
  document.getElementById('total-pages').textContent = totalPages

  // Enable/disable buttons
  const btnFirst = document.getElementById('btn-first-page')
  const btnPrev = document.getElementById('btn-prev-page')
  const btnNext = document.getElementById('btn-next-page')
  const btnLast = document.getElementById('btn-last-page')

  btnFirst.disabled = currentPage === 1
  btnPrev.disabled = currentPage === 1
  btnNext.disabled = currentPage === totalPages || totalPages === 0
  btnLast.disabled = currentPage === totalPages || totalPages === 0
}

/**
 * Render orders in table
 */
function renderOrdersTable(ordersToRender) {
  const tableBody = document.getElementById('orders-table-body')
  const emptyState = document.getElementById('empty-state')

  if (!tableBody) {
    console.error('Table body element not found')
    return
  }

  if (ordersToRender.length === 0) {
    tableBody.innerHTML = ''
    if (emptyState) {
      emptyState.classList.remove('hidden')
    }
    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons()
    }
    return
  }

  if (emptyState) {
    emptyState.classList.add('hidden')
  }
  tableBody.innerHTML = ''

  ordersToRender.forEach(order => {
    const row = document.createElement('tr')
    row.className = 'hover:bg-gray-50 transition-colors'

    const date = new Date(order.created_at)
    const formattedDate = date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })

    const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
    const statusInfo = ORDER_STATUSES[order.status]

    row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm font-medium text-gray-900">${order.customer_name}</div>
        <div class="text-sm text-gray-500">${order.customer_phone}</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ${itemsCount} item${itemsCount > 1 ? 's' : ''}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
        $${order.total_usd.toFixed(2)}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ${formattedDate}
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="relative inline-block">
          <select
            class="status-select appearance-none ${statusInfo.bgClass} ${statusInfo.textClass} text-xs font-medium px-3 py-1.5 pr-8 rounded-full cursor-pointer border-0 focus:ring-2 focus:ring-pink-500"
            data-order-id="${order.id}"
          >
            ${Object.entries(ORDER_STATUSES)
              .map(
                ([key, value]) =>
                  `<option value="${key}" ${order.status === key ? 'selected' : ''}>${value.label}</option>`
              )
              .join('')}
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${statusInfo.textClass}">
            <i data-lucide="chevron-down" class="h-3 w-3"></i>
          </div>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm">
        <button
          class="text-pink-600 hover:text-pink-800 font-medium view-details-btn"
          data-order-id="${order.id}"
        >
          Ver detalles
        </button>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
        <button
          class="text-blue-600 hover:text-blue-800 font-medium view-history-btn inline-flex items-center justify-center p-1 rounded hover:bg-blue-50 transition-colors"
          data-order-id="${order.id}"
          title="Ver historial de cambios"
        >
          <i data-lucide="clock" class="h-5 w-5"></i>
        </button>
      </td>
    `

    tableBody.appendChild(row)
  })

  // Add event listeners for status change
  document.querySelectorAll('.status-select').forEach(select => {
    select.addEventListener('change', e => {
      const orderId = parseInt(e.target.getAttribute('data-order-id'), 10)
      if (isNaN(orderId)) {
        console.error('Invalid order ID')
        return
      }
      const newStatus = e.target.value
      changeOrderStatus(orderId, newStatus)
    })
  })

  // Add event listeners for view details
  document.querySelectorAll('.view-details-btn').forEach(button => {
    button.addEventListener('click', e => {
      const orderId = parseInt(e.target.getAttribute('data-order-id'), 10)
      if (isNaN(orderId)) {
        console.error('Invalid order ID')
        return
      }
      showOrderDetails(orderId)
    })
  })

  // Add event listeners for view history
  document.querySelectorAll('.view-history-btn').forEach(button => {
    button.addEventListener('click', e => {
      const target = e.target.closest('button')
      const orderId = parseInt(target.getAttribute('data-order-id'), 10)
      if (isNaN(orderId)) {
        console.error('Invalid order ID')
        return
      }
      showOrderHistory(orderId)
    })
  })

  // Reinitialize icons
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons()
  }
}

/**
 * Change order status
 */
async function changeOrderStatus(orderId, newStatus) {
  const order = allOrders.find(o => o.id === orderId)
  if (!order) {
    console.error('Order not found:', orderId)
    return
  }

  if (!ORDER_STATUSES[newStatus]) {
    console.error('Invalid status:', newStatus)
    return
  }

  try {
    // Update via API - backend expects { status, notes }
    const result = await api.updateOrdersStatus(orderId, {
      status: newStatus,
      notes: `Estado actualizado a ${ORDER_STATUSES[newStatus].label}`
    })

    if (!result.success) {
      throw new Error(result.error || 'Failed to update status')
    }

    // Update local state
    order.status = newStatus

    // Re-apply filters to update UI
    applyFilters()

    console.log(`✓ Order ${orderId} status updated to ${newStatus}`)
  } catch (error) {
    console.error('Error updating order status:', error)
    alert(`Error al actualizar estado: ${error.message}`)

    // Reload orders on error to sync state
    await fetchOrdersFromAPI()
  }
}

/**
 * Show order details modal
 */
function showOrderDetails(orderId) {
  const order = orders.find(o => o.id === orderId)
  if (!order) {
    console.error('Order not found:', orderId)
    return
  }

  const modal = document.getElementById('order-modal')
  const content = document.getElementById('modal-content')

  if (!modal || !content) {
    console.error('Modal elements not found')
    return
  }

  const statusInfo = ORDER_STATUSES[order.status]

  const date = new Date(order.created_at)
  const formattedDate = date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  content.innerHTML = `
    <div class="space-y-6">
      <!-- Order Header -->
      <div class="flex items-center justify-between pb-4 border-b">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Pedido #${order.id}</h3>
          <p class="text-sm text-gray-500">${formattedDate}</p>
        </div>
        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgClass} ${statusInfo.textClass}">
          ${statusInfo.label}
        </span>
      </div>

      <!-- Customer Info -->
      <div>
        <h4 class="text-sm font-medium text-gray-900 mb-3">Información del Cliente</h4>
        <div class="bg-gray-50 rounded-lg p-4 space-y-2">
          <div class="flex items-center">
            <i data-lucide="user" class="h-4 w-4 text-gray-400 mr-2"></i>
            <span class="text-sm text-gray-700">${order.customer_name}</span>
          </div>
          <div class="flex items-center">
            <i data-lucide="mail" class="h-4 w-4 text-gray-400 mr-2"></i>
            <span class="text-sm text-gray-700">${order.customer_email}</span>
          </div>
          <div class="flex items-center">
            <i data-lucide="phone" class="h-4 w-4 text-gray-400 mr-2"></i>
            <span class="text-sm text-gray-700">${order.customer_phone}</span>
          </div>
          <div class="flex items-start">
            <i data-lucide="map-pin" class="h-4 w-4 text-gray-400 mr-2 mt-0.5"></i>
            <span class="text-sm text-gray-700">${order.delivery_address}</span>
          </div>
        </div>
      </div>

      <!-- Delivery Info -->
      <div>
        <h4 class="text-sm font-medium text-gray-900 mb-3">Información de Entrega</h4>
        <div class="bg-gray-50 rounded-lg p-4 space-y-2">
          <div class="flex items-center">
            <i data-lucide="calendar" class="h-4 w-4 text-gray-400 mr-2"></i>
            <span class="text-sm text-gray-700">Fecha: ${order.delivery_date || 'No especificada'}</span>
          </div>
          <div class="flex items-center">
            <i data-lucide="clock" class="h-4 w-4 text-gray-400 mr-2"></i>
            <span class="text-sm text-gray-700">Horario: ${order.delivery_time_slot || 'No especificado'}</span>
          </div>
          ${
            order.delivery_notes
              ? `
          <div class="flex items-start">
            <i data-lucide="message-circle" class="h-4 w-4 text-gray-400 mr-2 mt-0.5"></i>
            <span class="text-sm text-gray-700">Notas: ${order.delivery_notes}</span>
          </div>
          `
              : ''
          }
        </div>
      </div>

      <!-- Items -->
      <div>
        <h4 class="text-sm font-medium text-gray-900 mb-3">Productos</h4>
        <div class="space-y-2 max-h-60 overflow-y-auto">
          ${order.items
            .map(
              item => `
            <div class="flex justify-between items-center bg-gray-50 rounded-lg p-3">
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">${item.product_name}</p>
                <p class="text-xs text-gray-500">Cantidad: ${item.quantity} × $${parseFloat(item.unit_price_usd).toFixed(2)}</p>
              </div>
              <p class="text-sm font-semibold text-gray-900 ml-4">$${parseFloat(item.subtotal_usd).toFixed(2)}</p>
            </div>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- Total -->
      <div class="border-t pt-4">
        <div class="flex justify-between items-center">
          <span class="text-lg font-semibold text-gray-900">Total</span>
          <span class="text-2xl font-bold text-pink-600">$${order.total_usd.toFixed(2)}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex space-x-3 pt-4">
        <button
          id="print-order-button"
          class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <i data-lucide="printer" class="h-4 w-4 inline mr-2"></i>
          Imprimir
        </button>
        <button
          class="flex-1 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <i data-lucide="mail" class="h-4 w-4 inline mr-2"></i>
          Enviar Email
        </button>
      </div>
    </div>
  `

  modal.classList.remove('hidden')
  updateScrollIndicator('modal')

  // Add event listener for print button
  const printButton = document.getElementById('print-order-button')
  if (printButton) {
    printButton.addEventListener('click', () => {
      window.print()
    })
  }

  // Reinitialize icons
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons()
  }
}

/**
 * Close modal
 */
function closeModal() {
  document.getElementById('order-modal').classList.add('hidden')
}

/**
 * Show notification
 */
function showNotification(message) {
  // Simple alert for now (can be enhanced with toast component)
  const notification = document.createElement('div')
  notification.className =
    'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in'
  notification.textContent = message

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.classList.add('opacity-0', 'transition-opacity', 'duration-300')
    setTimeout(() => notification.remove(), 300)
  }, 2000)
}

/**
 * Export filtered orders to CSV
 */
function exportToCSV() {
  if (orders.length === 0) {
    alert('No hay pedidos para exportar')
    return
  }

  // CSV headers
  const headers = [
    'ID',
    'Cliente',
    'Email',
    'Teléfono',
    'Dirección Entrega',
    'Fecha Entrega',
    'Hora Entrega',
    'Total USD',
    'Total VES',
    'Estado',
    'Fecha Pedido',
    'Notas',
    'Notas Entrega'
  ]

  // CSV rows
  const rows = orders.map(order => {
    const date = new Date(order.created_at)
    const formattedDate = date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES')

    return [
      order.id,
      `"${order.customer_name}"`,
      order.customer_email,
      order.customer_phone,
      `"${order.delivery_address}"`,
      order.delivery_date || '',
      order.delivery_time_slot || '',
      order.total_usd.toFixed(2),
      order.total_ves ? order.total_ves.toFixed(2) : '',
      ORDER_STATUSES[order.status]?.label || order.status,
      formattedDate,
      `"${order.notes || ''}"`,
      `"${order.delivery_notes || ''}"`
    ].join(',')
  })

  // Combine headers and rows
  const csv = [headers.join(','), ...rows].join('\n')

  // Create download link
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }) // BOM for Excel
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  const timestamp = new Date().toISOString().split('T')[0]
  link.setAttribute('href', url)
  link.setAttribute('download', `pedidos_${timestamp}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  showNotification(`${orders.length} pedidos exportados a CSV`)
}

/**
 * Show order status history modal
 */
async function showOrderHistory(orderId) {
  try {
    // Set auth token for admin access

    const result = await api.getOrdersStatusHistory(orderId)
    if (!result.success) {
      throw new Error(result.error || 'Failed to load history')
    }

    const history = result.data || []
    const modal = document.getElementById('history-modal')
    const content = document.getElementById('history-content')

    if (!modal || !content) {
      console.error('History modal elements not found')
      return
    }

    if (history.length === 0) {
      content.innerHTML = `
        <div class="text-center py-8">
          <i data-lucide="inbox" class="h-12 w-12 text-gray-400 mx-auto mb-3"></i>
          <p class="text-gray-500">No hay cambios de estado registrados</p>
        </div>
      `
    } else {
      content.innerHTML = `
        <div class="space-y-4">
          ${history
            .map((item, index) => {
              const date = new Date(item.created_at)
              const formattedDate = date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })

              const oldStatusLabel = ORDER_STATUSES[item.old_status]?.label || item.old_status
              const newStatusLabel = ORDER_STATUSES[item.new_status]?.label || item.new_status
              const newStatusInfo = ORDER_STATUSES[item.new_status] || {}

              return `
                <div class="relative ${index < history.length - 1 ? 'pb-4' : ''}">
                  ${index < history.length - 1 ? '<div class="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-200"></div>' : ''}
                  <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0">
                      <div class="h-10 w-10 rounded-full ${newStatusInfo.bgClass || 'bg-gray-100'} flex items-center justify-center">
                        <i data-lucide="arrow-right" class="h-5 w-5 ${newStatusInfo.textClass || 'text-gray-600'}"></i>
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between">
                        <p class="text-sm font-medium text-gray-900">
                          ${oldStatusLabel} → ${newStatusLabel}
                        </p>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${newStatusInfo.bgClass || 'bg-gray-100'} ${newStatusInfo.textClass || 'text-gray-800'}">
                          ${newStatusLabel}
                        </span>
                      </div>
                      <p class="text-xs text-gray-500 mt-1">${formattedDate}</p>
                      ${item.notes ? `<p class="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">${item.notes}</p>` : ''}
                    </div>
                  </div>
                </div>
              `
            })
            .join('')}
        </div>
      `
    }

    modal.classList.remove('hidden')
    updateScrollIndicator('history')

    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons()
    }
  } catch (error) {
    console.error('Error loading order history:', error)
    alert(`Error al cargar historial: ${error.message}`)
  }
}

/**
 * Close history modal
 */
function closeHistoryModal() {
  const modal = document.getElementById('history-modal')
  if (modal) {
    modal.classList.add('hidden')
  }
}

/**
 * Setup scroll indicators for modals
 */
function setupScrollIndicators() {
  const containers = [
    { id: 'modal-scroll-container', indicator: 'modal-scroll-indicator' },
    { id: 'history-scroll-container', indicator: 'history-scroll-indicator' }
  ]

  containers.forEach(({ id, indicator }) => {
    const container = document.getElementById(id)
    const indicatorEl = document.getElementById(indicator)

    if (container && indicatorEl) {
      container.addEventListener('scroll', () => {
        updateScrollIndicator(id === 'modal-scroll-container' ? 'modal' : 'history')
      })
    }
  })
}

/**
 * Update scroll indicator visibility
 */
function updateScrollIndicator(type) {
  const containerId = type === 'modal' ? 'modal-scroll-container' : 'history-scroll-container'
  const indicatorId = type === 'modal' ? 'modal-scroll-indicator' : 'history-scroll-indicator'

  const container = document.getElementById(containerId)
  const indicator = document.getElementById(indicatorId)

  if (!container || !indicator) {
    return
  }

  // Check if there's more content to scroll
  const hasMoreContent = container.scrollHeight > container.clientHeight
  const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50

  if (hasMoreContent && !isAtBottom) {
    indicator.classList.remove('hidden')
  } else {
    indicator.classList.add('hidden')
  }
}

/**
 * Setup ESC key handler to close modals
 */
function setupEscapeKeyHandler() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      const orderModal = document.getElementById('order-modal')
      const historyModal = document.getElementById('history-modal')

      // Close order detail modal if open
      if (orderModal && !orderModal.classList.contains('hidden')) {
        closeModal()
        e.preventDefault()
        return
      }

      // Close history modal if open
      if (historyModal && !historyModal.classList.contains('hidden')) {
        closeHistoryModal()
        e.preventDefault()
      }
    }
  })
}

import { onDOMReady } from '../../js/shared/dom-ready.js'

// Initialize when DOM is ready
onDOMReady(() => {
  init()
  initAdminCommon()
})
