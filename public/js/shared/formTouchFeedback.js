/**
 * Form Touch Feedback Utility
 *
 * A comprehensive touch feedback system for form elements including inputs,
 * selects, textareas, and form buttons. Enhances mobile form experience
 * with visual and haptic feedback.
 *
 * Features:
 * - Touch feedback for all form elements
 * - Input focus animations
 * - Validation feedback animations
 * - Haptic feedback for form interactions
 * - Accessibility support with reduced motion
 *
 * @example
 * import { initFormTouchFeedback } from './js/shared/formTouchFeedback.js'
 *
 * // Initialize touch feedback for all forms
 * initFormTouchFeedback()
 *
 * // Or initialize for specific form
 * initFormTouchFeedback('#contact-form')
 */

import { TouchFeedback } from './touchFeedback.js'

/**
 * Initialize touch feedback for form elements
 * @param {string} formSelector - CSS selector for forms to enhance (default: 'form')
 * @param {Object} options - Configuration options
 * @returns {void}
 */
export function initFormTouchFeedback(formSelector = 'form', options = {}) {
  const forms = document.querySelectorAll(formSelector)

  forms.forEach(form => {
    // Initialize touch feedback for text inputs
    const textInputs = form.querySelectorAll(
      'input[type="text"], input[type="email"], input[type="tel"], input[type="search"], input[type="password"], input[type="number"]'
    )
    textInputs.forEach(input => {
      initInputTouchFeedback(input, options)
    })

    // Initialize touch feedback for textareas
    const textareas = form.querySelectorAll('textarea')
    textareas.forEach(textarea => {
      initInputTouchFeedback(textarea, options)
    })

    // Initialize touch feedback for select elements
    const selects = form.querySelectorAll('select')
    selects.forEach(select => {
      initSelectTouchFeedback(select, options)
    })

    // Initialize touch feedback for checkboxes and radio buttons
    const checkboxes = form.querySelectorAll('input[type="checkbox"]')
    checkboxes.forEach(checkbox => {
      initCheckboxTouchFeedback(checkbox, options)
    })

    const radios = form.querySelectorAll('input[type="radio"]')
    radios.forEach(radio => {
      initRadioTouchFeedback(radio, options)
    })

    // Initialize touch feedback for form buttons
    const buttons = form.querySelectorAll(
      'button[type="submit"], button[type="button"], input[type="submit"], input[type="button"]'
    )
    buttons.forEach(button => {
      initButtonTouchFeedback(button, options)
    })

    // Initialize touch feedback for file inputs
    const fileInputs = form.querySelectorAll('input[type="file"]')
    fileInputs.forEach(fileInput => {
      initFileInputTouchFeedback(fileInput, options)
    })
  })

  console.log(`✅ Form touch feedback initialized for ${forms.length} form(s)`)
}

/**
 * Initialize touch feedback for text-based inputs
 * @param {HTMLElement} input - Input element
 * @param {Object} options - Configuration options
 * @returns {void}
 */
function initInputTouchFeedback(input, options = {}) {
  // Highlight feedback on focus
  const focusFeedback = new TouchFeedback({
    type: 'highlight',
    haptic: 'none',
    duration: 200,
    ...options
  })
  focusFeedback.init(input)

  // Add focus/blur event listeners for enhanced feedback
  input.addEventListener('focus', () => {
    input.classList.add('form-input--focused')
    // Trigger light haptic on focus
    if ('vibrate' in navigator) {
      navigator.vibrate(5)
    }
  })

  input.addEventListener('blur', () => {
    input.classList.remove('form-input--focused')
  })

  // Add validation feedback
  input.addEventListener('invalid', () => {
    const errorFeedback = new TouchFeedback({
      type: 'error',
      haptic: 'heavy',
      duration: 300
    })
    errorFeedback.init(input)
    errorFeedback.triggerFeedback('error')
  })

  input.addEventListener('input', () => {
    // Clear error state on input
    input.classList.remove('form-input--error')
  })
}

/**
 * Initialize touch feedback for select elements
 * @param {HTMLElement} select - Select element
 * @param {Object} options - Configuration options
 * @returns {void}
 */
function initSelectTouchFeedback(select, options = {}) {
  const feedback = new TouchFeedback({
    type: 'highlight',
    haptic: 'light',
    duration: 200,
    ...options
  })
  feedback.init(select)

  // Add focus/blur event listeners
  select.addEventListener('focus', () => {
    select.classList.add('form-select--focused')
  })

  select.addEventListener('blur', () => {
    select.classList.remove('form-select--focused')
  })

  select.addEventListener('change', () => {
    // Trigger success feedback on selection
    feedback.triggerFeedback('success')
  })
}

/**
 * Initialize touch feedback for checkboxes
 * @param {HTMLElement} checkbox - Checkbox element
 * @param {Object} options - Configuration options
 * @returns {void}
 */
function initCheckboxTouchFeedback(checkbox, options = {}) {
  const feedback = new TouchFeedback({
    type: 'scale',
    haptic: 'light',
    scale: 0.95,
    duration: 150,
    ...options
  })
  feedback.init(checkbox)

  checkbox.addEventListener('change', () => {
    // Trigger different feedback based on checked state
    if (checkbox.checked) {
      feedback.triggerFeedback('success')
    } else {
      feedback.triggerFeedback('light')
    }
  })
}

/**
 * Initialize touch feedback for radio buttons
 * @param {HTMLElement} radio - Radio button element
 * @param {Object} options - Configuration options
 * @returns {void}
 */
function initRadioTouchFeedback(radio, options = {}) {
  const feedback = new TouchFeedback({
    type: 'scale',
    haptic: 'light',
    scale: 0.95,
    duration: 150,
    ...options
  })
  feedback.init(radio)

  radio.addEventListener('change', () => {
    // Trigger success feedback when radio is selected
    if (radio.checked) {
      feedback.triggerFeedback('success')
    }
  })
}

/**
 * Initialize touch feedback for form buttons
 * @param {HTMLElement} button - Button element
 * @param {Object} options - Configuration options
 * @returns {void}
 */
function initButtonTouchFeedback(button, options = {}) {
  const feedback = new TouchFeedback({
    type: 'ripple',
    haptic: 'medium',
    color: 'rgba(255, 255, 255, 0.3)',
    duration: 300,
    ...options
  })
  feedback.init(button)

  // Store reference for later access
  button._touchFeedback = feedback

  // Add loading state feedback
  const originalClickHandler = button.onclick
  button.onclick = function (event) {
    // Show loading state if button has loading functionality
    if (button.classList.contains('btn-loading')) {
      feedback.triggerFeedback('warning')
    }

    // Call original handler
    if (originalClickHandler) {
      return originalClickHandler.call(this, event)
    }
  }
}

/**
 * Initialize touch feedback for file inputs
 * @param {HTMLElement} fileInput - File input element
 * @param {Object} options - Configuration options
 * @returns {void}
 */
function initFileInputTouchFeedback(fileInput, options = {}) {
  const feedback = new TouchFeedback({
    type: 'highlight',
    haptic: 'light',
    duration: 200,
    ...options
  })
  feedback.init(fileInput)

  fileInput.addEventListener('change', () => {
    // Trigger success feedback when file is selected
    if (fileInput.files && fileInput.files.length > 0) {
      feedback.triggerFeedback('success')
    }
  })

  fileInput.addEventListener('click', () => {
    // Trigger light feedback when file dialog opens
    feedback.triggerFeedback('light')
  })
}

/**
 * Initialize touch feedback for quantity controls
 * @param {string} containerSelector - Selector for quantity control container
 * @returns {void}
 */
export function initQuantityTouchFeedback(containerSelector = '.quantity-control') {
  const containers = document.querySelectorAll(containerSelector)

  containers.forEach(container => {
    const minusBtn = container.querySelector('.qty-minus')
    const plusBtn = container.querySelector('.qty-plus')
    const input = container.querySelector('.qty-input')

    if (minusBtn) {
      const feedback = new TouchFeedback({
        type: 'scale',
        haptic: 'light',
        scale: 0.9,
        duration: 100
      })
      feedback.init(minusBtn)
    }

    if (plusBtn) {
      const feedback = new TouchFeedback({
        type: 'scale',
        haptic: 'light',
        scale: 0.9,
        duration: 100
      })
      feedback.init(plusBtn)
    }

    if (input) {
      initInputTouchFeedback(input)
    }
  })

  console.log(`✅ Quantity touch feedback initialized for ${containers.length} control(s)`)
}

/**
 * Trigger form validation feedback
 * @param {HTMLFormElement} form - Form element
 * @param {boolean} isValid - Whether form is valid
 * @returns {void}
 */
export function triggerFormValidationFeedback(form, isValid) {
  if (isValid) {
    // Trigger success feedback on form
    const feedback = new TouchFeedback({
      type: 'success',
      haptic: 'success',
      duration: 500
    })
    feedback.init(form)
    feedback.triggerFeedback('success')
  } else {
    // Find first invalid field and trigger error feedback
    const invalidField = form.querySelector(':invalid')
    if (invalidField) {
      invalidField.classList.add('form-input--error')
      invalidField.focus()

      const feedback = new TouchFeedback({
        type: 'error',
        haptic: 'error',
        duration: 300
      })
      feedback.init(invalidField)
      feedback.triggerFeedback('error')
    }
  }
}

// Export default for convenience
export default {
  initFormTouchFeedback,
  initQuantityTouchFeedback,
  triggerFormValidationFeedback
}
