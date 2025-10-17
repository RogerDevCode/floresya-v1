/**
 * Order Confirmation Page
 * Displays order details and confirmation message
 */

import { api } from '../js/shared/api-client.js'
import { onDOMReady } from '/js/shared/dom-ready.js'

onDOMReady(init)

async function init() {
  // Initialize icons first

  // 1. Get order ID from URL
  const urlParams = new URLSearchParams(window.location.search)
  const orderId = urlParams.get('orderId')

  if (!orderId) {
    showError('No se encontró el número de pedido')
    return
  }

  // 2. Fetch order details
  try {
    const response = await api.getOrdersById(orderId)

    if (!response.success) {
      throw new Error(response.error || 'Error al cargar el pedido')
    }

    // 3. Render order
    renderOrder(response.data)
  } catch (error) {
    console.error('Failed to load order:', error)
    showError(error.message)
  }
}

function renderOrder(order) {
  // Order number
  document.getElementById('order-number').textContent = `#${order.id}`

  // Order summary
  const summaryHtml = `
    <h2 class="text-xl font-bold text-gray-900 mb-4">Resumen del Pedido</h2>
    <div class="space-y-3">
      ${(order.order_items || [])
        .map(
          item => `
        <div class="flex justify-between items-center py-2 border-b">
          <div>
            <p class="font-medium text-gray-900">${item.product_name}</p>
            <p class="text-sm text-gray-500">Cantidad: ${item.quantity}</p>
          </div>
          <p class="font-bold text-gray-900">$${item.subtotal_usd.toFixed(2)}</p>
        </div>
      `
        )
        .join('')}

      <div class="flex justify-between items-center pt-4 text-lg font-bold">
        <span>Total</span>
        <span class="text-pink-600">$${order.total_amount_usd.toFixed(2)}</span>
      </div>
    </div>
  `
  document.getElementById('order-summary').innerHTML = summaryHtml

  // Customer info
  const customerHtml = `
    <h3 class="text-lg font-bold text-gray-900 mb-3">Información de Entrega</h3>
    <div class="space-y-2 text-gray-700">
      <p><strong>Nombre:</strong> ${order.customer_name}</p>
      <p><strong>Email:</strong> ${order.customer_email}</p>
      <p><strong>Dirección:</strong> ${order.delivery_address}</p>
      ${order.delivery_notes ? `<p><strong>Notas:</strong> ${order.delivery_notes}</p>` : ''}
    </div>
  `
  document.getElementById('customer-info').innerHTML = customerHtml
}

function showError(message) {
  document.body.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 to-green-500">
      <div class="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
        <i data-lucide="alert-circle" class="h-16 w-16 text-red-500 mx-auto mb-4"></i>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Error</h1>
        <p class="text-gray-600 mb-6">${message}</p>
        <a href="/" class="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors">
          Volver al Inicio
        </a>
      </div>
    </div>
  `
}
