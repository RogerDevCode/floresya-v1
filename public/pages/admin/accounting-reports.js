/**
 * Accounting Reports Controller
 * Displays financial reports with sales and expenses analysis
 */

import { initAdminCommon } from '../../js/admin-common.js'
import { toast } from '../../js/components/toast.js'
import { api } from '../../js/shared/api-client.js'
import { initThemeManager } from '../../js/themes/themeManager.js'

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', async () => {
  // Check admin access
  await checkAdminAccess()

  // Init theme and common admin features
  initThemeManager()
  initAdminCommon()

  // Load user info
  loadUserInfo()

  // Init event listeners
  initEventListeners()

  // Set default dates (current month)
  setDefaultDates()

  // Load initial report
  await generateReport()
})

// ==================== ACCESS CONTROL ====================

function checkAdminAccess() {
  try {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}')

    if (!user.id || user.role !== 'admin') {
      toast.error('Acceso denegado. Solo administradores.')
      setTimeout(() => {
        window.location.href = '../../index.html'
      }, 2000)
      throw new Error('Unauthorized access')
    }
  } catch (error) {
    console.error('Access check failed:', error)
    window.location.href = '../../index.html'
  }
}

// ==================== USER INFO ====================

function loadUserInfo() {
  try {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}')
    const userNameEl = document.getElementById('user-name')

    if (userNameEl && user.email) {
      const userName = user.email.split('@')[0]
      userNameEl.textContent = userName.charAt(0).toUpperCase() + userName.slice(1)
    }
  } catch (error) {
    console.error('Error loading user info:', error)
  }
}

// ==================== EVENT LISTENERS ====================

function initEventListeners() {
  document.getElementById('generate-report-btn').addEventListener('click', generateReport)
  document.getElementById('back-btn').addEventListener('click', () => {
    window.location.href = './dashboard.html'
  })
  document.getElementById('logout-btn')?.addEventListener('click', handleLogout)
}

// ==================== DATE UTILITIES ====================

function setDefaultDates() {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  document.getElementById('report-start-date').valueAsDate = firstDay
  document.getElementById('report-end-date').valueAsDate = lastDay
}

// ==================== REPORT GENERATION ====================

async function generateReport() {
  const startDate = document.getElementById('report-start-date').value
  const endDate = document.getElementById('report-end-date').value

  if (!startDate || !endDate) {
    toast.error('Por favor selecciona ambas fechas')
    return
  }

  if (new Date(startDate) > new Date(endDate)) {
    toast.error('La fecha de inicio debe ser anterior a la fecha fin')
    return
  }

  const loadingState = document.getElementById('loading-state')

  try {
    loadingState.classList.remove('hidden')

    const response = await api.getAccountingReports({
      start_date: startDate,
      end_date: endDate
    })

    if (response.success && response.data) {
      displayReport(response.data)
    } else {
      throw new Error(response.error || 'Failed to generate report')
    }
  } catch (error) {
    console.error('Error generating report:', error)
    toast.error('Error al generar reporte')
    clearReport()
  } finally {
    loadingState.classList.add('hidden')
  }
}

// ==================== DISPLAY REPORT ====================

function displayReport(data) {
  const { summary, daily_sales, expense_categories } = data

  // Update summary cards
  document.getElementById('total-sales').textContent =
    `$${parseFloat(summary.total_sales || 0).toFixed(2)}`
  document.getElementById('total-orders').textContent = `${summary.total_orders || 0} órdenes`

  document.getElementById('total-expenses').textContent =
    `$${parseFloat(summary.total_expenses || 0).toFixed(2)}`
  document.getElementById('total-expense-count').textContent =
    `${summary.total_expense_count || 0} gastos`

  const netProfit = parseFloat(summary.net_profit || 0)
  const netProfitEl = document.getElementById('net-profit')
  netProfitEl.textContent = `$${netProfit.toFixed(2)}`

  // Color based on profit/loss
  netProfitEl.classList.remove(
    'text-blue-600',
    'text-red-600',
    'dark:text-blue-400',
    'dark:text-red-400'
  )
  if (netProfit >= 0) {
    netProfitEl.classList.add('text-blue-600', 'dark:text-blue-400')
  } else {
    netProfitEl.classList.add('text-red-600', 'dark:text-red-400')
  }

  const profitMargin =
    summary.total_sales > 0 ? ((netProfit / summary.total_sales) * 100).toFixed(1) : 0
  document.getElementById('profit-margin').textContent = `${profitMargin}% margen`

  // Display sales breakdown
  displaySalesBreakdown(daily_sales)

  // Display expenses breakdown
  displayExpensesBreakdown(expense_categories)
}

// ==================== SALES BREAKDOWN ====================

function displaySalesBreakdown(dailySales) {
  const tableBody = document.getElementById('sales-breakdown')
  const emptyState = document.getElementById('sales-empty')

  if (!dailySales || dailySales.length === 0) {
    tableBody.innerHTML = ''
    emptyState.classList.remove('hidden')
    return
  }

  emptyState.classList.add('hidden')

  // Sort by date descending
  const sortedSales = [...dailySales].sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date))

  tableBody.innerHTML = sortedSales
    .map(
      item => `
    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
        ${formatDate(item.sale_date)}
      </td>
      <td class="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">
        ${item.orders_count || 0}
      </td>
      <td class="px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-gray-100">
        $${parseFloat(item.total_sales || 0).toFixed(2)}
      </td>
    </tr>
  `
    )
    .join('')
}

// ==================== EXPENSES BREAKDOWN ====================

function displayExpensesBreakdown(expenseCategories) {
  const tableBody = document.getElementById('expenses-breakdown')
  const emptyState = document.getElementById('expenses-empty')

  if (!expenseCategories || expenseCategories.length === 0) {
    tableBody.innerHTML = ''
    emptyState.classList.remove('hidden')
    return
  }

  emptyState.classList.add('hidden')

  // Sort by total descending
  const sortedExpenses = [...expenseCategories].sort(
    (a, b) => parseFloat(b.total_expenses || 0) - parseFloat(a.total_expenses || 0)
  )

  tableBody.innerHTML = sortedExpenses
    .map(
      item => `
    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
        <span class="px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(item.category)}">
          ${formatCategory(item.category)}
        </span>
      </td>
      <td class="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">
        ${item.expenses_count || 0}
      </td>
      <td class="px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-gray-100">
        $${parseFloat(item.total_expenses || 0).toFixed(2)}
      </td>
    </tr>
  `
    )
    .join('')
}

// ==================== UTILITIES ====================

function clearReport() {
  document.getElementById('total-sales').textContent = '$0.00'
  document.getElementById('total-orders').textContent = '0 órdenes'
  document.getElementById('total-expenses').textContent = '$0.00'
  document.getElementById('total-expense-count').textContent = '0 gastos'
  document.getElementById('net-profit').textContent = '$0.00'
  document.getElementById('profit-margin').textContent = '0% margen'

  document.getElementById('sales-breakdown').innerHTML = ''
  document.getElementById('sales-empty').classList.remove('hidden')

  document.getElementById('expenses-breakdown').innerHTML = ''
  document.getElementById('expenses-empty').classList.remove('hidden')
}

function formatDate(dateString) {
  if (!dateString) {
    return 'N/A'
  }
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatCategory(category) {
  const categories = {
    flores: 'Flores',
    suministros: 'Suministros',
    transporte: 'Transporte',
    servicios: 'Servicios',
    salarios: 'Salarios',
    alquiler: 'Alquiler',
    otros: 'Otros'
  }
  return categories[category] || category
}

function getCategoryColor(category) {
  const colors = {
    flores: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    suministros: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    transporte: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    servicios: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    salarios: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    alquiler: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    otros: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
  return colors[category] || colors.otros
}

function handleLogout() {
  sessionStorage.clear()
  toast.success('Sesión cerrada')
  setTimeout(() => {
    window.location.href = '../../index.html'
  }, 1000)
}
