/**
 * Test Configuration for Orders Page
 * Defines test parameters and setup
 */

// Test configuration
export const testConfig = {
  // API endpoints for testing
  api: {
    orders: '/api/orders',
    orderStatus: id => `/api/orders/${id}/status`,
    orderDetail: id => `/api/orders/${id}`
  },

  // Mock authentication token
  authToken: 'Bearer admin:1:admin', // This matches what's in the orders.js file

  // Test data
  mockOrders: [
    {
      id: 1,
      customer_name: 'Juan Pérez',
      customer_email: 'juan@example.com',
      customer_phone: '+1234567890',
      delivery_address: '123 Main St',
      delivery_city: 'Caracas',
      delivery_state: 'Distrito Capital',
      delivery_date: '2025-10-15',
      delivery_time_slot: '10:00-12:00',
      order_items: [
        { product_name: 'Ramos de Rosas Rojas', quantity: 2, price_usd: 50.0, product_id: 1 }
      ],
      total_amount_usd: 100.0,
      total_amount_ves: 3600000.0,
      status: 'pending',
      created_at: '2025-09-30T10:30:00Z',
      notes: 'Delivery at front door',
      delivery_notes: 'Special handling required'
    },
    {
      id: 2,
      customer_name: 'María González',
      customer_email: 'maria@example.com',
      customer_phone: '+0987654321',
      delivery_address: '456 Oak Ave',
      delivery_city: 'Valencia',
      delivery_state: 'Carabobo',
      delivery_date: '2025-10-16',
      delivery_time_slot: '14:00-16:00',
      order_items: [
        { product_name: 'Arreglo de Margaritas', quantity: 1, price_usd: 45.0, product_id: 2 },
        { product_name: 'Caja de Chocolates', quantity: 1, price_usd: 25.0, product_id: 3 }
      ],
      total_amount_usd: 70.0,
      total_amount_ves: 2520000.0,
      status: 'delivered',
      created_at: '2025-09-29T15:20:00Z',
      notes: '',
      delivery_notes: ''
    }
  ],

  // Valid order statuses
  validStatuses: ['pending', 'verified', 'preparing', 'shipped', 'delivered', 'cancelled'],

  // Test parameters
  testParams: {
    itemsPerPage: 20,
    defaultPage: 1,
    searchTimeout: 500 // ms
  }
}

// Utility functions for tests
export function createMockFetch(responseData, status = 200, ok = true) {
  return jest.fn(() =>
    Promise.resolve({
      ok,
      status,
      json: () => Promise.resolve(responseData)
    })
  )
}

export function createMockElement(tag = 'div') {
  const element = {
    tagName: tag.toUpperCase(),
    innerHTML: '',
    textContent: '',
    value: '',
    disabled: false,
    style: { display: 'block' },
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn(() => false),
      toggle: jest.fn()
    },
    addEventListener: jest.fn(),
    click: jest.fn(),
    focus: jest.fn(),
    setAttribute: jest.fn(),
    getAttribute: jest.fn()
  }

  return element
}

console.log('✅ Test configuration loaded')
