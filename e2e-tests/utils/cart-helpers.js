import { expect } from '@playwright/test'

export async function mockSettings(page) {
  await page.route('**/api/settings/public', async route => {
    await route.fulfill({
      status: 200,
      path: 'cypress/fixtures/settings.json' // Assuming fixtures are still there or I need to copy them? 
      // Wait, I should check if fixtures exist. If not, I'll inline the mock data.
      // Cypress fixtures are in cypress/fixtures. I can read them or inline.
      // For now, I'll inline a basic mock or try to read the file if Playwright allows.
      // Better to inline for stability if the file is small, or read it.
      // Let's inline a default response for now to be safe, or check if I can access the file.
      // I'll use a simple object for now.
    })
  })
  // Actually, let's use a standard object to avoid file dependency issues during migration
  await page.route('**/api/settings/public', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        delivery_cost_usd: 5.00,
        delivery_cost_ves: 180.00,
        exchange_rate: 36.50
      })
    })
  })
}

export async function setupCart(page, items = null) {
  const cartItems = items || [
    {
      id: 1,
      name: 'Ramo de Rosas Rojas',
      price_usd: 25.99,
      stock: 10,
      quantity: 2,
      image_thumb: '/images/products/rosas-rojas-thumb.jpg'
    },
    {
      id: 2,
      name: 'Girasoles Premium',
      price_usd: 18.5,
      stock: 15,
      quantity: 1,
      image_thumb: '/images/products/girasoles-thumb.jpg'
    }
  ]
  
  // Use context.addInitScript to set localStorage BEFORE page loads
  // This ensures cart data is available when cart.js initializes
  await page.context().addInitScript(items => {
    window.localStorage.setItem('cart', JSON.stringify(items))
  }, cartItems)
}

export async function clearCart(page) {
  // Only clear if we're on a loaded page
  try {
    await page.evaluate(() => {
      localStorage.removeItem('cart')
      localStorage.removeItem('deliveryMethod')
      localStorage.removeItem('orderSummary')
      localStorage.removeItem('customerData')
    }, { timeout: 1000 })
  } catch {
    // Page not loaded yet, that's fine
  }
}

export async function addToCart(page, item) {
  await page.evaluate(item => {
    const currentCart = JSON.parse(window.localStorage.getItem('cart') || '[]')
    currentCart.push(item)
    window.localStorage.setItem('cart', JSON.stringify(currentCart))
  }, item)
}

export async function getCartCount(page) {
  return await page.evaluate(() => {
    const cart = JSON.parse(window.localStorage.getItem('cart') || '[]')
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  })
}

export async function mockCreateOrder(page, status = 200, response = null) {
  await page.route('**/api/orders', async route => {
    await route.fulfill({
      status: status,
      contentType: 'application/json',
      body: JSON.stringify(response || { success: true, orderId: 12345, message: 'Order created' })
    })
  })
}

export async function mockConfirmPayment(page, orderId = 12345, status = 200, response = null) {
  await page.route(`**/api/orders/${orderId}/payments`, async route => {
    await route.fulfill({
      status: status,
      contentType: 'application/json',
      body: JSON.stringify(response || { success: true, message: 'Payment confirmed' })
    })
  })
}

export async function fillCustomerForm(page, customerData = {}) {
  const defaultData = {
    name: 'Juan Pérez',
    email: 'test@example.com',
    phone: '0414-1234567',
    address: 'Calle Principal, Edificio Test, Piso 5, Apto 10',
    references: 'Portón azul al lado del supermercado',
    notes: 'Entregar por la tarde'
  }

  const data = { ...defaultData, ...customerData }

  await page.locator('#customer-name').fill(data.name)
  await page.locator('#customer-email').fill(data.email)
  await page.locator('#customer-phone').fill(data.phone)
  await page.locator('#delivery-address').fill(data.address)
  // These might not exist in all forms, so check visibility or use loose selectors if needed
  // But based on Cypress, they should be there.
  if (await page.locator('#delivery-references').isVisible()) {
      await page.locator('#delivery-references').fill(data.references)
  }
  if (await page.locator('#additional-notes').isVisible()) {
      await page.locator('#additional-notes').fill(data.notes)
  }
}

export async function selectDeliveryMethod(page, method) {
  await page.locator(`input[name="delivery"][value="${method}"]`).check({ force: true })
}

export async function selectPaymentMethod(page, method) {
  await page.locator(`input[name="payment-method"][value="${method}"]`).check({ force: true })
}

export async function fillPaymentDetails(page, method, details = {}) {
  switch (method) {
    case 'mobile_payment':
      await page.locator('#mobile-phone').fill(details.phone || '0414-1234567')
      await page.locator('#mobile-bank').selectOption(details.bank || 'Banesco')
      break

    case 'bank_transfer':
      await page.locator('#bank-name').selectOption(details.bank || 'Banesco')
      await page.locator('#account-number').fill(details.account || '0102 1234 5678 9012 3456')
      await page.locator('#account-holder').fill(details.holder || 'Juan Pérez')
      break

    case 'zelle':
      await page.locator('#zelle-email').fill(details.email || 'test@example.com')
      break

    case 'crypto':
      await page.locator('#crypto-address').fill(details.address || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh')
      break

    case 'cash':
      // Cash doesn't require additional fields
      break
  }
}

export async function completeCheckout(page, deliveryMethod = 'pickup', paymentMethod = 'cash', customerData = {}) {
  await fillCustomerForm(page, customerData)
  await selectDeliveryMethod(page, deliveryMethod)
  await selectPaymentMethod(page, paymentMethod)
  
  if (paymentMethod !== 'cash') {
    await fillPaymentDetails(page, paymentMethod)
  }

  await page.locator('#process-payment-button').click()
}

export async function verifyCartSummary(page, expectedItems, expectedSubtotal, expectedTotal) {
  await expect(page.locator('#total-items')).toContainText(String(expectedItems))
  await expect(page.locator('#subtotal')).toContainText(`$${expectedSubtotal.toFixed(2)}`)
  await expect(page.locator('#total')).toContainText(`$${expectedTotal.toFixed(2)}`)
}

export async function verifyOrderConfirmation(page, orderId) {
  await expect(page).toHaveURL(/.*\/pages\/order-confirmation\.html/)
  if (orderId) {
    await expect(page).toHaveURL(new RegExp(`orderId=${orderId}`))
  }
}

export async function mockCartPaymentApis(page) {
  await mockSettings(page)
  await mockCreateOrder(page)
  await mockConfirmPayment(page)
}
