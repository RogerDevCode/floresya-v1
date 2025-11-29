# 🎯 FloresYa API Client - Usage Guide

**Auto-generated**: 2025-11-29T13:28:25.490Z
**Spec Version**: 1.0.0
**Total Endpoints**: 65

## 📦 Installation

```javascript
import { api } from './shared/api-client.js'
```

## 🚀 Quick Start

```javascript
// Get all products
const products = await api.getAllProducts({ limit: 10, featured: true })

// Get single product
const product = await api.getProduct(67)

// Create order
const order = await api.createOrders({
  order: { customer_email: 'user@example.com', ... },
  items: [{ product_id: 67, quantity: 1, ... }]
})
```

## 🛡️ Error Handling

```javascript
try {
  const products = await api.getAllProducts()
  console.log('Products:', products.data)
} catch (error) {
  const userMessage = api.handleError(error)
  showError(userMessage)
}
```

## 📋 Available Methods

This client was auto-generated from the OpenAPI specification.
All 65 endpoints are available as methods.

**IMPORTANT**: This file is regenerated automatically. Do not edit manually.
Regenerate using: `npm run generate:client`

For detailed API documentation, visit: http://localhost:3000/api-docs
