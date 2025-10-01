/**
 * DOM Helpers - SSOT for DOM manipulations
 * Reusable utilities for UI updates
 */

/**
 * Show error message in container
 * @param {string} message - Error message
 * @param {string} containerId - Container element ID
 * @throws {Error} If container not found (fail-fast)
 */
export function showError(message, containerId = 'error-container') {
  const container = document.getElementById(containerId)
  if (!container) {
    throw new Error(`Container ${containerId} not found`)
  }

  container.innerHTML = `
    <div class="alert alert-error">
      <span class="icon">⚠</span>
      <span>${message}</span>
    </div>
  `
  container.classList.remove('hidden')
}

/**
 * Show loading spinner in container
 * @param {string} containerId - Container element ID
 * @throws {Error} If container not found (fail-fast)
 */
export function showLoading(containerId = 'main') {
  const container = document.getElementById(containerId)
  if (!container) {
    throw new Error(`Container ${containerId} not found`)
  }

  container.innerHTML = `
    <div class="loading">
      <span class="spinner"></span>
      <p>Cargando...</p>
    </div>
  `
}

/**
 * Clear container content
 * @param {string} containerId - Container element ID
 * @throws {Error} If container not found (fail-fast)
 */
export function clearContainer(containerId) {
  const container = document.getElementById(containerId)
  if (!container) {
    throw new Error(`Container ${containerId} not found`)
  }
  container.innerHTML = ''
}

/**
 * Toggle element visibility
 * @param {string} elementId - Element ID
 * @param {boolean} show - Show or hide
 * @throws {Error} If element not found (fail-fast)
 */
export function toggleElement(elementId, show) {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error(`Element ${elementId} not found`)
  }

  if (show) {
    element.classList.remove('hidden')
  } else {
    element.classList.add('hidden')
  }
}
