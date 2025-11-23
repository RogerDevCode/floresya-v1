/**
 * Hamburger Menu Integration Example
 *
 * This example demonstrates how to integrate the HamburgerMenu component
 * with the MobileNav component for a complete mobile navigation experience.
 *
 * @example
 * // Include this script in your HTML page
 * <script type="module" src="/js/components/hamburgerMenu-example.js"></script>
 */
// @ts-nocheck

import { HamburgerMenu } from './hamburgerMenu.js'
import { MobileNav } from './mobileNav.js'
import { onDOMReady } from '../shared/dom-ready.js'

/**
 * Initialize integrated mobile navigation system
 * Combines hamburger menu with mobile navigation drawer
 */
function initIntegratedMobileNav() {
  try {
    console.log('🚀 Initializing integrated mobile navigation...')

    // Initialize mobile navigation drawer first
    const mobileNav = new MobileNav({
      menuBtnSelector: '#mobile-menu-btn', // This will be replaced by hamburger
      animationDuration: 300
    })

    // Initialize hamburger menu with custom configuration
    const hamburgerMenu = new HamburgerMenu({
      containerSelector: '.hamburger-container',
      buttonId: 'hamburger-menu-btn',
      animationDuration: 300,
      onToggle: isOpen => {
        // Sync hamburger state with mobile navigation
        if (isOpen) {
          mobileNav.open()
        } else {
          mobileNav.close()
        }
      }
    })

    // Initialize both components on DOM ready
    onDOMReady(() => {
      // Initialize mobile navigation
      mobileNav.init()

      // Initialize hamburger menu
      hamburgerMenu.init()

      // Replace the original menu button with hamburger menu
      replaceOriginalMenuButton(hamburgerMenu)

      // Set up bidirectional sync
      setupBidirectionalSync(hamburgerMenu, mobileNav)

      console.log('✅ Integrated mobile navigation initialized successfully')
    })

    // Return both components for external access if needed
    return {
      hamburgerMenu,
      mobileNav
    }
  } catch (error) {
    console.error('❌ Failed to initialize integrated mobile navigation:', error)
    throw error
  }
}

/**
 * Replace the original menu button with the hamburger menu
 * @param {HamburgerMenu} hamburgerMenu - The hamburger menu instance
 * @returns {void}
 */
function replaceOriginalMenuButton(hamburgerMenu) {
  const originalMenuBtn = document.querySelector('#mobile-menu-btn')
  const hamburgerContainer = document.querySelector('.hamburger-container')

  if (originalMenuBtn && hamburgerContainer) {
    // Hide original button but keep it for accessibility
    originalMenuBtn.setAttribute('aria-hidden', 'true')
    originalMenuBtn.style.display = 'none'

    // Update hamburger button to reference the mobile navigation
    const hamburgerBtn = hamburgerMenu.getButtonElement()
    hamburgerBtn.setAttribute('aria-controls', 'mobile-nav-drawer')

    console.log('✅ Original menu button replaced with hamburger menu')
  }
}

/**
 * Set up bidirectional synchronization between hamburger and mobile nav
 * @param {HamburgerMenu} hamburgerMenu - The hamburger menu instance
 * @param {MobileNav} mobileNav - The mobile navigation instance
 * @returns {void}
 */
function setupBidirectionalSync(hamburgerMenu, mobileNav) {
  // Listen for mobile navigation state changes
  const originalToggle = mobileNav.toggle

  mobileNav.toggle = function () {
    const result = originalToggle.call(this)

    // Sync hamburger state after mobile nav toggle
    if (this.isOpenDrawer() && !hamburgerMenu.isOpenMenu()) {
      hamburgerMenu.open()
    } else if (!this.isOpenDrawer() && hamburgerMenu.isOpenMenu()) {
      hamburgerMenu.close()
    }

    return result
  }

  // Override open and close methods for better sync
  const originalOpen = mobileNav.open
  const originalClose = mobileNav.close

  mobileNav.open = function () {
    originalOpen.call(this)
    if (!hamburgerMenu.isOpenMenu()) {
      hamburgerMenu.open()
    }
  }

  mobileNav.close = function () {
    originalClose.call(this)
    if (hamburgerMenu.isOpenMenu()) {
      hamburgerMenu.close()
    }
  }

  console.log('✅ Bidirectional synchronization set up')
}

/**
 * Create a demo HTML structure for testing
 * This function can be called to create a test environment
 * @returns {void}
 */
function createDemoStructure() {
  // Check if demo structure already exists
  if (document.querySelector('.mobile-nav-demo')) {
    return
  }

  const demo = document.createElement('div')
  demo.className = 'mobile-nav-demo'
  demo.innerHTML = `
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">FloresYa</h1>
          </div>
          
          <!-- Desktop Navigation (hidden on mobile) -->
          <nav class="hidden md:flex space-x-8">
            <a href="#" class="text-gray-700 hover:text-pink-600 px-3 py-2 text-sm font-medium">Inicio</a>
            <a href="#" class="text-gray-700 hover:text-pink-600 px-3 py-2 text-sm font-medium">Productos</a>
            <a href="#" class="text-gray-700 hover:text-pink-600 px-3 py-2 text-sm font-medium">Ocasiones</a>
            <a href="#" class="text-gray-700 hover:text-pink-600 px-3 py-2 text-sm font-medium">Contacto</a>
          </nav>
          
          <!-- Mobile Menu Container (for hamburger) -->
          <div class="hamburger-container md:hidden">
            <!-- Original mobile menu button (will be hidden) -->
            <button id="mobile-menu-btn" class="p-2 rounded-md text-gray-700 hover:text-pink-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Original Mobile Menu (will be hidden and moved to drawer) -->
    <div id="mobile-menu" class="md:hidden">
      <div class="mobile-nav-links">
        <a href="#" class="mobile-nav-link block px-3 py-2 text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50">Inicio</a>
        <a href="#" class="mobile-nav-link block px-3 py-2 text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50">Productos</a>
        <a href="#" class="mobile-nav-link block px-3 py-2 text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50">Ocasiones</a>
        <a href="#" class="mobile-nav-link block px-3 py-2 text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50">Contacto</a>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">Mobile Navigation Demo</h2>
        <p class="text-lg text-gray-600 mb-8">
          This is a demonstration of the integrated hamburger menu and mobile navigation drawer.
          Try clicking the hamburger menu button on mobile devices (or resize your browser window).
        </p>
        
        <div class="bg-pink-50 border border-pink-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 class="text-lg font-semibold text-pink-900 mb-2">Features Demonstrated:</h3>
          <ul class="text-left text-pink-800 space-y-1">
            <li>✅ Animated hamburger to X transformation</li>
            <li>✅ Smooth slide-in navigation drawer</li>
            <li>✅ Bidirectional state synchronization</li>
            <li>✅ Accessibility compliance (ARIA labels)</li>
            <li>✅ Touch-friendly interaction</li>
            <li>✅ Keyboard navigation support</li>
          </ul>
        </div>
      </div>
    </main>
  `

  // Insert demo structure at the beginning of body
  document.body.insertBefore(demo, document.body.firstChild)

  console.log('✅ Demo structure created')
}

/**
 * Initialize the demo when script is loaded
 */
function initDemo() {
  // Create demo structure if we're in a test environment
  if (document.body.children.length === 0) {
    createDemoStructure()
  }

  // Initialize the integrated mobile navigation
  const mobileNavSystem = initIntegratedMobileNav()

  // Make it available globally for testing
  window.mobileNavSystem = mobileNavSystem

  console.log('🎉 Hamburger Menu Demo Ready!')
  console.log('Try resizing your browser to mobile width and click the hamburger menu.')
}

// Auto-initialize when DOM is ready
onDOMReady(initDemo)

// Export for manual initialization
export {
  initIntegratedMobileNav,
  createDemoStructure,
  setupBidirectionalSync,
  replaceOriginalMenuButton
}

// Export default
export default initIntegratedMobileNav
