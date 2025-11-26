// UI helpers for Playwright

export const testFormValidation = async (page, formSelector, testCases) => {
  for (const testCase of testCases) {
    const form = page.locator(formSelector)

    // Clear all inputs
    const inputs = form.locator('input, textarea, select')
    const count = await inputs.count()
    for (let i = 0; i < count; i++) {
      await inputs.nth(i).clear()
    }

    // Fill form with test data
    for (const [field, value] of Object.entries(testCase.data)) {
      // Try different selectors
      const input = form.locator(`[name="${field}"], [data-cy="${field}"], #${field}`).first()
      await input.fill(String(value))
    }

    // Submit form
    await form.locator('[type="submit"], [data-cy="submit"], .submit-button').first().click()

    // Check for expected validation messages
    if (testCase.expectError) {
      for (const errorSelector of testCase.expectError) {
        await page.locator(errorSelector).waitFor({ state: 'visible' })
      }
    }
  }
}

export const testResponsive = async (page, breakpoints) => {
  for (const [, size] of Object.entries(breakpoints)) {
    await page.setViewportSize({ width: size.width, height: size.height })
    await page.reload() // Reload to ensure responsive styles apply if needed

    // Test key elements are visible
    await page.locator('header, nav, .navigation').first().waitFor({ state: 'visible' })
    await page.locator('main, .main-content').first().waitFor({ state: 'visible' })
    await page.locator('footer, .footer').first().waitFor({ state: 'visible' })
  }
}

export const testAddToCart = async (page, productSelector) => {
  await page.locator(productSelector).click()
  await page
    .locator('[data-cy="cart-notification"], .cart-notification')
    .waitFor({ state: 'visible' })

  const notification = page.locator('[data-cy="cart-notification"], .cart-notification')
  const text = await notification.innerText()
  if (!text.includes('added to cart')) {
    throw new Error('Cart notification does not contain expected text')
  }

  const cartCount = page.locator('[data-cy="cart-count"], .cart-count')
  await cartCount.waitFor({ state: 'visible' })
  const countText = await cartCount.innerText()
  if (!countText.includes('1')) {
    throw new Error('Cart count is not 1')
  }
}

export const testCheckout = async page => {
  // Add item to cart first
  await testAddToCart(page, '[data-cy="add-to-cart"], .add-to-cart')

  // Navigate to cart
  await page.locator('[data-cy="cart-link"], .cart-link').click()

  // Proceed to checkout
  await page.locator('[data-cy="checkout-button"], .checkout-button').click()

  // Fill checkout form
  const form = page.locator('[data-cy="checkout-form"]')
  await form.locator('[name="email"]').fill('test@example.com')
  await form.locator('[name="name"]').fill('Test User')
  await form.locator('[name="address"]').fill('123 Test Street')
  await form.locator('[name="city"]').fill('Test City')
  await form.locator('[name="zip"]').fill('12345')

  // Select payment method if needed
  const paymentMethod = form.locator('[name="payment-method"]').first()
  if (await paymentMethod.isVisible()) {
    await paymentMethod.check()
  }

  // Submit order
  await form.locator('[type="submit"], [data-cy="place-order"]').click()

  // Verify order completion
  await page.waitForURL(url => url.toString().includes('/order-confirmation'))
  await page.locator('[data-cy="order-success"], .order-success').waitFor({ state: 'visible' })
}

export const testSearch = async (page, searchTerm, expectedResults) => {
  await page.locator('[data-cy="search-input"], .search-input, #search').fill(searchTerm)
  await page.locator('[data-cy="search-button"], .search-button, [type="submit"]').click()

  await page.locator('[data-cy="search-results"], .search-results').waitFor({ state: 'visible' })

  if (expectedResults > 0) {
    const count = await page.locator('[data-cy="product-item"], .product-item').count()
    if (count < 1) {
      throw new Error('Expected at least 1 result')
    }
  } else {
    await page.locator('[data-cy="no-results"], .no-results').waitFor({ state: 'visible' })
  }
}

export const testFilter = async (page, filterSelector, filterValue) => {
  await page.locator(filterSelector).selectOption(filterValue)
  await page.locator('[data-cy="apply-filter"], .apply-filter').click()

  // Verify filter is applied
  const value = await page.locator(filterSelector).inputValue()
  if (value !== filterValue) {
    throw new Error(`Filter value mismatch: expected ${filterValue}, got ${value}`)
  }

  // Check that results are filtered
  await page
    .locator('[data-cy="filtered-results"], .filtered-results')
    .waitFor({ state: 'visible' })
}
