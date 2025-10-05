/**
 * Payment Page - Venezuelan Payment Methods
 * Handles customer information form and payment processing
 */

// Global state
let cartItems = []
let deliveryMethod = 'pickup'
let paymentMethod = 'cash'
let orderReference = ''

/**
 * Initialize payment page
 */
function init() {
  // Load cart data from localStorage or redirect if empty
  loadCartData()

  // Back button
  const backButton = document.getElementById('back-button')
  backButton.addEventListener('click', () => {
    window.location.href = '/pages/cart.html'
  })

  // Delivery method radio buttons
  const deliveryRadios = document.querySelectorAll('input[name="delivery"]')
  deliveryRadios.forEach(radio => {
    radio.addEventListener('change', e => {
      deliveryMethod = e.target.value
      updateOrderSummary()
    })
  })

  // Payment method radio buttons
  const paymentRadios = document.querySelectorAll('input[name="payment-method"]')
  paymentRadios.forEach(radio => {
    radio.addEventListener('change', e => {
      paymentMethod = e.target.value
      togglePaymentForms()
    })
  })

  // Process payment button
  const processButton = document.getElementById('process-payment-button')
  processButton.addEventListener('click', handlePayment)

  // Generate order reference
  orderReference = generateOrderReference()

  // Update reference displays
  updateReferenceDisplays()

  // Render cart summary
  renderCartSummary()

  // Initialize form validation
  initFormValidation()
}

/**
 * Load cart data from localStorage
 */
function loadCartData() {
  const cartData = localStorage.getItem('cartItems')
  if (!cartData) {
    // Redirect to cart if no items
    window.location.href = '/pages/cart.html'
    return
  }

  try {
    cartItems = JSON.parse(cartData)
    if (cartItems.length === 0) {
      window.location.href = '/pages/cart.html'
    }
  } catch (error) {
    console.error('Error loading cart data:', error)
    window.location.href = '/pages/cart.html'
  }
}

/**
 * Render cart summary in payment page
 */
function renderCartSummary() {
  const cartSummaryContainer = document.getElementById('cart-summary')

  if (cartItems.length === 0) {
    cartSummaryContainer.innerHTML = '<p class="text-gray-500">No hay productos en el carrito</p>'
    return
  }

  cartSummaryContainer.innerHTML = cartItems
    .map(
      item => `
   <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
     <img
       src="${item.image_thumb || '../images/placeholder-flower.svg'}"
       alt="${item.name}"
       class="h-12 w-12 object-cover rounded-lg"
       loading="lazy"
     />
     <div class="flex-1 min-w-0">
       <h4 class="text-sm font-semibold text-gray-900 truncate">${item.name}</h4>
       <p class="text-xs text-gray-500">Cantidad: ${item.quantity}</p>
     </div>
     <div class="text-right">
       <p class="text-sm font-bold text-gray-900">$${(item.price_usd * item.quantity).toFixed(2)}</p>
     </div>
   </div>
 `
    )
    .join('')

  // Add error handling for cart images
  const cartImages = cartSummaryContainer.querySelectorAll('img')
  cartImages.forEach(img => {
    img.addEventListener('error', () => {
      img.src = '../images/placeholder-flower.svg'
      console.warn('Failed to load cart image:', img.src)
    })
  })

  updateOrderSummary()
}

/**
 * Update order summary calculations
 */
function updateOrderSummary() {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price_usd * item.quantity, 0)
  const shippingCost = deliveryMethod === 'delivery' ? 5.0 : 0
  const total = subtotal + shippingCost
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  document.getElementById('total-items').textContent = totalItems
  document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`
  document.getElementById('shipping-cost').textContent =
    shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : 'Gratis'
  document.getElementById('total').textContent = `$${total.toFixed(2)}`
  document.getElementById('delivery-cost-display').textContent = `$${shippingCost.toFixed(2)}`
}

/**
 * Toggle payment method forms
 */
function togglePaymentForms() {
  // Hide all forms
  document.getElementById('mobile-payment-form').classList.add('hidden')
  document.getElementById('bank-transfer-form').classList.add('hidden')
  document.getElementById('zelle-form').classList.add('hidden')
  document.getElementById('crypto-form').classList.add('hidden')

  // Show selected form
  switch (paymentMethod) {
    case 'mobile_payment':
      document.getElementById('mobile-payment-form').classList.remove('hidden')
      break
    case 'bank_transfer':
      document.getElementById('bank-transfer-form').classList.remove('hidden')
      break
    case 'zelle':
      document.getElementById('zelle-form').classList.remove('hidden')
      break
    case 'crypto':
      document.getElementById('crypto-form').classList.remove('hidden')
      break
  }
}

/**
 * Generate unique order reference
 */
function generateOrderReference() {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `FY-${timestamp}${random}`
}

/**
 * Update reference displays
 */
function updateReferenceDisplays() {
  document.getElementById('mobile-reference').textContent = orderReference
  document.getElementById('transfer-reference').textContent = orderReference
  document.getElementById('zelle-reference').textContent = orderReference
}

/**
 * Initialize form validation
 */
function initFormValidation() {
  const customerForm = document.getElementById('customer-form')

  // Real-time validation
  customerForm.addEventListener('blur', validateField, true)
  customerForm.addEventListener('input', clearFieldError, true)
}

/**
 * Validate individual field
 */
function validateField(e) {
  const field = e.target
  const errorElement = field.parentNode.querySelector('.error-message')

  if (!errorElement) {
    return
  }

  let isValid = true
  let errorMessage = ''

  switch (field.name) {
    case 'customer-name':
      if (!field.value.trim()) {
        isValid = false
        errorMessage = 'El nombre es requerido'
      } else if (field.value.trim().length < 2) {
        isValid = false
        errorMessage = 'El nombre debe tener al menos 2 caracteres'
      }
      break

    case 'customer-email':
      if (!field.value.trim()) {
        isValid = false
        errorMessage = 'El email es requerido'
      } else if (!isValidEmail(field.value)) {
        isValid = false
        errorMessage = 'Ingrese un email válido'
      }
      break

    case 'customer-phone':
      if (!field.value.trim()) {
        isValid = false
        errorMessage = 'El teléfono es requerido'
      } else if (!isValidVenezuelanPhone(field.value)) {
        isValid = false
        errorMessage = 'Ingrese un teléfono válido (ej: 0414 123 4567)'
      }
      break

    case 'delivery-address':
      if (!field.value.trim()) {
        isValid = false
        errorMessage = 'La dirección es requerida'
      } else if (field.value.trim().length < 10) {
        isValid = false
        errorMessage = 'Ingrese una dirección completa'
      }
      break

    case 'delivery-city':
      if (!field.value.trim()) {
        isValid = false
        errorMessage = 'La ciudad es requerida'
      }
      break

    case 'delivery-state':
      if (!field.value.trim()) {
        isValid = false
        errorMessage = 'El estado es requerido'
      }
      break
  }

  if (!isValid) {
    field.classList.add('border-red-500')
    errorElement.textContent = errorMessage
    errorElement.classList.remove('hidden')
  } else {
    field.classList.remove('border-red-500')
    errorElement.classList.add('hidden')
  }

  return isValid
}

/**
 * Clear field error on input
 */
function clearFieldError(e) {
  const field = e.target
  const errorElement = field.parentNode.querySelector('.error-message')

  if (errorElement && !errorElement.classList.contains('hidden')) {
    field.classList.remove('border-red-500')
    errorElement.classList.add('hidden')
  }
}

/**
 * Validate entire form
 */
function validateForm() {
  const requiredFields = [
    'customer-name',
    'customer-email',
    'customer-phone',
    'delivery-address',
    'delivery-city',
    'delivery-state'
  ]
  let isValid = true

  requiredFields.forEach(fieldName => {
    const field = document.getElementById(fieldName)
    if (field && !validateField({ target: field })) {
      isValid = false
    }
  })

  return isValid
}

/**
 * Handle payment processing
 */
async function handlePayment() {
  // Validate customer form
  if (!validateForm()) {
    alert('Por favor complete todos los campos requeridos correctamente.')
    return
  }

  // Validate payment method specific fields
  if (!validatePaymentMethod()) {
    return
  }

  // Show loading state
  const processButton = document.getElementById('process-payment-button')
  const originalText = processButton.innerHTML
  processButton.innerHTML =
    '<i data-lucide="loader-2" class="h-5 w-5 animate-spin"></i> Procesando...'
  processButton.disabled = true

  try {
    // Collect customer data
    const customerData = {
      customerName: document.getElementById('customer-name').value,
      customerEmail: document.getElementById('customer-email').value,
      customerPhone: document.getElementById('customer-phone').value,
      deliveryAddress: document.getElementById('delivery-address').value,
      deliveryCity: document.getElementById('delivery-city').value,
      deliveryState: document.getElementById('delivery-state').value,
      deliveryZip: document.getElementById('delivery-zip').value || '',
      deliveryReferences: document.getElementById('delivery-references').value || '',
      additionalNotes: document.getElementById('additional-notes').value || ''
    }

    // Collect payment data
    const paymentData = {
      paymentMethod,
      orderReference,
      deliveryMethod,
      subtotal: cartItems.reduce((sum, item) => sum + item.price_usd * item.quantity, 0),
      shippingCost: deliveryMethod === 'delivery' ? 5.0 : 0,
      total:
        cartItems.reduce((sum, item) => sum + item.price_usd * item.quantity, 0) +
        (deliveryMethod === 'delivery' ? 5.0 : 0)
    }

    // Add payment method specific data
    if (paymentMethod === 'mobile_payment') {
      paymentData.mobilePhone = document.getElementById('mobile-phone').value
      paymentData.mobileBank = document.getElementById('mobile-bank').value
    } else if (paymentMethod === 'bank_transfer') {
      paymentData.bankName = document.getElementById('bank-name').value
      paymentData.accountNumber = document.getElementById('account-number').value
      paymentData.accountHolder = document.getElementById('account-holder').value
    } else if (paymentMethod === 'zelle') {
      paymentData.zelleEmail = document.getElementById('zelle-email').value
    } else if (paymentMethod === 'crypto') {
      paymentData.cryptoAddress = document.getElementById('crypto-address').value
    }

    // Create order via API
    const orderResponse = await createOrder(customerData, paymentData)

    // Show success message
    showSuccessMessage(orderResponse)
  } catch (error) {
    console.error('Payment processing error:', error)
    alert('Error procesando el pago: ' + error.message)
  } finally {
    // Restore button state
    processButton.innerHTML = originalText
    processButton.disabled = false
  }
}

/**
 * Validate payment method specific fields
 */
function validatePaymentMethod() {
  switch (paymentMethod) {
    case 'mobile_payment': {
      const mobilePhone = document.getElementById('mobile-phone').value
      const mobileBank = document.getElementById('mobile-bank').value

      if (!mobilePhone.trim()) {
        alert('Por favor ingrese el número de teléfono para Pago Móvil')
        return false
      }
      if (!isValidVenezuelanPhone(mobilePhone)) {
        alert('Por favor ingrese un número de teléfono válido')
        return false
      }
      if (!mobileBank) {
        alert('Por favor seleccione un banco')
        return false
      }
      break
    }

    case 'bank_transfer': {
      const bankName = document.getElementById('bank-name').value
      const accountNumber = document.getElementById('account-number').value
      const accountHolder = document.getElementById('account-holder').value

      if (!bankName) {
        alert('Por favor seleccione un banco')
        return false
      }
      if (!accountNumber.trim()) {
        alert('Por favor ingrese el número de cuenta')
        return false
      }
      if (!accountHolder.trim()) {
        alert('Por favor ingrese el nombre del titular')
        return false
      }
      break
    }

    case 'zelle': {
      const zelleEmail = document.getElementById('zelle-email').value

      if (!zelleEmail.trim()) {
        alert('Por favor ingrese el email de Zelle')
        return false
      }
      if (!isValidEmail(zelleEmail)) {
        alert('Por favor ingrese un email válido')
        return false
      }
      break
    }

    case 'crypto': {
      const cryptoAddress = document.getElementById('crypto-address').value

      if (!cryptoAddress.trim()) {
        alert('Por favor ingrese la dirección de la billetera')
        return false
      }
      break
    }
  }

  return true
}

/**
 * Create order via API
 */
async function createOrder(customerData, paymentData) {
  // OpenAPI contract: POST /api/orders expects { order: {...}, items: [...] }
  const orderPayload = {
    order: {
      customer_email: customerData.customerEmail,
      customer_name: customerData.customerName,
      customer_phone: customerData.customerPhone,
      delivery_address: customerData.deliveryAddress,
      delivery_city: customerData.deliveryCity,
      delivery_state: customerData.deliveryState,
      delivery_zip: customerData.deliveryZip || '',
      delivery_notes: customerData.deliveryReferences || '',
      notes: customerData.additionalNotes || '',
      total_amount_usd: paymentData.total,
      total_amount_ves: paymentData.total * 40,
      currency_rate: 40,
      status: 'pending'
    },
    items: cartItems.map(item => ({
      product_id: item.id,
      product_name: item.name,
      product_summary: item.name,
      unit_price_usd: item.price_usd,
      unit_price_ves: item.price_usd * 40,
      quantity: item.quantity,
      subtotal_usd: item.price_usd * item.quantity,
      subtotal_ves: item.price_usd * item.quantity * 40
    }))
  }

  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderPayload)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
  }

  const result = await response.json()

  if (!result.success) {
    throw new Error(result.message || 'Error creando orden')
  }

  return result.data
}

/**
 * Show success message
 */
function showSuccessMessage(orderData) {
  const message = `
¡Orden creada exitosamente!

Número de orden: ${orderData.id}
Referencia de pago: ${orderReference}
Total: $${orderData.total_amount_usd}

Método de pago: ${getPaymentMethodName(paymentMethod)}

Próximos pasos:
1. Complete el pago usando la referencia proporcionada
2. Recibirá un email de confirmación
3. Procesaremos su orden una vez confirmado el pago

¿Desea realizar otra compra?
  `

  if (confirm(message)) {
    // Clear cart and redirect to home
    localStorage.removeItem('cartItems')
    window.location.href = '/'
  } else {
    // Redirect to order tracking or home
    window.location.href = '/'
  }
}

/**
 * Get payment method display name
 */
function getPaymentMethodName(method) {
  const names = {
    cash: 'Efectivo',
    mobile_payment: 'Pago Móvil',
    bank_transfer: 'Transferencia Bancaria',
    zelle: 'Zelle',
    crypto: 'Criptomonedas'
  }
  return names[method] || method
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate Venezuelan phone number
 */
function isValidVenezuelanPhone(phone) {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '')

  // Check if it starts with 0 and has 10 digits, or starts with 58 and has 12 digits
  return (
    (digits.startsWith('0') && digits.length === 10) ||
    (digits.startsWith('58') && digits.length === 12) ||
    (digits.length === 10 &&
      ['0412', '0414', '0416', '0424', '0426'].some(prefix => digits.startsWith(prefix)))
  )
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize icons first
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons()
  }

  // Then initialize payment functionality
  init()
})
