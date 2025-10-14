/**
 * Mobile Navigation Drawer Component
 *
 * A sophisticated slide-in drawer navigation for mobile devices that replaces
 * the simple mobile menu toggle with an enhanced user experience.
 *
 * Features:
 * - Slide-in drawer from right side
 * - Overlay backdrop with click-to-close
 * - Keyboard navigation (ESC to close)
 * - Focus management within drawer
 * - Body scroll lock when open
 * - Smooth animations and transitions
 * - Accessibility compliant (44px+ touch targets)
 *
 * @example
 * import { MobileNav } from './js/components/mobileNav.js'
 *
 * // Initialize the mobile navigation
 * const mobileNav = new MobileNav()
 * mobileNav.init()
 *
 * // Or use the convenience function
 * import { initMobileNav } from './js/components/mobileNav.js'
 * initMobileNav()
 */

import { onDOMReady } from '../shared/dom-ready.js'

/**
 * Mobile Navigation Drawer Class
 *
 * Implements a slide-in drawer navigation with comprehensive accessibility
 * support and smooth animations.
 */
export class MobileNav {
  /**
   * Create a new MobileNav instance
   * @param {Object} options - Configuration options
   * @param {string} options.menuBtnSelector - Selector for menu toggle button (default: '#mobile-menu-btn')
   * @param {string} options.menuSelector - Selector for mobile menu container (default: '#mobile-menu')
   * @param {string} options.drawerId - ID for the drawer element (default: 'mobile-nav-drawer')
   * @param {string} options.overlayId - ID for the overlay element (default: 'mobile-nav-overlay')
   * @param {number} options.animationDuration - Animation duration in ms (default: 300)
   */
  constructor(options = {}) {
    // Configuration with defaults
    this.options = {
      menuBtnSelector: options.menuBtnSelector || '#mobile-menu-btn',
      menuSelector: options.menuSelector || '#mobile-menu',
      drawerId: options.drawerId || 'mobile-nav-drawer',
      overlayId: options.overlayId || 'mobile-nav-overlay',
      animationDuration: options.animationDuration || 250,
      ...options
    }

    // State management
    this.isOpen = false
    this.isAnimating = false
    this.scrollPosition = undefined
    this.historyStateAdded = false

    // DOM element references
    this.menuBtn = null
    this.originalMenu = null
    this.drawer = null
    this.overlay = null
    this.focusableElements = []
    this.firstFocusableEl = null
    this.lastFocusableEl = null

    // Event handlers bound to this instance
    this.handleMenuBtnClick = this.handleMenuBtnClick.bind(this)
    this.handleOverlayClick = this.handleOverlayClick.bind(this)
    this.handleKeydown = this.handleKeydown.bind(this)
    this.handleLinkClick = this.handleLinkClick.bind(this)
    this.handleFocusTrap = this.handleFocusTrap.bind(this)
    this.handlePopstate = this.handlePopstate.bind(this)

    // Animation frame references
    this.animationFrame = null
  }

  /**
   * Initialize the mobile navigation drawer
   * @throws {Error} If required elements are not found
   * @returns {void}
   */
  init() {
    try {
      // Find required elements
      this.menuBtn = document.querySelector(this.options.menuBtnSelector)
      this.originalMenu = document.querySelector(this.options.menuSelector)

      if (!this.menuBtn) {
        throw new Error(
          `MobileNav: Menu button not found with selector "${this.options.menuBtnSelector}"`
        )
      }

      if (!this.originalMenu) {
        throw new Error(
          `MobileNav: Original menu not found with selector "${this.options.menuSelector}"`
        )
      }

      // Create drawer and overlay elements
      this.createDrawerElements()

      // Move menu content to drawer
      this.moveMenuContent()

      // Hide original menu
      this.originalMenu.classList.add('hidden')

      // Add event listeners
      this.addEventListeners()

      // Add CSS link
      this.addStylesLink()

      console.log('✅ MobileNav: Initialized successfully')
    } catch (error) {
      console.error('❌ MobileNav: Initialization failed:', error)
      throw error // Fail-fast: propagate error
    }
  }

  /**
   * Create the drawer and overlay DOM elements
   * @returns {void}
   */
  createDrawerElements() {
    // Create overlay
    this.overlay = document.createElement('div')
    this.overlay.id = this.options.overlayId
    // IMPORTANT: Only use mobile-nav-overlay class - CSS handles all styling
    this.overlay.className = 'mobile-nav-overlay'
    this.overlay.setAttribute('aria-hidden', 'true')
    this.overlay.setAttribute('data-mobile-nav-overlay', '')

    // Create drawer
    this.drawer = document.createElement('div')
    this.drawer.id = this.options.drawerId
    // IMPORTANT: Only use mobile-nav-drawer class - remove Tailwind transform classes that conflict with CSS
    this.drawer.className = 'mobile-nav-drawer'
    this.drawer.setAttribute('role', 'navigation')
    this.drawer.setAttribute('aria-label', 'Menú de navegación móvil')
    this.drawer.setAttribute('aria-hidden', 'true')
    this.drawer.setAttribute('data-mobile-nav-drawer', '')

    // Create drawer header with close button
    const drawerHeader = document.createElement('div')
    drawerHeader.className =
      'flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10 drawer-header'

    const drawerTitle = document.createElement('h2')
    drawerTitle.className = 'text-lg font-semibold text-gray-900 drawer-title'
    drawerTitle.textContent = 'Menú'

    const closeBtn = document.createElement('button')
    closeBtn.className =
      'p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 drawer-close-btn'
    closeBtn.setAttribute('aria-label', 'Cerrar menú')
    closeBtn.setAttribute('type', 'button')
    closeBtn.innerHTML = `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    `

    drawerHeader.appendChild(drawerTitle)
    drawerHeader.appendChild(closeBtn)
    this.drawer.appendChild(drawerHeader)

    // Create content container
    const drawerContent = document.createElement('div')
    drawerContent.className = 'p-4 drawer-content'
    drawerContent.setAttribute('data-drawer-content', '')
    this.drawer.appendChild(drawerContent)

    // Add to DOM
    document.body.appendChild(this.overlay)
    document.body.appendChild(this.drawer)

    // Store close button reference
    this.closeBtn = closeBtn
  }

  /**
   * Move menu content from original menu to drawer
   * @returns {void}
   */
  moveMenuContent() {
    const drawerContent = this.drawer.querySelector('[data-drawer-content]')
    const menuLinks = this.originalMenu.querySelectorAll('.mobile-nav-links')

    menuLinks.forEach(linksContainer => {
      // Clone the links container
      const clonedLinks = linksContainer.cloneNode(true)

      // Update link styles for drawer
      const links = clonedLinks.querySelectorAll('.mobile-nav-link')
      links.forEach(link => {
        // Remove old classes and add new ones
        link.className =
          'block py-3 px-4 text-gray-700 hover:bg-gray-50 hover:text-pink-600 rounded-lg transition-colors font-medium text-base'

        // Ensure minimum touch target size (44px)
        link.style.minHeight = '44px'
        link.style.display = 'flex'
        link.style.alignItems = 'center'
      })

      drawerContent.appendChild(clonedLinks)
    })
  }

  /**
   * Add CSS link for the mobile navigation styles
   * @returns {void}
   */
  addStylesLink() {
    // Check if styles link already exists
    if (document.getElementById('mobile-nav-styles-link')) {
      return
    }

    const link = document.createElement('link')
    link.id = 'mobile-nav-styles-link'
    link.rel = 'stylesheet'
    link.href = './css/mobile-nav.css'
    document.head.appendChild(link)
  }

  /**
   * Add event listeners for drawer interactions
   * @returns {void}
   */
  addEventListeners() {
    // Menu button click
    this.menuBtn.addEventListener('click', this.handleMenuBtnClick)

    // Overlay click
    this.overlay.addEventListener('click', this.handleOverlayClick)

    // Close button click
    this.closeBtn.addEventListener('click', () => this.close())

    // Keyboard events
    document.addEventListener('keydown', this.handleKeydown)

    // Android back button support
    window.addEventListener('popstate', this.handlePopstate)

    // Link clicks inside drawer
    this.drawer.addEventListener('click', this.handleLinkClick)

    // Focus trap inside drawer
    this.drawer.addEventListener('keydown', this.handleFocusTrap)
  }

  /**
   * Handle menu button click
   * @param {Event} event - Click event
   * @returns {void}
   */
  handleMenuBtnClick(event) {
    event.preventDefault()
    this.isOpen ? this.close() : this.open()
  }

  /**
   * Handle overlay click
   * @param {Event} event - Click event
   * @returns {void}
   */
  handleOverlayClick(event) {
    event.preventDefault()
    this.close()
  }

  /**
   * Handle keyboard events
   * @param {KeyboardEvent} event - Keyboard event
   * @returns {void}
   */
  handleKeydown(event) {
    if (!this.isOpen) {
      return
    }

    // ESC key closes drawer
    if (event.key === 'Escape') {
      event.preventDefault()
      this.close()
      this.menuBtn.focus()
    }
  }

  /**
   * Handle browser back button (Android support)
   * @param {PopStateEvent} event - Pop state event
   * @returns {void}
   */
  handlePopstate(event) {
    if (this.isOpen) {
      event.preventDefault()
      this.close()
    }
  }

  /**
   * Handle link clicks inside drawer
   * @param {Event} event - Click event
   * @returns {void}
   */
  handleLinkClick(event) {
    const link = event.target.closest('a')
    if (!link) {
      return
    }

    // Close drawer when navigating to a link
    // Allow a small delay for the click to register
    setTimeout(() => this.close(), 100)
  }

  /**
   * Handle focus trap within drawer
   * @param {KeyboardEvent} event - Keyboard event
   * @returns {void}
   */
  handleFocusTrap(event) {
    if (!this.isOpen) {
      return
    }

    if (event.key === 'Tab') {
      // Only update focusable elements if not cached or drawer content changed
      if (!this.focusableElements || this.focusableElements.length === 0) {
        this.updateFocusableElements()
      }

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === this.firstFocusableEl) {
          event.preventDefault()
          this.lastFocusableEl.focus()
        }
      } else {
        // Tab
        if (document.activeElement === this.lastFocusableEl) {
          event.preventDefault()
          this.firstFocusableEl.focus()
        }
      }
    }
  }

  /**
   * Update the list of focusable elements in the drawer
   * @returns {void}
   */
  updateFocusableElements() {
    // Get all focusable elements in drawer
    const focusableSelectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ')

    this.focusableElements = Array.from(this.drawer.querySelectorAll(focusableSelectors))

    // Set first and last focusable elements
    this.firstFocusableEl = this.focusableElements[0] || this.closeBtn
    this.lastFocusableEl =
      this.focusableElements[this.focusableElements.length - 1] || this.closeBtn
  }

  /**
   * Open the drawer
   * @returns {void}
   */
  open() {
    if (this.isOpen || this.isAnimating) {
      return
    }

    this.isAnimating = true

    // Update state
    this.isOpen = true
    this.historyStateAdded = true

    // Update ARIA attributes
    this.drawer.setAttribute('aria-hidden', 'false')
    this.overlay.setAttribute('aria-hidden', 'false')
    this.menuBtn.setAttribute('aria-expanded', 'true')

    // Add history state for Android back button support
    if (window.history && window.history.pushState) {
      window.history.pushState({ mobileNavOpen: true }, '', window.location.href)
    }

    // Update focusable elements (cache for performance)
    this.updateFocusableElements()

    // Add body scroll lock with scroll position preservation
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    document.body.classList.add('mobile-nav-open')
    // Store scroll position for restoration
    this.scrollPosition = scrollY

    // Show elements
    this.overlay.classList.add('mobile-nav-overlay-open')
    this.drawer.classList.add('mobile-nav-drawer-open')

    // Focus management
    requestAnimationFrame(() => {
      if (this.firstFocusableEl) {
        this.firstFocusableEl.focus()
      }
    })

    // Animation complete
    setTimeout(() => {
      this.isAnimating = false
    }, this.options.animationDuration)
  }

  /**
   * Close the drawer
   * @returns {void}
   */
  close() {
    if (!this.isOpen || this.isAnimating) {
      return
    }

    this.isAnimating = true

    // Update state
    this.isOpen = false
    this.historyStateAdded = false

    // Update ARIA attributes
    this.drawer.setAttribute('aria-hidden', 'true')
    this.overlay.setAttribute('aria-hidden', 'true')
    this.menuBtn.setAttribute('aria-expanded', 'false')

    // Remove history state for Android back button support
    if (window.history && window.history.back && this.historyStateAdded) {
      window.history.back()
      this.historyStateAdded = false
    }

    // Hide elements
    this.overlay.classList.remove('mobile-nav-overlay-open')
    this.drawer.classList.remove('mobile-nav-drawer-open')

    // Remove body scroll lock and restore scroll position
    document.body.classList.remove('mobile-nav-open')
    if (this.scrollPosition !== undefined) {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, this.scrollPosition)
      this.scrollPosition = undefined
    }

    // Return focus to menu button
    this.menuBtn.focus()

    // Animation complete
    setTimeout(() => {
      this.isAnimating = false
    }, this.options.animationDuration)
  }

  /**
   * Toggle the drawer open/closed state
   * @returns {void}
   */
  toggle() {
    this.isOpen ? this.close() : this.open()
  }

  /**
   * Check if the drawer is currently open
   * @returns {boolean} True if drawer is open
   */
  isOpenDrawer() {
    return this.isOpen
  }

  /**
   * Destroy the mobile navigation and clean up
   * @returns {void}
   */
  destroy() {
    // Close drawer if open
    if (this.isOpen) {
      this.close()
    }

    // Remove event listeners
    if (this.menuBtn) {
      this.menuBtn.removeEventListener('click', this.handleMenuBtnClick)
    }

    if (this.overlay) {
      this.overlay.removeEventListener('click', this.handleOverlayClick)
    }

    if (this.closeBtn) {
      this.closeBtn.removeEventListener('click', () => this.close())
    }

    document.removeEventListener('keydown', this.handleKeydown)
    window.removeEventListener('popstate', this.handlePopstate)

    if (this.drawer) {
      this.drawer.removeEventListener('click', this.handleLinkClick)
      this.drawer.removeEventListener('keydown', this.handleFocusTrap)
    }

    // Remove DOM elements
    if (this.overlay) {
      this.overlay.remove()
    }

    if (this.drawer) {
      this.drawer.remove()
    }

    // Remove styles link
    const stylesLink = document.getElementById('mobile-nav-styles-link')
    if (stylesLink) {
      stylesLink.remove()
    }

    // Show original menu
    if (this.originalMenu) {
      this.originalMenu.classList.remove('hidden')
    }

    // Clear references
    this.menuBtn = null
    this.originalMenu = null
    this.drawer = null
    this.overlay = null
    this.closeBtn = null
    this.focusableElements = []
    this.firstFocusableEl = null
    this.lastFocusableEl = null

    console.log('✅ MobileNav: Destroyed successfully')
  }
}

/**
 * Initialize the mobile navigation drawer
 * Convenience function that creates and initializes a MobileNav instance
 *
 * @param {Object} options - Configuration options for MobileNav
 * @returns {MobileNav} The initialized MobileNav instance
 *
 * @example
 * import { initMobileNav } from './js/components/mobileNav.js'
 *
 * // Initialize with default options
 * const mobileNav = initMobileNav()
 *
 * // Initialize with custom options
 * const mobileNav = initMobileNav({
 *   animationDuration: 400,
 *   drawerId: 'my-custom-drawer'
 * })
 */
export function initMobileNav(options = {}) {
  const mobileNav = new MobileNav(options)

  // Initialize on DOM ready
  onDOMReady(() => {
    try {
      mobileNav.init()
      // Initialize touch feedback for navigation links after mobile nav is ready
      initMobileNavTouchFeedback()
    } catch (error) {
      console.error('❌ initMobileNav failed:', error)
      throw error
    }
  })

  return mobileNav
}

/**
 * Initialize touch feedback for mobile navigation elements
 */
function initMobileNavTouchFeedback() {
  // Import TouchFeedback dynamically to avoid circular dependencies
  import('../shared/touchFeedback.js')
    .then(({ TouchFeedback }) => {
      // Add touch feedback to mobile navigation links
      const mobileNavLinks = document.querySelectorAll('.mobile-nav-link')
      mobileNavLinks.forEach(link => {
        const feedback = new TouchFeedback({
          type: 'highlight',
          haptic: 'light',
          duration: 200
        })
        feedback.init(link)
      })

      // Add touch feedback to overlay
      const overlay = document.querySelector('.mobile-nav-overlay')
      if (overlay) {
        const feedback = new TouchFeedback({
          type: 'highlight',
          haptic: 'none',
          duration: 150
        })
        feedback.init(overlay)
      }

      // Add touch feedback to drawer close button if it exists
      const drawerCloseBtn = document.querySelector('.drawer-close-btn')
      if (drawerCloseBtn) {
        const feedback = new TouchFeedback({
          type: 'scale',
          haptic: 'light',
          scale: 0.9,
          duration: 150
        })
        feedback.init(drawerCloseBtn)
      }

      console.log('✅ Touch feedback initialized for mobile navigation')
    })
    .catch(error => {
      console.warn('Could not initialize touch feedback for mobile navigation:', error)
    })
}

// Export default for convenience
export default MobileNav
