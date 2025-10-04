/**
 * Common Admin Panel Utilities
 * Shared functionality across all admin pages
 */

/**
 * Setup logout button functionality
 */
export function setupLogout() {
  const logoutBtn = document.getElementById('logout-btn')
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        // In production, clear auth tokens and redirect to login
        // localStorage.removeItem('auth_token')
        // sessionStorage.clear()
        window.location.href = '/'
      }
    })
  }
}

/**
 * Display current user info
 * @param {string} username - Username to display
 */
export function displayUserInfo(username = 'Admin') {
  const userDisplay = document.getElementById('admin-user-display')
  if (userDisplay) {
    userDisplay.textContent = username
  }
}

/**
 * Initialize common admin functionalities
 */
export function initAdminCommon() {
  setupLogout()
  displayUserInfo()
}
