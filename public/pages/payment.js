/**
 * Payment Page - Venezuelan Payment Methods
 * Handles customer information form and payment processing
 */

import { getCartItems, clearCart } from '../js/shared/cart.js'

// Global state
let cartItems = []
let deliveryMethod = 'pickup'
let paymentMethod = 'cash'
let orderReference = ''
let deliveryCost = 7.0 // Default, will be loaded from settings
let bcvRate = 40.0 // Default, will be loaded from settings

/**
 * Initialize payment page
 */
async function init() {
  // Load settings first
  await loadSettings()

  // Load cart data from localStorage or redirect if empty
  loadCartData()

  // Load saved customer data if exists
  loadSavedCustomerData()

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
 * Load settings from API
 */
async function loadSettings() {
  try {
    const response = await fetch('/api/settings/public')
    if (response.ok) {
      const result = await response.json()
      const settings = result.data || []

      // Find delivery cost
      const deliverySetting = settings.find(s => s.key === 'DELIVERY_COST_USD')
      if (deliverySetting) {
        deliveryCost = parseFloat(deliverySetting.value) || 7.0
      }

      // Find BCV rate
      const bcvSetting = settings.find(s => s.key === 'bcv_usd_rate')
      if (bcvSetting) {
        bcvRate = parseFloat(bcvSetting.value) || 40.0
      }

      console.log(`Settings loaded: Delivery=$${deliveryCost}, BCV Rate=${bcvRate}`)
    }
  } catch (error) {
    console.error('Error loading settings:', error)
    // Use defaults
  }
}

/**
 * Load cart data from shared cart module
 */
function loadCartData() {
  // Load cart items from shared cart module
  cartItems = getCartItems()

  if (cartItems.length === 0) {
    // Redirect to cart if no items
    window.location.href = '/pages/cart.html'
    return
  }

  // Load delivery method from localStorage if previously selected
  const savedDeliveryMethod = localStorage.getItem('deliveryMethod')
  if (savedDeliveryMethod) {
    deliveryMethod = savedDeliveryMethod
    // Update radio button
    const radio = document.querySelector(`input[name="delivery"][value="${deliveryMethod}"]`)
    if (radio) {
      radio.checked = true
    }
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
  const shippingCost = deliveryMethod === 'delivery' ? deliveryCost : 0
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

  // Phone auto-formatting
  const phoneInput = document.getElementById('customer-phone')
  phoneInput.addEventListener('input', formatPhoneNumber)
}

/**
 * Format phone number as user types
 * Format: (+58)-XXX-XXXXXXX
 */
function formatPhoneNumber(e) {
  const input = e.target
  let value = input.value.replace(/\D/g, '') // Remove non-digits

  // Remove leading 0 if present (will add +58 instead)
  if (value.startsWith('0')) {
    value = '58' + value.substring(1)
  }

  // Ensure it starts with 58
  if (!value.startsWith('58') && value.length > 0) {
    value = '58' + value
  }

  // Format as (+58)-XXX-XXXXXXX
  let formatted = ''
  if (value.length > 0) {
    formatted = '(+' + value.substring(0, 2) + ')'
  }
  if (value.length > 2) {
    formatted += '-' + value.substring(2, 5)
  }
  if (value.length > 5) {
    formatted += '-' + value.substring(5, 12)
  }

  input.value = formatted
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
        errorMessage = 'Teléfono inválido. Debe ser un número venezolano'
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

    case 'delivery-municipio':
      if (!field.value.trim()) {
        isValid = false
        errorMessage = 'El municipio es requerido'
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
    'delivery-municipio'
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

  // Save customer data if "remember me" is checked
  saveCustomerData()

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
      deliveryMunicipio: document.getElementById('delivery-municipio').value,
      deliveryZip: document.getElementById('delivery-zip').value || '',
      deliveryReferences: document.getElementById('delivery-references').value || '',
      additionalNotes: document.getElementById('additional-notes').value || ''
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.price_usd * item.quantity, 0)
    const shippingCost = deliveryMethod === 'delivery' ? deliveryCost : 0
    const totalUSD = subtotal + shippingCost
    const totalVES = totalUSD * bcvRate

    // Collect payment data
    const paymentData = {
      paymentMethod,
      orderReference,
      deliveryMethod,
      subtotal,
      shippingCost,
      totalUSD,
      totalVES,
      bcvRate
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
      delivery_city: customerData.deliveryMunicipio, // Municipio stored in city field
      delivery_state: 'Gran Caracas', // Fixed region
      delivery_zip: customerData.deliveryZip || '',
      delivery_notes: customerData.deliveryReferences || '',
      notes: customerData.additionalNotes || '',
      total_amount_usd: paymentData.totalUSD,
      total_amount_ves: paymentData.totalVES,
      currency_rate: paymentData.bcvRate,
      status: 'pending'
    },
    items: cartItems.map(item => ({
      product_id: item.id,
      product_name: item.name,
      product_summary: item.name,
      unit_price_usd: item.price_usd,
      unit_price_ves: item.price_usd * paymentData.bcvRate,
      quantity: item.quantity,
      subtotal_usd: item.price_usd * item.quantity,
      subtotal_ves: item.price_usd * item.quantity * paymentData.bcvRate
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
Total: ${orderData.total_amount_usd}

Método de pago: ${getPaymentMethodName(paymentMethod)}

Próximos pasos:
1. Complete el pago usando la referencia proporcionada
2. Recibirá un email de confirmación
3. Procesaremos su orden una vez confirmado el pago

¿Desea realizar otra compra?
  `

  if (confirm(message)) {
    // Clear cart and redirect to home
    clearCart()
    // Also clear customer data if they did not select "remember me"
    if (!document.getElementById('remember-me')?.checked) {
      localStorage.removeItem('customerData')
    }
    window.location.href = '/'
  } else {
    // Redirect to order tracking or home
    clearCart()
    // Also clear customer data if they did not select "remember me"
    if (!document.getElementById('remember-me')?.checked) {
      localStorage.removeItem('customerData')
    }
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
 * Accepts: (+58)-414-1234567, 0414-1234567, 04141234567, +584141234567
 */
function isValidVenezuelanPhone(phone) {
  if (!phone) {
    return false
  }

  // Remove all non-digits
  const digits = phone.replace(/\D/g, '')

  // Must start with 58 (international) or 0 (local)
  const validPrefixes = ['0412', '0414', '0416', '0424', '0426']

  // Check formats:
  // 1. (+58)-XXX-XXXXXXX = 12 digits starting with 58
  // 2. 0XXX-XXXXXXX = 10 digits starting with 0
  if (digits.startsWith('58') && digits.length === 12) {
    const localPart = '0' + digits.substring(2)
    return validPrefixes.some(prefix => localPart.startsWith(prefix))
  }

  if (digits.startsWith('0') && digits.length === 10) {
    return validPrefixes.some(prefix => digits.startsWith(prefix))
  }

  return false
}

/**
 * Load saved customer data from localStorage if exists
 */
function loadSavedCustomerData() {
  try {
    const savedData = localStorage.getItem('customerData')
    if (savedData) {
      const customerData = JSON.parse(savedData)

      // Populate form fields with saved data
      document.getElementById('customer-name').value = customerData.name || ''
      document.getElementById('customer-email').value = customerData.email || ''
      document.getElementById('customer-phone').value = customerData.phone || ''
      document.getElementById('delivery-address').value = customerData.address || ''
      document.getElementById('delivery-zip').value = customerData.zip || ''
      document.getElementById('delivery-references').value = customerData.references || ''
      document.getElementById('additional-notes').value = customerData.notes || ''

      // Set the delivery municipality if it exists
      if (customerData.municipio) {
        document.getElementById('delivery-municipio').value = customerData.municipio
      }

      // Check the remember me checkbox if user previously opted in
      if (customerData.rememberMe) {
        document.getElementById('remember-me').checked = true
      }
    }
  } catch (error) {
    console.error('Error loading saved customer data:', error)
  }
}

/**
 * Save customer data to localStorage if "remember me" is checked
 */
function saveCustomerData() {
  try {
    const rememberMeCheckbox = document.getElementById('remember-me')
    if (rememberMeCheckbox && rememberMeCheckbox.checked) {
      const customerData = {
        name: document.getElementById('customer-name').value,
        email: document.getElementById('customer-email').value,
        phone: document.getElementById('customer-phone').value,
        address: document.getElementById('delivery-address').value,
        municipio: document.getElementById('delivery-municipio').value,
        zip: document.getElementById('delivery-zip').value,
        references: document.getElementById('delivery-references').value,
        notes: document.getElementById('additional-notes').value,
        rememberMe: true
      }

      localStorage.setItem('customerData', JSON.stringify(customerData))
    } else {
      // If checkbox is not checked, remove any saved data
      localStorage.removeItem('customerData')
    }
  } catch (error) {
    console.error('Error saving customer data:', error)
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize icons first
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons()
  }

  // Then initialize payment functionality
  await init()
})
