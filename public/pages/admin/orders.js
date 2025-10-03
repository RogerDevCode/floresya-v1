/**
 * Orders Management Module
 * Handles order status changes with inline dropdown
 */

import '../../js/lucide-icons.js'

// Global state
let currentFilter = 'all'
let currentDateFilter = 'all' // 30, 60, 90, 'all', 'custom'
let customDateRange = { from: null, to: null }
let searchQuery = ''
let currentPage = 1
let itemsPerPage = 20
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

// Mock data (fallback if API fails)
const mockOrders = [
  {
    id: 1001,
    customer_name: 'María González',
    customer_email: 'maria@example.com',
    customer_phone: '+58 412-1234567',
    total_usd: 89.99,
    status: 'pending',
    created_at: '2025-10-02T10:30:00Z',
    items: [{ product_name: 'Ramo Tropical Vibrante', quantity: 2, price_usd: 45.99 }],
    shipping_address: 'Av. Principal, Caracas'
  },
  {
    id: 1002,
    customer_name: 'Carlos Pérez',
    customer_email: 'carlos@example.com',
    customer_phone: '+58 424-9876543',
    total_usd: 52.99,
    status: 'processing',
    created_at: '2025-10-02T09:15:00Z',
    items: [{ product_name: 'Bouquet Arcoíris de Rosas', quantity: 1, price_usd: 52.99 }],
    shipping_address: 'Calle 5, Valencia'
  },
  {
    id: 1003,
    customer_name: 'Ana Rodríguez',
    customer_email: 'ana@example.com',
    customer_phone: '+58 414-5551234',
    total_usd: 116.97,
    status: 'completed',
    created_at: '2025-10-01T14:20:00Z',
    items: [{ product_name: 'Girasoles Gigantes Alegres', quantity: 3, price_usd: 38.99 }],
    shipping_address: 'Urbanización Los Palos Grandes, Caracas'
  },
  {
    id: 1004,
    customer_name: 'Luis Martínez',
    customer_email: 'luis@example.com',
    customer_phone: '+58 426-7778888',
    total_usd: 45.99,
    status: 'cancelled',
    created_at: '2025-10-01T08:00:00Z',
    items: [{ product_name: 'Ramo Tropical Vibrante', quantity: 1, price_usd: 45.99 }],
    shipping_address: 'Centro Comercial, Maracay'
  },
  {
    id: 1005,
    customer_name: 'Sofia Torres',
    customer_email: 'sofia@example.com',
    customer_phone: '+58 412-3334444',
    total_usd: 105.98,
    status: 'pending',
    created_at: '2025-10-02T11:45:00Z',
    items: [{ product_name: 'Bouquet Arcoíris de Rosas', quantity: 2, price_usd: 52.99 }],
    shipping_address: 'Av. Libertador, Caracas'
  },
  {
    id: 1006,
    customer_name: 'Pedro Sánchez',
    customer_email: 'pedro@example.com',
    customer_phone: '+58 424-2223333',
    total_usd: 77.98,
    status: 'processing',
    created_at: '2025-10-02T08:30:00Z',
    items: [{ product_name: 'Girasoles Gigantes Alegres', quantity: 2, price_usd: 38.99 }],
    shipping_address: 'Residencias El Rosal, Barquisimeto'
  }
]

/**
 * Initialize orders management
 */
async function init() {
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons()
  }

  setupEventListeners()
  await fetchOrdersFromAPI()
}

/**
 * Fetch orders from API
 */
async function fetchOrdersFromAPI() {
  try {
    const response = await fetch('/api/orders')
    if (!response.ok) {
      console.error('Failed to fetch orders from API, using mock data')
      orders = [...mockOrders]
      return
    }

    const result = await response.json()
    if (result.success && Array.isArray(result.data)) {
      allOrders = result.data.map(order => ({
        id: order.id,
        customer_name: order.customer_name || 'Cliente Desconocido',
        customer_email: order.customer_email || '',
        customer_phone: order.customer_phone || '',
        delivery_address: order.delivery_address || '',
        delivery_city: order.delivery_city || '',
        delivery_state: order.delivery_state || '',
        delivery_date: order.delivery_date || '',
        delivery_time_slot: order.delivery_time_slot || '',
        items: [], // Will be populated from order_items if needed
        total_usd: parseFloat(order.total_amount_usd) || 0,
        total_ves: parseFloat(order.total_amount_ves) || 0,
        status: order.status || 'pending',
        created_at: order.created_at || new Date().toISOString(),
        notes: order.notes || '',
        delivery_notes: order.delivery_notes || ''
      }))

      // Sort by date DESC (most recent first)
      allOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      console.log(`Loaded ${allOrders.length} orders from API`)
      applyFilters()
    } else {
      console.error('Invalid API response format, using mock data')
      allOrders = [...mockOrders]
      applyFilters()
    }
  } catch (error) {
    console.error('Error fetching orders from API:', error)
    allOrders = [...mockOrders]
    applyFilters()
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Status filter buttons
  document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', e => {
      const filter = e.target.getAttribute('data-filter')
      setActiveFilter(filter)
      currentFilter = filter
      currentPage = 1
      applyFilters()
    })
  })

  // Date filter buttons
  document.querySelectorAll('.date-filter-btn').forEach(button => {
    button.addEventListener('click', e => {
      const days = e.target.getAttribute('data-days')
      setActiveDateFilter(days)
      currentDateFilter = days
      currentPage = 1
      applyFilters()
    })
  })

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

  document.getElementById('clear-search-btn').addEventListener('click', () => {
    searchInput.value = ''
    searchQuery = ''
    currentPage = 1
    applyFilters()
  })

  // Items per page
  document.getElementById('items-per-page').addEventListener('change', e => {
    itemsPerPage = parseInt(e.target.value, 10)
    currentPage = 1
    renderPage()
  })

  // Custom date range
  document.getElementById('apply-custom-date').addEventListener('click', () => {
    const dateFrom = document.getElementById('date-from').value
    const dateTo = document.getElementById('date-to').value

    if (!dateFrom || !dateTo) {
      alert('Por favor selecciona ambas fechas')
      return
    }

    customDateRange = { from: dateFrom, to: dateTo }
    currentDateFilter = 'custom'
    currentPage = 1

    // Deactivate preset buttons
    document.querySelectorAll('.date-filter-btn').forEach(btn => {
      btn.classList.remove('bg-pink-600', 'text-white')
      btn.classList.add('bg-gray-200', 'text-gray-700')
    })

    applyFilters()
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
}

/**
 * Set active filter button
 */
function setActiveFilter(filter) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('bg-pink-600', 'text-white')
    btn.classList.add('bg-gray-200', 'text-gray-700')
  })

  const activeBtn = document.getElementById(`filter-${filter}`)
  if (activeBtn) {
    activeBtn.classList.remove('bg-gray-200', 'text-gray-700')
    activeBtn.classList.add('bg-pink-600', 'text-white')
  }
}

/**
 * Set active date filter button
 */
function setActiveDateFilter(days) {
  document.querySelectorAll('.date-filter-btn').forEach(btn => {
    btn.classList.remove('bg-pink-600', 'text-white')
    btn.classList.add('bg-gray-200', 'text-gray-700')
  })

  const activeBtn = document.getElementById(`date-filter-${days}`)
  if (activeBtn) {
    activeBtn.classList.remove('bg-gray-200', 'text-gray-700')
    activeBtn.classList.add('bg-pink-600', 'text-white')
  }
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
 * Apply all filters (search + status + date)
 */
function applyFilters() {
  let filtered = [...allOrders]

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

  // Filter by date range
  if (currentDateFilter === 'custom' && customDateRange.from && customDateRange.to) {
    const fromDate = new Date(customDateRange.from)
    const toDate = new Date(customDateRange.to)
    toDate.setHours(23, 59, 59, 999) // Include entire day

    filtered = filtered.filter(order => {
      const orderDate = new Date(order.created_at)
      return orderDate >= fromDate && orderDate <= toDate
    })
  } else if (currentDateFilter !== 'all') {
    const days = parseInt(currentDateFilter, 10)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    filtered = filtered.filter(order => new Date(order.created_at) >= cutoffDate)
  }

  // Filter by status
  if (currentFilter !== 'all') {
    filtered = filtered.filter(order => order.status === currentFilter)
  }

  orders = filtered
  updateStats()
  renderPage()
}

/**
 * Update statistics
 */
function updateStats() {
  const stats = {
    pending: allOrders.filter(o => o.status === 'pending').length,
    processing: allOrders.filter(o => o.status === 'processing').length,
    completed: allOrders.filter(o => o.status === 'completed').length,
    cancelled: allOrders.filter(o => o.status === 'cancelled').length
  }

  document.getElementById('stats-pending').textContent = stats.pending
  document.getElementById('stats-processing').textContent = stats.processing
  document.getElementById('stats-completed').textContent = stats.completed
  document.getElementById('stats-cancelled').textContent = stats.cancelled
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
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        #${order.id}
      </td>
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

  // Reinitialize icons
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons()
  }
}

/**
 * Change order status
 */
function changeOrderStatus(orderId, newStatus) {
  const order = orders.find(o => o.id === orderId)
  if (!order) {
    console.error('Order not found:', orderId)
    return
  }

  if (!ORDER_STATUSES[newStatus]) {
    console.error('Invalid status:', newStatus)
    return
  }

  order.status = newStatus

  updateStats()
  applyFilters()

  const statusInfo = ORDER_STATUSES[newStatus]
  showNotification(`Pedido #${orderId} cambiado a: ${statusInfo.label}`)
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
            <span class="text-sm text-gray-700">${order.shipping_address}</span>
          </div>
        </div>
      </div>

      <!-- Items -->
      <div>
        <h4 class="text-sm font-medium text-gray-900 mb-3">Productos</h4>
        <div class="space-y-3">
          ${order.items
            .map(
              item => `
            <div class="flex justify-between items-center bg-gray-50 rounded-lg p-3">
              <div>
                <p class="text-sm font-medium text-gray-900">${item.product_name}</p>
                <p class="text-xs text-gray-500">Cantidad: ${item.quantity}</p>
              </div>
              <p class="text-sm font-semibold text-gray-900">$${(item.price_usd * item.quantity).toFixed(2)}</p>
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
          onclick="window.print()"
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
    'Ciudad',
    'Estado',
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
      order.delivery_city,
      order.delivery_state,
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init)
