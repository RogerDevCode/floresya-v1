/**
 * Touch Gestures Utility Library
 *
 * A comprehensive touch gesture detection utility for mobile web applications.
 * Provides swipe detection, velocity calculation, and gesture differentiation.
 *
 * Features:
 * - Horizontal and vertical swipe detection
 * - Velocity calculation for gesture intensity
 * - Touch cancellation handling
 * - Single and multi-touch support
 * - Configurable thresholds
 * - Tap detection
 * - Performant with passive event listeners
 *
 * @example
 * import { TouchGestures } from '.'
 *
 * // Initialize on an element
 * const gestures = new TouchGestures()
 * gestures.init(document.getElementById('carousel-container'))
 *
 * // Register callbacks
 * gestures.onSwipe((event) => {
 *   console.log(`Swiped ${event.direction} with velocity ${event.velocity}`)
 * })
 *
 * gestures.onTap((event) => {
 *   console.log('Tapped at', event.position)
 * })
 *
 * // Clean up when done
 * gestures.destroy()
 */
// @ts-nocheck

/**
 * TouchGestures class for detecting touch gestures
 */
export class TouchGestures {
  /**
   * Create a new TouchGestures instance
   * @param {Object} options - Configuration options
   * @param {number} options.swipeThreshold - Minimum distance for swipe detection (default: 50)
   * @param {number} options.velocityThreshold - Minimum velocity for swipe detection (default: 0.3)
   * @param {number} options.tapTimeout - Maximum time for tap detection (default: 300)
   * @param {number} options.tapThreshold - Maximum movement for tap detection (default: 10)
   * @param {boolean} options.preventDefault - Whether to prevent default on touchstart (default: false)
   * @param {boolean} options.passive - Whether to use passive event listeners (default: true)
   */
  constructor(options = {}) {
    // Configuration with defaults
    this.options = {
      swipeThreshold: options.swipeThreshold || 50,
      velocityThreshold: options.velocityThreshold || 0.3,
      tapTimeout: options.tapTimeout || 300,
      tapThreshold: options.tapThreshold || 10,
      preventDefault: options.preventDefault || false,
      passive: options.passive !== false, // Default to true
      ...options
    }

    // State management
    this.element = null
    this.isTracking = false
    this.startTime = 0
    this.startX = 0
    this.startY = 0
    this.endX = 0
    this.endY = 0
    this.touches = []
    this.tapTimer = null

    // Event callbacks
    this.swipeCallback = null
    this.tapCallback = null

    // Event handlers bound to this instance
    this.handleTouchStart = this.handleTouchStart.bind(this)
    this.handleTouchMove = this.handleTouchMove.bind(this)
    this.handleTouchEnd = this.handleTouchEnd.bind(this)
    this.handleTouchCancel = this.handleTouchCancel.bind(this)
  }

  /**
   * Initialize gesture detection on an element
   * @param {HTMLElement} element - Element to attach gesture detection to
   * @param {Object} options - Additional options to override defaults
   * @throws {Error} If element is not found
   * @returns {void}
   */
  init(element, options = {}) {
    try {
      if (!element) {
        throw new Error('TouchGestures: Element is required for initialization')
      }

      // Update options with any provided overrides
      this.options = { ...this.options, ...options }
      this.element = element

      // Add event listeners with passive option for performance
      const eventOptions = this.options.passive ? { passive: true } : false

      this.element.addEventListener('touchstart', this.handleTouchStart, eventOptions)
      this.element.addEventListener('touchmove', this.handleTouchMove, eventOptions)
      this.element.addEventListener('touchend', this.handleTouchEnd, eventOptions)
      this.element.addEventListener('touchcancel', this.handleTouchCancel, eventOptions)

      console.log('✅ TouchGestures: Initialized successfully')
    } catch (error) {
      console.error('❌ TouchGestures: Initialization failed:', error)
      throw error // Fail-fast: propagate error
    }
  }

  /**
   * Register callback for swipe events
   * @param {Function} callback - Function to call on swipe
   * @returns {void}
   */
  onSwipe(callback) {
    if (typeof callback !== 'function') {
      throw new Error('TouchGestures: Swipe callback must be a function')
    }
    this.swipeCallback = callback
  }

  /**
   * Register callback for tap events
   * @param {Function} callback - Function to call on tap
   * @returns {void}
   */
  onTap(callback) {
    if (typeof callback !== 'function') {
      throw new Error('TouchGestures: Tap callback must be a function')
    }
    this.tapCallback = callback
  }

  /**
   * Handle touch start event
   * @param {TouchEvent} event - Touch start event
   * @returns {void}
   */
  handleTouchStart(event) {
    // Prevent default if configured
    if (this.options.preventDefault) {
      event.preventDefault()
    }

    // Get the first touch point (handle multi-touch gracefully)
    const touch = event.touches[0]
    if (!touch) {
      return
    }

    // Start tracking
    this.isTracking = true
    this.startTime = Date.now()
    this.startX = touch.clientX
    this.startY = touch.clientY
    this.endX = touch.clientX
    this.endY = touch.clientY

    // Store all touch points for multi-touch support
    this.touches = Array.from(event.touches).map(t => ({
      id: t.identifier,
      x: t.clientX,
      y: t.clientY
    }))

    // Set up tap detection timer
    this.tapTimer = setTimeout(() => {
      this.tapTimer = null
    }, this.options.tapTimeout)
  }

  /**
   * Handle touch move event
   * @param {TouchEvent} event - Touch move event
   * @returns {void}
   */
  handleTouchMove(event) {
    if (!this.isTracking) {
      return
    }

    // Get the first touch point
    const touch = event.touches[0]
    if (!touch) {
      return
    }

    // Update end position
    this.endX = touch.clientX
    this.endY = touch.clientY

    // Update touch points for multi-touch support
    this.touches = Array.from(event.touches).map(t => ({
      id: t.identifier,
      x: t.clientX,
      y: t.clientY
    }))

    // Clear tap timer if movement exceeds threshold
    const deltaX = Math.abs(this.endX - this.startX)
    const deltaY = Math.abs(this.endY - this.startY)
    if (deltaX > this.options.tapThreshold || deltaY > this.options.tapThreshold) {
      if (this.tapTimer) {
        clearTimeout(this.tapTimer)
        this.tapTimer = null
      }
    }
  }

  /**
   * Handle touch end event
   * @param {TouchEvent} event - Touch end event
   * @returns {void}
   */
  handleTouchEnd(_event) {
    if (!this.isTracking) {
      return
    }

    // Calculate gesture metrics
    const deltaTime = Date.now() - this.startTime
    const deltaX = this.endX - this.startX
    const deltaY = this.endY - this.startY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const velocity = distance / deltaTime

    // Determine if it was a tap
    const wasTap =
      this.tapTimer !== null &&
      distance <= this.options.tapThreshold &&
      deltaTime <= this.options.tapTimeout

    // Clear tap timer
    if (this.tapTimer) {
      clearTimeout(this.tapTimer)
      this.tapTimer = null
    }

    // Handle tap
    if (wasTap && this.tapCallback) {
      this.tapCallback({
        type: 'tap',
        position: { x: this.endX, y: this.endY },
        timestamp: Date.now(),
        touches: this.touches.length
      })
    }
    // Handle swipe
    else if (
      distance >= this.options.swipeThreshold &&
      velocity >= this.options.velocityThreshold &&
      this.swipeCallback
    ) {
      const direction = this.getSwipeDirection(deltaX, deltaY)

      this.swipeCallback({
        type: 'swipe',
        direction,
        velocity,
        distance,
        deltaX,
        deltaY,
        duration: deltaTime,
        startPosition: { x: this.startX, y: this.startY },
        endPosition: { x: this.endX, y: this.endY },
        timestamp: Date.now(),
        touches: this.touches.length
      })
    }

    // Reset tracking state
    this.isTracking = false
    this.touches = []
  }

  /**
   * Handle touch cancel event
   * @param {TouchEvent} event - Touch cancel event
   * @returns {void}
   */
  handleTouchCancel(_event) {
    // Clear tap timer
    if (this.tapTimer) {
      clearTimeout(this.tapTimer)
      this.tapTimer = null
    }

    // Reset tracking state
    this.isTracking = false
    this.touches = []

    console.log('TouchGestures: Touch cancelled')
  }

  /**
   * Determine swipe direction based on delta values
   * @param {number} deltaX - Horizontal movement
   * @param {number} deltaY - Vertical movement
   * @returns {string} Direction: 'left', 'right', 'up', or 'down'
   */
  getSwipeDirection(deltaX, deltaY) {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left'
    } else {
      return deltaY > 0 ? 'down' : 'up'
    }
  }

  /**
   * Clean up event listeners and reset state
   * @returns {void}
   */
  destroy() {
    // Clear any pending tap timer
    if (this.tapTimer) {
      clearTimeout(this.tapTimer)
      this.tapTimer = null
    }

    // Remove event listeners if element exists
    if (this.element) {
      const eventOptions = this.options.passive ? { passive: true } : false

      this.element.removeEventListener('touchstart', this.handleTouchStart, eventOptions)
      this.element.removeEventListener('touchmove', this.handleTouchMove, eventOptions)
      this.element.removeEventListener('touchend', this.handleTouchEnd, eventOptions)
      this.element.removeEventListener('touchcancel', this.handleTouchCancel, eventOptions)
    }

    // Reset state
    this.element = null
    this.isTracking = false
    this.startTime = 0
    this.startX = 0
    this.startY = 0
    this.endX = 0
    this.endY = 0
    this.touches = []
    this.swipeCallback = null
    this.tapCallback = null

    console.log('✅ TouchGestures: Destroyed successfully')
  }
}

/**
 * Convenience function to create and initialize a TouchGestures instance
 * @param {HTMLElement} element - Element to attach gesture detection to
 * @param {Object} options - Configuration options
 * @returns {TouchGestures} The initialized TouchGestures instance
 *
 * @example
 * import { initTouchGestures } from '.'
 *
 * const gestures = initTouchGestures(document.getElementById('carousel'), {
 *   swipeThreshold: 60,
 *   velocityThreshold: 0.4
 * })
 *
 * gestures.onSwipe((event) => {
 *   if (event.direction === 'left') {
 *     // Show next slide
 *   }
 * })
 */
export function initTouchGestures(element, options = {}) {
  const gestures = new TouchGestures(options)
  gestures.init(element)
  return gestures
}

// Export default for convenience
export default TouchGestures
