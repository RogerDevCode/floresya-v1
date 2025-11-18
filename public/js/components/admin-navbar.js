/**
 * Admin Navbar Component - Estandarizado
 * Sistema de navegación unificado para todas las páginas admin
 * Incluye: Breadcrumb, Tema (dark/light), Notificaciones, User info
 */

class AdminNavbar {
  constructor(options = {}) {
    this.currentPage = options.currentPage || 'Dashboard'
    this.breadcrumbs = options.breadcrumbs || []
    this.showSidebar = options.showSidebar || false
    this.notifications = []
    this.theme = localStorage.getItem('admin-theme') || 'light'
    
    this.init()
  }

  init() {
    this.applyTheme(this.theme)
    this.setupEventListeners()
    this.loadNotifications()
    this.displayUserInfo()
  }

  /**
   * Apply theme to page
   */
  applyTheme(theme) {
    this.theme = theme
    localStorage.setItem('admin-theme', theme)
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      document.body.classList.add('bg-gray-900', 'text-gray-100')
      document.body.classList.remove('bg-gray-50', 'text-gray-900')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('bg-gray-900', 'text-gray-100')
      document.body.classList.add('bg-gray-50', 'text-gray-900')
    }
  }

  /**
   * Toggle theme
   */
  toggleTheme() {
    const newTheme = this.theme === 'light' ? 'dark' : 'light'
    this.applyTheme(newTheme)
    this.updateThemeButton()
  }

  /**
   * Update theme button icon
   */
  updateThemeButton() {
    const btn = document.getElementById('theme-toggle-btn')
    if (!btn) return

    const isDark = this.theme === 'dark'
    btn.innerHTML = isDark
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/>
          <path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/>
          <path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
        </svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
        </svg>`
    
    btn.title = isDark ? 'Modo Claro' : 'Modo Oscuro'
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Theme toggle
    const themeBtn = document.getElementById('theme-toggle-btn')
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme())
      this.updateThemeButton()
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn')
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout())
    }

    // Back button
    const backBtn = document.getElementById('back-btn')
    if (backBtn) {
      backBtn.addEventListener('click', () => window.history.back())
    }

    // Notifications
    const notifBtn = document.getElementById('notifications-btn')
    if (notifBtn) {
      notifBtn.addEventListener('click', () => this.toggleNotifications())
    }

    // Close notifications on outside click
    document.addEventListener('click', (e) => {
      const notifPanel = document.getElementById('notifications-panel')
      const notifBtn = document.getElementById('notifications-btn')
      if (notifPanel && !notifPanel.contains(e.target) && !notifBtn?.contains(e.target)) {
        notifPanel.classList.add('hidden')
      }
    })
  }

  /**
   * Display user info
   */
  displayUserInfo() {
    const userDisplay = document.getElementById('admin-user-display')
    if (!userDisplay) return

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.full_name) {
      userDisplay.textContent = user.full_name
    }
  }

  /**
   * Load notifications
   */
  async loadNotifications() {
    // Placeholder for API call
    this.notifications = [
      // { id: 1, type: 'info', message: 'Nueva orden recibida', time: '5 min' },
      // { id: 2, type: 'warning', message: 'Stock bajo en productos', time: '1 hora' }
    ]
    this.updateNotificationBadge()
  }

  /**
   * Update notification badge
   */
  updateNotificationBadge() {
    const badge = document.getElementById('notification-badge')
    if (!badge) return

    const count = this.notifications.length
    if (count > 0) {
      badge.textContent = count > 9 ? '9+' : count
      badge.classList.remove('hidden')
    } else {
      badge.classList.add('hidden')
    }
  }

  /**
   * Toggle notifications panel
   */
  toggleNotifications() {
    const panel = document.getElementById('notifications-panel')
    if (!panel) return

    panel.classList.toggle('hidden')
    this.renderNotifications()
  }

  /**
   * Render notifications
   */
  renderNotifications() {
    const container = document.getElementById('notifications-list')
    if (!container) return

    if (this.notifications.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-gray-400 dark:text-gray-600 mb-3">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
          </svg>
          <p class="text-sm text-gray-500 dark:text-gray-400">No hay notificaciones</p>
        </div>
      `
      return
    }

    container.innerHTML = this.notifications.map(notif => `
      <div class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-0">
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
            notif.type === 'warning' ? 'bg-yellow-500' : 
            notif.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
          }"></div>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-900 dark:text-gray-100">${notif.message}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${notif.time}</p>
          </div>
        </div>
      </div>
    `).join('')
  }

  /**
   * Handle logout
   */
  handleLogout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      window.location.href = '../../index.html'
    }
  }
}

// Auto-initialize if config exists
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const navbarConfig = window.adminNavbarConfig
    if (navbarConfig) {
      window.adminNavbar = new AdminNavbar(navbarConfig)
    }
  })
} else {
  const navbarConfig = window.adminNavbarConfig
  if (navbarConfig) {
    window.adminNavbar = new AdminNavbar(navbarConfig)
  }
}

export { AdminNavbar }
