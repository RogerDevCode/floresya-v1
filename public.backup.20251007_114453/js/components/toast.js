/**
 * Toast Notification Component
 * Elegant, minimalist toast notifications
 */

/**
 * Toast types and their colors
 */
const TOAST_TYPES = {
  success: { bg: 'bg-green-500', icon: 'check-circle' },
  error: { bg: 'bg-red-500', icon: 'alert-circle' },
  warning: { bg: 'bg-yellow-500', icon: 'alert-triangle' },
  info: { bg: 'bg-blue-500', icon: 'info' }
}

/**
 * Container for all toasts
 */
let toastContainer = null

/**
 * Initialize toast container
 */
function initToastContainer() {
  if (toastContainer) {
    return toastContainer
  }

  toastContainer = document.createElement('div')
  toastContainer.id = 'toast-container'
  toastContainer.className =
    'fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full'
  document.body.appendChild(toastContainer)

  return toastContainer
}

/**
 * Show toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in ms (0 = no auto-dismiss)
 */
export function showToast(message, type = 'info', duration = 4000) {
  const container = initToastContainer()
  const config = TOAST_TYPES[type] || TOAST_TYPES.info

  // Create toast element
  const toast = document.createElement('div')
  toast.className = `${config.bg} text-white px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 pointer-events-auto transform transition-all duration-300 translate-x-full opacity-0`

  toast.innerHTML = `
    <i data-lucide="${config.icon}" class="h-5 w-5 flex-shrink-0 mt-0.5"></i>
    <p class="flex-1 text-sm font-medium">${message}</p>
    <button class="toast-close text-white/80 hover:text-white transition-colors flex-shrink-0">
      <i data-lucide="x" class="h-4 w-4"></i>
    </button>
  `

  // Add to container
  container.appendChild(toast)

  // Initialize icons
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons()
  }

  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-x-full', 'opacity-0')
  }, 10)

  // Close button
  const closeBtn = toast.querySelector('.toast-close')
  closeBtn.addEventListener('click', () => removeToast(toast))

  // Auto-dismiss
  if (duration > 0) {
    setTimeout(() => removeToast(toast), duration)
  }

  return toast
}

/**
 * Remove toast with animation
 * @param {HTMLElement} toast - Toast element to remove
 */
function removeToast(toast) {
  toast.classList.add('translate-x-full', 'opacity-0')
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast)
    }
  }, 300)
}

/**
 * Shorthand methods
 */
export const toast = {
  success: (message, duration) => showToast(message, 'success', duration),
  error: (message, duration) => showToast(message, 'error', duration),
  warning: (message, duration) => showToast(message, 'warning', duration),
  info: (message, duration) => showToast(message, 'info', duration)
}
