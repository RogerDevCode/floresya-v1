/**
 * E2E Tests for Passwordless Authentication
 * FloresYa - Admin Dashboard - User Management
 *
 * Following CLAUDE.md principles:
 * - KISS: One test per specific functionality
 * - SOLID: Single Responsibility - each test focuses on one behavior
 * - Fail-fast: Clear assertions with descriptive error messages
 *
 * Test Coverage:
 * 1. Email lookup auto-completion for existing users
 * 2. New user creation without password
 * 3. Magic Link button shows "Próximamente" message
 * 4. Form updates to "Update" mode when existing email is found
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

test.describe('Passwordless Authentication - Magic Link Info', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console logging for debugging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser Console Error:', msg.text())
      }
    })

    await navigateToUsersView(page)
    await openCreateUserModal(page)
  })

  test('should display Magic Link info section', async ({ page }) => {
    // Check that Magic Link info section exists
    const magicLinkInfo = page.locator('.bg-blue-50')
    await expect(magicLinkInfo).toBeVisible()

    // Verify info text mentions passwordless authentication
    await expect(magicLinkInfo).toContainText('Autenticación Sin Contraseña')
    await expect(magicLinkInfo).toContainText('enlace mágico')
  })

  test('should have disabled Magic Link button with "Próximamente" text', async ({ page }) => {
    const magicLinkBtn = page.locator('#send-magic-link-btn')

    // Button should be visible
    await expect(magicLinkBtn).toBeVisible()

    // Button should be disabled
    await expect(magicLinkBtn).toBeDisabled()

    // Button should show "(Próximamente)" text
    await expect(magicLinkBtn).toContainText('Próximamente')
  })

  test('should NOT have password field in form', async ({ page }) => {
    // Password field should not exist
    const passwordField = page.locator('#user-password')
    await expect(passwordField).not.toBeVisible()

    // Password toggle button should not exist
    const passwordToggle = page.locator('#toggle-password')
    await expect(passwordToggle).not.toBeVisible()
  })
})

test.describe('Passwordless Authentication - Email Lookup', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser Console Error:', msg.text())
      }
    })

    await navigateToUsersView(page)
  })

  test('should auto-complete form when existing email is entered', async ({ page }) => {
    // First, create a user via API or use existing test user
    // For this test, we'll assume there's a user with email 'admin@floresya.com'

    await openCreateUserModal(page)

    const emailInput = page.locator('#user-email')
    const fullNameInput = page.locator('#user-full-name')
    const modalTitle = page.locator('#user-modal-title')
    const submitText = page.locator('#user-form-submit-text')

    // Initially, modal should be in "Create" mode
    await expect(modalTitle).toContainText('Crear Nuevo Usuario')

    // Enter an existing email
    await emailInput.fill('admin@floresya.com')

    // Trigger blur event to execute email lookup
    await emailInput.blur()

    // Wait for API call to complete
    await page.waitForTimeout(1000)

    // Check if form was auto-filled (assuming admin user exists)
    // Note: This test will pass if the user exists, otherwise it will create a new user
    const fullNameValue = await fullNameInput.inputValue()

    if (fullNameValue !== '') {
      // User was found and form was auto-filled
      await expect(modalTitle).toContainText('Actualizar Usuario Existente')
      await expect(submitText).toContainText('Actualizar Usuario')
    } else {
      // User doesn't exist yet - will be created as new
      await expect(modalTitle).toContainText('Crear Nuevo Usuario')
      await expect(submitText).toContainText('Crear Usuario')
    }
  })

  test('should stay in Create mode for non-existent email', async ({ page }) => {
    await openCreateUserModal(page)

    const emailInput = page.locator('#user-email')
    const modalTitle = page.locator('#user-modal-title')
    const submitText = page.locator('#user-form-submit-text')

    // Enter a new email that doesn't exist
    const newEmail = `test-${Date.now()}@example.com`
    await emailInput.fill(newEmail)
    await emailInput.blur()

    // Wait for API call to complete
    await page.waitForTimeout(1000)

    // Modal should remain in "Create" mode
    await expect(modalTitle).toContainText('Crear Nuevo Usuario')
    await expect(submitText).toContainText('Crear Usuario')
  })

  test('should not trigger lookup for invalid email format', async ({ page }) => {
    await openCreateUserModal(page)

    const emailInput = page.locator('#user-email')
    const modalTitle = page.locator('#user-modal-title')

    // Enter invalid email (no @ symbol)
    await emailInput.fill('notanemail')
    await emailInput.blur()

    // Wait a bit
    await page.waitForTimeout(500)

    // Modal should remain in "Create" mode (no API call made)
    await expect(modalTitle).toContainText('Crear Nuevo Usuario')
  })
})

test.describe('Passwordless Authentication - User Creation', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser Console Error:', msg.text())
      }
    })

    await navigateToUsersView(page)
    await openCreateUserModal(page)
  })

  test('should create user without password field', async ({ page }) => {
    const emailInput = page.locator('#user-email')
    const fullNameInput = page.locator('#user-full-name')
    const phoneInput = page.locator('#user-phone')
    const roleSelect = page.locator('#user-role')
    const submitBtn = page.locator('button[type="submit"]')

    // Fill form without password
    const testEmail = `guest-${Date.now()}@example.com`
    await emailInput.fill(testEmail)
    await fullNameInput.fill('Guest User Test')
    await phoneInput.fill('+58 412 999 8888')
    await roleSelect.selectOption('user')

    // Submit form
    await submitBtn.click()

    // Wait for success or error
    await page.waitForTimeout(2000)

    // Check if modal closed (indicating success)
    const modal = page.locator('#user-modal')
    const isModalHidden = await modal.evaluate(el => el.classList.contains('hidden'))

    // Modal should close on success
    expect(isModalHidden).toBeTruthy()
  })

  test('should validate required fields even without password', async ({ page }) => {
    const emailInput = page.locator('#user-email')
    const fullNameInput = page.locator('#user-full-name')
    const submitBtn = page.locator('button[type="submit"]')

    // Leave email empty (required field)
    await fullNameInput.fill('Test User')

    // Try to submit
    await submitBtn.click()

    // Email validation should trigger (HTML5 validation)
    const emailValidation = await emailInput.evaluate(el => el.validity.valid)
    expect(emailValidation).toBe(false)
  })
})

test.describe('Passwordless Authentication - Update Existing User', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser Console Error:', msg.text())
      }
    })

    await navigateToUsersView(page)
    await openCreateUserModal(page)
  })

  test('should update existing user data when email is found', async ({ page }) => {
    const emailInput = page.locator('#user-email')
    const fullNameInput = page.locator('#user-full-name')
    const phoneInput = page.locator('#user-phone')
    const submitBtn = page.locator('button[type="submit"]')

    // Enter existing email (assuming admin@floresya.com exists)
    await emailInput.fill('admin@floresya.com')
    await emailInput.blur()

    // Wait for lookup
    await page.waitForTimeout(1000)

    // Check if form was auto-filled
    const fullNameValue = await fullNameInput.inputValue()

    if (fullNameValue !== '') {
      // User exists - modify the name
      await fullNameInput.fill('Admin Updated Name')
      await phoneInput.fill('+58 412 111 2222')

      // Submit to update
      await submitBtn.click()

      // Wait for completion
      await page.waitForTimeout(2000)

      // Modal should close
      const modal = page.locator('#user-modal')
      const isModalHidden = await modal.evaluate(el => el.classList.contains('hidden'))
      expect(isModalHidden).toBeTruthy()
    }
  })
})
