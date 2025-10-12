/**
 * Animated Hamburger Menu Component
 *
 * A sophisticated animated hamburger menu button that transforms into an X when opened.
 * This component provides clear visual feedback about the state of the mobile navigation.
 *
 * Features:
 * - Three-line hamburger icon that smoothly transforms to an X
 * - Smooth CSS animations with hardware acceleration
 * - State management for open/closed states
 * - Touch targets >44px for mobile accessibility
 * - Proper ARIA attributes for screen readers
 * - Integration with mobile navigation components
 *
 * @example
 * import { HamburgerMenu } from './js/components/hamburgerMenu.js'
 *
 * // Initialize the hamburger menu
 * const hamburgerMenu = new HamburgerMenu()
 * hamburgerMenu.init()
 *
 * // Or use the convenience function
 * import { initHamburgerMenu } from './js/components/hamburgerMenu.js'
 * const hamburgerMenu = initHamburgerMenu()
 */

import { onDOMReady } from '../shared/dom-ready.js'

/**
 * Animated Hamburger Menu Class
 *
 * Implements a three-line hamburger menu that transforms into an X with smooth animations.
 * Follows MVC strict separation and accessibility best practices.
 */
export class HamburgerMenu {
  /**
   * Create a new HamburgerMenu instance
   * @param {Object} options - Configuration options
   * @param {string} options.containerSelector - Selector for button container (default: '.hamburger-container')
   * @param {string} options.buttonId - ID for the hamburger button (default: 'hamburger-menu-btn')
   * @param {number} options.animationDuration - Animation duration in ms (default: 300)
   * @param {string} options.activeClass - CSS class for active state (default: 'hamburger-active')
   * @param {Function} options.onToggle - Callback function when menu is toggled
   */
  constructor(options = {}) {
    // Configuration with defaults
    this.options = {
      containerSelector: options.containerSelector || '.hamburger-container',
      buttonId: options.buttonId || 'hamburger-menu-btn',
      animationDuration: options.animationDuration || 250,
      activeClass: options.activeClass || 'hamburger-active',
      onToggle: options.onToggle || null,
      ...options
    }

    // State management
    this.isOpen = false
    this.isAnimating = false

    // DOM element references
    this.container = null
    this.button = null
    this.spanElements = []

    // Event handlers bound to this instance
    this.handleClick = this.handleClick.bind(this)
    this.handleTouchStart = this.handleTouchStart.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)

    // Animation frame references
    this.animationFrame = null
  }

  /**
   * Initialize the hamburger menu
   * @throws {Error} If required elements are not found
   * @returns {void}
   */
  init() {
    try {
      // Find or create container
      this.container = document.querySelector(this.options.containerSelector)

      if (!this.container) {
        throw new Error(
          `HamburgerMenu: Container not found with selector "${this.options.containerSelector}"`
        )
      }

      // Create hamburger button
      this.createHamburgerButton()

      // Add event listeners
      this.addEventListeners()

      // Add CSS link
      this.addStylesLink()

      console.log('✅ HamburgerMenu: Initialized successfully')
    } catch (error) {
      console.error('❌ HamburgerMenu: Initialization failed:', error)
      throw error // Fail-fast: propagate error
    }
  }

  /**
   * Create the hamburger menu button DOM structure
   * @returns {void}
   */
  createHamburgerButton() {
    // Create button element
    this.button = document.createElement('button')
    this.button.id = this.options.buttonId
    this.button.className = 'hamburger-menu-button'
    this.button.setAttribute('type', 'button')
    this.button.setAttribute('aria-label', 'Abrir menú de navegación')
    this.button.setAttribute('aria-controls', 'mobile-nav-drawer')
    this.button.setAttribute('aria-expanded', 'false')
    this.button.setAttribute('data-hamburger-menu', '')

    // Create three span elements for the hamburger lines
    for (let i = 0; i < 3; i++) {
      const span = document.createElement('span')
      span.className = 'hamburger-line'
      span.setAttribute('aria-hidden', 'true')
      this.button.appendChild(span)
      this.spanElements.push(span)
    }

    // Add button to container
    this.container.appendChild(this.button)
  }

  /**
   * Add CSS link for the hamburger menu styles
   * @returns {void}
   */
  addStylesLink() {
    // Check if styles link already exists
    if (document.getElementById('hamburger-menu-styles-link')) {
      return
    }

    const link = document.createElement('link')
    link.id = 'hamburger-menu-styles-link'
    link.rel = 'stylesheet'
    link.href = './css/mobile-nav.css'
    document.head.appendChild(link)
  }

  /**
   * Add event listeners for hamburger menu interactions
   * @returns {void}
   */
  addEventListeners() {
    // Click events
    this.button.addEventListener('click', this.handleClick)

    // Touch events for better mobile experience
    this.button.addEventListener('touchstart', this.handleTouchStart, { passive: true })

    // Keyboard events
    this.button.addEventListener('keydown', this.handleKeyDown)
  }

  /**
   * Handle button click events
   * @param {Event} event - Click event
   * @returns {void}
   */
  handleClick(event) {
    event.preventDefault()
    this.toggle()
  }

  /**
   * Handle touch start events for mobile
   * @param {TouchEvent} event - Touch event
   * @returns {void}
   */
  handleTouchStart(_event) {
    // Provide immediate visual feedback on touch
    this.button.style.backgroundColor = 'rgba(236, 72, 153, 0.2)'

    // Remove highlight after touch ends
    const removeHighlight = () => {
      this.button.style.backgroundColor = ''
      document.removeEventListener('touchend', removeHighlight)
      document.removeEventListener('touchcancel', removeHighlight)
    }

    document.addEventListener('touchend', removeHighlight, { once: true })
    document.addEventListener('touchcancel', removeHighlight, { once: true })
  }

  /**
   * Handle keyboard events
   * @param {KeyboardEvent} event - Keyboard event
   * @returns {void}
   */
  handleKeyDown(event) {
    // Enter or Space key toggles the menu
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      this.toggle()
    }
  }

  /**
   * Toggle the hamburger menu open/closed state
   * @returns {void}
   */
  toggle() {
    if (this.isAnimating) {
      return
    }

    this.isOpen ? this.close() : this.open()
  }

  /**
   * Open the hamburger menu (activate state)
   * @returns {void}
   */
  open() {
    if (this.isOpen || this.isAnimating) {
      return
    }

    this.isAnimating = true
    this.isOpen = true

    // Update button state
    this.button.classList.add(this.options.activeClass)
    this.button.setAttribute('aria-expanded', 'true')
    this.button.setAttribute('aria-label', 'Cerrar menú de navegación')

    // Animation complete
    setTimeout(() => {
      this.isAnimating = false
    }, this.options.animationDuration)

    // Execute callback if provided
    if (typeof this.options.onToggle === 'function') {
      this.options.onToggle(true)
    }
  }

  /**
   * Close the hamburger menu (deactivate state)
   * @returns {void}
   */
  close() {
    if (!this.isOpen || this.isAnimating) {
      return
    }

    this.isAnimating = true
    this.isOpen = false

    // Update button state
    this.button.classList.remove(this.options.activeClass)
    this.button.setAttribute('aria-expanded', 'false')
    this.button.setAttribute('aria-label', 'Abrir menú de navegación')

    // Animation complete
    setTimeout(() => {
      this.isAnimating = false
    }, this.options.animationDuration)

    // Execute callback if provided
    if (typeof this.options.onToggle === 'function') {
      this.options.onToggle(false)
    }
  }

  /**
   * Check if the hamburger menu is currently open
   * @returns {boolean} True if menu is open
   */
  isOpenMenu() {
    return this.isOpen
  }

  /**
   * Check if the menu is currently animating
   * @returns {boolean} True if menu is animating
   */
  isMenuAnimating() {
    return this.isAnimating
  }

  /**
   * Set a callback function for when the menu is toggled
   * @param {Function} callback - Callback function
   * @returns {void}
   */
  setToggleCallback(callback) {
    if (typeof callback !== 'function') {
      throw new Error('HamburgerMenu: setToggleCallback requires a function')
    }
    this.options.onToggle = callback
  }

  /**
   * Get the button DOM element
   * @returns {HTMLButtonElement} The hamburger button element
   */
  getButtonElement() {
    return this.button
  }

  /**
   * Destroy the hamburger menu and clean up
   * @returns {void}
   */
  destroy() {
    // Remove event listeners
    if (this.button) {
      this.button.removeEventListener('click', this.handleClick)
      this.button.removeEventListener('touchstart', this.handleTouchStart)
      this.button.removeEventListener('keydown', this.handleKeyDown)
    }

    // Remove DOM elements
    if (this.button && this.button.parentNode) {
      this.button.parentNode.removeChild(this.button)
    }

    // Remove styles link
    const stylesLink = document.getElementById('hamburger-menu-styles-link')
    if (stylesLink) {
      stylesLink.remove()
    }

    // Clear references
    this.container = null
    this.button = null
    this.spanElements = []

    console.log('✅ HamburgerMenu: Destroyed successfully')
  }
}

/**
 * Initialize the hamburger menu
 * Convenience function that creates and initializes a HamburgerMenu instance
 *
 * @param {Object} options - Configuration options for HamburgerMenu
 * @returns {HamburgerMenu} The initialized HamburgerMenu instance
 *
 * @example
 * import { initHamburgerMenu } from './js/components/hamburgerMenu.js'
 *
 * // Initialize with default options
 * const hamburgerMenu = initHamburgerMenu()
 *
 * // Initialize with custom options
 * const hamburgerMenu = initHamburgerMenu({
 *   containerSelector: '.my-menu-container',
 *   animationDuration: 400,
 *   onToggle: (isOpen) => console.log('Menu is now:', isOpen ? 'open' : 'closed')
 * })
 */
export function initHamburgerMenu(options = {}) {
  const hamburgerMenu = new HamburgerMenu(options)

  // Initialize on DOM ready
  onDOMReady(() => {
    try {
      hamburgerMenu.init()
    } catch (error) {
      console.error('❌ initHamburgerMenu failed:', error)
      throw error
    }
  })

  return hamburgerMenu
}

// Export default for convenience
export default HamburgerMenu
