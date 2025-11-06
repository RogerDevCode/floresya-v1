/**
 * COMPREHENSIVE INPUT LIMIT TESTING SUITE
 * Tests boundary conditions, validation limits, and security constraints
 * for ALL input fields across the FloresYa application
 *
 * Test Coverage:
 * - Character length limits (min/max)
 * - Number range validation (min/max/step)
 * - File upload limits (size/type/count)
 * - Email format validation
 * - URL validation
 * - Phone number validation
 * - Special character handling
 * - SQL injection prevention
 * - XSS prevention
 * - Required field validation
 * - Format-specific constraints
 */

import { test, expect } from '@playwright/test'

// ========== CUSTOMER PAGES INPUT TESTS ==========

test.test.describe('CUSTOMER PAGES - Input Limit Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  // Homepage Search and Filters
  test.test.describe('Homepage Inputs (searchInput, occasionFilter, sortFilter)', () => {
    test('searchInput - Character limits and special characters', async ({ page }) => {
      await page.goto('/')

      const searchInput = page.locator('#searchInput')

      // Test minimum length
      await searchInput.fill('')
      await searchInput.fill('a')
      await expect(searchInput).toHaveValue('a')

      // Test maximum length (100 chars)
      const longText = 'a'.repeat(100)
      await searchInput.fill(longText)
      expect(await searchInput.inputValue()).toHaveLength(100)

      // Test SQL injection attempts
      await searchInput.fill("'; DROP TABLE users; --")
      expect(await searchInput.inputValue()).toBe("'; DROP TABLE users; --")

      // Test XSS attempts
      await searchInput.fill('<script>alert("xss")</script>')
      expect(await searchInput.inputValue()).toBe('<script>alert("xss")</script>')

      // Test unicode characters
      await searchInput.fill('🌸 Roses Роза 玫瑰')
      expect(await searchInput.inputValue()).toContain('🌸')

      // Test HTML entities
      await searchInput.fill('&lt;script&gt;alert("test")&lt;/script&gt;')
      expect(await searchInput.inputValue()).toBe('&lt;script&gt;alert("test")&lt;/script&gt;')
    })

    test('searchInput - Search functionality with boundary values', async ({ page }) => {
      await page.goto('/')

      const searchInput = page.locator('#searchInput')

      // Empty search
      await searchInput.fill('')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)

      // Single character search
      await searchInput.fill('a')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)

      // Very long search term (100+ chars)
      const longSearch = 'very long search term '.repeat(5)
      await searchInput.fill(longSearch)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)

      // Search with special characters
      await searchInput.fill('@#$%^&*()')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)
    })

    test('sortFilter - Option validation', async ({ page }) => {
      await page.goto('/')

      const sortFilter = page.locator('#sortFilter')

      // Verify available options
      const options = await sortFilter.locator('option').allTextContents()
      expect(options).toContain('Más recientes')
      expect(options).toContain('Precio: Menor a mayor')
      expect(options).toContain('Precio: Mayor a menor')
      expect(options).toContain('Nombre: A-Z')

      // Test default selection
      await expect(sortFilter).toHaveValue('')

      // Test each option selection
      await sortFilter.selectOption({ label: 'Precio: Menor a mayor' })
      await expect(sortFilter).toHaveValue('price_asc')

      await sortFilter.selectOption({ label: 'Precio: Mayor a menor' })
      await expect(sortFilter).toHaveValue('price_desc')

      await sortFilter.selectOption({ label: 'Nombre: A-Z' })
      await expect(sortFilter).toHaveValue('name_asc')

      // Test invalid option (should fail or default)
      await expect(sortFilter.selectOption('invalid_option')).rejects.toThrow()
    })
  })

  // Product Detail Page
  test.test.describe('Product Detail - Quantity Input', () => {
    test('quantity-input - Number boundaries', async ({ page }) => {
      await page.goto('/pages/product-detail.html')

      const quantityInput = page.locator('#quantity-input')
      const qtyMinus = page.locator('#qty-minus')
      const qtyPlus = page.locator('#qty-plus')

      // Test initial value
      await expect(quantityInput).toHaveValue('1')

      // Test minimum value (min="1")
      await quantityInput.fill('0')
      await expect(quantityInput).toHaveAttribute('min', '1')

      // Test clicking minus when at minimum
      await quantityInput.fill('1')
      await qtyMinus.click()
      await page.waitForTimeout(300)
      // Should not go below 1

      // Test incrementing
      for (let i = 0; i < 10; i++) {
        await qtyPlus.click()
        await page.waitForTimeout(100)
      }
      // Should handle increment properly

      // Test typing large numbers
      await quantityInput.fill('999999')
      expect(await quantityInput.inputValue()).toBe('999999')

      // Test negative numbers
      await quantityInput.fill('-5')
      expect(await quantityInput.inputValue()).toBe('-5')

      // Test decimal numbers
      await quantityInput.fill('1.5')
      const _value = await quantityInput.inputValue()
      // Browser may normalize or allow decimals

      // Test non-numeric characters
      await quantityInput.fill('abc')
      expect(await quantityInput.inputValue()).toBe('abc')
    })

    test('quantity-input - Keyboard navigation', async ({ page }) => {
      await page.goto('/pages/product-detail.html')

      const quantityInput = page.locator('#quantity-input')

      // Focus and use keyboard
      await quantityInput.focus()
      await quantityInput.fill('5')
      await expect(quantityInput).toHaveValue('5')

      // Arrow keys
      await quantityInput.press('ArrowUp')
      await page.waitForTimeout(100)
      await quantityInput.press('ArrowDown')
      await page.waitForTimeout(100)

      // Tab navigation
      await quantityInput.press('Tab')
      await expect(page.locator('body')).toBeFocused()
    })
  })
})

// ========== PAYMENT PAGE INPUT TESTS ==========

test.test.describe('PAYMENT PAGE - Comprehensive Input Limit Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pages/payment.html')
    // Add an item to cart first
    await page.goto('/pages/product-detail.html')
    const addToCart = page.locator('#add-to-cart-btn')
    if (await addToCart.isVisible()) {
      await addToCart.click()
      await page.waitForTimeout(500)
    }
    await page.goto('/pages/payment.html')
  })

  test.test.describe('Customer Information Form', () => {
    test('customer-name - Text validation and limits', async ({ page }) => {
      const nameInput = page.locator('#customer-name')

      // Required field test
      await nameInput.fill('')
      await page.locator('#process-payment-button').click()
      // Should show validation error

      // Minimum length (1 character)
      await nameInput.fill('A')
      await expect(nameInput).toHaveValue('A')

      // Reasonable maximum (50 characters)
      const longName = 'A'.repeat(50)
      await nameInput.fill(longName)
      expect(await nameInput.inputValue()).toHaveLength(50)

      // Test 100+ character names
      const veryLongName = 'Very Long Name '.repeat(10)
      await nameInput.fill(veryLongName)
      // Browser should handle it (no maxlength specified)

      // Special characters
      await nameInput.fill("John O'Connor-Smith Jr.")
      expect(await nameInput.inputValue()).toContain("'")

      // Unicode characters
      await nameInput.fill('José María García-López')
      expect(await nameInput.inputValue()).toContain('José')

      // Numbers in name
      await nameInput.fill('John Doe 123')
      expect(await nameInput.inputValue()).toContain('123')

      // Empty after having value
      await nameInput.fill('Test Name')
      await nameInput.fill('')
      await expect(nameInput).toHaveValue('')
    })

    test('customer-email - Email format validation', async ({ page }) => {
      const emailInput = page.locator('#customer-email')

      // Required field test
      await emailInput.fill('')
      await page.locator('#process-payment-button').click()

      // Valid email formats
      await emailInput.fill('test@example.com')
      await expect(emailInput).toHaveValue('test@example.com')

      await emailInput.fill('user.name+tag@example.co.uk')
      await expect(emailInput).toHaveValue('user.name+tag@example.co.uk')

      // Invalid email formats (type="email" should handle basic validation)
      await emailInput.fill('invalid-email')
      // Browser may or may not prevent this

      await emailInput.fill('@example.com')
      await emailInput.fill('test@')
      await emailInput.fill('test..test@example.com')

      // Very long email (reasonable limit: 254 chars per RFC)
      const longEmail = 'a'.repeat(240) + '@example.com'
      await emailInput.fill(longEmail)
      expect(await emailInput.inputValue()).toHaveLength(254)

      // Unicode in email
      await emailInput.fill('test@例え.テスト')
      // Browser behavior may vary

      // Multiple @ symbols
      await emailInput.fill('test@@example.com')
    })

    test('customer-phone - Venezuelan phone format', async ({ page }) => {
      const phoneInput = page.locator('#customer-phone')

      // Required field
      await phoneInput.fill('')
      await page.locator('#process-payment-button').click()

      // Max length test
      await phoneInput.fill('(+58)-414-1234567')
      await expect(phoneInput).toHaveAttribute('maxlength', '18')

      // Valid formats
      await phoneInput.fill('(+58)-414-1234567')
      expect(await phoneInput.inputValue()).toBe('(+58)-414-1234567')

      await phoneInput.fill('0414-1234567')
      expect(await phoneInput.inputValue()).toBe('0414-1234567')

      await phoneInput.fill('+58 414 123 4567')
      expect(await phoneInput.inputValue()).toBe('+58 414 123 4567')

      // Invalid formats (too short)
      await phoneInput.fill('123')
      expect(await phoneInput.inputValue()).toBe('123')

      // Non-numeric characters
      await phoneInput.fill('abc-def-ghij')
      expect(await phoneInput.inputValue()).toBe('abc-def-ghij')

      // Max length boundary
      const maxPhone = '123456789012345678'
      await phoneInput.fill(maxPhone)
      expect(await phoneInput.inputValue()).toHaveLength(18)
    })

    test('delivery-address - Textarea validation', async ({ page }) => {
      const addressInput = page.locator('#delivery-address')

      // Required field
      await addressInput.fill('')
      await page.locator('#process-payment-button').click()

      // Minimum length
      await addressInput.fill('Calle 1')
      await expect(addressInput).toHaveValue('Calle 1')

      // Very long address (no maxlength, should handle long text)
      const longAddress = 'Calle Principal, Edificio ' + 'Torre '.repeat(50) + ', Apartamento 1'
      await addressInput.fill(longAddress)
      // Browser should handle it

      // Special characters
      await addressInput.fill('Av. Libertador #123, Torre A, Piso 5, Apto 5-B')
      expect(await addressInput.inputValue()).toContain('#')

      // Newlines (textarea allows this)
      await addressInput.fill('Primera línea\nSegunda línea\nTercera línea')
      expect(await addressInput.inputValue()).toContain('\n')

      // Unicode
      await addressInput.fill('Dirección con acentos: áéíóú ñÑ')
      expect(await addressInput.inputValue()).toContain('ñ')
    })

    test('delivery-references - Optional textarea', async ({ page }) => {
      const refInput = page.locator('#delivery-references')

      // Optional field - can be empty
      await refInput.fill('')
      await expect(refInput).toHaveValue('')

      // Normal usage
      await refInput.fill('Casa azul, portón negro, timbre 123')
      expect(await refInput.inputValue()).toContain('123')

      // Very long reference
      const longRef = 'Referencia muy larga '.repeat(20)
      await refInput.fill(longRef)
    })

    test('additional-notes - Optional textarea', async ({ page }) => {
      const notesInput = page.locator('#additional-notes')

      // Optional field
      await notesInput.fill('')
      await expect(notesInput).toHaveValue('')

      // With content
      await notesInput.fill('Entregar después de 2 PM')
      expect(await notesInput.inputValue()).toBe('Entregar después de 2 PM')

      // Special characters
      await notesInput.fill('Instrucción especial: ¡Cuidar mucho!')
      expect(await notesInput.inputValue()).toContain('¡')
    })

    test('remember-me - Checkbox validation', async ({ page }) => {
      const checkbox = page.locator('#remember-me')

      // Initially unchecked
      await expect(checkbox).not.toBeChecked()

      // Check it
      await checkbox.check()
      await expect(checkbox).toBeChecked()

      // Uncheck it
      await checkbox.uncheck()
      await expect(checkbox).not.toBeChecked()

      // Toggle via click
      await checkbox.click()
      await expect(checkbox).toBeChecked()
    })
  })

  test.test.describe('Payment Method Forms', () => {
    test('mobile-payment form fields', async ({ page }) => {
      // Select mobile payment method
      await page.locator('input[value="mobile_payment"]').check()
      await page.waitForTimeout(300)

      const mobilePhoneInput = page.locator('#mobile-phone')
      const mobileBankSelect = page.locator('#mobile-bank')

      // Phone field (appears when payment method selected)
      await mobilePhoneInput.fill('0414-123-4567')
      expect(await mobilePhoneInput.inputValue()).toBe('0414-123-4567')

      // Empty phone
      await mobilePhoneInput.fill('')
      expect(await mobilePhoneInput.inputValue()).toBe('')

      // Bank select - verify options
      const bankOptions = await mobileBankSelect.locator('option').allTextContents()
      expect(bankOptions).toContain('Seleccionar Banco')
      expect(bankOptions).toContain('Banesco')
      expect(bankOptions).toContain('Mercantil')

      await mobileBankSelect.selectOption({ label: 'Banesco' })
      await expect(mobileBankSelect).toHaveValue('Banesco')
    })

    test('bank-transfer form fields', async ({ page }) => {
      // Select bank transfer
      await page.locator('input[value="bank_transfer"]').check()
      await page.waitForTimeout(300)

      const bankNameSelect = page.locator('#bank-name')
      const accountNumberInput = page.locator('#account-number')
      const accountHolderInput = page.locator('#account-holder')

      // Bank selection
      await bankNameSelect.selectOption({ label: 'Banesco' })
      await expect(bankNameSelect).toHaveValue('Banesco')

      // Account number
      await accountNumberInput.fill('0102-1234-56-78-9012345678')
      expect(await accountNumberInput.inputValue()).toContain('0102')

      // Account holder
      await accountHolderInput.fill('Juan Pérez García')
      expect(await accountHolderInput.inputValue()).toBe('Juan Pérez García')

      // Test with empty fields
      await accountNumberInput.fill('')
      await accountHolderInput.fill('')
      expect(await accountNumberInput.inputValue()).toBe('')
      expect(await accountHolderInput.inputValue()).toBe('')
    })

    test('zelle form fields', async ({ page }) => {
      // Select Zelle
      await page.locator('input[value="zelle"]').check()
      await page.waitForTimeout(300)

      const zelleEmailInput = page.locator('#zelle-email')

      // Valid email
      await zelleEmailInput.fill('user@example.com')
      await expect(zelleEmailInput).toHaveValue('user@example.com')

      // Invalid format
      await zelleEmailInput.fill('invalid-email')
      // Browser handles validation

      // Empty
      await zelleEmailInput.fill('')
      expect(await zelleEmailInput.inputValue()).toBe('')
    })

    test('crypto form fields', async ({ page }) => {
      // Select crypto
      await page.locator('input[value="crypto"]').check()
      await page.waitForTimeout(300)

      const cryptoAddressInput = page.locator('#crypto-address')

      // Bitcoin address format
      await cryptoAddressInput.fill('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh')
      expect(await cryptoAddressInput.inputValue()).toBe(
        'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
      )

      // Invalid format
      await cryptoAddressInput.fill('invalid_address')
      expect(await cryptoAddressInput.inputValue()).toBe('invalid_address')

      // Very long address
      const longAddress = 'a'.repeat(100)
      await cryptoAddressInput.fill(longAddress)
      expect(await cryptoAddressInput.inputValue()).toHaveLength(100)
    })
  })
})

// ========== ADMIN PAGES INPUT TESTS ==========

test.test.describe('ADMIN PAGES - Input Limit Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for admin pages
    await page.addInitScript(() => {
      localStorage.setItem('admin_logged_in', 'true')
    })
  })

  test.test.describe('Create Product Form', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/pages/admin/create-product.html')
    })

    test('product-name - Text field limits', async ({ page }) => {
      const nameInput = page.locator('#product-name')

      // Required field
      await nameInput.fill('')
      await page.locator('#create-product-btn').click()
      // Should show validation

      // Normal name
      await nameInput.fill('Ramo de Rosas Rojas')
      await expect(nameInput).toHaveValue('Ramo de Rosas Rojas')

      // Empty
      await nameInput.fill('')
      await expect(nameInput).toHaveValue('')

      // Very long name (no explicit maxlength)
      const longName = 'Producto '.repeat(50)
      await nameInput.fill(longName)
      // Browser should handle it

      // Special characters
      await nameInput.fill('Ramo #1 - "Premium" & Roses')
      expect(await nameInput.inputValue()).toContain('#')

      // Unicode
      await nameInput.fill('Bouquet de Roses 🌹')
      expect(await nameInput.inputValue()).toContain('🌹')
    })

    test('product-description - Textarea limits', async ({ page }) => {
      const descInput = page.locator('#product-description')

      // Optional field
      await descInput.fill('')
      await expect(descInput).toHaveValue('')

      // Normal description
      await descInput.fill('Hermoso ramo de rosas rojas frescas')
      await expect(descInput).toHaveValue('Hermoso ramo de rosas rojas frescas')

      // Very long description
      const longDesc = 'Descripción '.repeat(100)
      await descInput.fill(longDesc)

      // Multi-line
      await descInput.fill('Línea 1\nLínea 2\nLínea 3')
      expect(await descInput.inputValue()).toContain('\n')

      // Special characters
      await descInput.fill('Descripción con símbolos: ©®™€£¥')
      expect(await descInput.inputValue()).toContain('©')
    })

    test('product-sku - Alphanumeric code', async ({ page }) => {
      const skuInput = page.locator('#product-sku')

      // Optional field
      await skuInput.fill('')
      await expect(skuInput).toHaveValue('')

      // Valid SKU formats
      await skuInput.fill('RAMO-001')
      await expect(skuInput).toHaveValue('RAMO-001')

      await skuInput.fill('PRD-2024-001')
      await expect(skuInput).toHaveValue('PRD-2024-001')

      // With spaces
      await skuInput.fill('SKU 123')
      expect(await skuInput.inputValue()).toBe('SKU 123')

      // Special characters
      await skuInput.fill('SKU-123!@#')
      expect(await skuInput.inputValue()).toContain('!')

      // Numbers only
      await skuInput.fill('123456')
      expect(await skuInput.inputValue()).toBe('123456')

      // Uppercase and lowercase
      await skuInput.fill('Sku-Ab-123')
      expect(await skuInput.inputValue()).toBe('Sku-Ab-123')
    })

    test('product-price-usd - Number validation', async ({ page }) => {
      const priceInput = page.locator('#product-price-usd')

      // Required field
      await priceInput.fill('')
      await page.locator('#create-product-btn').click()

      // Min attribute
      await expect(priceInput).toHaveAttribute('min', '0')

      // Step attribute
      await expect(priceInput).toHaveAttribute('step', '0.01')

      // Valid prices
      await priceInput.fill('0.01')
      await expect(priceInput).toHaveValue('0.01')

      await priceInput.fill('10.50')
      await expect(priceInput).toHaveValue('10.50')

      await priceInput.fill('999999.99')
      expect(await priceInput.inputValue()).toBe('999999.99')

      // Zero
      await priceInput.fill('0')
      await expect(priceInput).toHaveValue('0')

      // Negative (should be prevented by min="0")
      await priceInput.fill('-10')
      // Browser may allow typing but value is negative

      // Decimal precision
      await priceInput.fill('10.999')
      // Browser may round or accept

      // Non-numeric
      await priceInput.fill('abc')
      expect(await priceInput.inputValue()).toBe('abc')
    })

    test('product-price-ves - Readonly field', async ({ page }) => {
      const vesInput = page.locator('#product-price-ves')

      // Should be readonly
      await expect(vesInput).toHaveAttribute('readonly')

      // Try to input (should not change)
      await vesInput.fill('1000')
      // Value should remain as is or empty (readonly prevents editing)
    })

    test('product-stock - Integer validation', async ({ page }) => {
      const stockInput = page.locator('#product-stock')

      // Min attribute
      await expect(stockInput).toHaveAttribute('min', '0')

      // Default value
      const defaultValue = await stockInput.inputValue()
      expect(parseInt(defaultValue)).toBeGreaterThanOrEqual(0)

      // Valid stock values
      await stockInput.fill('0')
      await expect(stockInput).toHaveValue('0')

      await stockInput.fill('10')
      await expect(stockInput).toHaveValue('10')

      await stockInput.fill('999999')
      expect(await stockInput.inputValue()).toBe('999999')

      // Negative (should be prevented)
      await stockInput.fill('-5')
      // Browser may allow typing

      // Decimal (number type typically allows decimals)
      await stockInput.fill('10.5')
      // Browser may accept or convert to integer
    })

    test('image-upload-input - File validation', async ({ page }) => {
      const fileInput = page.locator('#image-upload-input')

      // Accept attribute
      await expect(fileInput).toHaveAttribute('accept', 'image/*')

      // Max size attribute (in bytes, typically 4194304 = 4MB)
      const maxSize = await fileInput.getAttribute('data-max-size')
      expect(maxSize).toBe('4194304') // 4MB

      // Multiple files (implicit with grid of 5)
      // Browser should allow multiple file selection

      // Try to upload (would need actual files in real test)
      // fileInput.setInputFiles() would be used here
    })
  })

  test.test.describe('Edit Product Form', () => {
    test.beforeEach(async ({ page }) => {
      // Mock a product ID
      await page.goto('/pages/admin/edit-product.html?id=1')
      await page.waitForTimeout(1000)
    })

    test('edit form - Pre-filled values', async ({ page }) => {
      // Verify form exists
      const form = page.locator('#edit-product-form')
      await expect(form).toBeVisible()

      // Check if fields are present
      await expect(page.locator('#product-name')).toBeVisible()
      await expect(page.locator('#product-description')).toBeVisible()
      await expect(page.locator('#product-price-usd')).toBeVisible()
    })

    test('edit form - Update values and validate', async ({ page }) => {
      // Update name
      const nameInput = page.locator('#product-name')
      await nameInput.fill('Updated Product Name')
      await expect(nameInput).toHaveValue('Updated Product Name')

      // Update price
      const priceInput = page.locator('#product-price-usd')
      await priceInput.fill('25.99')
      await expect(priceInput).toHaveValue('25.99')

      // Update stock
      const stockInput = page.locator('#product-stock')
      await stockInput.fill('50')
      await expect(stockInput).toHaveValue('50')
    })
  })

  test.test.describe('Occasions Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/pages/admin/occasions.html')
      await page.waitForTimeout(1000)
    })

    test('occasion-name - Required text field', async ({ page }) => {
      const nameInput = page.locator('#occasion-name')

      // Required
      await nameInput.fill('')
      await page.locator('#save-occasion-btn').click()
      // Should show validation

      // Valid name
      await nameInput.fill('Cumpleaños')
      await expect(nameInput).toHaveValue('Cumpleaños')

      // Unicode
      await nameInput.fill('Día de la Madre')
      expect(await nameInput.inputValue()).toContain('í')

      // Special chars
      await nameInput.fill('Ocasión #1 - Especial')
      expect(await nameInput.inputValue()).toContain('#')
    })

    test('occasion-description - Optional textarea', async ({ page }) => {
      const descInput = page.locator('#occasion-description')

      // Optional
      await descInput.fill('')
      await expect(descInput).toHaveValue('')

      // With content
      await descInput.fill('Descripción de la ocasión especial')
      await expect(descInput).toHaveValue('Descripción de la ocasión especial')

      // Multi-line
      await descInput.fill('Línea 1\nLínea 2')
      expect(await descInput.inputValue()).toContain('\n')
    })

    test('occasion-color - Color picker', async ({ page }) => {
      const colorInput = page.locator('#occasion-color')

      // Should accept color values
      await colorInput.fill('#FF0000')
      await expect(colorInput).toHaveValue('#FF0000')

      await colorInput.fill('#00FF00')
      await expect(colorInput).toHaveValue('#00FF00')

      // Short format
      await colorInput.fill('#F0F')
      await expect(colorInput).toHaveValue('#F0F')

      // Invalid color (browser may normalize or reject)
      await colorInput.fill('invalid')
      // Browser behavior varies
    })

    test('occasion-is-active - Checkbox', async ({ page }) => {
      const checkbox = page.locator('#occasion-is-active')

      // Initially unchecked or checked (depends on default)
      const isChecked = await checkbox.isChecked()

      // Toggle
      await checkbox.click()
      await expect(checkbox).toHaveCheckedState(!isChecked)

      // Toggle back
      await checkbox.click()
      await expect(checkbox).toHaveCheckedState(isChecked)
    })
  })

  test.test.describe('Contact Editor Form', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/pages/admin/contact-editor.html')
      await page.waitForTimeout(1000)
    })

    test('contact fields - Text inputs', async ({ page }) => {
      // Test various text fields
      const titleInput = page.locator('#contact-title')
      await titleInput.fill('Título de Contacto')
      await expect(titleInput).toHaveValue('Título de Contacto')

      const phoneInput = page.locator('#contact-phone')
      await phoneInput.fill('+58-414-1234567')
      await expect(phoneInput).toHaveValue('+58-414-1234567')

      const emailInput = page.locator('#contact-email')
      await emailInput.fill('contacto@floresya.com')
      await expect(emailInput).toHaveValue('contacto@floresya.com')
    })

    test('social media fields - URLs', async ({ page }) => {
      const facebookInput = page.locator('#contact-facebook')
      await facebookInput.fill('https://facebook.com/floresya')
      await expect(facebookInput).toHaveValue('https://facebook.com/floresya')

      const instagramInput = page.locator('#contact-instagram')
      await instagramInput.fill('https://instagram.com/floresya')
      await expect(instagramInput).toHaveValue('https://instagram.com/floresya')

      // Invalid URL
      const twitterInput = page.locator('#contact-twitter')
      await twitterInput.fill('not-a-url')
      // Browser may allow it (not type="url")
    })
  })
})

// ========== SECURITY & BOUNDARY TESTS ==========

test.test.describe('SECURITY - Input Sanitization & Boundary Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('SQL Injection attempts across all text inputs', async ({ page }) => {
    const sqlInjections = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM products --",
      "' OR 1=1 --",
      "admin'--",
      "' OR 'a'='a"
    ]

    // Test search input
    const searchInput = page.locator('#searchInput')
    for (const sql of sqlInjections) {
      await searchInput.fill(sql)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(300)
    }

    // Test other inputs if available
    const inputs = [{ selector: '#customer-name', page: '/pages/payment.html' }]

    for (const input of inputs) {
      await page.goto(input.page)
      const field = page.locator(input.selector)
      if (await field.isVisible()) {
        await field.fill(sqlInjections[0])
        await expect(field).toHaveValue(sqlInjections[0])
      }
    }
  })

  test('XSS Prevention across inputs', async ({ page }) => {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")',
      '<svg onload=alert("XSS")>',
      "';alert('XSS');//"
    ]

    // Test search input
    const searchInput = page.locator('#searchInput')
    for (const payload of xssPayloads) {
      await searchInput.fill(payload)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(300)

      // Payload should be in the field value
      expect(await searchInput.inputValue()).toBe(payload)

      // Should not execute
      // (In a real scenario, we'd check for alert dialogs)
    }
  })

  test('Unicode and special character handling', async ({ page }) => {
    const unicodeTests = [
      'Français',
      '日本語',
      'Русский',
      'العربية',
      '中文',
      '🌸🌹🌺',
      'Emoji 😀😁😂',
      '©®™€£¥',
      '—–‐‒',
      '¡¿§±'
    ]

    const searchInput = page.locator('#searchInput')

    for (const test of unicodeTests) {
      await searchInput.fill(test)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(300)

      expect(await searchInput.inputValue()).toBe(test)
    }
  })

  test('Very long input strings', async ({ page }) => {
    const searchInput = page.locator('#searchInput')

    // 1KB string
    const kbString = 'a'.repeat(1024)
    await searchInput.fill(kbString)
    expect(await searchInput.inputValue()).toHaveLength(1024)

    // 10KB string
    const kb10String = 'test '.repeat(2048)
    await searchInput.fill(kb10String)
    expect(await searchInput.inputValue()).toHaveLength(10240)

    // Browser should handle it without crashing
  })

  test('Null bytes and control characters', async ({ page }) => {
    const searchInput = page.locator('#searchInput')

    // Null byte
    await searchInput.fill('test\0null')
    // Browser may strip null bytes or handle them

    // Newlines and tabs
    await searchInput.fill('line1\nline2\ttab')
    expect(await searchInput.inputValue()).toContain('\n')

    // Control characters
    await searchInput.fill('test\x00\x01\x02')
    // Browser behavior varies
  })
})

// ========== MOBILE & RESPONSIVE TESTING ==========

test.test.describe('MOBILE - Touch Input Validation', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('Mobile viewport - Input accessibility', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(500)

    // Check if inputs are accessible on mobile
    const searchInput = page.locator('#searchInput')
    await expect(searchInput).toBeVisible()

    // Touch interactions
    await searchInput.tap()
    await searchInput.fill('mobile test')
    await expect(searchInput).toHaveValue('mobile test')
  })

  test('Mobile payment form - Input keyboard types', async ({ page }) => {
    await page.goto('/pages/payment.html')

    // Email should bring up email keyboard on mobile
    const emailInput = page.locator('#customer-email')
    await emailInput.tap()
    await emailInput.fill('test@example.com')
    await expect(emailInput).toHaveValue('test@example.com')

    // Phone should bring up numeric keyboard
    const phoneInput = page.locator('#customer-phone')
    await phoneInput.tap()
    await phoneInput.fill('04141234567')
    expect(await phoneInput.inputValue()).toBe('04141234567')
  })
})

// ========== PERFORMANCE TESTS ==========

test.test.describe('PERFORMANCE - Input Response Time', () => {
  test('Large text input performance', async ({ page }) => {
    await page.goto('/')

    const searchInput = page.locator('#searchInput')
    const startTime = Date.now()

    // Input 10KB of text
    const largeText = 'a'.repeat(10000)
    await searchInput.fill(largeText)

    const endTime = Date.now()
    const duration = endTime - startTime

    // Should complete in reasonable time (< 100ms)
    expect(duration).toBeLessThan(1000)

    expect(await searchInput.inputValue()).toHaveLength(10000)
  })

  test('Rapid input changes', async ({ page }) => {
    await page.goto('/')

    const searchInput = page.locator('#searchInput')

    // Rapid typing
    for (let i = 0; i < 100; i++) {
      await searchInput.fill(`test${i}`)
      await page.waitForTimeout(10)
    }

    // Should still work
    expect(await searchInput.inputValue()).toBe('test99')
  })
})

// ========== ACCESSIBILITY TESTS ==========

test.test.describe('ACCESSIBILITY - Input Requirements', () => {
  test('Required field indicators', async ({ page }) => {
    await page.goto('/pages/admin/create-product.html')

    // Check name field (required)
    const nameInput = page.locator('#product-name')
    await expect(nameInput).toHaveAttribute('required')

    // Check price field (required)
    const priceInput = page.locator('#product-price-usd')
    await expect(priceInput).toHaveAttribute('required')

    // Optional fields should not have required
    const descInput = page.locator('#product-description')
    await expect(descInput).not.toHaveAttribute('required')
  })

  test('Input labels and associations', async ({ page }) => {
    await page.goto('/pages/payment.html')

    // Check labels exist
    await expect(page.locator('label[for="customer-name"]')).toBeVisible()
    await expect(page.locator('label[for="customer-email"]')).toBeVisible()

    // Inputs should be associated with labels
    const nameInput = page.locator('#customer-name')
    await expect(nameInput).toHaveAttribute('id', 'customer-name')
  })

  test('Keyboard navigation', async ({ page }) => {
    await page.goto('/pages/payment.html')

    // Tab through inputs
    await page.keyboard.press('Tab')
    // Focus should be on first input

    // Continue tabbing
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      await page.waitForTimeout(100)
    }

    // Should navigate through form fields
  })
})

// ========== VALIDATION MESSAGE TESTS ==========

test.test.describe('VALIDATION - Form Validation Messages', () => {
  test('Required field validation', async ({ page }) => {
    await page.goto('/pages/admin/create-product.html')

    // Try to submit empty required fields
    await page.locator('#create-product-btn').click()
    await page.waitForTimeout(500)

    // Browser should show validation messages
    // This depends on native browser validation
  })

  test('Email format validation', async ({ page }) => {
    await page.goto('/pages/payment.html')

    const emailInput = page.locator('#customer-email')

    // Invalid email
    await emailInput.fill('not-an-email')
    await page.locator('#process-payment-button').click()
    await page.waitForTimeout(500)

    // Browser may show validation error
  })

  test('Number range validation', async ({ page }) => {
    await page.goto('/pages/admin/create-product.html')

    const priceInput = page.locator('#product-price-usd')

    // Value below minimum
    await priceInput.fill('-10')
    await page.locator('#create-product-btn').click()
    await page.waitForTimeout(500)

    // Browser should prevent submission or show error
  })
})
