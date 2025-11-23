# 🚀 Frontend API Client Migration Guide

## 📋 Migration Overview

Found 55 API calls that should be migrated to use the generated API client.

## 🎯 Migration Benefits

- ✅ **Type Safety** - Compile-time error detection
- ✅ **Consistent Error Handling** - Standardized error messages
- ✅ **Automatic Validation** - Request/response validation
- ✅ **Better Maintainability** - Centralized API logic
- ✅ **Enhanced Features** - Caching, retry logic, etc.

## 📁 Files to Migrate

### index.html

**1 calls to migrate**

#### 1. Line 268

**Current:**

```javascript
">Todas las ocasiones</option>
                <!-- Options loaded dynamically from /api/occasions -->
              </select>
            </div>
            <div>
              <label for="
```

**Migrated:**

```javascript
api.request(">Todas las ocasiones</option>
                <!-- Options loaded dynamically from /api/occasions -->
              </select>
            </div>
            <div>
              <label for=")
```

### index.js

**3 calls to migrate**

#### 1. Line 72

**Current:**

```javascript
fetch('/api/products/carousel'
```

**Migrated:**

```javascript
api.getCarouselProducts()
```

#### 2. Line 286

**Current:**

```javascript
fetch('/api/occasions'
```

**Migrated:**

```javascript
api.request('/api/occasions')
```

#### 3. Line 334

**Current:**

```javascript
;`/api/products?limit=${PRODUCTS_PER_PAGE}&offset=${offset}`
```

**Migrated:**

```javascript
api.getProduct(productId)
```

### js/components/**tests**/imageCarousel.test.js

**1 calls to migrate**

#### 1. Line 184

**Current:**

```javascript
'/api/products/67/images?size=small'
```

**Migrated:**

```javascript
api.getProductImages(productId)
```

### js/shared/api-client.js

**13 calls to migrate**

#### 1. Line 65

**Current:**

```javascript
'/api/products'
```

**Migrated:**

```javascript
api.getProducts(filters)
```

#### 2. Line 86

**Current:**

```javascript
'/api/products/'
```

**Migrated:**

```javascript
api.getProduct(productId)
```

#### 3. Line 99

**Current:**

```javascript
'/api/products/sku/'
```

**Migrated:**

```javascript
api.getProductBySku(sku)
```

#### 4. Line 106

**Current:**

```javascript
'/api/products/carousel'
```

**Migrated:**

```javascript
api.getCarouselProducts()
```

#### 5. Line 121

**Current:**

```javascript
'/api/products/with-occasions'
```

**Migrated:**

```javascript
api.getProduct(productId)
```

#### 6. Line 142

**Current:**

```javascript
'/api/products/occasion/'
```

**Migrated:**

```javascript
api.getProduct(productId)
```

#### 7. Line 271

**Current:**

```javascript
'/api/orders'
```

**Migrated:**

```javascript
api.getOrders(filters)
```

#### 8. Line 284

**Current:**

```javascript
'/api/orders/'
```

**Migrated:**

```javascript
api.getOrder(orderId)
```

#### 9. Line 303

**Current:**

```javascript
'/api/orders/user/'
```

**Migrated:**

```javascript
api.getOrder(orderId)
```

#### 10. Line 363

**Current:**

```javascript
'/api/users'
```

**Migrated:**

```javascript
api.getUsers(filters)
```

#### 11. Line 376

**Current:**

```javascript
'/api/users/'
```

**Migrated:**

```javascript
api.getUser(userId)
```

#### 12. Line 409

**Current:**

```javascript
'/api/settings/public'
```

**Migrated:**

```javascript
api.getPublicSettings()
```

#### 13. Line 424

**Current:**

```javascript
'/api/settings/map'
```

**Migrated:**

```javascript
api.getPublicSettings()
```

### pages/**tests**/product-detail.test.js

**7 calls to migrate**

#### 1. Line 77

**Current:**

```javascript
fetch('/api/products/67'
```

**Migrated:**

```javascript
api.getProduct(productId)
```

#### 2. Line 125

**Current:**

```javascript
fetch('/api/products/67/images'
```

**Migrated:**

```javascript
api.getProductImages(productId)
```

#### 3. Line 148

**Current:**

```javascript
fetch('/api/products/999'
```

**Migrated:**

```javascript
api.getProduct(productId)
```

#### 4. Line 77

**Current:**

```javascript
fetch('/api/products/67'
```

**Migrated:**

```javascript
api.getProduct(productId)
```

#### 5. Line 77

**Current:**

```javascript
fetch('/api/products/67'
```

**Migrated:**

```javascript
api.getProduct(productId)
```

#### 6. Line 54

**Current:**

```javascript
'should fetch product data from /api/products/:id'
```

**Migrated:**

```javascript
api.getProduct(productId)
```

#### 7. Line 86

**Current:**

```javascript
'should fetch product images from /api/products/:id/images'
```

**Migrated:**

```javascript
api.getProductImages(productId)
```

### pages/admin/create-product.js

**3 calls to migrate**

#### 1. Line 99

**Current:**

```javascript
fetch('/api/settings/bcv_usd_rate/value'
```

**Migrated:**

```javascript
api.getPublicSettings()
```

#### 2. Line 441

**Current:**

```javascript
fetch('/api/products'
```

**Migrated:**

```javascript
api.getProducts(filters)
```

#### 3. Line 495

**Current:**

```javascript
fetch(`/api/products/${productId}/images`
```

**Migrated:**

```javascript
api.getProductImages(productId)
```

### pages/admin/dashboard.js

**11 calls to migrate**

#### 1. Line 65

**Current:**

```javascript
fetch(`/api/products/${product.id}/images?size=thumb`
```

**Migrated:**

```javascript
api.getProductImages(productId)
```

#### 2. Line 571

**Current:**

```javascript
fetch('/api/orders'
```

**Migrated:**

```javascript
api.getOrders(filters)
```

#### 3. Line 826

**Current:**

```javascript
fetch('/api/occasions'
```

**Migrated:**

```javascript
api.request('/api/occasions')
```

#### 4. Line 902

**Current:**

```javascript
fetch(`/api/products/occasion/${occasionId}`
```

**Migrated:**

```javascript
api.getProduct(productId)
```

#### 5. Line 1217

**Current:**

```javascript
fetch('/api/admin/settings/image'
```

**Migrated:**

```javascript
api.request('/api/admin/settings/image')
```

#### 6. Line 1217

**Current:**

```javascript
fetch('/api/admin/settings/image'
```

**Migrated:**

```javascript
api.request('/api/admin/settings/image')
```

#### 7. Line 1324

**Current:**

```javascript
fetch('/api/admin/settings/bcv-price'
```

**Migrated:**

```javascript
api.request('/api/admin/settings/bcv-price')
```

#### 8. Line 1366

**Current:**

```javascript
fetch('/api/settings/hero_image/value'
```

**Migrated:**

```javascript
api.getPublicSettings()
```

#### 9. Line 1393

**Current:**

```javascript
fetch('/api/settings/site_logo/value'
```

**Migrated:**

```javascript
api.getPublicSettings()
```

#### 10. Line 1420

**Current:**

```javascript
fetch('/api/settings/bcv_usd_rate/value'
```

**Migrated:**

```javascript
api.getPublicSettings()
```

#### 11. Line 23

**Current:**

```javascript
;`/api/products?includeInactive=${includeInactive}`
```

**Migrated:**

```javascript
api.getProduct(productId)
```

### pages/admin/edit-product.js

**6 calls to migrate**

#### 1. Line 102

**Current:**

```javascript
fetch('/api/settings/bcv_usd_rate/value'
```

**Migrated:**

```javascript
api.getPublicSettings()
```

#### 2. Line 136

**Current:**

```javascript
fetch(`/api/products/${productId}`
```

**Migrated:**

```javascript
api.getProduct(productId)
```

#### 3. Line 192

**Current:**

```javascript
fetch(`/api/products/${productId}/images`
```

**Migrated:**

```javascript
api.getProductImages(productId)
```

#### 4. Line 482

**Current:**

```javascript
fetch(
        `/api/products/${productId}/images/${image.existingImageIndex}`
```

**Migrated:**

```javascript
api.getProductImages(productId)
```

#### 5. Line 136

**Current:**

```javascript
fetch(`/api/products/${productId}`
```

**Migrated:**

```javascript
api.getProduct(productId)
```

#### 6. Line 192

**Current:**

```javascript
fetch(`/api/products/${productId}/images`
```

**Migrated:**

```javascript
api.getProductImages(productId)
```

### pages/admin/occasions.js

**1 calls to migrate**

#### 1. Line 9

**Current:**

```javascript
'/api/occasions'
```

**Migrated:**

```javascript
api.request('/api/occasions')
```

### pages/admin/orders.js

**3 calls to migrate**

#### 1. Line 86

**Current:**

```javascript
fetch('/api/orders'
```

**Migrated:**

```javascript
api.getOrders(filters)
```

#### 2. Line 675

**Current:**

```javascript
fetch(`/api/orders/${orderId}/status`
```

**Migrated:**

```javascript
api.getOrder(orderId)
```

#### 3. Line 963

**Current:**

```javascript
fetch(`/api/orders/${orderId}/status-history`
```

**Migrated:**

```javascript
api.getOrder(orderId)
```

### pages/cart.js

**1 calls to migrate**

#### 1. Line 30

**Current:**

```javascript
fetch('/api/settings/DELIVERY_COST_USD/value'
```

**Migrated:**

```javascript
api.getPublicSettings()
```

### pages/payment.js

**3 calls to migrate**

#### 1. Line 84

**Current:**

```javascript
fetch('/api/settings/public'
```

**Migrated:**

```javascript
api.getPublicSettings()
```

#### 2. Line 666

**Current:**

```javascript
fetch('/api/orders'
```

**Migrated:**

```javascript
api.getOrders(filters)
```

#### 3. Line 776

**Current:**

```javascript
fetch(`/api/products/${item.id}`
```

**Migrated:**

```javascript
api.getProduct(productId)
```

### pages/product-detail.js

**2 calls to migrate**

#### 1. Line 40

**Current:**

```javascript
fetch(`/api/products/${productId}`
```

**Migrated:**

```javascript
api.getProduct(productId)
```

#### 2. Line 67

**Current:**

```javascript
fetch(`/api/products/${productId}/images`
```

**Migrated:**

```javascript
api.getProductImages(productId)
```

## 🚀 Migration Steps

### Step 1: Add API Client Import

```javascript
// Add to top of your JavaScript files
import { api } from './shared/api-client.js'
```

### Step 2: Replace Direct Fetch Calls

```javascript
// OLD - Direct fetch
const response = await fetch('/api/products/67')
const product = await response.json()

// NEW - API Client
const product = await api.getProduct(67)
```

### Step 3: Use Enhanced Features

```javascript
// OLD - Manual error handling
try {
  const response = await fetch('/api/products')
  if (!response.ok) throw new Error('Failed')
  const data = await response.json()
} catch (error) {
  console.error('Error:', error)
}

// NEW - Automatic error handling
try {
  const products = await api.getProducts()
} catch (error) {
  const userMessage = api.handleError(error)
  showError(userMessage)
}
```

### Step 4: Leverage Type Safety

```javascript
// The API client provides IntelliSense and type checking
const products = await api.getProducts({
  featured: true, // ✅ TypeScript knows this is boolean
  limit: 10 // ✅ TypeScript knows this is number
})
```

## 🎨 Enhanced Features Available

### Caching

```javascript
// Automatic caching for better performance
const products = await enhancedApi.getProductsCached({ featured: true })
```

### Cart Integration

```javascript
// Add to cart with validation
await enhancedApi.addToCart(productId, quantity)
```

### Form Validation

```javascript
// Validate before sending
const validation = api.validateProduct(productData)
if (!validation.isValid) {
  showErrors(validation.errors)
}
```

## 🔧 Migration Tools

### Automatic Migration Script

```bash
# Generate migration suggestions
npm run suggest:migration

# Apply migrations automatically
npm run migrate:api-calls
```

### Manual Migration Checklist

- [ ] Add `import { api } from './shared/api-client.js'` to all files
- [ ] Replace `fetch('/api/...')` calls with `api.methodName()`
- [ ] Update error handling to use `api.handleError()`
- [ ] Add form validation using `api.validateXXX()`
- [ ] Test all migrated functionality

## 🚨 Common Migration Issues

### Issue 1: Dynamic URLs

```javascript
// OLD
const response = await fetch(`/api/products/${productId}`)

// NEW
const product = await api.getProduct(productId)
```

### Issue 2: Custom Headers

```javascript
// OLD
const response = await fetch('/api/products', {
  headers: { 'Custom-Header': 'value' }
})

// NEW
const product = await api.getProducts({
  headers: { 'Custom-Header': 'value' }
})
```

### Issue 3: POST/PUT Data

```javascript
// OLD
const response = await fetch('/api/products', {
  method: 'POST',
  body: JSON.stringify(productData)
})

// NEW
const result = await api.createProduct(productData)
```

## 🎯 Post-Migration Validation

### Test Coverage

```bash
# Validate that migration didn't break anything
npm run validate:frontend

# Run all tests
npm test
```

### Manual Testing Checklist

- [ ] All product listings load correctly
- [ ] Product detail pages work
- [ ] Cart functionality works
- [ ] Checkout process completes
- [ ] Search functionality works
- [ ] Error messages display properly

## 📊 Migration Progress

Track your migration progress:

```javascript
// Add to your files as you migrate
const MIGRATION_STATUS = {
  'pages/products.js': '✅ Complete',
  'pages/product-detail.js': '🔄 In Progress',
  'components/cart.js': '⏳ Pending'
}
```

## 🎉 Next Steps After Migration

1. **Remove old fetch calls** - Clean up unused code
2. **Add enhanced features** - Use caching, validation, etc.
3. **Update CI/CD** - Include frontend validation
4. **Train team** - Share new patterns and benefits
5. **Monitor performance** - Track API client usage

---

**🎯 With the API client, your frontend becomes more robust, maintainable, and type-safe!**
