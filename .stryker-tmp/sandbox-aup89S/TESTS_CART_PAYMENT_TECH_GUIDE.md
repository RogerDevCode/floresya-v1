# 🔧 Guía Técnica - Tests E2E Cart & Payment

## 📚 Índice

1. [Arquitectura](#arquitectura)
2. [Fixtures y Mocks](#fixtures-y-mocks)
3. [Comandos Personalizados](#comandos-personalizados)
4. [Estructura de Tests](#estructura-de-tests)
5. [Mejores Prácticas](#mejores-prácticas)
6. [Debugging](#debugging)
7. [CI/CD Integration](#cicd-integration)

---

## 🏗️ Arquitectura

### Diseño de Tests

```
┌─────────────────────────────────────┐
│         Test Spec (.cy.js)          │
│  ┌───────────────────────────────┐  │
│  │  describe() - Test Suite      │  │
│  │    ├── beforeEach()           │  │
│  │    ├── it() - Test Case 1     │  │
│  │    ├── it() - Test Case 2     │  │
│  │    └── afterEach()            │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
            ↓ usa
┌─────────────────────────────────────┐
│   Custom Commands (commands.js)     │
│  ┌───────────────────────────────┐  │
│  │  cy.setupCart()               │  │
│  │  cy.mockSettings()            │  │
│  │  cy.fillCustomerForm()        │  │
│  │  cy.completeCheckout()        │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
            ↓ usa
┌─────────────────────────────────────┐
│       Fixtures (JSON)               │
│  ┌───────────────────────────────┐  │
│  │  cart-items.json              │  │
│  │  settings.json                │  │
│  │  order-response.json          │  │
│  │  payment-confirmation.json    │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Flujo de Ejecución

```
1. beforeEach()
   ├── cy.clearCart()
   ├── cy.setupCart()
   └── cy.mockCartPaymentApis()

2. Test Case (it)
   ├── cy.visit('/pages/cart.html')
   ├── cy.wait('@getSettings')
   ├── Interacciones con UI
   └── Assertions

3. afterEach()
   └── cy.clearCart()
```

---

## 🗂️ Fixtures y Mocks

### cart-items.json

```json
[
  {
    "id": 1,
    "name": "Ramo de Rosas Rojas",
    "price_usd": 25.99,
    "stock": 10,
    "quantity": 2,
    "image_thumb": "/images/products/rosas-rojas-thumb.jpg",
    "description": "Hermoso ramo de 12 rosas rojas"
  }
]
```

**Uso**: Mock de items para carrito en tests.

### settings.json

```json
{
  "success": true,
  "data": [
    { "key": "DELIVERY_COST_USD", "value": "5.00" },
    { "key": "bcv_usd_rate", "value": "40.50" }
  ]
}
```

**Uso**: Mock de respuesta de `GET /api/settings/public`.

### order-response.json

```json
{
  "success": true,
  "data": {
    "id": 12345,
    "customer_email": "test@example.com",
    "customer_name": "Juan Pérez",
    "total_amount_usd": 75.48,
    "status": "pending"
  }
}
```

**Uso**: Mock de respuesta de `POST /api/orders`.

### payment-confirmation.json

```json
{
  "success": true,
  "data": {
    "payment_id": 67890,
    "order_id": 12345,
    "payment_method": "cash",
    "status": "confirmed"
  }
}
```

**Uso**: Mock de respuesta de `POST /api/orders/:id/payments`.

---

## 🎯 Comandos Personalizados

### Categorías de Comandos

#### 1. Cart Management

```javascript
cy.setupCart(items?)        // Setup carrito con items
cy.clearCart()              // Limpiar carrito y localStorage
cy.addToCart(item)          // Agregar item individual
cy.getCartCount()           // Obtener cantidad de items
```

#### 2. API Mocking

```javascript
cy.mockSettings()                      // Mock GET /api/settings/public
cy.mockCreateOrder(status?, response?) // Mock POST /api/orders
cy.mockConfirmPayment(orderId, status?, response?) // Mock POST /api/orders/:id/payments
cy.mockCartPaymentApis()               // Mock todas las APIs
```

#### 3. Form Filling

```javascript
cy.fillCustomerForm(data?)             // Llenar formulario cliente
cy.fillPaymentDetails(method, details) // Llenar detalles de pago
```

#### 4. Selection

```javascript
cy.selectDeliveryMethod(method) // 'pickup' | 'delivery'
cy.selectPaymentMethod(method) // 'cash' | 'mobile_payment' | 'bank_transfer' | 'zelle' | 'crypto'
```

#### 5. Complete Flows

```javascript
cy.completeCheckout(delivery, payment, customerData?)
```

#### 6. Verification

```javascript
cy.verifyCartSummary(items, subtotal, total)
cy.verifyOrderConfirmation(orderId)
```

#### 7. Waiting

```javascript
cy.waitForCartPage()
cy.waitForPaymentPage()
```

### Ejemplo de Uso Completo

```javascript
describe('Payment Flow', () => {
  beforeEach(() => {
    cy.clearCart()
    cy.setupCart()
    cy.mockCartPaymentApis()
    cy.visit('/pages/payment.html')
    cy.wait('@getSettings')
  })

  it('should complete cash payment', () => {
    cy.completeCheckout('pickup', 'cash')
    cy.wait('@createOrder')
    cy.verifyOrderConfirmation(12345)
  })
})
```

---

## 📁 Estructura de Tests

### Cart Tests Structure

```javascript
describe('Shopping Cart Page - E2E Tests', () => {
  beforeEach(() => {
    cy.clearCart()
    cy.mockSettings()
    cy.visit('/pages/cart.html')
  })

  describe('Empty Cart State', () => {
    it('should display empty cart message', () => {})
    it('should disable checkout button', () => {})
  })

  describe('Cart with Items', () => {
    beforeEach(() => {
      cy.setupCart()
      cy.visit('/pages/cart.html')
    })

    it('should display items correctly', () => {})
    it('should calculate totals', () => {})
  })

  describe('Quantity Controls', () => {
    it('should increase quantity', () => {})
    it('should decrease quantity', () => {})
  })

  // ... más describes
})
```

### Payment Tests Structure

```javascript
describe('Payment Page - E2E Tests', () => {
  beforeEach(() => {
    cy.clearCart()
    cy.setupCart()
    cy.mockCartPaymentApis()
    cy.visit('/pages/payment.html')
    cy.wait('@getSettings')
  })

  describe('Form Validation', () => {
    it('should validate email', () => {})
    it('should validate phone', () => {})
  })

  describe('Cash Payment Flow', () => {
    it('should complete payment', () => {})
  })

  // ... más describes
})
```

---

## 🎓 Mejores Prácticas

### 1. Usar beforeEach para setup común

```javascript
beforeEach(() => {
  cy.clearCart() // Limpiar estado previo
  cy.setupCart() // Setup datos de prueba
  cy.mockCartPaymentApis() // Mock APIs
  cy.visit('/pages/cart.html')
})
```

### 2. Usar afterEach para cleanup

```javascript
afterEach(() => {
  cy.clearCart() // Limpiar después de cada test
})
```

### 3. Usar cy.wait() para intercepts

```javascript
cy.mockSettings()
cy.visit('/pages/cart.html')
cy.wait('@getSettings') // Esperar que se complete la llamada
```

### 4. Verificar requests con assertions

```javascript
cy.wait('@createOrder')
  .its('request.body')
  .should('deep.include', {
    order: {
      customer_name: 'Juan Pérez'
    }
  })
```

### 5. Usar comandos personalizados para reutilización

```javascript
// ❌ Malo - repetir código
cy.get('#customer-name').type('Juan')
cy.get('#customer-email').type('juan@test.com')
// ...

// ✅ Bueno - usar comando
cy.fillCustomerForm()
```

### 6. Tests independientes

```javascript
// ❌ Malo - test depende de otro
it('test 1', () => {
  cy.setupCart()
})
it('test 2', () => {
  // Asume que cart ya está configurado
})

// ✅ Bueno - cada test es independiente
it('test 1', () => {
  cy.setupCart()
})
it('test 2', () => {
  cy.setupCart() // Setup propio
})
```

### 7. Descriptores claros

```javascript
// ❌ Malo
it('test 1', () => {})

// ✅ Bueno
it('should display empty cart message when cart is empty', () => {})
```

---

## 🐛 Debugging

### 1. Modo Interactivo

```bash
npx cypress open
```

Permite ver la ejecución en tiempo real.

### 2. Screenshots automáticos

Cypress toma screenshots automáticamente en fallos:

```
cypress/screenshots/cart.cy.js/
```

### 3. Videos de ejecución

```
cypress/videos/cart.cy.js.mp4
```

### 4. Logs en consola

```javascript
cy.wait('@createOrder').then(intercept => {
  console.log('Request:', intercept.request)
  console.log('Response:', intercept.response)
})
```

### 5. Pause en test

```javascript
it('test', () => {
  cy.setupCart()
  cy.pause() // Pausa aquí
  cy.visit('/pages/cart.html')
})
```

### 6. Debug específico

```javascript
cy.get('#customer-name').debug()
```

---

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests - Cart & Payment

on: [push, pull_request]

jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          spec: |
            cypress/e2e/pages/cart.cy.js
            cypress/e2e/pages/payment.cy.js
          browser: chrome
          headless: true

      - name: Upload screenshots
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-screenshots
          path: cypress/screenshots

      - name: Upload videos
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: cypress-videos
          path: cypress/videos
```

### Script en package.json

```json
{
  "scripts": {
    "test:e2e:cart": "cypress run --spec cypress/e2e/pages/cart.cy.js",
    "test:e2e:payment": "cypress run --spec cypress/e2e/pages/payment.cy.js",
    "test:e2e:cart-payment": "cypress run --spec 'cypress/e2e/pages/{cart,payment}.cy.js'"
  }
}
```

---

## 📊 Coverage Reports

### Generar reporte

```bash
npx nyc cypress run --spec "cypress/e2e/pages/cart.cy.js"
```

### Ver reporte HTML

```bash
npx nyc report --reporter=html
open coverage/index.html
```

---

## 🔒 Security Considerations

1. **No hardcodear datos sensibles** en fixtures
2. **Usar variables de entorno** para datos de prueba
3. **Limpiar localStorage** después de tests
4. **No commitear videos/screenshots** con datos reales

---

## 📖 Referencias

- [Cypress Docs](https://docs.cypress.io)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Custom Commands](https://docs.cypress.io/api/cypress-api/custom-commands)
- [Intercept](https://docs.cypress.io/api/commands/intercept)

---

**Autor**: Copilot CLI  
**Última actualización**: 2025-11-18  
**Versión**: 1.0.0
