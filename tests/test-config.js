/**
 * Test Configuration
 *
 * This file contains test data constants and configuration
 * for integration and E2E tests.
 */

// Test data prefix - used to identify test records
export const TEST_PREFIX = 'test_'

// Test user credentials
export const TEST_USERS = {
  ADMIN: {
    email: 'test-admin@floresya.test',
    password: 'testpassword123',
    full_name: 'Test Admin User',
    role: 'admin'
  },
  ACTIVE_USER: {
    email: 'test-user-1@floresya.test',
    password: 'testpassword123',
    full_name: 'Juan Pérez Test',
    role: 'user'
  },
  UNVERIFIED_USER: {
    email: 'test-user-2@floresya.test',
    password: 'testpassword123',
    full_name: 'María González Test',
    role: 'user',
    email_verified: false
  },
  INACTIVE_USER: {
    email: 'test-inactive@floresya.test',
    password: 'testpassword123',
    full_name: 'Usuario Inactivo',
    role: 'user',
    is_active: false
  }
}

// Test products data
export const TEST_PRODUCTS = {
  FEATURED_ROSES: {
    name: 'test_Ramo de Rosas Rojas',
    sku: 'test_TEST-RR-001',
    price_usd: 45.99,
    price_ves: 1839.6,
    stock: 50,
    active: true,
    featured: true
  },
  TROPICAL: {
    name: 'test_Ramo Tropical Vibrante',
    sku: 'test_TEST-RT-002',
    price_usd: 55.99,
    price_ves: 2239.6,
    stock: 30,
    active: true,
    featured: true
  },
  DAISIES: {
    name: 'test_Jardín de Margaritas',
    sku: 'test_TEST-JM-003',
    price_usd: 35.99,
    price_ves: 1439.6,
    stock: 40,
    active: true,
    featured: false
  },
  ORCHIDS: {
    name: 'test_Elegancia de Orquídeas',
    sku: 'test_TEST-EO-004',
    price_usd: 75.99,
    price_ves: 3039.6,
    stock: 15,
    active: true,
    featured: true
  },
  INACTIVE: {
    name: 'test_Producto Inactivo de Prueba',
    sku: 'test_TEST-PI-005',
    price_usd: 25.99,
    price_ves: 1039.6,
    stock: 0,
    active: false,
    featured: false
  }
}

// Test payment methods
export const TEST_PAYMENT_METHODS = {
  BANK_TRANSFER: {
    name: 'test_Transferencia Bancaria Test',
    type: 'bank_transfer',
    account_info: '0102-1234-5678-9012-3456'
  },
  MOBILE_PAYMENT: {
    name: 'test_Pago Móvil Test',
    type: 'mobile_payment',
    account_info: '0414-555-5555'
  },
  ZELLE: {
    name: 'test_Zelle Test',
    type: 'international',
    account_info: 'payments@floresya.test'
  }
}

// Test order statuses
export const ORDER_STATUSES = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  PREPARING: 'preparing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
}

// Test order data template
export const TEST_ORDER_TEMPLATE = {
  customer_email: 'test-order@example.com',
  customer_name: 'Test Order Customer',
  customer_phone: '+58 414 123 4567',
  delivery_address: '123 Test Street, Urbanización Test',
  delivery_city: 'Caracas',
  delivery_state: 'Distrito Capital',
  delivery_zip: '1010',
  delivery_notes: 'Test delivery notes',
  notes: 'Test order notes',
  currency_rate: 40
}

// Test API endpoints
export const API_ENDPOINTS = {
  PRODUCTS: '/api/products',
  ORDERS: '/api/orders',
  USERS: '/api/users',
  PAYMENT_METHODS: '/api/payment-methods',
  OCCASIONS: '/api/occasions'
}

// Test timeouts (in milliseconds)
export const TIMEOUTS = {
  SHORT: 1000,
  MEDIUM: 5000,
  LONG: 10000,
  EXTRA_LONG: 30000
}

// Test selectors for E2E tests
export const SELECTORS = {
  // Dashboard
  DASHBOARD_VIEW: '#dashboard-view',
  TOTAL_ORDERS: '#dash-total-orders',
  TOTAL_SALES: '#dash-total-sales',

  // Orders
  ORDERS_TABLE_BODY: '#orders-table-body',
  ORDER_STATUS_PENDING: '#dash-status-pending',
  ORDER_STATUS_VERIFIED: '#dash-status-verified',
  ORDER_STATUS_PREPARING: '#dash-status-preparing',
  ORDER_STATUS_SHIPPED: '#dash-status-shipped',
  ORDER_STATUS_DELIVERED: '#dash-status-delivered',
  ORDER_STATUS_CANCELLED: '#dash-status-cancelled',

  // Users
  USERS_VIEW: '#users-view',
  USERS_TABLE_BODY: '#users-table-body',
  TOTAL_USERS: '#total-users',
  ACTIVE_USERS: '#active-users',
  ADMIN_USERS: '#admin-users',
  VERIFIED_USERS: '#verified-users',

  // Forms
  PRODUCT_FORM: '#product-form',
  PRODUCT_NAME: '#product-name',
  PRODUCT_PRICE_USD: '#product-price-usd',
  PRODUCT_STOCK: '#product-stock',
  SAVE_PRODUCT_BTN: '#save-product-btn',

  // Modals
  PRODUCT_FORM_MODAL: '#product-form-modal',
  USER_MODAL: '#user-modal',
  DELETE_MODAL: '#delete-modal'
}

// Helper functions for tests
export const TestUtils = {
  /**
   * Get a test product by name
   */
  getTestProduct(productName) {
    return Object.values(TEST_PRODUCTS).find(p => p.name === productName)
  },

  /**
   * Get a test user by email
   */
  getTestUser(email) {
    return Object.values(TEST_USERS).find(u => u.email === email)
  },

  /**
   * Generate test order data
   */
  generateTestOrderData(overrides = {}) {
    return {
      ...TEST_ORDER_TEMPLATE,
      ...overrides
    }
  },

  /**
   * Generate test order items
   */
  generateTestOrderItems(product, quantity = 1) {
    return [
      {
        product_id: product.id,
        product_name: product.name,
        product_summary: product.summary || 'Test product summary',
        unit_price_usd: product.price_usd,
        unit_price_ves: product.price_ves,
        quantity,
        subtotal_usd: product.price_usd * quantity,
        subtotal_ves: product.price_ves * quantity
      }
    ]
  },

  /**
   * Wait for a specified amount of time
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  /**
   * Generate a unique test identifier
   */
  generateTestId(prefix = 'test') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Export default configuration
export default {
  TEST_PREFIX,
  TEST_USERS,
  TEST_PRODUCTS,
  TEST_PAYMENT_METHODS,
  ORDER_STATUSES,
  TEST_ORDER_TEMPLATE,
  API_ENDPOINTS,
  TIMEOUTS,
  SELECTORS,
  TestUtils
}
