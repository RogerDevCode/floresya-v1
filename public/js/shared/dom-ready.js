/**
 * DOM Ready Utility - SSOT for safe DOM initialization
 * Ensures code executes only when DOM is fully loaded
 * CSP-compliant, no inline scripts needed
 *
 * Usage:
 * import { onDOMReady } from './js/shared/dom-ready.js'
 *
 * onDOMReady(() => {
 *   // Your initialization code here
 *   console.log('DOM is ready!')
 * })
 */

/**
 * Execute callback when DOM is ready
 * @param {Function} callback - Function to execute when DOM is ready
 * @returns {void}
 */
export function onDOMReady(callback) {
  if (!callback || typeof callback !== 'function') {
    throw new Error('onDOMReady: callback must be a function')
  }

  // Check if DOM is already loaded
  if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded event
    document.addEventListener('DOMContentLoaded', callback, { once: true })
  } else {
    // DOM is already loaded, execute callback immediately
    // Use microtask to ensure consistent async behavior
    queueMicrotask(callback)
  }
}

/**
 * Execute callback when DOM is ready AND all resources are loaded (images, styles, etc.)
 * @param {Function} callback - Function to execute when window is fully loaded
 * @returns {void}
 */
export function onWindowLoad(callback) {
  if (!callback || typeof callback !== 'function') {
    throw new Error('onWindowLoad: callback must be a function')
  }

  // Check if window is already loaded
  if (document.readyState === 'complete') {
    // Window is already loaded, execute callback immediately
    queueMicrotask(callback)
  } else {
    // Wait for load event
    window.addEventListener('load', callback, { once: true })
  }
}

/**
 * Execute multiple initialization functions in sequence
 * Useful for complex initialization chains
 * @param {...Function} callbacks - Functions to execute in order
 * @returns {Promise<void>}
 */
export function initSequence(...callbacks) {
  return new Promise((resolve, reject) => {
    onDOMReady(async () => {
      try {
        for (const callback of callbacks) {
          if (typeof callback === 'function') {
            await callback()
          }
        }
        resolve()
      } catch (error) {
        console.error('initSequence failed:', error)
        reject(error)
      }
    })
  })
}

/**
 * Check if DOM is currently ready
 * @returns {boolean} True if DOM is ready
 */
export function isDOMReady() {
  return document.readyState !== 'loading'
}

/**
 * Wait for a specific element to appear in the DOM
 * Useful for dynamic content
 * @param {string} selector - CSS selector to wait for
 * @param {number} timeout - Maximum time to wait in milliseconds (default: 5000)
 * @returns {Promise<Element>} The found element
 */
export function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    // Check if element already exists
    const element = document.querySelector(selector)
    if (element) {
      resolve(element)
      return
    }

    // Use MutationObserver to watch for element
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector)
      if (element) {
        observer.disconnect()
        clearTimeout(timeoutId)
        resolve(element)
      }
    })

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    // Set timeout
    const timeoutId = setTimeout(() => {
      observer.disconnect()
      reject(new Error(`Element "${selector}" not found within ${timeout}ms`))
    }, timeout)
  })
}

/**
 * Safe querySelector that waits for DOM ready
 * @param {string} selector - CSS selector
 * @returns {Promise<Element|null>} The found element or null
 */
export function safeQuerySelector(selector) {
  return new Promise(resolve => {
    onDOMReady(() => {
      const element = document.querySelector(selector)
      resolve(element)
    })
  })
}

/**
 * Safe querySelectorAll that waits for DOM ready
 * @param {string} selector - CSS selector
 * @returns {Promise<NodeList>} The found elements
 */
export function safeQuerySelectorAll(selector) {
  return new Promise(resolve => {
    onDOMReady(() => {
      const elements = document.querySelectorAll(selector)
      resolve(elements)
    })
  })
}

// Export default for convenience
export default {
  onDOMReady,
  onWindowLoad,
  initSequence,
  isDOMReady,
  waitForElement,
  safeQuerySelector,
  safeQuerySelectorAll
}
