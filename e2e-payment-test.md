# Test E2E: Proceso de Pago desde Carrito de Compras

## Objetivo

Realizar un test end-to-end completo para identificar el error en el proceso de pago en efectivo desde el carrito de compras.

## Prerrequisitos

- Servidor local corriendo: `npm run dev`
- Base de datos con productos de prueba
- Usuario de prueba (opcional)

## Test E2E Script

### Paso 1: Configuración Inicial

```javascript
// test-payment-e2e.js
const { chromium } = require('playwright')
const assert = require('assert')

;(async () => {
  console.log('🧪 INICIANDO TEST E2E - PROCESO DE PAGO')

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000 // Ralentizar para observar
  })

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    locale: 'es-VE'
  })

  const page = await context.newPage()

  // Escuchar todos los requests y responses
  page.on('request', request => {
    console.log(`📤 REQUEST: ${request.method()} ${request.url()}`)
  })

  page.on('response', response => {
    console.log(`📥 RESPONSE: ${response.status()} ${response.url()}`)
  })

  page.on('console', msg => {
    console.log(`🖥️  CONSOLE: ${msg.type()} - ${msg.text()}`)
  })

  page.on('pageerror', error => {
    console.log(`❌ PAGE ERROR: ${error.message}`)
  })

  try {
    await runPaymentTest(page)
  } catch (error) {
    console.log(`💥 TEST FAILED: ${error.message}`)
    console.error(error)
  } finally {
    await browser.close()
    console.log('🏁 TEST COMPLETADO')
  }
})()
```

### Paso 2: Navegación a la página principal

```javascript
async function runPaymentTest(page) {
  console.log('\n📍 PASO 1: Navegar a página principal')

  // Ir a la página principal
  await page.goto('http://localhost:3000')
  await page.waitForLoadState('networkidle')

  console.log('✅ Página principal cargada')

  // Verificar elementos clave
  const pageTitle = await page.title()
  console.log(`📄 Título de página: ${pageTitle}`)

  // Verificar navbar
  const navbar = await page.$('.navbar')
  assert(navbar, 'Navbar no encontrado')
  console.log('✅ Navbar presente')

  // Verificar sección de productos
  const productsSection = await page.$('#productos')
  assert(productsSection, 'Sección de productos no encontrada')
  console.log('✅ Sección de productos presente')
}
```

### Paso 3: Selección de producto y adición al carrito

```javascript
async function selectProductAndAddToCart(page) {
  console.log('\n📍 PASO 2: Seleccionar producto y añadir al carrito')

  // Esperar a que carguen los productos
  await page.waitForSelector('.product-card', { timeout: 10000 })
  console.log('✅ Productos cargados')

  // Tomar screenshot del estado inicial
  await page.screenshot({ path: 'screenshots/01-products-loaded.png' })

  // Seleccionar el primer producto disponible
  const firstProduct = await page.$('.product-card:first-child')
  assert(firstProduct, 'No se encontró ningún producto')

  const productName = await firstProduct.$eval('h3', el => el.textContent)
  console.log(`📦 Producto seleccionado: ${productName}`)

  // Buscar botón de añadir al carrito
  const addToCartBtn = await firstProduct.$('[data-action="add-to-cart"]')
  assert(addToCartBtn, 'Botón de añadir al carrito no encontrado')

  // Hacer clic en añadir al carrito
  console.log('🛒 Añadiendo producto al carrito...')
  await addToCartBtn.click()

  // Esperar confirmación visual
  await page.waitForTimeout(2000)

  // Verificar que el carrito se actualizó
  const cartBadge = await page.$('.cart-badge')
  const cartCount = await cartBadge.textContent()
  console.log(`🔢 Productos en carrito: ${cartCount}`)

  assert(parseInt(cartCount) > 0, 'El carrito no se actualizó correctamente')
  console.log('✅ Producto añadido al carrito exitosamente')

  await page.screenshot({ path: 'screenshots/02-product-added-to-cart.png' })
}
```

### Paso 4: Navegación al carrito de compras

```javascript
async function navigateToCart(page) {
  console.log('\n📍 PASO 3: Navegar al carrito de compras')

  // Hacer clic en el ícono del carrito
  const cartIcon = await page.$('[href="/pages/cart.html"]')
  assert(cartIcon, 'Ícono del carrito no encontrado')

  console.log('➡️  Navegando al carrito...')
  await cartIcon.click()

  // Esperar a que cargue la página del carrito
  await page.waitForURL('**/cart.html', { timeout: 10000 })
  await page.waitForLoadState('networkidle')

  console.log('✅ Página del carrito cargada')

  // Verificar elementos del carrito
  const cartTitle = await page.$('h1, h2')
  const titleText = await cartTitle.textContent()
  console.log(`📄 Título de página: ${titleText}`)

  // Verificar que hay productos en el carrito
  const cartItems = await page.$$('.cart-item')
  console.log(`🛍️  Productos en carrito: ${cartItems.length}`)

  assert(cartItems.length > 0, 'No hay productos en el carrito')

  await page.screenshot({ path: 'screenshots/03-cart-page.png' })
}
```

### Paso 5: Iniciar proceso de checkout

```javascript
async function initiateCheckout(page) {
  console.log('\n📍 PASO 4: Iniciar proceso de checkout')

  // Buscar botón de "Proceder al pago" o similar
  const checkoutButtons = await page.$$('button, [role="button"]')
  let checkoutBtn = null

  for (const btn of checkoutButtons) {
    const text = await btn.textContent()
    if (
      text.toLowerCase().includes('proceder') ||
      text.toLowerCase().includes('pagar') ||
      text.toLowerCase().includes('checkout')
    ) {
      checkoutBtn = btn
      break
    }
  }

  if (!checkoutBtn) {
    // Intentar encontrar por clase común
    checkoutBtn = await page.$('.btn-checkout, .btn-pay, [data-action="checkout"]')
  }

  assert(checkoutBtn, 'Botón de checkout no encontrado')

  const checkoutText = await checkoutBtn.textContent()
  console.log(`💳 Botón de checkout encontrado: ${checkoutText}`)

  // Hacer clic en checkout
  console.log('💳 Iniciando proceso de checkout...')
  await checkoutBtn.click()

  // Esperar posibles diálogos o formularios
  await page.waitForTimeout(3000)

  await page.screenshot({ path: 'screenshots/04-checkout-initiated.png' })
}
```

### Paso 6: Completar formulario de pedido

```javascript
async function fillOrderForm(page) {
  console.log('\n📍 PASO 5: Completar formulario de pedido')

  // Esperar a que cargue el formulario de pedido
  await page.waitForSelector('form', { timeout: 10000 })

  // Verificar que estamos en la página de checkout
  const currentUrl = page.url()
  console.log(`📍 URL actual: ${currentUrl}`)

  // Completar datos del cliente
  const customerData = {
    name: 'María Pérez',
    email: 'maria@test.com',
    phone: '+584121234567'
  }

  // Buscar y completar campos
  try {
    // Nombre
    const nameInput = await page.$(
      '[name="customer_name"], #customer_name, [placeholder*="nombre" i]'
    )
    if (nameInput) {
      await nameInput.fill(customerData.name)
      console.log('✅ Nombre completado')
    }

    // Email
    const emailInput = await page.$('[name="customer_email"], #customer_email, [type="email"]')
    if (emailInput) {
      await emailInput.fill(customerData.email)
      console.log('✅ Email completado')
    }

    // Teléfono
    const phoneInput = await page.$(
      '[name="customer_phone"], #customer_phone, [placeholder*="teléfono" i]'
    )
    if (phoneInput) {
      await phoneInput.fill(customerData.phone)
      console.log('✅ Teléfono completado')
    }

    // Dirección de entrega
    const addressInput = await page.$(
      '[name="delivery_address"], #delivery_address, [placeholder*="dirección" i]'
    )
    if (addressInput) {
      await addressInput.fill('Av. Principal, Urbanización Los Palos Grandes, Caracas')
      console.log('✅ Dirección completada')
    }

    // Fecha de entrega
    const dateInput = await page.$('[name="delivery_date"], #delivery_date, [type="date"]')
    if (dateInput) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateStr = tomorrow.toISOString().split('T')[0]
      await dateInput.fill(dateStr)
      console.log('✅ Fecha de entrega completada')
    }
  } catch (error) {
    console.log(`⚠️  Advertencia al completar formulario: ${error.message}`)
  }

  await page.screenshot({ path: 'screenshots/05-order-form-filled.png' })
}
```

### Paso 7: Seleccionar método de pago en efectivo

```javascript
async function selectCashPayment(page) {
  console.log('\n📍 PASO 6: Seleccionar método de pago en efectivo')

  // Buscar sección de métodos de pago
  const paymentSection = await page.$('[data-payment-methods], #payment-methods, .payment-methods')
  if (paymentSection) {
    console.log('💰 Sección de métodos de pago encontrada')
  }

  // Buscar opción de pago en efectivo
  const cashOptions = await page.$$('input[type="radio"], .payment-option, [data-payment-type]')
  let cashOption = null

  for (const option of cashOptions) {
    const text = await option.textContent()
    const value = (await option.getAttribute('value')) || ''

    if (
      text.toLowerCase().includes('efectivo') ||
      text.toLowerCase().includes('cash') ||
      value.toLowerCase().includes('cash') ||
      value.toLowerCase().includes('efectivo')
    ) {
      cashOption = option
      break
    }
  }

  if (!cashOption) {
    // Intentar encontrar por atributos específicos
    cashOption = await page.$(
      '[value*="cash" i], [data-payment-type*="cash" i], [data-method*="cash" i]'
    )
  }

  if (cashOption) {
    console.log('💵 Opción de pago en efectivo encontrada')
    await cashOption.click()
    console.log('✅ Método de pago en efectivo seleccionado')
  } else {
    console.log('⚠️  Opción de pago en efectivo no encontrada, continuando...')
  }

  await page.screenshot({ path: 'screenshots/06-cash-payment-selected.png' })
}
```

### Paso 8: Confirmar y enviar pedido

```javascript
async function confirmAndSubmitOrder(page) {
  console.log('\n📍 PASO 7: Confirmar y enviar pedido')

  // Buscar botón de confirmación/envío
  const submitButtons = await page.$$(
    'button[type="submit"], .btn-submit, .btn-confirm, [data-action*="submit" i]'
  )
  let submitBtn = null

  for (const btn of submitButtons) {
    const text = await btn.textContent()
    if (
      text.toLowerCase().includes('confirmar') ||
      text.toLowerCase().includes('enviar') ||
      text.toLowerCase().includes('completar') ||
      text.toLowerCase().includes('finalizar')
    ) {
      submitBtn = btn
      break
    }
  }

  if (!submitBtn) {
    // Intentar encontrar botón por defecto
    submitBtn = await page.$('button[type="submit"]:not(.hidden)')
  }

  if (!submitBtn) {
    console.log('❌ Botón de envío no encontrado')
    throw new Error('Botón de envío del pedido no encontrado')
  }

  const submitText = await submitBtn.textContent()
  console.log(`📤 Botón de envío encontrado: ${submitText}`)

  // Capturar estado antes del envío
  await page.screenshot({ path: 'screenshots/07-before-submit.png' })

  // Hacer clic en enviar pedido
  console.log('📤 Enviando pedido...')
  await submitBtn.click()

  // Esperar respuesta
  try {
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Capturar cualquier mensaje de error o éxito
    await page.waitForTimeout(3000)

    await page.screenshot({ path: 'screenshots/08-after-submit.png' })

    // Buscar mensajes de éxito o error
    const successMessages = await page.$$('.text-success, .success-message, [class*="success" i]')
    const errorMessages = await page.$$(
      '.text-error, .error-message, [class*="error" i], .alert-error'
    )

    console.log(`✅ Mensajes de éxito encontrados: ${successMessages.length}`)
    console.log(`❌ Mensajes de error encontrados: ${errorMessages.length}`)

    // Si hay mensajes de error, mostrarlos
    for (const errorMsg of errorMessages) {
      const errorText = await errorMsg.textContent()
      console.log(`💥 ERROR DETECTADO: ${errorText.trim()}`)
    }

    // Verificar URL actual
    const finalUrl = page.url()
    console.log(`📍 URL final: ${finalUrl}`)
  } catch (error) {
    console.log(`⏱️  Timeout esperando respuesta, esto podría indicar un problema`)
    await page.screenshot({ path: 'screenshots/08-timeout-error.png' })

    // Verificar si hay errores visibles
    const visibleErrors = await page.$$('.text-error, .alert-error, [class*="error"]')
    for (const errorEl of visibleErrors) {
      const errorText = await errorEl.textContent()
      console.log(`💥 ERROR VISIBLE: ${errorText.trim()}`)
    }

    throw error
  }
}
```

### Paso 9: Verificación final y diagnóstico

```javascript
async function diagnoseIssues(page) {
  console.log('\n📍 PASO 8: Diagnóstico de problemas')

  // Verificar Network Requests
  console.log('\n📡 VERIFICACIÓN DE NETWORK REQUESTS:')

  // Buscar requests fallidos
  const failedRequests = []
  page.on('requestfailed', request => {
    failedRequests.push({
      url: request.url(),
      failure: request.failure().errorText
    })
  })

  console.log(`❌ Requests fallidos: ${failedRequests.length}`)
  failedRequests.forEach(req => {
    console.log(`  - ${req.url}: ${req.failure}`)
  })

  // Verificar Console Errors
  console.log('\n🖥️  VERIFICACIÓN DE ERRORES EN CONSOLA:')

  // Verificar estado del carrito
  console.log('\n🛒 ESTADO DEL CARRITO:')
  try {
    const cartBadge = await page.$('.cart-badge')
    if (cartBadge) {
      const count = await cartBadge.textContent()
      console.log(`  Productos en carrito: ${count}`)
    }
  } catch (error) {
    console.log(`  Error al verificar carrito: ${error.message}`)
  }

  // Verificar cookies y localStorage
  console.log('\n💾 VERIFICACIÓN DE ALMACENAMIENTO LOCAL:')
  try {
    const cartData = await page.evaluate(() => {
      return localStorage.getItem('cart') || 'No hay datos de carrito'
    })
    console.log(`  Datos del carrito: ${cartData.substring(0, 100)}...`)
  } catch (error) {
    console.log(`  Error al leer localStorage: ${error.message}`)
  }

  // Tomar screenshot final
  await page.screenshot({ path: 'screenshots/09-final-state.png', fullPage: true })
}
```

### Paso 10: Función principal del test

```javascript
async function runCompletePaymentTest(page) {
  try {
    // Paso 1: Navegar a página principal
    await runPaymentTest(page)

    // Paso 2: Seleccionar producto y añadir al carrito
    await selectProductAndAddToCart(page)

    // Paso 3: Navegar al carrito
    await navigateToCart(page)

    // Paso 4: Iniciar checkout
    await initiateCheckout(page)

    // Paso 5: Completar formulario de pedido
    await fillOrderForm(page)

    // Paso 6: Seleccionar pago en efectivo
    await selectCashPayment(page)

    // Paso 7: Confirmar y enviar pedido
    await confirmAndSubmitOrder(page)

    // Paso 8: Diagnóstico de problemas
    await diagnoseIssues(page)

    console.log('\n✅ TEST E2E COMPLETADO EXITOSAMENTE')
  } catch (error) {
    console.log(`\n💥 TEST E2E FALLIDO:`)
    console.log(`   Mensaje: ${error.message}`)
    console.log(`   Stack: ${error.stack}`)

    // Diagnóstico adicional
    await diagnoseIssues(page)

    throw error
  }
}

// Exportar funciones para uso modular
module.exports = {
  runPaymentTest,
  selectProductAndAddToCart,
  navigateToCart,
  initiateCheckout,
  fillOrderForm,
  selectCashPayment,
  confirmAndSubmitOrder,
  diagnoseIssues,
  runCompletePaymentTest
}
```

## Instrucciones de Ejecución

### 1. Crear directorio de screenshots

```bash
mkdir -p screenshots
```

### 2. Ejecutar el test

```bash
node test-payment-e2e.js
```

## Análisis de Errores Comunes

### Posibles causas del error en pago en efectivo:

1. **Validación de formulario incompleta**

   ```
   ❌ Campo requerido no completado
   ❌ Formato de email inválido
   ❌ Teléfono en formato incorrecto
   ```

2. **Problemas de comunicación con backend**

   ```
   ❌ Error 400: Datos mal formateados
   ❌ Error 500: Error interno del servidor
   ❌ Timeout en la petición
   ```

3. **Errores de validación de stock**

   ```
   ❌ Producto no disponible
   ❌ Stock insuficiente
   ❌ Producto inactivo
   ```

4. **Problemas de autenticación/permisos**

   ```
   ❌ Usuario no autenticado
   ❌ Permisos insuficientes
   ❌ Token expirado
   ```

5. **Errores en el flujo de datos**
   ```
   ❌ Datos del carrito corruptos
   ❌ IDs de productos inválidos
   ❌ Precios inconsistentes
   ```

## Comandos de diagnóstico adicionales

### Verificar estado del carrito en localStorage:

```javascript
// En la consola del navegador
console.log(JSON.parse(localStorage.getItem('cart') || '{}'))
```

### Verificar estado de autenticación:

```javascript
// En la consola del navegador
console.log(localStorage.getItem('authToken'))
console.log(sessionStorage.getItem('user'))
```

### Verificar network requests fallidos:

```javascript
// En DevTools Network tab, filtrar por "Failed" o "XHR"
// O usar Performance tab para ver tiempos de carga
```

Este test E2E completo te ayudará a identificar exactamente dónde ocurre el error en el proceso de pago en efectivo, proporcionando logs detallados y screenshots en cada paso del proceso.
