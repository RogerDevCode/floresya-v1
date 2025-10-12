/**
 * Touch Feedback Utility Library
 *
 * A comprehensive touch feedback system for mobile web applications.
 * Provides visual feedback for touch interactions with ripple effects,
 * haptic feedback, and customizable animations.
 *
 * Features:
 * - Ripple effect animations on touch
 * - Haptic feedback on capable devices
 * - Scale animations for touch feedback
 * - Different feedback types (tap, press, success, error)
 * - CSS custom properties for theming
 * - Accessibility support with reduced motion
 * - Touch-optimized interactions
 *
 * @example
 * import { TouchFeedback } from './js/shared/touchFeedback.js'
 *
 * // Initialize on an element
 * const feedback = new TouchFeedback()
 * feedback.init(document.getElementById('button'))
 *
 * // Or use the convenience function
 * const feedback = initTouchFeedback('#button', {
 *   type: 'ripple',
 *   haptic: 'light'
 * })
 */

/**
 * TouchFeedback class for managing touch interactions
 */
export class TouchFeedback {
  /**
   * Create a new TouchFeedback instance
   * @param {Object} options - Configuration options
   * @param {string} options.type - Type of feedback ('ripple', 'scale', 'highlight')
   * @param {string} options.haptic - Type of haptic feedback ('light', 'medium', 'heavy', 'success', 'error', 'none')
   * @param {number} options.duration - Animation duration in milliseconds (default: 300)
   * @param {string} options.color - Ripple color (default: currentColor)
   * @param {number} options.scale - Scale factor for scale animations (default: 0.95)
   * @param {boolean} options.respectReducedMotion - Respect user's motion preferences (default: true)
   * @param {boolean} options.passive - Use passive event listeners (default: true)
   */
  constructor(options = {}) {
    // Configuration with defaults
    this.options = {
      type: options.type || 'ripple',
      haptic: options.haptic || 'light',
      duration: options.duration || 300,
      color: options.color || 'currentColor',
      scale: options.scale || 0.95,
      respectReducedMotion: options.respectReducedMotion !== false, // Default to true
      passive: options.passive !== false, // Default to true
      ...options
    }

    // State management
    this.element = null
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.rippleElements = new Map() // Track ripple elements for cleanup

    // Event handlers bound to this instance
    this.handleTouchStart = this.handleTouchStart.bind(this)
    this.handleTouchEnd = this.handleTouchEnd.bind(this)
    this.handleTouchCancel = this.handleTouchCancel.bind(this)

    // Check for haptic feedback support
    this.hapticSupported = this.checkHapticSupport()
  }

  /**
   * Check if haptic feedback is supported
   * @returns {boolean} Whether haptic feedback is supported
   */
  checkHapticSupport() {
    return (
      'vibrate' in navigator ||
      // Check for newer haptic APIs
      (window.HapticFeedback && typeof window.HapticFeedback.impactOccurred === 'function') ||
      // Check for device-specific implementations
      (window.navigator && window.navigator.vibrate)
    )
  }

  /**
   * Trigger haptic feedback
   * @param {string} type - Type of haptic feedback
   * @returns {void}
   */
  triggerHapticFeedback(type = 'light') {
    if (!this.hapticSupported || this.options.haptic === 'none') {
      return
    }

    try {
      // Use newer haptic APIs if available
      if (window.HapticFeedback && typeof window.HapticFeedback.impactOccurred === 'function') {
        switch (type) {
          case 'light':
            window.HapticFeedback.impactOccurred('light')
            break
          case 'medium':
            window.HapticFeedback.impactOccurred('medium')
            break
          case 'heavy':
            window.HapticFeedback.impactOccurred('heavy')
            break
          case 'success':
            window.HapticFeedback.notificationOccurred('success')
            break
          case 'error':
            window.HapticFeedback.notificationOccurred('error')
            break
        }
      }
      // Fallback to vibration API
      else if ('vibrate' in navigator) {
        switch (type) {
          case 'light':
            navigator.vibrate(10)
            break
          case 'medium':
            navigator.vibrate(20)
            break
          case 'heavy':
            navigator.vibrate(30)
            break
          case 'success':
            navigator.vibrate([10, 50, 10])
            break
          case 'error':
            navigator.vibrate([50, 30, 50, 30, 50])
            break
        }
      }
    } catch (error) {
      console.warn('TouchFeedback: Haptic feedback failed:', error)
    }
  }

  /**
   * Initialize touch feedback on an element
   * @param {HTMLElement|string} element - Element or selector to attach feedback to
   * @param {Object} options - Additional options to override defaults
   * @throws {Error} If element is not found
   * @returns {void}
   */
  init(element, options = {}) {
    try {
      // Handle selector string
      if (typeof element === 'string') {
        element = document.querySelector(element)
      }

      if (!element) {
        throw new Error('TouchFeedback: Element is required for initialization')
      }

      // Update options with any provided overrides
      this.options = { ...this.options, ...options }
      this.element = element

      // Skip if not a touch device and reduced motion is preferred
      if (!this.isTouchDevice && this.options.respectReducedMotion) {
        console.log('TouchFeedback: Skipping initialization on non-touch device')
        return
      }

      // Skip if reduced motion is preferred
      if (this.isReducedMotion && this.options.respectReducedMotion) {
        console.log('TouchFeedback: Skipping initialization due to reduced motion preference')
        return
      }

      // Add touch feedback class to element
      this.element.classList.add('touch-feedback')
      this.element.classList.add(`touch-feedback--${this.options.type}`)

      // Add event listeners with passive option for performance
      const eventOptions = this.options.passive ? { passive: true } : false

      this.element.addEventListener('touchstart', this.handleTouchStart, eventOptions)
      this.element.addEventListener('touchend', this.handleTouchEnd, eventOptions)
      this.element.addEventListener('touchcancel', this.handleTouchCancel, eventOptions)

      // Also handle mouse events for desktop testing
      if (!this.isTouchDevice) {
        this.element.addEventListener('mousedown', this.handleTouchStart, eventOptions)
        this.element.addEventListener('mouseup', this.handleTouchEnd, eventOptions)
        this.element.addEventListener('mouseleave', this.handleTouchCancel, eventOptions)
      }

      console.log('✅ TouchFeedback: Initialized successfully')
    } catch (error) {
      console.error('❌ TouchFeedback: Initialization failed:', error)
      throw error // Fail-fast: propagate error
    }
  }

  /**
   * Handle touch start event
   * @param {TouchEvent|MouseEvent} event - Touch start event
   * @returns {void}
   */
  handleTouchStart(event) {
    // Prevent default if needed for certain feedback types
    if (this.options.type === 'ripple') {
      // Don't prevent default for ripple to allow normal interactions
    }

    // Add active state class
    this.element.classList.add('touch-feedback--active')

    // Trigger appropriate feedback based on type
    switch (this.options.type) {
      case 'ripple':
        this.createRipple(event)
        break
      case 'scale':
        this.applyScale()
        break
      case 'highlight':
        this.applyHighlight()
        break
    }

    // Trigger haptic feedback
    this.triggerHapticFeedback(this.options.haptic)
  }

  /**
   * Handle touch end event
   * @param {TouchEvent|MouseEvent} event - Touch end event
   * @returns {void}
   */
  handleTouchEnd(_event) {
    // Remove active state class
    this.element.classList.remove('touch-feedback--active')

    // Clean up based on type
    switch (this.options.type) {
      case 'ripple':
        this.cleanupRipple()
        break
      case 'scale':
        this.removeScale()
        break
      case 'highlight':
        this.removeHighlight()
        break
    }
  }

  /**
   * Handle touch cancel event
   * @param {TouchEvent|MouseEvent} event - Touch cancel event
   * @returns {void}
   */
  handleTouchCancel(_event) {
    // Remove active state class
    this.element.classList.remove('touch-feedback--active')

    // Clean up all feedback types
    this.cleanupRipple()
    this.removeScale()
    this.removeHighlight()
  }

  /**
   * Create ripple effect at touch position
   * @param {TouchEvent|MouseEvent} event - Touch event
   * @returns {void}
   */
  createRipple(event) {
    // Get touch/mouse position relative to element
    const rect = this.element.getBoundingClientRect()
    let x, y

    if (event.touches && event.touches.length > 0) {
      x = event.touches[0].clientX - rect.left
      y = event.touches[0].clientY - rect.top
    } else if (event.clientX && event.clientY) {
      x = event.clientX - rect.left
      y = event.clientY - rect.top
    } else {
      // Fallback to center
      x = rect.width / 2
      y = rect.height / 2
    }

    // Create ripple element
    const ripple = document.createElement('span')
    ripple.className = 'touch-ripple'

    // Calculate ripple size (largest dimension of the element)
    const size = Math.max(rect.width, rect.height) * 2
    ripple.style.width = ripple.style.height = size + 'px'
    ripple.style.left = x - size / 2 + 'px'
    ripple.style.top = y - size / 2 + 'px'
    ripple.style.backgroundColor = this.options.color

    // Add to element
    this.element.appendChild(ripple)
    this.rippleElements.set(ripple, true)

    // Trigger reflow for animation
    ripple.offsetHeight

    // Add active class for animation
    ripple.classList.add('touch-ripple--active')

    // Set up cleanup timer
    setTimeout(() => {
      this.removeRipple(ripple)
    }, this.options.duration)
  }

  /**
   * Remove a specific ripple element
   * @param {HTMLElement} ripple - Ripple element to remove
   * @returns {void}
   */
  removeRipple(ripple) {
    if (ripple && ripple.parentNode && this.rippleElements.has(ripple)) {
      ripple.classList.add('touch-ripple--removing')

      // Wait for removal animation
      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple)
        }
        this.rippleElements.delete(ripple)
      }, 200)
    }
  }

  /**
   * Clean up all ripples
   * @returns {void}
   */
  cleanupRipple() {
    this.rippleElements.forEach((_, ripple) => {
      this.removeRipple(ripple)
    })
  }

  /**
   * Apply scale transformation
   * @returns {void}
   */
  applyScale() {
    this.element.style.transform = `scale(${this.options.scale})`
  }

  /**
   * Remove scale transformation
   * @returns {void}
   */
  removeScale() {
    this.element.style.transform = ''
  }

  /**
   * Apply highlight effect
   * @returns {void}
   */
  applyHighlight() {
    this.element.style.backgroundColor = 'rgba(236, 72, 153, 0.1)'
    this.element.style.borderColor = 'var(--floresya-primary)'
  }

  /**
   * Remove highlight effect
   * @returns {void}
   */
  removeHighlight() {
    this.element.style.backgroundColor = ''
    this.element.style.borderColor = ''
  }

  /**
   * Trigger a specific feedback type programmatically
   * @param {string} type - Type of feedback to trigger ('success', 'error', 'warning')
   * @returns {void}
   */
  triggerFeedback(type = 'success') {
    // Add specific feedback class
    this.element.classList.add(`touch-feedback--${type}`)

    // Trigger corresponding haptic feedback
    this.triggerHapticFeedback(type)

    // Remove class after animation
    setTimeout(() => {
      this.element.classList.remove(`touch-feedback--${type}`)
    }, this.options.duration)
  }

  /**
   * Clean up event listeners and reset state
   * @returns {void}
   */
  destroy() {
    // Clean up any active ripples
    this.cleanupRipple()

    // Remove event listeners if element exists
    if (this.element) {
      const eventOptions = this.options.passive ? { passive: true } : false

      this.element.removeEventListener('touchstart', this.handleTouchStart, eventOptions)
      this.element.removeEventListener('touchend', this.handleTouchEnd, eventOptions)
      this.element.removeEventListener('touchcancel', this.handleTouchCancel, eventOptions)

      // Also remove mouse events
      this.element.removeEventListener('mousedown', this.handleTouchStart, eventOptions)
      this.element.removeEventListener('mouseup', this.handleTouchEnd, eventOptions)
      this.element.removeEventListener('mouseleave', this.handleTouchCancel, eventOptions)

      // Remove feedback classes
      this.element.classList.remove('touch-feedback')
      this.element.classList.remove(`touch-feedback--${this.options.type}`)
      this.element.classList.remove('touch-feedback--active')

      // Reset styles
      this.element.style.transform = ''
      this.element.style.backgroundColor = ''
      this.element.style.borderColor = ''
    }

    // Reset state
    this.element = null

    console.log('✅ TouchFeedback: Destroyed successfully')
  }
}

/**
 * Convenience function to create and initialize a TouchFeedback instance
 * @param {HTMLElement|string} element - Element or selector to attach feedback to
 * @param {Object} options - Configuration options
 * @returns {TouchFeedback} The initialized TouchFeedback instance
 *
 * @example
 * import { initTouchFeedback } from './js/shared/touchFeedback.js'
 *
 * // Initialize with default settings
 * const feedback = initTouchFeedback('#my-button')
 *
 * // Initialize with custom settings
 * const feedback = initTouchFeedback('.product-card', {
 *   type: 'scale',
 *   haptic: 'medium',
 *   duration: 250
 * })
 *
 * // Trigger success feedback
 * feedback.triggerFeedback('success')
 */
export function initTouchFeedback(element, options = {}) {
  const feedback = new TouchFeedback(options)
  feedback.init(element)
  return feedback
}

/**
 * Initialize touch feedback on multiple elements matching a selector
 * @param {string} selector - CSS selector for elements
 * @param {Object} options - Configuration options
 * @returns {TouchFeedback[]} Array of initialized TouchFeedback instances
 *
 * @example
 * import { initTouchFeedbackOnAll } from './js/shared/touchFeedback.js'
 *
 * // Initialize on all buttons
 * const feedbacks = initTouchFeedbackOnAll('button', {
 *   type: 'ripple',
 *   haptic: 'light'
 * })
 */
export function initTouchFeedbackOnAll(selector, options = {}) {
  const elements = document.querySelectorAll(selector)
  const feedbacks = []

  elements.forEach(element => {
    const feedback = new TouchFeedback(options)
    feedback.init(element)
    feedbacks.push(feedback)
  })

  return feedbacks
}

// Export default for convenience
export default TouchFeedback
