/**
 * Auth Mock Service - DEVELOPMENT ONLY
 *
 * ⚠️ WARNING: THIS IS A TEMPORARY MOCK FOR DEVELOPMENT
 * ⚠️ DO NOT USE IN PRODUCTION - REMOVE BEFORE DEPLOYING
 *
 * This mock simulates authentication without a real login system.
 * It provides a fake JWT token that the backend will accept in development mode.
 *
 * TODO: Replace with real authentication system:
 * - Implement /pages/admin/login.html
 * - Create real authService.js with login/logout
 * - Integrate with Supabase Auth
 * - Add JWT token management
 * - Remove this mock file
 */

export const DEV_MODE = true // ⚠️ SET TO FALSE IN PRODUCTION

// Mock JWT token (matches backend DEV_MOCK_USER)
export const MOCK_TOKEN = 'dev-mock-token-admin-floresya'

// Mock admin user
export const MOCK_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'admin@floresya.dev',
  name: 'Admin Dev',
  role: 'admin',
  authenticated: true
}

/**
 * Auth Mock Service
 */
export const authMock = {
  /**
   * Check if in development mode
   * @returns {boolean}
   */
  isDevMode() {
    return DEV_MODE
  },

  /**
   * Get mock auth token
   * @returns {string|null}
   */
  getToken() {
    if (!DEV_MODE) {
      console.warn('⚠️ authMock: Not in dev mode, returning null')
      return null
    }
    return MOCK_TOKEN
  },

  /**
   * Get mock user
   * @returns {object|null}
   */
  getUser() {
    if (!DEV_MODE) {
      return null
    }
    return { ...MOCK_USER }
  },

  /**
   * Check if user is authenticated (always true in dev mode)
   * @returns {boolean}
   */
  isAuthenticated() {
    return DEV_MODE
  },

  /**
   * Mock login (always succeeds in dev mode)
   * @param {string} email
   * @param {string} _password - Password (unused in mock)
   * @returns {Promise<object>}
   */
  async login(email, _password) {
    if (!DEV_MODE) {
      throw new Error('Login mock only available in dev mode')
    }

    console.log('🔓 [DEV] Mock login:', email)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Store mock token
    localStorage.setItem('auth_token', MOCK_TOKEN)
    localStorage.setItem('auth_user', JSON.stringify(MOCK_USER))

    return {
      success: true,
      token: MOCK_TOKEN,
      user: MOCK_USER
    }
  },

  /**
   * Mock logout
   */
  logout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    console.log('🔓 [DEV] Mock logout')
  },

  /**
   * Initialize mock auth (auto-login in dev mode)
   */
  init() {
    if (!DEV_MODE) {
      console.log('🔒 Auth mock disabled (production mode)')
      return
    }

    // Auto-login with mock credentials
    const existingToken = localStorage.getItem('auth_token')
    if (!existingToken) {
      localStorage.setItem('auth_token', MOCK_TOKEN)
      localStorage.setItem('auth_user', JSON.stringify(MOCK_USER))
      console.log('🔓 [DEV] Auto-authenticated with mock admin user')
    } else {
      console.log('🔓 [DEV] Using existing mock token')
    }

    // Show dev warning banner
    this.showDevWarning()
  },

  /**
   * Show development warning banner
   */
  showDevWarning() {
    const banner = document.createElement('div')
    banner.id = 'dev-auth-warning'
    banner.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to right, #fbbf24, #f59e0b);
      color: #78350f;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      font-weight: 600;
      text-align: center;
      z-index: 9999;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
      animation: slideUp 0.3s ease-out;
    `
    banner.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
        <svg style="width: 1.25rem; height: 1.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <span>⚠️ DEVELOPMENT MODE - Mock Authentication Active (No real login required)</span>
        <button onclick="document.getElementById('dev-auth-warning').remove()" style="background: rgba(120, 53, 15, 0.2); border: none; color: inherit; padding: 0.25rem 0.5rem; border-radius: 0.25rem; cursor: pointer; font-weight: 600;">
          Dismiss
        </button>
      </div>
    `

    // Add animation
    const style = document.createElement('style')
    style.textContent = `
      @keyframes slideUp {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `
    document.head.appendChild(style)
    document.body.appendChild(banner)

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      if (banner.parentNode) {
        banner.style.animation = 'slideUp 0.3s ease-out reverse'
        setTimeout(() => banner.remove(), 300)
      }
    }, 10000)
  }
}

// Auto-initialize on import
authMock.init()

console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🔓 AUTH MOCK ACTIVE - DEVELOPMENT MODE                   ║
║                                                           ║
║  ⚠️  WARNING: No real authentication!                    ║
║  ⚠️  All admin endpoints accessible without login        ║
║  ⚠️  DO NOT USE IN PRODUCTION                            ║
║                                                           ║
║  Mock User: admin@floresya.dev (role: admin)             ║
║  Mock Token: dev-mock-token-admin-floresya               ║
║                                                           ║
║  TODO: Implement real auth system before production      ║
╚═══════════════════════════════════════════════════════════╝
`)
