/**
 * PullToRefresh Component
 *
 * A modern pull-to-refresh component for product listings that uses TouchGestures
 * to detect vertical pull gestures and provides visual feedback during refresh.
 *
 * Features:
 * - Configurable pull threshold to trigger refresh
 * - Smooth animation of the refresh indicator
 * - Haptic feedback when threshold is reached (if supported)
 * - Automatic dismissal after refresh completes
 * - Error handling with user feedback
 * - Only activates on touch devices
 * - Respects reduced motion preferences
 *
 * @example
 * import { PullToRefresh } from './js/components/pullToRefresh.js'
 *
 * const pullToRefresh = new PullToRefresh({
 *   container: document.getElementById('productsContainer'),
 *   onRefresh: async () => {
 *     // Fetch fresh data
 *     await loadProducts();
 *   }
 * });
 */

import { TouchGestures } from '../shared/touchGestures.js'

export class PullToRefresh {
  /**
   * Create a new PullToRefresh instance
   * @param {Object} options - Configuration options
   * @param {HTMLElement} options.container - The container element to attach pull-to-refresh to
   * @param {Function} options.onRefresh - Callback function to execute when refresh is triggered
   * @param {number} options.threshold - Pull distance threshold in pixels (default: 80)
   * @param {number} options.maxPull - Maximum pull distance in pixels (default: 120)
   * @param {boolean} options.hapticFeedback - Enable haptic feedback (default: true)
   * @param {boolean} options.respectReducedMotion - Respect prefers-reduced-motion (default: true)
   */
  constructor(options = {}) {
    // Validate required options
    if (!options.container) {
      throw new Error('PullToRefresh: container element is required')
    }

    if (typeof options.onRefresh !== 'function') {
      throw new Error('PullToRefresh: onRefresh callback is required')
    }

    // Configuration
    this.options = {
      threshold: options.threshold || 80,
      maxPull: options.maxPull || 120,
      hapticFeedback: options.hapticFeedback !== false,
      respectReducedMotion: options.respectReducedMotion !== false,
      ...options
    }

    // State
    this.container = options.container
    this.onRefresh = options.onRefresh
    this.isEnabled = true
    this.isRefreshing = false
    this.isPulling = false
    this.pullDistance = 0
    this.startY = 0
    this.currentY = 0
    this.touchGestures = null
    this.indicator = null
    this.spinner = null
    this.statusText = null

    // Detect if reduced motion is preferred
    this.prefersReducedMotion =
      this.options.respectReducedMotion &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Check if touch device
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    // Initialize
    this.init()
  }

  /**
   * Initialize the pull-to-refresh component
   */
  init() {
    if (!this.isTouchDevice) {
      console.log('PullToRefresh: Touch device not detected, disabling')
      return
    }

    this.createIndicator()
    this.setupTouchGestures()
    this.bindEvents()

    console.log('✅ PullToRefresh: Initialized successfully')
  }

  /**
   * Create the visual indicator element
   */
  createIndicator() {
    try {
      // Create main indicator container
      this.indicator = document.createElement('div')
      this.indicator.className = 'pull-to-refresh-indicator'
      this.indicator.setAttribute('aria-live', 'polite')
      this.indicator.setAttribute('aria-label', 'Pull to refresh')

      // Create spinner
      this.spinner = document.createElement('div')
      this.spinner.className = 'pull-to-refresh-spinner'
      this.spinner.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="31.416" stroke-dashoffset="31.416" class="spinner-path"/>
      </svg>
    `

      // Create status text
      this.statusText = document.createElement('div')
      this.statusText.className = 'pull-to-refresh-text'
      this.statusText.textContent = 'Pull to refresh'

      // Assemble indicator
      this.indicator.appendChild(this.spinner)
      this.indicator.appendChild(this.statusText)

      // Insert at the beginning of container
      this.container.prepend(this.indicator)

      // Initially hide the indicator
      this.hideIndicator()
    } catch (error) {
      console.error('PullToRefresh: Failed to create indicator', error)
      throw new Error(`PullToRefresh: Failed to create indicator: ${error.message}`)
    }
  }

  /**
   * Setup touch gestures using TouchGestures utility
   */
  setupTouchGestures() {
    try {
      // Create a wrapper element for gesture detection
      this.gestureWrapper = document.createElement('div')
      this.gestureWrapper.style.position = 'relative'
      this.gestureWrapper.style.overflow = 'hidden'

      // Wrap the container content
      const containerContent = this.container.innerHTML
      this.container.innerHTML = ''
      this.container.appendChild(this.gestureWrapper)
      this.gestureWrapper.innerHTML = containerContent

      // Initialize TouchGestures
      this.touchGestures = new TouchGestures({
        swipeThreshold: 0, // We'll handle pull detection manually
        velocityThreshold: 0,
        preventDefault: false,
        passive: true
      })

      // We'll use custom touch handling for more control
      this.handleTouchStart = this.handleTouchStart.bind(this)
      this.handleTouchMove = this.handleTouchMove.bind(this)
      this.handleTouchEnd = this.handleTouchEnd.bind(this)

      // Add touch event listeners to the container
      this.container.addEventListener('touchstart', this.handleTouchStart, { passive: true })
      this.container.addEventListener('touchmove', this.handleTouchMove, { passive: false })
      this.container.addEventListener('touchend', this.handleTouchEnd, { passive: true })
      this.container.addEventListener('touchcancel', this.handleTouchEnd, { passive: true })
    } catch (error) {
      console.error('PullToRefresh: Failed to setup touch gestures', error)
      throw new Error(`PullToRefresh: Failed to setup touch gestures: ${error.message}`)
    }
  }

  /**
   * Bind additional events
   */
  bindEvents() {
    // Listen for reduced motion preference changes
    if (this.options.respectReducedMotion) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      mediaQuery.addEventListener('change', e => {
        this.prefersReducedMotion = e.matches
      })
    }
  }

  /**
   * Handle touch start event
   * @param {TouchEvent} event - Touch start event
   */
  handleTouchStart(event) {
    try {
      if (!this.isEnabled || this.isRefreshing) {
        return
      }

      // Only activate if at the top of the container
      if (this.container.scrollTop > 0) {
        return
      }

      // Validate touch event
      if (!event.touches || event.touches.length === 0) {
        console.warn('PullToRefresh: Invalid touch start event')
        return
      }

      const touch = event.touches[0]
      if (!touch || typeof touch.clientY !== 'number') {
        console.warn('PullToRefresh: Invalid touch coordinates')
        return
      }

      this.startY = touch.clientY
      this.isPulling = false
    } catch (error) {
      console.error('PullToRefresh: Error in touch start handler', error)
    }
  }

  /**
   * Handle touch move event
   * @param {TouchEvent} event - Touch move event
   */
  handleTouchMove(event) {
    try {
      if (!this.isEnabled || this.isRefreshing) {
        return
      }

      // Only process if we're tracking a pull gesture
      if (this.startY === 0) {
        return
      }

      // Validate touch event
      if (!event.touches || event.touches.length === 0) {
        return
      }

      const touch = event.touches[0]
      if (!touch || typeof touch.clientY !== 'number') {
        return
      }

      this.currentY = touch.clientY

      // Calculate pull distance (only allow pulling down)
      this.pullDistance = Math.max(0, this.currentY - this.startY)

      // Only start pulling if we're moving down and at the top
      if (this.pullDistance > 5 && this.container.scrollTop <= 0) {
        this.isPulling = true

        // Prevent default to stop page scroll
        event.preventDefault()

        // Update the indicator based on pull distance
        this.updateIndicator()

        // Check if threshold is reached
        if (this.pullDistance >= this.options.threshold && !this.thresholdReached) {
          this.thresholdReached = true
          this.onThresholdReached()
        } else if (this.pullDistance < this.options.threshold && this.thresholdReached) {
          this.thresholdReached = false
          this.onThresholdReleased()
        }
      }
    } catch (error) {
      console.error('PullToRefresh: Error in touch move handler', error)
      // Reset state on error to prevent stuck UI
      this.resetTouchState()
    }
  }

  /**
   * Handle touch end event
   * @param {TouchEvent} event - Touch end event
   */
  handleTouchEnd(_event) {
    if (!this.isPulling) {
      return
    }

    // Reset state
    this.isPulling = false
    this.startY = 0
    this.currentY = 0
    this.thresholdReached = false

    // Check if we should trigger refresh
    if (this.pullDistance >= this.options.threshold && !this.isRefreshing) {
      this.triggerRefresh()
    } else {
      // Animate back to hidden state
      this.hideIndicator()
    }

    this.pullDistance = 0
  }

  /**
   * Reset touch state
   */
  resetTouchState() {
    this.isPulling = false
    this.startY = 0
    this.currentY = 0
    this.pullDistance = 0
    this.thresholdReached = false
  }

  /**
   * Update the indicator based on current pull distance
   */
  updateIndicator() {
    if (!this.indicator) {
      return
    }

    // Calculate progress (0 to 1)
    const progress = Math.min(1, this.pullDistance / this.options.threshold)

    // Calculate height based on pull distance, capped at maxPull
    const height = Math.min(this.pullDistance, this.options.maxPull)

    // Update indicator styles
    this.indicator.style.height = `${height}px`
    this.indicator.style.opacity = progress

    // Update spinner rotation based on progress
    if (this.spinner) {
      const rotation = progress * 360
      this.spinner.style.transform = `rotate(${rotation}deg)`
    }

    // Update status text
    if (this.statusText) {
      if (progress >= 1) {
        this.statusText.textContent = 'Release to refresh'
      } else {
        this.statusText.textContent = 'Pull to refresh'
      }
    }

    // Apply resistance effect
    if (this.pullDistance > this.options.threshold) {
      const resistance =
        1 -
        ((this.pullDistance - this.options.threshold) /
          (this.options.maxPull - this.options.threshold)) *
          0.5
      this.indicator.style.transform = `scaleY(${resistance})`
    } else {
      this.indicator.style.transform = 'scaleY(1)'
    }
  }

  /**
   * Called when the pull threshold is reached
   */
  onThresholdReached() {
    // Add visual feedback
    this.indicator.classList.add('threshold-reached')

    // Provide haptic feedback if supported
    if (this.options.hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }

  /**
   * Called when the pull threshold is released
   */
  onThresholdReleased() {
    // Remove visual feedback
    this.indicator.classList.remove('threshold-reached')
  }

  /**
   * Trigger the refresh action
   */
  async triggerRefresh() {
    if (this.isRefreshing) {
      return
    }

    try {
      this.isRefreshing = true
      this.indicator.classList.add('refreshing')
      this.statusText.textContent = 'Refreshing...'

      // Start spinner animation
      this.startSpinnerAnimation()

      // Validate refresh callback
      if (typeof this.onRefresh !== 'function') {
        throw new Error('Refresh callback is not a function')
      }

      // Call the refresh callback with timeout
      const refreshPromise = this.onRefresh()
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Refresh timeout')), 10000)
      )

      await Promise.race([refreshPromise, timeoutPromise])

      // Show success state
      this.showSuccessState()

      // Hide after success delay
      setTimeout(() => {
        this.hideIndicator()
        this.isRefreshing = false
      }, 1000)
    } catch (error) {
      console.error('PullToRefresh: Refresh failed', error)

      // Show error state with user-friendly message
      let errorMessage = 'Failed to refresh'
      if (error.message === 'Refresh timeout') {
        errorMessage = 'Request timed out'
      } else if (error.name === 'NetworkError' || error.message.includes('network')) {
        errorMessage = 'Network error'
      } else if (error.message) {
        errorMessage = error.message
      }

      this.showErrorState(errorMessage)

      // Hide after error delay
      setTimeout(() => {
        this.hideIndicator()
        this.isRefreshing = false
      }, 2000)
    }
  }

  /**
   * Start the spinner animation
   */
  startSpinnerAnimation() {
    if (this.prefersReducedMotion) {
      return
    }

    if (this.spinner) {
      this.spinner.classList.add('spinning')
    }
  }

  /**
   * Stop the spinner animation
   */
  stopSpinnerAnimation() {
    if (this.spinner) {
      this.spinner.classList.remove('spinning')
    }
  }

  /**
   * Show success state
   */
  showSuccessState() {
    this.stopSpinnerAnimation()
    this.indicator.classList.add('success')
    this.statusText.textContent = 'Updated!'

    // Provide haptic feedback if supported
    if (this.options.hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate([10, 50, 10])
    }
  }

  /**
   * Show error state
   * @param {string} message - Error message to display
   */
  showErrorState(message) {
    this.stopSpinnerAnimation()
    this.indicator.classList.add('error')
    this.statusText.textContent = message || 'Failed to refresh'

    // Provide haptic feedback if supported
    if (this.options.hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate([50, 30, 50])
    }
  }

  /**
   * Hide the indicator with animation
   */
  hideIndicator() {
    if (!this.indicator) {
      return
    }

    this.stopSpinnerAnimation()

    // Reset classes
    this.indicator.classList.remove('refreshing', 'success', 'error', 'threshold-reached')

    // Animate to hidden state
    if (!this.prefersReducedMotion) {
      this.indicator.style.transition = 'height 0.3s ease-out, opacity 0.3s ease-out'

      setTimeout(() => {
        this.indicator.style.height = '0px'
        this.indicator.style.opacity = '0'
      }, 10)

      setTimeout(() => {
        this.indicator.style.transition = ''
      }, 310)
    } else {
      this.indicator.style.height = '0px'
      this.indicator.style.opacity = '0'
    }
  }

  /**
   * Show the indicator
   */
  showIndicator() {
    if (!this.indicator) {
      return
    }

    if (!this.prefersReducedMotion) {
      this.indicator.style.transition = 'height 0.3s ease-out, opacity 0.3s ease-out'
    }

    this.indicator.style.height = '60px'
    this.indicator.style.opacity = '1'

    setTimeout(() => {
      this.indicator.style.transition = ''
    }, 310)
  }

  /**
   * Enable pull-to-refresh
   */
  enable() {
    this.isEnabled = true
    console.log('PullToRefresh: Enabled')
  }

  /**
   * Disable pull-to-refresh
   */
  disable() {
    this.isEnabled = false
    this.hideIndicator()
    console.log('PullToRefresh: Disabled')
  }

  /**
   * Check if component is enabled
   * @returns {boolean} True if enabled
   */
  get enabled() {
    return this.isEnabled
  }

  /**
   * Check if component is currently refreshing
   * @returns {boolean} True if refreshing
   */
  get refreshing() {
    return this.isRefreshing
  }

  /**
   * Destroy the component and clean up
   */
  destroy() {
    // Remove event listeners
    if (this.container) {
      this.container.removeEventListener('touchstart', this.handleTouchStart)
      this.container.removeEventListener('touchmove', this.handleTouchMove)
      this.container.removeEventListener('touchend', this.handleTouchEnd)
      this.container.removeEventListener('touchcancel', this.handleTouchEnd)
    }

    // Destroy TouchGestures instance
    if (this.touchGestures) {
      this.touchGestures.destroy()
    }

    // Remove indicator element
    if (this.indicator && this.indicator.parentNode) {
      this.indicator.parentNode.removeChild(this.indicator)
    }

    // Restore original container content
    if (this.gestureWrapper && this.container) {
      const content = this.gestureWrapper.innerHTML
      this.container.innerHTML = content
    }

    // Reset state
    this.isEnabled = false
    this.isRefreshing = false
    this.isPulling = false
    this.pullDistance = 0
    this.startY = 0
    this.currentY = 0

    console.log('PullToRefresh: Destroyed')
  }
}

/**
 * Convenience function to create and initialize a PullToRefresh instance
 * @param {Object} options - Configuration options
 * @returns {PullToRefresh} The initialized PullToRefresh instance
 */
export function initPullToRefresh(options = {}) {
  return new PullToRefresh(options)
}

export default PullToRefresh
