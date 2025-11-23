# 🚫 API Contract Enforcement - OBLIGATORIO

## ⚠️ REGLAS OBLIGATORIAS PARA TODOS LOS DESARROLLADORES

**"Si está en IA.md, es ley. Si viola la ley, ejecutar inmediatamente."**

---

## 🚫 PROHIBIDO ABSOLUTAMENTE

### ❌ 1. Llamadas Directas a fetch()

```javascript
// ❌ PROHIBIDO - ESLint bloqueará esto
const response = await fetch('/api/products')
const data = await response.json()

// ❌ PROHIBIDO - ESLint bloqueará esto
fetch('/api/orders', {
  method: 'POST',
  body: JSON.stringify(orderData)
})
```

### ❌ 2. XMLHttpRequest

```javascript
// ❌ PROHIBIDO
const xhr = new XMLHttpRequest()
xhr.open('GET', '/api/products')
xhr.send()
```

### ❌ 3. Librerías HTTP Externas

```javascript
// ❌ PROHIBIDO
import axios from 'axios'
const response = await axios.get('/api/products')
```

### ❌ 4. URLs Hardcodeadas

```javascript
// ❌ PROHIBIDO - ESLint bloqueará esto
const apiUrl = 'https://api.floresya.com/api/products'
const response = await fetch(apiUrl)
```

### ❌ 5. Imports del API Client Antiguo

```javascript
// ❌ PROHIBIDO - Usa el generado
import { api } from './shared/api.js'
```

---

## ✅ OBLIGATORIO - USAR SOLO EL CLIENTE GENERADO

### ✅ 1. Importar el Cliente Generado

```javascript
// ✅ OBLIGATORIO - Solo esta importación
import { api } from './shared/api-client.js'
```

### ✅ 2. Usar Métodos del Cliente API

```javascript
// ✅ Productos
const products = await api.getProducts({ featured: true, limit: 20 })
const product = await api.getProduct(67)
const carouselProducts = await api.getCarouselProducts()

// ✅ Órdenes
const orders = await api.getOrders({ status: 'pending' })
const order = await api.createOrder(orderData)
await api.updateOrderStatus(123, 'verified')

// ✅ Usuarios
const users = await api.getUsers({ role: 'admin' })
const user = await api.createUser(userData)

// ✅ Configuración
const settings = await api.getPublicSettings()
const siteName = await api.getSettingValue('site_name')
```

### ✅ 3. Manejo de Errores

```javascript
// ✅ Siempre usar el manejador de errores del cliente
try {
  const products = await api.getProducts()
  console.log('Productos:', products.data)
} catch (error) {
  const userMessage = api.handleError(error)
  showError(userMessage)
}
```

### ✅ 4. Validación Antes de Enviar

```javascript
// ✅ Validar datos antes de enviar al servidor
const productValidation = api.validateProduct(productData)
if (!productValidation.isValid) {
  showErrors(productValidation.errors)
  return
}

const orderValidation = api.validateOrder(orderData)
if (!orderValidation.isValid) {
  showErrors(orderValidation.errors)
  return
}
```

---

## 🔧 SETUP OBLIGATORIO PARA DESARROLLO

### 1. Generar Cliente API Siempre

```bash
# ✅ OBLIGATORIO antes de desarrollar frontend
npm run generate:client
```

### 2. Validar Contrato Siempre

```bash
# ✅ OBLIGATORIO antes de hacer commit
npm run validate:frontend

# ✅ OBLIGATORIO validación completa
npm run validate:full
```

### 3. ESLint Aplicará las Reglas Automáticamente

```bash
# ✅ ESLint bloqueará violaciones automáticamente
npm run lint

# ✅ Auto-fix cuando sea posible
npm run lint:fix
```

---

## 🚨 SISTEMA DE APLICACIÓN AUTOMÁTICA

### Pre-commit Hook

```bash
# ✅ Se ejecuta automáticamente antes de cada commit
npm run enforce:contract:pre-commit
```

### CI/CD Pipeline

```bash
# ✅ Se ejecuta en producción/CI
npm run enforce:contract:ci
```

### Validación Completa

```bash
# ✅ Ejecuta todo el workflow de validación
npm run enforce:contract
```

---

## 📊 MONITOREO Y REPORTES

### Reportes Automáticos

- `frontend-contract-report.json` - Reporte de validación frontend
- `contract-workflow-report.json` - Reporte completo del workflow
- ESLint mostrará errores en tiempo real en tu IDE

### Dashboard de Cumplimiento

```bash
# ✅ Ver estado del contrato
npm run enforce:contract
```

---

## 🎯 EJEMPLOS PRÁCTICOS OBLIGATORIOS

### Página de Productos

```javascript
// ✅ pages/productos.js - OBLIGATORIO
import { api } from '../shared/api-client.js'

export class ProductosPage {
  async loadProducts() {
    try {
      // ✅ SOLO usar el cliente generado
      const response = await api.getProducts({
        featured: true,
        limit: 20,
        imageSize: 'medium'
      })

      return response.data
    } catch (error) {
      // ✅ Siempre usar el manejador de errores
      throw new Error(api.handleError(error))
    }
  }
}
```

### Carrito de Compras

```javascript
// ✅ pages/cart.js - OBLIGATORIO
import { api } from '../shared/api-client.js'

export class Cart {
  async addToCart(productId, quantity) {
    try {
      // ✅ Obtener datos del producto usando el cliente
      const product = await api.getProduct(productId)

      const cartItem = {
        product: product.data,
        quantity: quantity
      }

      // ✅ Agregar a almacenamiento local
      this.updateLocalCart(cartItem)
    } catch (error) {
      showError(api.handleError(error))
    }
  }
}
```

### Checkout

```javascript
// ✅ pages/checkout.js - OBLIGATORIO
import { api } from '../shared/api-client.js'

export class Checkout {
  async processOrder(orderData) {
    try {
      // ✅ Validar antes de enviar
      const validation = api.validateOrder(orderData)
      if (!validation.isValid) {
        showErrors(validation.errors)
        return
      }

      // ✅ Crear orden usando el cliente
      const response = await api.createOrder(orderData)

      // ✅ Redirigir usando el ID del contrato
      window.location.href = `/order-confirmation/${response.data.id}`
    } catch (error) {
      showError(api.handleError(error))
    }
  }
}
```

---

## 🚨 CONSECUENCIAS DE VIOLACIONES

### Durante Desarrollo

- ❌ ESLint bloqueará el código
- ❌ Pre-commit hook rechazará el commit
- ❌ IDE mostrará errores en tiempo real

### En Producción

- ❌ CI/CD pipeline fallará
- ❌ Deploy será rechazado
- ❌ Código no podrá llegar a producción

---

## 🔧 PRÓXIMOS PASOS OBLIGATORIOS

1. **INMEDIATO**: Reemplaza todas las llamadas `fetch()` con `api.clientName()`
2. **INMEDIATO**: Actualiza todos los imports para usar `api-client.js`
3. **INMEDIATO**: Ejecuta `npm run validate:frontend` para verificar cumplimiento
4. **SEMANAL**: Regenera el cliente API: `npm run generate:client`
5. **COMMIT**: Siempre ejecuta `npm run enforce:contract:pre-commit`

---

## 📞 SOPORTE

Si encuentras alguna limitación del cliente generado:

1. **Primero**: Verifica que estás usando la versión más reciente: `npm run generate:client`
2. **Segundo**: Revisa la documentación: `public/js/shared/API_USAGE.md`
3. **Tercero**: Reporta el issue para mejorar el generador automático

**🎯 Recuerda: El contrato API es la fuente de verdad. Todo el código debe cumplirlo estrictamente.**
