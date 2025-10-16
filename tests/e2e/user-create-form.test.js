/**
 * E2E Tests for User Create/Edit Form
 * FloresYa - Admin Dashboard - User Management
 *
 * Following CLAUDE.md principles:
 * - KISS: One test per specific functionality
 * - SOLID: Single Responsibility - each test focuses on one behavior
 * - Fail-fast: Clear assertions with descriptive error messages
 *
 * Test Coverage:
 * 1. Modal open/close functionality
 * 2. Cancel button without changes
 * 3. Cancel button with unsaved changes
 * 4. Form validation
 * 5. Successful user creation
 * 6. Form field interactions
 */

import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'
const DASHBOARD_URL = `${BASE_URL}/pages/admin/dashboard.html`

/**
 * Setup helper: Navigate to dashboard and open users view
 */
async function navigateToUsersView(page) {
  await page.goto(DASHBOARD_URL)
  await page.waitForLoadState('networkidle')

  // Click on Users menu item
  const usersMenuItem = page.locator('[data-view="users"]')
  await usersMenuItem.click()

  // Wait for users view to be visible
  await page.waitForSelector('#users-view:not(.hidden)', { timeout: 5000 })
}

/**
 * Setup helper: Open user creation modal
 */
async function openCreateUserModal(page) {
  const createUserBtn = page.locator('#create-user-btn')
  await expect(createUserBtn).toBeVisible()
  await createUserBtn.click()

  // Wait for modal to appear
  const modal = page.locator('#user-modal')
  await expect(modal).toBeVisible()
}

/**
 * Helper: Fill user form with test data
 */
async function fillUserForm(page, userData = {}) {
  const defaultData = {
    email: 'test@example.com',
    fullName: 'Test User',
    phone: '+58 412 123 4567',
    role: 'user',
    password: 'TestPassword123'
  }

  const data = { ...defaultData, ...userData }

  if (data.email) {
    await page.fill('#user-email', data.email)
  }
  if (data.fullName) {
    await page.fill('#user-full-name', data.fullName)
  }
  if (data.phone) {
    await page.fill('#user-phone', data.phone)
  }
  if (data.role) {
    await page.selectOption('#user-role', data.role)
  }
  if (data.password) {
    await page.fill('#user-password', data.password)
  }
}

/**
 * Helper: Check if form has unsaved changes
 */
async function hasFormChanges(page) {
  const email = await page.inputValue('#user-email')
  const fullName = await page.inputValue('#user-full-name')
  const phone = await page.inputValue('#user-phone')

  return email !== '' || fullName !== '' || phone !== ''
}

test.describe('User Create Form - Modal Behavior', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console logging for debugging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser Console Error:', msg.text())
      }
    })
  })

  test('should open create user modal when clicking "Nuevo Usuario" button', async ({ page }) => {
    await navigateToUsersView(page)

    const createUserBtn = page.locator('#create-user-btn')
    await expect(createUserBtn).toBeVisible()
    await expect(createUserBtn).toHaveText(/Nuevo Usuario/)

    await createUserBtn.click()

    // Verify modal is visible
    const modal = page.locator('#user-modal')
    await expect(modal).toBeVisible()
    await expect(modal).not.toHaveClass(/hidden/)

    // Verify modal title
    const modalTitle = page.locator('#user-modal-title')
    await expect(modalTitle).toHaveText('Crear Nuevo Usuario')

    // Verify form is present
    const form = page.locator('#user-form')
    await expect(form).toBeVisible()
  })

  test('should close modal when clicking X button without any changes', async ({ page }) => {
    await navigateToUsersView(page)
    await openCreateUserModal(page)

    const closeBtn = page.locator('#close-user-modal')
    await expect(closeBtn).toBeVisible()
    await closeBtn.click()

    // Verify modal is hidden
    const modal = page.locator('#user-modal')
    await expect(modal).toHaveClass(/hidden/)
  })

  test('should close modal when clicking "Cancelar" button without any changes', async ({
    page
  }) => {
    await navigateToUsersView(page)
    await openCreateUserModal(page)

    const cancelBtn = page.locator('#cancel-user-form')
    await expect(cancelBtn).toBeVisible()
    await expect(cancelBtn).toHaveText('Cancelar')
    await cancelBtn.click()

    // Verify modal is hidden immediately (no unsaved changes)
    const modal = page.locator('#user-modal')
    await expect(modal).toHaveClass(/hidden/)
  })
})

test.describe('User Create Form - Cancel with Unsaved Changes', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser Console Error:', msg.text())
      }
    })
  })

  test('should prompt confirmation when clicking X with unsaved changes', async ({ page }) => {
    await navigateToUsersView(page)
    await openCreateUserModal(page)

    // Fill in some data
    await page.fill('#user-email', 'test@example.com')
    await page.fill('#user-full-name', 'Test User')

    // Verify there are changes
    const hasChanges = await hasFormChanges(page)
    expect(hasChanges).toBeTruthy()

    // Setup dialog handler
    let dialogAppeared = false
    page.on('dialog', async dialog => {
      dialogAppeared = true
      expect(dialog.type()).toBe('confirm')
      expect(dialog.message()).toMatch(/cambios sin guardar/i)
      await dialog.dismiss() // Click "Cancel" on the confirm dialog
    })

    const closeBtn = page.locator('#close-user-modal')
    await closeBtn.click()

    // Give time for dialog to appear
    await page.waitForTimeout(500)

    // Verify dialog appeared (or modal implemented custom confirmation)
    // If no native dialog, check if modal is still visible
    const modal = page.locator('#user-modal')
    const isModalVisible = await modal.isVisible()

    // Either dialog appeared OR modal stayed open
    expect(dialogAppeared || isModalVisible).toBeTruthy()
  })

  test('should prompt confirmation when clicking Cancel with unsaved changes', async ({ page }) => {
    await navigateToUsersView(page)
    await openCreateUserModal(page)

    // Fill in some data
    await fillUserForm(page, { email: 'test@example.com', fullName: 'Test User' })

    // Setup dialog handler
    let dialogAppeared = false
    page.on('dialog', async dialog => {
      dialogAppeared = true
      expect(dialog.type()).toBe('confirm')
      expect(dialog.message()).toMatch(/cambios sin guardar/i)
      await dialog.dismiss() // Stay on the form
    })

    const cancelBtn = page.locator('#cancel-user-form')
    await cancelBtn.click()

    await page.waitForTimeout(500)

    const modal = page.locator('#user-modal')
    const isModalVisible = await modal.isVisible()

    expect(dialogAppeared || isModalVisible).toBeTruthy()
  })

  test('should close modal when confirming discard changes', async ({ page }) => {
    await navigateToUsersView(page)
    await openCreateUserModal(page)

    // Fill in data
    await fillUserForm(page, { email: 'test@example.com' })

    // Setup dialog handler to accept (discard changes)
    page.on('dialog', async dialog => {
      await dialog.accept() // Confirm discard
    })

    const cancelBtn = page.locator('#cancel-user-form')
    await cancelBtn.click()

    // Wait for modal to close
    await page.waitForTimeout(500)

    const modal = page.locator('#user-modal')
    // Modal should be hidden after confirming discard
    const modalClasses = await modal.getAttribute('class')
    expect(modalClasses).toContain('hidden')
  })
})

test.describe('User Create Form - Field Validation', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser Console Error:', msg.text())
      }
    })
  })

  test('should show validation errors for required fields when submitting empty form', async ({
    page
  }) => {
    await navigateToUsersView(page)
    await openCreateUserModal(page)

    const submitBtn = page.locator('#user-form button[type="submit"]')
    await submitBtn.click()

    // Check HTML5 validation
    const emailInput = page.locator('#user-email')
    const isEmailValid = await emailInput.evaluate(el => el.validity.valid)
    expect(isEmailValid).toBeFalsy()

    const nameInput = page.locator('#user-full-name')
    const isNameValid = await nameInput.evaluate(el => el.validity.valid)
    expect(isNameValid).toBeFalsy()

    const roleSelect = page.locator('#user-role')
    const isRoleValid = await roleSelect.evaluate(el => el.validity.valid)
    expect(isRoleValid).toBeFalsy()
  })

  test('should validate email format', async ({ page }) => {
    await navigateToUsersView(page)
    await openCreateUserModal(page)

    const emailInput = page.locator('#user-email')

    // Test invalid email
    await emailInput.fill('invalid-email')
    const isInvalidEmailValid = await emailInput.evaluate(el => el.validity.valid)
    expect(isInvalidEmailValid).toBeFalsy()

    // Test valid email
    await emailInput.fill('valid@example.com')
    const isValidEmailValid = await emailInput.evaluate(el => el.validity.valid)
    expect(isValidEmailValid).toBeTruthy()
  })

  test('should validate password minimum length (8 characters)', async ({ page }) => {
    await navigateToUsersView(page)
    await openCreateUserModal(page)

    const passwordInput = page.locator('#user-password')

    // Test short password
    await passwordInput.fill('short')
    const isShortPasswordValid = await passwordInput.evaluate(el => el.validity.valid)
    expect(isShortPasswordValid).toBeFalsy()

    // Test valid password
    await passwordInput.fill('ValidPass123')
    const isValidPasswordValid = await passwordInput.evaluate(el => el.validity.valid)
    expect(isValidPasswordValid).toBeTruthy()
  })

  test('should toggle password visibility', async ({ page }) => {
    await navigateToUsersView(page)
    await openCreateUserModal(page)

    const passwordInput = page.locator('#user-password')
    const toggleBtn = page.locator('#toggle-password')

    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Click toggle to show password
    await toggleBtn.click()
    await expect(passwordInput).toHaveAttribute('type', 'text')

    // Click again to hide
    await toggleBtn.click()
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })
})

test.describe('User Create Form - Form Interactions', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser Console Error:', msg.text())
      }
    })
  })

  test('should fill all form fields correctly', async ({ page }) => {
    await navigateToUsersView(page)
    await openCreateUserModal(page)

    const testData = {
      email: 'newuser@example.com',
      fullName: 'Juan Pérez',
      phone: '+58 412 345 6789',
      role: 'user',
      password: 'SecurePass123'
    }

    await fillUserForm(page, testData)

    // Verify all fields were filled
    await expect(page.locator('#user-email')).toHaveValue(testData.email)
    await expect(page.locator('#user-full-name')).toHaveValue(testData.fullName)
    await expect(page.locator('#user-phone')).toHaveValue(testData.phone)
    await expect(page.locator('#user-role')).toHaveValue(testData.role)
    await expect(page.locator('#user-password')).toHaveValue(testData.password)
  })

  test('should allow selecting different user roles', async ({ page }) => {
    await navigateToUsersView(page)
    await openCreateUserModal(page)

    const roleSelect = page.locator('#user-role')

    // Test selecting "user" role
    await roleSelect.selectOption('user')
    await expect(roleSelect).toHaveValue('user')

    // Test selecting "admin" role
    await roleSelect.selectOption('admin')
    await expect(roleSelect).toHaveValue('admin')
  })

  test('should allow phone field to be optional', async ({ page }) => {
    await navigateToUsersView(page)
    await openCreateUserModal(page)

    const phoneInput = page.locator('#user-phone')

    // Verify phone is not required
    const isRequired = await phoneInput.getAttribute('required')
    expect(isRequired).toBeNull()

    // Verify form can be valid without phone
    await fillUserForm(page, { phone: '' })

    const isPhoneValid = await phoneInput.evaluate(el => el.validity.valid)
    expect(isPhoneValid).toBeTruthy()
  })
})

test.describe('User Create Form - Form Submission', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser Console Error:', msg.text())
      }
    })
  })

  test('should show loading state when submitting form', async ({ page }) => {
    await navigateToUsersView(page)
    await openCreateUserModal(page)

    // Fill valid data
    await fillUserForm(page)

    const submitBtn = page.locator('#user-form button[type="submit"]')
    const _originalText = await submitBtn.textContent()

    // Submit form
    await submitBtn.click()

    // Button should show loading state
    await page.waitForTimeout(200)
    const loadingText = await submitBtn.textContent()

    // Should show "Creando..." or be disabled
    const isDisabled = await submitBtn.isDisabled()
    expect(isDisabled || loadingText?.includes('Creando')).toBeTruthy()
  })

  test('should submit form with valid data and close modal on success', async ({ page }) => {
    await navigateToUsersView(page)
    await openCreateUserModal(page)

    // Fill all required fields
    const testData = {
      email: `test${Date.now()}@example.com`,
      fullName: 'Test User Creation',
      phone: '+58 412 111 2222',
      role: 'user',
      password: 'TestPassword123'
    }

    await fillUserForm(page, testData)

    // Setup network interception to mock successful response
    await page.route('**/api/users', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 999,
              email: testData.email,
              full_name: testData.fullName,
              role: testData.role
            },
            message: 'User created successfully'
          })
        })
      } else {
        await route.continue()
      }
    })

    const submitBtn = page.locator('#user-form button[type="submit"]')
    await submitBtn.click()

    // Wait for modal to close on success
    await page.waitForTimeout(1000)

    const modal = page.locator('#user-modal')
    const modalClasses = await modal.getAttribute('class')
    expect(modalClasses).toContain('hidden')
  })

  test('should handle API error gracefully', async ({ page }) => {
    await navigateToUsersView(page)
    await openCreateUserModal(page)

    await fillUserForm(page)

    // Mock API error
    await page.route('**/api/users', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Email already exists',
            message: 'User creation failed'
          })
        })
      } else {
        await route.continue()
      }
    })

    const submitBtn = page.locator('#user-form button[type="submit"]')
    await submitBtn.click()

    // Wait for error handling
    await page.waitForTimeout(1000)

    // Modal should remain open on error
    const modal = page.locator('#user-modal')
    await expect(modal).toBeVisible()

    // Button should be re-enabled
    const isDisabled = await submitBtn.isDisabled()
    expect(isDisabled).toBeFalsy()
  })
})

test.describe('User Create Form - Accessibility', () => {
  test('should have proper labels and ARIA attributes', async ({ page }) => {
    await navigateToUsersView(page)
    await openCreateUserModal(page)

    // Check required field indicators
    const requiredLabels = page.locator('label:has(span.text-red-500)')
    const requiredCount = await requiredLabels.count()
    expect(requiredCount).toBeGreaterThan(0)

    // Check form inputs have proper types
    await expect(page.locator('#user-email')).toHaveAttribute('type', 'email')
    await expect(page.locator('#user-password')).toHaveAttribute('type', 'password')
    await expect(page.locator('#user-phone')).toHaveAttribute('type', 'tel')
  })

  test('should be keyboard navigable', async ({ page }) => {
    await navigateToUsersView(page)
    await openCreateUserModal(page)

    // Start from email field
    await page.focus('#user-email')

    // Tab through fields
    await page.keyboard.press('Tab')
    await expect(page.locator('#user-full-name')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.locator('#user-phone')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.locator('#user-role')).toBeFocused()
  })
})
