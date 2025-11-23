/**
 * User Form Page Controller
 * Manages user creation and editing in standalone page
 */
// @ts-nocheck

import { toast } from '../../js/components/toast.js'
import { api } from '../../js/shared/api-client.js'

// Global state
let currentEditingUser = null

/**
 * Initialize page
 */
async function init() {
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search)
  const userId = urlParams.get('id')
  const mode = urlParams.get('mode') || 'create'

  // Setup page based on mode
  if (mode === 'edit' && userId) {
    await loadUserForEdit(userId)
  }

  // Setup form events
  setupFormEvents()

  // Display admin user info
  displayAdminInfo()
}

/**
 * Display admin user info in navbar
 */
function displayAdminInfo() {
  const adminDisplay = document.getElementById('admin-user-display')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (adminDisplay && user.full_name) {
    adminDisplay.textContent = user.full_name
  }
}

/**
 * Load user data for editing
 */
async function loadUserForEdit(userId) {
  try {
    const result = await api.getUsersById(userId)

    if (result.success && result.data) {
      const user = result.data
      currentEditingUser = user

      // Update page title
      document.getElementById('page-title').textContent = 'Editar Usuario'

      // Fill form with user data
      document.getElementById('user-email').value = user.email || ''
      document.getElementById('user-full-name').value = user.full_name || ''
      document.getElementById('user-phone').value = user.phone || ''
      document.getElementById('user-role').value = user.role || 'user'

      // Update submit button text
      document.getElementById('user-form-submit-text').textContent = 'Actualizar Usuario'

      // Disable email field if editing (email shouldn't change)
      document.getElementById('user-email').disabled = true
    } else {
      toast.error('Error al cargar datos del usuario')
      setTimeout(() => window.history.back(), 2000)
    }
  } catch (error) {
    console.error('Error loading user:', error)
    toast.error('Error al cargar usuario: ' + error.message)
    setTimeout(() => window.history.back(), 2000)
  }
}

/**
 * Setup form events
 */
function setupFormEvents() {
  const form = document.getElementById('user-form')
  const emailInput = document.getElementById('user-email')
  const magicLinkBtn = document.getElementById('send-magic-link-btn')

  if (form) {
    form.addEventListener('submit', handleFormSubmit)
  }

  // Auto-complete form when email is entered
  if (emailInput) {
    emailInput.addEventListener('blur', handleEmailLookup)
  }

  // Magic Link button (disabled for now)
  if (magicLinkBtn) {
    magicLinkBtn.addEventListener('click', () => {
      toast.info('Funcionalidad de Magic Link próximamente disponible')
    })
  }
}

/**
 * Handle email lookup for auto-completion
 */
async function handleEmailLookup(e) {
  const email = e.target.value.trim()

  if (!email || !email.includes('@')) {
    return
  }

  // Don't lookup if we're already editing a user
  if (currentEditingUser) {
    return
  }

  try {
    // Search user by email
    const result = await api.getAllUsers({ search: email })

    if (result.success && result.data && result.data.length > 0) {
      const user = result.data[0]

      // Auto-fill form with existing data
      document.getElementById('user-full-name').value = user.full_name || ''
      document.getElementById('user-phone').value = user.phone || ''
      document.getElementById('user-role').value = user.role || 'user'

      // Save reference to existing user
      currentEditingUser = user

      // Update page title
      document.getElementById('page-title').textContent = 'Actualizar Usuario Existente'

      // Update submit button text
      document.getElementById('user-form-submit-text').textContent = 'Actualizar Usuario'

      toast.info(`Usuario encontrado: ${user.full_name}. Los datos se actualizarán al guardar.`)
    }
  } catch (error) {
    console.error('Error looking up email:', error)
    console.log('Usuario no encontrado, será creado como nuevo:', email)
    currentEditingUser = null
  }
}

/**
 * Handle form submission
 */
async function handleFormSubmit(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const userData = {
    email: formData.get('email')?.trim(),
    full_name: formData.get('full_name')?.trim(),
    phone: formData.get('phone')?.trim() || null,
    role: formData.get('role')
  }

  // Validation
  if (!userData.email || !userData.full_name || !userData.role) {
    toast.error('Por favor complete todos los campos obligatorios')
    return
  }

  try {
    let result

    if (currentEditingUser && currentEditingUser.id) {
      // Update existing user
      result = await api.updateUsers(currentEditingUser.id, userData)
      if (result.success) {
        toast.success('Usuario actualizado exitosamente')
      }
    } else {
      // Create new user
      result = await api.createUsers(userData)
      if (result.success) {
        toast.success('Usuario creado exitosamente')
      }
    }

    if (result.success) {
      // Redirect back to dashboard after short delay
      setTimeout(() => {
        window.history.back()
      }, 1500)
    } else {
      toast.error(result.error || 'Error al guardar usuario')
    }
  } catch (error) {
    console.error('Error saving user:', error)
    toast.error('Error al guardar usuario: ' + error.message)
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
