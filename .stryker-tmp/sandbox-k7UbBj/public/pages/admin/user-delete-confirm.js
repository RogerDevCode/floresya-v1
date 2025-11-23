/**
 * User Delete Confirmation Page Controller
 * Manages user deletion confirmation in standalone page
 */
// @ts-nocheck

import { toast } from '../../js/components/toast.js'
import { api } from '../../js/shared/api-client.js'

// Global state
let userToDelete = null

/**
 * Initialize page
 */
async function init() {
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search)
  const userId = urlParams.get('id')

  if (!userId) {
    toast.error('No se especificó usuario para eliminar')
    setTimeout(() => window.history.back(), 2000)
    return
  }

  // Load user data
  await loadUserData(userId)

  // Setup events
  setupEvents()

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
 * Load user data to display
 */
async function loadUserData(userId) {
  try {
    const result = await api.getUsersById(userId)

    if (result.success && result.data) {
      userToDelete = result.data

      // Display user info
      document.getElementById('user-email-display').textContent = userToDelete.email || '-'
      document.getElementById('user-name-display').textContent = userToDelete.full_name || '-'
      document.getElementById('user-role-display').textContent =
        userToDelete.role === 'admin' ? 'Administrador' : 'Cliente'

      // Update confirmation message
      const message = `¿Estás seguro de que deseas desactivar al usuario "${userToDelete.full_name || userToDelete.email}"?`
      document.getElementById('delete-confirm-message').textContent = message
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
 * Setup event listeners
 */
function setupEvents() {
  const confirmBtn = document.getElementById('confirm-delete')
  const cancelBtn = document.getElementById('cancel-delete')

  if (confirmBtn) {
    confirmBtn.addEventListener('click', handleConfirmDelete)
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      window.history.back()
    })
  }
}

/**
 * Handle confirm delete action
 */
async function handleConfirmDelete() {
  if (!userToDelete || !userToDelete.id) {
    toast.error('No hay usuario seleccionado para eliminar')
    return
  }

  const confirmBtn = document.getElementById('confirm-delete')

  try {
    // Disable button and show loading state
    confirmBtn.disabled = true
    confirmBtn.innerHTML = `
      <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Desactivando...
    `

    // Call API to delete (deactivate) user
    const result = await api.deleteUsers(userToDelete.id)

    if (result.success) {
      toast.success(
        `Usuario "${userToDelete.full_name || userToDelete.email}" desactivado exitosamente`
      )

      // Redirect back to dashboard after short delay
      setTimeout(() => {
        window.history.back()
      }, 1500)
    } else {
      toast.error(result.error || 'Error al desactivar usuario')

      // Re-enable button
      confirmBtn.disabled = false
      confirmBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5 mr-2">
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
        Desactivar Usuario
      `
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    toast.error('Error al desactivar usuario: ' + error.message)

    // Re-enable button
    confirmBtn.disabled = false
    confirmBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5 mr-2">
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </svg>
      Desactivar Usuario
    `
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
