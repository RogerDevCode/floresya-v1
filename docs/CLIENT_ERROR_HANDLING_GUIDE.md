# 🚀 Client-Side Error Handling Guide - FloresYa API

## Overview

This guide provides **practical, ready-to-use code** for handling FloresYa API errors on the client side. All examples follow industry best practices and are designed for immediate implementation.

---

## 📋 Quick Start

### Basic Error Handler

```javascript
/**
 * Universal API error handler for FloresYa API
 */
class FloresYaErrorHandler {
  static handle(errorResponse, httpStatus) {
    const { code, category, message, details, requestId } = errorResponse

    // Log error for debugging
    console.error(`[${category.toUpperCase()}] ${message}`, {
      code,
      httpStatus,
      requestId,
      details
    })

    // Route to appropriate handler
    switch (category) {
      case 'validation':
        return this.handleValidation(message, details)
      case 'authentication':
        return this.handleAuth(message, code, httpStatus)
      case 'not_found':
        return this.handleNotFound(message, details)
      case 'business':
        return this.handleBusiness(message, details)
      case 'server':
        return this.handleServer(message, httpStatus)
      default:
        return this.handleUnknown(errorResponse)
    }
  }

  static handleValidation(message, details) {
    // Display field-specific errors
    if (details?.validationErrors) {
      this.showFieldErrors(details.validationErrors)
    } else {
      this.showToast(message, 'error')
    }
  }

  static handleAuth(message, code, httpStatus) {
    if (httpStatus === 401) {
      // Token expired or missing
      this.redirectToLogin()
    } else if (httpStatus === 403) {
      // Insufficient permissions
      this.showToast('Access denied. You do not have permission.', 'warning')
    } else {
      this.showToast(message, 'error')
    }
  }

  static handleNotFound(message, details) {
    if (details?.resource === 'Product') {
      window.location.href = '/products-not-found'
    } else {
      this.showToast(message, 'info')
    }
  }

  static handleBusiness(message, details) {
    // Business errors often need specific handling
    if (details?.rule === 'minimum_order_amount') {
      this.showToast(
        `Minimum order amount is $${details.minimum}. Please add more items.`,
        'warning'
      )
    } else if (details?.constraint === 'unique') {
      this.showToast('This resource already exists.', 'warning')
    } else {
      this.showToast(message, 'warning')
    }
  }

  static handleServer(message, httpStatus) {
    if (httpStatus >= 500) {
      this.showToast('An unexpected error occurred. Please try again later.', 'error')
      // Optionally report to error tracking
      this.reportError(message, httpStatus)
    }
  }

  static showToast(message, type = 'error') {
    // Implementation depends on your UI library
    // Example with a hypothetical toast system
    Toast.show({
      message,
      type, // 'error', 'warning', 'info', 'success'
      duration: 5000
    })
  }

  static showFieldErrors(validationErrors) {
    Object.entries(validationErrors).forEach(([field, errors]) => {
      const errorElement = document.getElementById(`${field}-error`)
      if (errorElement) {
        errorElement.textContent = errors[0]
        errorElement.style.display = 'block'
      }

      const fieldElement = document.getElementById(field)
      if (fieldElement) {
        fieldElement.classList.add('is-invalid')
      }
    })
  }

  static redirectToLogin() {
    const currentUrl = encodeURIComponent(window.location.pathname + window.location.search)
    window.location.href = `/login?redirect=${currentUrl}`
  }

  static reportError(message, httpStatus) {
    // Report to error tracking service (e.g., Sentry, LogRocket)
    if (window.ErrorTracker) {
      window.ErrorTracker.captureException(new Error(message), {
        tags: { httpStatus, category: 'server' }
      })
    }
  }

  static handleUnknown(errorResponse) {
    console.error('Unknown error category:', errorResponse.category)
    this.showToast('An unexpected error occurred.', 'error')
  }
}
```

---

## 🎯 API Request Wrapper

### Complete Fetch Wrapper

```javascript
/**
 * Enhanced fetch wrapper with FloresYa error handling
 */
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    const data = await response.json()

    // Check if request was successful
    if (!data.success) {
      FloresYaErrorHandler.handle(data, response.status)
      return null
    }

    return data.data
  } catch (error) {
    // Network or parsing errors
    console.error('Request failed:', error)
    FloresYaErrorHandler.showToast('Network error. Please check your connection.', 'error')
    return null
  }
}

// Usage examples
const product = await apiRequest('/api/products/1')
const products = await apiRequest('/api/products?limit=10')
```

### POST Request with Validation Support

```javascript
async function createProduct(productData) {
  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(productData)
    })

    const data = await response.json()

    if (!data.success) {
      // Handle FloresYa API error
      FloresYaErrorHandler.handle(data, response.status)

      // If validation error, return errors for form display
      if (data.category === 'validation' && data.details?.validationErrors) {
        return { success: false, errors: data.details.validationErrors }
      }

      return { success: false }
    }

    // Success
    FloresYaErrorHandler.showToast('Product created successfully!', 'success')
    return { success: true, data: data.data }
  } catch (error) {
    console.error('Create product failed:', error)
    return { success: false, error: 'Network error' }
  }
}

// Usage in form
async function handleProductSubmit(event) {
  event.preventDefault()

  const formData = new FormData(event.target)
  const productData = Object.fromEntries(formData)

  const result = await createProduct(productData)

  if (result.success) {
    window.location.href = '/products'
  } else if (result.errors) {
    // Display validation errors
    displayValidationErrors(result.errors)
  }
}
```

---

## 📝 Form Validation Error Display

### React Example

```jsx
import { useState } from 'react'

function ProductForm() {
  const [errors, setErrors] = useState({})

  const handleSubmit = async data => {
    const result = await apiRequest('/api/products', {
      method: 'POST',
      body: JSON.stringify(data)
    })

    if (result?.errors) {
      setErrors(result.errors)
    } else {
      setErrors({})
      // Success handling
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Product Name</label>
        <input type="text" name="name" className={errors.name ? 'is-invalid' : ''} />
        {errors.name && <span className="error">{errors.name[0]}</span>}
      </div>

      <div>
        <label>Price (USD)</label>
        <input type="number" name="price_usd" className={errors.price_usd ? 'is-invalid' : ''} />
        {errors.price_usd && <span className="error">{errors.price_usd[0]}</span>}
      </div>

      <button type="submit">Create Product</button>
    </form>
  )
}
```

### Vanilla JavaScript Example

```html
<form id="product-form">
  <div class="form-group">
    <label for="name">Product Name</label>
    <input type="text" id="name" name="name" />
    <div id="name-error" class="error-message"></div>
  </div>

  <div class="form-group">
    <label for="price_usd">Price (USD)</label>
    <input type="number" id="price_usd" name="price_usd" />
    <div id="price_usd-error" class="error-message"></div>
  </div>

  <button type="submit">Create Product</button>
</form>

<script>
  document.getElementById('product-form').addEventListener('submit', async e => {
    e.preventDefault()

    const formData = new FormData(e.target)
    const productData = Object.fromEntries(formData)

    const result = await apiRequest('/api/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    })

    if (result?.errors) {
      displayValidationErrors(result.errors)
    } else {
      // Clear errors
      clearValidationErrors()
      // Success handling
      alert('Product created successfully!')
    }
  })

  function displayValidationErrors(errors) {
    Object.entries(errors).forEach(([field, errorMessages]) => {
      const errorElement = document.getElementById(`${field}-error`)
      if (errorElement) {
        errorElement.textContent = errorMessages[0]
        errorElement.style.display = 'block'
      }

      const fieldElement = document.getElementById(field)
      if (fieldElement) {
        fieldElement.classList.add('is-invalid')
      }
    })
  }

  function clearValidationErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
      el.textContent = ''
      el.style.display = 'none'
    })

    document.querySelectorAll('.is-invalid').forEach(el => {
      el.classList.remove('is-invalid')
    })
  }
</script>

<style>
  .form-group {
    margin-bottom: 1rem;
  }

  .error-message {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    display: none;
  }

  .is-invalid {
    border-color: #dc3545;
  }
</style>
```

---

## 🔐 Authentication Error Handling

### Token Refresh & Auto-Login

```javascript
class AuthManager {
  static async handleAuthError(errorResponse) {
    const { code, httpStatus } = errorResponse

    if (httpStatus === 401) {
      // Try to refresh token
      const refreshed = await this.tryRefreshToken()
      if (refreshed) {
        // Retry original request
        return true
      }

      // Refresh failed - redirect to login
      this.logout()
      return false
    }

    if (httpStatus === 403) {
      this.showToast('Access denied. You do not have permission.', 'warning')
      return false
    }

    return false
  }

  static async tryRefreshToken() {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) return false

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('access_token', data.accessToken)
        return true
      }

      return false
    } catch (error) {
      console.error('Token refresh failed:', error)
      return false
    }
  }

  static logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.href = '/login'
  }

  static getAuthToken() {
    return localStorage.getItem('access_token')
  }

  static isAuthenticated() {
    return !!this.getAuthToken()
  }
}

// Usage in API requests
async function authenticatedRequest(url, options = {}) {
  const token = AuthManager.getAuthToken()

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`
    }
  })

  const data = await response.json()

  if (!data.success && data.category === 'authentication') {
    const shouldRetry = await AuthManager.handleAuthError(data)
    if (shouldRetry) {
      // Retry with new token
      return authenticatedRequest(url, options)
    }
    return null
  }

  return data
}
```

---

## 🔍 Not Found Error Handling

### Smart 404 Handling

```javascript
function handleNotFound(errorResponse) {
  const { details } = errorResponse

  // Route based on resource type
  switch (details?.resource) {
    case 'Product':
      showProductNotFound(details.id)
      break
    case 'Order':
      showOrderNotFound(details.id)
      break
    case 'User':
      showUserNotFound(details.id)
      break
    default:
      showGenericNotFound()
  }
}

function showProductNotFound(productId) {
  // Check if we're on a products page
  if (window.location.pathname.startsWith('/products/')) {
    // Replace current page
    window.location.replace(`/products-not-found?id=${productId}`)
  } else {
    // Show modal or inline message
    showToast('Product not found', 'info')
  }
}

function showOrderNotFound(orderId) {
  // Redirect to orders list
  window.location.href = `/orders?notFound=${orderId}`
}

function showUserNotFound(userId) {
  // Show user profile not found page
  window.location.href = `/users/${userId}/not-found`
}

function showGenericNotFound() {
  // Show generic 404 page
  window.location.href = '/404'
}
```

---

## 💼 Business Logic Error Handling

### Common Business Error Scenarios

```javascript
function handleBusinessError(message, details) {
  // Insufficient stock
  if (details?.productId && details?.available !== undefined) {
    showStockError(details)
    return
  }

  // Payment failed
  if (details?.reason) {
    showPaymentError(details.reason)
    return
  }

  // Resource already exists
  if (details?.constraint === 'unique') {
    showConflictError(details.field, details.value)
    return
  }

  // Order processing failed
  if (details?.orderId) {
    showOrderError(details)
    return
  }

  // Generic business error
  showToast(message, 'warning')
}

function showStockError(details) {
  const { productId, requested, available } = details

  const modal = document.createElement('div')
  modal.className = 'modal'
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Insufficient Stock</h3>
      <p>Only ${available} units available. You requested ${requested}.</p>
      <button onclick="updateCart('${productId}', ${available})">
        Update to ${available} units
      </button>
      <button onclick="removeFromCart('${productId}')">
        Remove from cart
      </button>
      <button onclick="this.closest('.modal').remove()">
        Cancel
      </button>
    </div>
  `

  document.body.appendChild(modal)
}

function showPaymentError(reason) {
  let message = 'Payment failed. Please try again.'

  switch (reason) {
    case 'card_declined':
      message = 'Your card was declined. Please try a different card.'
      break
    case 'insufficient_funds':
      message = 'Insufficient funds. Please try a different payment method.'
      break
    case 'expired_card':
      message = 'Your card has expired. Please try a different card.'
      break
  }

  showToast(message, 'error')
  // Redirect to payment method selection
  window.location.href = '/checkout/payment?error=payment_failed'
}

function showConflictError(field, value) {
  showToast(`This ${field} is already in use: ${value}`, 'warning')

  // Highlight the conflicting field
  const fieldElement = document.getElementById(field)
  if (fieldElement) {
    fieldElement.classList.add('is-invalid')
    fieldElement.focus()
  }
}
```

---

## 🚨 Server Error Handling

### Error Reporting & Recovery

```javascript
function handleServerError(message, httpStatus) {
  // Always log server errors
  console.error(`Server Error (${httpStatus}):`, message)

  // Show user-friendly message
  showToast('An unexpected error occurred. Please try again later.', 'error')

  // Report to error tracking service
  reportServerError(message, httpStatus)

  // Attempt recovery for certain errors
  if (httpStatus === 503) {
    // Service unavailable - suggest retry
    scheduleRetry()
  }
}

function reportServerError(message, httpStatus) {
  // Sentry
  if (window.Sentry) {
    window.Sentry.captureException(new Error(message), {
      tags: {
        httpStatus,
        category: 'server'
      }
    })
  }

  // Custom error tracking
  fetch('/api/errors/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      httpStatus,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    })
  }).catch(err => console.error('Error report failed:', err))
}

function scheduleRetry() {
  // Show retry notification
  showToast('Service temporarily unavailable. Retrying in 5 seconds...', 'info')

  setTimeout(() => {
    window.location.reload()
  }, 5000)
}
```

---

## 🎨 UI/UX Best Practices

### Error Message Display

```javascript
// Good: Clear, actionable error messages
const errorMessages = {
  validation: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minLength: 'Minimum length is {min} characters',
    maxLength: 'Maximum length is {max} characters',
    pattern: 'Invalid format',
    valueIsNotValid: 'Please enter a valid value'
  },
  authentication: {
    unauthorized: 'Please log in to continue',
    tokenExpired: 'Your session has expired. Please log in again.',
    forbidden: 'You do not have permission to perform this action'
  },
  business: {
    insufficientStock: 'Only {available} units available',
    minimumOrder: 'Minimum order amount is ${amount}',
    paymentFailed: 'Payment could not be processed'
  }
}

// Display with context
function showError(field, errorCode, context = {}) {
  const message =
    errorMessages[field]?.[errorCode] || errorMessages.general[errorCode] || 'An error occurred'

  // Replace placeholders
  const formattedMessage = message.replace(/\{(\w+)\}/g, (match, key) => {
    return context[key] || match
  })

  showToast(formattedMessage, 'error')
}
```

### Loading States During Error Recovery

```javascript
async function handleRequestWithLoading(url, options) {
  showLoading(true)

  try {
    const result = await apiRequest(url, options)

    if (!result) {
      // Error was already handled by FloresYaErrorHandler
      showLoading(false)
      return null
    }

    showLoading(false)
    return result
  } catch (error) {
    showLoading(false)
    throw error
  }
}

function showLoading(isLoading) {
  const button = document.querySelector('[type="submit"]')
  const spinner = document.querySelector('.spinner')

  if (isLoading) {
    button.disabled = true
    spinner.style.display = 'inline-block'
  } else {
    button.disabled = false
    spinner.style.display = 'none'
  }
}
```

---

## 📊 Error Analytics

### Track Error Patterns

```javascript
class ErrorTracker {
  static errors = []

  static track(errorResponse) {
    const error = {
      timestamp: new Date().toISOString(),
      category: errorResponse.category,
      code: errorResponse.code,
      message: errorResponse.message,
      path: errorResponse.path,
      requestId: errorResponse.requestId,
      url: window.location.href
    }

    this.errors.push(error)

    // Analyze patterns
    this.analyzePatterns()

    // Send to analytics
    this.sendToAnalytics(error)
  }

  static analyzePatterns() {
    const recentErrors = this.errors.filter(
      e => Date.now() - new Date(e.timestamp).getTime() < 3600000 // Last hour
    )

    // Count errors by category
    const byCategory = recentErrors.reduce((acc, err) => {
      acc[err.category] = (acc[err.category] || 0) + 1
      return acc
    }, {})

    // Count errors by code
    const byCode = recentErrors.reduce((acc, err) => {
      acc[err.code] = (acc[err.code] || 0) + 1
      return acc
    }, {})

    // Detect spikes
    if (byCategory.server > 10) {
      console.warn('High server error rate detected!')
    }
  }

  static sendToAnalytics(error) {
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: `${error.category}: ${error.code}`,
        fatal: false
      })
    }

    // Custom analytics
    fetch('/api/analytics/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(error)
    }).catch(err => console.error('Analytics failed:', err))
  }
}
```

---

## ✅ Testing Error Handling

### Jest/Vitest Example

```javascript
import { FloresYaErrorHandler } from '../utils/errorHandler'

describe('FloresYaErrorHandler', () => {
  describe('handleValidation', () => {
    it('should display field-specific errors', () => {
      const showFieldErrorsSpy = jest.spyOn(FloresYaErrorHandler, 'showFieldErrors')
      const showToastSpy = jest.spyOn(FloresYaErrorHandler, 'showToast')

      const errorResponse = {
        category: 'validation',
        message: 'Validation failed',
        details: {
          validationErrors: {
            email: ['Invalid email'],
            name: ['Required field']
          }
        }
      }

      FloresYaErrorHandler.handle(errorResponse, 400)

      expect(showFieldErrorsSpy).toHaveBeenCalledWith(errorResponse.details.validationErrors)
      expect(showToastSpy).not.toHaveBeenCalled()
    })

    it('should show general message when no field errors', () => {
      const showFieldErrorsSpy = jest.spyOn(FloresYaErrorHandler, 'showFieldErrors')
      const showToastSpy = jest.spyOn(FloresYaErrorHandler, 'showToast')

      const errorResponse = {
        category: 'validation',
        message: 'Validation failed'
      }

      FloresYaErrorHandler.handle(errorResponse, 400)

      expect(showFieldErrorsSpy).not.toHaveBeenCalled()
      expect(showToastSpy).toHaveBeenCalledWith('Validation failed', 'error')
    })
  })

  describe('handleAuth', () => {
    it('should redirect to login on 401', () => {
      const redirectSpy = jest.spyOn(FloresYaErrorHandler, 'redirectToLogin')

      const errorResponse = {
        category: 'authentication',
        message: 'Unauthorized'
      }

      FloresYaErrorHandler.handle(errorResponse, 401)

      expect(redirectSpy).toHaveBeenCalled()
    })

    it('should show warning on 403', () => {
      const showToastSpy = jest.spyOn(FloresYaErrorHandler, 'showToast')

      const errorResponse = {
        category: 'authentication',
        message: 'Forbidden'
      }

      FloresYaErrorHandler.handle(errorResponse, 403)

      expect(showToastSpy).toHaveBeenCalledWith(
        'Access denied. You do not have permission.',
        'warning'
      )
    })
  })
})
```

---

## 📚 Complete Example: Product Creation Form

```javascript
// Full example with all best practices
class ProductManager {
  async createProduct(productData) {
    try {
      showLoading(true)
      clearErrors()

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AuthManager.getAuthToken()}`
        },
        body: JSON.stringify(productData)
      })

      const data = await response.json()

      if (!data.success) {
        // Handle FloresYa API error
        FloresYaErrorHandler.handle(data, response.status)

        if (data.category === 'validation' && data.details?.validationErrors) {
          this.displayValidationErrors(data.details.validationErrors)
          return { success: false, type: 'validation' }
        }

        return { success: false, type: 'error' }
      }

      // Success
      FloresYaErrorHandler.showToast('Product created successfully!', 'success')
      ErrorTracker.track({
        category: 'business',
        code: 'PRODUCT_CREATED',
        message: 'Product created',
        path: '/api/products'
      })

      return { success: true, data: data.data }
    } catch (error) {
      console.error('Create product failed:', error)
      FloresYaErrorHandler.showToast('Network error. Please try again.', 'error')
      return { success: false, type: 'network' }
    } finally {
      showLoading(false)
    }
  }

  displayValidationErrors(errors) {
    Object.entries(errors).forEach(([field, messages]) => {
      const fieldElement = document.getElementById(field)
      const errorElement = document.getElementById(`${field}-error`)

      if (fieldElement) {
        fieldElement.classList.add('is-invalid')
        fieldElement.focus()
      }

      if (errorElement) {
        errorElement.textContent = messages[0]
        errorElement.style.display = 'block'
      }
    })
  }

  clearErrors() {
    document.querySelectorAll('.is-invalid').forEach(el => {
      el.classList.remove('is-invalid')
    })

    document.querySelectorAll('.error-message').forEach(el => {
      el.textContent = ''
      el.style.display = 'none'
    })
  }
}

// Usage
const productManager = new ProductManager()

document.getElementById('product-form').addEventListener('submit', async e => {
  e.preventDefault()

  const formData = new FormData(e.target)
  const productData = Object.fromEntries(formData)

  const result = await productManager.createProduct(productData)

  if (result.success) {
    window.location.href = '/products'
  }
})
```

---

## ✅ Best Practices Checklist

- [ ] Always check `success` field in API response
- [ ] Route errors based on `category` field
- [ ] Display user-friendly messages from `message` field
- [ ] Use `details` object for specific error context
- [ ] Handle authentication errors with token refresh
- [ ] Log all server errors (5xx) for debugging
- [ ] Provide actionable error messages to users
- [ ] Clear previous errors on new request
- [ ] Show loading states during error recovery
- [ ] Track error patterns for analytics
- [ ] Test error handling thoroughly
- [ ] Use `requestId` for error correlation

---

## 📚 Additional Resources

- **Error Response Standards**: `/docs/ERROR_RESPONSE_STANDARDS.md`
- **Error Codes Reference**: `/api/config/errorCodes.js`
- **Test Utilities**: `/tests/utils/errorTestUtils.js`
- **RFC 7807 Specification**: https://tools.ietf.org/html/rfc7807

---

## ✅ Conclusion

This guide provides **complete, production-ready** client-side error handling for the FloresYa API:

✅ **Universal Error Handler** - Handles all error categories
✅ **Form Validation** - Display field-specific errors
✅ **Authentication** - Token refresh and auto-login
✅ **Business Logic** - Context-aware error handling
✅ **Server Errors** - Reporting and recovery
✅ **UI/UX Best Practices** - User-friendly error messages
✅ **Analytics** - Track and analyze error patterns
✅ **Testing** - Comprehensive test examples

**Implement these patterns for excellent developer and user experience!** 🎉

---

**Status**: ✅ **COMPLETE & READY TO USE**

---

**Last Updated**: 2025-10-31
**Version**: 1.0
**Author**: Claude Code Implementation
**License**: Proprietary - FloresYa E-Commerce Platform
